import React from 'react';
import { Play, Pause, Maximize2, X } from 'lucide-react';
import { Anime, Episode } from '../types/anime';

interface MiniPlayerProps {
  anime: Anime;
  episode: Episode;
  isPlaying: boolean;
  progressFraction: number;
  onExpand: () => void;
  onTogglePlayPause: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  anime,
  episode,
  isPlaying,
  progressFraction,
  onExpand,
  onTogglePlayPause,
  onClose,
}) => {
  const title = anime.title.english || anime.title.romaji || 'Anime';
  const thumbnail = episode.image || anime.coverImage.medium || anime.coverImage.large;

  return (
    <div className="w-full px-2.5 pb-2 transition-all duration-300 ease-out z-40">
      <div
        onClick={onExpand}
        className="group relative flex items-center justify-between bg-[#15161E]/95 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-xl overflow-hidden shadow-2xl cursor-pointer p-2 transition-all duration-200"
      >
        {/* Top Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-[#E50914] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progressFraction * 100))}%` }}
          />
        </div>

        {/* Thumbnail & Title */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[#0d0e12]">
            {thumbnail ? (
              <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#20222a] flex items-center justify-center text-xs text-white/50">
                EP {episode.number}
              </div>
            )}
            <div className="absolute inset-0 bg-black/20" />
            {isPlaying && (
              <div className="absolute bottom-1 right-1 flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-full bg-[#E50914] animate-pulse" />
                <span className="w-0.5 h-2 bg-[#E50914] animate-pulse delay-75" />
                <span className="w-0.5 h-2.5 bg-[#E50914] animate-pulse delay-150" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-white text-xs sm:text-sm font-bold truncate group-hover:text-[#E50914] transition-colors">
              {title}
            </h4>
            <p className="text-white/60 text-[11px] truncate">
              Ep {episode.number} {episode.title ? `• ${episode.title}` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onTogglePlayPause}
            className="p-2 rounded-full hover:bg-white/10 text-white transition active:scale-90"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={onExpand}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
            title="Expand Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
