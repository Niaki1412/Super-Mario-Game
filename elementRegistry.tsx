import React from 'react';
import * as PIXI from 'pixi.js';
import { ElementConfig } from './types';
import { 
    SvgGround, SvgBrick, SvgHardBlock, SvgQuestionBlock, SvgInvisibleDeathBlock, SvgEmptyBlock,
    SvgGoomba, SvgTurtle, SvgPiranhaPlant, SvgPopUpSpike, SvgRotatingSpike,
    SvgCoin, SvgMushroom, SvgFireMushroom, SvgCloud, SvgBullet, SvgPlayerStart, SvgFlagpole, SvgTextDecoration
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
    attributes: { solid: false, lethal: true, variant: 'invisible' },
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
    id: 101,
    type: 'object',
    name: 'Goomba',
    category: 'enemy',
    color: 0xA0522D,
    attributes: { points: 100, gravity: true, speed: 1 },
    renderSVG: () => <SvgGoomba />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.moveTo(x + w*0.2, y + h*0.7)
         .quadraticCurveTo(x + w*0.5, y - h*0.1, x + w*0.8, y + h*0.7)
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
    attributes: { points: 200, gravity: true, speed: 1 },
    renderSVG: () => <SvgTurtle />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        const isShell = data?.isShell;
        
        if (isShell) {
             // Shell State
             g.ellipse(x + w/2, y + h*0.8, w*0.4, h*0.25).fill(0x006400); // Shell
             g.ellipse(x + w/2, y + h*0.8, w*0.3, h*0.15).stroke({ width: 2, color: 0xFFFFFF, alpha: 0.3 });
        } else {
            // Walking State
            // Legs
            g.rect(x + w*0.2, y + h*0.75, w*0.15, h*0.25).fill(0x32CD32);
            g.rect(x + w*0.65, y + h*0.75, w*0.15, h*0.25).fill(0x32CD32);
            
            // Head
            g.circle(x + w*0.25, y + h*0.35, w*0.2).fill(0x32CD32);
            // Eye
            g.circle(x + w*0.2, y + h*0.3, 2).fill(0x000000);
            
            // Shell Body
            g.ellipse(x + w*0.55, y + h*0.6, w*0.35, h*0.25).fill(0x006400);
            g.ellipse(x + w*0.55, y + h*0.6, w*0.25, h*0.15).stroke({ width: 1, color: 0xFFFFFF, alpha: 0.3 });
        }
    }
  },
  {
    id: 107,
    type: 'object',
    name: 'Piranha Plant',
    category: 'enemy',
    color: 0x008000,
    attributes: { points: 150, gravity: false, solid: true }, // solid=true for the pipe base
    renderSVG: () => <SvgPiranhaPlant />,
    renderPixi: (g, _l, x, y, w, h, data) => {
        // 1. Draw Plant Head (Behind Pipe if possible, but painter's algorithm says draw first)
        // In Editor: Draw extended. In Game: Use plantOffset from data.
        const offset = data?.plantOffset ?? -h * 0.8; 
        
        // Stem
        g.rect(x + w*0.45, y + offset + h*0.5, w*0.1, h - (offset + h*0.5)).fill(0x32CD32);
        
        // Head (Red bulb)
        g.circle(x + w*0.5, y + offset + h*0.3, w*0.25).fill(0xFF0000);
        // Mouth/Teeth
        g.moveTo(x + w*0.5, y + offset + h*0.3).lineTo(x + w*0.7, y + offset).stroke({width: 2, color: 0xFFFFFF});
        g.moveTo(x + w*0.5, y + offset + h*0.3).lineTo(x + w*0.3, y + offset).stroke({width: 2, color: 0xFFFFFF});
        // Spots
        g.circle(x + w*0.4, y + offset + h*0.4, 2).fill(0xFFFFFF);
        g.circle(x + w*0.6, y + offset + h*0.2, 2).fill(0xFFFFFF);

        // 2. Draw Pipe (Foreground)
        // Pipe Rim
        g.rect(x, y, w, h*0.3).fill(0x008000).stroke({ width: 1, color: 0x004d00 });
        // Pipe Body
        g.rect(x + w*0.05, y + h*0.3, w*0.9, h*0.7).fill(0x006400).stroke({ width: 1, color: 0x003300 });
        // Highlights
        g.rect(x + w*0.15, y + h*0.35, w*0.1, h*0.6).fill({ color: 0x00FF00, alpha: 0.1 });
    }
  },
  {
      id: 109,
      type: 'object',
      name: 'Pop-up Spike',
      category: 'enemy',
      color: 0x888888,
      attributes: { points: 0, gravity: false, lethal: true },
      renderSVG: () => <SvgPopUpSpike />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          // Base
          g.rect(x, y + h*0.8, w, h*0.2).fill(0x555555);
          
          let state = data?.spikeState || 'active'; // Default to active in editor
          
          if (state !== 'hidden') {
              const spikeH = state === 'warning' ? h*0.2 : h*0.7;
              const baseY = y + h*0.8;
              const color = 0x999999;
              
              // Draw 3 spikes
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
      attributes: { points: 0, gravity: false, lethal: true },
      renderSVG: () => <SvgRotatingSpike />,
      renderPixi: (g, _l, x, y, w, h, data) => {
          // Pivot
          const cx = x + w/2;
          const cy = y + h/2;
          g.rect(x + w*0.3, y + h*0.3, w*0.4, h*0.4).fill(0x555555).stroke({width: 1, color: 0x000000});
          
          const angle = data?.rotationAngle ?? 0;
          const radius = w * 2.5; // Orbit radius
          
          const ballX = cx + Math.cos(angle) * radius;
          const ballY = cy + Math.sin(angle) * radius;
          
          // Chain
          g.moveTo(cx, cy).lineTo(ballX, ballY).stroke({width: 2, color: 0x777777});
          
          // Spike Ball
          g.circle(ballX, ballY, w*0.4).fill(0x333333);
          // Spikes on ball (simple lines)
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
    attributes: { points: 50, gravity: false },
    renderSVG: () => <SvgCoin />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.ellipse(x + w/2, y + h/2, w*0.3, h*0.4).fill(0xFFFF00).stroke({ width: 2, color: 0xF57F17 });
        g.ellipse(x + w/2, y + h/2, w*0.15, h*0.25).stroke({ width: 1, color: 0xFFF59D });
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
            .fill(0xFFD700); // Gold/Orange base
         g.circle(x + w*0.3, y + h*0.4, 3).fill(0xFF0000); // Red spots
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
        // Dynamic Animation: Floating
        const time = Date.now() / 1000;
        const offsetY = Math.sin(time * 2) * 3;
        
        // Draw Large (2x2 tiles)
        const dw = w * 2;
        const dh = h * 1.5;
        const dy = y + offsetY;

        g.circle(x + dw*0.2, dy + dh*0.6, dw*0.2).fill(0xFFFFFF);
        g.circle(x + dw*0.4, dy + dh*0.4, dw*0.25).fill(0xFFFFFF);
        g.circle(x + dw*0.7, dy + dh*0.5, dw*0.22).fill(0xFFFFFF);
        g.circle(x + dw*0.5, dy + dh*0.7, dw*0.2).fill(0xFFFFFF);
        g.circle(x + dw*0.8, dy + dh*0.7, dw*0.15).fill(0xFFFFFF);
        
        // Bottom fill
        g.rect(x + dw*0.2, dy + dh*0.6, dw*0.6, dh*0.2).fill(0xFFFFFF);
    }
  },
  {
    id: 999, // Internal
    type: 'object',
    name: 'Bullet',
    category: 'decoration', // Hidden from palette basically
    color: 0xFF4400,
    attributes: { gravity: false, speed: 8 },
    renderSVG: () => <SvgBullet />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.circle(x + w/2, y + h/2, w/2).fill(0xFF4400);
        g.circle(x + w/2, y + h/2, w/4).fill(0xFFFF00);
    }
  },
  {
    id: 104,
    type: 'object',
    name: 'Player Start',
    category: 'trigger',
    color: 0x00FF00,
    attributes: { gravity: false },
    renderSVG: () => <SvgPlayerStart />,
    renderPixi: (g, _l, x, y, w, h) => {
        g.rect(x + 4, y + 4, w - 8, h - 8).stroke({ width: 2, color: 0x00FF00 });
        // S for start
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
    renderPixi: (g, _l, x, y, w, h) => {
        const poleH = h * 9; // Draw upwards
        // Base
        g.rect(x + w*0.2, y + h*0.8, w*0.6, h*0.2).fill(0x8B4513);
        // Pole
        g.rect(x + w*0.4, y - poleH + h, w*0.2, poleH).fill(0x708090);
        // Top Ball
        g.circle(x + w*0.5, y - poleH + h, w*0.15).fill(0xFFD700);
        // Flag (Triangle)
        g.moveTo(x + w*0.6, y - poleH + h + h*0.5)
         .lineTo(x + w*0.6 + w, y - poleH + h + h)
         .lineTo(x + w*0.6, y - poleH + h + h*1.5)
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
             // Placeholder if no text in data (e.g. palette)
             g.rect(x, y, w, h).stroke({width: 1, color: 0xFFFFFF, alpha: 0.5});
             if(labels && !data) { // Palette view
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
