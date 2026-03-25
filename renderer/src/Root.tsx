import React from 'react';
import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import { VideoScript } from './types';

// Default props for preview
const defaultProps: VideoScript = {
  title: "Launchframe AI",
  brand_colors: ["#5E6AD2", "#FFFFFF"],
  music_mood: "Energetic Tech",
  scenes: [
    {
      timestamp_start: 0,
      timestamp_end: 5,
      visual_description: "Logo reveal",
      overlay_text: "INTRODUCING LAUNCHFRAME",
      voiceover_text: "Meet Launchframe. The future of video."
    }
  ]
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyVideo"
        component={MyVideo}
        durationInFrames={30 * 30} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    </>
  );
};
