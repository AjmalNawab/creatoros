/**
 * "Process with Claude": runs Claude Code headless (`claude -p`) to answer the AI queue, so the owner doesn't
 * have to type "process the AI queue". Started from the dashboard button, or automatically (Auto switch) when
 * new requests appear.
 *
 * Safety: --permission-mode dontAsk + a narrow --allowedTools list. Everything else is refused automatically.
 * No MCP servers (so no Chrome), no `pnpm action` (no posting), no curl to the API (no approving), no git, no DB
 * scripts. Approvals and posting stay with the owner.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, type WriteStream } from 'node:fs';
import path from 'node:path';
import type { PrismaClient } from '@creatoros/db';
import { audit, isEmergencyStopped, repoRoot } from '@creatoros/core';

const ALLOWED = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Skill', 'TodoWrite',
  'Bash(pnpm -s ai:*)', 'Bash(pnpm ai:*)',
  'Bash(node scripts/footage.mjs:*)', 'Bash(node media/renderer/scripts/footage.mjs:*)', 'Bash(cd media/renderer:*)',
  'Bash(npx tsc:*)', 'Bash(.venv/bin/python:*)', 'Bash(curl -s https://archive.org:*)',
  'Bash(ls:*)', 'Bash(cat:*)', 'Bash(head:*)', 'Bash(tail:*)', 'Bash(grep:*)', 'Bash(mkdir:*)', 'Bash(cp:*)', 'Bash(wc:*)', 'Bash(sleep:*)',
];
const DENIED = ['Bash(pnpm action:*)', 'Bash(git:*)', 'Bash(curl http:*)', 'Bash(npx tsx:*)', 'Bash(rm:*)', 'mcp__chrome-devtools'];

const PROMPT = `process the AI queue.

You are running UNATTENDED, started from the CreatorOS dashboard ("Process with Claude"). Follow CLAUDE.md and the process-queue skill (load the playbook skill for each request kind).
Rules for unattended runs:
- Only answer pending AI requests (pnpm -s ai list / show / answer). Write answer files under .operator/answers/.
- You may write the per-video scene file media/renderer/src/videos/<key>.tsx and collect licensed footage with media/renderer/scripts/footage.mjs. Do not edit any other code.
- NEVER approve anything, NEVER post or upload, NEVER run "pnpm action", never use a browser, never commit.
- If a request needs the owner (a decision, unclear or unverifiable facts), skip it and say so.
- After answering, wait ~15 s and check the queue again (answers can come back with a validation error); stop when the queue is empty or only owner decisions remain.
Finish with a short plain-English summary (3-6 lines): what you answered, anything skipped and why, and what now waits for the owner.`;

const MAX_RUN_MS = 45 * 60_000;
type Run = { trigger: 'button' | 'auto'; startedAt: string; finishedAt?: string; exitCode?: number | null; summary?: string; logFile: string; pendingBefore: number };

let child: ChildProcess | null = null;
let current: Run | null = null;
let last: Run | null = null;
let fruitless = 0; // consecutive runs that left the queue unchanged (auto backs off)

const root = () => repoRoot();
const logDir = () => path.join(root(), '.operator', 'logs');

function tail(file: string, lines = 60) {
  if (!existsSync(file)) return [];
  const size = statSync(file).size;
  const buf = readFileSync(file, 'utf8').slice(size > 200_000 ? size - 200_000 : 0);
  return buf.split('\n').filter(Boolean).slice(-lines);
}

/** One readable log line per Claude action (from --output-format stream-json). */
function describe(ev: Record<string, unknown>): string | null {
  if (ev.type === 'assistant') {
    const parts = ((ev.message as { content?: unknown[] })?.content ?? []) as { type: string; text?: string; name?: string; input?: Record<string, unknown> }[];
    return parts.map((p) => {
      if (p.type === 'text' && p.text?.trim()) return `💬 ${p.text.trim().slice(0, 300)}`;
      if (p.type === 'tool_use') {
        const i = p.input ?? {};
        const what = (i.command ?? i.file_path ?? i.query ?? i.url ?? i.skill ?? i.pattern ?? '') as string;
        return `→ ${p.name}${what ? `: ${String(what).replace(/\s+/g, ' ').slice(0, 160)}` : ''}`;
      }
      return null;
    }).filter(Boolean).join('\n') || null;
  }
  if (ev.type === 'result') return `✅ Finished (${ev.subtype ?? 'done'})`;
  return null;
}

export async function pendingAi(db: PrismaClient) { return db.aiRequest.count({ where: { status: 'PENDING' } }); }

export async function operatorStatus(db: PrismaClient) {
  const [pending, auto] = await Promise.all([pendingAi(db), db.systemSetting.findUnique({ where: { key: 'operator_auto' } })]);
  const run = current ?? last;
  return {
    running: !!child, auto: auto?.value === true, pending,
    run: run ? { ...run, log: tail(run.logFile) } : null,
    backoff: fruitless >= 2,
  };
}

export async function startOperator(db: PrismaClient, trigger: Run['trigger']) {
  if (child) throw new Error('Claude is already working on the queue');
  if (await isEmergencyStopped(db)) throw new Error('System is paused: press Resume first');
  const pendingBefore = await pendingAi(db);
  if (!pendingBefore) throw new Error('Nothing is waiting for Claude right now');

  mkdirSync(logDir(), { recursive: true }); mkdirSync(path.join(root(), '.operator', 'answers'), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logFile = path.join(logDir(), `${stamp}.log`);
  const raw: WriteStream = createWriteStream(path.join(logDir(), `${stamp}.jsonl`));
  const log: WriteStream = createWriteStream(logFile);
  log.write(`▶ Started (${trigger}) · ${pendingBefore} request(s) waiting\n`);

  const args = ['-p', PROMPT, '--output-format', 'stream-json', '--verbose', '--permission-mode', 'dontAsk',
    '--strict-mcp-config', '--allowedTools', ...ALLOWED, '--disallowedTools', ...DENIED];
  const proc = spawn(process.env.CLAUDE_BIN ?? 'claude', args, { cwd: root(), env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
  child = proc;
  current = { trigger, startedAt: new Date().toISOString(), logFile, pendingBefore };
  await audit(db, 'system:operator', 'operator.run_started', { data: { trigger, pending: pendingBefore } });

  let buf = '';
  let summary = '';
  proc.stdout!.on('data', (d: Buffer) => {
    raw.write(d);
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      try {
        const ev = JSON.parse(line) as Record<string, unknown>;
        if (ev.type === 'result' && typeof ev.result === 'string') summary = ev.result;
        const text = describe(ev); if (text) log.write(`${text}\n`);
      } catch { /* partial or non-JSON line */ }
    }
  });
  proc.stderr!.on('data', (d: Buffer) => log.write(`⚠ ${d.toString().trim().slice(0, 400)}\n`));
  const killer = setTimeout(() => { log.write('⏱ Stopped: took longer than 45 minutes\n'); proc.kill('SIGTERM'); }, MAX_RUN_MS);

  proc.on('close', async (code) => {
    clearTimeout(killer);
    const run = current!;
    run.finishedAt = new Date().toISOString(); run.exitCode = code; run.summary = summary.slice(0, 2000);
    log.write(`${code === 0 ? '■ Done' : `■ Ended with code ${code}`}\n${summary ? `\nSummary:\n${summary}\n` : ''}`);
    log.end(); raw.end();
    child = null; last = run; current = null;
    try {
      const after = await pendingAi(db);
      fruitless = code === 0 && after < run.pendingBefore ? 0 : fruitless + 1;
      await audit(db, 'system:operator', 'operator.run_finished', { data: { trigger: run.trigger, exitCode: code, pendingBefore: run.pendingBefore, pendingAfter: after } });
    } catch { /* database hiccup: status still updates in memory */ }
  });
  proc.on('error', (e) => { log.write(`⚠ Could not start Claude Code: ${e.message}\n`); });
  return operatorStatus(db);
}

export function stopOperator() {
  if (!child) return false;
  child.kill('SIGTERM');
  return true;
}

/** Auto mode: start a run when work appears (with cool-down, and back-off after runs that achieved nothing). */
export function startAutoLoop(db: PrismaClient) {
  const timer = setInterval(async () => {
    try {
      if (child) return;
      const auto = await db.systemSetting.findUnique({ where: { key: 'operator_auto' } });
      if (auto?.value !== true) return;
      const since = last?.finishedAt ? Date.now() - Date.parse(last.finishedAt) : Infinity;
      if (since < 60_000) return;                          // breathe between runs
      if (fruitless >= 2 && since < 15 * 60_000) return;    // repeated runs changed nothing: wait 15 min
      if (await isEmergencyStopped(db)) return;
      if (!(await pendingAi(db))) return;
      await startOperator(db, 'auto');
    } catch { /* try again next tick */ }
  }, 20_000);
  timer.unref();
}
