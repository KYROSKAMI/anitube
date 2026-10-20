import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ChevronDown,
  SkipForward,
  SkipBack,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Anime, Episode, StreamSource } from '../types/anime';

interface VideoPlayerProps {
  anime: Anime;
  episode: Episode;
  streamSource: StreamSource;
  allEpisodes: Episode[];
  isFullScreen: boolean;
  onToggleFullscreen: () => void;
  onMinimize: () => void;
  onSelectEpisode: (ep: Episode) => void;
  initialTime?: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  anime,
  episode,
  streamSource,
  allEpisodes,
  isFullScreen,
  onToggleFullscreen,
  onMinimize,
  onSelectEpisode,
  initialTime = 0,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const controlsTimeoutRef = useRef<number | null>(null);
  const watchdogTimerRef = useRef<number | null>(null);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  // Setup HLS / Video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setPlaybackError(null);
    setIsBuffering(true);

    if (watchdogTimerRef.current) {
      window.clearTimeout(watchdogTimerRef.current);
    }

    // Set watchdog timer: if stream is still stuck on loading after 7 seconds, show clean retry
    watchdogTimerRef.current = window.setTimeout(() => {
      if (video.readyState < 2 && !isPlaying) {
        setIsBuffering(false);
        setPlaybackError('Playback took too long to initialize. Please tap Retry.');
      }
    }, 7000);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = streamSource.stream_url;

    if (!streamUrl && streamSource.embed) {
      setIsBuffering(false);
      return;
    }

    if (Hls.isSupported() && (streamUrl.includes('.m3u8') || streamUrl.includes('/api/proxy'))) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        fragLoadingTimeOut: 10000,
        manifestLoadingTimeOut: 10000,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (watchdogTimerRef.current) window.clearTimeout(watchdogTimerRef.current);
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        video.play().then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }).catch(() => {
          setIsPlaying(false);
          setIsBuffering(false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.warn('HLS Event:', data.type, data.details);
        if (data.fatal) {
          if (watchdogTimerRef.current) window.clearTimeout(watchdogTimerRef.current);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setIsBuffering(false);
              setPlaybackError('The video stream could not be loaded. Please try again.');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || streamUrl.endsWith('.mp4')) {
      video.src = streamUrl;
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      video.play().then(() => {
        setIsPlaying(true);
        setIsBuffering(false);
        if (watchdogTimerRef.current) window.clearTimeout(watchdogTimerRef.current);
      }).catch(() => {
        setIsPlaying(false);
        setIsBuffering(false);
      });
    } else {
      setIsBuffering(false);
      setPlaybackError('No supported video stream available for this title.');
    }

    return () => {
      if (watchdogTimerRef.current) window.clearTimeout(watchdogTimerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamSource.stream_url, retryCount]);

  // Handle Video Time and Metadata
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);

      try {
        const historyKey = `anitube_progress_${anime.id}`;
        localStorage.setItem(
          historyKey,
          JSON.stringify({
            animeId: anime.id,
            episodeId: episode.id,
            episodeNumber: episode.number,
            currentPositionMs: Math.round(cur * 1000),
            durationMs: Math.round((videoRef.current.duration || 0) * 1000),
            updatedAt: Date.now(),
          })
        );
      } catch {
        // ignore
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (watchdogTimerRef.current) window.clearTimeout(watchdogTimerRef.current);
      setIsBuffering(false);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(console.warn);
    }
    resetControlsTimer();
  };

  const seekRelative = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    resetControlsTimer();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMute = !isMuted;
    videoRef.current.muted = nextMute;
    setIsMuted(nextMute);
  };

  const handleSpeedChange = () => {
    if (!videoRef.current) return;
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    videoRef.current.playbackRate = nextSpeed;
    setSpeed(nextSpeed);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const prevEpisode = allEpisodes.find((e) => e.number === episode.number - 1);
  const nextEpisode = allEpisodes.find((e) => e.number === episode.number + 1);

  // Skip Intro / Outro
  const intro = streamSource.intro;
  const outro = streamSource.outro;
  const canSkipIntro = intro && currentTime >= intro.start && currentTime <= intro.end;
  const canSkipOutro = outro && currentTime >= outro.start && currentTime <= outro.end;

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      className={`relative bg-black select-none overflow-hidden flex flex-col justify-center items-center ${
        isFullScreen
          ? 'fixed inset-0 z-50 w-screen h-screen'
          : 'w-full aspect-video z-20 shadow-xl'
      }`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsBuffering(false);
          setIsPlaying(true);
          if (watchdogTimerRef.current) window.clearTimeout(watchdogTimerRef.current);
        }}
        onPause={() => setIsPlaying(false)}
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && !playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 bg-black/40 backdrop-blur-xs">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-[#E50914] border-t-transparent rounded-full animate-spin shadow-lg" />
          <span className="text-white text-[11px] sm:text-xs mt-3 font-semibold tracking-wider uppercase">
            Loading Video...
          </span>
        </div>
      )}

      {/* Actionable Error State */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-25 p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#E50914] mx-auto" />
          <p className="text-white text-xs sm:text-sm font-medium max-w-xs">{playbackError}</p>
          <button
            onClick={() => {
              setPlaybackError(null);
              setIsBuffering(true);
              setRetryCount((c) => c + 1);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#E50914] hover:bg-[#ff1e40] text-white rounded-lg text-xs font-bold transition shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Playback</span>
          </button>
        </div>
      )}

      {/* Skip Intro Badge */}
      {canSkipIntro && (
        <button
          onClick={() => {
            if (videoRef.current && intro) {
              videoRef.current.currentTime = intro.end;
            }
          }}
          className="absolute bottom-16 right-4 sm:right-6 z-30 px-3 py-1.5 bg-[#E50914] hover:bg-[#b80710] text-white text-[11px] font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition animate-bounce"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Skip Intro
        </button>
      )}

      {/* Skip Outro Badge */}
      {canSkipOutro && (
        <button
          onClick={() => {
            if (videoRef.current && outro) {
              videoRef.current.currentTime = outro.end;
            }
          }}
          className="absolute bottom-16 right-4 sm:right-6 z-30 px-3 py-1.5 bg-[#E50914] hover:bg-[#b80710] text-white text-[11px] font-bold rounded-lg shadow-lg flex items-center gap-1.5 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Skip Outro
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-3 sm:p-4 bg-gradient-to-t from-black/80 via-transparent to-black/60 transition-opacity duration-300 pointer-events-auto z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onMinimize}
              title="Minimize to Mini Player"
              className="p-1.5 bg-black/50 hover:bg-black/80 backdrop-blur rounded-full text-white transition active:scale-95 shrink-0"
            >
              <ChevronDown className="w-5 h-5 text-[#E50914]" />
            </button>
            <div className="min-w-0">
              <h3 className="text-white font-bold text-xs sm:text-sm truncate">
                {anime.title.english || anime.title.romaji}
              </h3>
              <p className="text-white/60 text-[10px] sm:text-xs truncate">
                Ep {episode.number} {episode.title ? `• ${episode.title}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E50914] text-white uppercase">
              {streamSource.audio}
            </span>
          </div>
        </div>

        {/* Center Playback Controls */}
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <button
            disabled={!prevEpisode}
            onClick={() => prevEpisode && onSelectEpisode(prevEpisode)}
            className={`p-2 rounded-full text-white transition ${
              prevEpisode ? 'hover:bg-white/15 active:scale-95' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={() => seekRelative(-10)}
            className="p-2 hover:bg-white/15 rounded-full text-white transition active:scale-95"
            title="Rewind 10s"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 sm:w-14 sm:h-14 bg-[#E50914] hover:bg-[#ff1e40] text-white rounded-full flex items-center justify-center shadow-xl transition active:scale-90"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          <button
            onClick={() => seekRelative(10)}
            className="p-2 hover:bg-white/15 rounded-full text-white transition active:scale-95"
            title="Forward 10s"
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            disabled={!nextEpisode}
            onClick={() => nextEpisode && onSelectEpisode(nextEpisode)}
            className={`p-2 rounded-full text-white transition ${
              nextEpisode ? 'hover:bg-white/15 active:scale-95' : 'opacity-30 cursor-not-allowed'
            }`}
          >
            <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Bottom Timeline & Controls */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-[10px] sm:text-xs font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E50914] focus:outline-none"
            />
            <span className="text-white/60 text-[10px] sm:text-xs font-mono">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-white hover:text-[#E50914] transition p-1">
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleSpeedChange}
                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white transition"
              >
                {speed}x
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Unobtrusive Fullscreen / Exit Fullscreen button */}
              <button
                onClick={onToggleFullscreen}
                className="p-1.5 rounded-lg bg-black/40 hover:bg-black/70 text-white hover:text-[#E50914] transition active:scale-95"
                title={isFullScreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullScreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
