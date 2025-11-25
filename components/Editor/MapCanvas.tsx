
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
  const staticGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const staticLabelsRef = useRef<PIXI.Container | null>(null);
  const dynamicGraphicsRef = useRef<PIXI.Graphics | null>(null);
  const dynamicLabelsRef = useRef<PIXI.Container | null>(null);

  const [isAppReady, setIsAppReady] = useState(false);

  // Drag State
  const isPaintingRef = useRef(false);
  const lastGridPosRef = useRef<{x: number, y: number} | null>(null);

  // Keep a ref to the latest callback to avoid stale closures in Pixi event listeners
  const onTileClickRef = useRef(onTileClick);
  useEffect(() => {
    onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  // Keep ref to mapData for the ticker (for objects)
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

        // Setup Scene Layers
        // 1. Static Layer (Grid, Ruler, Tiles) - Drawn only on change
        const staticG = new PIXI.Graphics();
        staticGraphicsRef.current = staticG;
        app.stage.addChild(staticG);

        const staticL = new PIXI.Container();
        staticLabelsRef.current = staticL;
        app.stage.addChild(staticL);

        // 2. Dynamic Layer (Objects, Animations) - Drawn every frame
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
            // Use current map data directly here if possible, or ref
            const currentTS = mapDataRef.current.tileSize;
            const x = Math.floor(adjX / currentTS);
            const y = Math.floor(adjY / currentTS);
            return { x, y };
        };

        const onPointerDown = (e: PIXI.FederatedPointerEvent) => {
            const { x, y } = getGridPos(e);
            if (x < 0 || y < 0) return;
            
            isPaintingRef.current = true;
            lastGridPosRef.current = { x, y };

            const isRightClick = e.button === 2;
            onTileClickRef.current(x, y, isRightClick, false);
        };

        const onPointerMove = (e: PIXI.FederatedPointerEvent) => {
            if (!isPaintingRef.current) return;
            const { x, y } = getGridPos(e);
            if (x < 0 || y < 0) return;

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

        // Add Rendering Loop for DYNAMIC objects only
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
        staticGraphicsRef.current = null;
        staticLabelsRef.current = null;
        dynamicGraphicsRef.current = null;
        dynamicLabelsRef.current = null;
      }
    };
  }, []); // Run once on mount

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

  // Helper to draw text
  const addLabel = (container: PIXI.Container, text: string, x: number, y: number, align: 'center' | 'right' = 'center', color = 0x999999, size = 10, bold = false) => {
    const t = new PIXI.Text({
        text,
        style: {
            fontFamily: 'Arial',
            fontSize: size,
            fontWeight: bold ? 'bold' : 'normal',
            fill: color,
            align: align
        }
    });
    t.x = x;
    t.y = y;
    t.anchor.set(align === 'center' ? 0.5 : 1, 0.5);
    container.addChild(t);
  };

  // 1. Draw Static Layer (Grid, Ruler, Tiles)
  // This is called via useEffect whenever map structure changes, NOT every frame.
  const drawStatic = () => {
      if (!staticGraphicsRef.current || !staticLabelsRef.current) return;
      
      const g = staticGraphicsRef.current;
      const labels = staticLabelsRef.current;
      const tileSize = mapData.tileSize;
      
      g.clear();
      
      // Destroy old labels to free memory
      const oldLabels = labels.removeChildren();
      for (const child of oldLabels) {
          child.destroy({ texture: true, children: true });
      }

      // --- Draw Ruler Background ---
      g.rect(0, 0, mapData.width * tileSize + RULER_OFFSET, RULER_OFFSET).fill(0x1a1a1a);
      g.rect(0, 0, RULER_OFFSET, mapData.height * tileSize + RULER_OFFSET).fill(0x1a1a1a);
      
      // --- Draw Grid & Labels ---
      // Vertical
      for (let x = 0; x <= mapData.width; x++) {
        const xPos = x * tileSize + RULER_OFFSET;
        g.moveTo(xPos, RULER_OFFSET);
        g.lineTo(xPos, mapData.height * tileSize + RULER_OFFSET);
        if (x < mapData.width) {
            // Draw coordinate every 1 or 5 steps depending on density? For now all
            addLabel(labels, `${x}`, xPos + tileSize/2, RULER_OFFSET / 2);
        }
      }
      // Horizontal
      for (let y = 0; y <= mapData.height; y++) {
        const yPos = y * tileSize + RULER_OFFSET;
        g.moveTo(RULER_OFFSET, yPos);
        g.lineTo(mapData.width * tileSize + RULER_OFFSET, yPos);
        if (y < mapData.height) {
            addLabel(labels, `${y}`, RULER_OFFSET / 2, yPos + tileSize/2);
        }
      }
      g.stroke({ width: 1, color: 0x555555, alpha: 0.5 });

      // --- Draw Tiles ---
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

  // 2. Draw Dynamic Layer (Objects)
  // This is called every frame by the ticker to support animations (Cloud, etc.)
  const drawDynamicLoop = () => {
    if (!dynamicGraphicsRef.current || !dynamicLabelsRef.current) return;

    const g = dynamicGraphicsRef.current;
    const labels = dynamicLabelsRef.current;
    const currentMap = mapDataRef.current;
    const tileSize = currentMap.tileSize;

    g.clear();
    
    // Destroy old dynamic labels (e.g., text decorations)
    const oldLabels = labels.removeChildren();
    for (const child of oldLabels) {
        child.destroy({ texture: true, children: true });
    }

    // --- Draw Objects ---
    currentMap.objects.forEach((obj) => {
        const config = GAME_ELEMENTS_REGISTRY.find(el => el.name.toLowerCase() === obj.type.toLowerCase() || (el.type === 'object' && el.name === obj.type));
        
        if (config) {
            const drawX = obj.x + RULER_OFFSET;
            const drawY = obj.y + RULER_OFFSET;
            // Ensure size matches map tile size
            config.renderPixi(g, labels, drawX, drawY, tileSize, tileSize, obj);
        }
    });
  };

  // Trigger Static Redraw when map structure changes
  useEffect(() => {
      if (isAppReady) {
          drawStatic();
      }
  }, [mapData.tiles, mapData.width, mapData.height, mapData.tileSize, isAppReady]);


  const getCursorStyle = () => {
      if (selectedElementId === TOOL_ERASER) return 'cursor-[url(https://www.google.com/url?sa=i&url=https%3A%2F%2Ficon-icons.com%2Ficon%2Feraser%2F112674&psig=AOvVaw0_..._nope_just_use_class)] cursor-crosshair';
      if (selectedElementId) return 'cursor-pointer';
      return 'cursor-default';
  };

  return (
    <div 
      className="flex-1 bg-gray-950 overflow-auto relative flex"
      id="editor-canvas-container"
    >
        <div className="p-10 m-auto min-w-fit min-h-fit">
             <div 
                ref={canvasRef} 
                className={`shadow-2xl border border-gray-800 transition-all ${selectedElementId === TOOL_ERASER ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                title={selectedElementId === TOOL_ERASER ? 'Eraser Tool' : 'Paint'}
             />
        </div>
    </div>
  );
};
