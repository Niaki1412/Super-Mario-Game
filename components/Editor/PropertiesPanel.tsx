import React from 'react';
import { GameMap } from '../../types';
import { Save } from 'lucide-react';

interface PropertiesPanelProps {
  mapData: GameMap;
  mapName: string;
  lastSaved: Date | null;
  onMapNameChange: (name: string) => void;
  onUpdateMap: (newData: Partial<GameMap>) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  mapData, 
  mapName,
  lastSaved,
  onMapNameChange,
  onUpdateMap, 
  onExport,
  onImport,
  onSave
}) => {
  
  const handleDimensionChange = (key: 'width' | 'height', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    
    // Logic to resize the tiles array handled in parent or helper
    // Here we just pass the desired dimension
    onUpdateMap({ [key]: numValue });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 p-4 w-72 shadow-xl z-10 overflow-y-auto">
      <h2 className="text-lg font-bold text-white mb-6">⚙️ Properties</h2>

      {/* Map Settings */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Map Settings</h3>
        
        <div className="space-y-4">
           <div>
            <label className="block text-xs text-gray-400 mb-1">Map Name (Filename)</label>
            <input 
              type="text" 
              value={mapName}
              onChange={(e) => onMapNameChange(e.target.value)}
              placeholder="mario_map"
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Map Dimensions */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Map Dimensions</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Width (Tiles)</label>
            <input 
              type="number" 
              value={mapData.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Height (Tiles)</label>
            <input 
              type="number" 
              value={mapData.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Tile Size (px)</label>
            <input 
              type="number" 
              value={mapData.tileSize}
              disabled
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-500 cursor-not-allowed text-sm"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Statistics</h3>
        <ul className="text-xs text-gray-400 space-y-2">
          <li className="flex justify-between">
            <span>Total Objects:</span>
            <span className="text-white">{mapData.objects.length}</span>
          </li>
          <li className="flex justify-between">
            <span>Pixel Width:</span>
            <span className="text-white">{mapData.width * mapData.tileSize}px</span>
          </li>
        </ul>
      </div>

      <div className="mt-auto space-y-3 pt-6 border-t border-gray-800">
         
         {lastSaved && (
             <div className="text-xs text-gray-500 text-center mb-1">
                 Last saved: {lastSaved.toLocaleTimeString()}
             </div>
         )}

         <button 
            onClick={onSave}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded shadow transition-colors flex justify-center items-center gap-2"
         >
            <Save size={16} />
            <span>Save to Browser</span>
         </button>

         <div className="relative">
             <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded border border-gray-600 transition-colors text-sm">
                Import JSON
             </button>
         </div>

        <button 
          onClick={onExport}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-colors flex justify-center items-center gap-2 text-sm"
        >
          <span>Export JSON</span>
        </button>
      </div>
    </div>
  );
};