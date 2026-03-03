import { usePlayerStore } from '../store/usePlayerStore';
import { Player } from './Player';
import { Play, Maximize2 } from 'lucide-react';

export function PlayerContainer() {
  const { currentUrl, isMiniPlayer, setMiniPlayer } = usePlayerStore();

  if (!currentUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
          <Play className="w-12 h-12 text-blue-500 fill-blue-500 ml-2" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Welcome to Gravity Player</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-lg">
          Paste any video URL above to start watching. We support YouTube, Vimeo, direct files, HLS, and DASH streams.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative">
      {isMiniPlayer && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-[#2d2d2d] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Play className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium mb-4">Playing in Mini Player</p>
          <button 
            onClick={() => setMiniPlayer(false)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Restore Player
          </button>
        </div>
      )}
      <Player url={currentUrl} />
    </div>
  );
}
