import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { UrduText } from './common';

export type Cue = { start: number; end: number; text: string };

export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end + 0.15);
  if (!cue) return null;
  const o = Math.min(1, (t - cue.start) * 8);
  return (
    <div style={{ position: 'absolute', bottom: 46, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ maxWidth: 1600, background: 'rgba(0,0,0,.62)', borderRadius: 18, padding: '0 36px 10px' }}>
        <UrduText size={46} style={{ textAlign: 'center' }}>{cue.text}</UrduText>
      </div>
    </div>
  );
};
