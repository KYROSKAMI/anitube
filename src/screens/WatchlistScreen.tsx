import React from 'react';
import { Bookmark, Play, Trash2, Compass } from 'lucide-react';
import { Anime } from '../types/anime';

interface WatchlistScreenProps {
  watchlistAnime: Anime[];
  onSelectAnime: (anime: Anime) => void;
  onRemoveFromWatchlist: (animeId: number) => void;
  onGoToDiscover: () => void;
}

export const WatchlistScreen: React.FC<WatchlistScreenProps> = ({
  watchlistAnime,
  onSelectAnime,
  onRemoveFromWatchlist,
  onGoToDiscover,
}) => {
  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
            <Bookmark className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-xl">My Watchlist</h1>
            <p className="text-zinc-400 text-xs">{watchlistAnime.length} Saved Anime</p>
          </div>
        </div>
      </div>

      {watchlistAnime.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#15161E] border border-white/5 flex items-center justify-center text-zinc-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-bold text-base">Your watchlist is empty</h3>
            <p className="text-zinc-400 text-xs max-w-xs">
              Save anime to your watchlist to easily track series you want to watch.
            </p>
          </div>
          <button
            onClick={onGoToDiscover}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E50914] text-white font-bold text-xs shadow-lg hover:bg-[#ff1e40] transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Anime</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {watchlistAnime.map((anime) => {
            const title = anime.title.english || anime.title.romaji || 'Anime';
            return (
              <div
                key={anime.id}
                onClick={() => onSelectAnime(anime)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#12131A] hover:bg-[#1C1E26] border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 sm:w-16 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-[#1c1e28]">
                    <img
                      src={anime.coverImage.extraLarge || anime.coverImage.large || ''}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] transition-colors truncate">
                      {title}
                    </h4>
                    <p className="text-zinc-400 text-xs truncate mt-0.5">
                      {anime.genres.slice(0, 3).join(' • ')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {anime.episodes && (
                        <span className="text-[10px] text-zinc-500">{anime.episodes} eps</span>
                      )}
                      {anime.seasonYear && (
                        <span className="text-[10px] text-zinc-500">• {anime.seasonYear}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromWatchlist(anime.id);
                    }}
                    className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/5 transition"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectAnime(anime)}
                    className="p-2 text-[#E50914] hover:text-[#ff1e40] rounded-lg transition"
                    title="Watch"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
