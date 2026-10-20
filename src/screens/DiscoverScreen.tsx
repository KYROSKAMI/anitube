import React, { useState, useEffect } from 'react';
import { Compass, Filter, Star, Play } from 'lucide-react';
import { Anime } from '../types/anime';
import { fetchGenreAnime } from '../services/anilist';

interface DiscoverScreenProps {
  onSelectAnime: (anime: Anime) => void;
}

const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Sports',
  'Supernatural',
  'Thriller',
];

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onSelectAnime }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('Action');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchGenreAnime(selectedGenre, 30)
      .then((data) => {
        if (isMounted) {
          setAnimeList(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Discover genre error:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-xl">Discover Anime</h1>
            <p className="text-zinc-400 text-xs">Browse by genres and tags</p>
          </div>
        </div>
      </div>

      {/* Genre Pills Carousel */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {GENRES.map((genre) => {
          const isSelected = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none ${
                isSelected
                  ? 'bg-[#E50914] text-white shadow-md shadow-red-950/40 scale-105'
                  : 'bg-[#15161E] text-zinc-300 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs">Exploring {selectedGenre}...</span>
        </div>
      ) : animeList.length === 0 ? (
        <div className="text-center py-16 text-zinc-400 text-sm">
          No anime found in {selectedGenre}.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
          {animeList.map((anime) => {
            const title = anime.title.english || anime.title.romaji || 'Anime';
            const cover = anime.coverImage.extraLarge || anime.coverImage.large;

            return (
              <div
                key={anime.id}
                onClick={() => onSelectAnime(anime)}
                className="group cursor-pointer select-none"
              >
                <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden bg-[#15161E] border border-white/5 group-hover:border-[#E50914]/50 shadow-md transition-all duration-300">
                  {cover && (
                    <img
                      src={cover}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  )}
                  {anime.averageScore && (
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {anime.averageScore}%
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
                <h3 className="text-white text-xs font-semibold mt-1.5 line-clamp-1 group-hover:text-[#E50914] transition-colors">
                  {title}
                </h3>
                <p className="text-zinc-400 text-[10px] truncate">
                  {anime.seasonYear || anime.format || 'Anime'}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
