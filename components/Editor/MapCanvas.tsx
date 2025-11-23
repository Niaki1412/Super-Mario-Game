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

        app.stage.on('pointerdown', (e) => {
            const { x, y } = getGridPos(e);
            
            // Ignore clicks on the ruler itself
            if (x < 0 || y < 0) return;
            
            const isRightClick = e.button === 2;
            onTileClickRef.current(x, y, isRightClick);
        });

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


    // --- DRAW HELPER FOR GAME ELEMENTS ---
    const drawGameElement = (type: string, x: number, y: number, w: number, h: number, color: number) => {
        // Base fill
        // Note: For some shapes we might want complex geometry, but a base rect is good for fallback.
        
        switch (type) {
            case 'Ground':
                g.rect(x, y, w, h).fill(color);
                // Top border
                g.moveTo(x, y).lineTo(x + w, y).stroke({ width: 4, color: 0x3E2723 });
                // Inner "dirt" detail
                g.moveTo(x + 4, y + 10).lineTo(x + 8, y + 6).lineTo(x + 12, y + 10).stroke({ width: 1.5, color: 0x000000, alpha: 0.2 });
                g.moveTo(x + 20, y + 20).lineTo(x + 24, y + 16).lineTo(x + 28, y + 20).stroke({ width: 1.5, color: 0x000000, alpha: 0.2 });
                break;

            case 'Brick (Breakable)':
                 g.rect(x, y, w, h).fill(color);
                 // Brick lines
                 g.moveTo(x, y + h/2).lineTo(x + w, y + h/2).stroke({ width: 2, color: 0x000000, alpha: 0.2 }); // Horiz
                 g.moveTo(x + w/2, y).lineTo(x + w/2, y + h/2).stroke({ width: 2, color: 0x000000, alpha: 0.2 }); // Vert top
                 g.moveTo(x + w/4, y + h/2).lineTo(x + w/4, y + h).stroke({ width: 2, color: 0x000000, alpha: 0.2 }); // Vert bot 1
                 g.moveTo(x + w*0.75, y + h/2).lineTo(x + w*0.75, y + h).stroke({ width: 2, color: 0x000000, alpha: 0.2 }); // Vert bot 2
                 break;

            case 'Hard Block':
                g.rect(x, y, w, h).fill(color);
                // Inner square
                g.rect(x + 4, y + 4, w - 8, h - 8).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
                // Corner Diagonals
                g.moveTo(x, y).lineTo(x + 4, y + 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
                g.moveTo(x + w, y).lineTo(x + w - 4, y + 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
                g.moveTo(x, y + h).lineTo(x + 4, y + h - 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
                g.moveTo(x + w, y + h).lineTo(x + w - 4, y + h - 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
                // Rivets
                g.circle(x + 6, y + 6, 1.5).fill({color: 0x000000, alpha: 0.3});
                g.circle(x + w - 6, y + 6, 1.5).fill({color: 0x000000, alpha: 0.3});
                g.circle(x + 6, y + h - 6, 1.5).fill({color: 0x000000, alpha: 0.3});
                g.circle(x + w - 6, y + h - 6, 1.5).fill({color: 0x000000, alpha: 0.3});
                break;

            case 'Question Block':
                g.rect(x, y, w, h).fill(color);
                // Rivets
                g.circle(x + 4, y + 4, 2).fill({ color: 0x000000, alpha: 0.2 });
                g.circle(x + w - 4, y + 4, 2).fill({ color: 0x000000, alpha: 0.2 });
                g.circle(x + 4, y + h - 4, 2).fill({ color: 0x000000, alpha: 0.2 });
                g.circle(x + w - 4, y + h - 4, 2).fill({ color: 0x000000, alpha: 0.2 });
                // Question mark text (Visual only)
                addLabel('?', x + w/2, y + h/2, 'center', 0xFFF8E1, 20, true);
                break;
            
            case 'Invisible Death Block':
                // Dashed border (simulated)
                g.rect(x+2, y+2, w-4, h-4).stroke({ width: 2, color: color }); 
                // In pixi v8, dashed lines are complex, simple rect is okay for now.
                addLabel('☠️', x + w/2, y + h/2, 'center', 0xFFFFFF, 14);
                break;

            case 'Goomba':
                // Body (Triangle/Curve approx)
                g.moveTo(x + w*0.2, y + h*0.7)
                 .quadraticCurveTo(x + w*0.5, y - h*0.1, x + w*0.8, y + h*0.7)
                 .lineTo(x + w*0.9, y + h*0.9)
                 .lineTo(x + w*0.1, y + h*0.9)
                 .fill(color);
                 // Feet
                 g.ellipse(x + w*0.3, y + h*0.95, 5, 3).fill(0x000000);
                 g.ellipse(x + w*0.7, y + h*0.95, 5, 3).fill(0x000000);
                 // Eyes
                 g.circle(x + w*0.35, y + h*0.45, 3).fill(0xFFFFFF);
                 g.circle(x + w*0.65, y + h*0.45, 3).fill(0xFFFFFF);
                 g.circle(x + w*0.37, y + h*0.45, 1).fill(0x000000);
                 g.circle(x + w*0.63, y + h*0.45, 1).fill(0x000000);
                break;
                
            case 'Coin':
                // Outer ring
                g.ellipse(x + w/2, y + h/2, w*0.3, h*0.4).fill(color).stroke({ width: 2, color: 0xF57F17 });
                // Inner shimmer
                g.ellipse(x + w/2, y + h/2, w*0.15, h*0.25).stroke({ width: 1, color: 0xFFF59D });
                break;
    
            case 'Mushroom':
                 // Cap
                 g.moveTo(x + w*0.1, y + h*0.6)
                    .quadraticCurveTo(x + w*0.5, y - h*0.2, x + w*0.9, y + h*0.6)
                    .lineTo(x + w*0.1, y + h*0.6)
                    .fill(color);
                 // Spots
                 g.circle(x + w*0.3, y + h*0.4, 3).fill(0xFFFFFF);
                 g.circle(x + w*0.7, y + h*0.4, 3).fill(0xFFFFFF);
                 g.circle(x + w*0.5, y + h*0.2, 4).fill(0xFFFFFF);
                 // Stem
                 g.rect(x + w*0.3, y + h*0.6, w*0.4, h*0.3).fill(0xFFE0B2);
                 // Eyes
                 g.circle(x + w*0.4, y + h*0.75, 1).fill(0x000000);
                 g.circle(x + w*0.6, y + h*0.75, 1).fill(0x000000);
                 break;
            
            case 'Player Start':
                // Head
                g.circle(x + w/2, y + h*0.25, 6).fill(color);
                // Body
                g.moveTo(x + w/2, y + h*0.45).lineTo(x + w/2, y + h*0.9).stroke({ width: 3, color: color });
                // Arms
                g.moveTo(x + w*0.2, y + h*0.6).lineTo(x + w*0.8, y + h*0.6).stroke({ width: 3, color: color });
                // Legs
                g.moveTo(x + w/2, y + h*0.9).lineTo(x + w*0.2, y + h).stroke({ width: 3, color: color });
                g.moveTo(x + w/2, y + h*0.9).lineTo(x + w*0.8, y + h).stroke({ width: 3, color: color });
                break;

            default:
                g.rect(x, y, w, h).fill(color);
                g.rect(x, y, w, h).stroke({ width: 2, color: 0x000000, alpha: 0.2 });
        }
    };


    // --- 3. Draw Tiles ---
    mapData.tiles.forEach((row, y) => {
      row.forEach((tileId, x) => {
        if (tileId !== 0) {
          const config = GAME_ELEMENTS.find(el => el.id === tileId);
          if (config) {
            const drawX = x * TILE_SIZE + RULER_OFFSET;
            const drawY = y * TILE_SIZE + RULER_OFFSET;
            drawGameElement(config.name, drawX, drawY, TILE_SIZE, TILE_SIZE, config.color);
          }
        }
      });
    });

    // --- 4. Draw Objects ---
    mapData.objects.forEach((obj) => {
        const config = GAME_ELEMENTS.find(el => el.name.toLowerCase() === obj.type.toLowerCase() || (el.type === 'object' && el.name === obj.type));
        
        if (config) {
            const drawX = obj.x + RULER_OFFSET;
            const drawY = obj.y + RULER_OFFSET;
            drawGameElement(config.name, drawX, drawY, TILE_SIZE, TILE_SIZE, config.color);
        }
    });

  }, [mapData, isAppReady]);

  return (
    // Changed justify-center/items-center to m-auto logic to allow scrolling to (0,0) when overflowing
    <div 
      className="flex-1 bg-gray-950 overflow-auto relative flex"
      id="editor-canvas-container"
    >
        <div className="p-10 m-auto min-w-fit min-h-fit">
             <div ref={canvasRef} className="shadow-2xl border border-gray-800" />
        </div>
    </div>
  );
};