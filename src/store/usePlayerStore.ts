import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface SubtitleSettings {
  enabled: boolean;
  fontSize: string;
  color: string;
  backgroundColor: string;
  backgroundOpacity: number;
  position: 'bottom' | 'center' | 'top';
  offset: number;
}

export interface PlayerSettings {
  autoFullscreen: boolean;
  defaultSpeed: number;
  volume: number;
  theme: 'dark' | 'auto';
  autoPlayNext: boolean;
  subtitles: SubtitleSettings;
}

interface PlayerState {
  currentUrl: string;
  setCurrentUrl: (url: string) => void;
  
  history: HistoryItem[];
  addToHistory: (url: string, title?: string) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;

  settings: PlayerSettings;
  updateSettings: (settings: Partial<PlayerSettings>) => void;

  isHistoryOpen: boolean;
  setHistoryOpen: (open: boolean) => void;

  isSettingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  isMiniPlayer: boolean;
  setMiniPlayer: (isMini: boolean) => void;

  watchProgress: Record<string, number>;
  updateWatchProgress: (url: string, progress: number) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      setCurrentUrl: (url) => set({ currentUrl: url }),

      history: [],
      addToHistory: (url, title) => set((state) => {
        const newHistory = [
          {
            id: crypto.randomUUID(),
            url,
            title: title || url,
            timestamp: Date.now(),
          },
          ...state.history.filter((item) => item.url !== url),
        ].slice(0, 10);
        return { history: newHistory };
      }),
      clearHistory: () => set({ history: [] }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((item) => item.id !== id)
      })),

      settings: {
        autoFullscreen: false,
        defaultSpeed: 1,
        volume: 1,
        theme: 'dark',
        autoPlayNext: false,
        subtitles: {
          enabled: false,
          fontSize: '16px',
          color: '#ffffff',
          backgroundColor: '#000000',
          backgroundOpacity: 0.5,
          position: 'bottom',
          offset: 0,
        }
      },
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),

      isHistoryOpen: false,
      setHistoryOpen: (open) => set({ isHistoryOpen: open }),

      isSettingsOpen: false,
      setSettingsOpen: (open) => set({ isSettingsOpen: open }),

      isMiniPlayer: false,
      setMiniPlayer: (isMini) => set({ isMiniPlayer: isMini }),

      watchProgress: {},
      updateWatchProgress: (url, progress) => set((state) => ({
        watchProgress: { ...state.watchProgress, [url]: progress }
      })),
    }),
    {
      name: 'gravity-player-storage',
      partialize: (state) => ({ 
        history: state.history, 
        settings: state.settings,
        watchProgress: state.watchProgress 
      }),
    }
  )
);
