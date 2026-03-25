import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  Audio,
  Img,
} from 'remotion';
import { Scene, VideoScript } from './types';

const SceneContent: React.FC<{ scene: Scene; brandColors: string[]; screenshotUrl?: string }> = ({
  scene,
  brandColors,
  screenshotUrl,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [0, 15, (scene.timestamp_end - scene.timestamp_start) * fps - 15, (scene.timestamp_end - scene.timestamp_start) * fps],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const scale = interpolate(
    frame,
    [0, (scene.timestamp_end - scene.timestamp_start) * fps],
    [1, 1.05]
  );

  const hasRenderableScreenshot = Boolean(screenshotUrl && /^https?:\/\//.test(screenshotUrl));
  const hasRenderableAudio = Boolean(
    scene.audio_url && (/^https?:\/\//.test(scene.audio_url) || String(scene.audio_url).startsWith('data:audio/'))
  );

  return (
    <AbsoluteFill style={{ opacity, backgroundColor: '#000' }}>
      {hasRenderableScreenshot && (
        <AbsoluteFill style={{ transform: `scale(${scale})` }}>
           <Img
             src={screenshotUrl as string}
             style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.3) blur(20px)' }}
           />
        </AbsoluteFill>
      )}

      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: '#fff',
            fontSize: '80px',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            letterSpacing: '-0.04em',
            marginBottom: '40px',
            transform: `translateY(${interpolate(frame, [0, 20], [20, 0], { extrapolateRight: 'clamp' })}px)`
          }}>
            {scene.overlay_text}
          </h1>
          <div style={{
            height: '4px',
            width: '100px',
            backgroundColor: brandColors[0],
            margin: '0 auto',
            transform: `scaleX(${interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })})`
          }} />
        </div>
      </AbsoluteFill>

      {hasRenderableAudio && <Audio src={scene.audio_url as string} />}
    </AbsoluteFill>
  );
};

export const MyVideo: React.FC<VideoScript> = ({
  title,
  brand_colors,
  scenes,
  screenshot_url,
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((scene, i) => {
        const startFrame = Math.round(scene.timestamp_start * fps);
        const durationFrames = Math.round((scene.timestamp_end - scene.timestamp_start) * fps);

        return (
          <Sequence
            key={i}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <SceneContent
              scene={scene}
              brandColors={brand_colors}
              screenshotUrl={screenshot_url}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
