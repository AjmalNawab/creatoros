'use server';
import { revalidatePath } from 'next/cache';
import { api } from './api';

const post = (path: string, body?: unknown) => api(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export async function emergencyStop() { await post('/system/stop'); revalidatePath('/', 'layout'); }
export async function resumeSystem() { await post('/system/resume'); revalidatePath('/', 'layout'); }
export async function submitInstruction(form: FormData) {
  const text = String(form.get('text') ?? '').trim();
  const brandId = String(form.get('brandId') ?? '') || undefined;
  if (text.length >= 3) await post('/instructions', { text, brandId });
  revalidatePath('/', 'layout');
}
export async function setAgentEnabled(id: string, enabled: boolean) {
  await api(`/agents/${id}`, { method: 'PATCH', body: JSON.stringify({ enabled }) }); revalidatePath('/agents');
}
export async function retryTask(id: string) { await post(`/tasks/${id}/retry`); revalidatePath('/tasks'); }
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
  void form; await post(`/ideas/${id}/select`, {}); revalidatePath('/', 'layout');
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
  revalidatePath('/brand');
}
