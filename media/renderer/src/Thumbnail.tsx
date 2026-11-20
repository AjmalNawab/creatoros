import React from 'react';
import { AbsoluteFill, type CalculateMetadataFunction } from 'remotion';
import { C, URDU } from './common';
import { VIDEOS } from './videos';
import type { StoryboardData } from './Root';

export type ThumbProps = { data: StoryboardData; sceneIndex: number; text: string };

/** 1280x720 YouTube thumbnail: a frame of one scene (designed at 1920x1080, scaled) + bold Urdu title. */
export const Thumbnail: React.FC<ThumbProps> = ({ data, sceneIndex, text }) => {
  const Scene = VIDEOS[data.key]?.[sceneIndex];
  if (!Scene) throw new Error(`No scene ${sceneIndex} for ${data.key}`);
  return (
    <AbsoluteFill style={{ background: C.night, overflow: 'hidden' }}>
      <div style={{ width: 1920, height: 1080, transform: 'scale(0.6667)', transformOrigin: 'top left', position: 'absolute' }}>
        <Scene />
      </div>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.75) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40, textAlign: 'center', fontFamily: URDU, direction: 'rtl',
        fontSize: 112, lineHeight: 1.7, fontWeight: 700, color: '#ffd34d',
        textShadow: '0 0 4px #000, 0 0 10px #000, 0 6px 24px rgba(0,0,0,.9)' }}>{text}</div>
    </AbsoluteFill>
  );
};

/** The scene's own length, so its animation timing matches the video. */
export const thumbMetadata: CalculateMetadataFunction<ThumbProps> = ({ props }) => ({
  durationInFrames: props.data.scenes[props.sceneIndex]?.durationFrames ?? 1, fps: props.data.fps, width: 1280, height: 720,
});
