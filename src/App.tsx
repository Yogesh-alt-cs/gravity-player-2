import { Header } from './components/Header';
import { PlayerContainer } from './components/PlayerContainer';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsPanel } from './components/SettingsPanel';
import { usePlayerStore } from './store/usePlayerStore';
import { useEffect } from 'react';

export default function App() {
  const { settings } = usePlayerStore();

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-[#1a1a1a] text-gray-900 dark:text-white transition-colors duration-200 flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        <PlayerContainer />
      </main>

      <HistorySidebar />
      <SettingsPanel />
    </div>
  );
}
