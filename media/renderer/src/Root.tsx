import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, staticFile, type CalculateMetadataFunction } from 'remotion';
import { Captions, type Cue } from './Captions';
import { SceneFade } from './common';
import { VIDEOS } from './videos';
import p001 from './data/p001.json';
import { Thumbnail, thumbMetadata } from './Thumbnail';

export type StoryboardData = {
  key: string; fps: number; width: number; height: number; totalFrames: number;
  scenes: { id: number; title: string; audio: string; startFrame: number; durationFrames: number; captions: Cue[] }[];
};
type Props = { data: StoryboardData };

const Video: React.FC<Props> = ({ data }) => {
  const scenes = VIDEOS[data.key];
  if (!scenes) throw new Error(`No scenes registered for key "${data.key}" (media/renderer/src/videos/index.ts)`);
  return (
    <AbsoluteFill style={{ background: '#0b1020' }}>
      {data.scenes.map((s, i) => {
        const Visual = scenes[i] ?? scenes[scenes.length - 1];
        return (
          <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationFrames} name={`${s.id}. ${s.title}`}>
            <SceneFade><Visual /></SceneFade>
            <Audio src={staticFile(s.audio)} />
            <Captions cues={s.captions} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const calculateMetadata: CalculateMetadataFunction<Props> = ({ props }) => ({
  durationInFrames: props.data.totalFrames, fps: props.data.fps, width: props.data.width, height: props.data.height,
});

/** Render any project: npx remotion render src/index.ts Video out.mp4 --props=<storyboard.json wrapper> */
export const Root: React.FC = () => (
  <>
    <Composition id="Video" component={Video} defaultProps={{ data: p001 as StoryboardData }} calculateMetadata={calculateMetadata}
      durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="Thumbnail" component={Thumbnail} defaultProps={{ data: p001 as StoryboardData, sceneIndex: 0, text: 'آتش فشاں' }}
      calculateMetadata={thumbMetadata} durationInFrames={1} fps={30} width={1280} height={720} />
  </>
);
