import React from 'react';
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from 'remotion';
import { Captions } from './Captions';
import { SceneFade } from './common';
import { SCENES } from './scenes';
import p001 from './data/p001.json';

type Data = typeof p001;

const Video: React.FC<{ data: Data }> = ({ data }) => (
  <AbsoluteFill style={{ background: '#0b1020' }}>
    {data.scenes.map((s, i) => {
      const Visual = SCENES[i];
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

export const Root: React.FC = () => (
  <Composition id="Volcanoes001" component={Video as React.FC<any>} defaultProps={{ data: p001 }}
    durationInFrames={p001.totalFrames} fps={p001.fps} width={p001.width} height={p001.height} />
);
