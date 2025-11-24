
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import { GameMap, Entity, Particle } from '../../types';
import { TILE_SIZE } from '../../constants';
import { getElementByName, getElementById, GAME_ELEMENTS_REGISTRY } from '../../elementRegistry';
import { PLAYER_CONFIG } from '../../playerConfig';
import { audioManager } from '../../audioManager';

export const Game: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  
  // Game State Refs (for Loop)
  const mapRef = useRef<GameMap | null>(null);
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const isWonRef = useRef(false);
  const lastDirRef = useRef(1); // 1 = right, -1 = left

  // React State for UI Overlay
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentMap, setCurrentMap] = useState<GameMap | null>(null);

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
      const el = GAME_ELEMENTS_REGISTRY.find(e => e.id === tileId);
      return el?.attributes?.solid || false;
  };
  
  const isLethalTile = (tileId: number) => {
      if (tileId === 0) return false;
      const el = GAME_ELEMENTS_REGISTRY.find(e => e.id === tileId);
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

        // Setup Scene Layers
        const graphics = new PIXI.Graphics();
        graphics.label = 'game-graphics';
        app.stage.addChild(graphics);
        
        const labels = new PIXI.Container();
        labels.label = 'game-labels';
        app.stage.addChild(labels);

        // Reset State
        mapRef.current = currentMap;
        scoreRef.current = 0;
        setScore(0);
        isGameOverRef.current = false;
        setGameOver(false);
        isWonRef.current = false;
        setGameWon(false);
        particlesRef.current = [];
        lastDirRef.current = 1;

        // Init Audio
        audioManager.startBGM();

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
            w: PLAYER_CONFIG.small.width,
            h: PLAYER_CONFIG.small.height,
            vx: 0,
            vy: 0,
            isDead: false,
            grounded: false,
            isPlayer: true,
            isBig: false,
            hasGravity: true,
            invincibleTimer: 0
        });

        // Create Enemies & Items
        currentMap.objects.forEach(obj => {
            if (obj.type === 'Player Start') return;
            const config = getElementByName(obj.type);
            if (!config) return;

            // Handle Flagpole specifically to make it a tall hitbox
            let h = TILE_SIZE;
            let y = obj.y;
            
            if (config.name === 'Flagpole') {
                 h = TILE_SIZE * 9;
                 // Shift y up so the base is at obj.y + TILE_SIZE - h?
                 // No, in registry renderPixi draws up from the base.
                 // We want the hitbox to cover the pole.
                 // The 'obj.y' is where the user clicked, representing the base block.
                 // So the hitbox top is y - (h - TILE_SIZE)
                 y = obj.y - (h - TILE_SIZE);
            }

            newEntities.push({
                id: obj.id,
                type: obj.type,
                x: obj.x,
                y: y,
                w: TILE_SIZE,
                h: h,
                vx: config.category === 'enemy' ? -1 : 0, // Enemies start moving left
                vy: 0,
                isDead: false,
                grounded: false,
                isEnemy: config.category === 'enemy',
                isCollectible: config.category === 'collectible',
                patrolCenter: obj.x,
                hasGravity: config.attributes?.gravity ?? true, // Default to true if not specified
                text: obj.text
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
        audioManager.stopBGM();
    };
  }, [currentMap]);


  // --- PHYSICS ENGINE ---

  const updatePhysics = (delta: number) => {
      const map = mapRef.current!;
      const entities = entitiesRef.current;
      const keys = keysRef.current;
      const phys = PLAYER_CONFIG.physics;

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
          if (entity.hasGravity) {
            entity.vy += phys.gravity * delta;
            if (entity.vy > phys.terminalVelocity) entity.vy = phys.terminalVelocity;
          }

          // 2. Control (Player)
          if (entity.isPlayer && !entity.isDead) {
              if (keys['ArrowLeft']) {
                  entity.vx -= phys.acceleration * delta;
              } else if (keys['ArrowRight']) {
                  entity.vx += phys.acceleration * delta;
              } else {
                  entity.vx *= phys.friction;
              }

              // Update facing direction
              if (Math.abs(entity.vx) > 0.1) {
                  lastDirRef.current = Math.sign(entity.vx);
              }

              // Jump
              if (keys[' '] && entity.grounded) {
                  const force = entity.isBig ? PLAYER_CONFIG.big.jumpForce : PLAYER_CONFIG.small.jumpForce;
                  entity.vy = force;
                  entity.grounded = false;
                  audioManager.playJump();
              }

              // Invincibility Timer
              if (entity.invincibleTimer && entity.invincibleTimer > 0) {
                  entity.invincibleTimer -= delta / 60; // Approx seconds
                  if (entity.invincibleTimer < 0) entity.invincibleTimer = 0;
              }

              // Clamp Speed
              if (entity.vx > phys.runSpeed) entity.vx = phys.runSpeed;
              if (entity.vx < -phys.runSpeed) entity.vx = -phys.runSpeed;

              // Check Death fall
              if (entity.y > map.height * TILE_SIZE) {
                  die();
              }
          }

          // 3. AI Movement
          if (entity.isEnemy) {
               // Simple patrol handled in collision
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
                      const config = getElementByName(other.type);

                      if (config?.attributes?.win) {
                          winLevel();
                          return;
                      }

                      if (other.isEnemy) {
                          // Jump on top?
                          // Player bottom < Enemy Center Y (approx) and Player falling
                          if (entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.5) {
                              // Kill Enemy
                              other.isDead = true;
                              entity.vy = phys.bounceForce; // Bounce
                              addScore(100);
                              spawnParticles(other.x, other.y, 0xA0522D);
                              audioManager.playStomp();
                          } else {
                              // Damage logic
                              if (entity.invincibleTimer && entity.invincibleTimer > 0) {
                                  // Invincible, ignore hit
                              } else if (entity.isBig) {
                                  // Shrink
                                  entity.isBig = false;
                                  entity.h = PLAYER_CONFIG.small.height;
                                  entity.y += PLAYER_CONFIG.big.height - PLAYER_CONFIG.small.height; // Adjust pos
                                  audioManager.playBump(); 
                                  entity.invincibleTimer = 1.0; // 1 second invincibility
                              } else {
                                  die();
                              }
                          }
                      } else if (other.isCollectible) {
                          // Collect
                          other.isDead = true;
                          if (config?.attributes?.points) addScore(config.attributes.points);
                          
                          // Effects
                          if (config?.attributes?.variant === 'grow') {
                              if (!entity.isBig) {
                                  entity.isBig = true;
                                  entity.h = PLAYER_CONFIG.big.height;
                                  entity.y -= (PLAYER_CONFIG.big.height - PLAYER_CONFIG.small.height);
                              }
                              audioManager.playPowerup();
                          } else {
                              audioManager.playCoin();
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
                              // Only break if Big? (Classic Mario rule, but let's allow all for now or check config)
                              map.tiles[y][x] = 0; // Destroy
                              addScore(10);
                              spawnParticles(tileRect.x, tileRect.y, el.color);
                              audioManager.playBump(); // Break sound
                          } else {
                              // Hitting a solid block head-on
                              if (entity.isPlayer) audioManager.playBump();
                          }
                      }
                  }
                  return; // Resolved one collision is enough per axis step usually
              }
          }
      }
  };

  const die = () => {
      if (isGameOverRef.current || isWonRef.current) return;
      isGameOverRef.current = true;
      setGameOver(true);
      
      audioManager.playDie();

      // Simple jump animation
      const player = entitiesRef.current.find(e => e.isPlayer);
      if (player) {
          player.vy = PLAYER_CONFIG.small.jumpForce;
          player.isDead = true; 
      }
  };

  const winLevel = () => {
      if (isGameOverRef.current || isWonRef.current) return;
      isWonRef.current = true;
      setGameWon(true);
      audioManager.playWin();
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
  
  const drawPlayer = (g: PIXI.Graphics, e: Entity) => {
      // Invincibility Flicker
      if (e.invincibleTimer && e.invincibleTimer > 0) {
          // Flicker every ~0.1s (assuming 60fps, every 6 frames)
          if (Math.floor(Date.now() / 80) % 2 === 0) return;
      }

      const x = e.x;
      const y = e.y;
      const w = e.w;
      const h = e.h;
      const isBig = e.isBig;
      
      const isRight = lastDirRef.current > 0;
      const colors = PLAYER_CONFIG.appearance;

      // Helper to calculate X position based on direction
      const tx = (lx: number, fw: number) => isRight ? (x + lx) : (x + w - lx - fw);

      const isRunning = Math.abs(e.vx) > 0.1 && e.grounded;
      const tick = Date.now() / 150;
      const animOffset = isRunning ? Math.sin(tick) * (w * 0.15) : 0;
      
      // Proportions vary slightly if big
      const legH = isBig ? h * 0.2 : h * 0.25;
      const bodyH = isBig ? h * 0.4 : h * 0.4;
      const headH = isBig ? h * 0.25 : h * 0.35;
      
      // -- LEGS --
      const legW = w * 0.25;
      
      const blX = w * 0.2 + animOffset;
      g.rect(tx(blX, legW), y + h - legH, legW, legH).fill(colors.overalls);
      
      const flX = w * 0.55 - animOffset;
      g.rect(tx(flX, legW), y + h - legH, legW, legH).fill(colors.overalls);

      // -- BODY --
      const bodyY = y + h - legH - bodyH;
      g.rect(tx(w*0.2, w*0.6), bodyY, w*0.6, bodyH).fill(colors.overalls);
      g.rect(tx(w*0.15, w*0.7), bodyY, w*0.7, bodyH * 0.6).fill(colors.shirt);
      
      g.rect(tx(w*0.2, w*0.15), bodyY, w*0.15, bodyH * 0.8).fill(colors.overalls);
      g.rect(tx(w*0.65, w*0.15), bodyY, w*0.15, bodyH * 0.8).fill(colors.overalls);
      
      g.circle(tx(w*0.275, 0), bodyY + bodyH * 0.4, 2).fill(colors.buttons);
      g.circle(tx(w*0.725, 0), bodyY + bodyH * 0.4, 2).fill(colors.buttons);

      // -- ARMS --
      const armY = bodyY + bodyH * 0.1;
      const baX = w * 0.1 + animOffset;
      g.rect(tx(baX, w*0.2), armY, w*0.2, bodyH * 0.5).fill(colors.shirt);
      const faX = w * 0.7 - animOffset;
      g.rect(tx(faX, w*0.2), armY, w*0.2, bodyH * 0.5).fill(colors.shirt);
      g.circle(tx(baX + w*0.1, 0), armY + bodyH * 0.5, w*0.12).fill(colors.skin);
      g.circle(tx(faX + w*0.1, 0), armY + bodyH * 0.5, w*0.12).fill(colors.skin);

      // -- HEAD --
      const headSize = w * 0.75;
      const headX = w * 0.125;
      const headY = bodyY - headH;
      
      g.rect(tx(headX, headSize), headY, headSize, headH).fill(colors.skin);

      const hatH = headH * 0.4;
      g.rect(tx(headX - w*0.05, headSize + w*0.1), headY - hatH*0.5, headSize + w*0.1, hatH + 2).fill(colors.hat);
      g.rect(tx(w*0.45, w*0.5), headY, w*0.5, hatH * 0.5).fill(colors.hat);

      g.rect(tx(w*0.15, w*0.15), headY + headH*0.5, w*0.15, headH*0.3).fill(colors.hair);
      g.rect(tx(w*0.1, w*0.1), headY + headH*0.6, w*0.1, headH*0.2).fill(colors.hair);

      g.rect(tx(w*0.55, w*0.3), headY + headH * 0.7, w*0.3, headH*0.2).fill(colors.hair);
      g.circle(tx(w*0.85, 0), headY + headH * 0.6, w*0.12).fill(colors.skin);
      g.rect(tx(w*0.6, w*0.08), headY + headH * 0.4, w*0.08, headH*0.25).fill(colors.eye);
  };

  const render = (app: PIXI.Application) => {
      const g = app.stage.getChildByLabel('game-graphics') as PIXI.Graphics;
      const labels = app.stage.getChildByLabel('game-labels') as PIXI.Container;
      
      if (!g || !labels) return;

      g.clear();
      labels.removeChildren();

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

      // Draw Map Tiles
      const startCol = Math.floor(cameraX / TILE_SIZE);
      const endCol = startCol + Math.ceil(window.innerWidth / TILE_SIZE) + 1;

      mapRef.current!.tiles.forEach((row, y) => {
          for(let x = startCol; x <= endCol; x++) {
              if (x < 0 || x >= row.length) continue;
              const tileId = row[x];
              if (tileId !== 0) {
                  const config = GAME_ELEMENTS_REGISTRY.find(e => e.id === tileId);
                  if (config) {
                      config.renderPixi(g, labels, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                  }
              }
          }
      });

      // Draw Entities
      entitiesRef.current.forEach(e => {
          if (e.isDead && !e.isPlayer) return;
          
          if (e.isPlayer) {
              drawPlayer(g, e);
          } else {
              // Ensure we don't render invisible items in-game unless we want debug
              const config = getElementByName(e.type);
              
              if (config && config.name !== 'Invisible Death Block') {
                 // Pass the entity data as the 7th argument
                 config.renderPixi(g, labels, e.x, e.y, e.w, e.h, e);
              }
          }
      });

      // Draw Particles
      particlesRef.current.forEach(p => {
          g.rect(p.x, p.y, 4, 4).fill(p.color);
      });
  };

  // --- INPUT HANDLERS ---
  useEffect(() => {
      const down = (e: KeyboardEvent) => {
          keysRef.current[e.key] = true;
          // Try to resume audio context on first interaction
          audioManager.resume();
      };
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

              <button onClick={() => navigate('/')} className="mt-12 text-gray-400 hover:text-white underline">
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
            onClick={() => navigate('/')}
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
                        onClick={() => navigate('/')}
                        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded shadow-lg"
                    >
                        Quit
                    </button>
                </div>
            </div>
        )}

        {gameWon && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-500/80 z-20 backdrop-blur-sm">
                <h1 className="text-6xl text-yellow-300 font-black mb-4 animate-bounce drop-shadow-md border-stroke">LEVEL CLEARED!</h1>
                <p className="text-white text-2xl font-bold mb-8 drop-shadow">Score: {score}</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
                    >
                        Return to Menu
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};
