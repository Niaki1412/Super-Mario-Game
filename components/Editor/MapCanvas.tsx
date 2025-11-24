
import React, { useRef, useEffect, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap } from '../../types';
import { TILE_SIZE, TOOL_ERASER } from '../../constants';
import { GAME_ELEMENTS_REGISTRY } from '../../elementRegistry';

interface MapCanvasProps {
  mapData: GameMap;
  selectedElementId: number | string | null;
  onTileClick: (x: number, y: number, isRightClick: boolean) => void;
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
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const labelsContainerRef = useRef<PIXI.Container | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);

  // Drag State
  const isPaintingRef = useRef(false);
  const lastGridPosRef = useRef<{x: number, y: number} | null>(null);

  // Keep a ref to the latest callback to avoid stale closures in Pixi event listeners
  const onTileClickRef = useRef(onTileClick);
  useEffect(() => {
    onTileClickRef.current = onTileClick;
  }, [onTileClick]);

  // Initialize Pixi
  useEffect(() => {
    let isMounted = true;
    let app: PIXI.Application | null = null;

    const initPixi = async () => {
        app = new PIXI.Application();
        
        const totalWidth = mapData.width * TILE_SIZE + RULER_OFFSET;
        const totalHeight = mapData.height * TILE_SIZE + RULER_OFFSET;

        try {
          await app.init({
            width: totalWidth,
            height: totalHeight,
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
        const graphics = new PIXI.Graphics();
        graphicsRef.current = graphics;
        app.stage.addChild(graphics);

        const labelsContainer = new PIXI.Container();
        labelsContainerRef.current = labelsContainer;
        app.stage.addChild(labelsContainer);

        // Interaction
        app.stage.eventMode = 'static';
        app.stage.hitArea = new PIXI.Rectangle(0, 0, totalWidth, totalHeight);

        const getGridPos = (e: PIXI.FederatedPointerEvent) => {
            // Adjust input coordinates by the Ruler Offset
            const adjX = e.global.x - RULER_OFFSET;
            const adjY = e.global.y - RULER_OFFSET;
            
            const x = Math.floor(adjX / TILE_SIZE);
            const y = Math.floor(adjY / TILE_SIZE);
            return { x, y };
        };

        const onPointerDown = (e: PIXI.FederatedPointerEvent) => {
            const { x, y } = getGridPos(e);
            
            // Ignore clicks on the ruler itself
            if (x < 0 || y < 0) return;
            
            isPaintingRef.current = true;
            lastGridPosRef.current = { x, y };

            const isRightClick = e.button === 2;
            onTileClickRef.current(x, y, isRightClick);
        };

        const onPointerMove = (e: PIXI.FederatedPointerEvent) => {
            if (!isPaintingRef.current) return;

            const { x, y } = getGridPos(e);
            if (x < 0 || y < 0) return;

            // Avoid triggering multiple times for the same tile
            const last = lastGridPosRef.current;
            if (last && last.x === x && last.y === y) return;

            lastGridPosRef.current = { x, y };

            // Determine if right click is held (bitmask 2)
            const isRightClick = (e.buttons & 2) === 2; 
            onTileClickRef.current(x, y, isRightClick);
        };

        const onPointerUp = () => {
            isPaintingRef.current = false;
            lastGridPosRef.current = null;
        };

        app.stage.on('pointerdown', onPointerDown);
        app.stage.on('pointermove', onPointerMove);
        app.stage.on('pointerup', onPointerUp);
        app.stage.on('pointerupoutside', onPointerUp);

        setIsAppReady(true);
    };

    initPixi();

    return () => {
      isMounted = false;
      setIsAppReady(false);
      
      if (appRef.current) {
        appRef.current.destroy({ removeView: true });
        appRef.current = null;
        graphicsRef.current = null;
        labelsContainerRef.current = null;
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
        const newWidth = mapData.width * TILE_SIZE + RULER_OFFSET;
        const newHeight = mapData.height * TILE_SIZE + RULER_OFFSET;
        
        if (app.renderer.width !== newWidth || app.renderer.height !== newHeight) {
            app.renderer.resize(newWidth, newHeight);
            app.stage.hitArea = new PIXI.Rectangle(0, 0, newWidth, newHeight);
        }
    }
  }, [mapData.width, mapData.height, isAppReady]);


  // Drawing Loop
  useEffect(() => {
    if (!appRef.current || !graphicsRef.current || !labelsContainerRef.current || !isAppReady) return;

    const g = graphicsRef.current;
    const labels = labelsContainerRef.current;

    g.clear();
    // Clear previous text labels
    labels.removeChildren(); 

    // Helper to draw text
    const addLabel = (text: string, x: number, y: number, align: 'center' | 'right' = 'center', color = 0x999999, size = 10, bold = false) => {
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
        labels.addChild(t);
    };

    // --- 1. Draw Ruler Background ---
    g.rect(0, 0, mapData.width * TILE_SIZE + RULER_OFFSET, RULER_OFFSET).fill(0x1a1a1a); // Top
    g.rect(0, 0, RULER_OFFSET, mapData.height * TILE_SIZE + RULER_OFFSET).fill(0x1a1a1a); // Left
    
    // --- 2. Draw Grid & Labels ---
    
    // Vertical Lines & Top Labels
    for (let x = 0; x <= mapData.width; x++) {
      const xPos = x * TILE_SIZE + RULER_OFFSET;
      g.moveTo(xPos, RULER_OFFSET);
      g.lineTo(xPos, mapData.height * TILE_SIZE + RULER_OFFSET);
      
      // Draw label (skip last line for label if it matches width exactly)
      if (x < mapData.width) {
          addLabel(`${x}`, xPos + TILE_SIZE/2, RULER_OFFSET / 2);
      }
    }

    // Horizontal Lines & Left Labels
    for (let y = 0; y <= mapData.height; y++) {
      const yPos = y * TILE_SIZE + RULER_OFFSET;
      g.moveTo(RULER_OFFSET, yPos);
      g.lineTo(mapData.width * TILE_SIZE + RULER_OFFSET, yPos);

      // Draw label
      if (y < mapData.height) {
          addLabel(`${y}`, RULER_OFFSET / 2, yPos + TILE_SIZE/2);
      }
    }
    g.stroke({ width: 1, color: 0x555555, alpha: 0.5 });


    // --- 3. Draw Tiles ---
    mapData.tiles.forEach((row, y) => {
      row.forEach((tileId, x) => {
        if (tileId !== 0) {
          const config = GAME_ELEMENTS_REGISTRY.find(el => el.id === tileId);
          if (config) {
            const drawX = x * TILE_SIZE + RULER_OFFSET;
            const drawY = y * TILE_SIZE + RULER_OFFSET;
            config.renderPixi(g, labels, drawX, drawY, TILE_SIZE, TILE_SIZE);
          }
        }
      });
    });

    // --- 4. Draw Objects ---
    mapData.objects.forEach((obj) => {
        const config = GAME_ELEMENTS_REGISTRY.find(el => el.name.toLowerCase() === obj.type.toLowerCase() || (el.type === 'object' && el.name === obj.type));
        
        if (config) {
            const drawX = obj.x + RULER_OFFSET;
            const drawY = obj.y + RULER_OFFSET;
            // Pass the object data as the 7th argument
            config.renderPixi(g, labels, drawX, drawY, TILE_SIZE, TILE_SIZE, obj);
        }
    });

  }, [mapData, isAppReady]);

  // Determine cursor style based on tool
  const getCursorStyle = () => {
      if (selectedElementId === TOOL_ERASER) return 'cursor-[url(https://www.google.com/url?sa=i&url=https%3A%2F%2Ficon-icons.com%2Ficon%2Feraser%2F112674&psig=AOvVaw0_..._nope_just_use_class)] cursor-crosshair';
      if (selectedElementId) return 'cursor-pointer';
      return 'cursor-default';
  };

  return (
    // Changed justify-center/items-center to m-auto logic to allow scrolling to (0,0) when overflowing
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
