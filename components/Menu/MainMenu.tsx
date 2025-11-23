import React from 'react';
import { Gamepad2, PenTool } from 'lucide-react';

interface MainMenuProps {
  onSelectMode: (mode: 'editor' | 'game') => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500 mb-4 drop-shadow-lg">
          MARIO MAKER
        </h1>
        <p className="text-gray-400 text-xl">Build your world. Play your world.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-4">
        
        {/* Editor Card */}
        <button 
          onClick={() => onSelectMode('editor')}
          className="group relative bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="bg-blue-900/30 p-6 rounded-full mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-400">
            <PenTool size={64} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Map Editor</h2>
          <p className="text-gray-400 text-center">
            Create custom levels using the tile editor. Export them to JSON.
          </p>
        </button>

        {/* Game Card */}
        <button 
          onClick={() => onSelectMode('game')}
          className="group relative bg-gray-800 rounded-2xl p-8 hover:bg-gray-750 border-2 border-gray-700 hover:border-red-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20"
        >
          <div className="bg-red-900/30 p-6 rounded-full mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-400">
            <Gamepad2 size={64} />
          </div>
          <h2 className="text-3xl font-bold mb-2">Play Game</h2>
          <p className="text-gray-400 text-center">
            Load your JSON maps and play them in the engine.
          </p>
        </button>
      </div>

      <div className="mt-16 text-gray-500 text-sm">
        Use <b>npm run build</b> to create a distribution.
      </div>
    </div>
  );
};
