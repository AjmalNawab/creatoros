import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

/** Repo root = nearest ancestor containing pnpm-workspace.yaml (override with CREATOROS_ROOT). */
export function repoRoot(): string {
  if (process.env.CREATOROS_ROOT) return process.env.CREATOROS_ROOT;
  let dir = process.cwd();
  while (!existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
    const up = path.dirname(dir);
    if (up === dir) throw new Error('repo root not found (pnpm-workspace.yaml)');
    dir = up;
  }
  return dir;
}

export const paths = {
  content: (slug: string, ...p: string[]) => path.join(repoRoot(), 'content', slug, ...p),
  renderer: (...p: string[]) => path.join(repoRoot(), 'media', 'renderer', ...p),
  venvBin: (bin: string) => path.join(repoRoot(), '.venv', 'bin', bin),
};

/** Resolves a path inside content/<slug>/ and refuses traversal outside it. */
export function safeContentPath(slug: string, rel: string): string {
  const base = paths.content(slug);
  const full = path.resolve(base, rel);
  if (full !== base && !full.startsWith(base + path.sep)) throw new Error('path outside content project');
  return full;
}

/** Runs a command, honouring the agent's AbortSignal. Resolves with stdout; rejects with stderr tail on failure. */
export function run(cmd: string, args: string[], opts: { cwd?: string; signal?: AbortSignal; env?: NodeJS.ProcessEnv } = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: opts.cwd, env: { ...process.env, ...opts.env }, signal: opts.signal });
    let out = '', err = '';
    child.stdout.on('data', (d) => { out += d; if (out.length > 2e6) out = out.slice(-1e6); });
    child.stderr.on('data', (d) => { err += d; if (err.length > 2e5) err = err.slice(-1e5); });
    child.on('error', reject);
    child.on('close', (code) => code === 0 ? resolve(out) : reject(new Error(`${path.basename(cmd)} exited ${code}: ${err.slice(-1500) || out.slice(-1500)}`)));
  });
}
