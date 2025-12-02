
import React, { useEffect, useState } from 'react';
import { Gamepad2, PenTool, Globe, UserCircle2, FolderOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CHARACTERS } from '../../playerConfig';

export const MainMenu: React.FC = () => {
  const navigate = useNavigate();
  const [charName, setCharName] = useState('Mario');
  const [CharacterIcon, setCharacterIcon] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('SELECTED_CHARACTER');
      const charConfig = CHARACTERS[saved as keyof typeof CHARACTERS] || CHARACTERS['mario'];
      setCharName(charConfig.name);
      setCharacterIcon(() => charConfig.visuals.icon);

      const checkAuth = () => {
        setIsLoggedIn(!!localStorage.getItem('access_token'));
      };
      
      checkAuth();
      window.addEventListener('auth-change', checkAuth);
      return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6">
      <div className="mb-8 text-center animate-in slide-in-from-top-10 duration-500">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 mb-2 drop-shadow-lg">
          MARIO MAKER
        </h1>
        <p className="text-gray-400 text-xl tracking-widest uppercase font-bold">Build &bull; Play &bull; Share</p>
      </div>

      <div className="w-full max-w-5xl space-y-8">
        
        {/* HERO: Character Select Banner */}
        <button 
          onClick={() => navigate('/character')}
          className="w-full group relative overflow-hidden bg-gray-800 rounded-3xl p-1 border-2 border-gray-700 hover:border-yellow-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] hover:-translate-y-1"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800" />
            
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 via-transparent to-transparent group-hover:opacity-20 transition-opacity" />

            <div className="relative flex items-center justify-between p-6 sm:p-8">
                <div className="flex items-center gap-8">
                    {/* Character Icon Container */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gray-900 border-4 border-gray-700 group-hover:border-yellow-500 transition-colors flex items-center justify-center shadow-xl overflow-hidden">
                            {CharacterIcon && (
                                <svg viewBox="0 0 32 32" className="w-16 h-16 group-hover:scale-110 transition-transform duration-300">
                                    <CharacterIcon />
                                </svg>
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full border-2 border-gray-900">
                            CURRENT
                        </div>
                    </div>

                    <div className="text-left">
                        <h2 className="text-yellow-500 text-sm font-bold uppercase tracking-wider mb-1">Active Character</h2>
                        <div className="text-4xl font-black text-white mb-2 group-hover:text-yellow-400 transition-colors">{charName}</div>
                        <p className="text-gray-400 text-sm">Click to swap heroes and view stats</p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-gray-500 group-hover:text-white transition-colors">
                    <span className="font-bold text-sm uppercase tracking-widest">Select Character</span>
                    <div className="bg-gray-700 p-2 rounded-full group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        <ChevronRight size={24} />
                    </div>
                </div>
            </div>
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Map Editor */}
            <button 
                onClick={() => navigate('/editor')}
                className="group bg-gray-800 p-6 rounded-3xl border border-gray-700 hover:bg-gray-750 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all flex flex-col items-center text-center hover:-translate-y-1"
            >
                <div className="w-16 h-16 bg-blue-900/30 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <PenTool size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Map Editor</h3>
                <p className="text-gray-400 text-xs">Create & Publish levels</p>
            </button>

            {/* Game Center */}
            <button 
                onClick={() => navigate('/center')}
                className="group bg-gray-800 p-6 rounded-3xl border border-gray-700 hover:bg-gray-750 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all flex flex-col items-center text-center hover:-translate-y-1"
            >
                <div className="w-16 h-16 bg-purple-900/30 text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    <Globe size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Game Center</h3>
                <p className="text-gray-400 text-xs">Play community maps</p>
            </button>

            {/* My Maps (Conditional) */}
            {isLoggedIn ? (
                <button 
                    onClick={() => navigate('/my_maps')}
                    className="group bg-gray-800 p-6 rounded-3xl border border-gray-700 hover:bg-gray-750 hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all flex flex-col items-center text-center hover:-translate-y-1"
                >
                    <div className="w-16 h-16 bg-green-900/30 text-green-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300">
                        <FolderOpen size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">My Dashboard</h3>
                    <p className="text-gray-400 text-xs">Manage your maps</p>
                </button>
            ) : (
                <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-800 border-dashed flex flex-col items-center text-center opacity-70">
                     <div className="w-16 h-16 bg-gray-800 text-gray-600 rounded-2xl flex items-center justify-center mb-4">
                        <FolderOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-500 mb-1">Login Required</h3>
                    <p className="text-gray-600 text-xs">Sign in to manage maps</p>
                </div>
            )}

            {/* Local Play */}
            <button 
                onClick={() => navigate('/game')}
                className="group bg-gray-800 p-6 rounded-3xl border border-gray-700 hover:bg-gray-750 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-all flex flex-col items-center text-center hover:-translate-y-1"
            >
                <div className="w-16 h-16 bg-red-900/30 text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                    <Gamepad2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Quick Play</h3>
                <p className="text-gray-400 text-xs">Play local files</p>
            </button>

        </div>
      </div>

      <div className="mt-16 text-gray-600 text-xs font-mono">
        v1.2.0 &bull; Powered by React & PixiJS
      </div>
    </div>
  );
};
