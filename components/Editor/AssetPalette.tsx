import React from 'react';
import { GAME_ELEMENTS } from '../../constants';
import { ElementConfig } from '../../types';
import { Trash2 } from 'lucide-react';

interface AssetPaletteProps {
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  onClearMap: () => void;
}

export const AssetPalette: React.FC<AssetPaletteProps> = ({ selectedId, onSelect, onClearMap }) => {
  const categories = Array.from(new Set(GAME_ELEMENTS.map(e => e.category)));

  const renderAssetIcon = (element: ElementConfig) => {
    const colorHex = `#${element.color.toString(16).padStart(6, '0')}`;
    
    // Wrapper for consistent sizing
    const SvgIcon = ({ children }: { children: React.ReactNode }) => (
       <svg viewBox="0 0 32 32" className="w-10 h-10 mb-1 drop-shadow-sm" style={{ color: colorHex }}>
         {children}
       </svg>
    );

    switch (element.name) {
        case 'Ground':
            return (
                <SvgIcon>
                    <rect x="0" y="0" width="32" height="32" fill="currentColor" />
                    <path d="M0 0 L32 0" stroke="#3E2723" strokeWidth="4" /> {/* Top soil dark edge */}
                    <path d="M4 10 L8 6 L12 10 M20 20 L24 16 L28 20" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none" />
                </SvgIcon>
            );
        case 'Brick (Breakable)':
            return (
                <SvgIcon>
                    <rect x="0" y="0" width="32" height="32" fill="currentColor" />
                    {/* Brick Pattern */}
                    <path d="M0 8 H32 M0 16 H32 M0 24 H32 M16 0 V8 M8 8 V16 M24 8 V16 M16 16 V24 M8 24 V32 M24 24 V32" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
                </SvgIcon>
            );
        case 'Hard Block':
             return (
                <SvgIcon>
                    <rect x="0" y="0" width="32" height="32" fill="currentColor" />
                    <rect x="4" y="4" width="24" height="24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                    <path d="M0 0 L4 4 M32 0 L28 4 M0 32 L4 28 M32 32 L28 28" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
                    <circle cx="6" cy="6" r="1" fill="rgba(0,0,0,0.5)" />
                    <circle cx="26" cy="6" r="1" fill="rgba(0,0,0,0.5)" />
                    <circle cx="6" cy="26" r="1" fill="rgba(0,0,0,0.5)" />
                    <circle cx="26" cy="26" r="1" fill="rgba(0,0,0,0.5)" />
                </SvgIcon>
            );
        case 'Question Block':
            return (
                <SvgIcon>
                    <rect x="0" y="0" width="32" height="32" fill="currentColor" rx="2" />
                    {/* Corner rivets */}
                    <circle cx="4" cy="4" r="2" fill="rgba(0,0,0,0.3)" />
                    <circle cx="28" cy="4" r="2" fill="rgba(0,0,0,0.3)" />
                    <circle cx="4" cy="28" r="2" fill="rgba(0,0,0,0.3)" />
                    <circle cx="28" cy="28" r="2" fill="rgba(0,0,0,0.3)" />
                    {/* Question Mark */}
                    <text x="16" y="24" fontSize="20" fontWeight="900" textAnchor="middle" fill="rgba(0,0,0,0.3)">?</text>
                    <text x="15" y="23" fontSize="20" fontWeight="900" textAnchor="middle" fill="#FFF8E1">?</text>
                </SvgIcon>
            );
        case 'Invisible Death Block':
            return (
                <SvgIcon>
                    <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
                    <text x="16" y="22" fontSize="14" textAnchor="middle" fill="currentColor">☠️</text>
                </SvgIcon>
            );
        case 'Goomba':
             return (
                <SvgIcon>
                    {/* Head */}
                    <path d="M6 20 Q16 -4 26 20 L28 26 L4 26 Z" fill="currentColor" />
                    {/* Feet */}
                    <ellipse cx="8" cy="29" rx="5" ry="3" fill="black" />
                    <ellipse cx="24" cy="29" rx="5" ry="3" fill="black" />
                    {/* Face */}
                    <circle cx="11" cy="14" r="3" fill="white" />
                    <circle cx="21" cy="14" r="3" fill="white" />
                    <circle cx="12" cy="14" r="1" fill="black" />
                    <circle cx="20" cy="14" r="1" fill="black" />
                    <path d="M14 20 Q16 18 18 20" stroke="black" strokeWidth="1" fill="none" />
                </SvgIcon>
             );
        case 'Coin':
            return (
                <SvgIcon>
                    <ellipse cx="16" cy="16" rx="10" ry="14" fill="currentColor" stroke="#F57F17" strokeWidth="1.5" />
                    <ellipse cx="16" cy="16" rx="6" ry="10" fill="none" stroke="#FFF59D" strokeWidth="2" />
                </SvgIcon>
            );
        case 'Mushroom':
            return (
                <SvgIcon>
                    {/* Cap */}
                    <path d="M2 18 Q16 -8 30 18 H2 Z" fill="currentColor" />
                    <circle cx="8" cy="12" r="3" fill="white" fillOpacity="0.8" />
                    <circle cx="24" cy="12" r="3" fill="white" fillOpacity="0.8" />
                    <circle cx="16" cy="6" r="4" fill="white" fillOpacity="0.8" />
                    {/* Stem */}
                    <path d="M10 18 V26 Q10 30 16 30 Q22 30 22 26 V18" fill="#FFE0B2" />
                    <circle cx="14" cy="22" r="1" fill="black" />
                    <circle cx="18" cy="22" r="1" fill="black" />
                </SvgIcon>
            );
        case 'Player Start':
            return (
                 <SvgIcon>
                     <circle cx="16" cy="8" r="6" fill="currentColor" />
                     <path d="M8 32 L8 18 Q8 14 16 14 Q24 14 24 18 L24 32" fill="currentColor" />
                     <path d="M4 22 L8 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                     <path d="M28 22 L24 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                 </SvgIcon>
            );
        default:
            return (
                 <div 
                    className="w-10 h-10 mb-1 rounded shadow-sm border border-gray-600"
                    style={{ backgroundColor: colorHex }}
                 />
            );
    }
  };

  const renderCategory = (category: string) => {
    const items = GAME_ELEMENTS.filter(e => e.category === category);
    return (
      <div key={category} className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1">
          {category}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-md transition-all text-xs text-center
                border-2
                ${selectedId === item.id 
                  ? 'border-blue-500 bg-gray-700' 
                  : 'border-gray-700 hover:border-gray-500 bg-gray-800'}
              `}
              title={item.name}
            >
              {renderAssetIcon(item)}
              <span className="truncate w-full text-[10px] leading-tight">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto w-64 shadow-xl z-10 select-none">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🛠️ Assets</span>
      </h2>

      <div className="mb-4">
        <button 
            onClick={onClearMap}
            className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-bold py-2 px-3 rounded border border-red-800 transition-colors"
        >
            <Trash2 size={14} />
            CLEAR MAP
        </button>
      </div>
      
      <div className="flex-1">
        {categories.map(cat => renderCategory(cat))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
        <p>Select an item above, then click on the grid to place it.</p>
        <p className="mt-1 text-gray-500">Right-click to erase.</p>
      </div>
    </div>
  );
};