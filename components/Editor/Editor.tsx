
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetPalette } from './AssetPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { MapCanvas } from './MapCanvas';
import { Game } from '../Game/Game';
import { GameMap, GameObjectData } from '../../types';
import { DEFAULT_MAP_HEIGHT, DEFAULT_MAP_WIDTH, TILE_SIZE as DEFAULT_TILE_SIZE, TOOL_ERASER } from '../../constants';
import { getElementById } from '../../elementRegistry';
import { X } from 'lucide-react';

const STORAGE_KEY = 'MARIO_MAP_DATA';

export const Editor: React.FC = () => {
  const navigate = useNavigate();

  // --- State ---
  const [selectedElementId, setSelectedElementId] = useState<number | string | null>(1); // Default to Ground
  const [mapName, setMapName] = useState("my_mario_map");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPlayTesting, setIsPlayTesting] = useState(false);
  
  // Play Test Configuration
  const [testConfig, setTestConfig] = useState({ width: 800, height: 600 });

  const [mapData, setMapData] = useState<GameMap>({
    width: DEFAULT_MAP_WIDTH,
    height: DEFAULT_MAP_HEIGHT,
    tileSize: DEFAULT_TILE_SIZE,
    backgroundColor: '#5C94FC', // Classic blue sky
    tiles: Array(DEFAULT_MAP_HEIGHT).fill(null).map(() => Array(DEFAULT_MAP_WIDTH).fill(0)),
    objects: []
  });

  // --- Init ---
  useEffect(() => {
    // Initialize Test Config to 90% of screen
    setTestConfig({
        width: Math.floor(window.innerWidth * 0.9),
        height: Math.floor(window.innerHeight * 0.9)
    });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mapData) {
            // Restore map data
            setMapData(parsed.mapData);
        }
        if (parsed.mapName) setMapName(parsed.mapName);
        if (parsed.lastSaved) setLastSaved(new Date(parsed.lastSaved));
      } catch (e) {
        console.error("Failed to load map from storage", e);
      }
    }
  }, []);

  // --- Handlers ---

  const handleSaveToStorage = () => {
    const now = new Date();
    const payload = {
      mapData,
      mapName,
      lastSaved: now.toISOString()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setLastSaved(now);
    } catch (e) {
      alert("Failed to save to local storage (quota might be full).");
    }
  };

  const handlePlayTest = () => {
      handleSaveToStorage(); // Auto-save before playing
      setIsPlayTesting(true);
  };

  // Update map properties (width/height) while preserving data
  const handleUpdateMap = (newData: Partial<GameMap>) => {
    setMapData((prev) => {
      let updated = { ...prev, ...newData };

      // Handle Tile Size Scaling Logic
      // If tileSize changed, we must scale all object pixel coordinates so they stay in the same visual grid slot
      if (newData.tileSize !== undefined && newData.tileSize !== prev.tileSize) {
          const scale = newData.tileSize / prev.tileSize;
          updated.objects = prev.objects.map(obj => ({
              ...obj,
              x: obj.x * scale,
              y: obj.y * scale
          }));
      }

      // If dimensions changed, resize the tiles array safely
      if (newData.width !== undefined || newData.height !== undefined) {
        const newW = newData.width ?? prev.width;
        const newH = newData.height ?? prev.height;
        
        const newTiles = Array(newH).fill(0).map((_, y) => 
          Array(newW).fill(0).map((_, x) => 
             (prev.tiles[y] && prev.tiles[y][x]) ? prev.tiles[y][x] : 0
          )
        );
        updated.tiles = newTiles;
      }
      return updated;
    });
  };

  const handleBackgroundColorChange = (color: string) => {
      setMapData(prev => ({ ...prev, backgroundColor: color }));
  };

  const handleTileClick = useCallback((x: number, y: number, isRightClick: boolean, isDrag: boolean) => {
    if (x < 0 || y < 0 || x >= mapData.width || y >= mapData.height) return;
    
    // Use the CURRENT tile size from mapData
    const currentTileSize = mapData.tileSize;

    // Erase Logic: Triggered by Right Click OR Eraser Tool
    if (isRightClick || selectedElementId === TOOL_ERASER) {
      // 1. Remove tile
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = 0;

      // 2. Remove objects at this location
      const pixelX = x * currentTileSize;
      const pixelY = y * currentTileSize;
      const newObjects = mapData.objects.filter(o => 
        // Simple collision check for deletion
        !(o.x >= pixelX && o.x < pixelX + currentTileSize && o.y >= pixelY && o.y < pixelY + currentTileSize)
      );

      setMapData(prev => ({ ...prev, tiles: newTiles, objects: newObjects }));
      return;
    }

    // Paint Logic
    if (selectedElementId === null) return;
    const element = getElementById(selectedElementId);
    if (!element) return;

    if (element.type === 'tile') {
      // Set Tile
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = element.id;
      setMapData(prev => ({ ...prev, tiles: newTiles }));
    } else {
      let textContent: string | undefined = undefined;

      // Check for duplicates (prevents object stacking during drag)
      const pixelX = x * currentTileSize;
      const pixelY = y * currentTileSize;
      
      const existingObj = mapData.objects.find(o => 
          o.x === pixelX && o.y === pixelY && o.type === element.name
      );
      if (existingObj) return;

      // Handle Text Element
      if (element.name === 'Text Decoration') {
          // IMPORTANT: Do not trigger text prompt on drag. 
          // Users must click explicitly to add text to avoid accidental prompts.
          if (isDrag) return;

          const input = prompt("Enter a single character:", "A");
          if (!input) return; // Cancelled
          textContent = input.substring(0, 1);
      }

      // Add Object
      const newObj: GameObjectData = {
        id: crypto.randomUUID(),
        type: element.name, // Storing name as type reference for JSON
        x: pixelX, 
        y: pixelY,
        text: textContent
      };
      setMapData(prev => ({ ...prev, objects: [...prev.objects, newObj] }));
    }
  }, [mapData, selectedElementId]);

  const handleClearMap = () => {
    if (window.confirm("Are you sure you want to clear the entire map? This cannot be undone.")) {
      setMapData(prev => ({
        ...prev,
        backgroundColor: '#5C94FC',
        tiles: Array(prev.height).fill(null).map(() => Array(prev.width).fill(0)),
        objects: []
      }));
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    // Ensure filename ends in .json
    const fileName = mapName.trim() ? (mapName.endsWith('.json') ? mapName : `${mapName}.json`) : 'mario_map.json';
    
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        // Basic validation could go here
        setMapData(json);
        // Optionally set the map name from the file name
        const nameWithoutExt = file.name.replace(/\.json$/i, "");
        setMapName(nameWithoutExt);
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white font-sans relative">
      {/* Left: Palette */}
      <AssetPalette 
        selectedId={selectedElementId} 
        onSelect={setSelectedElementId} 
        onClearMap={handleClearMap}
      />

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-4 z-50">
             <button onClick={() => navigate('/')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded shadow border border-gray-600">
                ← Back to Menu
             </button>
          </div>
          <MapCanvas 
            mapData={mapData}
            selectedElementId={selectedElementId}
            onTileClick={handleTileClick}
            onObjectClick={() => {}} 
          />
      </div>

      {/* Right: Properties */}
      <PropertiesPanel 
        mapData={mapData}
        mapName={mapName}
        lastSaved={lastSaved}
        testConfig={testConfig}
        onTestConfigChange={setTestConfig}
        onMapNameChange={setMapName}
        onUpdateMap={handleUpdateMap}
        onExport={handleExport}
        onImport={handleImport}
        onSave={handleSaveToStorage}
        onPlayTest={handlePlayTest}
        onBackgroundColorChange={handleBackgroundColorChange}
      />

      {/* Play Test Modal */}
      {isPlayTesting && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4">
              <div 
                className="relative bg-black border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col" 
                style={{ width: `${testConfig.width}px`, height: `${testConfig.height}px` }}
              >
                  {/* Close Button */}
                  <button 
                    onClick={() => setIsPlayTesting(false)}
                    className="absolute top-2 right-2 z-50 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow-lg"
                    title="Close Game"
                  >
                      <X size={24} />
                  </button>

                  <Game 
                      initialMapData={mapData} 
                      width={testConfig.width} 
                      height={testConfig.height} 
                      embedded={true}
                      onClose={() => setIsPlayTesting(false)}
                  />
              </div>
          </div>
      )}
    </div>
  );
};
