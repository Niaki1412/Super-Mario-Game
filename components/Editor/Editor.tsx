import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssetPalette } from './AssetPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { MapCanvas } from './MapCanvas';
import { Game } from '../Game/Game';
import { GameMap, GameObjectData } from '../../types';
import { DEFAULT_MAP_HEIGHT, DEFAULT_MAP_WIDTH, TILE_SIZE as DEFAULT_TILE_SIZE, TOOL_ERASER } from '../../constants';
import { getElementById } from '../../elementRegistry';
import { saveMap, getMapById, MapIn } from '../../api';
import { X, CheckCircle, AlertTriangle, Cloud } from 'lucide-react';

const STORAGE_KEY = 'MARIO_MAP_DATA';

// Toast Notification Type
interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export const Editor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mapIdParam = searchParams.get('id');

  // --- State ---
  const [selectedElementId, setSelectedElementId] = useState<number | string | null>(1); // Default to Ground
  const [mapName, setMapName] = useState("my_mario_map");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPlayTesting, setIsPlayTesting] = useState(false);
  
  // Notification State
  const [toast, setToast] = useState<ToastState | null>(null);

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

  // Helper to show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      // Auto hide after 3 seconds
      setTimeout(() => {
          setToast(current => current?.id === id ? null : current);
      }, 3500);
  };

  // --- Init ---
  useEffect(() => {
    // Initialize Test Config to 90% of screen
    setTestConfig({
        width: Math.floor(window.innerWidth * 0.9),
        height: Math.floor(window.innerHeight * 0.9)
    });

    const initializeMap = async () => {
        // 1. If ID in URL, try to load from Cloud
        if (mapIdParam) {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const cloudMap = await getMapById(Number(mapIdParam), token);
                    if (cloudMap && cloudMap.map_data) {
                         const json = typeof cloudMap.map_data === 'string' ? JSON.parse(cloudMap.map_data) : cloudMap.map_data;
                         setMapData(json);
                         setLastSaved(new Date()); // Mark as fresh
                         showToast(`Map #${mapIdParam} loaded from cloud`, 'info');
                         return; // Loaded successfully, skip local storage
                    }
                } catch (e) {
                    console.error("Failed to load map from cloud ID", e);
                    showToast("Failed to load map from cloud", 'error');
                }
            }
        }

        // 2. Fallback to Local Storage if no ID or load failed
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.mapData) {
                    setMapData(parsed.mapData);
                }
                if (parsed.mapName) setMapName(parsed.mapName);
                if (parsed.lastSaved) setLastSaved(new Date(parsed.lastSaved));
            } catch (e) {
                console.error("Failed to load map from storage", e);
            }
        }
    };

    initializeMap();
  }, [mapIdParam]);

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
      showToast("Map saved to local storage!", 'success');
    } catch (e) {
      showToast("Failed to save (Storage full?)", 'error');
    }
  };

  const handleCloudSave = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          showToast("Please login to save to cloud", 'error');
          return;
      }

      const idToSave = mapIdParam ? Number(mapIdParam) : null;
      
      const payload: MapIn = {
          id: idToSave,
          map_data: JSON.stringify(mapData),
          is_public: false
      };

      // Immediate feedback for async action
      showToast("Saving to cloud...", 'info');

      try {
          const response = await saveMap(payload, token);
          
          setLastSaved(new Date());
          
          // If we created a new map, update the URL so subsequent saves are updates
          if (!idToSave && response.map_id) {
              setSearchParams({ id: response.map_id.toString() });
              showToast(`Map created! ID: ${response.map_id}`, 'success');
          } else {
              showToast("Cloud save successful!", 'success');
          }

      } catch (e: any) {
          console.error(e);
          showToast(e.message || "Cloud save failed", 'error');
      }
  };

  const handlePlayTest = () => {
      handleSaveToStorage(); // Auto-save local before playing
      setIsPlayTesting(true);
  };

  // Update map properties (width/height) while preserving data
  const handleUpdateMap = (newData: Partial<GameMap>) => {
    setMapData((prev) => {
      let updated = { ...prev, ...newData };

      // Handle Tile Size Scaling Logic
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

    // Erase Logic
    if (isRightClick || selectedElementId === TOOL_ERASER) {
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = 0;

      const pixelX = x * currentTileSize;
      const pixelY = y * currentTileSize;
      const newObjects = mapData.objects.filter(o => 
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
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = element.id;
      setMapData(prev => ({ ...prev, tiles: newTiles }));
    } else {
      let textContent: string | undefined = undefined;

      const pixelX = x * currentTileSize;
      const pixelY = y * currentTileSize;
      
      const existingObj = mapData.objects.find(o => 
          o.x === pixelX && o.y === pixelY && o.type === element.name
      );
      if (existingObj) return;

      if (element.name === 'Text Decoration') {
          if (isDrag) return;
          const input = prompt("Enter a single character:", "A");
          if (!input) return; 
          textContent = input.substring(0, 1);
      }

      const newObj: GameObjectData = {
        id: crypto.randomUUID(),
        type: element.name, 
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
    const fileName = mapName.trim() ? (mapName.endsWith('.json') ? mapName : `${mapName}.json`) : 'mario_map.json';
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Map exported to file", 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setMapData(json);
        const nameWithoutExt = file.name.replace(/\.json$/i, "");
        setMapName(nameWithoutExt);
        showToast("Map imported successfully", 'success');
      } catch (err) {
        showToast("Invalid JSON file", 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-950 text-white font-sans relative">
      {/* Toast Notification Layer */}
      {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 duration-300">
              <div className={`
                  flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border border-white/10 backdrop-blur-md
                  ${toast.type === 'success' ? 'bg-green-900/80 text-green-100' : 
                    toast.type === 'error' ? 'bg-red-900/80 text-red-100' : 
                    'bg-blue-900/80 text-blue-100'}
              `}>
                  {toast.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
                  {toast.type === 'error' && <AlertTriangle size={20} className="text-red-400" />}
                  {toast.type === 'info' && <Cloud size={20} className="text-blue-400" />}
                  <span className="font-semibold text-sm">{toast.message}</span>
              </div>
          </div>
      )}

      {/* Left: Palette */}
      <AssetPalette 
        selectedId={selectedElementId} 
        onSelect={setSelectedElementId} 
        onClearMap={handleClearMap}
      />

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-4 z-50">
             <button onClick={() => navigate('/')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded shadow border border-gray-600 flex items-center gap-2">
                <span>←</span> <span className="text-sm font-bold">Menu</span>
             </button>
             {mapIdParam && (
                 <span className="ml-4 bg-blue-900/50 text-blue-200 px-3 py-1.5 rounded text-xs border border-blue-800 font-mono shadow-sm">
                     ID: {mapIdParam}
                 </span>
             )}
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
        onCloudSave={handleCloudSave}
        onPlayTest={handlePlayTest}
        onBackgroundColorChange={handleBackgroundColorChange}
      />

      {/* Play Test Modal */}
      {isPlayTesting && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div 
                className="relative bg-black border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col" 
                style={{ width: `${testConfig.width}px`, height: `${testConfig.height}px` }}
              >
                  {/* Close Button */}
                  <button 
                    onClick={() => setIsPlayTesting(false)}
                    className="absolute top-2 right-2 z-50 bg-red-600 hover:bg-red-500 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110"
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