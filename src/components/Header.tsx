import { Play, History, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { useState } from 'react';

export function Header() {
  const { setHistoryOpen, setSettingsOpen, setCurrentUrl, currentUrl } = usePlayerStore();
  const [inputUrl, setInputUrl] = useState(currentUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      setCurrentUrl(inputUrl.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 dark:bg-[#1a1a1a]/80 border-b border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">Gravity Player</span>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl flex items-center relative">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Paste video URL here..."
            className="w-full h-10 pl-4 pr-24 rounded-full bg-gray-100 dark:bg-[#2d2d2d] border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors"
          >
            Play
          </motion.button>
        </form>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setHistoryOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="History"
          >
            <History className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </header>
  );
}
