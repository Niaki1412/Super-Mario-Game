import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap } from '../../types';
import { TILE_SIZE, GAME_ELEMENTS } from '../../constants';

interface MapCanvasProps {
  mapData: GameMap;
  selectedElementId: number | string | null;
  onTileClick: (x: number, y: number, isRightClick: boolean) => void;
  onObjectClick: (objIndex: number) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ 
  mapData, 
  selectedElementId,
  onTileClick,
  onObjectClick
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);

  // Keep a ref to the latest callback to avoid stale closures in Pixi event listeners
  const onTileClickRef = useRef(onTileClick);
  useEffect(() => {
    onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  // Initialize Pixi
  useEffect(() => {
    // Flag to track if the effect has been cleaned up (component unmounted)
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initPixi = async () => {
        // 1. Create Application
        app = new PIXI.Application();
        
        // 2. Initialize (Async)
        try {
          await app.init({
            width: mapData.width * TILE_SIZE,
            height: mapData.height * TILE_SIZE,
            backgroundColor: 0x333333, 
            backgroundAlpha: 1,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            preference: 'webgl',
          });
        } catch (error) {
          console.error("Pixi Init failed", error);
          return;
        }

        // 3. Check if we should abort because component unmounted during await
        if (!isMounted) {
            if (app) {
              await app.destroy({ removeView: true });
            }
            return;
        }

        // 4. Mount to DOM
        if (canvasRef.current) {
            // Remove any existing children just in case
            while (canvasRef.current.firstChild) {
              canvasRef.current.removeChild(canvasRef.current.firstChild);
            }
            canvasRef.current.appendChild(app.canvas);
        }

        appRef.current = app;

        // 5. Setup Scene
        const graphics = new PIXI.Graphics();
        graphicsRef.current = graphics;
        app.stage.addChild(graphics);

        // Interaction
        app.stage.eventMode = 'static';
        app.stage.hitArea = new PIXI.Rectangle(0, 0, mapData.width * TILE_SIZE, mapData.height * TILE_SIZE);

        const getGridPos = (e: PIXI.FederatedPointerEvent) => {
            const x = Math.floor(e.global.x / TILE_SIZE);
            const y = Math.floor(e.global.y / TILE_SIZE);
            return { x, y };
        };

        app.stage.on('pointerdown', (e) => {
            const { x, y } = getGridPos(e);
            const isRightClick = e.button === 2;
            onTileClickRef.current(x, y, isRightClick);
        });

        setIsAppReady(true);
    };

    initPixi();

    // Cleanup function
    return () => {
      isMounted = false;
      setIsAppReady(false);
      
      // Cleanup DOM event listeners if any
      // Cleanup Pixi App
      if (appRef.current) {
        // Destroy can be async in v8, but we generally fire and forget in cleanup 
        // unless we need to wait. For React effects, we just call it.
        appRef.current.destroy({ removeView: true });
        appRef.current = null;
        graphicsRef.current = null;
      }
    };
  }, []); // Run once on mount

  // Handle Context Menu (Right Click)
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
        const newWidth = mapData.width * TILE_SIZE;
        const newHeight = mapData.height * TILE_SIZE;
        
        if (app.renderer.width !== newWidth || app.renderer.height !== newHeight) {
            app.renderer.resize(newWidth, newHeight);
            app.stage.hitArea = new PIXI.Rectangle(0, 0, newWidth, newHeight);
        }
    }
  }, [mapData.width, mapData.height, isAppReady]);


  // Drawing Loop
  useEffect(() => {
    if (!appRef.current || !graphicsRef.current || !isAppReady) return;

    const g = graphicsRef.current;
    g.clear();

    // 1. Draw Grid
    for (let x = 0; x <= mapData.width; x++) {
      g.moveTo(x * TILE_SIZE, 0);
      g.lineTo(x * TILE_SIZE, mapData.height * TILE_SIZE);
    }
    for (let y = 0; y <= mapData.height; y++) {
      g.moveTo(0, y * TILE_SIZE);
      g.lineTo(mapData.width * TILE_SIZE, y * TILE_SIZE);
    }
    g.stroke({ width: 1, color: 0x555555, alpha: 0.5 });

    // 2. Draw Tiles
    mapData.tiles.forEach((row, y) => {
      row.forEach((tileId, x) => {
        if (tileId !== 0) {
          const config = GAME_ELEMENTS.find(el => el.id === tileId);
          if (config) {
            // Fill
            g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            g.fill(config.color);
            
            // Border
            g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            g.stroke({ width: 2, color: 0x000000, alpha: 0.2 });
          }
        }
      });
    });

    // 3. Draw Objects
    mapData.objects.forEach((obj) => {
        const config = GAME_ELEMENTS.find(el => el.name.toLowerCase() === obj.type.toLowerCase() || (el.type === 'object' && el.name === obj.type));
        
        if (config) {
            const cx = obj.x + TILE_SIZE / 2;
            const cy = obj.y + TILE_SIZE / 2;
            
            if(config.category === 'enemy') {
                 g.circle(cx, cy, TILE_SIZE / 2.5);
                 g.fill(config.color);
            } else if (config.category === 'collectible') {
                 try {
                     g.star(cx, cy, 4, TILE_SIZE / 3, TILE_SIZE/6);
                     g.fill(config.color);
                 } catch (e) {
                     // Fallback if star not available in current graphics context
                     g.circle(cx, cy, TILE_SIZE / 4);
                     g.fill(config.color);
                 }
            } else {
                 g.rect(obj.x + 4, obj.y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
                 g.fill(config.color);
            }
        }
    });

  }, [mapData, isAppReady]);

  return (
    <div 
      className="flex-1 bg-gray-950 overflow-auto relative flex items-center justify-center min-h-0"
      id="editor-canvas-container"
    >
        <div className="p-10 min-w-min">
             <div ref={canvasRef} className="shadow-2xl border border-gray-800" />
        </div>
    </div>
  );
};