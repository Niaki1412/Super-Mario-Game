
import React, { useEffect, useState } from 'react';
import { Gamepad2, PenTool, Globe, UserCircle2, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CHARACTERS } from '../../playerConfig';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [charName, setCharName] = useState('Mario');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('SELECTED_CHARACTER');
      if (saved && CHARACTERS[saved as keyof typeof CHARACTERS]) {
          setCharName(CHARACTERS[saved as keyof typeof CHARACTERS].name);
      }

      const checkAuth = () => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
      };
      
      checkAuth();
      window.addEventListener('auth-change', checkAuth);
      return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <div className="mb-12 text-center animate-in slide-in-from-top-10 duration-500">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 mb-4 drop-shadow-lg">
          MARIO MAKER
        </h1>
        <p className="text-gray-400 text-xl">Build. Play. Share.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 w-full max-w-7xl px-4">
        
        {/* Character Select */}
        <button 
          onClick={() => navigate('/character')}
          className="group relative bg-gray-800 rounded-3xl p-6 hover:bg-gray-750 border-2 border-gray-700 hover:border-yellow-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20"
        >
          <div className="bg-yellow-900/30 p-6 rounded-full mb-6 group-hover:bg-yellow-600 group-hover:text-white transition-colors text-yellow-400 ring-4 ring-yellow-900/20">
            <UserCircle2 size={40} />
          </div>
          <h2 className="text-xl font-bold mb-1">Character</h2>
          <p className="text-blue-300 font-bold text-sm bg-blue-900/30 px-3 py-1 rounded-full border border-blue-500/30">
             {charName}
          </p>
        </button>

        {/* Editor Card */}
        <button 
          onClick={() => navigate('/editor')}
          className="group relative bg-gray-800 rounded-3xl p-6 hover:bg-gray-750 border-2 border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20"
        >
          <div className="bg-blue-900/30 p-6 rounded-full mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-400 ring-4 ring-blue-900/20">
            <PenTool size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Map Editor</h2>
          <p className="text-gray-400 text-center text-xs">
            Design your own levels.
          </p>
        </button>

        {/* Game Center Card */}
        <button 
          onClick={() => navigate('/center')}
          className="group relative bg-gray-800 rounded-3xl p-6 hover:bg-gray-750 border-2 border-gray-700 hover:border-purple-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/20"
        >
          <div className="bg-purple-900/30 p-6 rounded-full mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors text-purple-400 ring-4 ring-purple-900/20">
            <Globe size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Game Center</h2>
          <p className="text-gray-400 text-center text-xs">
            Play community levels.
          </p>
        </button>

        {/* Play Local Card */}
        <button 
          onClick={() => navigate('/game')}
          className="group relative bg-gray-800 rounded-3xl p-6 hover:bg-gray-750 border-2 border-gray-700 hover:border-red-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/20"
        >
          <div className="bg-red-900/30 p-6 rounded-full mb-6 group-hover:bg-red-600 group-hover:text-white transition-colors text-red-400 ring-4 ring-red-900/20">
            <Gamepad2 size={40} />
          </div>
          <h2 className="text-xl font-bold mb-2">Play Local</h2>
          <p className="text-gray-400 text-center text-xs">
            Load local JSON files.
          </p>
        </button>

        {/* My Maps (Conditional) */}
        {isLoggedIn && (
            <button 
            onClick={() => navigate('/my_maps')}
            className="group relative bg-gray-800 rounded-3xl p-6 hover:bg-gray-750 border-2 border-gray-700 hover:border-green-500 transition-all duration-300 flex flex-col items-center hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/20"
            >
            <div className="bg-green-900/30 p-6 rounded-full mb-6 group-hover:bg-green-600 group-hover:text-white transition-colors text-green-400 ring-4 ring-green-900/20">
                <FolderOpen size={40} />
            </div>
            <h2 className="text-xl font-bold mb-2">My Maps</h2>
            <p className="text-gray-400 text-center text-xs">
                Manage your creations.
            </p>
            </button>
        )}
      </div>

      <div className="mt-16 text-gray-600 text-xs">
        v1.1.0 &bull; Powered by React & PixiJS
      </div>
    </div>
  );
};
