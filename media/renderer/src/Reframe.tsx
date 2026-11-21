import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, type CalculateMetadataFunction } from 'remotion';
import { Label, UrduText, prog } from './common';
import type { Cue } from './Captions';

/**
 * Vertical 9:16 reframe of a finished 16:9 video, for Reels/Shorts/Stories.
 * The 16:9 picture sits in the middle (its own burned-in captions cropped off), a blurred copy fills the
 * background, the title sits on top and large captions go below the picture.
 */
export type ReframeProps = {
  src: string; fps: number; totalFrames: number; language: 'ur' | 'en';
  title: string; kicker?: string; brand: string;
  cues: Cue[];            // absolute times (seconds)
  cropBottom?: number;    // fraction of the source height to hide at the bottom (old captions)
};

export const reframeMetadata: CalculateMetadataFunction<ReframeProps> = ({ props }) => ({
  durationInFrames: props.totalFrames, fps: props.fps, width: 1080, height: 1920,
});

const W = 1080, SRC_H = Math.round(1080 * 9 / 16); // 608

export const Reframe: React.FC<ReframeProps> = ({ src, title, kicker, brand, cues, language, cropBottom = 0.16 }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const cue = cues.find((c) => t >= c.start && t < c.end + 0.15);
  const visibleH = Math.round(SRC_H * (1 - cropBottom));
  const top = 560;
  const ur = language === 'ur';
  const Text = ur ? UrduText : Label;
  const intro = prog(f, 0, 12);
  return (
    <AbsoluteFill style={{ background: '#05070f' }}>
      {/* blurred fill */}
      <AbsoluteFill style={{ filter: 'blur(38px) brightness(.45) saturate(1.3)', transform: 'scale(1.25)' }}>
        <OffthreadVideo src={staticFile(src)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </AbsoluteFill>

      {/* title */}
      <div style={{ position: 'absolute', top: 150, left: 60, right: 60, textAlign: 'center', opacity: intro, transform: `translateY(${(1 - intro) * 20}px)` }}>
        {kicker && <Label size={30} weight={700} color="#ffd27a" style={{ letterSpacing: 4 }}>{kicker}</Label>}
        <Text size={ur ? 84 : 74} style={{ textAlign: 'center', marginTop: 6 }}>{title}</Text>
      </div>

      {/* the original 16:9 picture, captions cropped */}
      <div style={{ position: 'absolute', left: 0, top, width: W, height: visibleH, overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,.6)', borderTop: '2px solid rgba(255,255,255,.12)', borderBottom: '2px solid rgba(255,255,255,.12)' }}>
        <OffthreadVideo src={staticFile(src)} style={{ width: W, height: SRC_H, display: 'block' }} />
      </div>

      {/* big captions */}
      {cue && (
        <div style={{ position: 'absolute', top: top + visibleH + 70, left: 50, right: 50, display: 'flex', justifyContent: 'center',
          opacity: Math.min(1, (t - cue.start) * 8) }}>
          <div style={{ background: 'rgba(0,0,0,.55)', borderRadius: 24, padding: ur ? '0 34px 12px' : '18px 34px' }}>
            <Text size={ur ? 60 : 56} style={{ textAlign: 'center' }}>{cue.text}</Text>
          </div>
        </div>
      )}

      {/* progress + brand */}
      <div style={{ position: 'absolute', bottom: 210, left: 90, right: 90, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.15)' }}>
        <div style={{ width: `${(f / durationInFrames) * 100}%`, height: '100%', borderRadius: 3, background: '#ffd27a' }} />
      </div>
      <Label size={30} weight={600} color="rgba(255,255,255,.75)" style={{ position: 'absolute', bottom: 140, left: 0, right: 0, textAlign: 'center', letterSpacing: 2 }}>
        {brand}
      </Label>
    </AbsoluteFill>
  );
};
