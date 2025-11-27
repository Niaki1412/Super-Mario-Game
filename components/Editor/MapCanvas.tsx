
import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap } from '../../types';
import { TOOL_ERASER } from '../../constants';
import { GAME_ELEMENTS_REGISTRY } from '../../elementRegistry';

interface MapCanvasProps {
  mapData: GameMap;
  selectedElementId: number | string | null;
  onTileClick: (x: number, y: number, isRightClick: boolean, isDrag: boolean) => void;
  onObjectClick: (objIndex: number) => void;
}

const RULER_OFFSET = 25; // Width of the ruler bar in pixels

export const MapCanvas: React.FC<MapCanvasProps> = ({ 
  mapData, 
  selectedElementId,
  onTileClick,
  onObjectClick
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  
  // Layer Refs
  const customImagesContainerRef = useRef<PIXI.Container | null>(null);
  const staticGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const staticLabelsRef = useRef<PIXI.Container | null>(null);
  const dynamicGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const dynamicLabelsRef = useRef<PIXI.Container | null>(null);

  const [isAppReady, setIsAppReady] = useState(false);
  
  // Texture Cache to prevent PixiJS warnings and ensure loading
  const textureCache = useRef<Map<string, PIXI.Texture>>(new Map());

  // Drag State
  const isPaintingRef = useRef(false);
  const lastGridPosRef = useRef<{x: number, y: number} | null>(null);

  // Keep a ref to the latest callback to avoid stale closures in Pixi event listeners
  const onTileClickRef = useRef(onTileClick);
  useEffect(() => {
    onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  // Keep ref to mapData for the ticker
  const mapDataRef = useRef(mapData);
  useEffect(() => {
    mapDataRef.current = mapData;
  }, [mapData]);

  // Update background color when it changes
  useEffect(() => {
      if (appRef.current && isAppReady) {
          appRef.current.renderer.background.color = mapData.backgroundColor;
      }
  }, [mapData.backgroundColor, isAppReady]);

  // --- PRELOAD CUSTOM IMAGES ---
  useEffect(() => {
      if (!mapData.customImages) return;

      const loadTextures = async () => {
          for (const img of mapData.customImages) {
              // If not already cached
              if (!textureCache.current.has(img.id)) {
                  try {
                      // Check if Pixi's global cache has it (by URL)
                      if (PIXI.Assets.cache.has(img.data)) {
                          textureCache.current.set(img.id, PIXI.Assets.get(img.data));
                      } else {
                          // Load it explicitly
                          const texture = await PIXI.Assets.load(img.data);
                          textureCache.current.set(img.id, texture);
                      }
                  } catch (e) {
                      console.warn(`Failed to load texture for ${img.name}:`, e);
                  }
              }
          }
      };
      
      loadTextures();
  }, [mapData.customImages]);

  // Initialize Pixi
  useEffect(() => {
    let isMounted = true;
    let app: PIXI.Application | null = null;
    
    // Dynamic tile size
    const tileSize = mapData.tileSize;

    const initPixi = async () => {
        app = new PIXI.Application();
        
        const totalWidth = mapData.width * tileSize + RULER_OFFSET;
        const totalHeight = mapData.height * tileSize + RULER_OFFSET;

        try {
          await app.init({
            width: totalWidth,
            height: totalHeight,
            backgroundColor: mapData.backgroundColor || 0x333333, 
            backgroundAlpha: 1,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            preference: 'webgl',
          });
        } catch (error) {
          console.error("Pixi Init failed", error);
          return;
        }

        if (!isMounted) {
            if (app) {
              await app.destroy({ removeView: true });
            }
            return;
        }

        if (canvasRef.current) {
            while (canvasRef.current.firstChild) {
              canvasRef.current.removeChild(canvasRef.current.firstChild);
            }
            canvasRef.current.appendChild(app.canvas);
        }

        appRef.current = app;

        // Setup Scene Layers (Order matters)
        
        // 0. Custom Images Layer (Below grid)
        const customImgL = new PIXI.Container();
        customImagesContainerRef.current = customImgL;
        app.stage.addChild(customImgL);

        // 1. Static Layer (Grid, Ruler, Tiles)
        const staticG = new PIXI.Graphics();
        staticGraphicsRef.current = staticG;
        app.stage.addChild(staticG);

        const staticL = new PIXI.Container();
        staticLabelsRef.current = staticL;
        app.stage.addChild(staticL);

        // 2. Dynamic Layer (Objects, Animations)
        const dynamicG = new PIXI.Graphics();
        dynamicGraphicsRef.current = dynamicG;
        app.stage.addChild(dynamicG);

        const dynamicL = new PIXI.Container();
        dynamicLabelsRef.current = dynamicL;
        app.stage.addChild(dynamicL);

        // Interaction
        app.stage.eventMode = 'static';
        app.stage.hitArea = new PIXI.Rectangle(0, 0, totalWidth, totalHeight);

        const getGridPos = (e: PIXI.FederatedPointerEvent) => {
            const adjX = e.global.x - RULER_OFFSET;
            const adjY = e.global.y - RULER_OFFSET;
            // Use current map data directly here if possible
            const currentTS = mapDataRef.current.tileSize;
            const x = Math.floor(adjX / currentTS);
            const y = Math.floor(adjY / currentTS);
            return { x, y };
        };

        const onPointerDown = (e: PIXI.FederatedPointerEvent) => {
            const { x, y } = getGridPos(e);
            
            isPaintingRef.current = true;
            lastGridPosRef.current = { x, y };

            const isRightClick = e.button === 2;
            onTileClickRef.current(x, y, isRightClick, false);
        };

        const onPointerMove = (e: PIXI.FederatedPointerEvent) => {
            if (!isPaintingRef.current) return;
            const { x, y } = getGridPos(e);

            const last = lastGridPosRef.current;
            if (last && last.x === x && last.y === y) return;

            lastGridPosRef.current = { x, y };
            const isRightClick = (e.buttons & 2) === 2; 
            onTileClickRef.current(x, y, isRightClick, true);
        };

        const onPointerUp = () => {
            isPaintingRef.current = false;
            lastGridPosRef.current = null;
        };

        app.stage.on('pointerdown', onPointerDown);
        app.stage.on('pointermove', onPointerMove);
        app.stage.on('pointerup', onPointerUp);
        app.stage.on('pointerupoutside', onPointerUp);

        // Add Rendering Loop
        app.ticker.add(drawDynamicLoop);

        setIsAppReady(true);
    };

    initPixi();

    return () => {
      isMounted = false;
      setIsAppReady(false);
      
      if (appRef.current) {
        appRef.current.ticker.remove(drawDynamicLoop);
        appRef.current.destroy({ removeView: true });
        appRef.current = null;
      }
    };
  }, []); 

  // Handle Context Menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const currentCanvas = canvasRef.current;
    if (currentCanvas) {
        currentCanvas.addEventListener('contextmenu', handleContextMenu);
    }
    return () => {
        if (currentCanvas) {
            currentCanvas.removeEventListener('contextmenu', handleContextMenu);
        }
    };
  }, []);

  // Handle Resize updates
  useEffect(() => {
    if (appRef.current && isAppReady) {
        const app = appRef.current;
        const tileSize = mapData.tileSize;
        const newWidth = mapData.width * tileSize + RULER_OFFSET;
        const newHeight = mapData.height * tileSize + RULER_OFFSET;
        
        if (app.renderer.width !== newWidth || app.renderer.height !== newHeight) {
            app.renderer.resize(newWidth, newHeight);
            app.stage.hitArea = new PIXI.Rectangle(0, 0, newWidth, newHeight);
        }
    }
  }, [mapData.width, mapData.height, mapData.tileSize, isAppReady]);


  // --- RENDERING LOGIC ---

  // 1. Draw Static Layer
  const drawStatic = () => {
      if (!staticGraphicsRef.current || !staticLabelsRef.current) return;
      
      const g = staticGraphicsRef.current;
      const labels = staticLabelsRef.current;
      const tileSize = mapData.tileSize;
      
      g.clear();
      labels.removeChildren().forEach(c => c.destroy({ texture: true }));

      // Ruler Bg
      g.rect(0, 0, mapData.width * tileSize + RULER_OFFSET, RULER_OFFSET).fill(0x1a1a1a);
      g.rect(0, 0, RULER_OFFSET, mapData.height * tileSize + RULER_OFFSET).fill(0x1a1a1a);
      
      // Grid & Labels
      for (let x = 0; x <= mapData.width; x++) {
        const xPos = x * tileSize + RULER_OFFSET;
        g.moveTo(xPos, RULER_OFFSET).lineTo(xPos, mapData.height * tileSize + RULER_OFFSET);
        if (x < mapData.width) addLabel(labels, `${x}`, xPos + tileSize/2, RULER_OFFSET / 2);
      }
      for (let y = 0; y <= mapData.height; y++) {
        const yPos = y * tileSize + RULER_OFFSET;
        g.moveTo(RULER_OFFSET, yPos).lineTo(mapData.width * tileSize + RULER_OFFSET, yPos);
        if (y < mapData.height) addLabel(labels, `${y}`, RULER_OFFSET / 2, yPos + tileSize/2);
      }
      g.stroke({ width: 1, color: 0x555555, alpha: 0.5 });

      // Tiles
      mapData.tiles.forEach((row, y) => {
        row.forEach((tileId, x) => {
          if (tileId !== 0) {
            const config = GAME_ELEMENTS_REGISTRY.find(el => el.id === tileId);
            if (config) {
              const drawX = x * tileSize + RULER_OFFSET;
              const drawY = y * tileSize + RULER_OFFSET;
              config.renderPixi(g, labels, drawX, drawY, tileSize, tileSize);
            }
          }
        });
      });
  };

  // Helper
  const addLabel = (container: PIXI.Container, text: string, x: number, y: number, align: 'center' | 'right' = 'center', color = 0x999999, size = 10) => {
    const t = new PIXI.Text({
        text,
        style: { fontFamily: 'Arial', fontSize: size, fill: color, align: align }
    });
    t.x = x; t.y = y; t.anchor.set(align === 'center' ? 0.5 : 1, 0.5);
    container.addChild(t);
  };

  // 2. Draw Dynamic Loop
  const drawDynamicLoop = () => {
    const g = dynamicGraphicsRef.current;
    const labels = dynamicLabelsRef.current;
    const customImgContainer = customImagesContainerRef.current;
    const currentMap = mapDataRef.current;
    const tileSize = currentMap.tileSize;

    if (!g || !labels || !customImgContainer) return;

    g.clear();
    labels.removeChildren().forEach(c => c.destroy({ texture: true }));
    // Clear custom images to redraw them based on map state. 
    // Optimization: could be smarter, but this ensures updates sync with properties.
    customImgContainer.removeChildren().forEach(c => c.destroy());

    // Draw Objects
    currentMap.objects.forEach((obj) => {
        const drawX = obj.x + RULER_OFFSET;
        const drawY = obj.y + RULER_OFFSET;

        if (obj.type === 'CustomImage') {
            const imgId = obj.properties?.customImageId;
            // Only draw if texture is available in cache
            if (imgId && textureCache.current.has(imgId)) {
                const texture = textureCache.current.get(imgId)!;
                const sprite = new PIXI.Sprite(texture);
                sprite.x = drawX;
                sprite.y = drawY;
                sprite.alpha = obj.properties?.opacity ?? 1;
                sprite.scale.set(obj.properties?.scale ?? 1);
                customImgContainer.addChild(sprite);
            }
        } else {
            const config = GAME_ELEMENTS_REGISTRY.find(el => el.name.toLowerCase() === obj.type.toLowerCase() || (el.type === 'object' && el.name === obj.type));
            if (config) {
                config.renderPixi(g, labels, drawX, drawY, tileSize, tileSize, obj);
            }
        }
    });
  };

  // Trigger Static Redraw
  useEffect(() => {
      if (isAppReady) {
          drawStatic();
      }
  }, [mapData.tiles, mapData.width, mapData.height, mapData.tileSize, isAppReady]);

  return (
    <div 
      className="flex-1 bg-gray-950 overflow-auto relative flex"
      id="editor-canvas-container"
    >
        <div className="p-10 m-auto min-w-fit min-h-fit">
             <div 
                ref={canvasRef} 
                className={`shadow-2xl border border-gray-800 transition-all ${selectedElementId === TOOL_ERASER ? 'cursor-not-allowed' : 'cursor-pointer'}`}
             />
        </div>
    </div>
  );
};
