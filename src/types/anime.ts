export interface AnimeTitle {
  romaji?: string | null;
  english?: string | null;
  native?: string | null;
}

export interface AnimeCoverImage {
  extraLarge?: string | null;
  large?: string | null;
  medium?: string | null;
}

export interface Anime {
  id: number;
  title: AnimeTitle;
  coverImage: AnimeCoverImage;
  bannerImage?: string | null;
  genres: string[];
  averageScore?: number | null;
  episodes?: number | null;
  format?: string | null;
  seasonYear?: number | null;
  status?: string | null;
  description?: string | null;
}

export interface Episode {
  id: string; // e.g. "watch/reanime/16498/sub/reanime-1"
  number: number;
  title?: string | null;
  image?: string | null;
  audio?: string;
  duration?: number | null;
  filler?: boolean;
  recap?: boolean;
  description?: string | null;
}

export interface SubtitleTrack {
  url: string;
  language: string;
  format: string;
  default?: boolean;
}

export interface StreamSource {
  anime: string;
  ep: number;
  audio: string;
  server: string;
  stream_url: string;
  type?: string;
  embed?: string;
  subtitles?: SubtitleTrack[];
  intro?: { start: number; end: number; title?: string } | null;
  outro?: { start: number; end: number; title?: string } | null;
}

export interface WatchHistoryItem {
  episodeId: string;
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  episodeNumber: number;
  episodeTitle?: string | null;
  currentPositionMs: number;
  durationMs: number;
  lastWatchedTimestamp: number;
}

export interface AiringScheduleItem {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  media: Anime;
}
