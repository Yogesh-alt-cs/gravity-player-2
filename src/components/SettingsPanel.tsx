import { X, Settings2, Moon, Sun, Monitor, Maximize2, FastForward, Volume2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn } from '../utils/cn';

export function SettingsPanel() {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings, clearHistory } = usePlayerStore();

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSettingsOpen(false)}
          />

          {/* Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            className="fixed top-1/2 left-1/2 w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-white/10">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings2 className="w-6 h-6" />
                Settings
              </h2>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Theme */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSettings({ theme: 'auto' })}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                  settings.theme === 'auto' 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                    : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <Monitor className="w-5 h-5" />
                System
              </button>
              <button
                onClick={() => updateSettings({ theme: 'dark' })}
                className={cn(
                  "flex items-center justify-center gap-2 p-3 rounded-xl border transition-all",
                  settings.theme === 'dark' 
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                    : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                )}
              >
                <Moon className="w-5 h-5" />
                Dark
              </button>
            </div>
          </section>

          {/* Playback */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Playback</h3>
            
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Maximize2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Auto Fullscreen</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enter fullscreen on play</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoFullscreen}
                  onChange={(e) => updateSettings({ autoFullscreen: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <FastForward className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Auto Play Next Video</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Play next from history</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoPlayNext}
                  onChange={(e) => updateSettings({ autoPlayNext: e.target.checked })}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <FastForward className="w-5 h-5 text-gray-400" />
                <p className="font-medium">Default Speed</p>
                <span className="ml-auto text-sm font-medium text-blue-500">{settings.defaultSpeed}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.25" 
                value={settings.defaultSpeed}
                onChange={(e) => updateSettings({ defaultSpeed: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.5x</span>
                <span>1x</span>
                <span>2x</span>
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <p className="font-medium">Default Volume</p>
                <span className="ml-auto text-sm font-medium text-blue-500">{Math.round(settings.volume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={settings.volume}
                onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
              />
            </div>
          </section>

          {/* Data */}
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</h3>
            <button
              onClick={() => {
                clearHistory();
                setSettingsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Clear Playback History
            </button>
          </section>

        </div>
      </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
