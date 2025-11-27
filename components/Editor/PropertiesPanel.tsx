
import React, { useState } from 'react';
import { GameMap, GameObjectData } from '../../types';
import { Save, Play, ArrowUpFromLine, ArrowDownToLine, Palette, CloudUpload, Trash2, ChevronDown, ChevronRight, Settings, Maximize, BarChart, BoxSelect, ZoomIn } from 'lucide-react';

interface PropertiesPanelProps {
  mapData: GameMap;
  mapName: string;
  lastSaved: Date | null;
  testConfig: { width: number, height: number };
  selectedObject: GameObjectData | null;
  onTestConfigChange: (config: { width: number, height: number }) => void;
  onMapNameChange: (name: string) => void;
  onUpdateMap: (newData: Partial<GameMap>) => void;
  onUpdateObject: (id: string, newData: Partial<GameObjectData['properties']>) => void;
  onDeleteObject: (id: string) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCloudSave: () => void;
  onPlayTest: () => void;
  onBackgroundColorChange: (color: string) => void;
}

// Collapsible Section Component
const PropertySection: React.FC<{
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    highlight?: boolean;
}> = ({ title, icon, isOpen, onToggle, children, highlight }) => {
    return (
        <div className={`rounded-lg border overflow-hidden mb-3 ${highlight ? 'bg-blue-900/20 border-blue-500/50' : 'bg-gray-800 border-gray-700'}`}>
            <button 
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-3 transition-colors ${highlight ? 'hover:bg-blue-900/30' : 'bg-gray-800 hover:bg-gray-750'}`}
            >
                <div className={`flex items-center gap-2 text-sm font-bold ${highlight ? 'text-blue-300' : 'text-gray-200'}`}>
                    <span className={highlight ? 'text-blue-400' : 'text-blue-400'}>{icon}</span>
                    {title}
                </div>
                {isOpen ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
            </button>
            
            {isOpen && (
                <div className="p-3 border-t border-gray-700 bg-gray-900/50">
                    {children}
                </div>
            )}
        </div>
    );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ 
  mapData, 
  mapName,
  lastSaved,
  testConfig,
  selectedObject,
  onTestConfigChange,
  onMapNameChange,
  onUpdateMap,
  onUpdateObject,
  onDeleteObject,
  onExport,
  onImport,
  onSave,
  onCloudSave,
  onPlayTest,
  onBackgroundColorChange
}) => {
  
  // Collapsible States
  const [openSections, setOpenSections] = useState({
      selected: true,
      settings: true,
      dimensions: false,
      background: true,
      stats: false
  });

  const toggleSection = (key: keyof typeof openSections) => {
      setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

  // Helper to get image name
  const getSelectedImageName = () => {
      if (!selectedObject || !selectedObject.properties?.customImageId) return "Custom Image";
      const img = mapData.customImages?.find(i => i.id === selectedObject.properties?.customImageId);
      return img ? img.name : "Unknown Image";
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-700 w-72 shadow-xl z-10">
      <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">⚙️ Properties</h2>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        
        {/* SELECTED OBJECT PROPERTIES */}
        {selectedObject && (
            <PropertySection
                title="Selected Object"
                icon={<BoxSelect size={14} />}
                isOpen={openSections.selected}
                onToggle={() => toggleSection('selected')}
                highlight
            >
                <div className="space-y-4">
                    <div className="text-xs text-blue-200 font-mono mb-2 p-2 bg-blue-900/30 rounded border border-blue-800 break-all">
                        ID: {selectedObject.id.split('-')[0]}...
                    </div>
                    
                    {selectedObject.type === 'CustomImage' && (
                        <>
                            <div className="text-xs text-gray-400 italic truncate" title={getSelectedImageName()}>
                                {getSelectedImageName()}
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] text-gray-400">Opacity</span>
                                    <span className="text-[10px] text-white">{Math.round((selectedObject.properties?.opacity ?? 1) * 100)}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05"
                                    value={selectedObject.properties?.opacity ?? 1}
                                    onChange={(e) => onUpdateObject(selectedObject.id, { opacity: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] text-gray-400">Scale</span>
                                    <span className="text-[10px] text-white">{selectedObject.properties?.scale ?? 1}x</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ZoomIn size={14} className="text-gray-500"/>
                                    <input 
                                        type="number" 
                                        min="0.1" 
                                        max="10" 
                                        step="0.1"
                                        value={selectedObject.properties?.scale ?? 1}
                                        onChange={(e) => onUpdateObject(selectedObject.id, { scale: parseFloat(e.target.value) })}
                                        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <button 
                        onClick={() => onDeleteObject(selectedObject.id)}
                        className="w-full flex items-center justify-center gap-2 bg-red-900/30 hover:bg-red-900/50 text-red-200 text-xs font-bold py-2 px-3 rounded border border-red-900/50 transition-colors"
                    >
                        <Trash2 size={14} />
                        DELETE OBJECT
                    </button>
                </div>
            </PropertySection>
        )}

        {/* Map Settings */}
        <PropertySection 
            title="General" 
            icon={<Settings size={14} />} 
            isOpen={openSections.settings}
            onToggle={() => toggleSection('settings')}
        >
            <div className="space-y-4">
               <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Map Name</label>
                <input 
                  type="text" 
                  value={mapName}
                  onChange={(e) => onMapNameChange(e.target.value)}
                  placeholder="mario_map"
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm placeholder-gray-600"
                />
              </div>
            </div>
        </PropertySection>

        {/* Map Dimensions */}
        <PropertySection 
            title="Dimensions" 
            icon={<Maximize size={14} />} 
            isOpen={openSections.dimensions}
            onToggle={() => toggleSection('dimensions')}
        >
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Width (Tiles)</label>
                <input 
                  type="number" 
                  value={mapData.width}
                  onChange={(e) => handleDimensionChange('width', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Height (Tiles)</label>
                <input 
                  type="number" 
                  value={mapData.height}
                  onChange={(e) => handleDimensionChange('height', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-500 font-bold mb-1">Tile Size (px)</label>
                <input 
                  type="number" 
                  value={mapData.tileSize}
                  onChange={(e) => handleDimensionChange('tileSize', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>
        </PropertySection>

        {/* Background Settings */}
        <PropertySection 
            title="Background" 
            icon={<Palette size={14} />} 
            isOpen={openSections.background}
            onToggle={() => toggleSection('background')}
        >
              {/* Color Picker */}
              <div className="mb-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-2">
                        Solid Color
                  </label>
                  <div className="flex gap-2 items-center bg-gray-800 p-1.5 rounded border border-gray-600">
                        <input
                            type="color"
                            value={mapData.backgroundColor || '#5C94FC'}
                            onChange={(e) => onBackgroundColorChange(e.target.value)}
                            className="h-6 w-8 bg-transparent cursor-pointer border-0 p-0 rounded overflow-hidden"
                        />
                        <span className="text-xs font-mono text-gray-400 uppercase">{mapData.backgroundColor}</span>
                  </div>
              </div>
        </PropertySection>

        {/* Stats */}
        <PropertySection 
            title="Statistics" 
            icon={<BarChart size={14} />} 
            isOpen={openSections.stats}
            onToggle={() => toggleSection('stats')}
        >
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
        </PropertySection>

      </div>

      {/* FIXED FOOTER AREA */}
      <div className="mt-auto space-y-3 p-4 border-t border-gray-800 bg-gray-900">
         
         {lastSaved && (
             <div className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
                 <span>Last saved:</span>
                 <span className="text-gray-400">{lastSaved.toLocaleTimeString()}</span>
             </div>
         )}

         <div className="grid grid-cols-2 gap-2">
             <div>
                 <label className="block text-[9px] uppercase text-gray-500 font-bold mb-1">Test W</label>
                 <input 
                    type="number" 
                    value={testConfig.width}
                    onChange={(e) => handleTestConfigChange('width', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-center"
                 />
             </div>
             <div>
                 <label className="block text-[9px] uppercase text-gray-500 font-bold mb-1">Test H</label>
                 <input 
                    type="number" 
                    value={testConfig.height}
                    onChange={(e) => handleTestConfigChange('height', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-center"
                 />
             </div>
         </div>

         <button 
            onClick={onPlayTest}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded shadow transition-colors flex justify-center items-center gap-2 group"
         >
             <Play size={16} fill="currentColor" className="group-hover:scale-110 transition-transform"/>
             <span>PLAY TEST</span>
         </button>

         <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={onSave}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-3 rounded shadow transition-colors flex justify-center items-center gap-2 text-xs border border-green-600"
                title="Save to Browser Storage"
            >
                <Save size={14} />
                <span>LOCAL</span>
            </button>
            <button 
                onClick={onCloudSave}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded shadow transition-colors flex justify-center items-center gap-2 text-xs border border-blue-600"
                title="Save to Cloud"
            >
                <CloudUpload size={14} />
                <span>CLOUD</span>
            </button>
         </div>

         {/* Import / Export Circular Buttons */}
         <div className="flex gap-6 justify-center items-center pt-2 pb-1">
             <div className="relative group flex flex-col items-center gap-1">
                 <input
                    type="file"
                    accept=".json"
                    onChange={onImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Import JSON"
                 />
                 <button className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full border border-gray-600 transition-all flex items-center justify-center shadow-lg group-hover:-translate-y-1">
                    <ArrowUpFromLine size={18} />
                 </button>
                 <span className="text-[9px] text-gray-500 font-bold tracking-wider">IMPORT</span>
             </div>

            <div className="group flex flex-col items-center gap-1">
                <button 
                  onClick={onExport}
                  title="Export JSON"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-full border border-gray-600 transition-all flex items-center justify-center shadow-lg group-hover:-translate-y-1"
                >
                  <ArrowDownToLine size={18} />
                </button>
                <span className="text-[9px] text-gray-500 font-bold tracking-wider">EXPORT</span>
            </div>
         </div>

      </div>
    </div>
  );
};
