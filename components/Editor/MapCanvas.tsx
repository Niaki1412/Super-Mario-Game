import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap, ElementConfig } from '../../types';
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
  const [hoverPos, setHoverPos] = useState<PIXI.Point>(new PIXI.Point());

  // Initialize Pixi
  useEffect(() => {
    if (!canvasRef.current) return;

    // cleanup previous app
    if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
    }

    const app = new PIXI.Application({
      width: mapData.width * TILE_SIZE,
      height: mapData.height * TILE_SIZE,
      backgroundColor: 0x333333, // Dark grey background for "empty" space
      backgroundAlpha: 1,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    canvasRef.current.appendChild(app.view as unknown as Node);
    appRef.current = app;

    // Create Main Graphics container
    const graphics = new PIXI.Graphics();
    graphicsRef.current = graphics;
    app.stage.addChild(graphics);

    // Interaction / Event Handling
    // Using simple pointer events on the stage
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
        onTileClick(x, y, isRightClick);
    });

    // Prevent context menu on right click in the canvas area
    canvasRef.current.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Handle Resize updates
  useEffect(() => {
    if (appRef.current && graphicsRef.current) {
        const app = appRef.current;
        const newWidth = mapData.width * TILE_SIZE;
        const newHeight = mapData.height * TILE_SIZE;
        
        if (app.renderer.width !== newWidth || app.renderer.height !== newHeight) {
            app.renderer.resize(newWidth, newHeight);
            app.stage.hitArea = new PIXI.Rectangle(0, 0, newWidth, newHeight);
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData.width, mapData.height]);


  // Drawing Loop
  useEffect(() => {
    if (!appRef.current || !graphicsRef.current) return;

    const g = graphicsRef.current;
    g.clear();

    // 1. Draw Grid
    g.lineStyle(1, 0x555555, 0.5);
    for (let x = 0; x <= mapData.width; x++) {
      g.moveTo(x * TILE_SIZE, 0);
      g.lineTo(x * TILE_SIZE, mapData.height * TILE_SIZE);
    }
    for (let y = 0; y <= mapData.height; y++) {
      g.moveTo(0, y * TILE_SIZE);
      g.lineTo(mapData.width * TILE_SIZE, y * TILE_SIZE);
    }

    // 2. Draw Tiles
    g.lineStyle(0);
    mapData.tiles.forEach((row, y) => {
      row.forEach((tileId, x) => {
        if (tileId !== 0) {
          const config = GAME_ELEMENTS.find(el => el.id === tileId);
          if (config) {
            g.beginFill(config.color);
            g.drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            g.endFill();
            
            // Add a slight border to distinguish blocks
            g.lineStyle(2, 0x000000, 0.2);
            g.drawRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            g.lineStyle(0);
          }
        }
      });
    });

    // 3. Draw Objects
    mapData.objects.forEach((obj) => {
        // Map object "type" string to the element config
        const config = GAME_ELEMENTS.find(el => el.name.toLowerCase() === obj.type.toLowerCase() || el.type === 'object' && el.name === obj.type);
        
        if (config) {
            // Objects are drawn as circles or smaller rects to distinguish from tiles
            const cx = obj.x + TILE_SIZE / 2;
            const cy = obj.y + TILE_SIZE / 2;
            
            g.beginFill(config.color);
            if(config.category === 'enemy') {
                 g.drawCircle(cx, cy, TILE_SIZE / 2.5);
            } else if (config.category === 'collectible') {
                 g.drawStar?.(cx, cy, 4, TILE_SIZE / 3, TILE_SIZE/6) || g.drawCircle(cx, cy, TILE_SIZE / 4);
            } else {
                 g.drawRect(obj.x + 4, obj.y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            }
            g.endFill();
            
            // Selection indicator (optional, not fully implemented logic here but visual placeholder)
            g.lineStyle(1, 0xFFFFFF, 0.8);
            g.drawCircle(cx, cy, TILE_SIZE / 2.5);
            g.lineStyle(0);
        }
    });

    // 4. Highlight Selected Tile/Grid (Mouse Cursor)
    // This requires tracking mouse state in the canvas, which we can add if needed.
    
  }, [mapData]); // Re-draw whenever map data changes

  return (
    <div 
      className="flex-1 bg-gray-950 overflow-auto relative flex items-center justify-center min-h-0"
      id="editor-canvas-container"
    >
        {/* The Scrollable container */}
        <div className="p-10 min-w-min">
             <div ref={canvasRef} className="shadow-2xl border border-gray-800" />
        </div>
    </div>
  );
};