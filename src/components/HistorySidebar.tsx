import { X, Trash2, Play, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn } from '../utils/cn';
import { formatDistanceToNow } from 'date-fns';

export function HistorySidebar() {
  const { isHistoryOpen, setHistoryOpen, history, clearHistory, removeFromHistory, setCurrentUrl } = usePlayerStore();

  const handlePlay = (url: string) => {
    setCurrentUrl(url);
    setHistoryOpen(false);
  };

  return (
    <AnimatePresence>
      {isHistoryOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setHistoryOpen(false)}
          />

          {/* Sidebar */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white dark:bg-[#1a1a1a] shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Playback History
              </h2>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                    title="Clear History"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setHistoryOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No playback history yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="group relative flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <button 
                  onClick={() => handlePlay(item.url)}
                  className="shrink-0 w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <Play className="w-6 h-6 ml-1" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={item.title}>
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    {item.url}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <button 
                  onClick={() => removeFromHistory(item.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-all absolute right-2 top-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
