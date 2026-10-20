import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Plus,
  Check,
  Star,
  Sparkles,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { Anime, Episode, StreamSource } from '../types/anime';
import { fetchEpisodesForAnime } from '../services/anivexa';
import { VideoPlayer } from '../components/VideoPlayer';

interface DetailsScreenProps {
  anime: Anime;
  watchlist: number[];
  activeEpisode: Episode | null;
  streamSource: StreamSource | null;
  isPlayerFullScreen: boolean;
  onTogglePlayerFullscreen: () => void;
  onMinimizePlayer: () => void;
  onBack: () => void;
  onPlayEpisode: (anime: Anime, episode: Episode, allEpisodes: Episode[]) => void;
  onToggleWatchlist: (animeId: number) => void;
}

export const DetailsScreen: React.FC<DetailsScreenProps> = ({
  anime,
  watchlist,
  activeEpisode,
  streamSource,
  isPlayerFullScreen,
  onTogglePlayerFullscreen,
  onMinimizePlayer,
  onBack,
  onPlayEpisode,
  onToggleWatchlist,
}) => {
  const [episodesSub, setEpisodesSub] = useState<Episode[]>([]);
  const [episodesDub, setEpisodesDub] = useState<Episode[]>([]);
  const [audioMode, setAudioMode] = useState<'sub' | 'dub'>('sub');
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(true);
  const [showFullDesc, setShowFullDesc] = useState<boolean>(false);

  const inWatchlist = watchlist.includes(anime.id);
  const displayTitle = anime.title.english || anime.title.romaji || 'Anime';
  const rawDesc = anime.description ? anime.description.replace(/<[^>]*>/g, '') : '';

  useEffect(() => {
    let isMounted = true;
    setLoadingEpisodes(true);

    fetchEpisodesForAnime(anime.id)
      .then((data) => {
        if (!isMounted) return;
        setEpisodesSub(data.sub);
        setEpisodesDub(data.dub);
        if (data.sub.length === 0 && data.dub.length === 0) {
          const count = anime.episodes || 12;
          const fallbackList: Episode[] = Array.from({ length: Math.min(count, 24) }, (_, i) => ({
            id: `watch/anizone/${anime.id}/sub/anizone-${i + 1}`,
            number: i + 1,
            title: `Episode ${i + 1}`,
            image: anime.bannerImage || anime.coverImage.extraLarge || null,
            audio: 'sub',
            duration: 1440,
          }));
          setEpisodesSub(fallbackList);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Episode load warning:', err);
        const count = anime.episodes || 12;
        const fallbackList: Episode[] = Array.from({ length: Math.min(count, 24) }, (_, i) => ({
          id: `watch/anizone/${anime.id}/sub/anizone-${i + 1}`,
          number: i + 1,
          title: `Episode ${i + 1}`,
          image: anime.bannerImage || anime.coverImage.extraLarge || null,
          audio: 'sub',
          duration: 1440,
        }));
        setEpisodesSub(fallbackList);
      })
      .finally(() => {
        if (isMounted) setLoadingEpisodes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [anime.id]);

  const activeEpisodes = audioMode === 'sub' ? episodesSub : (episodesDub.length > 0 ? episodesDub : episodesSub);

  return (
    <div className="pb-28 bg-[#08080A] min-h-screen text-white select-none">
      {/* Top Media Section: Either YouTube-style 16:9 Inline Player or Hero Backdrop */}
      {activeEpisode && streamSource ? (
        <div className="sticky top-0 z-40 bg-black">
          <VideoPlayer
            anime={anime}
            episode={activeEpisode}
            streamSource={streamSource}
            allEpisodes={activeEpisodes}
            isFullScreen={isPlayerFullScreen}
            onToggleFullscreen={onTogglePlayerFullscreen}
            onMinimize={onMinimizePlayer}
            onSelectEpisode={(ep) => onPlayEpisode(anime, ep, activeEpisodes)}
          />
        </div>
      ) : (
        <div className="relative w-full h-[240px] sm:h-[300px] overflow-hidden">
          <img
            src={anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large || ''}
            alt={displayTitle}
            className="w-full h-full object-cover object-center filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/60 to-black/40" />

          {/* Back Button */}
          <button
            onClick={onBack}
            className="absolute top-4 left-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur text-white border border-white/10 transition active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Details and Episodes Section (scrollable underneath) */}
      <div className={`px-4 space-y-4 ${activeEpisode && streamSource ? 'pt-3' : '-mt-14 sm:-mt-16 relative z-10'}`}>
        {/* Back button when video is active */}
        {activeEpisode && streamSource && (
          <div className="flex items-center justify-between pb-1">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Browse</span>
            </button>
            <span className="text-[11px] text-zinc-500 font-mono">
              Now Playing Ep {activeEpisode.number}
            </span>
          </div>
        )}

        {/* Title, Poster & Metadata */}
        <div className="flex gap-3 sm:gap-4 items-start">
          {(!activeEpisode || !streamSource) && (
            <div className="w-24 sm:w-32 aspect-[3/4.2] rounded-xl overflow-hidden shrink-0 shadow-2xl border-2 border-white/10 bg-[#12131A]">
              <img
                src={anime.coverImage.extraLarge || anime.coverImage.large || ''}
                alt={displayTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-1.5">
            <h1 className="text-lg sm:text-2xl font-black text-white leading-tight line-clamp-2">
              {displayTitle}
            </h1>

            {anime.title.romaji && anime.title.english && anime.title.romaji !== anime.title.english && (
              <p className="text-zinc-400 text-xs italic truncate">{anime.title.romaji}</p>
            )}

            <div className="flex items-center gap-2 pt-1 flex-wrap text-xs">
              {anime.averageScore && (
                <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{anime.averageScore}%</span>
                </div>
              )}
              {anime.format && (
                <span className="bg-white/10 px-2 py-0.5 rounded text-white font-semibold">
                  {anime.format}
                </span>
              )}
              {anime.seasonYear && (
                <span className="text-zinc-400 font-medium">{anime.seasonYear}</span>
              )}
              {anime.status && (
                <span className="text-emerald-400 font-medium">
                  {anime.status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Watch Now & Watchlist (if no video playing yet) */}
        {(!activeEpisode || !streamSource) && (
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                if (activeEpisodes.length > 0) {
                  onPlayEpisode(anime, activeEpisodes[0], activeEpisodes);
                }
              }}
              disabled={activeEpisodes.length === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#ff1e40] text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-xl shadow-red-950/40 transition active:scale-95 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Watch Episode 1</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(anime.id)}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs border transition active:scale-95 ${
                inWatchlist
                  ? 'bg-[#E50914]/20 border-[#E50914] text-[#E50914]'
                  : 'bg-[#15161E] border-white/10 text-white hover:bg-white/10'
              }`}
            >
              {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
            </button>
          </div>
        )}

        {/* Genres */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {anime.genres.map((g) => (
            <span
              key={g}
              className="text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#15161E] text-zinc-300 border border-white/5"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Synopsis Accordion */}
        {rawDesc && (
          <div className="bg-[#12131A] p-3 rounded-xl border border-white/5 space-y-1.5">
            <h3 className="text-white text-xs font-bold tracking-wider uppercase flex items-center gap-1 text-zinc-400">
              <Sparkles className="w-3 h-3 text-[#E50914]" /> Synopsis
            </h3>
            <p className={`text-zinc-300 text-xs leading-relaxed ${showFullDesc ? '' : 'line-clamp-2 sm:line-clamp-3'}`}>
              {rawDesc}
            </p>
            {rawDesc.length > 150 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-[#E50914] hover:underline text-[11px] font-bold block"
              >
                {showFullDesc ? 'Show Less' : 'Read More...'}
              </button>
            )}
          </div>
        )}

        {/* Episodes Section */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-bold text-sm sm:text-base">Episodes</h2>
              <span className="text-xs text-zinc-500 font-mono">({activeEpisodes.length})</span>
            </div>

            {/* Audio Track Selector: Sub / Dub */}
            <div className="flex items-center bg-[#15161E] p-0.5 rounded-lg border border-white/10 text-xs font-bold">
              <button
                onClick={() => setAudioMode('sub')}
                className={`px-2.5 py-1 rounded-md transition ${
                  audioMode === 'sub' ? 'bg-[#E50914] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                SUB
              </button>
              <button
                onClick={() => setAudioMode('dub')}
                className={`px-2.5 py-1 rounded-md transition ${
                  audioMode === 'dub' ? 'bg-[#E50914] text-white shadow' : 'text-zinc-400 hover:text-white'
                }`}
              >
                DUB
              </button>
            </div>
          </div>

          {loadingEpisodes ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-400 text-xs">
              <div className="w-6 h-6 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
              <span>Loading episode directory...</span>
            </div>
          ) : activeEpisodes.length === 0 ? (
            <div className="p-6 text-center bg-[#12131A] rounded-xl border border-white/5 text-zinc-400 text-xs">
              No episodes available for this audio track.
            </div>
          ) : (
            <div className="space-y-2">
              {activeEpisodes.map((ep) => {
                const isSelected = activeEpisode?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => onPlayEpisode(anime, ep, activeEpisodes)}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-[#E50914]/15 border-2 border-[#E50914] shadow-lg shadow-red-950/20'
                        : 'bg-[#12131A] hover:bg-[#1C1E26] border border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden shrink-0 bg-[#1c1e28]">
                        {ep.image ? (
                          <img src={ep.image} alt={ep.title || ''} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500 bg-zinc-900">
                            EP {ep.number}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shadow ${
                              isSelected ? 'bg-[#E50914] text-white' : 'bg-black/60 text-white group-hover:bg-[#E50914]'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-xs font-bold transition-colors ${
                              isSelected ? 'text-[#E50914]' : 'text-white group-hover:text-[#E50914]'
                            }`}
                          >
                            Episode {ep.number}
                          </span>
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E50914] text-white font-bold uppercase">
                              Playing
                            </span>
                          )}
                          {ep.filler && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-semibold">
                              Filler
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-xs truncate mt-0.5">
                          {ep.title || `Episode ${ep.number}`}
                        </p>
                        {ep.duration && (
                          <p className="text-zinc-500 text-[10px]">{Math.round(ep.duration / 60)} min</p>
                        )}
                      </div>
                    </div>

                    <div className={`p-2 transition-colors ${isSelected ? 'text-[#E50914]' : 'text-zinc-500 group-hover:text-white'}`}>
                      <Play className="w-4 h-4 fill-current" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
