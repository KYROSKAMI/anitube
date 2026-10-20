import React, { useMemo } from 'react';
import { Play, Star, TrendingUp, Flame, Sparkles } from 'lucide-react';
import { Anime, WatchHistoryItem } from '../types/anime';
import { HeroCarousel } from '../components/HeroCarousel';

interface HomeScreenProps {
  trendingAnime: Anime[];
  popularAnime: Anime[];
  topRatedAnime: Anime[];
  actionAnime: Anime[];
  fantasyAnime: Anime[];
  watchHistory: WatchHistoryItem[];
  watchlist: number[];
  isLoading: boolean;
  onSelectAnime: (anime: Anime) => void;
  onToggleWatchlist: (animeId: number) => void;
  onResumeEpisode?: (historyItem: WatchHistoryItem) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  trendingAnime,
  popularAnime,
  topRatedAnime,
  actionAnime,
  fantasyAnime,
  watchHistory,
  watchlist,
  isLoading,
  onSelectAnime,
  onToggleWatchlist,
  onResumeEpisode,
}) => {
  // Combine top trending and popular titles for the featured hero carousel
  const heroItems = useMemo(() => {
    return [...trendingAnime, ...popularAnime];
  }, [trendingAnime, popularAnime]);

  if (isLoading && trendingAnime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-[#E50914] border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-400 text-xs tracking-wider uppercase">Loading Anitube Hub...</span>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-7">
      {/* Featured Anime Swipeable Hero Carousel */}
      <HeroCarousel
        animeList={heroItems}
        watchlist={watchlist}
        onSelectAnime={onSelectAnime}
        onToggleWatchlist={onToggleWatchlist}
      />
      {/* Continue Watching Section (if history exists) */}
      {watchHistory.length > 0 && (
        <section className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#E50914] rounded-full" />
              Continue Watching
            </h2>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1">
            {watchHistory.map((item) => {
              const progressFraction =
                item.durationMs > 0 ? (item.currentPositionMs / item.durationMs) * 100 : 0;
              return (
                <div
                  key={item.episodeId}
                  onClick={() => onResumeEpisode && onResumeEpisode(item)}
                  className="w-44 sm:w-52 shrink-0 bg-[#12131A] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 cursor-pointer group transition duration-200"
                >
                  <div className="relative aspect-video bg-[#1c1e28] overflow-hidden">
                    {item.animeCover && (
                      <img
                        src={item.animeCover}
                        alt={item.animeTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-9 h-9 rounded-full bg-[#E50914]/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 fill-white ml-0.5" />
                      </div>
                    </div>
                    {/* Bottom Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                      <div
                        className="h-full bg-[#E50914]"
                        style={{ width: `${Math.min(100, Math.max(5, progressFraction))}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-white text-xs font-bold truncate group-hover:text-[#E50914] transition-colors">
                      {item.animeTitle}
                    </p>
                    <p className="text-zinc-400 text-[11px] truncate">
                      Ep {item.episodeNumber} {item.episodeTitle ? `• ${item.episodeTitle}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending Anime Carousel */}
      <CarouselSection
        title="Trending Anime"
        icon={<TrendingUp className="w-4 h-4 text-[#E50914]" />}
        animeList={trendingAnime}
        onSelectAnime={onSelectAnime}
      />

      {/* Popular on Anitube */}
      <CarouselSection
        title="Popular on Anitube"
        icon={<Flame className="w-4 h-4 text-orange-500" />}
        animeList={popularAnime}
        onSelectAnime={onSelectAnime}
      />

      {/* Top Rated Masterpieces */}
      <CarouselSection
        title="Top Rated Masterpieces"
        icon={<Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
        animeList={topRatedAnime}
        onSelectAnime={onSelectAnime}
      />

      {/* Action Anime */}
      <CarouselSection
        title="Adrenaline & Action"
        icon={<Sparkles className="w-4 h-4 text-[#E50914]" />}
        animeList={actionAnime}
        onSelectAnime={onSelectAnime}
      />

      {/* Fantasy & Magic */}
      <CarouselSection
        title="Fantasy & Other Worlds"
        icon={<Sparkles className="w-4 h-4 text-purple-400" />}
        animeList={fantasyAnime}
        onSelectAnime={onSelectAnime}
      />
    </div>
  );
};

interface CarouselSectionProps {
  title: string;
  icon?: React.ReactNode;
  animeList: Anime[];
  onSelectAnime: (anime: Anime) => void;
}

const CarouselSection: React.FC<CarouselSectionProps> = ({
  title,
  icon,
  animeList,
  onSelectAnime,
}) => {
  if (!animeList || animeList.length === 0) return null;

  return (
    <section className="px-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1">
        {animeList.map((anime) => {
          const displayTitle = anime.title.english || anime.title.romaji || 'Anime';
          const cover = anime.coverImage.extraLarge || anime.coverImage.large;

          return (
            <div
              key={anime.id}
              onClick={() => onSelectAnime(anime)}
              className="w-32 sm:w-36 shrink-0 group cursor-pointer select-none"
            >
              <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-[#15161E] border border-white/5 group-hover:border-[#E50914]/50 shadow-md group-hover:shadow-red-950/20 transition-all duration-300">
                {cover && (
                  <img
                    src={cover}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                )}
                {/* Score badge */}
                {anime.averageScore && (
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    {anime.averageScore}%
                  </div>
                )}
                {/* Format badge */}
                {anime.format && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur text-[9px] font-semibold text-white/90">
                    {anime.format}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="w-7 h-7 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <h3 className="text-white text-xs font-semibold mt-1.5 line-clamp-1 group-hover:text-[#E50914] transition-colors">
                {displayTitle}
              </h3>
              <p className="text-zinc-400 text-[10px] truncate">
                {anime.genres.slice(0, 2).join(' • ') || anime.seasonYear}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
