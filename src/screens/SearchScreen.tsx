import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Star, Play, Sparkles, ArrowLeft } from 'lucide-react';
import { Anime } from '../types/anime';
import { searchAnime } from '../services/anilist';

interface SearchScreenProps {
  onSelectAnime: (anime: Anime) => void;
  onBack?: () => void;
}

const POPULAR_SEARCHES = [
  'Solo Leveling',
  'Jujutsu Kaisen',
  'Demon Slayer',
  'Attack on Titan',
  'One Piece',
  'Chainsaw Man',
  'Bleach',
  'Frieren',
];

export const SearchScreen: React.FC<SearchScreenProps> = ({ onSelectAnime, onBack }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      try {
        const data = await searchAnime(query.trim(), 24);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="pb-24 px-4 pt-4 space-y-5">
      {/* Search Input Bar with YouTube-style Back Navigation */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to previous screen"
            className="p-2 -ml-1 text-zinc-300 hover:text-white hover:bg-white/10 rounded-full transition-colors shrink-0 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, characters, studios..."
            className="w-full bg-[#15161E] text-white placeholder-zinc-500 text-sm rounded-xl pl-10 pr-10 py-3 border border-white/10 focus:border-[#E50914] focus:outline-none transition-colors shadow-inner"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Searches if empty */}
      {!query && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
            Trending Searches
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-lg bg-[#15161E] hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-400 text-xs">Searching AniList catalog...</span>
        </div>
      ) : query && results.length === 0 ? (
        <div className="text-center py-20 text-zinc-400 text-sm">
          No anime found matching <span className="text-white font-semibold">"{query}"</span>.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
          {results.map((anime) => {
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
                  {anime.genres.slice(0, 2).join(' • ') || anime.seasonYear}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
