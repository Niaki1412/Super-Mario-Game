import React from 'react';
import { GAME_ELEMENTS } from '../../constants';
import { ElementConfig } from '../../types';

interface AssetPaletteProps {
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
}

export const AssetPalette: React.FC<AssetPaletteProps> = ({ selectedId, onSelect }) => {
  const categories = Array.from(new Set(GAME_ELEMENTS.map(e => e.category)));

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
            >
              {/* Color Swatch Preview */}
              <div 
                className="w-8 h-8 mb-2 rounded shadow-sm border border-gray-600"
                style={{ backgroundColor: `#${item.color.toString(16).padStart(6, '0')}` }}
              />
              <span className="truncate w-full">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-700 p-4 overflow-y-auto w-64 shadow-xl z-10">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>🛠️ Assets</span>
      </h2>
      
      <div className="flex-1">
        {categories.map(cat => renderCategory(cat))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
        <p>Select an item above, then click on the grid to place it.</p>
        <p className="mt-1">Right-click to erase.</p>
      </div>
    </div>
  );
};