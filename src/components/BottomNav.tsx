import React from 'react';
import { Home, Compass, Calendar, Bookmark, User } from 'lucide-react';

export type TabType = 'home' | 'discover' | 'schedule' | 'watchlist' | 'profile' | 'search';

export type MainNavTab = 'home' | 'discover' | 'schedule' | 'watchlist' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  watchlistCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  watchlistCount = 0,
}) => {
  const tabs: { id: MainNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { id: 'discover', label: 'Discover', icon: <Compass className="w-5 h-5" /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { id: 'watchlist', label: 'Watchlist', icon: <Bookmark className="w-5 h-5" />, badge: watchlistCount },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="w-full bg-[#0E0F14]/95 backdrop-blur-md border-t border-white/5 py-1.5 px-2 z-30">
      <div className="grid grid-cols-5 w-full max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-all duration-200 select-none ${
                isActive ? 'text-[#E50914]' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {tab.icon}
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2 bg-[#E50914] text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'font-bold' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#E50914]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

