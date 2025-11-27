
import React from 'react';
import { TOOL_ERASER, TOOL_SELECT } from '../../constants';
import { GAME_ELEMENTS_REGISTRY, RegistryItem } from '../../elementRegistry';
import { Trash2, Eraser, MousePointer2, ImagePlus } from 'lucide-react';
import { CustomImageDef } from '../../types';

interface AssetPaletteProps {
  selectedId: number | string | null;
  customImages: CustomImageDef[];
  onSelect: (id: number | string) => void;
  onClearMap: () => void;
  onUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AssetPalette: React.FC<AssetPaletteProps> = ({ 
    selectedId, 
    customImages = [],
    onSelect, 
    onClearMap,
    onUploadImage
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

      {/* TOOLS */}
      <div className="space-y-2 mb-6">
        <button 
            onClick={() => onSelect(TOOL_SELECT)}
             className={`
                w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-3 rounded border transition-colors
                ${selectedId === TOOL_SELECT 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg' 
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}
              `}
        >
            <MousePointer2 size={16} />
            SELECT OBJECT
        </button>

        <button 
            onClick={() => onSelect(TOOL_ERASER)}
             className={`
                w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-3 rounded border transition-colors
                ${selectedId === TOOL_ERASER 
                  ? 'bg-pink-600 text-white border-pink-500 shadow-[0_0_10px_rgba(219,39,119,0.5)]' 
                  : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'}
              `}
        >
            <Eraser size={16} />
            ERASER TOOL
        </button>

        <button 
            onClick={onClearMap}
            className="w-full flex items-center justify-center gap-2 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-xs font-bold py-2 px-3 rounded border border-red-900/30 transition-colors mt-2"
        >
            <Trash2 size={14} />
            CLEAR MAP
        </button>
      </div>
      
      {/* CUSTOM IMAGES */}
      <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-700 pb-1 flex justify-between items-center">
              <span>Custom Images</span>
              <label className="cursor-pointer text-blue-400 hover:text-blue-300">
                  <ImagePlus size={14} />
                  <input type="file" accept="image/*" multiple onChange={onUploadImage} className="hidden" />
              </label>
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
              {customImages.map((img) => (
                  <button
                      key={img.id}
                      onClick={() => onSelect(`custom_img:${img.id}`)}
                      className={`
                        relative group flex flex-col items-center justify-center p-1 rounded-md transition-all border-2 overflow-hidden aspect-square
                        ${selectedId === `custom_img:${img.id}`
                          ? 'border-blue-500 bg-gray-700' 
                          : 'border-gray-700 hover:border-gray-500 bg-gray-800'}
                      `}
                      title={img.name}
                  >
                      <img src={img.data} alt={img.name} className="w-full h-full object-contain" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white truncate px-1 py-0.5 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.name}
                      </div>
                  </button>
              ))}
              <label className="flex flex-col items-center justify-center p-2 rounded-md border-2 border-dashed border-gray-700 hover:border-gray-500 hover:bg-gray-800 cursor-pointer text-gray-500 hover:text-gray-300 transition-colors aspect-square">
                  <ImagePlus size={20} />
                  <span className="text-[9px] mt-1">Upload</span>
                  <input type="file" accept="image/*" multiple onChange={onUploadImage} className="hidden" />
              </label>
          </div>
      </div>

      <div className="flex-1">
        {categories.map(cat => renderCategory(cat))}
      </div>
    </div>
  );
};
