


import React from 'react';
import * as PIXI from 'pixi.js';
import { ElementConfig } from './types';
import { 
    SvgGround, SvgBrick, SvgHardBlock, SvgQuestionBlock, SvgInvisibleDeathBlock, SvgEmptyBlock,
    SvgGoomba, SvgTurtle, SvgPiranhaPlant, SvgPopUpSpike, SvgRotatingSpike,
    SvgCoin, SvgMushroom, SvgFireMushroom, SvgCloud, SvgBullet, SvgPlayerStart, SvgFlagpole, SvgTextDecoration,
    SvgMario, SvgFlyingTurtle, SvgHopper, SvgFireDino, SvgBomb,
    SvgGrass, SvgSnow, SvgWater, SvgLava, SvgSpring, SvgBoostPad, SvgLightning, SvgPipe,
    SvgBlooper, SvgStar, SvgLakitu
} from './elementSVGs';

export interface RegistryItem extends ElementConfig {
    renderSVG: () => React.ReactNode;
    renderPixi: (g: PIXI.Graphics, labels: PIXI.Container | null, x: number, y: number, w: number, h: number, data?: any) => void;
}

export const GAME_ELEMENTS_REGISTRY: RegistryItem[] = [
  // --- TERRAIN TILES ---
  {
    id: 1,
    type: 'tile',
    name: 'Ground',
    category: 'terrain',
    color: 0x8B4513,
    attributes: { solid: true, destructible: false },
    renderSVG: () => <SvgGround />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.rect(x, y, w, h).fill(0x8B4513);
        g.moveTo(x, y).lineTo(x + w, y).stroke({ width: 4, color: 0x3E2723 });
        g.moveTo(x + 4, y + 10).lineTo(x + 8, y + 6).lineTo(x + 12, y + 10).stroke({ width: 1.5, color: 0x000000, alpha: 0.2 });
        g.moveTo(x + 20, y + 20).lineTo(x + 24, y + 16).lineTo(x + 28, y + 20).stroke({ width: 1.5, color: 0x000000, alpha: 0.2 });
    }
  },
  {
      id: 7,
      type: 'tile',
      name: 'Grass',
      category: 'terrain',
      color: 0x4CAF50,
      attributes: { solid: true, destructible: false },
      renderSVG: () => <SvgGrass />,
      renderPixi: (g, _l, x, y, w, h) => {
          g.rect(x, y, w, h).fill(0x5D4037);
          g.rect(x, y, w, h*0.3).fill(0x4CAF50);
          g.moveTo(x, y + h*0.3).lineTo(x + w*0.12, y + h*0.42).lineTo(x + w*0.25, y + h*0.3)
           .lineTo(x + w*0.37, y + h*0.42).lineTo(x + w*0.5, y + h*0.3)
           .lineTo(x + w*0.62, y + h*0.42).lineTo(x + w*0.75, y + h*0.3)
           .lineTo(x + w*0.87, y + h*0.42).lineTo(x + w, y + h*0.3)
           .lineTo(x+w, y).lineTo(x, y).fill(0x4CAF50);
           
           g.moveTo(x + w*0.2, y + h*0.15).lineTo(x + w*0.25, y + h*0.05).stroke({width: 1.5, color: 0x81C784});
           g.moveTo(x + w*0.75, y + h*0.18).lineTo(x + w*0.8, y + h*0.08).stroke({width: 1.5, color: 0x81C784});
      }
  },
  {
      id: 8,
      type: 'tile',
      name: 'Snow',
      category: 'terrain',
      color: 0x90CAF9,
      attributes: { solid: true, friction: 0.05, destructible: false }, 
      renderSVG: () => <SvgSnow />,
      renderPixi: (g, _l, x, y, w, h) => {
          g.rect(x, y, w, h).fill(0x90CAF9);
          g.rect(x, y, w, h*0.4).fill(0xFFFFFF);
          g.moveTo(x, y + h*0.4).quadraticCurveTo(x + w*0.25, y + h*0.55, x + w*0.5, y + h*0.4)
           .quadraticCurveTo(x + w*0.75, y + h*0.55, x + w, y + h*0.4).lineTo(x+w, y).lineTo(x, y).fill(0xFFFFFF);
          
          g.circle(x + w*0.2, y + h*0.7, 2).fill({color: 0xFFFFFF, alpha: 0.6});
          g.circle(x + w*0.8, y + h*0.8, 3).fill({color: 0xFFFFFF, alpha: 0.6});
      }
  },
  {
      id: 9,
      type: 'tile',
      name: 'Water',
      category: 'terrain',
      color: 0x2196F3,
      attributes: { solid: false, liquidType: 'water', friction: 0.8, destructible: false },
      renderSVG: () => <SvgWater />,
      renderPixi: (g, _l, x, y, w, h) => {
          g.rect(x, y, w, h).fill({color: 0x2196F3, alpha: 0.5});
          const t = Date.now() / 500;
          const offset = Math.sin(t + x) * 2;
          g.moveTo(x, y + h*0.2 + offset).quadraticCurveTo(x + w/2, y + h*0.1 + offset, x + w, y + h*0.2 + offset).stroke({width: 1, color: 0xBBDEFB, alpha: 0.8});
          g.circle(x + w*0.3, y + h*0.5, 2).fill({color: 0xFFFFFF, alpha: 0.3});
          g.circle(x + w*0.7, y + h*0.8, 3).fill({color: 0xFFFFFF, alpha: 0.3});
      }
  },
  {
      id: 10,
      type: 'tile',
      name: 'Lava',
      category: 'terrain',
      color: 0xD32F2F,
      attributes: { solid: false, liquidType: 'lava', lethal: true, destructible: false },
      renderSVG: () => <SvgLava />,
      renderPixi: (g, _l, x, y, w, h) => {
          const t = Date.now() / 200;
          const colorShift = Math.sin(t) > 0 ? 0xD32F2F : 0xC62828;
          g.rect(x, y, w, h).fill(colorShift);
          g.circle(x + w*0.25, y + h*0.5, w*0.1).fill(0xFFC107);
          g.circle(x + w*0.75, y + h*0.8, w*0.15).fill(0xFF9800);
          g.circle(x + w*0.5, y + h*0.2, w*0.08).fill(0xFFEB3B);
      }
  },
  {
    id: 2,
    type: 'tile',
    name: 'Brick (Breakable)',
    category: 'terrain',
    color: 0xB22222,
    attributes: { solid: true, destructible: true, variant: 'brick' },
    renderSVG: () => <SvgBrick />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.rect(x, y, w, h).fill(0xB22222);
        g.moveTo(x, y + h/2).lineTo(x + w, y + h/2).stroke({ width: 2, color: 0x000000, alpha: 0.2 });
        g.moveTo(x + w/2, y).lineTo(x + w/2, y + h/2).stroke({ width: 2, color: 0x000000, alpha: 0.2 });
        g.moveTo(x + w/4, y + h/2).lineTo(x + w/4, y + h).stroke({ width: 2, color: 0x000000, alpha: 0.2 });
        g.moveTo(x + w*0.75, y + h/2).lineTo(x + w*0.75, y + h).stroke({ width: 2, color: 0x000000, alpha: 0.2 });
    }
  },
  {
    id: 3,
    type: 'tile',
    name: 'Hard Block',
    category: 'terrain',
    color: 0x708090,
    attributes: { solid: true, destructible: false, variant: 'metal' },
    renderSVG: () => <SvgHardBlock />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.rect(x, y, w, h).fill(0x708090);
        g.rect(x + 4, y + 4, w - 8, h - 8).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
        g.moveTo(x, y).lineTo(x + 4, y + 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
        g.moveTo(x + w, y).lineTo(x + w - 4, y + 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
        g.moveTo(x, y + h).lineTo(x + 4, y + h - 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
        g.moveTo(x + w, y + h).lineTo(x + w - 4, y + h - 4).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
        g.circle(x + 6, y + 6, 1.5).fill({color: 0x000000, alpha: 0.3});
        g.circle(x + w - 6, y + 6, 1.5).fill({color: 0x000000, alpha: 0.3});
        g.circle(x + 6, y + h - 6, 1.5).fill({color: 0x000000, alpha: 0.3});
        g.circle(x + w - 6, y + h - 6, 1.5).fill({color: 0x000000, alpha: 0.3});
    }
  },
  {
    id: 4,
    type: 'tile',
    name: 'Question Block',
    category: 'collectible',
    color: 0xFFD700,
    attributes: { solid: true, destructible: false, variant: 'question' },
    renderSVG: () => <SvgQuestionBlock />,
    renderPixi: (g, labels, x, y, w, h) => {
        g.rect(x, y, w, h).fill(0xFFD700);
        g.circle(x + 4, y + 4, 2).fill({ color: 0x000000, alpha: 0.2 });
        g.circle(x + w - 4, y + 4, 2).fill({ color: 0x000000, alpha: 0.2 });
        g.circle(x + 4, y + h - 4, 2).fill({ color: 0x000000, alpha: 0.2 });
        g.circle(x + w - 4, y + h - 4, 2).fill({ color: 0x000000, alpha: 0.2 });
        
        if (labels) {
            const t = new PIXI.Text({
                text: '?',
                style: { fontFamily: 'Arial', fontSize: 20, fontWeight: 'bold', fill: 0xFFF8E1, align: 'center' }
            });
            t.anchor.set(0.5);
            t.x = x + w/2;
            t.y = y + h/2;
            labels.addChild(t);
        }
    }
  },
  {
    id: 5,
    type: 'tile',
    name: 'Invisible Death Block',
    category: 'trigger',
    color: 0x800080,
    attributes: { solid: false, lethal: true, variant: 'invisible', destructible: false },
    renderSVG: () => <SvgInvisibleDeathBlock />,
    renderPixi: (g, labels, x, y, w, h) => {
        g.rect(x+2, y+2, w-4, h-4).stroke({ width: 2, color: 0x800080 });
        if (labels) {
             const t = new PIXI.Text({
                text: '☠️',
                style: { fontFamily: 'Arial', fontSize: 14, align: 'center', fill: 0xFFFFFF }
            });
            t.anchor.set(0.5);
            t.x = x + w/2;
            t.y = y + h/2;
            labels.addChild(t);
        }
    }
  },
  {
    id: 6,
    type: 'tile',
    name: 'Empty Block',
    category: 'terrain',
    color: 0x8B4513, 
    attributes: { solid: true, destructible: false },
    renderSVG: () => <SvgEmptyBlock />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.rect(x, y, w, h).fill(0x654321);
        g.rect(x + 4, y + 4, w - 8, h - 8).stroke({ width: 2, color: 0x000000, alpha: 0.3 });
        g.circle(x + 6, y + 6, 1.5).fill({color: 0x000000, alpha: 0.3});
        g.circle(x + w - 6, y + 6, 1.5).fill({color: 0x000000, alpha: 0.3});
        g.circle(x + 6, y + h - 6, 1.5).fill({color: 0x000000, alpha: 0.3});
        g.circle(x + w - 6, y + h - 6, 1.5).fill({color: 0x000000, alpha: 0.3});
    }
  },

  // --- OBJECTS ---
  {
      id: 120,
      type: 'object',
      name: 'Spring',
      category: 'trigger',
      color: 0xD32F2F,
      // Solid so characters can stand/bounce. Indestructible.
      attributes: { gravity: false, solid: true, bounceForce: -18, speed: 0, destructible: false },
      renderSVG: () => <SvgSpring />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          g.rect(x + 4, y + h*0.8, w - 8, h*0.2).fill(0x333333);
          g.rect(x + 2, y + h*0.2, w - 4, h*0.15).fill(0xD32F2F);
          g.moveTo(x + 8, y + h*0.8)
           .lineTo(x + w - 8, y + h*0.8)
           .lineTo(x + w - 12, y + h*0.5)
           .lineTo(x + w - 4, y + h*0.35)
           .lineTo(x + 4, y + h*0.35)
           .lineTo(x + 10, y + h*0.5)
           .lineTo(x + 8, y + h*0.8)
           .fill(0xBBBBBB).stroke({width: 1, color: 0x555555});
      }
  },
  {
      id: 121,
      type: 'object',
      name: 'Boost Pad',
      category: 'trigger',
      color: 0x00E676,
      // Indestructible
      attributes: { gravity: false, solid: false, boostSpeed: 20, destructible: false },
      renderSVG: () => <SvgBoostPad />,
      renderPixi: (g, _l, x, y, w, h) => {
          g.rect(x, y + h*0.8, w, h*0.2).fill(0x333333);
          g.moveTo(x + w*0.1, y + h*0.8).lineTo(x + w*0.4, y + h*0.8).lineTo(x + w*0.6, y + h*0.5).lineTo(x + w*0.4, y + h*0.5).fill(0x00E676);
          g.moveTo(x + w*0.5, y + h*0.8).lineTo(x + w*0.8, y + h*0.8).lineTo(x + w, y + h*0.5).lineTo(x + w*0.8, y + h*0.5).fill(0x00E676);
          const t = Date.now() / 100;
          const alpha = (Math.sin(t) + 1) / 2 * 0.5 + 0.2;
          g.moveTo(x + w*0.1, y + h*0.8).lineTo(x + w*0.6, y + h*0.5).stroke({width: 2, color: 0xFFFFFF, alpha});
      }
  },
  {
      id: 122,
      type: 'object',
      name: 'Lightning Trap',
      category: 'enemy',
      color: 0xFFEB3B,
      attributes: { gravity: false, solid: false, lethal: true, speed: 0, destructible: false },
      renderSVG: () => <SvgLightning />,
      renderPixi: (g, _l, x, y, w, h) => {
          // Render larger (3x3 area roughly) but center on the object
          const centerX = x + w/2;
          const centerY = y + h/2;
          const size = w * 1.5; // Radius
          
          const t = Date.now() / 50;
          if (Math.floor(t) % 10 < 5) {
              g.moveTo(centerX, centerY - size).lineTo(centerX - size/2, centerY).lineTo(centerX + size/4, centerY)
               .lineTo(centerX - size/4, centerY + size).lineTo(centerX + size/2, centerY - size/4).lineTo(centerX - size/4, centerY - size/4)
               .lineTo(centerX, centerY - size).fill(0xFFEB3B).stroke({width: 2, color: 0xFFFFFF});
               
               // Glow
               g.circle(centerX, centerY, size).fill({color: 0xFFEB3B, alpha: 0.2});
          }
      }
  },
  {
      id: 123,
      type: 'object',
      name: 'Pipe',
      category: 'terrain',
      color: 0x4CAF50,
      // Solid so monsters can't penetrate.
      attributes: { gravity: false, solid: true, speed: 0, destructible: false },
      renderSVG: () => <SvgPipe />,
      renderPixi: (g, _l, x, y, w, h) => {
          g.rect(x, y, w, h*0.3).fill(0x4CAF50).stroke({width: 2, color: 0x1B5E20});
          g.rect(x + 2, y + h*0.3, w - 4, h*0.7).fill(0x43A047).stroke({width: 2, color: 0x1B5E20});
          g.rect(x + 8, y + 2, 2, h*0.2).fill({color: 0xFFFFFF, alpha: 0.3});
          g.rect(x + 10, y + h*0.3, 4, h*0.7).fill({color: 0x000000, alpha: 0.1});
      }
  },
  {
    id: 101,
    type: 'object',
    name: 'Goomba',
    category: 'enemy',
    color: 0xA0522D,
    // Dynamic enemy
    attributes: { points: 100, gravity: true, speed: 1 },
    renderSVG: () => <SvgGoomba />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        const wobble = data ? Math.sin(Date.now() / 150) * 2 : 0;
        g.moveTo(x + w*0.2, y + h*0.7)
         .quadraticCurveTo(x + w*0.5, y - h*0.1 + wobble, x + w*0.8, y + h*0.7)
         .lineTo(x + w*0.9, y + h*0.9)
         .lineTo(x + w*0.1, y + h*0.9)
         .fill(0xA0522D);
         g.ellipse(x + w*0.3, y + h*0.95, 5, 3).fill(0x000000);
         g.ellipse(x + w*0.7, y + h*0.95, 5, 3).fill(0x000000);
         g.circle(x + w*0.35, y + h*0.45, 3).fill(0xFFFFFF);
         g.circle(x + w*0.65, y + h*0.45, 3).fill(0xFFFFFF);
         g.circle(x + w*0.37, y + h*0.45, 1).fill(0x000000);
         g.circle(x + w*0.63, y + h*0.45, 1).fill(0x000000);
    }
  },
  {
    id: 106,
    type: 'object',
    name: 'Turtle',
    category: 'enemy',
    color: 0x228B22,
    // Dynamic enemy
    attributes: { points: 200, gravity: true, speed: 1 },
    renderSVG: () => <SvgTurtle />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        const isShell = data?.isShell;
        const vx = data?.vx || 0;
        const isFacingRight = vx > 0;
        const tx = (localX: number) => isFacingRight ? (x + w - localX) : (x + localX);

        if (isShell) {
             g.ellipse(x + w/2, y + h*0.8, w*0.4, h*0.25).fill(0x006400); 
             g.ellipse(x + w/2, y + h*0.8, w*0.3, h*0.15).stroke({ width: 2, color: 0xFFFFFF, alpha: 0.3 });
        } else {
            g.rect(x + w*0.2, y + h*0.75, w*0.15, h*0.25).fill(0x32CD32);
            g.rect(x + w*0.65, y + h*0.75, w*0.15, h*0.25).fill(0x32CD32);
            g.circle(tx(w*0.25), y + h*0.35, w*0.2).fill(0x32CD32);
            g.circle(tx(w*0.2), y + h*0.3, 2).fill(0x000000);
            g.ellipse(x + w*0.55, y + h*0.6, w*0.35, h*0.25).fill(0x006400);
            g.ellipse(x + w*0.55, y + h*0.6, w*0.25, h*0.15).stroke({ width: 1, color: 0xFFFFFF, alpha: 0.3 });
        }
    }
  },
  {
      id: 112,
      type: 'object',
      name: 'Flying Turtle',
      category: 'enemy',
      color: 0xFF4500,
      // Flying enemy
      attributes: { points: 300, gravity: false, speed: 2 },
      renderSVG: () => <SvgFlyingTurtle />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          const vx = data?.vx || -1;
          const isFacingRight = vx > 0;
          const tick = Date.now() / 150;
          const wingOffset = Math.sin(tick) * 5;
          const tx = (localX: number) => isFacingRight ? (x + w - localX) : (x + localX);

          g.moveTo(tx(w*0.6), y+h*0.3)
           .quadraticCurveTo(tx(w*0.8), y+h*0.1-wingOffset, tx(w*0.9), y+h*0.2)
           .lineTo(tx(w*0.6), y+h*0.4)
           .fill(0xFFFFFF).stroke({width:1, color: 0xCCCCCC});
          g.ellipse(x + w*0.55, y + h*0.6, w*0.35, h*0.25).fill(0xFF4500);
          g.ellipse(x + w*0.55, y + h*0.6, w*0.25, h*0.15).stroke({ width: 1, color: 0xFFFFFF, alpha: 0.3 });
          g.circle(tx(w*0.25), y + h*0.35, w*0.2).fill(0xFFA07A);
          g.circle(tx(w*0.2), y + h*0.3, 2).fill(0x000000);
          g.moveTo(tx(w*0.5), y+h*0.3)
           .quadraticCurveTo(tx(w*0.7), y+h*0.05-wingOffset, tx(w*0.85), y+h*0.15)
           .lineTo(tx(w*0.5), y+h*0.4)
           .fill(0xFFFFFF).stroke({width:1, color: 0xCCCCCC});
      }
  },
  {
      id: 113,
      type: 'object',
      name: 'Bouncing Hopper',
      category: 'enemy',
      color: 0x4B0082,
      attributes: { points: 200, gravity: true, speed: 1.5 },
      renderSVG: () => <SvgHopper />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          const compression = data?.grounded ? 0.2 * h : 0;
          const bodyY = y + h*0.4 + compression;
          g.moveTo(x + w*0.3, y + h).lineTo(x + w*0.2, bodyY).stroke({width: 2, color: 0x555555});
          g.moveTo(x + w*0.7, y + h).lineTo(x + w*0.8, bodyY).stroke({width: 2, color: 0x555555});
          g.circle(x + w*0.5, bodyY, w*0.35).fill(0x4B0082);
          g.circle(x + w*0.35, bodyY - h*0.05, 3).fill(0xFFFF00);
          g.circle(x + w*0.65, bodyY - h*0.05, 3).fill(0xFFFF00);
          g.moveTo(x + w*0.5, bodyY - w*0.35).lineTo(x + w*0.4, bodyY - w*0.5).lineTo(x + w*0.6, bodyY - w*0.5).fill(0x999999);
      }
  },
  {
      id: 114,
      type: 'object',
      name: 'Fire Dino',
      category: 'enemy',
      color: 0xDC143C,
      attributes: { points: 500, gravity: true, speed: 0.5 },
      renderSVG: () => <SvgFireDino />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          const vx = data?.vx || 0;
          const isFacingRight = vx > 0;
          const tx = (localX: number, width: number = 0) => isFacingRight ? (x + w - localX - width) : (x + localX);
          
          const tick = Date.now() / 200;
          const step = Math.sin(tick) * 3;
          g.rect(tx(w*0.3 + step, w*0.15), y + h*0.8, w*0.15, h*0.2).fill(0xDC143C);
          g.rect(tx(w*0.55 - step, w*0.15), y + h*0.8, w*0.15, h*0.2).fill(0xDC143C);
          g.moveTo(tx(w*0.2), y + h*0.6)
           .lineTo(tx(w*0.4), y + h*0.3)
           .lineTo(tx(w*0.8), y + h*0.4)
           .lineTo(tx(w*0.7), y + h*0.8)
           .lineTo(tx(w*0.3), y + h*0.85)
           .fill(0xDC143C);
          g.moveTo(tx(w*0.7), y + h*0.4).lineTo(tx(w*0.9), y+h*0.4).lineTo(tx(w*0.8), y+h*0.55).fill(0xFFFF00);
          g.circle(tx(w*0.6), y + h*0.4, 2).fill(0x000000);
          g.moveTo(tx(w*0.3), y + h*0.5).lineTo(tx(w*0.2), y+h*0.4).lineTo(tx(w*0.35), y+h*0.4).fill(0xFFFFFF);
          g.moveTo(tx(w*0.4), y + h*0.4).lineTo(tx(w*0.35), y+h*0.25).lineTo(tx(w*0.45), y+h*0.35).fill(0xFFFFFF);
      }
  },
  {
      id: 115,
      type: 'object',
      name: 'Bob-omb',
      category: 'enemy',
      color: 0x000000,
      attributes: { points: 150, gravity: true, speed: 1.5, lethal: true },
      renderSVG: () => <SvgBomb />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          const isIgnited = data?.bombState === 'ignited';
          const tick = Date.now() / 50;
          const flash = isIgnited && Math.floor(tick) % 2 === 0;
          const color = flash ? 0xFF4444 : 0x000000;
          const walk = Math.sin(Date.now() / 100) * 3;
          g.ellipse(x + w*0.3 + walk, y + h*0.9, w*0.15, h*0.1).fill(0xFFD700);
          g.ellipse(x + w*0.7 - walk, y + h*0.9, w*0.15, h*0.1).fill(0xFFD700);
          g.circle(x + w*0.5, y + h*0.55, w*0.35).fill(color);
          if (!flash) {
             g.circle(x + w*0.65, y + h*0.4, w*0.08).fill({color: 0xFFFFFF, alpha: 0.5});
          }
          g.rect(x + w*0.45, y + h*0.1, w*0.1, h*0.15).fill(0x888888);
          g.circle(x + w*0.5, y + h*0.1, w*0.05).fill(0xFFA500);
          g.moveTo(x + w*0.85, y + h*0.5).lineTo(x + w*0.95, y + h*0.4).lineTo(x + w*0.95, y + h*0.6).fill(0xCCCCCC);
      }
  },
  {
    id: 116,
    type: 'object',
    name: 'Blooper',
    category: 'enemy',
    color: 0xEEEEEE,
    attributes: { points: 400, gravity: false, speed: 1.5, lethal: true, hp: 2, liquidType: 'water' },
    renderSVG: () => <SvgBlooper />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        const squash = data?.blooperState === 'move' ? 0.8 : 1;
        const cy = y + h * 0.5;
        
        g.moveTo(x + w*0.2, cy - h*0.4 * squash)
         .lineTo(x + w*0.8, cy - h*0.4 * squash)
         .lineTo(x + w*0.9, cy + h*0.2)
         .lineTo(x + w*0.1, cy + h*0.2)
         .fill(0xEEEEEE);
         
         // Tentacles
         g.moveTo(x + w*0.2, cy + h*0.2).lineTo(x + w*0.15, cy + h*0.5).stroke({width: 3, color: 0xEEEEEE});
         g.moveTo(x + w*0.4, cy + h*0.2).lineTo(x + w*0.4, cy + h*0.5).stroke({width: 3, color: 0xEEEEEE});
         g.moveTo(x + w*0.6, cy + h*0.2).lineTo(x + w*0.6, cy + h*0.5).stroke({width: 3, color: 0xEEEEEE});
         g.moveTo(x + w*0.8, cy + h*0.2).lineTo(x + w*0.85, cy + h*0.5).stroke({width: 3, color: 0xEEEEEE});

         // Mask
         g.rect(x + w*0.2, cy - h*0.1, w*0.6, h*0.15).fill(0x333333);
         g.circle(x + w*0.35, cy, 2).fill(0xFFFFFF);
         g.circle(x + w*0.65, cy, 2).fill(0xFFFFFF);
    }
  },
  {
    id: 117,
    type: 'object',
    name: 'Lakitu',
    category: 'enemy',
    color: 0xFFFFFF,
    attributes: { points: 800, gravity: false, speed: 2, lethal: true, hp: 3 },
    renderSVG: () => <SvgLakitu />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        // Cloud
        g.ellipse(x + w*0.5, y + h*0.7, w*0.45, h*0.25).fill(0xFFFFFF).stroke({width: 1, color: 0xCCCCCC});
        g.circle(x + w*0.3, y + h*0.75, w*0.15).fill(0xFFFFFF);
        g.circle(x + w*0.7, y + h*0.75, w*0.15).fill(0xFFFFFF);
        g.circle(x + w*0.35, y + h*0.75, 1.5).fill(0x333333);
        g.circle(x + w*0.65, y + h*0.75, 1.5).fill(0x333333);
        g.moveTo(x + w*0.45, y + h*0.8).quadraticCurveTo(x + w*0.5, y + h*0.85, x + w*0.55, y + h*0.8).stroke({width: 1, color: 0x333333});

        // Turtle
        g.ellipse(x + w*0.5, y + h*0.4, w*0.2, h*0.15).fill(0xFFA500).stroke({width: 1, color: 0x008000});
        g.circle(x + w*0.45, y + h*0.35, 1.5).fill(0x000000);
        g.rect(x + w*0.4, y + h*0.2, w*0.2, h*0.05).fill(0x008000);
    }
  },
  {
    id: 118,
    type: 'object',
    name: 'Power Star',
    category: 'collectible',
    color: 0xFFD700,
    attributes: { points: 1000, gravity: true, speed: 2, destructible: false, variant: 'star' },
    renderSVG: () => <SvgStar />,
    renderPixi: (g, _l, x, y, w, h) => {
        const tick = Date.now() / 100;
        const color = Math.floor(tick) % 2 === 0 ? 0xFFD700 : 0xFFFFFF; // Flash
        
        g.moveTo(x + w*0.5, y).lineTo(x + w*0.65, y + h*0.35).lineTo(x + w, y + h*0.35)
         .lineTo(x + w*0.75, y + h*0.6).lineTo(x + w*0.85, y + h)
         .lineTo(x + w*0.5, y + h*0.8).lineTo(x + w*0.15, y + h)
         .lineTo(x + w*0.25, y + h*0.6).lineTo(x, y + h*0.35)
         .lineTo(x + w*0.35, y + h*0.35).lineTo(x + w*0.5, y)
         .fill(color).stroke({width: 1, color: 0xB8860B});
        
        g.lineStyle(1.5, 0x000000);
        g.moveTo(x + w*0.4, y + h*0.35).lineTo(x + w*0.4, y + h*0.55);
        g.moveTo(x + w*0.6, y + h*0.35).lineTo(x + w*0.6, y + h*0.55);
    }
  },
  {
    id: 107,
    type: 'object',
    name: 'Piranha Plant',
    category: 'enemy',
    color: 0x008000,
    // Fixed: Solid true.
    attributes: { points: 150, gravity: false, solid: true, speed: 0, destructible: false },
    renderSVG: () => <SvgPiranhaPlant />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        const offset = data?.plantOffset ?? -h * 0.8; 
        g.rect(x + w*0.45, y + offset + h*0.5, w*0.1, h - (offset + h*0.5)).fill(0x32CD32);
        g.circle(x + w*0.5, y + offset + h*0.3, w*0.25).fill(0xFF0000);
        g.moveTo(x + w*0.5, y + offset + h*0.3).lineTo(x + w*0.7, y + offset).stroke({width: 2, color: 0xFFFFFF});
        g.moveTo(x + w*0.5, y + offset + h*0.3).lineTo(x + w*0.3, y + offset).stroke({width: 2, color: 0xFFFFFF});
        g.circle(x + w*0.4, y + offset + h*0.4, 2).fill(0xFFFFFF);
        g.circle(x + w*0.6, y + offset + h*0.2, 2).fill(0xFFFFFF);
        g.rect(x, y, w, h*0.3).fill(0x008000).stroke({ width: 1, color: 0x004d00 });
        g.rect(x + w*0.05, y + h*0.3, w*0.9, h*0.7).fill(0x006400).stroke({ width: 1, color: 0x003300 });
        g.rect(x + w*0.15, y + h*0.35, w*0.1, h*0.6).fill({ color: 0x00FF00, alpha: 0.1 });
    }
  },
  {
      id: 109,
      type: 'object',
      name: 'Pop-up Spike',
      category: 'enemy',
      color: 0x888888,
      attributes: { points: 0, gravity: false, lethal: true, speed: 0, destructible: false },
      renderSVG: () => <SvgPopUpSpike />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          g.rect(x, y + h*0.8, w, h*0.2).fill(0x555555);
          let state = data?.spikeState || 'active'; 
          
          if (state !== 'hidden') {
              // Warning shows small spikes, Active shows full spikes
              const spikeH = state === 'warning' ? h*0.2 : h*0.7;
              const baseY = y + h*0.8;
              const color = state === 'warning' ? 0xFF5722 : 0x999999;
              
              for(let i=0; i<3; i++) {
                  const sx = x + (w/3) * i;
                  g.moveTo(sx + 2, baseY)
                   .lineTo(sx + (w/3)/2, baseY - spikeH)
                   .lineTo(sx + (w/3) - 2, baseY)
                   .fill(color);
              }
          }
      }
  },
  {
      id: 110,
      type: 'object',
      name: 'Rotating Spike',
      category: 'enemy',
      color: 0x333333,
      attributes: { points: 0, gravity: false, lethal: true, speed: 0, destructible: false },
      renderSVG: () => <SvgRotatingSpike />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          const cx = x + w/2;
          const cy = y + h/2;
          g.rect(x + w*0.3, y + h*0.3, w*0.4, h*0.4).fill(0x555555).stroke({width: 1, color: 0x000000});
          const angle = data?.rotationAngle ?? 0;
          const radius = w * 2.5; 
          const ballX = cx + Math.cos(angle) * radius;
          const ballY = cy + Math.sin(angle) * radius;
          g.moveTo(cx, cy).lineTo(ballX, ballY).stroke({width: 2, color: 0x777777});
          g.circle(ballX, ballY, w*0.4).fill(0x333333);
          for(let i=0; i<8; i++) {
              const a = i * (Math.PI/4);
              g.moveTo(ballX, ballY).lineTo(ballX + Math.cos(a)*w*0.5, ballY + Math.sin(a)*w*0.5).stroke({width: 2, color: 0x999999});
          }
      }
  },
  {
    id: 102,
    type: 'object',
    name: 'Coin',
    category: 'collectible',
    color: 0xFFFF00,
    // Indestructible by bullets
    attributes: { points: 50, gravity: false, destructible: false },
    renderSVG: () => <SvgCoin />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.ellipse(x + w/2, y + h*0.5, w*0.3, h*0.4).fill(0xFFFF00).stroke({ width: 2, color: 0xF57F17 });
        g.ellipse(x + w/2, y + h*0.5, w*0.15, h*0.25).stroke({ width: 1, color: 0xFFF59D });
    }
  },
  {
    id: 103,
    type: 'object',
    name: 'Mushroom',
    category: 'collectible',
    color: 0xFF4500,
    attributes: { points: 1000, gravity: true, speed: 2, variant: 'grow' },
    renderSVG: () => <SvgMushroom />,
    renderPixi: (g, _l, x, y, w, h) => {
         g.moveTo(x + w*0.1, y + h*0.6)
            .quadraticCurveTo(x + w*0.5, y - h*0.2, x + w*0.9, y + h*0.6)
            .lineTo(x + w*0.1, y + h*0.6)
            .fill(0xFF4500);
         g.circle(x + w*0.3, y + h*0.4, 3).fill(0xFFFFFF);
         g.circle(x + w*0.7, y + h*0.4, 3).fill(0xFFFFFF);
         g.circle(x + w*0.5, y + h*0.2, 4).fill(0xFFFFFF);
         g.rect(x + w*0.3, y + h*0.6, w*0.4, h*0.3).fill(0xFFE0B2);
         g.circle(x + w*0.4, y + h*0.75, 1).fill(0x000000);
         g.circle(x + w*0.6, y + h*0.75, 1).fill(0x000000);
    }
  },
  {
    id: 108,
    type: 'object',
    name: 'Fire Mushroom',
    category: 'collectible',
    color: 0xFF8800,
    attributes: { points: 1000, gravity: true, speed: 2, variant: 'fire' },
    renderSVG: () => <SvgFireMushroom />,
    renderPixi: (g, _l, x, y, w, h) => {
         g.moveTo(x + w*0.1, y + h*0.6)
            .quadraticCurveTo(x + w*0.5, y - h*0.2, x + w*0.9, y + h*0.6)
            .lineTo(x + w*0.1, y + h*0.6)
            .fill(0xFFD700);
         g.circle(x + w*0.3, y + h*0.4, 3).fill(0xFF0000);
         g.circle(x + w*0.7, y + h*0.4, 3).fill(0xFF0000);
         g.circle(x + w*0.5, y + h*0.2, 4).fill(0xFF0000);
         g.rect(x + w*0.3, y + h*0.6, w*0.4, h*0.3).fill(0xFFE0B2);
         g.circle(x + w*0.4, y + h*0.75, 1).fill(0x000000);
         g.circle(x + w*0.6, y + h*0.75, 1).fill(0x000000);
    }
  },
  {
    id: 300,
    type: 'object',
    name: 'Cloud',
    category: 'decoration',
    color: 0xFFFFFF,
    attributes: { gravity: false, solid: false },
    renderSVG: () => <SvgCloud />,
    renderPixi: (g, _l, x, y, w, h) => {
        const time = Date.now() / 1000;
        const offsetY = Math.sin(time * 2) * 3;
        const dw = w * 2;
        const dh = h * 1.5;
        const dy = y + offsetY;
        g.circle(x + dw*0.2, dy + dh*0.6, dw*0.2).fill(0xFFFFFF);
        g.circle(x + dw*0.4, dy + dh*0.4, dw*0.25).fill(0xFFFFFF);
        g.circle(x + dw*0.7, dy + dh*0.5, dw*0.22).fill(0xFFFFFF);
        g.circle(x + dw*0.5, dy + dh*0.7, dw*0.2).fill(0xFFFFFF);
        g.circle(x + dw*0.8, dy + dh*0.7, dw*0.15).fill(0xFFFFFF);
        g.rect(x + dw*0.2, dy + dh*0.6, dw*0.6, dh*0.2).fill(0xFFFFFF);
    }
  },
  {
    id: 999, // Internal
    type: 'object',
    name: 'Bullet',
    category: 'decoration',
    color: 0xFF4400,
    attributes: { gravity: false, speed: 8 },
    renderSVG: () => <SvgBullet />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.circle(x + w/2, y + h/2, w/2).fill(0xFF4400);
        g.circle(x + w/2, y + h/2, w/4).fill(0xFFFF00);
    }
  },
  {
    id: 998, // Internal Visual Effect
    type: 'object',
    name: 'VisualEffect',
    category: 'decoration',
    color: 0xFFFF00,
    attributes: { gravity: false, speed: 0 },
    renderSVG: () => <SvgCoin />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        // Simple coin pop animation
        g.ellipse(x + w/2, y + h/2, w*0.3, h*0.4).fill(0xFFFF00);
    }
  },
  {
    id: 104,
    type: 'object',
    name: 'Player Start',
    category: 'trigger',
    color: 0x00FF00,
    attributes: { gravity: false },
    renderSVG: () => <SvgMario />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.rect(x + 4, y + 4, w - 8, h - 8).stroke({ width: 2, color: 0x00FF00 });
        g.moveTo(x + 10, y + 10).lineTo(x+22, y+10).lineTo(x+10, y+22).lineTo(x+22, y+22).stroke({width: 2, color: 0x00FF00});
    }
  },
  {
    id: 105,
    type: 'object',
    name: 'Flagpole',
    category: 'trigger',
    color: 0xFFFFFF,
    attributes: { gravity: false, win: true },
    renderSVG: () => <SvgFlagpole />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        const poleH = h * 9;
        g.rect(x + w*0.2, y + h*0.8, w*0.6, h*0.2).fill(0x8B4513);
        g.rect(x + w*0.4, y - poleH + h, w*0.2, poleH).fill(0x708090);
        g.circle(x + w*0.5, y - poleH + h, w*0.15).fill(0xFFD700);
        
        // Dynamic flag position based on progress
        const flagProgress = data?.flagProgress ?? 0; // 0 = top, 1 = bottom
        const startY = y - poleH + h + h*0.5;
        const endY = y + h*0.5; // Bottom area
        const currentFlagY = startY + (flagProgress * (endY - startY));

        g.moveTo(x + w*0.6, currentFlagY)
         .lineTo(x + w*0.6 + w, currentFlagY + h*0.5)
         .lineTo(x + w*0.6, currentFlagY + h)
         .fill(0xFF0000);
    }
  },
  {
    id: 200,
    type: 'object',
    name: 'Text Decoration',
    category: 'decoration',
    color: 0xFFFFFF,
    attributes: { gravity: false },
    renderSVG: () => <SvgTextDecoration />,
    renderPixi: (g, labels, x, y, w, h, data) => {
        if (labels && data?.text) {
             const t = new PIXI.Text({
                text: data.text,
                style: { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', fill: 0xFFFFFF, align: 'center', stroke: {color: 0x000000, width: 3} }
            });
            t.anchor.set(0.5);
            t.x = x + w/2;
            t.y = y + h/2;
            labels.addChild(t);
        } else {
             g.rect(x, y, w, h).stroke({width: 1, color: 0xFFFFFF, alpha: 0.5});
             if(labels && !data) {
                 const t = new PIXI.Text({ text: 'T', style: { fill: 0xFFFFFF, fontSize: 14 }});
                 t.anchor.set(0.5); t.x = x+w/2; t.y = y+h/2;
                 labels.addChild(t);
             }
        }
    }
  }
];

export const getElementById = (id: number | string | null) => GAME_ELEMENTS_REGISTRY.find(e => e.id === id);
export const getElementByName = (name: string) => GAME_ELEMENTS_REGISTRY.find(e => e.name === name);
