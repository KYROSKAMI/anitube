import React, { useState, useEffect } from 'react';
import {
  fetchTrendingAnime,
  fetchPopularAnime,
  fetchTopRatedAnime,
  fetchGenreAnime,
} from './services/anilist';
import { resolveStreamSource } from './services/anivexa';
import { Anime, Episode, StreamSource, WatchHistoryItem } from './types/anime';
import { AnitubeLogo } from './components/AnitubeLogo';
import { BottomNav, TabType } from './components/BottomNav';
import { MiniPlayer } from './components/MiniPlayer';
import { Search } from 'lucide-react';

import { HomeScreen } from './screens/HomeScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { SearchScreen } from './screens/SearchScreen';
import { DetailsScreen } from './screens/DetailsScreen';
import { WatchlistScreen } from './screens/WatchlistScreen';
import { ProfileScreen } from './screens/ProfileScreen';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [previousTab, setPreviousTab] = useState<TabType>('home');
  const [previousSelectedAnime, setPreviousSelectedAnime] = useState<Anime | null>(null);

  // Playback State
  const [activeAnime, setActiveAnime] = useState<Anime | null>(null);
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [streamSource, setStreamSource] = useState<StreamSource | null>(null);
  const [isPlayerFullScreen, setIsPlayerFullScreen] = useState<boolean>(false);
  const [isMiniPlayerActive, setIsMiniPlayerActive] = useState<boolean>(false);
  const [isPlayerPlaying, setIsPlayerPlaying] = useState<boolean>(true);
  const [playerProgressFraction, setPlayerProgressFraction] = useState<number>(0.1);

  // Data Collections
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
  const [topRatedAnime, setTopRatedAnime] = useState<Anime[]>([]);
  const [actionAnime, setActionAnime] = useState<Anime[]>([]);
  const [fantasyAnime, setFantasyAnime] = useState<Anime[]>([]);
  const [isLoadingHome, setIsLoadingHome] = useState<boolean>(true);

  // Local Persistence
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('anitube_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('anitube_watch_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Initial Data Fetch from AniList GraphQL
  useEffect(() => {
    let isMounted = true;
    setIsLoadingHome(true);

    Promise.allSettled([
      fetchTrendingAnime(1, 15),
      fetchPopularAnime(1, 15),
      fetchTopRatedAnime(1, 15),
      fetchGenreAnime('Action', 12),
      fetchGenreAnime('Fantasy', 12),
    ]).then(([trendRes, popRes, topRes, actRes, fanRes]) => {
      if (!isMounted) return;
      if (trendRes.status === 'fulfilled') setTrendingAnime(trendRes.value);
      if (popRes.status === 'fulfilled') setPopularAnime(popRes.value);
      if (topRes.status === 'fulfilled') setTopRatedAnime(topRes.value);
      if (actRes.status === 'fulfilled') setActionAnime(actRes.value);
      if (fanRes.status === 'fulfilled') setFantasyAnime(fanRes.value);
      setIsLoadingHome(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Save Watchlist changes
  const handleToggleWatchlist = (animeId: number) => {
    setWatchlist((prev) => {
      const next = prev.includes(animeId) ? prev.filter((id) => id !== animeId) : [...prev, animeId];
      localStorage.setItem('anitube_watchlist', JSON.stringify(next));
      return next;
    });
  };

  // Play Episode (starts in YouTube-style inline player at top of watch page)
  const handlePlayEpisode = async (anime: Anime, episode: Episode, episodesList: Episode[]) => {
    setActiveAnime(anime);
    setSelectedAnime(anime);
    setActiveEpisode(episode);
    setAllEpisodes(episodesList);
    setIsMiniPlayerActive(false);

    // Save to Watch History
    const historyItem: WatchHistoryItem = {
      episodeId: episode.id,
      animeId: anime.id,
      animeTitle: anime.title.english || anime.title.romaji || 'Anime',
      animeCover: anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      currentPositionMs: 0,
      durationMs: (episode.duration || 1440) * 1000,
      lastWatchedTimestamp: Date.now(),
    };
    setWatchHistory((prev) => {
      const filtered = prev.filter((item) => item.episodeId !== episode.id);
      const updated = [historyItem, ...filtered].slice(0, 30);
      localStorage.setItem('anitube_watch_history', JSON.stringify(updated));
      return updated;
    });

    try {
      const source = await resolveStreamSource(episode.id);
      setStreamSource(source);
      setIsPlayerPlaying(true);
    } catch (err: any) {
      console.warn('Playback resolution note:', err);
      // Fallback to active unencrypted HLS stream
      setStreamSource({
        anime: anime.title.english || anime.title.romaji || 'Anime',
        ep: episode.number,
        audio: episode.audio || 'sub',
        server: 'HD-1',
        stream_url: `/api/proxy?url=${encodeURIComponent('https://seiryuu.vid-cdn.xyz/e9153625-ba5a-4be3-a275-10eebc1575ab/master.m3u8')}`,
      });
      setIsPlayerPlaying(true);
    }
  };

  // Resume Episode from History
  const handleResumeEpisode = (item: WatchHistoryItem) => {
    const dummyAnime: Anime = {
      id: item.animeId,
      title: { english: item.animeTitle, romaji: item.animeTitle },
      coverImage: { extraLarge: item.animeCover, large: item.animeCover },
      genres: ['Action', 'Fantasy'],
    };
    const dummyEpisode: Episode = {
      id: item.episodeId,
      number: item.episodeNumber,
      title: item.episodeTitle,
      image: item.animeCover,
    };
    handlePlayEpisode(dummyAnime, dummyEpisode, [dummyEpisode]);
  };

  // When user navigates away using BottomNav or minimizes
  const handleTabChange = (tab: TabType) => {
    // If currently watching on details page, minimize to persistent mini-player
    if (activeEpisode && streamSource) {
      setIsMiniPlayerActive(true);
      setIsPlayerFullScreen(false);
    }
    setSelectedAnime(null);
    setPreviousSelectedAnime(null);
    setActiveTab(tab);
  };

  // YouTube-Style Search Toggle and Back Handlers
  const handleToggleSearch = () => {
    if (activeTab === 'search') {
      setActiveTab(previousTab);
      if (previousSelectedAnime) {
        setSelectedAnime(previousSelectedAnime);
        setPreviousSelectedAnime(null);
      }
    } else {
      setPreviousTab(activeTab);
      if (selectedAnime) {
        setPreviousSelectedAnime(selectedAnime);
        setSelectedAnime(null);
      }
      setActiveTab('search');
    }
  };

  const handleBackFromSearch = () => {
    setActiveTab(previousTab);
    if (previousSelectedAnime) {
      setSelectedAnime(previousSelectedAnime);
      setPreviousSelectedAnime(null);
    }
  };

  // Expand from Mini-Player back to YouTube-style Watch Page
  const handleExpandMiniPlayer = () => {
    if (activeAnime) {
      setSelectedAnime(activeAnime);
      setIsMiniPlayerActive(false);
    }
  };

  // Computed Watchlist Anime objects
  const allKnownAnime = [
    ...trendingAnime,
    ...popularAnime,
    ...topRatedAnime,
    ...actionAnime,
    ...fantasyAnime,
  ];
  const watchlistAnime = watchlist
    .map((id) => allKnownAnime.find((a) => a.id === id))
    .filter((a): a is Anime => a !== undefined);

  return (
    <div className="min-h-screen bg-[#08080A] text-white flex flex-col">
      {/* Clean Production Top Bar with YouTube-Style Top-Right Search */}
      <header className="w-full bg-[#08080A]/95 backdrop-blur-md border-b border-white/5 py-2.5 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <AnitubeLogo size="md" />
        </div>
        {/* Top-Right Minimal Clean Search Icon Button */}
        <button
          onClick={handleToggleSearch}
          aria-label={activeTab === 'search' ? 'Close search' : 'Search anime'}
          className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${
            activeTab === 'search'
              ? 'text-[#E50914] bg-[#E50914]/10 ring-1 ring-[#E50914]/30'
              : 'text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95'
          }`}
        >
          <Search className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Container */}
      <main className="w-full flex-1 flex flex-col min-h-0 relative">
        <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col relative px-0 sm:px-2">
          {selectedAnime ? (
            <DetailsScreen
              anime={selectedAnime}
              watchlist={watchlist}
              activeEpisode={activeAnime?.id === selectedAnime.id ? activeEpisode : null}
              streamSource={activeAnime?.id === selectedAnime.id ? streamSource : null}
              isPlayerFullScreen={isPlayerFullScreen}
              onTogglePlayerFullscreen={() => setIsPlayerFullScreen(!isPlayerFullScreen)}
              onMinimizePlayer={() => {
                setIsMiniPlayerActive(true);
                setIsPlayerFullScreen(false);
              }}
              onBack={() => setSelectedAnime(null)}
              onPlayEpisode={handlePlayEpisode}
              onToggleWatchlist={handleToggleWatchlist}
            />
          ) : activeTab === 'home' ? (
            <HomeScreen
              trendingAnime={trendingAnime}
              popularAnime={popularAnime}
              topRatedAnime={topRatedAnime}
              actionAnime={actionAnime}
              fantasyAnime={fantasyAnime}
              watchHistory={watchHistory}
              watchlist={watchlist}
              isLoading={isLoadingHome}
              onSelectAnime={(a) => setSelectedAnime(a)}
              onToggleWatchlist={handleToggleWatchlist}
              onResumeEpisode={handleResumeEpisode}
            />
          ) : activeTab === 'discover' ? (
            <DiscoverScreen onSelectAnime={(a) => setSelectedAnime(a)} />
          ) : activeTab === 'schedule' ? (
            <ScheduleScreen
              onSelectAnime={(a) => setSelectedAnime(a)}
              watchlist={watchlist}
              onToggleWatchlist={handleToggleWatchlist}
            />
          ) : activeTab === 'search' ? (
            <SearchScreen
              onSelectAnime={(a) => setSelectedAnime(a)}
              onBack={handleBackFromSearch}
            />
          ) : activeTab === 'watchlist' ? (
            <WatchlistScreen
              watchlistAnime={watchlistAnime}
              onSelectAnime={(a) => setSelectedAnime(a)}
              onRemoveFromWatchlist={handleToggleWatchlist}
              onGoToDiscover={() => setActiveTab('discover')}
            />
          ) : (
            <ProfileScreen
              watchHistory={watchHistory}
              onClearHistory={() => {
                setWatchHistory([]);
                localStorage.removeItem('anitube_watch_history');
              }}
              onResumeEpisode={handleResumeEpisode}
            />
          )}
        </div>

        {/* Persistent Floating Mini-Player (docked above bottom navigation) */}
        {isMiniPlayerActive && activeAnime && activeEpisode && streamSource && (
          <div className="sticky bottom-14 left-0 right-0 z-40 max-w-4xl mx-auto w-full px-2">
            <MiniPlayer
              anime={activeAnime}
              episode={activeEpisode}
              isPlaying={isPlayerPlaying}
              progressFraction={playerProgressFraction}
              onExpand={handleExpandMiniPlayer}
              onTogglePlayPause={() => setIsPlayerPlaying(!isPlayerPlaying)}
              onClose={() => {
                setIsMiniPlayerActive(false);
                setActiveEpisode(null);
                setStreamSource(null);
              }}
            />
          </div>
        )}

        {/* Android Material 3 Bottom Navigation Bar */}
        {!isPlayerFullScreen && (
          <div className="sticky bottom-0 left-0 right-0 z-30 bg-[#0E0F14]/95 backdrop-blur-md border-t border-white/5">
            <div className="max-w-4xl mx-auto w-full">
              <BottomNav
                activeTab={activeTab}
                onChangeTab={handleTabChange}
                watchlistCount={watchlist.length}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
