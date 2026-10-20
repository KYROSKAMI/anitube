import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Bookmark,
  RotateCw,
  Search,
  Play,
  Star,
  Check,
  ChevronLeft,
  ChevronRight,
  Globe,
  Radio,
  Tv,
} from 'lucide-react';
import { Anime, AiringScheduleItem } from '../types/anime';
import { fetchAiringSchedule } from '../services/anilist';

interface ScheduleScreenProps {
  onSelectAnime: (anime: Anime) => void;
  watchlist: number[];
  onToggleWatchlist: (animeId: number) => void;
}

type TimezoneMode = 'local' | 'jst';
type FilterMode = 'all' | 'watchlist' | 'upcoming' | 'aired';

interface DayOption {
  date: Date;
  key: string; // YYYY-MM-DD
  dayName: string; // e.g. "Mon"
  dayNumber: number; // e.g. 19
  monthName: string; // e.g. "Oct"
  isToday: boolean;
  startTimestamp: number; // Unix seconds
  endTimestamp: number; // Unix seconds
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  onSelectAnime,
  watchlist,
  onToggleWatchlist,
}) => {
  // Generate 7-day rolling window: 1 day past, today, and 5 days ahead
  const dayOptions = useMemo<DayOption[]>(() => {
    const options: DayOption[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let offset = -1; offset <= 5; offset++) {
      const d = new Date(today);
      d.setDate(today.getDate() + offset);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const key = `${year}-${month}-${dateNum}`;

      const start = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime() / 1000);
      const end = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime() / 1000);

      options.push({
        date: d,
        key,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: offset === 0,
        startTimestamp: start,
        endTimestamp: end,
      });
    }
    return options;
  }, []);

  // State
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => {
    const today = dayOptions.find((d) => d.isToday);
    return today ? today.key : dayOptions[0].key;
  });

  const [scheduleCache, setScheduleCache] = useState<Record<string, AiringScheduleItem[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('local');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentUnixSec, setCurrentUnixSec] = useState<number>(() => Math.floor(Date.now() / 1000));

  // Active Day object
  const activeDay = useMemo(() => {
    return dayOptions.find((d) => d.key === selectedDayKey) || dayOptions[1] || dayOptions[0];
  }, [dayOptions, selectedDayKey]);

  // Live timer tick every 20 seconds for accurate countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUnixSec(Math.floor(Date.now() / 1000));
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Schedule Data for the selected day
  const loadScheduleForDay = useCallback(
    async (day: DayOption, forceRefresh = false) => {
      if (!forceRefresh && scheduleCache[day.key]) {
        return;
      }

      setLoading(true);
      setError(null);
      if (forceRefresh) setIsRefreshing(true);

      try {
        const schedules = await fetchAiringSchedule(day.startTimestamp, day.endTimestamp, 1, 50);
        setScheduleCache((prev) => ({
          ...prev,
          [day.key]: schedules,
        }));
      } catch (err: any) {
        console.error('Failed to load anime schedule:', err);
        setError('Unable to load schedule for this date. Please check your connection.');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [scheduleCache]
  );

  useEffect(() => {
    if (activeDay) {
      loadScheduleForDay(activeDay);
    }
  }, [activeDay, loadScheduleForDay]);

  const rawDaySchedules = useMemo(() => {
    return scheduleCache[activeDay?.key || ''] || [];
  }, [scheduleCache, activeDay]);

  // Filter and sort items
  const filteredSchedules = useMemo(() => {
    let list = [...rawDaySchedules];

    // Filter by Watchlist
    if (filterMode === 'watchlist') {
      list = list.filter((item) => watchlist.includes(item.media.id));
    } else if (filterMode === 'upcoming') {
      list = list.filter((item) => item.airingAt > currentUnixSec);
    } else if (filterMode === 'aired') {
      list = list.filter((item) => item.airingAt <= currentUnixSec);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => {
        const titleEn = item.media.title?.english?.toLowerCase() || '';
        const titleRo = item.media.title?.romaji?.toLowerCase() || '';
        return titleEn.includes(q) || titleRo.includes(q);
      });
    }

    // Sort strictly by airing time
    list.sort((a, b) => a.airingAt - b.airingAt);

    return list;
  }, [rawDaySchedules, filterMode, watchlist, currentUnixSec, searchQuery]);

  // Count how many anime on this day are in the user's watchlist
  const watchlistCountOnDay = useMemo(() => {
    return rawDaySchedules.filter((item) => watchlist.includes(item.media.id)).length;
  }, [rawDaySchedules, watchlist]);

  // Format time based on Timezone selection (Local vs JST)
  const formatAiringTime = (timestampSec: number): string => {
    const d = new Date(timestampSec * 1000);
    if (timezoneMode === 'jst') {
      // JST is UTC+9
      return d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }
    // Local device timezone
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Human-readable relative countdown
  const getRelativeStatus = (airingAt: number) => {
    const diff = airingAt - currentUnixSec;

    // Airing now window: -30 mins to 0
    if (diff <= 0 && diff >= -1800) {
      return {
        label: 'Airing Now',
        isLive: true,
        type: 'live' as const,
      };
    }

    // Already aired
    if (diff < -1800) {
      const pastMins = Math.floor(Math.abs(diff) / 60);
      let text = 'Aired';
      if (pastMins < 60) {
        text = `Aired ${pastMins}m ago`;
      } else if (pastMins < 1440) {
        text = `Aired ${Math.floor(pastMins / 60)}h ago`;
      }
      return {
        label: text,
        isLive: false,
        type: 'aired' as const,
      };
    }

    // Upcoming
    const mins = Math.floor(diff / 60);
    let countdown = '';
    if (mins < 60) {
      countdown = `in ${mins}m`;
    } else if (mins < 1440) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      countdown = `in ${h}h ${m}m`;
    } else {
      const days = Math.floor(mins / 1440);
      countdown = `in ${days}d`;
    }

    return {
      label: countdown,
      isLive: false,
      type: 'upcoming' as const,
    };
  };

  const handleRefresh = () => {
    if (activeDay) {
      loadScheduleForDay(activeDay, true);
    }
  };

  return (
    <div className="w-full pb-20 sm:pb-24 flex flex-col animate-fade-in text-white">
      {/* 1. Header Bar */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Schedule</h1>
              {activeDay.isToday && (
                <span className="bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {activeDay.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {!loading && rawDaySchedules.length > 0 && (
                <span> · {rawDaySchedules.length} Releases</span>
              )}
            </p>
          </div>

          {/* Action buttons: Refresh and Timezone Toggle */}
          <div className="flex items-center gap-2">
            {/* Timezone Switcher */}
            <button
              onClick={() => setTimezoneMode((prev) => (prev === 'local' ? 'jst' : 'local'))}
              title="Toggle between your local device time and Japan Standard Time (JST)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#14151E] hover:bg-[#1C1E2A] border border-white/5 text-zinc-300 text-xs font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#E50914]" />
              <span className="font-semibold">{timezoneMode.toUpperCase()}</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading || isRefreshing}
              title="Refresh schedule for this day"
              className="p-2 rounded-lg bg-[#14151E] hover:bg-[#1C1E2A] border border-white/5 text-zinc-300 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#E50914]' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. 7-Day Selector Bar */}
      <div className="px-3 py-2 border-b border-white/5">
        <div className="grid grid-cols-7 gap-1.5 max-w-full">
          {dayOptions.map((day) => {
            const isSelected = day.key === selectedDayKey;
            return (
              <button
                key={day.key}
                onClick={() => setSelectedDayKey(day.key)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-200 select-none relative ${
                  isSelected
                    ? 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25 scale-[1.02]'
                    : 'bg-[#12131A] text-zinc-400 hover:text-zinc-200 hover:bg-[#181A24] border border-white/5'
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-white/90' : 'text-zinc-400'
                  }`}
                >
                  {day.dayName}
                </span>
                <span
                  className={`text-sm font-black mt-0.5 ${
                    isSelected ? 'text-white' : 'text-zinc-200'
                  }`}
                >
                  {day.dayNumber}
                </span>

                {/* Dot indicator for today when not selected */}
                {day.isToday && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E50914]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="px-4 pt-3 pb-2 flex flex-col gap-2.5">
        {/* Quick Search */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shows airing this day..."
            className="w-full bg-[#12131A] text-sm text-zinc-100 placeholder-zinc-400 pl-9 pr-8 py-2 rounded-xl border border-white/5 focus:border-[#E50914]/50 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'all'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#14151E] text-zinc-400 hover:text-zinc-200 border border-white/5'
            }`}
          >
            All Shows ({rawDaySchedules.length})
          </button>

          <button
            onClick={() => setFilterMode('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'watchlist'
                ? 'bg-[#E50914] text-white font-semibold'
                : 'bg-[#14151E] text-zinc-400 hover:text-zinc-200 border border-white/5'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>My Watchlist ({watchlistCountOnDay})</span>
          </button>

          <button
            onClick={() => setFilterMode('upcoming')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'upcoming'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#14151E] text-zinc-400 hover:text-zinc-200 border border-white/5'
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => setFilterMode('aired')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'aired'
                ? 'bg-white text-black font-semibold'
                : 'bg-[#14151E] text-zinc-400 hover:text-zinc-200 border border-white/5'
            }`}
          >
            Aired
          </button>
        </div>
      </div>

      {/* 4. Schedule List Content */}
      <div className="px-4 pt-1">
        {loading && rawDaySchedules.length === 0 ? (
          // Shimmer loading skeletons
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div
                key={idx}
                className="bg-[#12131A] rounded-2xl p-3 border border-white/5 flex gap-3.5 animate-pulse"
              >
                <div className="w-20 sm:w-24 h-28 sm:h-32 bg-white/5 rounded-xl shrink-0" />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                    <div className="h-3 bg-white/5 rounded w-1/3" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-white/5 rounded-lg w-24" />
                    <div className="h-8 bg-white/5 rounded-lg w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error && rawDaySchedules.length === 0 ? (
          // Error State
          <div className="py-16 text-center flex flex-col items-center justify-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/20 flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-[#E50914]" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Failed to load schedule</h3>
            <p className="text-xs text-zinc-400 max-w-xs mb-5">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-[#E50914] text-white text-xs font-bold rounded-xl hover:bg-[#c20811] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredSchedules.length === 0 ? (
          // Empty State
          <div className="py-16 text-center flex flex-col items-center justify-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <CalendarIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {filterMode === 'watchlist'
                ? 'No Watchlist Anime Airing Today'
                : searchQuery
                ? 'No matching shows found'
                : 'No anime scheduled for this day'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mb-5">
              {filterMode === 'watchlist'
                ? 'None of your bookmarked series have new episodes airing on this date.'
                : searchQuery
                ? `No releases matched "${searchQuery}". Try a different keyword.`
                : 'There are no broadcast releases scheduled in AniList for this specific date.'}
            </p>
            {filterMode === 'watchlist' && (
              <button
                onClick={() => setFilterMode('all')}
                className="px-4 py-2 bg-[#1C1D28] hover:bg-[#252736] border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                View All Shows for {activeDay.dayName}
              </button>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 bg-[#1C1D28] hover:bg-[#252736] border border-white/10 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          // Schedule Cards List
          <div className="space-y-3 pt-2">
            {filteredSchedules.map((item) => {
              const { media, episode, airingAt } = item;
              const title = media.title?.english || media.title?.romaji || 'Untitled';
              const romajiTitle = media.title?.romaji;
              const hasDifferentRomaji = romajiTitle && media.title?.english && romajiTitle !== media.title.english;
              const coverImg = media.coverImage?.large || media.coverImage?.extraLarge || '';
              const isBookmarked = watchlist.includes(media.id);
              const relativeStatus = getRelativeStatus(airingAt);
              const timeString = formatAiringTime(airingAt);
              const isFinale = Boolean(media.episodes && episode === media.episodes);

              return (
                <div
                  key={item.id}
                  className="group bg-[#12131A] hover:bg-[#161822] border border-white/5 hover:border-white/10 rounded-2xl p-3 sm:p-3.5 transition-all duration-200 flex gap-3.5 relative"
                >
                  {/* Left: Thumbnail with Click to Details */}
                  <div
                    onClick={() => onSelectAnime(media)}
                    className="w-20 sm:w-24 h-28 sm:h-32 rounded-xl overflow-hidden bg-black/40 relative shrink-0 cursor-pointer shadow-md group-hover:shadow-red-950/20"
                  >
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">
                        <Tv className="w-6 h-6" />
                      </div>
                    )}

                    {/* Format Pill on thumbnail */}
                    {media.format && (
                      <div className="absolute top-1 left-1 bg-black/80 backdrop-blur-xs px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider">
                        {media.format}
                      </div>
                    )}

                    {/* Airing Time Overlay Badge */}
                    <div className="absolute bottom-1 left-1 right-1 bg-black/85 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] font-black text-center text-zinc-100 flex items-center justify-center gap-1">
                      <Clock className="w-2.5 h-2.5 text-[#E50914]" />
                      <span>{timeString}</span>
                    </div>
                  </div>

                  {/* Right: Anime Details and Action Row */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      {/* Top Status & Time Indicator Row */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          {relativeStatus.type === 'live' ? (
                            <span className="flex items-center gap-1 bg-[#E50914] text-white text-[10px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase shadow-sm shadow-[#E50914]/50">
                              <Radio className="w-3 h-3 animate-pulse" />
                              AIRING NOW
                            </span>
                          ) : relativeStatus.type === 'upcoming' ? (
                            <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                              {relativeStatus.label}
                            </span>
                          ) : (
                            <span className="bg-zinc-800/80 text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded-md">
                              {relativeStatus.label}
                            </span>
                          )}

                          {/* Episode tag */}
                          <span className="text-[11px] font-bold text-[#E50914]">
                            Ep {episode} {isFinale && <span className="text-amber-400 font-black">(Finale)</span>}
                          </span>
                        </div>

                        {/* Average Score */}
                        {Boolean(media.averageScore) && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{(media.averageScore! / 10).toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => onSelectAnime(media)}
                        className="text-sm sm:text-base font-bold text-white line-clamp-1 hover:text-[#E50914] cursor-pointer transition-colors"
                      >
                        {title}
                      </h3>

                      {/* Romaji secondary title if different */}
                      {hasDifferentRomaji && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                          {romajiTitle}
                        </p>
                      )}

                      {/* Clean Genres Line (No Pill Enclosures) */}
                      {media.genres && media.genres.length > 0 && (
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-1">
                          {media.genres.slice(0, 3).join(' · ')}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => onSelectAnime(media)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E50914] hover:bg-[#c20811] text-white text-xs font-bold transition-all shadow-sm shadow-[#E50914]/20"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Now</span>
                      </button>

                      {/* Quick Bookmark Toggle */}
                      <button
                        onClick={() => onToggleWatchlist(media.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          isBookmarked
                            ? 'bg-[#E50914]/15 border-[#E50914]/40 text-[#E50914]'
                            : 'bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {isBookmarked ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">In Watchlist</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
