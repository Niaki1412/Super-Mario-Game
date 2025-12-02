

import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { GameMap, Entity, Particle, Rect } from '../../types';
import { getElementByName, getElementById, GAME_ELEMENTS_REGISTRY } from '../../elementRegistry';
import { CHARACTERS, COMMON_PHYSICS, HITBOXES } from '../../playerConfig';
import { audioManager } from '../../audioManager';
import { GAME_SETTINGS } from '../../gameSettings';

interface ExtendedEntity extends Entity {
    visualLife?: number; // For visual effects like coin pop
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

    // Character Config Snapshot
    const charConfig = CHARACTERS[character] || CHARACTERS['mario'];

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
            
            // Ink Overlay Layer (Top)
            const inkLayer = new PIXI.Graphics();
            inkLayer.label = 'ink-overlay';
            app.stage.addChild(inkLayer);

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

            // Player Setup
            const hitbox = HITBOXES.small;
            newEntities.push({
                id: 'player',
                type: 'player',
                x: startX,
                y: startY,
                w: hitbox.width * scaleRatio,
                h: hitbox.height * scaleRatio,
                vx: 0, vy: 0,
                isDead: false, grounded: false,
                isPlayer: true, isBig: false, canShoot: false,
                hasGravity: true, invincibleTimer: 0, shootCooldown: 0,
                jumpCount: 0, isCrouching: false,
                spikeImmunity: charConfig.physics.spikeImmunity || false,
                warpState: 'idle',
                starTimer: 0, inkBlindnessTimer: 0
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
                    vx: config.category === 'enemy' && config.name !== 'Lakitu' ? -(config.attributes?.speed ?? 1) * scaleRatio : 0,
                    vy: 0,
                    isDead: false, grounded: false,
                    isEnemy: config.category === 'enemy',
                    isCollectible: config.category === 'collectible',
                    patrolCenter: obj.x,
                    hasGravity: config.attributes?.gravity ?? true,
                    text: obj.text,
                    isShell: false,
                    hp: config.attributes?.hp || 1,
                    maxHp: config.attributes?.hp || 1,
                    
                    // State specific
                    plantState: 'hidden', plantTimer: 0, plantOffset: 0,
                    spikeState: 'hidden', spikeTimer: 0, rotationAngle: 0,
                    jumpTimer: 0, shootTimer: 0,
                    bombState: 'walking', bombTimer: 0,
                    blooperState: 'idle', blooperTimer: 0,
                    lakituTimer: 0,
                    flagProgress: 0
                });
            });

            entitiesRef.current = newEntities;

            // Game Loop
            app.ticker.add((ticker) => {
                // Keep rendering during victory, but might stop physics or change state
                if (isGameOverRef.current || !mapRef.current) return;
                
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
    }, [mapData, width, height, character]);


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

    const spawnVisualEffect = (x: number, y: number, variant: 'coin_pop') => {
        entitiesRef.current.push({
            id: `vfx-${Math.random()}`,
            type: 'VisualEffect',
            x: x, y: y, w: mapRef.current.tileSize, h: mapRef.current.tileSize,
            vx: 0, vy: -5,
            isDead: false, grounded: false,
            hasGravity: true,
            visualLife: 30
        } as ExtendedEntity);
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

    const takeDamage = (entity: Entity) => {
        if (entity.invincibleTimer && entity.invincibleTimer > 0) return;
        if (isGameOverRef.current || isWonRef.current) return;

        if (entity.isBig) {
            entity.isBig = false;
            entity.canShoot = false;
            entity.invincibleTimer = GAME_SETTINGS.damageInvincibility;
            const scaleRatio = mapRef.current.tileSize / 32;
            const newH = HITBOXES.small.height * scaleRatio;
            entity.y += (entity.h - newH);
            entity.h = newH;
            audioManager.playBump();
        } else {
            die();
        }
    };

    const damageEnemy = (enemy: ExtendedEntity, damage: number = 1) => {
        enemy.hp = (enemy.hp || 1) - damage;
        if (enemy.hp <= 0) {
            enemy.isDead = true;
            addScore(100);
            spawnParticles(enemy.x, enemy.y, 0xFF4400);
            audioManager.playStomp();
        } else {
            // Flash effect or pushback could go here
            audioManager.playBump();
            enemy.vx = -enemy.vx; // Pushback
            spawnParticles(enemy.x, enemy.y, 0xFFFFFF);
        }
    };

    const spawnBullet = (source: Entity, isPlayerBullet: boolean) => {
        const tileSize = mapRef.current.tileSize;
        const scaleRatio = tileSize / 32;
        
        const dir = source.vx !== 0 ? Math.sign(source.vx) : lastDirRef.current;
        const variant = isPlayerBullet ? charConfig.skillType : 'fireball';
        
        // Character specific bullet properties
        let gravity = true;
        let vy = 0;
        let speed = COMMON_PHYSICS.bulletSpeed;

        if (variant === 'banana') {
            vy = -4; // Arc up
        } else if (variant === 'shuriken') {
            gravity = false; // Straight line
            speed = 12; 
        } else if (variant === 'magic') {
            gravity = false;
            speed = 5;
        } else if (variant === 'cannon') {
            vy = -2; // Heavy
            speed = 6;
        }

        if (variant === 'shuriken') {
            // Spawn 3 shurikens spread
            [-1, 0, 1].forEach(offsetY => {
                 entitiesRef.current.push({
                    id: `bullet-${Math.random()}`,
                    type: 'Bullet',
                    x: source.x + (dir > 0 ? source.w : -COMMON_PHYSICS.projectileSize.width * scaleRatio),
                    y: source.y + source.h * 0.4,
                    w: COMMON_PHYSICS.projectileSize.width * scaleRatio,
                    h: COMMON_PHYSICS.projectileSize.height * scaleRatio,
                    vx: dir * speed * scaleRatio,
                    vy: offsetY * 2,
                    isDead: false, grounded: false, isBullet: true,
                    isEnemy: !isPlayerBullet,
                    bulletVariant: variant,
                    hasGravity: false
                } as ExtendedEntity);
            });
            audioManager.playShoot();
            return;
        }

        entitiesRef.current.push({
            id: `bullet-${Math.random()}`,
            type: 'Bullet',
            x: source.x + (dir > 0 ? source.w : -COMMON_PHYSICS.projectileSize.width * scaleRatio),
            y: source.y + source.h * 0.4,
            w: COMMON_PHYSICS.projectileSize.width * scaleRatio,
            h: COMMON_PHYSICS.projectileSize.height * scaleRatio,
            vx: dir * speed * scaleRatio,
            vy: vy,
            isDead: false, grounded: false, isBullet: true,
            isEnemy: !isPlayerBullet,
            bulletVariant: variant,
            hasGravity: gravity
        } as ExtendedEntity);
        
        audioManager.playShoot();
    };

    const explodeBomb = (bomb: ExtendedEntity) => {
        spawnParticles(bomb.x + bomb.w/2, bomb.y + bomb.h/2, 0xFF4400);
        bomb.isDead = true;
        audioManager.playBump();

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
                else { 
                    damageEnemy(e, 10);
                }
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

    // --- Collision Logic ---
    const handleTileCollision = (entity: ExtendedEntity, map: GameMap, axis: 'x' | 'y') => {
        const tileSize = map.tileSize;
        const left = Math.floor(entity.x / tileSize);
        const right = Math.floor((entity.x + entity.w - 0.01) / tileSize);
        const top = Math.floor(entity.y / tileSize);
        const bottom = Math.floor((entity.y + entity.h - 0.01) / tileSize);

        if (axis === 'y') {
            entity.isInWater = false;
            entity.frictionMultiplier = 1;
        }

        // 1. Grid based collision
        for (let y = top; y <= bottom; y++) {
            for (let x = left; x <= right; x++) {
                if (y < 0 || y >= map.height || x < 0 || x >= map.width) continue;
                const tileId = map.tiles[y][x];
                const el = getElementById(tileId);
                
                if (el?.attributes?.liquidType === 'water') {
                    entity.isInWater = true;
                } else if (el?.attributes?.liquidType === 'lava') {
                    if (entity.isPlayer) takeDamage(entity);
                    else if (!entity.isBullet && !entity.hasGravity) { }
                    else { entity.isDead = true; }
                }

                if (axis === 'y' && y === bottom && el?.attributes?.friction !== undefined) {
                    entity.frictionMultiplier = el.attributes.friction;
                }
            }
        }

        // 2. Resolve Solid Grid Walls
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
                         if (!entity.isEnemy && entity.isBullet && entity.bulletVariant !== 'banana' && entity.bulletVariant !== 'magic') { 
                             entity.isDead = true; spawnParticles(entity.x + entity.w, entity.y, 0xFFD700); 
                         }
                         // Star bounces
                         if (entity.type === 'Power Star') entity.vx = -entity.vx;
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
                         if (!entity.isEnemy && entity.isBullet && entity.bulletVariant !== 'banana' && entity.bulletVariant !== 'magic') { 
                            entity.isDead = true; spawnParticles(entity.x, entity.y, 0xFFD700); 
                         }
                        // Star bounces
                        if (entity.type === 'Power Star') entity.vx = -entity.vx;
                        return;
                    }
                }
            }
        } else { // Y
            if (entity.vy > 0) {
                if (bottom >= map.height) return;
                for (let x = left; x <= right; x++) {
                    if (x < 0 || x >= map.width) continue;
                    const tileId = map.tiles[bottom][x];
                    if (isSolid(tileId)) {
                        entity.y = bottom * tileSize - entity.h;
                        entity.vy = 0;
                        entity.grounded = true;
                        
                        if (isLethalTile(tileId) && !entity.spikeImmunity && !entity.invincibleTimer) {
                            if (entity.isPlayer) takeDamage(entity);
                            else if (!entity.isBullet) entity.isDead = true; 
                        }
                        // Bullet bounce logic or destroy
                        if (entity.isBullet) { 
                            if(entity.bulletVariant === 'fireball' || entity.bulletVariant === 'cannon') {
                                entity.vy = -3; // Bounce
                            } else {
                                entity.isDead = true; spawnParticles(entity.x, entity.y + entity.h, 0xFFD700); 
                            }
                        }
                        // Star bounces high
                        if (entity.type === 'Power Star') {
                            entity.vy = -8 * (tileSize/32);
                        }
                        return;
                    }
                    if (isLethalTile(tileId) && !entity.spikeImmunity && !entity.invincibleTimer) {
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
                                map.tiles[top][x] = 6; 
                                addScore(100);
                                audioManager.playCoin();
                                spawnVisualEffect(x * tileSize, (top-1) * tileSize, 'coin_pop');
                                
                                // Rare chance to spawn Star
                                if (Math.random() < 0.1) {
                                     entitiesRef.current.push({
                                        id: `star-${Math.random()}`,
                                        type: 'Power Star',
                                        x: x * tileSize, y: (top-1) * tileSize,
                                        w: tileSize, h: tileSize,
                                        vx: 2, vy: -5,
                                        isDead: false, grounded: false,
                                        isCollectible: true, hasGravity: true
                                     } as ExtendedEntity);
                                }
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

        // 3. Resolve Solid Object Walls (Pipes, Springs, etc.)
        // Only if not bullet or effect
        if (entity.isBullet || entity.isEffect || entity.type === 'VisualEffect') return;
        
        entitiesRef.current.forEach(other => {
            if (other === entity || other.type === 'CustomImage') return;
            const config = getElementByName(other.type);
            // Check if object is solid
            if (config?.attributes?.solid) {
                if (checkRectCollision(entity, other)) {
                    // Resolve simple push out
                    const overlapX = (entity.w + other.w) / 2 - Math.abs((entity.x + entity.w/2) - (other.x + other.w/2));
                    const overlapY = (entity.h + other.h) / 2 - Math.abs((entity.y + entity.h/2) - (other.y + other.h/2));

                    if (overlapX > 0 && overlapY > 0) {
                        // Resolve along shallowest axis
                        if (overlapX < overlapY) {
                            // X resolution
                            if (axis === 'x') {
                                if (entity.x < other.x) entity.x -= overlapX;
                                else entity.x += overlapX;
                                entity.vx = 0;
                                if (entity.isEnemy) entity.vx = -entity.vx; 
                            }
                        } else {
                            // Y resolution
                            if (axis === 'y') {
                                if (entity.y < other.y) {
                                    entity.y -= overlapY;
                                    entity.grounded = true;
                                } else {
                                    entity.y += overlapY;
                                }
                                entity.vy = 0;
                            }
                        }
                    }
                }
            }
        });
    };

    const updatePhysics = (delta: number) => {
        const map = mapRef.current;
        const entities = entitiesRef.current;
        const keys = { ...keysRef.current };
        const prevKeys = prevKeysRef.current;
        const tileSize = map.tileSize;
        const scaleRatio = tileSize / 32;
        
        const phys = COMMON_PHYSICS;
        const player = entitiesRef.current.find(e => e.isPlayer);

        entitiesRef.current = entities.filter(e => {
            if (e.type === 'VisualEffect') {
                if(e.visualLife && e.visualLife > 0) return true;
                return false;
            }
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
            // Visual Effect Logic
            if (entity.type === 'VisualEffect') {
                entity.y += entity.vy * delta;
                entity.visualLife = (entity.visualLife || 0) - delta;
                return;
            }

            if (entity.isDead && !entity.isPlayer) return;
            if (entity.type === 'CustomImage') return;

            // --- Entity Logic Updates (Animations/AI) ---
            if (entity.type === 'Pop-up Spike') {
                entity.spikeTimer = (entity.spikeTimer || 0) + delta;
                if (!entity.spikeState) entity.spikeState = 'active';
                // Cycle: Hidden (2s) -> Warning (1s) -> Active (2s)
                if (entity.spikeState === 'hidden' && entity.spikeTimer > 120) {
                    entity.spikeState = 'warning';
                    entity.spikeTimer = 0;
                } else if (entity.spikeState === 'warning' && entity.spikeTimer > 60) {
                    entity.spikeState = 'active';
                    entity.spikeTimer = 0;
                } else if (entity.spikeState === 'active' && entity.spikeTimer > 120) {
                    entity.spikeState = 'hidden';
                    entity.spikeTimer = 0;
                }
            } else if (entity.type === 'Rotating Spike') {
                entity.rotationAngle = (entity.rotationAngle || 0) + 0.05 * delta;
            } else if (entity.type === 'Piranha Plant') {
                entity.plantTimer = (entity.plantTimer || 0) + 0.03 * delta;
                const maxOffset = entity.h * 0.8;
                entity.plantOffset = -Math.abs(Math.sin(entity.plantTimer) * maxOffset);
            } else if (entity.type === 'Blooper' && player) {
                // Blooper AI
                const distX = player.x - entity.x;
                const distY = player.y - entity.y;
                const dist = Math.sqrt(distX*distX + distY*distY);
                entity.blooperTimer = (entity.blooperTimer || 0) + delta;

                // Move in bursts
                if (entity.blooperState === 'idle') {
                    entity.vx *= 0.95;
                    entity.vy *= 0.95;
                    if (entity.blooperTimer > 60 && dist < 300) {
                        entity.blooperState = 'move';
                        entity.blooperTimer = 0;
                        entity.vx = Math.sign(distX) * 2 * scaleRatio;
                        entity.vy = Math.sign(distY) * 2 * scaleRatio;
                    }
                } else if (entity.blooperState === 'move') {
                    if (entity.blooperTimer > 40) {
                        entity.blooperState = 'idle';
                        entity.blooperTimer = 0;
                        
                        // Chance to squirt ink if close
                        if (Math.random() < 0.3 && dist < 150) {
                            // Shoot ink projectile towards player
                            entitiesRef.current.push({
                                id: `ink-${Math.random()}`,
                                type: 'Bullet',
                                x: entity.x + entity.w/2, y: entity.y + entity.h/2,
                                w: 10, h: 10,
                                vx: Math.sign(distX) * 4, vy: Math.sign(distY) * 4,
                                isDead: false, grounded: false, isBullet: true,
                                isEnemy: true, bulletVariant: 'ink', hasGravity: false
                            } as ExtendedEntity);
                        }
                    }
                }
            } else if (entity.type === 'Lakitu' && player) {
                // Lakitu AI: Hover above player X, maintain Y
                const targetX = player.x;
                const speed = 2 * scaleRatio;
                
                if (entity.x < targetX - 50) entity.vx = speed;
                else if (entity.x > targetX + 50) entity.vx = -speed;
                else entity.vx *= 0.9; // Slow down when near

                // Throw projectile
                entity.lakituTimer = (entity.lakituTimer || 0) + delta;
                if (entity.lakituTimer > 180) { // Every 3 seconds
                    entity.lakituTimer = 0;
                    // Spawn Shell dropping
                    entitiesRef.current.push({
                        id: `spiny-${Math.random()}`,
                        type: 'Turtle',
                        x: entity.x + entity.w/2, y: entity.y + entity.h,
                        w: tileSize, h: tileSize,
                        vx: 0, vy: 0,
                        isDead: false, grounded: false, isEnemy: true,
                        isShell: true, hasGravity: true, hp: 1
                    } as ExtendedEntity);
                }
            } else if (entity.type === 'Flagpole') {
                 // Animation update handled in render or interaction
            }

            // -- Gravity & Physics --
            if (entity.hasGravity) {
                let effectiveGravity = phys.gravity * scaleRatio;
                let effectiveTerminal = phys.terminalVelocity * scaleRatio;
                
                // Stella Hover Logic
                if (entity.isPlayer && charConfig.physics.canHover && keys[controls.jump] && entity.vy > 0) {
                    effectiveGravity *= 0.1; // Float down slowly
                    effectiveTerminal *= 0.1; 
                }

                if (entity.isInWater) {
                    effectiveGravity *= 0.3;
                    effectiveTerminal *= 0.3;
                    entity.vy *= 0.95;
                    entity.vx *= 0.95;
                }

                entity.vy += effectiveGravity * delta;
                if (entity.vy > effectiveTerminal) entity.vy = effectiveTerminal;
            }

            // --- Player WARP Logic ---
            if (entity.isPlayer) {
                if (entity.warpState === 'entering') {
                    entity.y += 1 * scaleRatio * delta; // Slide down
                    entity.warpTimer = (entity.warpTimer || 0) + delta;
                    if (entity.warpTimer > 60) {
                        const targetPipe = entitiesRef.current.find(e => e.id === entity.warpTarget);
                        if (targetPipe) {
                            entity.x = targetPipe.x + (targetPipe.w - entity.w)/2;
                            entity.y = targetPipe.y + targetPipe.h * 0.3; // Inside pipe
                            entity.warpState = 'exiting';
                            entity.warpTimer = 0;
                        } else {
                            // No target, just abort
                            entity.warpState = 'idle';
                            entity.vy = -10; // Pop out
                        }
                    }
                    return; // Skip physics
                } else if (entity.warpState === 'exiting') {
                     entity.y -= 1 * scaleRatio * delta; // Slide up
                     entity.warpTimer = (entity.warpTimer || 0) + delta;
                     if (entity.warpTimer > 40) {
                         entity.warpState = 'idle';
                         entity.vy = -5 * scaleRatio; // Pop out
                     }
                     return; // Skip physics
                }
            }

            // Win Animation
            if (isWonRef.current && entity.isPlayer) {
                // Auto walk off screen
                entity.vx = 2 * scaleRatio;
                entity.x += entity.vx * delta;
                entity.vy += phys.gravity * scaleRatio * delta; // Apply gravity so he falls to ground
                handleTileCollision(entity, map, 'y'); // Collide with floor
                
                if (entity.x > map.width * tileSize + 100) {
                     // Trigger UI
                     onGameWon();
                }
                return;
            }


            if (entity.isBullet) {
                entity.x += entity.vx * delta;
                if (entity.hasGravity) entity.y += entity.vy * delta;
                else if (entity.bulletVariant === 'magic') entity.y += Math.sin(entity.x * 0.05) * 2;
                else entity.y += entity.vy * delta; 
                
                if (entity.bulletVariant === 'banana') {
                    handleTileCollision(entity, map, 'y');
                    handleTileCollision(entity, map, 'x');
                } else if (entity.bulletVariant !== 'shuriken' && entity.bulletVariant !== 'magic' && entity.bulletVariant !== 'ink') {
                    const tile = getTileAt(entity.x + entity.w/2, entity.y + entity.h/2, map);
                    if (isSolid(tile)) {
                        entity.isDead = true;
                        spawnParticles(entity.x, entity.y, 0xFF4400);
                        return;
                    }
                }
                
                entities.forEach(other => {
                    if (other === entity || other.isDead) return;
                    const isFriendlyFire = (entity.isEnemy && other.isEnemy) || (!entity.isEnemy && other.isPlayer);
                    if (isFriendlyFire) return;
                    if (other.isCollectible) return; 

                    if (checkRectCollision(entity, other)) {
                        entity.isDead = true;
                        if (other.isPlayer) {
                            if (entity.bulletVariant === 'ink') {
                                other.inkBlindnessTimer = 300; // 5 seconds blindness
                                audioManager.playBump();
                            } else {
                                takeDamage(other);
                            }
                        } else {
                            damageEnemy(other as ExtendedEntity, 10); // Bullets deal high damage
                        }
                    }
                });
                return;
            }

            if (entity.isPlayer && !entity.isDead) {
                const moveSpeed = phys.runSpeed * charConfig.physics.moveSpeedMult * scaleRatio;
                const accel = phys.acceleration * charConfig.physics.moveSpeedMult;

                // Speed boost if Star power active
                const speedMod = entity.starTimer && entity.starTimer > 0 ? 1.5 : 1.0;

                const effectiveFriction = entity.grounded && entity.frictionMultiplier 
                    ? phys.friction * entity.frictionMultiplier 
                    : phys.friction;

                const effectiveAccel = entity.grounded && entity.frictionMultiplier && entity.frictionMultiplier < 1
                    ? accel * 0.2
                    : accel;

                if (keys[controls.left]) {
                    entity.vx -= effectiveAccel * scaleRatio * delta * speedMod;
                } else if (keys[controls.right]) {
                    entity.vx += effectiveAccel * scaleRatio * delta * speedMod;
                } else {
                    entity.vx *= effectiveFriction;
                }

                if (entity.grounded && keys[controls.down]) {
                     // Check for Pipe Entrance
                     const standingPipe = entitiesRef.current.find(e => e.type === 'Pipe' && Math.abs((e.x + e.w/2) - (entity.x + entity.w/2)) < e.w * 0.5 && Math.abs((e.y) - (entity.y + entity.h)) < 5);
                     
                     if (standingPipe) {
                         // Find a different pipe (Cycle through sorted list)
                         const allPipes = entitiesRef.current
                            .filter(e => e.type === 'Pipe')
                            .sort((a,b) => (a.y - b.y) || (a.x - b.x)); // Sort by Y then X
                         
                         if (allPipes.length > 1) {
                             const currentIndex = allPipes.indexOf(standingPipe);
                             const targetIndex = (currentIndex + 1) % allPipes.length;
                             const target = allPipes[targetIndex];

                             entity.warpState = 'entering';
                             entity.warpTimer = 0;
                             entity.warpTarget = target.id;
                             entity.x = standingPipe.x + (standingPipe.w - entity.w)/2; // Center on pipe
                             audioManager.playPowerup(); // Warp sound placeholder
                             return;
                         }
                     }

                    if (!entity.isCrouching) {
                        entity.isCrouching = true;
                        const originalH = (entity.isBig ? HITBOXES.big.height : HITBOXES.small.height) * scaleRatio;
                        entity.h = originalH * 0.6; 
                        entity.y += (originalH - entity.h);
                    }
                } else {
                    if (entity.isCrouching) {
                         entity.isCrouching = false;
                         const targetH = (entity.isBig ? HITBOXES.big.height : HITBOXES.small.height) * scaleRatio;
                         entity.y -= (targetH - entity.h);
                         entity.h = targetH;
                    }
                }

                if (Math.abs(entity.vx) > 0.1) lastDirRef.current = Math.sign(entity.vx);

                const jumpJustPressed = keys[controls.jump] && !prevKeys[controls.jump];
                const jumpForce = charConfig.physics.jumpForce * scaleRatio;

                if (entity.isInWater) {
                    entity.grounded = false;
                    if (jumpJustPressed) {
                        entity.vy = -5 * scaleRatio; 
                        audioManager.playJump();
                    }
                } else {
                    if (entity.grounded) {
                        entity.jumpCount = 0; 
                        if (jumpJustPressed) {
                            entity.vy = jumpForce;
                            entity.grounded = false;
                            entity.jumpCount = 1;
                            audioManager.playJump();
                        }
                    } else {
                        if (jumpJustPressed && charConfig.physics.doubleJump && (entity.jumpCount || 0) < 1) {
                            entity.vy = jumpForce; 
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
                if (entity.shootCooldown && entity.shootCooldown > 0) entity.shootCooldown -= delta;
                
                // Timer updates
                if (entity.invincibleTimer && entity.invincibleTimer > 0) entity.invincibleTimer -= delta;
                if (entity.starTimer && entity.starTimer > 0) entity.starTimer -= delta;
                if (entity.inkBlindnessTimer && entity.inkBlindnessTimer > 0) entity.inkBlindnessTimer -= delta;

                const maxSpeed = moveSpeed * speedMod;
                if (Math.abs(entity.vx) > maxSpeed * 3) entity.vx *= 0.95;
                else if (Math.abs(entity.vx) > maxSpeed && !keys[controls.left] && !keys[controls.right]) {}
                else {
                    if (entity.vx > maxSpeed) entity.vx = maxSpeed;
                    if (entity.vx < -maxSpeed) entity.vx = -maxSpeed;
                }

                if (entity.y > map.height * tileSize) die();
            }

            entity.x += entity.vx * delta;
            handleTileCollision(entity, map, 'x');

            entity.grounded = false; 
            entity.y += entity.vy * delta;
            handleTileCollision(entity, map, 'y');

            // Collision with other entities
            if (entity.isPlayer && !entity.isDead) {
                entitiesRef.current.forEach(other => {
                    if (entity === other || other.isDead || other.isEffect || other.isBullet || other.type === 'CustomImage' || other.type === 'VisualEffect') return;

                    if (checkRectCollision(entity, other)) {
                         const config = getElementByName(other.type);
                         
                         if (other.type === 'Flagpole') {
                             if (!isWonRef.current && other.flagProgress !== 1) {
                                 isWonRef.current = true;
                                 audioManager.playWin();
                                 other.flagProgress = 0;
                                 // Start Animation: flag goes down
                                 const animateFlag = () => {
                                     other.flagProgress = (other.flagProgress || 0) + 0.02;
                                     // Slide player
                                     entity.y += 2 * scaleRatio;
                                     if (other.flagProgress < 1) requestAnimationFrame(animateFlag);
                                 };
                                 animateFlag();
                             }
                             return;
                         }

                         // Spring Logic
                         if (other.type === 'Spring') {
                             if (entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.8) {
                                 entity.vy = -20 * scaleRatio; 
                                 entity.grounded = false;
                                 audioManager.playJump();
                                 return;
                             }
                         }

                         if (other.isEnemy) {
                             // Star Power kills instantly
                             if (entity.starTimer && entity.starTimer > 0) {
                                 other.isDead = true;
                                 spawnParticles(other.x, other.y, 0xFFFFFF);
                                 addScore(200);
                                 audioManager.playStomp();
                                 return;
                             }

                             if(entity.spikeImmunity && (other.type === 'Pop-up Spike' || other.type === 'Rotating Spike')) return;
                             if (other.type === 'Pop-up Spike' && other.spikeState !== 'active') return;
                             
                             const isStomp = entity.vy > 0 && entity.y + entity.h < other.y + other.h * 0.7;
                             const unStompable = ['Piranha Plant', 'Pop-up Spike', 'Rotating Spike', 'Lightning Trap', 'Boost Pad'].includes(other.type);

                             if(isStomp && !unStompable) {
                                 damageEnemy(other as ExtendedEntity, 1);
                                 entity.vy = phys.bounceForce * scaleRatio;
                                 audioManager.playStomp();
                             } else {
                                 takeDamage(entity);
                             }
                         } else if (other.isCollectible) {
                            other.isDead = true;
                            if(config?.attributes?.variant === 'grow') {
                                entity.isBig = true;
                                const originalH = HITBOXES.big.height * scaleRatio;
                                entity.y -= (originalH - entity.h);
                                entity.h = originalH;
                            } else if(config?.attributes?.variant === 'fire') { 
                                entity.isBig = true; 
                                entity.canShoot = true; 
                                const originalH = HITBOXES.big.height * scaleRatio;
                                if(entity.h < originalH) {
                                    entity.y -= (originalH - entity.h);
                                    entity.h = originalH;
                                }
                            } else if(config?.attributes?.variant === 'star') {
                                entity.starTimer = 600; // 10 seconds (approx 60fps)
                                entity.invincibleTimer = 600;
                                audioManager.playPowerup(); // Should be star theme ideally
                            }
                            audioManager.playCoin();
                         } else if (other.type === 'Boost Pad') {
                             entity.vx = Math.sign(entity.vx || 1) * (config?.attributes?.boostSpeed || 20) * scaleRatio;
                         }
                    }
                });
            }
        });

        prevKeysRef.current = { ...keys };
    };

    // --- Rendering ---
    const drawPlayer = (g: PIXI.Graphics, e: Entity) => {
        const colors = charConfig.visuals.colors;
        const x = e.x; const y = e.y; const w = e.w; const h = e.h;
        const isRight = lastDirRef.current > 0;
        const isBackwards = (e.vx > 0.5 && keysRef.current[controls.left]) || (e.vx < -0.5 && keysRef.current[controls.right]);
        const tx = (lx: number, fw: number) => isRight ? (x + lx) : (x + w - lx - fw);
        
        // Blink if invincible
        if (e.invincibleTimer && Math.floor(e.invincibleTimer / 4) % 2 === 0) return;
        
        // Rainbow effect for Star power
        let primaryColor = colors.primary;
        if (e.starTimer && e.starTimer > 0) {
            const tick = Date.now() / 50;
            const rainbow = [0xFF0000, 0xFFA500, 0xFFFF00, 0x008000, 0x0000FF, 0x4B0082, 0xEE82EE];
            primaryColor = rainbow[Math.floor(tick) % rainbow.length];
        }

        if (e.warpState === 'entering' || e.warpState === 'exiting') {
            g.alpha = 0.5; // Fade during warp
        } else {
            g.alpha = 1;
        }

        g.rect(tx(w*0.2, w*0.6), y + h*0.4, w*0.6, h*0.4).fill(primaryColor);
        g.circle(tx(w*0.5, 0), y + h*0.25, w*0.35).fill(colors.secondary);
        const eyeOffset = isBackwards ? -w*0.1 : w*0.1;
        g.circle(tx(w*0.5 + eyeOffset + w*0.15, 0), y + h*0.25, 2).fill(0x000000);

        if (character === 'shadow') {
            g.rect(tx(w*0.1, w*0.8), y+h*0.45, w*0.8, h*0.1).fill(colors.accent);
            if (Math.abs(e.vx) > 1) {
                g.moveTo(tx(w*0.2,0), y+h*0.5).lineTo(tx(-w*0.5,0), y+h*0.3).stroke({width: 2, color: colors.accent});
            }
        } else if (character === 'stella') {
             g.moveTo(tx(w*0.2,0), y+h*0.1).lineTo(tx(w*0.8,0), y+h*0.1).lineTo(tx(w*0.5,0), y-h*0.3).fill(colors.primary);
        }
    };

    const render = (app: PIXI.Application) => {
        const g = app.stage.getChildByLabel('game-graphics') as PIXI.Graphics;
        const labels = app.stage.getChildByLabel('game-labels') as PIXI.Container;
        const customImgLayer = app.stage.getChildByLabel('game-custom-images') as PIXI.Container;
        const inkLayer = app.stage.getChildByLabel('ink-overlay') as PIXI.Graphics;
        
        if (!g || !labels || !customImgLayer || !inkLayer) return;
        const tileSize = mapRef.current.tileSize;

        g.clear();
        inkLayer.clear();
        labels.removeChildren().forEach(c => c.destroy({ texture: true }));
        customImgLayer.removeChildren().forEach(c => c.destroy());

        let cameraX = 0;
        const player = entitiesRef.current.find(e => e.isPlayer);
        if (player) {
            cameraX = Math.max(0, player.x - (width || window.innerWidth) / 2);
            
            // Draw Ink Overlay if blinded
            if (player.inkBlindnessTimer && player.inkBlindnessTimer > 0) {
                 inkLayer.rect(0, 0, width || window.innerWidth, height || window.innerHeight)
                         .fill({ color: 0x000000, alpha: 0.95 });
                 // Create a small "hole" around player or just full black
                 inkLayer.circle((width||window.innerWidth)/2, (height||window.innerHeight)/2, 50).cut();
            }
        }
        app.stage.position.x = -cameraX;
        // Fix ink layer to be static on screen (not moving with camera)
        inkLayer.position.x = cameraX;

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
                drawPlayer(g, e);
            } else {
                const config = getElementByName(e.type);
                if (config && config.name !== 'Invisible Death Block') {
                   config.renderPixi(g, labels, e.x, e.y, e.w, e.h, e);
                } else if (e.isBullet) {
                     if (e.bulletVariant === 'ink') {
                         g.circle(e.x + e.w/2, e.y + e.h/2, e.w).fill(0x000000);
                     } else {
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
