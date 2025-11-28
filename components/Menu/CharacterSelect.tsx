
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { CHARACTERS } from '../../playerConfig';

export const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string>('mario');

  useEffect(() => {
    const saved = localStorage.getItem('SELECTED_CHARACTER');
    if (saved && CHARACTERS[saved as keyof typeof CHARACTERS]) {
      setSelected(saved);
    }
  }, []);

  const handleSelect = (key: string) => {
    setSelected(key);
    localStorage.setItem('SELECTED_CHARACTER', key);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
        <span className="font-bold text-lg">Back</span>
      </button>

      <h1 className="text-4xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
        SELECT CHARACTER
      </h1>

      <div className="flex flex-wrap gap-8 justify-center">
        {/* MARIO CARD */}
        <button
          onClick={() => handleSelect('mario')}
          className={`
            relative group w-64 h-80 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
            ${selected === 'mario' 
                ? 'border-red-500 bg-red-900/20 scale-105 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-500'}
          `}
        >
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
             🍄
          </div>
          <h2 className="text-2xl font-bold mb-2">Mario</h2>
          <p className="text-gray-400 text-sm px-4 text-center">
            Classic balanced playstyle. Fireballs and mushrooms.
          </p>
          
          {selected === 'mario' && (
            <div className="absolute top-4 right-4 text-red-500">
              <CheckCircle size={24} fill="currentColor" className="text-white" />
            </div>
          )}
        </button>

        {/* WUKONG CARD */}
        <button
          onClick={() => handleSelect('wukong')}
          className={`
            relative group w-64 h-80 rounded-2xl border-4 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
            ${selected === 'wukong' 
                ? 'border-yellow-500 bg-yellow-900/20 scale-105 shadow-[0_0_30px_rgba(234,179,8,0.4)]' 
                : 'border-gray-700 bg-gray-800 hover:bg-gray-750 hover:border-gray-500'}
          `}
        >
          <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
             🐵
          </div>
          <h2 className="text-2xl font-bold mb-2">Sun Wukong</h2>
          <p className="text-gray-400 text-sm px-4 text-center">
             Monkey King. Transforms into Gorilla. Throws banana peels.
          </p>

          {selected === 'wukong' && (
            <div className="absolute top-4 right-4 text-yellow-500">
              <CheckCircle size={24} fill="currentColor" className="text-black" />
            </div>
          )}
        </button>
      </div>

      <div className="mt-12">
        <button
            onClick={() => navigate('/game')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-12 rounded-full shadow-lg text-lg transition-transform hover:scale-105"
        >
            START GAME
        </button>
      </div>
    </div>
  );
};
