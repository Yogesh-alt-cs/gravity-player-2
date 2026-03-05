import React, { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import screenfull from 'screenfull';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../store/usePlayerStore';
import { Controls } from './Controls';
import { Loader2, AlertCircle, Volume2, VolumeX, FastForward, Rewind, X } from 'lucide-react';
import { cn } from '../utils/cn';

interface PlayerProps {
  url: string;
}

export function Player({ url }: PlayerProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings, addToHistory, watchProgress, updateWatchProgress, isMiniPlayer, setMiniPlayer } = usePlayerStore();

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(settings.volume);
  const [muted, setMuted] = useState(settings.volume === 0);
  const [played, setPlayed] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(settings.defaultSpeed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPip, setIsPip] = useState(false);
  
  const [isReady, setIsReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [subtitleTracks, setSubtitleTracks] = useState<{kind: string, src: string, srcLang: string, label: string, default: boolean}[]>([]);
  const originalCuesRef = useRef<Map<TextTrackCue, { startTime: number, endTime: number }>>(new Map());

  // Auto-play state
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Visual feedback states
  const [feedback, setFeedback] = useState<{ type: 'volume' | 'seek' | 'play' | 'pause', value?: string } | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  let controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    const handleAddSubtitle = (e: Event) => {
      const customEvent = e as CustomEvent<{url: string, label: string}>;
      const { url, label } = customEvent.detail;
      setSubtitleTracks(prev => [
        ...prev.map(t => ({ ...t, default: false })), // Unset default on others
        {
          kind: 'subtitles',
          src: url,
          srcLang: 'en',
          label: label,
          default: true
        }
      ]);
      originalCuesRef.current.clear(); // Clear original cues when new track is added
    };

    window.addEventListener('add-subtitle', handleAddSubtitle);
    return () => window.removeEventListener('add-subtitle', handleAddSubtitle);
  }, []);

  const showFeedback = (type: 'volume' | 'seek' | 'play' | 'pause', value?: string) => {
    setFeedback({ type, value });
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setFeedback(null), 1000);
  };

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    handleMouseMove();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(screenfull.isFullscreen);
    };
    if (screenfull.isEnabled) {
      screenfull.on('change', handleFullscreenChange);
    }
    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handleFullscreenChange);
      }
    };
  }, []);

  useEffect(() => {
    if (settings.autoFullscreen && isReady && screenfull.isEnabled && containerRef.current) {
      screenfull.request(containerRef.current).catch(() => {});
    }
  }, [settings.autoFullscreen, isReady]);

  useEffect(() => {
    const playerElement = playerRef.current;
    if (!playerElement) return;

    const handleEnterPip = () => setIsPip(true);
    const handleLeavePip = () => setIsPip(false);

    playerElement.addEventListener('enterpictureinpicture', handleEnterPip);
    playerElement.addEventListener('leavepictureinpicture', handleLeavePip);

    return () => {
      playerElement.removeEventListener('enterpictureinpicture', handleEnterPip);
      playerElement.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, [isReady]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          setPlaying(p => {
            showFeedback(p ? 'pause' : 'play');
            return !p;
          });
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSeekBackward();
          showFeedback('seek', '-10s');
          break;
        case 'arrowright':
          e.preventDefault();
          handleSeekForward();
          showFeedback('seek', '+10s');
          break;
        case 'arrowup':
          e.preventDefault();
          setVolume(v => {
            const newVol = Math.min(v + 0.05, 1);
            setMuted(newVol === 0);
            showFeedback('volume', `${Math.round(newVol * 100)}%`);
            return newVol;
          });
          break;
        case 'arrowdown':
          e.preventDefault();
          setVolume(v => {
            const newVol = Math.max(v - 0.05, 0);
            setMuted(newVol === 0);
            showFeedback('volume', `${Math.round(newVol * 100)}%`);
            return newVol;
          });
          break;
        case 'f':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setMuted(m => {
            showFeedback('volume', m ? `${Math.round(volume * 100)}%` : 'Muted');
            return !m;
          });
          break;
        case 'p':
          e.preventDefault();
          setIsPip(!isPip);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPip]);

  const handlePlayPause = () => setPlaying(!playing);
  
  const handleStop = () => {
    setPlaying(false);
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
    }
  };

  const handleClear = () => {
    setSubtitleTracks([]);
    setPlaybackRate(settings.defaultSpeed);
    setFeedback(null);
    originalCuesRef.current.clear();
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlayed = parseFloat(e.target.value);
    setPlayed(newPlayed);
    if (playerRef.current && duration > 0) {
      playerRef.current.currentTime = newPlayed * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setMuted(newVolume === 0);
  };

  const toggleMuted = () => setMuted(!muted);
  
  const handleToggleFullscreen = () => {
    if (screenfull.isEnabled && containerRef.current) {
      screenfull.toggle(containerRef.current);
    }
  };

  const handleReady = () => {
    setIsReady(true);
    setError(null);
    addToHistory(url);
    
    // Resume playback if we have progress
    const savedProgress = watchProgress[url];
    if (savedProgress && savedProgress > 0 && savedProgress < 0.95 && playerRef.current && playerRef.current.duration > 0) {
      playerRef.current.currentTime = savedProgress * playerRef.current.duration;
    }
  };

  useEffect(() => {
    // Reset state on URL change
    setIsReady(false);
    setError(null);
    setPlaying(true);
    setPlayed(0);
    setLoaded(0);
    setDuration(0);
    setCountdown(null);
    setIsBuffering(true);

    // Validate CORS availability for direct files
    const isDirectFile = url.match(/\.(mp4|m3u8|mpd|webm|ogg)$/i);
    if (isDirectFile) {
      fetch(url, { method: 'HEAD', mode: 'cors' })
        .then(res => {
          if (!res.ok && res.status !== 405 && res.status !== 403) {
            // Might be blocked or 404
            setError('This video cannot be played due to CORS restrictions or source protection.');
            setIsBuffering(false);
          } else if (res.status === 403) {
            setError('This video cannot be played due to CORS restrictions or source protection.');
            setIsBuffering(false);
          }
        })
        .catch(() => {
          // CORS error or network error
          setError('This video cannot be played due to CORS restrictions or source protection.');
          setIsBuffering(false);
        });
    }
  }, [url]);

  const handleError = (e: any, data?: any) => {
    console.error('Player error:', e, data);
    setError('This video cannot be played due to CORS restrictions or source protection.');
    setIsReady(false);
    setIsBuffering(false);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const currentPlayed = video.duration > 0 ? video.currentTime / video.duration : 0;
    let currentLoaded = 0;
    if (video.buffered.length > 0 && video.duration > 0) {
      currentLoaded = video.buffered.end(video.buffered.length - 1) / video.duration;
    }
    
    setPlayed(currentPlayed);
    setLoaded(currentLoaded);
    if (currentPlayed > 0) {
      updateWatchProgress(url, currentPlayed);
    }

    // Apply subtitle offset
    const offset = settings.subtitles.offset;
    if (video.textTracks) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (track.cues) {
          for (let j = 0; j < track.cues.length; j++) {
            const cue = track.cues[j] as any; // VTTCue
            if (!originalCuesRef.current.has(cue)) {
              originalCuesRef.current.set(cue, { startTime: cue.startTime, endTime: cue.endTime });
            }
            const original = originalCuesRef.current.get(cue)!;
            const newStart = Math.max(0, original.startTime + offset);
            const newEnd = Math.max(0, original.endTime + offset);
            if (Math.abs(cue.startTime - newStart) > 0.01) cue.startTime = newStart;
            if (Math.abs(cue.endTime - newEnd) > 0.01) cue.endTime = newEnd;
          }
        }
      }
    }
  };

  const handleDurationChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
  };

  const handleEnded = () => {
    const { history, setCurrentUrl } = usePlayerStore.getState();
    if (settings.autoPlayNext && history.length > 1) {
      const currentIndex = history.findIndex(item => item.url === url);
      const nextIndex = currentIndex >= 0 && currentIndex < history.length - 1 ? currentIndex + 1 : 0;
      const nextVideo = history[nextIndex];
      
      if (nextVideo && nextVideo.url !== url) {
        setCountdown(5);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev === null || prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              setCurrentUrl(nextVideo.url);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const cancelAutoplay = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    setCountdown(null);
  };

  const handleSeekForward = () => {
    if (playerRef.current) {
      playerRef.current.currentTime += 10;
    }
  };

  const handleSeekBackward = () => {
    if (playerRef.current) {
      playerRef.current.currentTime -= 10;
    }
  };

  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width / 3) {
      handleSeekBackward();
      showFeedback('seek', '-10s');
    } else if (x > (width * 2) / 3) {
      handleSeekForward();
      showFeedback('seek', '+10s');
    } else {
      handleToggleFullscreen();
    }
  };

  // Touch gestures
  const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const lastTapRef = useRef<{ x: number, y: number, time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      const touch = e.touches[0];
      
      // Check for double tap
      if (lastTapRef.current && now - lastTapRef.current.time < 300) {
        // It's a double tap
        const rect = e.currentTarget.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const width = rect.width;
        
        if (x < width / 3) {
          handleSeekBackward();
          showFeedback('seek', '-10s');
        } else if (x > (width * 2) / 3) {
          handleSeekForward();
          showFeedback('seek', '+10s');
        } else {
          handleToggleFullscreen();
        }
        lastTapRef.current = null; // Reset
      } else {
        lastTapRef.current = { x: touch.clientX, y: touch.clientY, time: now };
      }

      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    
    const deltaY = touchStartRef.current.y - e.touches[0].clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const width = rect.width;

    // Only handle swipe if it's significant (e.g. > 10px)
    if (Math.abs(deltaY) > 10) {
      if (x > width / 2) {
        // Right side: Volume
        setVolume(v => {
          const newVol = Math.max(0, Math.min(1, v + (deltaY > 0 ? 0.02 : -0.02)));
          setMuted(newVol === 0);
          showFeedback('volume', `${Math.round(newVol * 100)}%`);
          return newVol;
        });
        touchStartRef.current.y = e.touches[0].clientY; // Reset to prevent continuous fast scrolling
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black overflow-hidden group flex items-center justify-center transition-all duration-300",
        isMiniPlayer 
          ? "fixed bottom-4 right-4 w-80 aspect-video rounded-xl shadow-2xl z-50 hover:scale-105" 
          : "w-full aspect-video rounded-2xl shadow-2xl"
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-[#1a1a1a] p-6 text-center z-20">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : null}

      {!isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      )}

      {isBuffering && isReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Visual Feedback Overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <div className="bg-black/60 text-white px-4 py-3 rounded-2xl backdrop-blur-sm flex items-center gap-3">
              {feedback.type === 'volume' && (muted || volume === 0 ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />)}
              {feedback.type === 'seek' && (feedback.value?.startsWith('+') ? <FastForward className="w-8 h-8" /> : <Rewind className="w-8 h-8" />)}
              {feedback.value && <span className="text-xl font-bold">{feedback.value}</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isMiniPlayer && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMiniPlayer(false);
          }}
          className={cn(
            "absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full z-30 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Subtitle Styling */}
      <style>
        {`
          video::cue {
            font-size: ${settings.subtitles.fontSize};
            color: ${settings.subtitles.color};
            background-color: ${settings.subtitles.backgroundColor};
            opacity: ${settings.subtitles.backgroundOpacity};
            line-height: 1.5;
          }
        `}
      </style>

      <ReactPlayer
        ref={playerRef}
        src={url}
        width="100%"
        height="100%"
        playing={playing}
        volume={volume}
        muted={muted}
        playbackRate={playbackRate}
        pip={isPip}
        onReady={handleReady}
        onStart={() => setIsBuffering(false)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={handleError}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
        crossOrigin="anonymous"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        {subtitleTracks.map((track, i) => (
          <track key={i} kind={track.kind} src={track.src} srcLang={track.srcLang} label={track.label} default={track.default} />
        ))}
      </ReactPlayer>

      {isReady && !error && (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-opacity duration-300 pointer-events-none",
            showControls ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Autoplay Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50"
          >
            <motion.div 
              key={countdown}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white text-2xl font-bold mb-4"
            >
              Playing next video in {countdown}...
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={cancelAutoplay}
              className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-colors"
            >
              Cancel
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {isReady && !error && (
        <Controls
          show={showControls}
          playing={playing}
          played={played}
          loaded={loaded}
          duration={duration}
          volume={volume}
          muted={muted}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          isPip={isPip}
          isMiniPlayer={isMiniPlayer}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onSeekChange={handleSeekChange}
          onVolumeChange={handleVolumeChange}
          onToggleMuted={toggleMuted}
          onPlaybackRateChange={setPlaybackRate}
          onToggleFullscreen={handleToggleFullscreen}
          onSeekForward={handleSeekForward}
          onSeekBackward={handleSeekBackward}
          onTogglePip={() => setIsPip(!isPip)}
          onToggleMiniPlayer={() => setMiniPlayer(!isMiniPlayer)}
          onClear={handleClear}
        />
      )}
    </div>
  );
}
