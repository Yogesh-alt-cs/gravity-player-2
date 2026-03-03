import { Play, Pause, Square, Volume2, VolumeX, Maximize, Minimize, Settings2, SkipBack, SkipForward, PictureInPicture, PictureInPicture2, Download, Subtitles, Maximize2, Trash2, Plus, Minus, Type, Palette, AlignCenter } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { usePlayerStore } from '../store/usePlayerStore';

interface ControlsProps {
  show: boolean;
  playing: boolean;
  played: number;
  loaded: number;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  isFullscreen: boolean;
  isPip: boolean;
  isMiniPlayer: boolean;
  onPlayPause: () => void;
  onStop: () => void;
  onSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleMuted: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onToggleFullscreen: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
  onTogglePip: () => void;
  onToggleMiniPlayer: () => void;
  onClear: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '00:00';
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export function Controls({
  show,
  playing,
  played,
  loaded,
  duration,
  volume,
  muted,
  playbackRate,
  isFullscreen,
  isPip,
  isMiniPlayer,
  onPlayPause,
  onStop,
  onSeekChange,
  onVolumeChange,
  onToggleMuted,
  onPlaybackRateChange,
  onToggleFullscreen,
  onSeekForward,
  onSeekBackward,
  onTogglePip,
  onToggleMiniPlayer,
  onClear,
}: ControlsProps) {
  const { currentUrl, settings, updateSettings } = usePlayerStore();
  
  const [activeMenu, setActiveMenu] = useState<'none' | 'speed' | 'subtitles'>('none');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu('none');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const isDirectFile = currentUrl.match(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i);

  const handleDownload = () => {
    if (!isDirectFile) return;
    const a = document.createElement('a');
    a.href = currentUrl;
    a.download = currentUrl.split('/').pop() || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const TooltipButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    className = '', 
    iconClassName = 'w-4 h-4 sm:w-5 sm:h-5' 
  }: { 
    icon: any, 
    label: string, 
    onClick?: () => void, 
    className?: string, 
    iconClassName?: string 
  }) => (
    <div className={`relative group flex items-center justify-center ${className}`}>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick} 
        className="hover:text-blue-400 transition-colors p-1 hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
      >
        <Icon className={iconClassName} />
      </motion.button>
      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
        {label}
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "absolute bottom-0 left-0 right-0 p-3 sm:p-4",
        show ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      {/* Progress Bar */}
      <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-3 sm:mb-4 cursor-pointer group hover:h-2 transition-all">
        <div 
          className="absolute top-0 left-0 h-full bg-white/40 rounded-full transition-all"
          style={{ width: `${loaded * 100}%` }}
        />
        <div 
          className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all relative"
          style={{ width: `${played * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played}
          onChange={onSeekChange}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="flex items-center justify-between text-white flex-wrap gap-2" ref={menuRef}>
        <div className="flex items-center gap-2 sm:gap-4">
          <TooltipButton 
            icon={playing ? Pause : Play} 
            label={playing ? "Pause" : "Play"} 
            onClick={onPlayPause} 
            iconClassName="w-5 h-5 sm:w-6 sm:h-6 fill-current" 
          />
          
          <TooltipButton 
            icon={Trash2} 
            label="Clear Settings" 
            onClick={onClear} 
            className="hidden sm:flex text-red-400 hover:text-red-300"
          />
          
          <div className="hidden sm:flex items-center gap-2">
            <TooltipButton icon={Square} label="Stop" onClick={onStop} iconClassName="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            <TooltipButton icon={SkipBack} label="Rewind 10s" onClick={onSeekBackward} />
            <TooltipButton icon={SkipForward} label="Forward 10s" onClick={onSeekForward} />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 group relative">
            <TooltipButton 
              icon={muted || volume === 0 ? VolumeX : Volume2} 
              label={muted || volume === 0 ? "Unmute" : "Mute"} 
              onClick={onToggleMuted} 
            />
            <div className="w-0 overflow-hidden group-hover:w-16 sm:group-hover:w-24 transition-all duration-300 hidden sm:block">
              <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={muted ? 0 : volume}
                onChange={onVolumeChange}
                className="w-16 sm:w-20 h-1 accent-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="text-xs sm:text-sm font-medium tabular-nums opacity-90 ml-1 sm:ml-0">
            {formatTime(played * duration)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {isDirectFile && (
            <TooltipButton icon={Download} label="Download Video" onClick={handleDownload} className="hidden sm:flex" />
          )}

          <div className="relative hidden sm:block">
            <TooltipButton 
              icon={Subtitles} 
              label="Subtitles" 
              onClick={() => setActiveMenu(activeMenu === 'subtitles' ? 'none' : 'subtitles')} 
            />
            
            <AnimatePresence>
              {activeMenu === 'subtitles' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-2 flex flex-col bg-black/90 rounded-lg overflow-hidden border border-white/10 w-64 z-50 origin-bottom-right"
                >
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10">
                    Subtitles
                  </div>
                  <label className="px-4 py-2 text-sm hover:bg-white/10 transition-colors cursor-pointer text-white flex items-center gap-2">
                    Upload .srt / .vtt
                    <input 
                      type="file" 
                      accept=".srt,.vtt" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          window.dispatchEvent(new CustomEvent('add-subtitle', { detail: { url, label: file.name } }));
                          setActiveMenu('none');
                        }
                        e.target.value = '';
                      }} 
                    />
                  </label>
                  <button 
                    className="px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left text-white"
                    onClick={() => {
                      const url = prompt('Enter subtitle URL (.srt or .vtt):');
                      if (url) {
                        window.dispatchEvent(new CustomEvent('add-subtitle', { detail: { url, label: 'Remote Track' } }));
                        setActiveMenu('none');
                      }
                    }}
                  >
                    Add from URL
                  </button>
                  
                  <div className="px-4 py-2 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-2">Sync Offset</div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateSettings({ subtitles: { ...settings.subtitles, offset: Math.max(-10, settings.subtitles.offset - 0.5) } })}
                        className="p-1 bg-white/10 hover:bg-white/20 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input 
                        type="number" 
                        step="0.5" 
                        min="-10" 
                        max="10"
                        value={settings.subtitles.offset}
                        onChange={(e) => updateSettings({ subtitles: { ...settings.subtitles, offset: parseFloat(e.target.value) || 0 } })}
                        className="w-16 bg-transparent text-center text-sm border-b border-white/20 focus:border-blue-500 outline-none"
                      />
                      <button 
                        onClick={() => updateSettings({ subtitles: { ...settings.subtitles, offset: Math.min(10, settings.subtitles.offset + 0.5) } })}
                        className="p-1 bg-white/10 hover:bg-white/20 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <span className="text-xs text-gray-400">sec</span>
                    </div>
                  </div>

                  <div className="px-4 py-2 border-t border-white/10">
                    <div className="text-xs text-gray-400 mb-2">Preferences</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Type className="w-3 h-3 text-gray-400" />
                        <select 
                          value={settings.subtitles.fontSize}
                          onChange={(e) => updateSettings({ subtitles: { ...settings.subtitles, fontSize: e.target.value } })}
                          className="bg-transparent text-xs outline-none text-right cursor-pointer"
                        >
                          <option value="12px" className="bg-gray-900">Small</option>
                          <option value="16px" className="bg-gray-900">Medium</option>
                          <option value="24px" className="bg-gray-900">Large</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between">
                        <Palette className="w-3 h-3 text-gray-400" />
                        <input 
                          type="color" 
                          value={settings.subtitles.color}
                          onChange={(e) => updateSettings({ subtitles: { ...settings.subtitles, color: e.target.value } })}
                          className="w-5 h-5 p-0 border-0 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="w-3 h-3 bg-gray-400 rounded-sm" />
                        <input 
                          type="color" 
                          value={settings.subtitles.backgroundColor}
                          onChange={(e) => updateSettings({ subtitles: { ...settings.subtitles, backgroundColor: e.target.value } })}
                          className="w-5 h-5 p-0 border-0 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <AlignCenter className="w-3 h-3 text-gray-400" />
                        <select 
                          value={settings.subtitles.position}
                          onChange={(e) => updateSettings({ subtitles: { ...settings.subtitles, position: e.target.value as any } })}
                          className="bg-transparent text-xs outline-none text-right cursor-pointer"
                        >
                          <option value="top" className="bg-gray-900">Top</option>
                          <option value="center" className="bg-gray-900">Center</option>
                          <option value="bottom" className="bg-gray-900">Bottom</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <TooltipButton 
              icon={Settings2} 
              label="Playback Speed" 
              onClick={() => setActiveMenu(activeMenu === 'speed' ? 'none' : 'speed')} 
            />
            
            <AnimatePresence>
              {activeMenu === 'speed' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full right-0 mb-2 flex flex-col bg-black/90 rounded-lg overflow-hidden border border-white/10 w-32 z-50 origin-bottom-right"
                >
                  <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/10">
                    Speed
                  </div>
                  {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => {
                        onPlaybackRateChange(rate);
                        setActiveMenu('none');
                      }}
                      className={cn(
                        "px-4 py-2 text-sm hover:bg-white/10 transition-colors text-left",
                        playbackRate === rate ? "text-blue-400 font-medium" : "text-white"
                      )}
                    >
                      {rate === 1 ? 'Normal' : `${rate}x`}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <TooltipButton 
            icon={isPip ? PictureInPicture2 : PictureInPicture} 
            label={isPip ? "Exit PiP" : "Picture in Picture"} 
            onClick={onTogglePip} 
            className="hidden sm:flex"
          />

          <TooltipButton 
            icon={isMiniPlayer ? Maximize2 : Minimize} 
            label={isMiniPlayer ? "Restore Player" : "Mini Player"} 
            onClick={onToggleMiniPlayer} 
          />

          <TooltipButton 
            icon={isFullscreen ? Minimize : Maximize} 
            label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} 
            onClick={onToggleFullscreen} 
          />
        </div>
      </div>
    </motion.div>
  );
}
