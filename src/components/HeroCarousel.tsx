import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Plus, Check, Star, Info, Flame, TrendingUp, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Anime } from '../types/anime';

interface HeroCarouselProps {
  animeList: Anime[];
  watchlist: number[];
  onSelectAnime: (anime: Anime) => void;
  onToggleWatchlist: (animeId: number) => void;
  autoPlayInterval?: number;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  animeList,
  watchlist,
  onSelectAnime,
  onToggleWatchlist,
  autoPlayInterval = 5500,
}) => {
  // Deduplicate and extract top 6 featured spotlight anime
  const items = useMemo(() => {
    const seen = new Set<number>();
    const list: Anime[] = [];
    for (const anime of animeList) {
      if (anime && !seen.has(anime.id)) {
        seen.add(anime.id);
        list.push(anime);
        if (list.length >= 6) break;
      }
    }
    return list;
  }, [animeList]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const isHorizontalGestureRef = useRef<boolean | null>(null);
  const hasDraggedRef = useRef(false);

  // Keep currentIndex within valid range if items change
  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  const handleNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const handlePrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const handleGoTo = useCallback(
    (index: number) => {
      if (index >= 0 && index < items.length) {
        setCurrentIndex(index);
      }
    },
    [items.length]
  );

  // Auto-play timer with pause-on-hover / touch / drag
  useEffect(() => {
    if (items.length <= 1 || isPaused || isDragging) return;

    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [items.length, isPaused, isDragging, autoPlayInterval, handleNext]);

  // Touch event handlers with smart vertical scroll lock
  const handleTouchStart = (e: React.TouchEvent) => {
    if (items.length <= 1) return;
    const touch = e.touches[0];
    dragStartXRef.current = touch.clientX;
    dragStartYRef.current = touch.clientY;
    isHorizontalGestureRef.current = null;
    hasDraggedRef.current = false;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (items.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartXRef.current;
    const deltaY = touch.clientY - dragStartYRef.current;

    // Detect initial direction if not yet locked
    if (isHorizontalGestureRef.current === null) {
      if (Math.abs(deltaY) > 8 && Math.abs(deltaY) >= Math.abs(deltaX)) {
        // User is vertically scrolling the page - do not intercept!
        isHorizontalGestureRef.current = false;
        return;
      }
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        // User is swiping carousel horizontally
        isHorizontalGestureRef.current = true;
        setIsDragging(true);
      }
    }

    if (isHorizontalGestureRef.current) {
      hasDraggedRef.current = true;
      // Add slight elastic drag resistance at edges
      let offset = deltaX;
      if ((currentIndex === 0 && deltaX > 0) || (currentIndex === items.length - 1 && deltaX < 0)) {
        offset = deltaX * 0.45;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      const containerWidth = containerRef.current?.clientWidth || 360;
      const threshold = Math.min(60, containerWidth * 0.15);

      if (dragOffset < -threshold && currentIndex < items.length - 1) {
        handleNext();
      } else if (dragOffset < -threshold && currentIndex === items.length - 1) {
        // Loop back to start smoothly
        setCurrentIndex(0);
      } else if (dragOffset > threshold && currentIndex > 0) {
        handlePrev();
      } else if (dragOffset > threshold && currentIndex === 0) {
        // Loop to end
        setCurrentIndex(items.length - 1);
      }
      setDragOffset(0);
    }

    isHorizontalGestureRef.current = null;
    // Brief cooldown before resuming autoplay
    setTimeout(() => {
      setIsPaused(false);
    }, 1500);
  };

  // Mouse drag handlers for desktop buttery swiping
  const handleMouseDown = (e: React.MouseEvent) => {
    if (items.length <= 1) return;
    // Only primary mouse button
    if (e.button !== 0) return;
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    hasDraggedRef.current = false;
    setIsDragging(true);
    setIsPaused(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || items.length <= 1) return;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 5) {
      hasDraggedRef.current = true;
    }
    let offset = deltaX;
    if ((currentIndex === 0 && deltaX > 0) || (currentIndex === items.length - 1 && deltaX < 0)) {
      offset = deltaX * 0.45;
    }
    setDragOffset(offset);
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      const containerWidth = containerRef.current?.clientWidth || 600;
      const threshold = Math.min(70, containerWidth * 0.12);

      if (dragOffset < -threshold) {
        handleNext();
      } else if (dragOffset > threshold) {
        handlePrev();
      }
      setDragOffset(0);
    }
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleMouseUp();
    }
    setIsPaused(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Anime Carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="relative w-full h-[420px] sm:h-[480px] md:h-[500px] overflow-hidden select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] cursor-grab active:cursor-grabbing bg-[#08080A]"
    >
      {/* Slider Track with Dynamic Transform & Spring-like snap */}
      <div
        className="flex w-full h-full"
        style={{
          transform: `translate3d(calc(-${currentIndex * 100}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging ? 'none' : 'transform 480ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {items.map((anime, idx) => {
          const inWatchlist = watchlist.includes(anime.id);
          const displayTitle = anime.title.english || anime.title.romaji || 'Anime Title';
          const banner = anime.bannerImage;
          const cover = anime.coverImage.extraLarge || anime.coverImage.large || '';
          const cleanDesc = anime.description ? anime.description.replace(/<[^>]*>/g, '') : '';

          // Determine Rank/Spotlight Badge
          let badgeText = `#${idx + 1} TRENDING`;
          let BadgeIcon = Flame;
          if (idx === 1) {
            BadgeIcon = TrendingUp;
          } else if (idx === 2) {
            BadgeIcon = Sparkles;
          } else if (idx >= 3) {
            badgeText = `#${idx + 1} SPOTLIGHT`;
            BadgeIcon = Flame;
          }

          return (
            <div
              key={anime.id}
              className="relative w-full h-full shrink-0 flex items-end overflow-hidden"
              aria-hidden={idx !== currentIndex}
            >
              {/* Layer 1: Ambient Blurred Backdrop for seamless fills */}
              {cover && !banner && (
                <img
                  src={cover}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-125"
                />
              )}

              {/* Layer 2: High-Resolution Backdrop Image */}
              <img
                src={banner || cover}
                alt={displayTitle}
                className="absolute inset-0 w-full h-full object-cover object-center filter brightness-95 sm:brightness-90 transition-transform duration-700 ease-out pointer-events-none"
                loading={idx === 0 ? 'eager' : 'lazy'}
              />

              {/* Layer 3: Deep Cinematic Netflix-style Scrim Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-[#08080A]/60 via-40% to-black/30 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#08080A]/95 via-[#08080A]/40 to-transparent pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#08080A]/80 via-transparent to-transparent pointer-events-none" />

              {/* Layer 4: Content Overlay with Synchronized Metadata */}
              <div className="relative z-10 w-full px-4 sm:px-6 pb-8 sm:pb-9 pt-16 flex flex-col justify-end gap-2.5 max-w-2xl pointer-events-auto">
                {/* Badges & Release Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#E50914] text-white text-[10px] font-black tracking-widest px-2.5 py-0.5 rounded uppercase flex items-center gap-1.5 shadow-md shadow-red-950/40">
                    <BadgeIcon className="w-3 h-3 fill-white" />
                    {badgeText}
                  </span>

                  {anime.format && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-white/90 border border-white/10 uppercase tracking-wide">
                      {anime.format.replace(/_/g, ' ')}
                    </span>
                  )}

                  {anime.seasonYear && (
                    <span className="text-xs text-white/80 font-medium px-1.5 py-0.5 rounded bg-white/5 border border-white/5">
                      {anime.seasonYear}
                    </span>
                  )}

                  {anime.episodes && (
                    <span className="text-xs text-zinc-300 font-medium hidden sm:inline-block">
                      {anime.episodes} Ep
                    </span>
                  )}
                </div>

                {/* Anime Title */}
                <h1
                  onClick={() => {
                    if (!hasDraggedRef.current) onSelectAnime(anime);
                  }}
                  className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md cursor-pointer hover:text-red-400 transition-colors line-clamp-2"
                >
                  {displayTitle}
                </h1>

                {/* Score & Genres */}
                <div className="flex items-center gap-2.5 text-xs text-white/80 font-medium flex-wrap">
                  {anime.averageScore && (
                    <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {anime.averageScore}%
                    </span>
                  )}
                  {anime.genres && anime.genres.length > 0 && (
                    <>
                      <span className="text-zinc-500">•</span>
                      <span className="text-zinc-200">{anime.genres.slice(0, 3).join(' • ')}</span>
                    </>
                  )}
                </div>

                {/* Synopsis Snippet */}
                {cleanDesc && (
                  <p className="text-white/70 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 max-w-xl leading-relaxed">
                    {cleanDesc}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasDraggedRef.current) onSelectAnime(anime);
                    }}
                    className="flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#ff1e40] text-white px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-red-950/50 transition active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Now</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasDraggedRef.current) onToggleWatchlist(anime.id);
                    }}
                    className="flex items-center justify-center gap-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-3.5 py-2.5 rounded-lg font-semibold text-xs border border-white/10 transition active:scale-95 cursor-pointer"
                  >
                    {inWatchlist ? (
                      <Check className="w-4 h-4 text-[#E50914]" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>{inWatchlist ? 'In Watchlist' : 'Add to List'}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasDraggedRef.current) onSelectAnime(anime);
                    }}
                    className="p-2.5 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-lg text-white border border-white/10 transition active:scale-95 cursor-pointer"
                    title="Anime Details"
                    aria-label="Anime Details"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Intelligent Desktop Left/Right Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous anime"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-xl hidden sm:flex"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next anime"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow-xl hidden sm:flex"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Clean Netflix-style Centered Pagination Indicators */}
      {items.length > 1 && (
        <div
          role="tablist"
          aria-label="Carousel pagination"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center gap-1.5 py-1.5 px-3 pointer-events-auto"
        >
          {items.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGoTo(idx);
                }}
                className={`group/dot relative p-1 cursor-pointer transition-transform duration-200 active:scale-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50 rounded-full`}
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ease-out shadow-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${
                    isActive
                      ? 'w-6 bg-[#E50914] shadow-red-500/50'
                      : 'w-2 bg-white/40 hover:bg-white/70 group-hover/dot:bg-white/80'
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
