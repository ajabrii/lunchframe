export interface Scene {
  timestamp_start: number;
  timestamp_end: number;
  visual_description: string;
  overlay_text: string;
  voiceover_text: string;
  audio_url?: string;
}

export interface VideoScript {
  title: string;
  brand_colors: string[];
  scenes: Scene[];
  music_mood: string;
  screenshot_url?: string;
}
