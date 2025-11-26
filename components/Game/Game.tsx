
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as PIXI from 'pixi.js';
import { GameMap, Entity, Particle } from '../../types';
import { getElementByName, getElementById, GAME_ELEMENTS_REGISTRY } from '../../elementRegistry';
import { PLAYER_CONFIG } from '../../playerConfig';
import { audioManager } from '../../audioManager';
import { getMyMaps, getMapById, deleteMap, MapListItem } from '../../api';
import { Cloud, Trash2 } from 'lucide-react';

const DEFAULT_CONTROLS = {
    left: 'a',
    right: 'd',
    down: 's',
    jump: ' ',
    shoot: 'i',
    doubleJump: ' '
};

interface GameProps {
    initialMapData?: GameMap;
    width?: number;
    height?: number;
    onClose?: () => void;
    embedded?: boolean;
}

export const Game: React.FC<GameProps> = ({ 
    initialMapData, 
    width, 
    height, 
    onClose,
    embedded = false 
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  
  // Game State Refs (for Loop)
  const mapRef = useRef<GameMap | null>(initialMapData || null);
  const entitiesRef = useRef<Entity[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const keysRef = useRef<Record<string, boolean>>({});
  const prevKeysRef = useRef<Record<string, boolean>>({}); // Track previous frame keys for edge detection
  const scoreRef = useRef(0);
  const isGameOverRef = useRef(false);
  const isWonRef = useRef(false);
  const lastDirRef = useRef(1); // 1 = right, -1 = left

  // React State for UI Overlay & Logic
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [currentMap, setCurrentMap] = useState<GameMap | null>(initialMapData || null);
  
  // Controls State
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const [bindingAction, setBindingAction] = useState<keyof typeof DEFAULT_CONTROLS | null>(null);

  // Map List State
  const [myMaps, setMyMaps] = useState<MapListItem[]>([]);
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);

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
    const tileSize = map.tileSize;
    const tx = Math.floor(x / tileSize);
    const ty = Math.floor(y / tileSize);
    
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

  // --- CONTROLS INIT ---
  useEffect(() => {
    const saved = localStorage.getItem('MARIO_CONTROLS');
    if (saved) {
        try { setControls({ ...DEFAULT_CONTROLS, ...JSON.parse(saved) }); } catch(e) {}
    }
  }, []);

  // --- FETCH MAP FROM URL PARAM ---
  useEffect(() => {
      const mapIdParam = searchParams.get('id');
      if (mapIdParam && !currentMap && !embedded) {
          handleLoadFromApi(Number(mapIdParam), true); // Pass true for public fetch attempt
      }
  }, [searchParams]);

  // --- FETCH MAP LIST ---
  useEffect(() => {
      if (!currentMap && !embedded) {
          const token = localStorage.getItem('access_token');
          if (token) {
              setIsLoadingMaps(true);
              getMyMaps(token)
                .then(setMyMaps)
                .catch(err => console.error("Failed to load maps", err))
                .finally(() => setIsLoadingMaps(false));
          }
      }
  }, [currentMap, embedded]);

  const getKeyDisplay = (key: string) => {
      if (key === ' ') return 'SPACE';
      if (key.length === 1) return key.toUpperCase();
      return key.toUpperCase();
  };

  // --- INITIALIZATION ---

  useEffect(() => {
    // If no map loaded, wait for import
    if (!currentMap) return;

    let app: PIXI.Application;
    
    const initGame = async () => {
        app = new PIXI.Application();
        
        // Use props dimensions if embedded, otherwise full window
        const initOptions: Partial<PIXI.ApplicationOptions> = {
            backgroundColor: currentMap.backgroundColor || '#5C94FC',
            preference: 'webgl'
        };

        if (embedded && width && height) {
            initOptions.width = width;
            initOptions.height = height;
        } else {
            initOptions.resizeTo = window;
        }

        await app.init(initOptions);

        if (containerRef.current) {
            // Clear previous canvas if any
            while (containerRef.current.firstChild) {
                containerRef.current.removeChild(containerRef.current.firstChild);
            }
            containerRef.current.appendChild(app.canvas);
        }
        appRef.current = app;

        // Setup Scene Layers
        const bgLayer = new PIXI.Container();
        bgLayer.label = 'game-background';
        app.stage.addChild(bgLayer);

        const graphics = new PIXI.Graphics();
        graphics.label = 'game-graphics';
        app.stage.addChild(graphics);
        
        const labels = new PIXI.Container();
        labels.label = 'game-labels';
        app.stage.addChild(labels);

        // Setup Background Image
        if (currentMap.backgroundImage && currentMap.backgroundImage.data) {
            try {
                const texture = await PIXI.Assets.load(currentMap.backgroundImage.data);
                const bgSprite = new PIXI.Sprite(texture);
                bgSprite.alpha = currentMap.backgroundImage.opacity;
                bgSprite.scale.set(currentMap.backgroundImage.scale);
                bgLayer.addChild(bgSprite);
            } catch (e) {
                console.error("Failed to load game background image", e);
            }
        }

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
        keysRef.current = {};
        prevKeysRef.current = {};

        // Init Audio
        audioManager.startBGM();

        // Parse Objects & Create Entities
        const newEntities: Entity[] = [];
        const tileSize = currentMap.tileSize;
        
        // Find Player Start or default
        let startX = 100;
        let startY = 100;
        const playerStart = currentMap.objects.find(o => o.type === 'Player Start');
        if (playerStart) {
            startX = playerStart.x;
            startY = playerStart.y;
        }

        // Dynamic Player Sizing relative to tile size (scale logic)
        // Assume constants.ts TILE_SIZE (32) was the base for config.
        const scaleRatio = tileSize / 32;

        // Create Player
        newEntities.push({
            id: 'player',
            type: 'player',
            x: startX,
            y: startY,
            w: PLAYER_CONFIG.small.width * scaleRatio,
            h: PLAYER_CONFIG.small.height * scaleRatio,
            vx: 0,
            vy: 0,
            isDead: false,
            grounded: false,
            isPlayer: true,
            isBig: false,
            canShoot: false,
            hasGravity: true,
            invincibleTimer: 0,
            shootCooldown: 0,
            jumpCount: 0,
            isCrouching: false
        });

        // Create Enemies & Items
        currentMap.objects.forEach(obj => {
            if (obj.type === 'Player Start') return;
            const config = getElementByName(obj.type);
            if (!config) return;

            let h = tileSize;
            let y = obj.y;
            
            if (config.name === 'Flagpole') {
                 h = tileSize * 9;
                 y = obj.y - (h - tileSize);
            }

            newEntities.push({
                id: obj.id,
                type: obj.type,
                x: obj.x,
                y: y,
                w: tileSize,
                h: h,
                vx: config.category === 'enemy' ? -1 : 0, 
                vy: 0,
                isDead: false,
                grounded: false,
                isEnemy: config.category === 'enemy',
                isCollectible: config.category === 'collectible',
                patrolCenter: obj.x,
                hasGravity: config.attributes?.gravity ?? true,
                text: obj.text,
                isShell: false,
                
                plantState: 'hidden',
                plantTimer: 0,
                plantOffset: 0,

                spikeState: 'hidden',
                spikeTimer: 0,
                rotationAngle: 0
            });
        });

        entitiesRef.current = newEntities;

        // --- GAME LOOP ---
        app.ticker.add((ticker) => {
            if (isGameOverRef.current || isWonRef.current || !mapRef.current) return;
            // Clamp delta to prevent huge jumps on lag spike or init
            const delta = Math.min(ticker.deltaTime, 2.0);

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
  }, [currentMap, width, height, embedded]);


  // --- PHYSICS ENGINE ---

  const updatePhysics = (delta: number) => {
      const map = mapRef.current!;
      const entities = entitiesRef.current;
      const keys = { ...keysRef.current };
      const prevKeys = prevKeysRef.current;
      const tileSize = map.tileSize;
      
      const phys = PLAYER_CONFIG.physics;
      const scaleRatio = tileSize / 32; // Scale physics forces to match visual scale

      // Filter entities
      entitiesRef.current = entities.filter(e => {
          if (e.isDead && !e.isPlayer) return false;
          if (e.isEffect && e.vy > 5) return false; 
          if (e.isBullet && (e.x < 0 || e.x > map.width * tileSize)) return false;
          return true;
      });
      
      // Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
          const p = particlesRef.current[i];
          p.x += p.vx * delta;
          p.y += p.vy * delta;
          p.vy += 0.2 * delta; 
          p.life -= delta;
          if (p.life <= 0) particlesRef.current.splice(i, 1);
      }

      entitiesRef.current.forEach(entity => {
          if (entity.isDead && !entity.isPlayer) return;

          // 1. Gravity
          if (entity.hasGravity) {
            entity.vy += phys.gravity * scaleRatio * delta;
            if (entity.vy > phys.terminalVelocity * scaleRatio) entity.vy = phys.terminalVelocity * scaleRatio;
          }

          // Effects
          if (entity.isEffect) {
              entity.x += entity.vx * delta;
              entity.y += entity.vy * delta;
              return; 
          }

          // Bullet Logic
          if (entity.isBullet) {
              entity.x += entity.vx * delta;
              
              // Wall collision
              const tile = getTileAt(entity.x + entity.w/2, entity.y + entity.h/2, map);
              if (isSolid(tile)) {
                  entity.isDead = true;
                  spawnParticles(entity.x, entity.y, 0xFF4400);
                  return;
              }

              // Enemy Collision
              entities.forEach(other => {
                  if (other === entity || other.isDead || !other.isEnemy) return;
                  if (other.type === 'Pop-up Spike' || other.type === 'Rotating Spike') return;

                  if (checkRectCollision(entity, other)) {
                      entity.isDead = true;
                      other.isDead = true;
                      addScore(100);
                      spawnParticles(other.x, other.y, 0xFF4400);
                      audioManager.playStomp(); 
                  }
              });
              return;
          }

          // 2. Control (Player)
          if (entity.isPlayer && !entity.isDead) {
              // Movement
              if (keys[controls.left]) {
                  entity.vx -= phys.acceleration * scaleRatio * delta;
              } else if (keys[controls.right]) {
                  entity.vx += phys.acceleration * scaleRatio * delta;
              } else {
                  entity.vx *= phys.friction;
              }

              // Crouch Logic
              if (entity.grounded && keys[controls.down]) {
                  if (!entity.isCrouching) {
                      entity.isCrouching = true;
                      // Reduce height
                      const originalH = (entity.isBig ? PLAYER_CONFIG.big.height : PLAYER_CONFIG.small.height) * scaleRatio;
                      entity.h = originalH * 0.6; 
                      entity.y += (originalH - entity.h); // Push down to align feet
                  }
              } else {
                  if (entity.isCrouching) {
                       // Stand up
                       entity.isCrouching = false;
                       const targetH = (entity.isBig ? PLAYER_CONFIG.big.height : PLAYER_CONFIG.small.height) * scaleRatio;
                       entity.y -= (targetH - entity.h); // Push up
                       entity.h = targetH;
                  }
              }

              // Facing
              if (Math.abs(entity.vx) > 0.1) {
                  lastDirRef.current = Math.sign(entity.vx);
              }

              // Jump Detection (Just Pressed)
              const jumpJustPressed = keys[controls.jump] && !prevKeys[controls.jump];
              const doubleJumpJustPressed = keys[controls.doubleJump] && !prevKeys[controls.doubleJump];
              const jumpRequested = jumpJustPressed || doubleJumpJustPressed;

              if (entity.grounded) {
                  entity.jumpCount = 0; // Reset jumps
                  if (jumpRequested) {
                      const force = entity.isBig ? PLAYER_CONFIG.big.jumpForce : PLAYER_CONFIG.small.jumpForce;
                      entity.vy = force * scaleRatio;
                      entity.grounded = false;
                      entity.jumpCount = 1;
                      audioManager.playJump();
                  }
              } else {
                  // Air Logic / Double Jump
                  if (jumpRequested && (entity.jumpCount || 0) < 2) {
                      const force = entity.isBig ? PLAYER_CONFIG.big.jumpForce : PLAYER_CONFIG.small.jumpForce;
                      entity.vy = force * 0.9 * scaleRatio; 
                      entity.jumpCount = (entity.jumpCount || 0) + 1;
                      audioManager.playJump();
                      spawnParticles(entity.x, entity.y + entity.h, 0xFFFFFF); 
                  }
              }
              
              // Shoot
              if (keys[controls.shoot]) {
                  if (entity.canShoot && (!entity.shootCooldown || entity.shootCooldown <= 0)) {
                      spawnBullet(entity);
                      entity.shootCooldown = 20; 
                  }
              }
              if (entity.shootCooldown && entity.shootCooldown > 0) {
                  entity.shootCooldown -= delta;
              }

              // Invincibility
              if (entity.invincibleTimer && entity.invincibleTimer > 0) {
                  entity.invincibleTimer -= delta / 60; 
                  if (entity.invincibleTimer < 0) entity.invincibleTimer = 0;
              }

              // Clamp Speed
              const maxSpeed = phys.runSpeed * scaleRatio;
              if (entity.vx > maxSpeed) entity.vx = maxSpeed;
              if (entity.vx < -maxSpeed) entity.vx = -maxSpeed;

              // Death fall
              if (entity.y > map.height * tileSize) {
                  die();
              }
          }

          // 3. AI Movement & Shell Mechanics
          if (entity.isEnemy) {
               if (entity.type === 'Piranha Plant') {
                   entity.vx = 0; 
                   entity.vy = 0; 
                   
                   entity.plantTimer = (entity.plantTimer || 0) + delta;
                   const MAX_HEIGHT = -tileSize * 0.8;
                   const MOVE_SPEED = 0.5 * scaleRatio;

                   if (entity.plantState === 'hidden') {
                       if (entity.plantTimer > 180) { 
                           entity.plantState = 'extending';
                           entity.plantTimer = 0;
                       }
                   } else if (entity.plantState === 'extending') {
                       entity.plantOffset = (entity.plantOffset || 0) - MOVE_SPEED * delta;
                       if (entity.plantOffset <= MAX_HEIGHT) {
                           entity.plantOffset = MAX_HEIGHT;
                           entity.plantState = 'out';
                           entity.plantTimer = 0;
                       }
                   } else if (entity.plantState === 'out') {
                       if (entity.plantTimer > 180) {
                           entity.plantState = 'retracting';
                           entity.plantTimer = 0;
                       }
                   } else if (entity.plantState === 'retracting') {
                       entity.plantOffset = (entity.plantOffset || 0) + MOVE_SPEED * delta;
                       if (entity.plantOffset >= 0) {
                           entity.plantOffset = 0;
                           entity.plantState = 'hidden';
                           entity.plantTimer = 0;
                       }
                   }
               }
               else if (entity.type === 'Pop-up Spike') {
                   entity.vx = 0;
                   entity.vy = 0;
                   entity.spikeTimer = (entity.spikeTimer || 0) + delta;
                   
                   if (entity.spikeState === 'hidden') {
                       if (entity.spikeTimer > 120) {
                           entity.spikeState = 'warning';
                           entity.spikeTimer = 0;
                       }
                   } else if (entity.spikeState === 'warning') {
                       if (entity.spikeTimer > 30) {
                           entity.spikeState = 'active';
                           entity.spikeTimer = 0;
                       }
                   } else if (entity.spikeState === 'active') {
                        if (entity.spikeTimer > 60) {
                            entity.spikeState = 'hidden';
                            entity.spikeTimer = 0;
                        }
                   }
               }
               else if (entity.type === 'Rotating Spike') {
                   entity.vx = 0;
                   entity.vy = 0;
                   entity.rotationAngle = (entity.rotationAngle || 0) + 0.05 * delta;
               }
               
               else if (entity.isShell && Math.abs(entity.vx) > 2) {
                   entities.forEach(other => {
                       if (other === entity || other.isDead || other.isPlayer || other.isEffect || other.isBullet) return;
                       if (other.type === 'Pop-up Spike' || other.type === 'Rotating Spike') return;

                       if (other.isEnemy && checkRectCollision(entity, other)) {
                           other.isDead = true;
                           addScore(200);
                           spawnParticles(other.x, other.y, 0xFFFFFF);
                           audioManager.playStomp();
                       }
                   });
               }
          }

          // 4. Movement & Tile Collision (X Axis)
          entity.x += entity.vx * delta;
          handleTileCollision(entity, map, 'x');

          // 5. Movement & Tile Collision (Y Axis)
          entity.grounded = false; 
          entity.y += entity.vy * delta;
          handleTileCollision(entity, map, 'y');

          // 6. Collision (Player vs World)
          if (entity.isPlayer && !entity.isDead) {
              entities.forEach(other => {
                  if (entity === other || other.isDead || other.isEffect || other.isBullet) return;

                  if (checkRectCollision(entity, other)) {
                      const config = getElementByName(other.type);

                      if (config?.attributes?.win) {
                          winLevel();
                          return;
                      }
                      
                      if (config?.attributes?.solid) {
                         const dx = (entity.x + entity.w/2) - (other.x + other.w/2);
                         const dy = (entity.y + entity.h/2) - (other.y + other.h/2);
                         const width = (entity.w + other.w) / 2;
                         const height = (entity.h + other.h) / 2;
                         const crossWidth = width * dy;
                         const crossHeight = height * dx;

                         if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
                             if (crossWidth > crossHeight) {
                                 if (crossWidth > -crossHeight) {
                                     entity.y = other.y + other.h;
                                     entity.vy = 0;
                                 } else {
                                     entity.x = other.x - entity.w;
                                     entity.vx = 0;
                                 }
                             } else {
                                 if (crossWidth > -crossHeight) {
                                     entity.x = other.x + other.w;
                                     entity.vx = 0;
                                 } else {
                                     entity.y = other.y - entity.h;
                                     entity.vy = 0;
                                     entity.grounded = true;
                                 }
                             }
                         }
                      }

                      if (other.isEnemy) {
                          if (other.type === 'Piranha Plant') {
                              const offset = other.plantOffset || 0;
                              if (offset < -5) { 
                                  const headRect = {
                                      x: other.x + other.w * 0.2,
                                      y: other.y + offset + other.h * 0.2,
                                      w: other.w * 0.6,
                                      h: other.h * 0.6
                                  };
                                  if (checkRectCollision(entity, headRect)) {
                                       takeDamage(entity);
                                  }
                              }
                              return;
                          }

                          if (other.type === 'Pop-up Spike') {
                              if (other.spikeState === 'active') {
                                   takeDamage(entity);
                              }
                              return;
                          }

                          if (other.type === 'Rotating Spike') {
                              return; 
                          }

                          const isStomp = entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.7;

                          if (isStomp) {
                              if (other.type === 'Turtle') {
                                  entity.vy = phys.bounceForce * scaleRatio;
                                  audioManager.playStomp();

                                  if (!other.isShell) {
                                      other.isShell = true;
                                      other.vx = 0;
                                      addScore(100);
                                  } else {
                                      other.vx = 0; 
                                  }
                              } else {
                                  other.isDead = true;
                                  entity.vy = phys.bounceForce * scaleRatio; 
                                  addScore(100);
                                  spawnParticles(other.x, other.y, 0xA0522D);
                                  audioManager.playStomp();
                              }
                          } else {
                              if (other.type === 'Turtle' && other.isShell && Math.abs(other.vx) < 0.1) {
                                  const dir = entity.x < other.x ? 1 : -1;
                                  other.vx = dir * 8 * scaleRatio;
                                  other.x += dir * 4; 
                                  audioManager.playBump();
                              } else {
                                  takeDamage(entity);
                              }
                          }
                      } else if (other.isCollectible) {
                          other.isDead = true;
                          if (config?.attributes?.points) addScore(config.attributes.points);
                          
                          if (config?.attributes?.variant === 'grow') {
                              if (!entity.isBig) {
                                  entity.isBig = true;
                                  const targetH = (PLAYER_CONFIG.big.height) * scaleRatio;
                                  const prevH = entity.h;
                                  entity.h = targetH;
                                  entity.y -= (targetH - prevH);
                              }
                              audioManager.playPowerup();
                          } else if (config?.attributes?.variant === 'fire') {
                              if (!entity.isBig) {
                                  entity.isBig = true;
                                  const targetH = (PLAYER_CONFIG.big.height) * scaleRatio;
                                  const prevH = entity.h;
                                  entity.h = targetH;
                                  entity.y -= (targetH - prevH);
                              }
                              entity.canShoot = true;
                              audioManager.playPowerup();
                          } else {
                              audioManager.playCoin();
                          }
                      }
                  }

                  if (other.type === 'Rotating Spike') {
                      const angle = other.rotationAngle || 0;
                      const radius = other.w * 2.5;
                      const cx = other.x + other.w/2;
                      const cy = other.y + other.h/2;
                      
                      const ballRadius = other.w * 0.4;
                      const ballX = cx + Math.cos(angle) * radius;
                      const ballY = cy + Math.sin(angle) * radius;

                      const ballRect = {
                          x: ballX - ballRadius,
                          y: ballY - ballRadius,
                          w: ballRadius * 2,
                          h: ballRadius * 2
                      };

                      if (checkRectCollision(entity, ballRect)) {
                           takeDamage(entity);
                      }
                  }
              });
          }
      });

      // Update Prev Keys
      prevKeysRef.current = { ...keys };
  };

  const spawnBullet = (player: Entity) => {
      audioManager.playShoot();
      const tileSize = mapRef.current!.tileSize;
      const scaleRatio = tileSize / 32;
      const dir = lastDirRef.current;
      entitiesRef.current.push({
          id: `bullet-${Date.now()}`,
          type: 'Bullet',
          x: dir > 0 ? player.x + player.w : player.x - PLAYER_CONFIG.projectile.width,
          y: player.y + player.h * 0.5,
          w: PLAYER_CONFIG.projectile.width,
          h: PLAYER_CONFIG.projectile.height,
          vx: dir * PLAYER_CONFIG.physics.bulletSpeed * scaleRatio,
          vy: 0,
          isDead: false,
          grounded: false,
          hasGravity: false,
          isBullet: true
      });
  };

  const takeDamage = (entity: Entity) => {
      if (entity.invincibleTimer && entity.invincibleTimer > 0) return;
      const tileSize = mapRef.current!.tileSize;
      const scaleRatio = tileSize / 32;

      if (entity.isBig) {
          entity.isBig = false;
          entity.canShoot = false; 
          
          const targetH = PLAYER_CONFIG.small.height * scaleRatio;
          const prevH = entity.h;
          entity.h = targetH;
          entity.y += (prevH - targetH); 
          
          audioManager.playBump(); 
          entity.invincibleTimer = 1.0; 
      } else {
          die();
      }
  };

  const handleTileCollision = (entity: Entity, map: GameMap, axis: 'x' | 'y') => {
      const tileSize = map.tileSize;
      const startX = Math.floor(entity.x / tileSize);
      const endX = Math.floor((entity.x + entity.w - 0.01) / tileSize);
      const startY = Math.floor(entity.y / tileSize);
      const endY = Math.floor((entity.y + entity.h - 0.01) / tileSize);

      for (let y = startY; y <= endY; y++) {
          for (let x = startX; x <= endX; x++) {
              const tileId = getTileAt(x * tileSize, y * tileSize, map);
              
              if (isLethalTile(tileId) && entity.isPlayer) {
                  die();
                  return;
              }

              if (isSolid(tileId)) {
                  const tileRect = { x: x * tileSize, y: y * tileSize, w: tileSize, h: tileSize };
                  
                  if (axis === 'x') {
                      if (entity.vx > 0) {
                          entity.x = tileRect.x - entity.w;
                          if (entity.isEnemy) {
                              entity.vx = -entity.vx;
                          } else {
                              entity.vx = 0;
                          }
                      } else if (entity.vx < 0) {
                          entity.x = tileRect.x + tileRect.w;
                          if (entity.isEnemy) {
                              entity.vx = -entity.vx;
                          } else {
                              entity.vx = 0;
                          }
                      }
                  } else {
                      if (entity.vy > 0) {
                          entity.y = tileRect.y - entity.h;
                          entity.vy = 0;
                          entity.grounded = true;
                      } else if (entity.vy < 0) {
                          entity.y = tileRect.y + tileRect.h;
                          entity.vy = 0;
                          
                          const el = getElementById(tileId);

                          if (el?.attributes?.destructible && entity.isPlayer) {
                              map.tiles[y][x] = 0; 
                              addScore(10);
                              spawnParticles(tileRect.x, tileRect.y, el.color);
                              audioManager.playBump(); 
                          } 
                          else if (el?.name === 'Question Block' && entity.isPlayer) {
                              map.tiles[y][x] = 6; 
                              addScore(200);
                              audioManager.playCoin();
                              
                              entitiesRef.current.push({
                                  id: `coin-fx-${Date.now()}`,
                                  type: 'Coin',
                                  x: tileRect.x,
                                  y: tileRect.y - tileSize, 
                                  w: tileSize,
                                  h: tileSize,
                                  vx: 0,
                                  vy: -8, 
                                  isDead: false,
                                  grounded: false,
                                  hasGravity: true,
                                  isEffect: true 
                              });
                          }
                          else {
                              if (entity.isPlayer) audioManager.playBump();
                          }
                      }
                  }
                  return; 
              }
          }
      }
  };

  const die = () => {
      if (isGameOverRef.current || isWonRef.current) return;
      isGameOverRef.current = true;
      setGameOver(true);
      
      audioManager.playDie();
      const tileSize = mapRef.current!.tileSize;
      const scaleRatio = tileSize / 32;

      const player = entitiesRef.current.find(e => e.isPlayer);
      if (player) {
          player.vy = PLAYER_CONFIG.small.jumpForce * scaleRatio;
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
      const tileSize = mapRef.current!.tileSize;
      for(let i=0; i<5; i++) {
          particlesRef.current.push({
              x: x + tileSize/2,
              y: y + tileSize/2,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 1) * 5,
              color: color,
              life: 60
          });
      }
  };


  // --- RENDERING ---
  
  const drawPlayer = (g: PIXI.Graphics, e: Entity) => {
      if (e.invincibleTimer && e.invincibleTimer > 0) {
          if (Math.floor(Date.now() / 80) % 2 === 0) return;
      }

      const x = e.x;
      const y = e.y;
      const w = e.w;
      const h = e.h;
      const isBig = e.isBig;
      const canShoot = e.canShoot;
      // const isCrouching = e.isCrouching;
      
      const isRight = lastDirRef.current > 0;
      const colors = canShoot ? PLAYER_CONFIG.fireAppearance : PLAYER_CONFIG.appearance;

      const tx = (lx: number, fw: number) => isRight ? (x + lx) : (x + w - lx - fw);

      const isRunning = Math.abs(e.vx) > 0.1 && e.grounded;
      const tick = Date.now() / 150;
      const animOffset = isRunning ? Math.sin(tick) * (w * 0.15) : 0;
      
      const legH = isBig ? h * 0.2 : h * 0.25;
      const bodyH = isBig ? h * 0.4 : h * 0.4;
      const headH = isBig ? h * 0.25 : h * 0.35;
      
      // Legs
      const legW = w * 0.25;
      const blX = w * 0.2 + animOffset;
      g.rect(tx(blX, legW), y + h - legH, legW, legH).fill(colors.overalls);
      const flX = w * 0.55 - animOffset;
      g.rect(tx(flX, legW), y + h - legH, legW, legH).fill(colors.overalls);

      // Body
      const bodyY = y + h - legH - bodyH;
      // If crouching, body is lower/shorter visually? No, hitbox h handles size, draw normally relative to x/y/w/h
      g.rect(tx(w*0.2, w*0.6), bodyY, w*0.6, bodyH).fill(colors.overalls);
      g.rect(tx(w*0.15, w*0.7), bodyY, w*0.7, bodyH * 0.6).fill(colors.shirt);
      
      g.rect(tx(w*0.2, w*0.15), bodyY, w*0.15, bodyH * 0.8).fill(colors.overalls);
      g.rect(tx(w*0.65, w*0.15), bodyY, w*0.15, bodyH * 0.8).fill(colors.overalls);
      
      g.circle(tx(w*0.275, 0), bodyY + bodyH * 0.4, 2).fill(colors.buttons);
      g.circle(tx(w*0.725, 0), bodyY + bodyH * 0.4, 2).fill(colors.buttons);

      // Arms
      const armY = bodyY + bodyH * 0.1;
      const baX = w * 0.1 + animOffset;
      g.rect(tx(baX, w*0.2), armY, w*0.2, bodyH * 0.5).fill(colors.shirt);
      const faX = w * 0.7 - animOffset;
      g.rect(tx(faX, w*0.2), armY, w*0.2, bodyH * 0.5).fill(colors.shirt);
      g.circle(tx(baX + w*0.1, 0), armY + bodyH * 0.5, w*0.12).fill(colors.skin);
      g.circle(tx(faX + w*0.1, 0), armY + bodyH * 0.5, w*0.12).fill(colors.skin);

      // Head
      const headSize = w * 0.75;
      const headX = w * 0.125;
      const headY = bodyY - headH;
      
      g.rect(tx(headX, headSize), headY, headSize, headH).fill(colors.skin);
      const hatH = headH * 0.4;
      g.rect(tx(headX - w*0.05, headSize + w*0.1), headY - hatH*0.5, headSize + w*0.1, hatH + 2).fill(colors.hat);
      g.rect(tx(w*0.45, w*0.5), headY, w*0.5, hatH * 0.5).fill(colors.hat);
      
      // If crouching, maybe lower eyes?
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
      const tileSize = mapRef.current!.tileSize;

      g.clear();
      
      // FIX: MEMORY LEAK
      // Explicitly destroy children with texture: true
      const oldLabels = labels.removeChildren();
      for (const child of oldLabels) {
          child.destroy({ texture: true, children: true });
      }

      // Camera Follow
      let cameraX = 0;
      if (!embedded) {
          const player = entitiesRef.current.find(e => e.isPlayer);
          if (player) {
              cameraX = Math.max(0, player.x - window.innerWidth / 2);
              const maxCam = (mapRef.current!.width * tileSize) - window.innerWidth;
              if (cameraX > maxCam) cameraX = Math.max(0, maxCam);
          }
      } else if (width) {
          // Centered camera for embedded if map allows, or simple scrolling
          const player = entitiesRef.current.find(e => e.isPlayer);
          if (player) {
              cameraX = Math.max(0, player.x - width / 2);
              const maxCam = (mapRef.current!.width * tileSize) - width;
              if (cameraX > maxCam) cameraX = Math.max(0, maxCam);
          }
      }
      
      app.stage.position.x = -cameraX;

      const viewW = width || window.innerWidth;
      const startCol = Math.floor(cameraX / tileSize);
      const endCol = startCol + Math.ceil(viewW / tileSize) + 1;

      mapRef.current!.tiles.forEach((row, y) => {
          for(let x = startCol; x <= endCol; x++) {
              if (x < 0 || x >= row.length) continue;
              const tileId = row[x];
              if (tileId !== 0) {
                  const config = GAME_ELEMENTS_REGISTRY.find(e => e.id === tileId);
                  if (config) {
                      config.renderPixi(g, labels, x * tileSize, y * tileSize, tileSize, tileSize);
                  }
              }
          }
      });

      entitiesRef.current.forEach(e => {
          if (e.isDead && !e.isPlayer) return;
          
          if (e.isPlayer) {
              drawPlayer(g, e);
          } else {
              const config = getElementByName(e.type);
              if (config && config.name !== 'Invisible Death Block') {
                 config.renderPixi(g, labels, e.x, e.y, e.w, e.h, e);
              } else if (e.isBullet) {
                   const bulletConfig = getElementByName('Bullet');
                   if (bulletConfig) bulletConfig.renderPixi(g, null, e.x, e.y, e.w, e.h);
                   else g.circle(e.x + e.w/2, e.y + e.h/2, e.w/2).fill(0xFF4400);
              }
          }
      });

      particlesRef.current.forEach(p => {
          g.rect(p.x, p.y, 4, 4).fill(p.color);
      });
  };

  // --- INPUT & CONFIG ---

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          // Binding Logic
          if (bindingAction) {
              e.preventDefault();
              const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
              const newControls = { ...controls, [bindingAction]: key };
              setControls(newControls);
              localStorage.setItem('MARIO_CONTROLS', JSON.stringify(newControls));
              setBindingAction(null);
              return;
          }

          // Game Input
          const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
          keysRef.current[k] = true;
          if (currentMap) audioManager.resume();

          // Quick Exit
          if (e.key === 'Escape') {
              handleExit();
          }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
          if (bindingAction) return;
          const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
          keysRef.current[k] = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, [bindingAction, controls, currentMap]); // Re-bind listener when binding state changes

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

  const handleLoadFromApi = async (id: number) => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          alert("Please login to play cloud maps");
          return;
      }
      try {
          const mapData = await getMapById(id, token);
          if (mapData.map_data) {
              // Ensure we parse the string back to JSON
              let json;
              if (typeof mapData.map_data === 'string') {
                  json = JSON.parse(mapData.map_data);
              } else {
                  json = mapData.map_data;
              }
              setCurrentMap(json);
          } else {
              alert("Map data is empty");
          }
      } catch (e) {
          console.error(e);
          alert("Failed to load map from cloud");
      }
  };

  const handleDeleteMap = async (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); // Prevent loading map when clicking delete
      
      if (!window.confirm("Are you sure you want to delete this map? This cannot be undone.")) {
          return;
      }

      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await deleteMap({ map_id: id }, token);
          setMyMaps(prev => prev.filter(m => m.id !== id));
      } catch (error) {
          console.error("Failed to delete map", error);
          alert("Failed to delete map");
      }
  };

  const handleExit = () => {
      if (onClose) {
          onClose();
      } else {
          navigate('/');
      }
  };

  if (!currentMap) {
      return (
          <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center text-white p-8 overflow-y-auto">
              <h2 className="text-3xl font-bold mb-6">Load a Map to Play</h2>
              
              <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {/* LOCAL LOAD */}
                  <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                      <h3 className="text-xl font-bold mb-4 text-gray-300">Local File</h3>
                      <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded cursor-pointer transition-colors shadow-lg">
                          Select JSON Map
                          <input type="file" accept=".json" onChange={handleImportMap} className="hidden" />
                      </label>
                  </div>

                  {/* CLOUD LOAD */}
                  <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg border border-gray-700 max-h-[400px]">
                       <h3 className="text-xl font-bold mb-4 text-gray-300 flex items-center gap-2">
                           <Cloud size={24} /> My Cloud Maps
                       </h3>
                       
                       {isLoadingMaps ? (
                           <div className="text-gray-400">Loading maps...</div>
                       ) : myMaps.length > 0 ? (
                           <div className="w-full grid grid-cols-1 gap-2 overflow-y-auto pr-2">
                               {myMaps.map((map) => (
                                   <div 
                                      key={map.id}
                                      className="group bg-gray-700 p-1 rounded flex items-center justify-between border border-gray-600 hover:border-blue-500 transition-all pr-2"
                                   >
                                       <button 
                                          onClick={() => handleLoadFromApi(map.id)}
                                          className="flex-1 p-2 text-left hover:bg-gray-600 rounded mr-2"
                                       >
                                           <div className="flex flex-col items-start">
                                               <span className="font-bold text-sm text-white group-hover:text-blue-300">Map #{map.id}</span>
                                               <span className="text-[10px] text-gray-400">Status: {map.status === 1 ? 'Active' : 'Draft'}</span>
                                           </div>
                                       </button>
                                       
                                       <button 
                                          onClick={(e) => handleDeleteMap(e, map.id)}
                                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                                          title="Delete Map"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="text-gray-500 text-sm">
                               {localStorage.getItem('access_token') 
                                ? "No maps found in cloud." 
                                : "Login to access cloud maps."}
                           </div>
                       )}
                  </div>
              </div>

              {/* CONTROLS CONFIG UI */}
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 w-full max-w-lg">
                  <h3 className="text-xl font-bold mb-4 text-center text-gray-300">Key Bindings</h3>
                  <div className="grid grid-cols-2 gap-4">
                      {Object.entries(controls).map(([action, key]) => (
                          <div key={action} className="flex flex-col">
                              <span className="text-xs text-gray-500 uppercase font-bold mb-1">
                                {action.replace(/([A-Z])/g, ' $1')}
                              </span>
                              <button 
                                  onClick={() => setBindingAction(action as keyof typeof DEFAULT_CONTROLS)}
                                  className={`
                                    py-2 px-4 rounded font-mono font-bold text-sm transition-colors
                                    ${bindingAction === action 
                                        ? 'bg-yellow-500 text-black animate-pulse' 
                                        : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'}
                                  `}
                              >
                                  {bindingAction === action ? 'PRESS KEY...' : getKeyDisplay(key)}
                              </button>
                          </div>
                      ))}
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-4">Click a button to rebind.</p>
              </div>

              <button onClick={handleExit} className="mt-8 text-gray-400 hover:text-white underline">
                  Back to Menu
              </button>
          </div>
      );
  }

  return (
    <div ref={containerRef} className={`${embedded ? 'w-full h-full' : 'h-screen w-screen'} overflow-hidden relative`}>
        <div className="absolute top-4 left-4 text-white font-mono text-xl font-bold drop-shadow-md z-10 select-none">
            SCORE: {score}
        </div>
        {!embedded && (
            <div className="absolute top-10 left-4 text-white font-mono text-xs opacity-70 drop-shadow-md z-10 select-none">
                CONTROLS: {getKeyDisplay(controls.left)}/{getKeyDisplay(controls.right)} Move, {getKeyDisplay(controls.down)} Crouch, {getKeyDisplay(controls.jump)} Jump, {getKeyDisplay(controls.doubleJump)} Double Jump, ESC to Exit
            </div>
        )}

        <button 
            onClick={handleExit}
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
                        onClick={() => setCurrentMap({...currentMap})}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded shadow-lg"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={handleExit}
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
                        onClick={handleExit}
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
