
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Lock, Zap, Activity, TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';
import { CHARACTERS } from '../../playerConfig';
import { SvgMario, SvgWukong } from '../../elementSVGs';

// Interface for UI display data
interface CharDisplayData {
    id: string;
    name: string;
    isLocked: boolean;
    description: string;
    stats: {
        speed: number; // 0-10
        jump: number; // 0-10
        difficulty: number; // 0-10
    };
    ability: string;
    renderIcon: () => React.ReactNode;
    themeColor: string;
}

export const CharacterSelect: React.FC = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  // Define the 10 slots
  const characterList: CharDisplayData[] = [
      {
          id: 'mario',
          name: 'Mario',
          isLocked: false,
          description: 'The balanced hero. Good for beginners.',
          stats: { speed: 6, jump: 6, difficulty: 3 },
          ability: 'Fireball & Growth',
          themeColor: 'from-red-500 to-red-700',
          renderIcon: () => <SvgMario />
      },
      {
          id: 'wukong',
          name: 'Sun Wukong',
          isLocked: false,
          description: 'High agility and transformation powers.',
          stats: { speed: 9, jump: 8, difficulty: 7 },
          ability: 'Transform & Flight',
          themeColor: 'from-yellow-500 to-orange-600',
          renderIcon: () => <SvgWukong />
      },
      // Generate 8 Locked Slots
      ...Array.from({ length: 8 }).map((_, i) => ({
          id: `locked_${i}`,
          name: 'Unknown',
          isLocked: true,
          description: 'This hero has not joined your team yet.',
          stats: { speed: 0, jump: 0, difficulty: 0 },
          ability: '???',
          themeColor: 'from-gray-700 to-gray-800',
          renderIcon: () => <HelpCircle size={64} className="text-gray-600" />
      }))
  ];

  // Load initial selection
  useEffect(() => {
    const saved = localStorage.getItem('SELECTED_CHARACTER');
    if (saved) {
        const index = characterList.findIndex(c => c.id === saved);
        if (index !== -1) setActiveIndex(index);
    }
  }, []);

  const handleSelect = () => {
    const selected = characterList[activeIndex];
    if (selected.isLocked) return;

    localStorage.setItem('SELECTED_CHARACTER', selected.id);
    navigate('/center');
  };

  const nextChar = () => {
      setActiveIndex((prev) => (prev + 1) % characterList.length);
  };

  const prevChar = () => {
      setActiveIndex((prev) => (prev - 1 + characterList.length) % characterList.length);
  };

  const activeChar = characterList[activeIndex];

  // Helper to render stat bar
  const StatBar = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) => (
      <div className="mb-4">
          <div className="flex justify-between text-xs uppercase font-bold text-gray-400 mb-1">
              <span className="flex items-center gap-1"><Icon size={12} /> {label}</span>
              <span>{value}/10</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${color} transition-all duration-500`} 
                style={{ width: `${value * 10}%` }}
              />
          </div>
      </div>
  );

  return (
    <div className="h-screen w-screen bg-gray-950 text-white flex overflow-hidden font-sans relative">
      
      {/* Background Ambience */}
      <div className={`absolute inset-0 bg-gradient-to-br ${activeChar.themeColor} opacity-10 transition-colors duration-700 pointer-events-none`} />
      
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm"
      >
        <ArrowLeft size={20} />
        <span className="font-bold text-sm">Back</span>
      </button>

      {/* LEFT SIDE: CAROUSEL */}
      <div className="w-[60%] h-full flex items-center justify-center relative perspective-1000">
          
          {/* Controls */}
          <button onClick={prevChar} className="absolute left-8 z-20 p-3 rounded-full bg-gray-800/50 hover:bg-gray-700 text-white transition-all hover:scale-110">
              <ChevronLeft size={32} />
          </button>
          <button onClick={nextChar} className="absolute right-8 z-20 p-3 rounded-full bg-gray-800/50 hover:bg-gray-700 text-white transition-all hover:scale-110">
              <ChevronRight size={32} />
          </button>

          {/* Cards Container */}
          <div className="relative w-full h-[500px] flex items-center justify-center">
              {characterList.map((char, index) => {
                  // Calculate relative position for the 3D effect
                  // We only care about Previous, Current, Next for visuals. Others hidden.
                  let offset = (index - activeIndex);
                  
                  // Handle wrap-around logic for visual positioning
                  if (offset < -Math.floor(characterList.length / 2)) offset += characterList.length;
                  if (offset > Math.floor(characterList.length / 2)) offset -= characterList.length;

                  // Determine styles based on offset
                  const isActive = offset === 0;
                  const isVisible = Math.abs(offset) <= 1; // Only show adjacent cards
                  
                  if (!isVisible) return null;

                  const xTrans = offset * 280; // Distance between cards
                  const scale = isActive ? 1.1 : 0.8;
                  const opacity = isActive ? 1 : 0.4;
                  const zIndex = isActive ? 10 : 5;
                  const rotateY = offset * -25; // 3D rotation

                  return (
                      <div
                        key={char.id}
                        className={`
                            absolute w-72 h-96 rounded-3xl border-4 transition-all duration-500 ease-out cursor-pointer flex flex-col items-center justify-center overflow-hidden
                            ${char.isLocked 
                                ? 'bg-black border-gray-800' 
                                : `bg-gray-800 ${isActive ? 'border-white shadow-[0_0_50px_rgba(255,255,255,0.2)]' : 'border-gray-700'}`}
                        `}
                        style={{
                            transform: `translateX(${xTrans}px) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
                            opacity,
                            zIndex
                        }}
                        onClick={() => setActiveIndex(index)}
                      >
                          {/* Card Content */}
                          <div className={`w-32 h-32 mb-6 transition-transform duration-500 ${isActive ? 'scale-110' : 'scale-100'}`}>
                             {char.isLocked ? (
                                 <div className="w-full h-full flex items-center justify-center text-gray-700 font-black text-6xl">?</div>
                             ) : (
                                <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-xl">
                                    {char.renderIcon()}
                                </svg>
                             )}
                          </div>
                          
                          <h2 className={`text-2xl font-black uppercase tracking-wider ${char.isLocked ? 'text-gray-600' : 'text-white'}`}>
                              {char.name}
                          </h2>

                          {char.isLocked && (
                              <div className="mt-4 flex items-center gap-2 text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full text-xs font-bold border border-gray-800">
                                  <Lock size={12} /> LOCKED
                              </div>
                          )}
                      </div>
                  );
              })}
          </div>
          
          {/* Pagination Dots */}
          <div className="absolute bottom-12 flex gap-2">
              {characterList.map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-white w-6' : 'bg-gray-700'}`} 
                  />
              ))}
          </div>
      </div>

      {/* RIGHT SIDE: INFO PANEL */}
      <div className="w-[40%] h-full bg-gray-900/80 backdrop-blur-md border-l border-gray-800 p-10 flex flex-col justify-center shadow-2xl z-20">
            
            <div className="mb-8">
                <h1 className={`text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${activeChar.themeColor}`}>
                    {activeChar.name}
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed">
                    {activeChar.description}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 border border-gray-700">
                <StatBar 
                    label="Speed" 
                    value={activeChar.stats.speed} 
                    icon={Zap} 
                    color="bg-blue-500" 
                />
                <StatBar 
                    label="Jump Power" 
                    value={activeChar.stats.jump} 
                    icon={TrendingUp} 
                    color="bg-green-500" 
                />
                <StatBar 
                    label="Difficulty" 
                    value={activeChar.stats.difficulty} 
                    icon={Activity} 
                    color="bg-red-500" 
                />
            </div>

            {/* Special Ability */}
            <div className="mb-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Special Ability</h3>
                <div className="flex items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700 border-l-4 border-l-yellow-500">
                    <div className="p-3 bg-yellow-500/10 rounded-full text-yellow-500">
                        <Zap size={24} />
                    </div>
                    <div>
                        <div className="font-bold text-white text-lg">{activeChar.ability}</div>
                        <div className="text-xs text-gray-400">Unique passive skill</div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={handleSelect}
                disabled={activeChar.isLocked}
                className={`
                    w-full py-5 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]
                    ${activeChar.isLocked 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30'}
                `}
            >
                {activeChar.isLocked ? (
                    <>
                        <Lock size={20} /> Locked Character
                    </>
                ) : (
                    <>
                        <CheckCircle size={20} /> Select & Play
                    </>
                )}
            </button>
      </div>

    </div>
  );
};
