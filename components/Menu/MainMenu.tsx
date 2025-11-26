
import React from 'react';
import { Gamepad2, PenTool, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="mb-12 text-center animate-in slide-in-from-top-10 duration-500">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 mb-4 drop-shadow-lg">
          MARIO MAKER
        </h1>
        <p className="text-gray-400 text-xl">Build. Play. Share.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
        
        {/* Editor Card */}
        <button 
          onClick={() => navigate('/editor')}
          className="group relative bg-gray-800 rounded-3xl p-8 hover:bg-gray-750 border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="bg-blue-900/30 p-6 rounded-full mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-400 ring-4 ring-blue-900/20">
            <PenTool size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Map Editor</h2>
          <p className="text-gray-400 text-center text-sm">
            Design your own levels using the intuitive tile editor.
          </p>
        </button>

        {/* Game Center Card */}
        <button 
          onClick={() => navigate('/center')}
          className="group relative bg-gray-800 rounded-3xl p-8 hover:bg-gray-750 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          <div className="bg-purple-900/30 p-6 rounded-full mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors text-purple-400 ring-4 ring-purple-900/20">
            <Globe size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Game Center</h2>
          <p className="text-gray-400 text-center text-sm">
            Explore and play levels created by the community.
          </p>
        </button>

        {/* Play Local Card */}
        <button 
          onClick={() => navigate('/game')}
          className="group relative bg-gray-800 rounded-3xl p-8 hover:bg-gray-750 border-2 border-gray-700 hover:border-red-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20"
        >
          <div className="bg-red-900/30 p-6 rounded-full mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-400 ring-4 ring-red-900/20">
            <Gamepad2 size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Play Local</h2>
          <p className="text-gray-400 text-center text-sm">
            Load your local JSON files or saved cloud maps.
          </p>
        </button>
      </div>

      <div className="mt-16 text-gray-600 text-xs">
        v1.0.0 &bull; Powered by React & PixiJS
      </div>
    </div>
  );
};
