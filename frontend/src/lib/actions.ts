'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api } from './api';

const post = (path: string, body?: unknown) => api(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export async function emergencyStop() { await post('/system/stop'); revalidatePath('/', 'layout'); }
export async function resumeSystem() { await post('/system/resume'); revalidatePath('/', 'layout'); }
export async function submitInstruction(form: FormData) {
  const text = String(form.get('text') ?? '').trim();
  const brandId = String(form.get('brandId') ?? '') || undefined;
  const format = String(form.get('format') ?? '') || undefined;
  const platforms = form.getAll('platforms').map(String).filter(Boolean);
  if (text.length >= 3) await post('/instructions', { text, brandId, format, platforms: platforms.length ? platforms : undefined });
  revalidatePath('/', 'layout');
}
export async function setAgentEnabled(id: string, enabled: boolean) {
  await api(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) }); revalidatePath('/agents');
}
export async function retryTask(id: string) { await post(`/tasks/${id}/retry`); revalidatePath('/', 'layout'); }
export async function cancelTask(id: string) { await post(`/tasks/${id}/cancel`); revalidatePath('/tasks'); }
export async function decide(id: string, form: FormData) {
  await post(`/approvals/${id}/decide`, { decision: String(form.get('decision')), feedback: String(form.get('feedback') ?? '') || undefined });
  revalidatePath('/', 'layout');
}
export async function completeHumanAction(id: string, form: FormData) {
  const url = String(form.get('url') ?? '').trim();
  const notes = String(form.get('notes') ?? '').trim();
  await post(`/human-actions/${id}/complete`, { result: { url, notes: notes || undefined, by: 'owner (manual)' } });
  revalidatePath('/', 'layout');
}
export async function addPlatformToProject(projectId: string, platform: string) {
  await post(`/content/${projectId}/platforms`, { platform });
  revalidatePath(`/content/${projectId}`);
}
export async function startIdeation(form: FormData) {
  const focus = String(form.get('focus') ?? '').trim();
  await post('/ideation', { count: Number(form.get('count') ?? 5), focus: focus || undefined, brandId: String(form.get('brandId') ?? '') || undefined });
  revalidatePath('/ideas');
}
export async function selectIdea(id: string, form: FormData) {
  const platforms = form.getAll('platforms').map(String).filter(Boolean);
  await post(`/ideas/${id}/select`, { platforms: platforms.length ? platforms : undefined }); revalidatePath('/', 'layout');
}
export async function rejectIdea(id: string, form: FormData) {
  await post(`/ideas/${id}/reject`, { feedback: String(form.get('feedback') ?? '') || undefined }); revalidatePath('/ideas');
}
export async function activateBrand(slug: string) { await post(`/brands/${slug}/activate`); revalidatePath('/', 'layout'); }
export async function saveBrand(slug: string, form: FormData) {
  const lines = (k: string) => String(form.get(k) ?? '').split('\n').map((x) => x.trim()).filter(Boolean);
  const ytId = String(form.get('ytId') ?? '').trim();
  await post(`/brands/${slug}`, { name: String(form.get('name')), profile: {
    niche: String(form.get('niche')), audience: String(form.get('audience')), region: String(form.get('region')).toUpperCase(),
    language: String(form.get('language')), tone: String(form.get('tone')), pillars: lines('pillars'), avoid: lines('avoid'),
    rules: lines('rules'), formats: lines('formats'), voice: String(form.get('voice')), voiceRate: String(form.get('voiceRate')),
    wordsPerMinute: Number(form.get('wpm')), visualStyle: String(form.get('visualStyle')), youtubeCategory: String(form.get('youtubeCategory')),
    youtubePlaylist: String(form.get('youtubePlaylist') ?? '') || undefined,
    channels: ytId ? { youtube: { id: ytId, handle: String(form.get('ytHandle') ?? ''), name: String(form.get('ytName') ?? '') } } : {} } });
  revalidatePath('/', 'layout');
  redirect(`/brand?slug=${encodeURIComponent(slug)}&saved=1`);
}

function errMsg(e: unknown) {
  const raw = (e as Error).message.replace(/^API \d+: /, '');
  try { const j = JSON.parse(raw) as { message?: unknown }; return typeof j.message === 'string' ? j.message : raw; } catch { return raw; }
}
export async function refreshYouTubeStats() {
  let msg: string;
  try { const r = await post('/published/youtube/refresh') as { recorded: number; missing: string[] }; msg = `YouTube: updated ${r.recorded} video(s)${r.missing.length ? `, ${r.missing.length} not found` : ''}`; }
  catch (e) { msg = errMsg(e); }
  revalidatePath('/published');
  redirect(`/published?msg=${encodeURIComponent(msg.slice(0, 300))}`);
}
export async function recordPostStats(form: FormData) {
  const id = String(form.get('postId') ?? '');
  const num = (k: string) => { const v = String(form.get(k) ?? '').replace(/[,\s]/g, ''); return v === '' ? undefined : Number(v); };
  const body = { views: num('views'), likes: num('likes'), comments: num('comments'), shares: num('shares'), reach: num('reach') };
  let msg = 'Saved';
  try { await post(`/posts/${id}/metrics`, body); } catch (e) { msg = errMsg(e); }
  revalidatePath('/published');
  redirect(`/published?msg=${encodeURIComponent(msg.slice(0, 300))}`);
}

export async function setArchived(id: string, archived: boolean) {
  await post(`/content/${id}/archive`, { archived });
  revalidatePath('/content'); revalidatePath('/');
}

/* "Process with Claude": headless Claude Code answers the AI queue (never approves or posts). */
export async function runClaude() {
  let msg: string | null = null;
  try { await post('/operator/run'); } catch (e) { msg = errMsg(e); }
  revalidatePath('/', 'layout');
  if (msg) redirect(`/ai?msg=${encodeURIComponent(msg.slice(0, 200))}`);
}
export async function stopClaude() { await post('/operator/stop'); revalidatePath('/', 'layout'); }
export async function setClaudeAuto(enabled: boolean) { await post('/operator/auto', { enabled }); revalidatePath('/', 'layout'); }
