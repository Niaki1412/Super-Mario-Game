import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap, Entity, Particle } from '../../types';
import { 
    TILE_SIZE, 
    GRAVITY, 
    JUMP_FORCE, 
    MOVE_SPEED, 
    FRICTION, 
    ACCELERATION, 
    getElementByName, 
    GAME_ELEMENTS,
    TERMINAL_VELOCITY,
    getElementById
} from '../../constants';

interface GameProps {
  mapData: GameMap | null;
  onExit: () => void;
}

export const Game: React.FC<GameProps> = ({ mapData: initialMapData, onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  
  // Game State Refs (for Loop)
  const mapRef = useRef<GameMap | null>(initialMapData);
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const isWonRef = useRef(false);

  // React State for UI Overlay
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentMap, setCurrentMap] = useState<GameMap | null>(initialMapData);

  // --- HELPERS ---

  const checkRectCollision = (r1: {x:number, y:number, w:number, h:number}, r2: {x:number, y:number, w:number, h:number}) => {
    return (
        r1.x < r2.x + r2.w &&
        r1.x + r1.w > r2.x &&
        r1.y < r2.y + r2.h &&
        r1.y + r1.h > r2.y
    );
  };

  const getTileAt = (x: number, y: number, map: GameMap) => {
    const tx = Math.floor(x / TILE_SIZE);
    const ty = Math.floor(y / TILE_SIZE);
    
    if (ty < 0 || ty >= map.height || tx < 0 || tx >= map.width) return 0;
    return map.tiles[ty][tx];
  };

  const isSolid = (tileId: number) => {
      if (tileId === 0) return false;
      const el = GAME_ELEMENTS.find(e => e.id === tileId);
      return el?.attributes?.solid || false;
  };
  
  const isLethalTile = (tileId: number) => {
      if (tileId === 0) return false;
      const el = GAME_ELEMENTS.find(e => e.id === tileId);
      return el?.attributes?.lethal || false;
  };

  // --- INITIALIZATION ---

  useEffect(() => {
    // If no map loaded, wait for import
    if (!currentMap) return;

    let app: PIXI.Application;
    
    const initGame = async () => {
        app = new PIXI.Application();
        // Full screen canvas
        await app.init({
            resizeTo: window,
            backgroundColor: currentMap.backgroundColor || '#5C94FC',
            preference: 'webgl'
        });

        if (containerRef.current) {
            containerRef.current.appendChild(app.canvas);
        }
        appRef.current = app;

        // Reset State
        mapRef.current = currentMap;
        scoreRef.current = 0;
        setScore(0);
        isGameOverRef.current = false;
        setGameOver(false);
        isWonRef.current = false;
        setGameWon(false);
        particlesRef.current = [];

        // Parse Objects & Create Entities
        const newEntities: Entity[] = [];
        
        // Find Player Start or default
        let startX = 100;
        let startY = 100;
        const playerStart = currentMap.objects.find(o => o.type === 'Player Start');
        if (playerStart) {
            startX = playerStart.x;
            startY = playerStart.y;
        }

        // Create Player
        newEntities.push({
            id: 'player',
            type: 'player',
            x: startX,
            y: startY,
            w: TILE_SIZE * 0.8, // Slightly smaller hitbox
            h: TILE_SIZE * 0.9,
            vx: 0,
            vy: 0,
            isDead: false,
            grounded: false,
            isPlayer: true
        });

        // Create Enemies & Items
        currentMap.objects.forEach(obj => {
            if (obj.type === 'Player Start') return;
            const config = getElementByName(obj.type);
            if (!config) return;

            newEntities.push({
                id: obj.id,
                type: obj.type,
                x: obj.x,
                y: obj.y,
                w: TILE_SIZE,
                h: TILE_SIZE,
                vx: config.category === 'enemy' ? -1 : 0, // Enemies start moving left
                vy: 0,
                isDead: false,
                grounded: false,
                isEnemy: config.category === 'enemy',
                isCollectible: config.category === 'collectible',
                patrolCenter: obj.x
            });
        });

        entitiesRef.current = newEntities;

        // --- GAME LOOP ---
        app.ticker.add((ticker) => {
            if (isGameOverRef.current || isWonRef.current || !mapRef.current) return;
            const delta = ticker.deltaTime; // Normalized to 1 at 60fps

            updatePhysics(delta);
            render(app);
        });
    };

    initGame();

    return () => {
        if (appRef.current) {
            appRef.current.destroy({ removeView: true });
        }
    };
  }, [currentMap]);


  // --- PHYSICS ENGINE ---

  const updatePhysics = (delta: number) => {
      const map = mapRef.current!;
      const entities = entitiesRef.current;
      const keys = keysRef.current;

      // Filter dead entities (except player, handled separately)
      entitiesRef.current = entities.filter(e => !e.isDead || e.isPlayer);
      
      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.vy += 0.2 * delta; // particle gravity
          p.life -= delta;
          if (p.life <= 0) particlesRef.current.splice(i, 1);
      }

      entitiesRef.current.forEach(entity => {
          if (entity.isDead && !entity.isPlayer) return;

          // 1. Apply Gravity
          entity.vy += GRAVITY * delta;
          if (entity.vy > TERMINAL_VELOCITY) entity.vy = TERMINAL_VELOCITY;

          // 2. Control (Player)
          if (entity.isPlayer && !entity.isDead) {
              if (keys['ArrowLeft']) {
                  entity.vx -= ACCELERATION * delta;
              } else if (keys['ArrowRight']) {
                  entity.vx += ACCELERATION * delta;
              } else {
                  entity.vx *= FRICTION;
              }

              // Jump
              if (keys[' '] && entity.grounded) {
                  entity.vy = JUMP_FORCE;
                  entity.grounded = false;
              }

              // Clamp Speed
              if (entity.vx > MOVE_SPEED) entity.vx = MOVE_SPEED;
              if (entity.vx < -MOVE_SPEED) entity.vx = -MOVE_SPEED;

              // Check Death fall
              if (entity.y > map.height * TILE_SIZE) {
                  die();
              }
          }

          // 3. AI Movement
          if (entity.isEnemy) {
               // Simple patrol: turn around on walls
               // Check next tile floor? (Optional, skipping for now)
          }


          // 4. Movement & Tile Collision (X Axis)
          entity.x += entity.vx * delta;
          handleTileCollision(entity, map, 'x');

          // 5. Movement & Tile Collision (Y Axis)
          entity.grounded = false; // Assume in air until proven grounded
          entity.y += entity.vy * delta;
          handleTileCollision(entity, map, 'y');

          // 6. Entity vs Entity Collision (Player vs World)
          if (entity.isPlayer && !entity.isDead) {
              entities.forEach(other => {
                  if (entity === other || other.isDead) return;

                  if (checkRectCollision(entity, other)) {
                      if (other.isEnemy) {
                          // Jump on top?
                          // Player bottom < Enemy Center Y (approx) and Player falling
                          if (entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.5) {
                              // Kill Enemy
                              other.isDead = true;
                              entity.vy = JUMP_FORCE * 0.5; // Bounce
                              addScore(100);
                              spawnParticles(other.x, other.y, 0xA0522D);
                          } else {
                              // Kill Player
                              die();
                          }
                      } else if (other.isCollectible) {
                          // Collect
                          other.isDead = true;
                          const config = getElementByName(other.type);
                          if (config?.attributes?.points) addScore(config.attributes.points);
                          // Effect
                          if (other.type === 'Mushroom') {
                              // Grow logic (todo)
                          }
                      }
                  }
              });
          }
      });
  };

  const handleTileCollision = (entity: Entity, map: GameMap, axis: 'x' | 'y') => {
      // Calculate entity bounds in grid coords
      const startX = Math.floor(entity.x / TILE_SIZE);
      const endX = Math.floor((entity.x + entity.w - 0.01) / TILE_SIZE);
      const startY = Math.floor(entity.y / TILE_SIZE);
      const endY = Math.floor((entity.y + entity.h - 0.01) / TILE_SIZE);

      for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
              const tileId = getTileAt(x * TILE_SIZE, y * TILE_SIZE, map);
              
              if (isLethalTile(tileId) && entity.isPlayer) {
                  die();
                  return;
              }

              if (isSolid(tileId)) {
                  const tileRect = { x: x * TILE_SIZE, y: y * TILE_SIZE, w: TILE_SIZE, h: TILE_SIZE };
                  
                  if (axis === 'x') {
                      if (entity.vx > 0) {
                          // Moving Right
                          entity.x = tileRect.x - entity.w;
                          entity.vx = entity.isEnemy ? -entity.vx : 0; // Enemies turn
                      } else if (entity.vx < 0) {
                          // Moving Left
                          entity.x = tileRect.x + tileRect.w;
                          entity.vx = entity.isEnemy ? -entity.vx : 0;
                      }
                  } else {
                      if (entity.vy > 0) {
                          // Falling down
                          entity.y = tileRect.y - entity.h;
                          entity.vy = 0;
                          entity.grounded = true;
                      } else if (entity.vy < 0) {
                          // Jumping up
                          entity.y = tileRect.y + tileRect.h;
                          entity.vy = 0;
                          
                          // Handle Destructible Bricks
                          const el = getElementById(tileId);
                          if (el?.attributes?.destructible && entity.isPlayer) {
                              map.tiles[y][x] = 0; // Destroy
                              addScore(10);
                              spawnParticles(tileRect.x, tileRect.y, el.color);
                          }
                      }
                  }
                  return; // Resolved one collision is enough per axis step usually
              }
          }
      }
  };

  const die = () => {
      if (isGameOverRef.current) return;
      isGameOverRef.current = true;
      setGameOver(true);
      // Simple jump animation
      const player = entitiesRef.current.find(e => e.isPlayer);
      if (player) {
          player.vy = JUMP_FORCE;
          player.isDead = true; 
      }
  };

  const addScore = (amount: number) => {
      scoreRef.current += amount;
      setScore(scoreRef.current);
  };

  const spawnParticles = (x: number, y: number, color: number) => {
      for(let i=0; i<5; i++) {
          particlesRef.current.push({
              x: x + TILE_SIZE/2,
              y: y + TILE_SIZE/2,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 1) * 5,
              color: color,
              life: 60
          });
      }
  };


  // --- RENDERING ---

  const render = (app: PIXI.Application) => {
      // Lazy approach: Clear and Redraw everything every frame (using Graphics).
      // For a real game, use Sprites and Containers.
      
      const g = app.stage.children[0] as PIXI.Graphics || new PIXI.Graphics();
      if (!app.stage.children.includes(g)) app.stage.addChild(g);

      g.clear();

      // Camera Follow
      const player = entitiesRef.current.find(e => e.isPlayer);
      let cameraX = 0;
      if (player) {
          cameraX = Math.max(0, player.x - window.innerWidth / 2);
          // Clamp to map end
          const maxCam = (mapRef.current!.width * TILE_SIZE) - window.innerWidth;
          if (cameraX > maxCam) cameraX = Math.max(0, maxCam);
      }
      
      app.stage.position.x = -cameraX;

      // Draw Map Tiles (Only visible ones optimization is implied by Pixi culling if using sprites, here we draw all or range)
      // optimization: Draw only visible range
      const startCol = Math.floor(cameraX / TILE_SIZE);
      const endCol = startCol + Math.ceil(window.innerWidth / TILE_SIZE) + 1;

      mapRef.current!.tiles.forEach((row, y) => {
          for(let x = startCol; x <= endCol; x++) {
              if (x < 0 || x >= row.length) continue;
              const tileId = row[x];
              if (tileId !== 0) {
                  const config = GAME_ELEMENTS.find(e => e.id === tileId);
                  if (config) {
                      g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(config.color);
                      // Simple detail
                      g.rect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE).stroke({width:1, color: 0x000000, alpha: 0.2});
                  }
              }
          }
      });

      // Draw Entities
      entitiesRef.current.forEach(e => {
          if (e.isDead && !e.isPlayer) return; // Don't draw dead enemies
          
          const config = getElementByName(e.type);
          const color = e.isPlayer ? 0xFF0000 : (config?.color || 0xFFFFFF);
          
          g.rect(e.x, e.y, e.w, e.h).fill(color);
          
          // Face for player
          if (e.isPlayer) {
              g.rect(e.x + (e.vx > 0 ? e.w*0.6 : e.w*0.1), e.y + e.h*0.2, e.w*0.3, e.h*0.2).fill(0xFFCCAA); // Face
          }
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
          g.rect(p.x, p.y, 4, 4).fill(p.color);
      });
  };

  // --- INPUT HANDLERS ---
  useEffect(() => {
      const down = (e: KeyboardEvent) => keysRef.current[e.key] = true;
      const up = (e: KeyboardEvent) => keysRef.current[e.key] = false;
      window.addEventListener('keydown', down);
      window.addEventListener('keyup', up);
      return () => {
          window.removeEventListener('keydown', down);
          window.removeEventListener('keyup', up);
      };
  }, []);

  const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const json = JSON.parse(ev.target?.result as string);
            setCurrentMap(json);
        } catch { alert('Invalid Map'); }
    };
    reader.readAsText(file);
  };

  // --- RENDER UI ---

  if (!currentMap) {
      return (
          <div className="h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-8">
              <h2 className="text-3xl font-bold mb-8">Load a Map to Play</h2>
              
              <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded cursor-pointer transition-colors shadow-lg">
                  Select JSON Map File
                  <input type="file" accept=".json" onChange={handleImportMap} className="hidden" />
              </label>

              <button onClick={onExit} className="mt-12 text-gray-400 hover:text-white underline">
                  Back to Menu
              </button>
          </div>
      );
  }

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden relative">
        {/* UI Overlay */}
        <div className="absolute top-4 left-4 text-white font-mono text-xl font-bold drop-shadow-md z-10 select-none">
            SCORE: {score}
        </div>

        <button 
            onClick={onExit}
            className="absolute top-4 right-4 bg-gray-800/50 hover:bg-gray-800 text-white px-3 py-1 rounded border border-gray-600 z-10 backdrop-blur-sm"
        >
            EXIT GAME
        </button>

        {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
                <h1 className="text-6xl text-red-500 font-black mb-4 animate-bounce">GAME OVER</h1>
                <p className="text-white text-xl mb-8">Score: {score}</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setCurrentMap({...currentMap})} // Force Reload
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded shadow-lg"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={onExit}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded shadow-lg"
                    >
                        Quit
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};