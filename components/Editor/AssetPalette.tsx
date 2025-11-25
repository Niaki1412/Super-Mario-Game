import React from 'react';
import { TOOL_ERASER } from '../../constants';
import { GAME_ELEMENTS_REGISTRY, RegistryItem } from '../../elementRegistry';
import { Trash2, Eraser, Palette } from 'lucide-react';

interface AssetPaletteProps {
  selectedId: number | string | null;
  onSelect: (id: number | string) => void;
  onClearMap: () => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

export const AssetPalette: React.FC<AssetPaletteProps> = ({ 
    selectedId, 
    onSelect, 
    onClearMap,
    backgroundColor,
    onBackgroundColorChange
}) => {
  const categories = Array.from(new Set(GAME_ELEMENTS_REGISTRY.map(e => e.category)));

  const renderAssetIcon = (element: RegistryItem) => {
    const colorHex = `#${element.color.toString(16).padStart(6, '0')}`;
    return (
       <svg viewBox="0 0 32 32" className="w-10 h-10 mb-1 drop-shadow-sm" style={{ color: colorHex }}>
         {element.renderSVG()}
       </svg>
    );
  };

  const renderCategory = (category: string) => {
    const items = GAME_ELEMENTS_REGISTRY.filter(e => e.category === category);
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

      <div className="space-y-2 mb-4">
        {/* Background Color Picker */}
        <div className="bg-gray-800 p-2 rounded border border-gray-700 mb-2">
            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">
                <Palette size={12} />
                Background Color
            </label>
            <div className="flex gap-2 items-center">
                 <input
                    type="color"
                    value={backgroundColor || '#5C94FC'}
                    onChange={(e) => onBackgroundColorChange(e.target.value)}
                    className="h-8 w-12 bg-transparent cursor-pointer border-0 p-0 rounded overflow-hidden"
                />
                <span className="text-[10px] font-mono text-gray-500 uppercase">{backgroundColor}</span>
            </div>
        </div>

        <button 
            onClick={onClearMap}
            className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 text-xs font-bold py-2 px-3 rounded border border-red-900/50 transition-colors"
        >
            <Trash2 size={14} />
            CLEAR MAP
        </button>

        <button 
            onClick={() => onSelect(TOOL_ERASER)}
             className={`
                w-full flex items-center justify-center gap-2 text-xs font-bold py-2 px-3 rounded border transition-colors
                ${selectedId === TOOL_ERASER 
                  ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_10px_rgba(219,39,119,0.5)]' 
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}
              `}
        >
            <Eraser size={14} />
            ERASER TOOL
        </button>
      </div>
      
      <div className="flex-1">
        {categories.map(cat => renderCategory(cat))}
      </div>

      <div className="mt-4 p-3 bg-gray-800 rounded text-xs text-gray-400">
        <p>Select an item above to paint.</p>
        <p className="mt-1">Use the Eraser Tool or Right-Click to remove items.</p>
      </div>
    </div>
  );
};