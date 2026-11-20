/** Only these accounts may use the dashboard (comma-separated OWNER_EMAILS). Fails closed if unset. */
export function isOwner(email?: string | null): boolean {
  const allow = (process.env.OWNER_EMAILS ?? '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  return !!email && allow.includes(email.toLowerCase());
}
