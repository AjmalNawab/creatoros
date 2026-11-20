'use server';
import { revalidatePath } from 'next/cache';
import { api } from './api';

const post = (path: string, body?: unknown) => api(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });

export async function emergencyStop() { await post('/system/stop'); revalidatePath('/', 'layout'); }
export async function resumeSystem() { await post('/system/resume'); revalidatePath('/', 'layout'); }
export async function submitInstruction(form: FormData) {
  const text = String(form.get('text') ?? '').trim();
  if (text.length >= 3) await post('/instructions', { text });
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
