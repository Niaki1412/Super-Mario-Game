
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AssetPalette } from './AssetPalette';
import { PropertiesPanel } from './PropertiesPanel';
import { MapCanvas } from './MapCanvas';
import { Game } from '../Game/Game';
import { GameMap, GameObjectData, CustomImageDef } from '../../types';
import { DEFAULT_MAP_HEIGHT, DEFAULT_MAP_WIDTH, TILE_SIZE as DEFAULT_TILE_SIZE, TOOL_ERASER, TOOL_SELECT } from '../../constants';
import { getElementById } from '../../elementRegistry';
import { saveMap, getMapById, MapIn } from '../../api';
import { X, CheckCircle, AlertTriangle, Cloud, Loader2, Check, XCircle } from 'lucide-react';

const STORAGE_KEY = 'MARIO_MAP_DATA';

// Toast Notification Type
interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Cloud Save Status State
type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export const Editor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const mapIdParam = searchParams.get('id');

  // --- State ---
  const [selectedElementId, setSelectedElementId] = useState<number | string | null>(1);
  const [mapName, setMapName] = useState("my_mario_map");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPlayTesting, setIsPlayTesting] = useState(false);
  
  // Selection State
  const [selectedObject, setSelectedObject] = useState<GameObjectData | null>(null);

  // Notifications
  const [toast, setToast] = useState<ToastState | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>("");

  // Play Test Configuration
  const [testConfig, setTestConfig] = useState({ width: 800, height: 600 });

  const [mapData, setMapData] = useState<GameMap>({
    width: DEFAULT_MAP_WIDTH,
    height: DEFAULT_MAP_HEIGHT,
    tileSize: DEFAULT_TILE_SIZE,
    backgroundColor: '#5C94FC', 
    tiles: Array(DEFAULT_MAP_HEIGHT).fill(null).map(() => Array(DEFAULT_MAP_WIDTH).fill(0)),
    objects: [],
    customImages: []
  });

  // Helper to show toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
          setToast(current => current?.id === id ? null : current);
      }, 3500);
  };

  // --- Init ---
  useEffect(() => {
    setTestConfig({
        width: Math.floor(window.innerWidth * 0.9),
        height: Math.floor(window.innerHeight * 0.9)
    });

    const initializeMap = async () => {
        if (mapIdParam) {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const cloudMap = await getMapById(Number(mapIdParam), token);
                    if (cloudMap && cloudMap.map_data) {
                         const json = typeof cloudMap.map_data === 'string' ? JSON.parse(cloudMap.map_data) : cloudMap.map_data;
                         // Ensure customImages is array
                         if (!json.customImages) json.customImages = [];
                         setMapData(json);
                         setLastSaved(new Date());
                         showToast(`Map #${mapIdParam} loaded from cloud`, 'info');
                         return; 
                    }
                } catch (e) {
                    console.error("Failed to load map from cloud ID", e);
                    showToast("Failed to load map from cloud", 'error');
                }
            }
        }

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.mapData) {
                    const data = parsed.mapData;
                    if (!data.customImages) data.customImages = [];
                    setMapData(data);
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

      setSaveStatus('saving');
      setSaveErrorMessage("");

      const idToSave = mapIdParam ? Number(mapIdParam) : null;
      
      const payload: MapIn = {
          id: idToSave,
          map_data: JSON.stringify(mapData),
          is_public: false
      };

      try {
          const [response] = await Promise.all([
              saveMap(payload, token),
              new Promise(resolve => setTimeout(resolve, 1000))
          ]);
          
          setLastSaved(new Date());
          
          if (!idToSave && response.map_id) {
              setSearchParams({ id: response.map_id.toString() });
          }
          
          setSaveStatus('success');
          
          setTimeout(() => {
              setSaveStatus('idle');
          }, 1500);

      } catch (e: any) {
          console.error(e);
          setSaveStatus('error');
          setSaveErrorMessage(e.message || "Cloud save failed");
      }
  };

  const handlePlayTest = () => {
      handleSaveToStorage();
      setIsPlayTesting(true);
  };

  const handleUpdateMap = (newData: Partial<GameMap>) => {
    setMapData((prev) => {
      let updated = { ...prev, ...newData };

      if (newData.tileSize !== undefined && newData.tileSize !== prev.tileSize) {
          const scale = newData.tileSize / prev.tileSize;
          updated.objects = prev.objects.map(obj => ({
              ...obj,
              x: obj.x * scale,
              y: obj.y * scale
          }));
      }

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

  const handleUpdateObject = (id: string, newData: Partial<GameObjectData['properties']>) => {
      setMapData(prev => {
          const newObjects = prev.objects.map(obj => 
              obj.id === id ? { ...obj, properties: { ...obj.properties, ...newData } } : obj
          );
          // Also update selectedObject state immediately for UI responsiveness
          const updatedObj = newObjects.find(o => o.id === id);
          if (updatedObj) setSelectedObject(updatedObj);
          return { ...prev, objects: newObjects };
      });
  };

  const handleDeleteObject = (id: string) => {
      setMapData(prev => ({
          ...prev,
          objects: prev.objects.filter(obj => obj.id !== id)
      }));
      if (selectedObject?.id === id) setSelectedObject(null);
  };

  const handleBackgroundColorChange = (color: string) => {
      setMapData(prev => ({ ...prev, backgroundColor: color }));
  };

  // Image Upload Logic
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      Array.from(files).forEach(file => {
          const reader = new FileReader();
          reader.onload = (ev) => {
              const result = ev.target?.result as string;
              setMapData(prev => ({
                  ...prev,
                  customImages: [
                      ...(prev.customImages || []),
                      { id: crypto.randomUUID(), name: file.name, data: result }
                  ]
              }));
          };
          reader.readAsDataURL(file);
      });
  };

  const handleTileClick = useCallback((x: number, y: number, isRightClick: boolean, isDrag: boolean) => {
    if (x < 0 || y < 0 || x >= mapData.width || y >= mapData.height) return;
    
    const currentTileSize = mapData.tileSize;
    const pixelX = x * currentTileSize;
    const pixelY = y * currentTileSize;

    // --- SELECTION LOGIC ---
    if (selectedElementId === TOOL_SELECT && !isRightClick && !isDrag) {
        // Find object at this position (simple hit test center)
        // Reverse iterate to select top-most
        const clickedObj = [...mapData.objects].reverse().find(o => {
            const w = o.properties?.width || currentTileSize;
            const h = o.properties?.height || currentTileSize;
            
            // Allow selecting if object covers this tile
            return (
                pixelX >= o.x && pixelX < o.x + w &&
                pixelY >= o.y && pixelY < o.y + h
            );
        });
        
        setSelectedObject(clickedObj || null);
        return;
    }

    // --- ERASER LOGIC ---
    if (isRightClick || selectedElementId === TOOL_ERASER) {
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = 0;

      const newObjects = mapData.objects.filter(o => 
        !(o.x >= pixelX && o.x < pixelX + currentTileSize && o.y >= pixelY && o.y < pixelY + currentTileSize)
      );

      setMapData(prev => ({ ...prev, tiles: newTiles, objects: newObjects }));
      setSelectedObject(null);
      return;
    }

    if (selectedElementId === null) return;

    // --- CUSTOM IMAGE LOGIC ---
    if (typeof selectedElementId === 'string' && selectedElementId.startsWith('custom_img:')) {
        const imageId = selectedElementId.replace('custom_img:', '');
        const imageDef = mapData.customImages.find(img => img.id === imageId);
        if (!imageDef) return;

        const newObj: GameObjectData = {
            id: crypto.randomUUID(),
            type: 'CustomImage',
            x: pixelX,
            y: pixelY,
            properties: {
                customImageId: imageId,
                opacity: 1,
                scale: 1,
                width: currentTileSize * 2, // Default size 2x2 tiles
                height: currentTileSize * 2
            }
        };
        setMapData(prev => ({ ...prev, objects: [...prev.objects, newObj] }));
        return;
    }

    // --- REGULAR ELEMENT LOGIC ---
    const element = getElementById(selectedElementId);
    if (!element) return;

    if (element.type === 'tile') {
      const newTiles = [...mapData.tiles];
      newTiles[y] = [...newTiles[y]];
      newTiles[y][x] = element.id;
      setMapData(prev => ({ ...prev, tiles: newTiles }));
    } else {
      const existingObj = mapData.objects.find(o => 
          o.x === pixelX && o.y === pixelY && o.type === element.name
      );
      if (existingObj) return;

      let textContent: string | undefined = undefined;
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
      setSelectedObject(null);
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
        if (!json.customImages) json.customImages = [];
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
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-zoom-in { animation: zoom-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      {/* --- MODALS & OVERLAYS --- */}
      {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-fade-in pointer-events-none">
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

      {/* Cloud Save Modal */}
      {saveStatus !== 'idle' && (
          <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-fade-in">
             <div className="bg-gray-800 border border-gray-700 p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-w-[300px] min-h-[250px] animate-zoom-in">
                {saveStatus === 'saving' && (
                    <>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                            <Loader2 className="w-20 h-20 text-blue-500 animate-spin relative z-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Syncing...</h3>
                        <p className="text-gray-400">Uploading map data to cloud</p>
                    </>
                )}
                {saveStatus === 'success' && (
                    <>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg scale-100 animate-zoom-in">
                                <Check className="w-12 h-12 text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Saved!</h3>
                        <p className="text-gray-400">Your map is safe in the cloud.</p>
                    </>
                )}
                {saveStatus === 'error' && (
                    <>
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl"></div>
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500 shadow-lg">
                                <XCircle className="w-12 h-12 text-red-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Save Failed</h3>
                        <p className="text-red-300 text-center text-sm max-w-[250px] mb-6">{saveErrorMessage}</p>
                        <button onClick={() => setSaveStatus('idle')} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full font-bold transition-colors">Close</button>
                    </>
                )}
             </div>
          </div>
      )}

      {/* Left: Palette */}
      <AssetPalette 
        selectedId={selectedElementId} 
        customImages={mapData.customImages}
        onSelect={setSelectedElementId} 
        onClearMap={handleClearMap}
        onUploadImage={handleImageUpload}
      />

      {/* Center: Canvas */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-4 left-4 z-50">
             <button onClick={() => navigate('/')} className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded shadow border border-gray-600 flex items-center gap-2">
                <span>←</span> <span className="text-sm font-bold">Menu</span>
             </button>
             {mapIdParam && (
                 <span className="ml-4 bg-blue-900/50 text-blue-200 px-3 py-1.5 rounded text-xs border border-blue-800 font-mono shadow-sm">ID: {mapIdParam}</span>
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
        selectedObject={selectedObject}
        onTestConfigChange={setTestConfig}
        onMapNameChange={setMapName}
        onUpdateMap={handleUpdateMap}
        onUpdateObject={handleUpdateObject}
        onDeleteObject={handleDeleteObject}
        onExport={handleExport}
        onImport={handleImport}
        onSave={handleSaveToStorage}
        onCloudSave={handleCloudSave}
        onPlayTest={handlePlayTest}
        onBackgroundColorChange={handleBackgroundColorChange}
      />

      {/* Play Test Modal */}
      {isPlayTesting && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm p-4 animate-fade-in">
              <div 
                className="relative bg-black border-4 border-gray-700 rounded-lg shadow-2xl overflow-hidden flex flex-col" 
                style={{ width: `${testConfig.width}px`, height: `${testConfig.height}px` }}
              >
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
