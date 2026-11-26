/** Plain-language labels shared by pages. */
export const APPROVAL_WHAT: Record<string, string> = {
  script: 'Read & approve the script',
  final_video: 'Watch & approve the final video',
  youtube_package: 'Approve the YouTube title & description',
  facebook_package: 'Approve the Facebook caption',
  tiktok_package: 'Approve the TikTok caption',
  instagram_package: 'Approve the Instagram caption',
  snapchat_package: 'Approve the Snapchat caption',
};
export const approvalWhat = (type: string) => APPROVAL_WHAT[type] ?? `Approve: ${type.replace(/_/g, ' ')}`;

export const PLATFORM_NAME: Record<string, string> = {
  youtube: 'YouTube', facebook: 'Facebook', tiktok: 'TikTok', instagram: 'Instagram', snapchat: 'Snapchat', linkedin: 'LinkedIn',
};
export const platformOfAction = (kind: string) => kind.replace(/_upload$/, '');
export const postWhat = (kind: string) => `Ready to post on ${PLATFORM_NAME[platformOfAction(kind)] ?? kind}`;

/** Which platform a task type / agent id belongs to (null for production steps). */
export const platformOf = (typeOrAgent: string) => {
  const m = typeOrAgent.match(/^(youtube|facebook|tiktok|instagram|snapchat|linkedin)[._]/);
  return m ? m[1] : null;
};
