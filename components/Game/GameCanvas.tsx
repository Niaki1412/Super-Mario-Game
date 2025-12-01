
import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap, Entity, Particle, Rect } from '../../types';
import { getElementByName, getElementById, GAME_ELEMENTS_REGISTRY } from '../../elementRegistry';
import { PLAYER_CONFIG } from '../../playerConfig';
import { audioManager } from '../../audioManager';
import { GAME_SETTINGS } from '../../gameSettings';

interface ExtendedEntity extends Entity {
    bulletVariant?: 'fireball' | 'banana';
}

interface GameCanvasProps {
    mapData: GameMap;
    width?: number;
    height?: number;
    controls: { left: string; right: string; down: string; jump: string; shoot: string; doubleJump: string };
    character: string;
    onScoreUpdate: (score: number) => void;
    onGameOver: () => void;
    onGameWon: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
    mapData,
    width,
    height,
    controls,
    character,
    onScoreUpdate,
    onGameOver,
    onGameWon
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const mapRef = useRef<GameMap>(mapData);

    const entitiesRef = useRef<ExtendedEntity[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const keysRef = useRef<Record<string, boolean>>({});
    const prevKeysRef = useRef<Record<string, boolean>>({});
    const scoreRef = useRef(0);
    const isGameOverRef = useRef(false);
    const isWonRef = useRef(false);
    const lastDirRef = useRef(1);

    // Texture Cache
    const textureCache = useRef<Map<string, PIXI.Texture>>(new Map());

    // --- Helpers ---
    const checkRectCollision = (r1: Rect, r2: Rect) => {
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

    // Preload Textures
    useEffect(() => {
        if (mapData.customImages) {
            const load = async () => {
                for (const img of mapData.customImages) {
                    if (!textureCache.current.has(img.id)) {
                        try {
                            const tex = await PIXI.Assets.load(img.data);
                            textureCache.current.set(img.id, tex);
                        } catch(e) {
                            console.warn("Failed to load texture", img.name, e);
                        }
                    }
                }
            };
            load();
        }
    }, [mapData]);

    // --- Initialization ---
    useEffect(() => {
        let app: PIXI.Application;
        
        const initGame = async () => {
            app = new PIXI.Application();
            const initOptions: Partial<PIXI.ApplicationOptions> = {
                backgroundColor: mapData.backgroundColor || '#5C94FC',
                preference: 'webgl'
            };

            if (width && height) {
                initOptions.width = width;
                initOptions.height = height;
            } else {
                initOptions.resizeTo = window;
            }

            await app.init(initOptions);

            if (containerRef.current) {
                while (containerRef.current.firstChild) {
                    containerRef.current.removeChild(containerRef.current.firstChild);
                }
                containerRef.current.appendChild(app.canvas);
            }
            appRef.current = app;

            // Layers
            const customImgLayer = new PIXI.Container();
            customImgLayer.label = 'game-custom-images';
            app.stage.addChild(customImgLayer);

            const graphics = new PIXI.Graphics();
            graphics.label = 'game-graphics';
            app.stage.addChild(graphics);
            
            const labels = new PIXI.Container();
            labels.label = 'game-labels';
            app.stage.addChild(labels);

            // Reset State
            mapRef.current = mapData;
            scoreRef.current = 0;
            onScoreUpdate(0);
            isGameOverRef.current = false;
            isWonRef.current = false;
            particlesRef.current = [];
            lastDirRef.current = 1;
            keysRef.current = {};
            prevKeysRef.current = {};

            // Inputs
            const onKeyDown = (e: KeyboardEvent) => { keysRef.current[e.key] = true; };
            const onKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('keyup', onKeyUp);

            audioManager.startBGM();

            // Populate Entities
            const newEntities: ExtendedEntity[] = [];
            const tileSize = mapData.tileSize;
            const scaleRatio = tileSize / 32;
            
            let startX = 100, startY = 100;
            const playerStart = mapData.objects.find(o => o.type === 'Player Start');
            if (playerStart) {
                startX = playerStart.x;
                startY = playerStart.y;
            }

            newEntities.push({
                id: 'player',
                type: 'player',
                x: startX,
                y: startY,
                w: PLAYER_CONFIG.small.width * scaleRatio,
                h: PLAYER_CONFIG.small.height * scaleRatio,
                vx: 0, vy: 0,
                isDead: false, grounded: false,
                isPlayer: true, isBig: false, canShoot: false,
                hasGravity: true, invincibleTimer: 0, shootCooldown: 0,
                jumpCount: 0, isCrouching: false
            });

            mapData.objects.forEach(obj => {
                if (obj.type === 'Player Start') return;
                if (obj.type === 'CustomImage') {
                    newEntities.push({
                        id: obj.id, type: 'CustomImage',
                        x: obj.x, y: obj.y, w: 0, h: 0, vx: 0, vy: 0,
                        isDead: false, grounded: false,
                        customImageId: obj.properties?.customImageId,
                        opacity: obj.properties?.opacity,
                        scale: obj.properties?.scale
                    });
                    return;
                }

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
                    x: obj.x, y: y,
                    w: tileSize, h: h,
                    vx: config.category === 'enemy' ? -(config.attributes?.speed ?? 1) * scaleRatio : 0,
                    vy: 0,
                    isDead: false, grounded: false,
                    isEnemy: config.category === 'enemy',
                    isCollectible: config.category === 'collectible',
                    patrolCenter: obj.x,
                    hasGravity: config.attributes?.gravity ?? true,
                    text: obj.text,
                    isShell: false,
                    // New Enemy States
                    plantState: 'hidden', plantTimer: 0, plantOffset: 0,
                    spikeState: 'hidden', spikeTimer: 0, rotationAngle: 0,
                    jumpTimer: 0, shootTimer: 0,
                    bombState: 'walking', bombTimer: 0
                });
            });

            entitiesRef.current = newEntities;

            // Game Loop
            app.ticker.add((ticker) => {
                if (isGameOverRef.current || isWonRef.current || !mapRef.current) return;
                
                // Apply Time Scale from Settings
                const rawDelta = ticker.deltaTime;
                const safeDelta = Math.min(rawDelta, GAME_SETTINGS.maxDelta);
                const delta = safeDelta * GAME_SETTINGS.timeScale;
                
                updatePhysics(delta);
                render(app);
            });

            return () => {
                 window.removeEventListener('keydown', onKeyDown);
                 window.removeEventListener('keyup', onKeyUp);
            }
        };

        const cleanup = initGame();

        return () => {
            if (appRef.current) {
                appRef.current.destroy({ removeView: true });
            }
            audioManager.stopBGM();
            cleanup.then(clean => clean && clean());
        };
    }, [mapData, width, height]);


    // --- Game Logic ---

    const addScore = (points: number) => {
        scoreRef.current += points;
        onScoreUpdate(scoreRef.current);
    };

    const spawnParticles = (x: number, y: number, color: number) => {
        for (let i = 0; i < 6; i++) {
            particlesRef.current.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                color,
                life: 40
            });
        }
    };

    const die = () => {
        if (isGameOverRef.current || isWonRef.current) return;
        isGameOverRef.current = true;
        onGameOver();
        audioManager.playDie();
        
        const player = entitiesRef.current.find(e => e.isPlayer);
        if (player) {
            player.isDead = true;
            player.vx = 0;
            player.vy = -10;
        }
    };

    const winLevel = () => {
        if (isGameOverRef.current || isWonRef.current) return;
        isWonRef.current = true;
        onGameWon();
        addScore(1000);
        audioManager.playWin();
    };

    const takeDamage = (entity: Entity) => {
        if (entity.invincibleTimer && entity.invincibleTimer > 0) return;
        if (isGameOverRef.current || isWonRef.current) return;

        if (entity.isBig) {
            entity.isBig = false;
            entity.canShoot = false;
            entity.invincibleTimer = GAME_SETTINGS.damageInvincibility;
            const scaleRatio = mapRef.current.tileSize / 32;
            const newH = PLAYER_CONFIG.small.height * scaleRatio;
            entity.y += (entity.h - newH);
            entity.h = newH;
            audioManager.playBump();
        } else {
            die();
        }
    };

    const spawnBullet = (source: Entity, isPlayerBullet: boolean) => {
        const tileSize = mapRef.current.tileSize;
        const scaleRatio = tileSize / 32;
        
        const dir = source.vx !== 0 ? Math.sign(source.vx) : lastDirRef.current;
        const isWukong = character === 'wukong';
        
        const variant = isPlayerBullet ? (isWukong ? 'banana' : 'fireball') : 'fireball';
        
        entitiesRef.current.push({
            id: `bullet-${Math.random()}`,
            type: 'Bullet',
            x: source.x + (dir > 0 ? source.w : -PLAYER_CONFIG.projectile.width * scaleRatio),
            y: source.y + source.h * 0.4,
            w: PLAYER_CONFIG.projectile.width * scaleRatio,
            h: PLAYER_CONFIG.projectile.height * scaleRatio,
            vx: dir * (isPlayerBullet ? PLAYER_CONFIG.physics.bulletSpeed : 3) * scaleRatio,
            vy: isWukong ? -4 : 0,
            isDead: false, grounded: false, isBullet: true,
            isEnemy: !isPlayerBullet, // Enemy bullets hurt player
            bulletVariant: variant,
            hasGravity: isWukong
        } as ExtendedEntity);
        
        audioManager.playShoot();
    };

    const explodeBomb = (bomb: ExtendedEntity) => {
        spawnParticles(bomb.x + bomb.w/2, bomb.y + bomb.h/2, 0xFF4400);
        bomb.isDead = true;
        audioManager.playBump(); // Boom

        // Radius check for damage
        const cx = bomb.x + bomb.w/2;
        const cy = bomb.y + bomb.h/2;
        const radius = mapRef.current.tileSize * 2;

        entitiesRef.current.forEach(e => {
            if(e === bomb || e.isDead) return;
            const dx = (e.x + e.w/2) - cx;
            const dy = (e.y + e.h/2) - cy;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < radius) {
                if (e.isPlayer) takeDamage(e);
                else { e.isDead = true; addScore(100); spawnParticles(e.x, e.y, 0x555555); }
            }
        });

        // Destroy blocks
        const map = mapRef.current;
        const tileSize = map.tileSize;
        const tx = Math.floor(cx / tileSize);
        const ty = Math.floor(cy / tileSize);
        
        for(let y = ty - 1; y <= ty + 1; y++) {
            for(let x = tx - 1; x <= tx + 1; x++) {
                if (y < 0 || y >= map.height || x < 0 || x >= map.width) continue;
                const tid = map.tiles[y][x];
                const el = getElementById(tid);
                if (el?.attributes?.destructible) {
                    map.tiles[y][x] = 0;
                    spawnParticles(x * tileSize, y * tileSize, el.color);
                }
            }
        }
    };

    const handleTileCollision = (entity: ExtendedEntity, map: GameMap, axis: 'x' | 'y') => {
        const tileSize = map.tileSize;
        const left = Math.floor(entity.x / tileSize);
        const right = Math.floor((entity.x + entity.w - 0.01) / tileSize);
        const top = Math.floor(entity.y / tileSize);
        const bottom = Math.floor((entity.y + entity.h - 0.01) / tileSize);

        // Reset Physics modifiers
        if (axis === 'y') {
            entity.isInWater = false;
            entity.frictionMultiplier = 1;
        }

        // Overlap Check for Liquid/Gas (Non-solid tiles)
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                if (y < 0 || y >= map.height || x < 0 || x >= map.width) continue;
                const tileId = map.tiles[y][x];
                const el = getElementById(tileId);
                
                if (el?.attributes?.liquidType === 'water') {
                    entity.isInWater = true;
                } else if (el?.attributes?.liquidType === 'lava') {
                    if (entity.isPlayer) takeDamage(entity);
                    else if (!entity.isBullet && !entity.hasGravity) { /* Flying things safe */ }
                    else { entity.isDead = true; }
                }

                // Ice check (if standing on it)
                if (axis === 'y' && y === bottom && el?.attributes?.friction !== undefined) {
                    entity.frictionMultiplier = el.attributes.friction;
                }
            }
        }

        if (axis === 'x') {
            if (entity.vx > 0) {
                if (right >= map.width) { 
                    entity.x = map.width * tileSize - entity.w; 
                    if (entity.isEnemy) entity.vx = -entity.vx; 
                    else entity.vx = 0; 
                    return; 
                }
                for (let y = top; y <= bottom; y++) {
                     if (y < 0 || y >= map.height) continue;
                     const tileId = map.tiles[y][right];
                     if (isSolid(tileId)) {
                         entity.x = right * tileSize - entity.w;
                         if (entity.isEnemy) entity.vx = -Math.abs(entity.vx);
                         else entity.vx = 0;
                         if (!entity.isEnemy && entity.isBullet) { entity.isDead = true; spawnParticles(entity.x + entity.w, entity.y, 0xFFD700); }
                         return;
                     }
                }
            } else if (entity.vx < 0) {
                if (left < 0) { 
                    entity.x = 0; 
                    if (entity.isEnemy) entity.vx = -entity.vx;
                    else entity.vx = 0; 
                    return; 
                }
                for (let y = top; y <= bottom; y++) {
                    if (y < 0 || y >= map.height) continue;
                    const tileId = map.tiles[y][left];
                    if (isSolid(tileId)) {
                        entity.x = (left + 1) * tileSize;
                        if (entity.isEnemy) entity.vx = Math.abs(entity.vx);
                        else entity.vx = 0;
                        if (!entity.isEnemy && entity.isBullet) { entity.isDead = true; spawnParticles(entity.x, entity.y, 0xFFD700); }
                        return;
                    }
                }
            }
        } else { // Y
            if (entity.vy > 0) {
                if (bottom >= map.height) {
                    // Fall off map
                    return;
                }
                for (let x = left; x <= right; x++) {
                    if (x < 0 || x >= map.width) continue;
                    const tileId = map.tiles[bottom][x];
                    if (isSolid(tileId)) {
                        entity.y = bottom * tileSize - entity.h;
                        entity.vy = 0;
                        entity.grounded = true;
                        
                        if (isLethalTile(tileId)) {
                            if (entity.isPlayer) takeDamage(entity);
                            else if (!entity.isBullet) entity.isDead = true; 
                        }
                        if (entity.isBullet) { entity.isDead = true; spawnParticles(entity.x, entity.y + entity.h, 0xFFD700); }
                        return;
                    }
                    if (isLethalTile(tileId)) {
                        if (entity.isPlayer) takeDamage(entity);
                        else if (!entity.isBullet) entity.isDead = true;
                    }
                }
            } else if (entity.vy < 0) {
                if (top < 0) { entity.y = 0; entity.vy = 0; return; }
                for (let x = left; x <= right; x++) {
                    if (x < 0 || x >= map.width) continue;
                    const tileId = map.tiles[top][x];
                    if (isSolid(tileId)) {
                        entity.y = (top + 1) * tileSize;
                        entity.vy = 0;
                        if (entity.isPlayer) {
                            const el = getElementById(tileId);
                            if (el?.attributes?.destructible && entity.isBig) {
                                map.tiles[top][x] = 0;
                                spawnParticles(x * tileSize + tileSize/2, top * tileSize + tileSize/2, el.color);
                                audioManager.playBump();
                                addScore(10);
                            } else if (el?.attributes?.variant === 'question') {
                                map.tiles[top][x] = 6; // Empty
                                addScore(100);
                                audioManager.playCoin();
                            } else {
                                audioManager.playBump();
                            }
                        } else if (entity.isBullet) {
                            entity.isDead = true;
                            spawnParticles(entity.x, entity.y, 0xFFD700);
                        }
                        return;
                    }
                }
            }
        }
    };

    const updatePhysics = (delta: number) => {
        const map = mapRef.current;
        const entities = entitiesRef.current;
        const keys = { ...keysRef.current };
        const prevKeys = prevKeysRef.current;
        const tileSize = map.tileSize;
        const phys = PLAYER_CONFIG.physics;
        const scaleRatio = tileSize / 32;

        entitiesRef.current = entities.filter(e => {
            if (e.isDead && !e.isPlayer) return false;
            if (e.isEffect && e.vy > 5) return false; 
            if (e.isBullet && (e.x < 0 || e.x > map.width * tileSize || e.y > map.height * tileSize)) return false;
            return true;
        });
        
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
            if (entity.type === 'CustomImage') return;

            // -- Gravity & Water Physics --
            if (entity.hasGravity) {
                let effectiveGravity = phys.gravity * scaleRatio;
                let effectiveTerminal = phys.terminalVelocity * scaleRatio;
                
                if (entity.isInWater) {
                    effectiveGravity *= 0.3; // Low gravity
                    effectiveTerminal *= 0.3; // Slower falling
                    // Apply drag
                    entity.vy *= 0.95;
                    entity.vx *= 0.95;
                }

                entity.vy += effectiveGravity * delta;
                if (entity.vy > effectiveTerminal) entity.vy = effectiveTerminal;
            }

            if (entity.isBullet) {
                entity.x += entity.vx * delta;
                if (entity.bulletVariant === 'banana') {
                    entity.y += entity.vy * delta;
                } else {
                    const tile = getTileAt(entity.x + entity.w/2, entity.y + entity.h/2, map);
                    if (isSolid(tile)) {
                        entity.isDead = true;
                        spawnParticles(entity.x, entity.y, 0xFF4400);
                        return;
                    }
                }
                
                if (entity.bulletVariant === 'banana') {
                    handleTileCollision(entity, map, 'y');
                    handleTileCollision(entity, map, 'x');
                }

                entities.forEach(other => {
                    if (other === entity || other.isDead) return;
                    
                    // Logic: Player Bullet hits Enemy, Enemy Bullet hits Player
                    const isFriendlyFire = (entity.isEnemy && other.isEnemy) || (!entity.isEnemy && other.isPlayer);
                    if (isFriendlyFire) return;

                    if (checkRectCollision(entity, other)) {
                        entity.isDead = true;
                        if (other.isPlayer) {
                            takeDamage(other);
                        } else {
                            other.isDead = true;
                            addScore(100);
                            spawnParticles(other.x, other.y, 0xFF4400);
                            audioManager.playStomp();
                        }
                    }
                });
                return;
            }

            if (entity.isPlayer && !entity.isDead) {
                // Apply friction multiplier (Ice)
                const effectiveFriction = entity.grounded && entity.frictionMultiplier 
                    ? phys.friction * entity.frictionMultiplier 
                    : phys.friction;

                const effectiveAccel = entity.grounded && entity.frictionMultiplier && entity.frictionMultiplier < 1
                    ? phys.acceleration * 0.2 // Harder to accelerate on ice
                    : phys.acceleration;

                if (keys[controls.left]) {
                    entity.vx -= effectiveAccel * scaleRatio * delta;
                } else if (keys[controls.right]) {
                    entity.vx += effectiveAccel * scaleRatio * delta;
                } else {
                    entity.vx *= effectiveFriction;
                }

                if (entity.grounded && keys[controls.down]) {
                    if (!entity.isCrouching) {
                        entity.isCrouching = true;
                        const originalH = (entity.isBig ? PLAYER_CONFIG.big.height : PLAYER_CONFIG.small.height) * scaleRatio;
                        entity.h = originalH * 0.6; 
                        entity.y += (originalH - entity.h);
                    }
                } else {
                    if (entity.isCrouching) {
                         entity.isCrouching = false;
                         const targetH = (entity.isBig ? PLAYER_CONFIG.big.height : PLAYER_CONFIG.small.height) * scaleRatio;
                         entity.y -= (targetH - entity.h);
                         entity.h = targetH;
                    }
                }

                if (Math.abs(entity.vx) > 0.1) {
                    lastDirRef.current = Math.sign(entity.vx);
                }

                const jumpJustPressed = keys[controls.jump] && !prevKeys[controls.jump];
                const doubleJumpJustPressed = keys[controls.doubleJump] && !prevKeys[controls.doubleJump];
                const jumpRequested = jumpJustPressed || doubleJumpJustPressed;

                // Jump / Swim Logic
                if (entity.isInWater) {
                    entity.grounded = false; // Always swimming
                    if (jumpRequested) {
                        entity.vy = -5 * scaleRatio; // Swim stroke
                        audioManager.playJump(); // Splash sound ideally
                        spawnParticles(entity.x, entity.y + entity.h, 0xFFFFFF);
                    }
                } else {
                    if (entity.grounded) {
                        entity.jumpCount = 0; 
                        if (jumpRequested) {
                            const force = entity.isBig ? PLAYER_CONFIG.big.jumpForce : PLAYER_CONFIG.small.jumpForce;
                            entity.vy = force * scaleRatio;
                            entity.grounded = false;
                            entity.jumpCount = 1;
                            audioManager.playJump();
                        }
                    } else {
                        if (jumpRequested && (entity.jumpCount || 0) < 2) {
                            const force = entity.isBig ? PLAYER_CONFIG.big.jumpForce : PLAYER_CONFIG.small.jumpForce;
                            entity.vy = force * 0.9 * scaleRatio; 
                            entity.jumpCount = (entity.jumpCount || 0) + 1;
                            audioManager.playJump();
                            spawnParticles(entity.x, entity.y + entity.h, 0xFFFFFF); 
                        }
                    }
                }
                
                if (keys[controls.shoot]) {
                    if (entity.canShoot && (!entity.shootCooldown || entity.shootCooldown <= 0)) {
                        spawnBullet(entity, true);
                        entity.shootCooldown = GAME_SETTINGS.shootCooldown; 
                    }
                }
                if (entity.shootCooldown && entity.shootCooldown > 0) {
                    entity.shootCooldown -= delta;
                }
                if (entity.invincibleTimer && entity.invincibleTimer > 0) {
                    entity.invincibleTimer -= delta; 
                    if (entity.invincibleTimer < 0) entity.invincibleTimer = 0;
                }

                const maxSpeed = phys.runSpeed * scaleRatio;
                // Don't cap speed if being boosted
                if (Math.abs(entity.vx) > maxSpeed * 3) {
                     // Decelerate faster if super fast
                     entity.vx *= 0.95;
                } else if (Math.abs(entity.vx) > maxSpeed && !keys[controls.left] && !keys[controls.right]) {
                    // Natural decay
                } else {
                    if (entity.vx > maxSpeed) entity.vx = maxSpeed;
                    if (entity.vx < -maxSpeed) entity.vx = -maxSpeed;
                }

                if (entity.y > map.height * tileSize) {
                    die();
                }
            }

            if (entity.isEnemy) {
                 if (entity.type === 'Piranha Plant') {
                     // Existing Logic
                     entity.vx = 0; entity.vy = 0;
                     entity.plantTimer = (entity.plantTimer || 0) + delta;
                     const MAX_HEIGHT = -tileSize * 0.8;
                     const MOVE_SPEED = 0.5 * scaleRatio;
                     if (entity.plantState === 'hidden') {
                         if (entity.plantTimer > 180) { entity.plantState = 'extending'; entity.plantTimer = 0; }
                     } else if (entity.plantState === 'extending') {
                         entity.plantOffset = (entity.plantOffset || 0) - MOVE_SPEED * delta;
                         if (entity.plantOffset <= MAX_HEIGHT) { entity.plantOffset = MAX_HEIGHT; entity.plantState = 'out'; entity.plantTimer = 0; }
                     } else if (entity.plantState === 'out') {
                         if (entity.plantTimer > 180) { entity.plantState = 'retracting'; entity.plantTimer = 0; }
                     } else if (entity.plantState === 'retracting') {
                         entity.plantOffset = (entity.plantOffset || 0) + MOVE_SPEED * delta;
                         if (entity.plantOffset >= 0) { entity.plantOffset = 0; entity.plantState = 'hidden'; entity.plantTimer = 0; }
                     }
                 } else if (entity.type === 'Bouncing Hopper') {
                     if (entity.grounded) {
                         entity.vx = 0;
                         entity.jumpTimer = (entity.jumpTimer || 0) + delta;
                         if (entity.jumpTimer > 60) {
                             entity.vy = -12 * scaleRatio; // High jump
                             entity.grounded = false;
                             entity.jumpTimer = 0;
                         }
                     }
                 } else if (entity.type === 'Fire Dino') {
                     entity.shootTimer = (entity.shootTimer || 0) + delta;
                     if (entity.shootTimer > 180) {
                         // Only shoot if player is within range
                         const player = entities.find(p => p.isPlayer);
                         if (player && Math.abs(player.x - entity.x) < tileSize * 8) {
                             spawnBullet(entity, false);
                         }
                         entity.shootTimer = 0;
                     }
                 } else if (entity.type === 'Bob-omb') {
                     const player = entities.find(p => p.isPlayer);
                     if (entity.bombState === 'walking') {
                         // Ignite if player is close
                         if (player && Math.abs(player.x - entity.x) < tileSize * 3 && Math.abs(player.y - entity.y) < tileSize * 2) {
                             entity.bombState = 'ignited';
                             entity.bombTimer = 120; // 2 seconds
                             entity.vx = 0; // Stop moving when ignited
                         }
                     } else if (entity.bombState === 'ignited') {
                         entity.bombTimer = (entity.bombTimer || 0) - delta;
                         if (entity.bombTimer <= 0) {
                             explodeBomb(entity);
                         }
                     }
                 } else if (entity.type === 'Pop-up Spike') {
                     // Existing Logic
                     entity.vx = 0; entity.vy = 0;
                     entity.spikeTimer = (entity.spikeTimer || 0) + delta;
                     if (entity.spikeState === 'hidden') { if (entity.spikeTimer > 120) { entity.spikeState = 'warning'; entity.spikeTimer = 0; }
                     } else if (entity.spikeState === 'warning') { if (entity.spikeTimer > 30) { entity.spikeState = 'active'; entity.spikeTimer = 0; }
                     } else if (entity.spikeState === 'active') { if (entity.spikeTimer > 60) { entity.spikeState = 'hidden'; entity.spikeTimer = 0; } }
                 } else if (entity.type === 'Rotating Spike') {
                     entity.vx = 0; entity.vy = 0; entity.rotationAngle = (entity.rotationAngle || 0) + 0.05 * delta;
                 } else if (entity.type === 'Lightning Trap') {
                     entity.vx = 0; entity.vy = 0;
                     // Constant hazard
                 } else if (entity.isShell && Math.abs(entity.vx) > 2) {
                     entitiesRef.current.forEach(other => {
                         if (other === entity || other.isDead || other.isPlayer || other.isEffect || other.isBullet) return;
                         if (other.isEnemy && checkRectCollision(entity, other)) {
                             other.isDead = true;
                             addScore(200);
                             spawnParticles(other.x, other.y, 0xFFFFFF);
                             audioManager.playStomp();
                         }
                     });
                 }
            }

            entity.x += entity.vx * delta;
            handleTileCollision(entity, map, 'x');

            entity.grounded = false; 
            entity.y += entity.vy * delta;
            handleTileCollision(entity, map, 'y');

            if (entity.isPlayer && !entity.isDead) {
                entitiesRef.current.forEach(other => {
                    if (entity === other || other.isDead || other.isEffect || other.isBullet || other.type === 'CustomImage') return;

                    if (checkRectCollision(entity, other)) {
                        const config = getElementByName(other.type);
                        if (config?.attributes?.win) { winLevel(); return; }
                        
                        // New Objects Logic
                        if (other.type === 'Spring') {
                            // Only bounce if falling onto it
                            if (entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.5) {
                                entity.vy = (config?.attributes?.bounceForce || -15) * scaleRatio;
                                entity.grounded = false;
                                entity.jumpCount = 1;
                                audioManager.playJump();
                                return;
                            }
                        }

                        if (other.type === 'Boost Pad') {
                            const boost = config?.attributes?.boostSpeed || 10;
                            entity.vx = boost * lastDirRef.current * scaleRatio;
                            audioManager.playCoin(); // Sound effect
                            spawnParticles(entity.x, entity.y + entity.h, 0x00E676);
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
                                    const headRect = { x: other.x + other.w * 0.2, y: other.y + offset + other.h * 0.2, w: other.w * 0.6, h: other.h * 0.6 };
                                    if (checkRectCollision(entity, headRect)) takeDamage(entity);
                                }
                                return;
                            }
                            if (other.type === 'Pop-up Spike') {
                                if (other.spikeState === 'active') takeDamage(entity);
                                return;
                            }
                            if (other.type === 'Lightning Trap') {
                                takeDamage(entity);
                                return;
                            }
                            if (other.type === 'Rotating Spike') return;
                            if (other.type === 'Bob-omb' && other.bombState === 'ignited') {
                                takeDamage(entity); // Touch ignored bomb hurts
                                return;
                            }

                            const isStomp = entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.7;
                            if (isStomp) {
                                if (other.type === 'Turtle' || other.type === 'Flying Turtle') {
                                    entity.vy = phys.bounceForce * scaleRatio;
                                    audioManager.playStomp();
                                    if (!other.isShell) { 
                                        other.isShell = true; 
                                        other.vx = 0; 
                                        other.hasGravity = true; // Flying turtle loses wings
                                        addScore(100); 
                                    } else { other.vx = 0; }
                                } else if (other.type === 'Bob-omb') {
                                    // Stomping bob-omb ignites it and kicks it away slightly
                                    entity.vy = phys.bounceForce * scaleRatio;
                                    other.bombState = 'ignited';
                                    other.bombTimer = 120;
                                    other.vx = 0;
                                } else {
                                    other.isDead = true;
                                    entity.vy = phys.bounceForce * scaleRatio; 
                                    addScore(100);
                                    spawnParticles(other.x, other.y, 0xA0522D);
                                    audioManager.playStomp();
                                }
                            } else {
                                if ((other.type === 'Turtle' || other.type === 'Flying Turtle') && other.isShell && Math.abs(other.vx) < 0.1) {
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
                        const ballRect = { x: ballX - ballRadius, y: ballY - ballRadius, w: ballRadius * 2, h: ballRadius * 2 };
                        if (checkRectCollision(entity, ballRect)) takeDamage(entity);
                    }
                });
            }
        });

        prevKeysRef.current = { ...keys };
    };

    // --- Rendering ---
    const drawMario = (g: PIXI.Graphics, e: Entity) => {
        const x = e.x; const y = e.y; const w = e.w; const h = e.h;
        const isBig = e.isBig; const canShoot = e.canShoot;
        const isRight = lastDirRef.current > 0;
        const colors = canShoot ? PLAYER_CONFIG.fireAppearance : PLAYER_CONFIG.appearance;
        const tx = (lx: number, fw: number) => isRight ? (x + lx) : (x + w - lx - fw);
        const isRunning = Math.abs(e.vx) > 0.1 && e.grounded;
        const tick = Date.now() / 150;
        const animOffset = isRunning ? Math.sin(tick) * (w * 0.15) : 0;
        const legH = isBig ? h * 0.2 : h * 0.25;
        const bodyH = isBig ? h * 0.4 : h * 0.4;
        const headH = isBig ? h * 0.25 : h * 0.35;
        const legW = w * 0.25;
        const blX = w * 0.2 + animOffset;
        g.rect(tx(blX, legW), y + h - legH, legW, legH).fill(colors.overalls);
        const flX = w * 0.55 - animOffset;
        g.rect(tx(flX, legW), y + h - legH, legW, legH).fill(colors.overalls);
        const bodyY = y + h - legH - bodyH;
        g.rect(tx(w*0.2, w*0.6), bodyY, w*0.6, bodyH).fill(colors.overalls);
        g.rect(tx(w*0.15, w*0.7), bodyY, w*0.7, bodyH * 0.6).fill(colors.shirt);
        g.rect(tx(w*0.2, w*0.15), bodyY, w*0.15, bodyH * 0.8).fill(colors.overalls);
        g.rect(tx(w*0.65, w*0.15), bodyY, w*0.15, bodyH * 0.8).fill(colors.overalls);
        g.circle(tx(w*0.275, 0), bodyY + bodyH * 0.4, 2).fill(colors.buttons);
        g.circle(tx(w*0.725, 0), bodyY + bodyH * 0.4, 2).fill(colors.buttons);
        const armY = bodyY + bodyH * 0.1;
        const baX = w * 0.1 + animOffset;
        g.rect(tx(baX, w*0.2), armY, w*0.2, bodyH * 0.5).fill(colors.shirt);
        const faX = w * 0.7 - animOffset;
        g.rect(tx(faX, w*0.2), armY, w*0.2, bodyH * 0.5).fill(colors.shirt);
        g.circle(tx(baX + w*0.1, 0), armY + bodyH * 0.5, w*0.12).fill(colors.skin);
        g.circle(tx(faX + w*0.1, 0), armY + bodyH * 0.5, w*0.12).fill(colors.skin);
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

    const drawWukong = (g: PIXI.Graphics, e: Entity) => {
        const x = e.x; const y = e.y; const w = e.w; const h = e.h;
        const isBig = e.isBig; 
        const isRight = lastDirRef.current > 0;
        const tx = (lx: number, fw: number) => isRight ? (x + lx) : (x + w - lx - fw);
        const tick = Date.now() / 150;
        const isRunning = Math.abs(e.vx) > 0.1 && e.grounded;
        const animOffset = isRunning ? Math.sin(tick) * (w * 0.1) : 0;

        if (isBig) {
            const furColor = 0x333333; 
            const chestColor = 0x222222;
            g.rect(tx(w*0.1, w*0.3), y + h*0.7, w*0.3, h*0.3).fill(furColor); 
            g.rect(tx(w*0.6, w*0.3), y + h*0.7, w*0.3, h*0.3).fill(furColor); 
            g.rect(tx(w*0.05, w*0.9), y + h*0.25, w*0.9, h*0.55).fill(furColor);
            g.rect(tx(w*0.2, w*0.6), y + h*0.3, w*0.6, h*0.3).fill(chestColor);
            g.rect(tx(w*0.3 + animOffset, w*0.2), y + h*0.3, w*0.2, h*0.5).fill(furColor);
            g.rect(tx(w*0.2, w*0.6), y, w*0.6, h*0.3).fill(furColor);
            g.rect(tx(w*0.6, w*0.15), y + h*0.1, w*0.15, h*0.05).fill(0xFFFFFF); 
            g.circle(tx(w*0.65, 0), y + h*0.1, 2).fill(0xFF0000); 
            const maceX = isRight ? x + w*0.8 : x + w*0.2;
            const maceY = y + h*0.5;
            g.moveTo(maceX, maceY).lineTo(maceX + (isRight?20:-20), maceY - 40).stroke({width: 6, color: 0x888888});
            g.circle(maceX + (isRight?20:-20), maceY - 40, 10).fill(0x555555);
            g.circle(maceX + (isRight?24:-24), maceY - 44, 2).fill(0xAAAAAA);
            g.circle(maceX + (isRight?16:-16), maceY - 36, 2).fill(0xAAAAAA);
        } else {
            const furColor = 0x8B4513; 
            const faceColor = 0xFFCCAA; 
            const clothesColor = 0xFFD700; 
            const tailX = isRight ? x : x + w;
            const tailEnd = isRight ? x - 10 : x + w + 10;
            g.moveTo(tailX + (isRight?w*0.2:-w*0.2), y + h*0.8)
             .quadraticCurveTo(tailEnd, y + h*0.5, tailEnd + (isRight?-5:5), y + h*0.3)
             .stroke({width: 3, color: furColor});
            g.rect(tx(w*0.2 + animOffset, w*0.2), y + h*0.7, w*0.2, h*0.3).fill(furColor);
            g.rect(tx(w*0.6 - animOffset, w*0.2), y + h*0.7, w*0.2, h*0.3).fill(furColor);
            g.rect(tx(w*0.25, w*0.5), y + h*0.4, w*0.5, h*0.35).fill(furColor);
            g.rect(tx(w*0.3, w*0.4), y + h*0.4, w*0.4, h*0.2).fill(clothesColor);
            g.circle(tx(w*0.5, 0), y + h*0.25, w*0.35).fill(furColor);
            g.circle(tx(w*0.55, 0), y + h*0.28, w*0.25).fill(faceColor);
            g.circle(tx(w*0.65, 0), y + h*0.25, 2).fill(0x000000);
            const stickX = isRight ? x + w*0.8 : x + w*0.2;
            const stickY = y + h*0.6;
            g.moveTo(stickX, stickY + 10).lineTo(stickX + (isRight?10:-10), stickY - 25).stroke({width: 3, color: 0xFF0000});
            g.circle(stickX, stickY + 10, 2).fill(0xFFD700);
            g.circle(stickX + (isRight?10:-10), stickY - 25, 2).fill(0xFFD700);
        }
    };

    const render = (app: PIXI.Application) => {
        const g = app.stage.getChildByLabel('game-graphics') as PIXI.Graphics;
        const labels = app.stage.getChildByLabel('game-labels') as PIXI.Container;
        const customImgLayer = app.stage.getChildByLabel('game-custom-images') as PIXI.Container;
        
        if (!g || !labels || !customImgLayer) return;
        const tileSize = mapRef.current.tileSize;

        g.clear();
        labels.removeChildren().forEach(c => c.destroy({ texture: true }));
        customImgLayer.removeChildren().forEach(c => c.destroy());

        let cameraX = 0;
        const player = entitiesRef.current.find(e => e.isPlayer);
        if (player) {
            cameraX = Math.max(0, player.x - (width || window.innerWidth) / 2);
        }
        app.stage.position.x = -cameraX;

        const viewW = width || window.innerWidth;
        const startCol = Math.floor(cameraX / tileSize);
        const endCol = startCol + Math.ceil(viewW / tileSize) + 1;

        mapRef.current.tiles.forEach((row, y) => {
            for(let x = startCol; x <= endCol; x++) {
                if (x < 0 || x >= row.length) continue;
                const tileId = row[x];
                if (tileId !== 0) {
                    const config = GAME_ELEMENTS_REGISTRY.find(e => e.id === tileId);
                    if (config) config.renderPixi(g, labels, x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        });

        entitiesRef.current.forEach(e => {
            if (e.isDead && !e.isPlayer) return;
            
            if (e.type === 'CustomImage') {
                const imgDef = mapRef.current.customImages?.find(ci => ci.id === e.customImageId);
                if (imgDef) {
                    const texture = textureCache.current.get(e.customImageId || '');
                    if (texture) {
                        const sprite = new PIXI.Sprite(texture);
                        sprite.x = e.x;
                        sprite.y = e.y;
                        sprite.alpha = e.opacity ?? 1;
                        sprite.scale.set(e.scale ?? 1);
                        customImgLayer.addChild(sprite);
                    }
                }
                return;
            }

            if (e.isPlayer) {
                if (character === 'wukong') {
                    drawWukong(g, e);
                } else {
                    drawMario(g, e); 
                }
            } else {
                const config = getElementByName(e.type);
                if (config && config.name !== 'Invisible Death Block') {
                   config.renderPixi(g, labels, e.x, e.y, e.w, e.h, e);
                } else if (e.isBullet) {
                    if (e.bulletVariant === 'banana') {
                        const bx = e.x + e.w/2;
                        const by = e.y + e.h/2;
                        g.moveTo(bx - 5, by - 5).quadraticCurveTo(bx, by + 5, bx + 5, by - 5).stroke({width: 4, color: 0xFFD700});
                    } else if (e.bulletVariant === 'fireball') {
                         g.circle(e.x + e.w/2, e.y + e.h/2, e.w/2).fill(0xFF4400);
                         g.circle(e.x + e.w/2, e.y + e.h/2, e.w/4).fill(0xFFFF00);
                    }
                }
            }
        });

        particlesRef.current.forEach(p => {
            g.rect(p.x, p.y, 4, 4).fill(p.color);
        });
    };

    return <div ref={containerRef} className="absolute inset-0 z-0" />;
};
