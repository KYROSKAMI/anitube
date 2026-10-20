import React, { useState } from 'react';
import {
  User,
  History,
  Trash2,
  Play,
  Sliders,
  ShieldCheck,
  Check,
  Bell,
  Sparkles,
} from 'lucide-react';
import { WatchHistoryItem } from '../types/anime';

interface ProfileScreenProps {
  watchHistory: WatchHistoryItem[];
  onClearHistory: () => void;
  onResumeEpisode: (item: WatchHistoryItem) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  watchHistory,
  onClearHistory,
  onResumeEpisode,
}) => {
  const [defaultAudio, setDefaultAudio] = useState<'sub' | 'dub'>('sub');
  const [autoplayNext, setAutoplayNext] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleToggleAudio = (mode: 'sub' | 'dub') => {
    setDefaultAudio(mode);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-5 select-none">
      {/* Profile Header */}
      <div className="flex items-center gap-4 bg-[#12131A] p-4 rounded-2xl border border-white/5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#E50914] to-red-600 flex items-center justify-center text-white shadow-xl shadow-red-950/40">
          <User className="w-7 h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-black text-base truncate">AniTube Viewer</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
              PRO
            </span>
          </div>
          <p className="text-zinc-400 text-xs mt-0.5">High Definition Streaming</p>
        </div>
      </div>

      {/* Playback Preferences */}
      <div className="bg-[#12131A] p-4 rounded-2xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#E50914]" />
            Playback Preferences
          </h3>
          {savedSuccess && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
              <Check className="w-3 h-3" /> Saved
            </span>
          )}
        </div>

        {/* Preferred Audio */}
        <div className="flex items-center justify-between py-1 border-b border-white/5">
          <div>
            <p className="text-white text-xs font-semibold">Preferred Audio Track</p>
            <p className="text-zinc-400 text-[11px]">Choose default language for episodes</p>
          </div>
          <div className="flex items-center bg-[#15161E] p-0.5 rounded-lg border border-white/10 text-xs font-bold">
            <button
              onClick={() => handleToggleAudio('sub')}
              className={`px-3 py-1 rounded-md transition ${
                defaultAudio === 'sub' ? 'bg-[#E50914] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SUB
            </button>
            <button
              onClick={() => handleToggleAudio('dub')}
              className={`px-3 py-1 rounded-md transition ${
                defaultAudio === 'dub' ? 'bg-[#E50914] text-white shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              DUB
            </button>
          </div>
        </div>

        {/* Auto Play Next */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-white text-xs font-semibold">Auto-Play Next Episode</p>
            <p className="text-zinc-400 text-[11px]">Queue next episode upon completion</p>
          </div>
          <button
            onClick={() => setAutoplayNext(!autoplayNext)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-300 ${
              autoplayNext ? 'bg-[#E50914]' : 'bg-[#222430]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                autoplayNext ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Watch History */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-[#E50914]" />
            Watch History ({watchHistory.length})
          </h3>
          {watchHistory.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {watchHistory.length === 0 ? (
          <div className="bg-[#12131A] p-6 rounded-xl border border-white/5 text-center text-zinc-400 text-xs">
            No watch history recorded yet. Choose an anime to begin watching.
          </div>
        ) : (
          <div className="space-y-2">
            {watchHistory.slice(0, 5).map((item) => (
              <div
                key={item.episodeId}
                onClick={() => onResumeEpisode(item)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#12131A] hover:bg-[#1C1E26] border border-white/5 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-[#1c1e28] overflow-hidden shrink-0">
                    {item.animeCover ? (
                      <img src={item.animeCover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                        EP {item.episodeNumber}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate group-hover:text-[#E50914] transition-colors">
                      {item.animeTitle}
                    </p>
                    <p className="text-zinc-400 text-[11px] truncate">
                      Ep {item.episodeNumber} {item.episodeTitle ? `• ${item.episodeTitle}` : ''}
                    </p>
                  </div>
                </div>
                <div className="p-2 text-[#E50914]">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* App Information (clean, consumer-facing) */}
      <div className="bg-[#12131A] rounded-2xl border border-white/5 p-4 space-y-3">
        <h4 className="text-white text-xs font-bold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#E50914]" />
          About AniTube
        </h4>
        <div className="text-xs text-zinc-400 space-y-1 leading-relaxed">
          <p>AniTube delivers smooth, high-fidelity streaming with synchronized episode progress and instant playback.</p>
          <p className="text-zinc-500 pt-1 text-[11px]">Version 1.0.0 (Build 2026)</p>
        </div>
      </div>
    </div>
  );
};
