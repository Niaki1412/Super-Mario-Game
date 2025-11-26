
import React from 'react';
import { GameMap } from '../../types';
import { Save, Play, ArrowUpFromLine, ArrowDownToLine, Palette, CloudUpload, Image as ImageIcon, Trash2, Plus } from 'lucide-react';

interface PropertiesPanelProps {
  mapData: GameMap;
  mapName: string;
  lastSaved: Date | null;
  testConfig: { width: number, height: number };
  onTestConfigChange: (config: { width: number, height: number }) => void;
  onMapNameChange: (name: string) => void;
  onUpdateMap: (newData: Partial<GameMap>) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCloudSave: () => void;
  onPlayTest: () => void;
  onBackgroundColorChange: (color: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  mapData, 
  mapName,
  lastSaved,
  testConfig,
  onTestConfigChange,
  onMapNameChange,
  onUpdateMap, 
  onExport,
  onImport,
  onSave,
  onCloudSave,
  onPlayTest,
  onBackgroundColorChange
}) => {
  
  const handleDimensionChange = (key: 'width' | 'height' | 'tileSize', value: string) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) return;
    onUpdateMap({ [key]: numValue });
  };

  const handleTestConfigChange = (key: 'width' | 'height', value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || num < 100) return;
      onTestConfigChange({ ...testConfig, [key]: num });
  };

  // Background Image Handlers
  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
          const result = ev.target?.result as string;
          // Replace current or set new
          onUpdateMap({
              backgroundImage: {
                  data: result,
                  name: file.name,
                  opacity: 0.5, // Default 50%
                  scale: 1.0,
              }
          });
      };
      reader.readAsDataURL(file);
  };

  const handleBgPropertyChange = (key: 'opacity' | 'scale', value: string) => {
      if (!mapData.backgroundImage) return;
      const num = parseFloat(value);
      if (isNaN(num)) return;
      
      onUpdateMap({
          backgroundImage: {
              ...mapData.backgroundImage,
              [key]: num
          }
      });
  };

  const handleRemoveBgImage = () => {
      onUpdateMap({ backgroundImage: undefined });
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
              onChange={(e) => handleDimensionChange('tileSize', e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Background Settings */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6 border border-gray-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Background</h3>
          
          {/* Color Picker */}
          <div className="mb-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
                    <Palette size={14} />
                    Solid Color
              </label>
              <div className="flex gap-2 items-center bg-gray-900 p-2 rounded border border-gray-600">
                    <input
                        type="color"
                        value={mapData.backgroundColor || '#5C94FC'}
                        onChange={(e) => onBackgroundColorChange(e.target.value)}
                        className="h-6 w-8 bg-transparent cursor-pointer border-0 p-0 rounded overflow-hidden"
                    />
                    <span className="text-xs font-mono text-gray-400 uppercase">{mapData.backgroundColor}</span>
              </div>
          </div>

          {/* Image Upload */}
          <div>
              <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                        <ImageIcon size={14} />
                        Texture Image
                  </label>
              </div>
              
              {!mapData.backgroundImage ? (
                  <label className="flex flex-col items-center justify-center w-full h-20 bg-gray-900 border-2 border-dashed border-gray-600 rounded cursor-pointer hover:border-gray-400 hover:bg-gray-800 transition-colors">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Plus size={12}/> Upload Image</span>
                      <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                  </label>
              ) : (
                  <div className="space-y-3 bg-gray-900 p-2 rounded border border-gray-600">
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-600">
                                  <img src={mapData.backgroundImage.data} alt="Bg" className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] text-gray-400 truncate max-w-[100px]" title={mapData.backgroundImage.name}>
                                  {mapData.backgroundImage.name}
                              </span>
                          </div>
                          <button 
                            onClick={handleRemoveBgImage}
                            className="text-red-400 hover:text-red-300 p-1 hover:bg-gray-800 rounded"
                            title="Remove Image"
                          >
                              <Trash2 size={14} />
                          </button>
                      </div>

                      <div>
                          <div className="flex justify-between mb-1">
                              <span className="text-[10px] text-gray-400">Opacity</span>
                              <span className="text-[10px] text-white">{Math.round(mapData.backgroundImage.opacity * 100)}%</span>
                          </div>
                          <input 
                              type="range" 
                              min="0" 
                              max="1" 
                              step="0.05"
                              value={mapData.backgroundImage.opacity}
                              onChange={(e) => handleBgPropertyChange('opacity', e.target.value)}
                              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                      </div>

                      <div>
                          <div className="flex justify-between mb-1">
                              <span className="text-[10px] text-gray-400">Scale</span>
                              <span className="text-[10px] text-white">{mapData.backgroundImage.scale}x</span>
                          </div>
                          <input 
                              type="number" 
                              min="0.1" 
                              max="10" 
                              step="0.1"
                              value={mapData.backgroundImage.scale}
                              onChange={(e) => handleBgPropertyChange('scale', e.target.value)}
                              className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                          />
                      </div>
                      
                      <label className="block w-full text-center text-[10px] text-blue-400 cursor-pointer hover:underline mt-1 pt-2 border-t border-gray-700">
                          Replace Image
                          <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" />
                      </label>
                  </div>
              )}
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

         <div className="grid grid-cols-2 gap-2">
             <div>
                 <label className="block text-[10px] text-gray-400 mb-1">Test Width</label>
                 <input 
                    type="number" 
                    value={testConfig.width}
                    onChange={(e) => handleTestConfigChange('width', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
                 />
             </div>
             <div>
                 <label className="block text-[10px] text-gray-400 mb-1">Test Height</label>
                 <input 
                    type="number" 
                    value={testConfig.height}
                    onChange={(e) => handleTestConfigChange('height', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs"
                 />
             </div>
         </div>

         <button 
            onClick={onPlayTest}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded shadow transition-colors flex justify-center items-center gap-2 mb-2"
         >
             <Play size={16} fill="currentColor" />
             <span>Play Test</span>
         </button>

         <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onSave}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-3 rounded shadow transition-colors flex justify-center items-center gap-1 text-xs"
                title="Save to Browser Storage"
            >
                <Save size={14} />
                <span>Local</span>
            </button>
            <button 
                onClick={onCloudSave}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-3 rounded shadow transition-colors flex justify-center items-center gap-1 text-xs"
                title="Save to Cloud"
            >
                <CloudUpload size={14} />
                <span>Cloud</span>
            </button>
         </div>

         {/* Import / Export Circular Buttons */}
         <div className="flex gap-4 justify-center items-center pt-2">
             <div className="relative group flex flex-col items-center gap-1">
                 <input
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Import JSON"
                 />
                 <button className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full border border-gray-600 transition-all flex items-center justify-center shadow-lg group-hover:scale-110">
                    <ArrowUpFromLine size={20} />
                 </button>
                 <span className="text-[10px] text-gray-500 font-bold">IMPORT</span>
             </div>

            <div className="flex flex-col items-center gap-1">
                <button 
                  onClick={onExport}
                  title="Export JSON"
                  className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-all flex items-center justify-center hover:scale-110"
                >
                  <ArrowDownToLine size={20} />
                </button>
                <span className="text-[10px] text-gray-500 font-bold">EXPORT</span>
            </div>
         </div>

      </div>
    </div>
  );
};
