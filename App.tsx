import React, { useState, useCallback } from 'react';
import { AssetPalette } from './components/Editor/AssetPalette';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { MapCanvas } from './components/Editor/MapCanvas';
import { GameMap, GameObjectData } from './types';
import { DEFAULT_MAP_HEIGHT, DEFAULT_MAP_WIDTH, TILE_SIZE, GAME_ELEMENTS, getElementById } from './constants';

const App: React.FC = () => {
  // --- State ---
  const [selectedElementId, setSelectedElementId] = useState<number | string | null>(1); // Default to Ground
  const [mapData, setMapData] = useState<GameMap>({
    width: DEFAULT_MAP_WIDTH,
    height: DEFAULT_MAP_HEIGHT,
    tileSize: TILE_SIZE,
    backgroundColor: '#5C94FC', // Classic blue sky
    tiles: Array(DEFAULT_MAP_HEIGHT).fill(null).map(() => Array(DEFAULT_MAP_WIDTH).fill(0)),
    objects: []
  });

  // --- Handlers ---

  // Update map properties (width/height) while preserving data
  const handleUpdateMap = (newData: Partial<GameMap>) => {
    setMapData((prev) => {
      const updated = { ...prev, ...newData };

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

  const handleTileClick = useCallback((x: number, y: number, isRightClick: boolean) => {
    if (x < 0 || y < 0 || x >= mapData.width || y >= mapData.height) return;

    if (isRightClick) {
      // Erase Logic
      // 1. Remove tile
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = 0;

      // 2. Remove objects at this location
      const pixelX = x * TILE_SIZE;
      const pixelY = y * TILE_SIZE;
      const newObjects = mapData.objects.filter(o => 
        // Simple collision check for deletion
        !(o.x >= pixelX && o.x < pixelX + TILE_SIZE && o.y >= pixelY && o.y < pixelY + TILE_SIZE)
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
      // Add Object
      const newObj: GameObjectData = {
        id: crypto.randomUUID(),
        type: element.name, // Storing name as type reference for JSON
        x: x * TILE_SIZE, // Snap to grid for now, can be freeform later
        y: y * TILE_SIZE
      };
      setMapData(prev => ({ ...prev, objects: [...prev.objects, newObj] }));
    }
  }, [mapData, selectedElementId]);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "mario_map.json");
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
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white font-sans">
      {/* Left: Palette */}
      <AssetPalette 
        selectedId={selectedElementId} 
        onSelect={setSelectedElementId} 
      />

      {/* Center: Canvas */}
      <MapCanvas 
        mapData={mapData}
        selectedElementId={selectedElementId}
        onTileClick={handleTileClick}
        onObjectClick={() => {}} // Placeholder for object selection
      />

      {/* Right: Properties */}
      <PropertiesPanel 
        mapData={mapData}
        onUpdateMap={handleUpdateMap}
        onExport={handleExport}
        onImport={handleImport}
      />
    </div>
  );
};

export default App;