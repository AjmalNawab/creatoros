import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Label, UrduText } from './common';

export type Cue = { start: number; end: number; text: string };

export const Captions: React.FC<{ cues: Cue[]; lang?: string }> = ({ cues, lang = 'ur' }) => {
  const f = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const vertical = height > width; // 9:16: bigger text, kept above the platform's bottom UI
  const t = f / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end + 0.15);
  if (!cue) return null;
  const o = Math.min(1, (t - cue.start) * 8);
  return (
    <div style={{ position: 'absolute', bottom: vertical ? 330 : 46, left: vertical ? 50 : 0, right: vertical ? 50 : 0, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ maxWidth: vertical ? 980 : 1600, background: 'rgba(0,0,0,.62)', borderRadius: 18, padding: '0 36px 10px' }}>
        {lang === 'ur'
          ? <UrduText size={vertical ? 58 : 46} style={{ textAlign: 'center' }}>{cue.text}</UrduText>
          : <Label size={vertical ? 54 : 44} weight={600} style={{ textAlign: 'center', padding: '14px 0 4px' }}>{cue.text}</Label>}
      </div>
    </div>
  );
};
