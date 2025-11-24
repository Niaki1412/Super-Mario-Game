
import React from 'react';
import * as PIXI from 'pixi.js';
import { ElementConfig } from './types';

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
    renderSVG: () => (
        <>
            <rect x="0" y="0" width="32" height="32" fill="currentColor" />
            <path d="M0 0 L32 0" stroke="#3E2723" strokeWidth="4" />
            <path d="M4 10 L8 6 L12 10 M20 20 L24 16 L28 20" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <rect x="0" y="0" width="32" height="32" fill="currentColor" />
            <path d="M0 8 H32 M0 16 H32 M0 24 H32 M16 0 V8 M8 8 V16 M24 8 V16 M16 16 V24 M8 24 V32 M24 24 V32" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <rect x="0" y="0" width="32" height="32" fill="currentColor" />
            <rect x="4" y="4" width="24" height="24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
            <path d="M0 0 L4 4 M32 0 L28 4 M0 32 L4 28 M32 32 L28 28" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
            <circle cx="6" cy="6" r="1" fill="rgba(0,0,0,0.5)" />
            <circle cx="26" cy="6" r="1" fill="rgba(0,0,0,0.5)" />
            <circle cx="6" cy="26" r="1" fill="rgba(0,0,0,0.5)" />
            <circle cx="26" cy="26" r="1" fill="rgba(0,0,0,0.5)" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <rect x="0" y="0" width="32" height="32" fill="currentColor" rx="2" />
            <circle cx="4" cy="4" r="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="28" cy="4" r="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="4" cy="28" r="2" fill="rgba(0,0,0,0.3)" />
            <circle cx="28" cy="28" r="2" fill="rgba(0,0,0,0.3)" />
            <text x="16" y="24" fontSize="20" fontWeight="900" textAnchor="middle" fill="rgba(0,0,0,0.3)">?</text>
            <text x="15" y="23" fontSize="20" fontWeight="900" textAnchor="middle" fill="#FFF8E1">?</text>
        </>
    ),
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
    renderSVG: () => (
        <>
             <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
             <text x="16" y="22" fontSize="14" textAnchor="middle" fill="currentColor">☠️</text>
        </>
    ),
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
    renderSVG: () => (
        <>
             <rect x="0" y="0" width="32" height="32" fill="#654321" />
             <rect x="4" y="4" width="24" height="24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <path d="M6 20 Q16 -4 26 20 L28 26 L4 26 Z" fill="currentColor" />
            <ellipse cx="8" cy="29" rx="5" ry="3" fill="black" />
            <ellipse cx="24" cy="29" rx="5" ry="3" fill="black" />
            <circle cx="11" cy="14" r="3" fill="white" />
            <circle cx="21" cy="14" r="3" fill="white" />
            <circle cx="12" cy="14" r="1" fill="black" />
            <circle cx="20" cy="14" r="1" fill="black" />
            <path d="M14 20 Q16 18 18 20" stroke="black" strokeWidth="1" fill="none" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <ellipse cx="16" cy="20" rx="10" ry="8" fill="#006400" />
            <ellipse cx="16" cy="20" rx="7" ry="5" stroke="rgba(255,255,255,0.3)" fill="none" />
            <circle cx="10" cy="12" r="5" fill="#32CD32" />
            <circle cx="9" cy="11" r="1.5" fill="black" />
            <path d="M12 26 L8 30 M20 26 L24 30" stroke="#32CD32" strokeWidth="3" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <rect x="6" y="16" width="20" height="16" fill="#006400" />
            <rect x="4" y="16" width="24" height="6" fill="#008000" stroke="black" strokeWidth="0.5" />
            <path d="M16 16 V6" stroke="#00FF00" strokeWidth="2" />
            <circle cx="16" cy="6" r="5" fill="red" />
            <path d="M16 6 L20 2 M16 6 L12 2" stroke="white" strokeWidth="1" />
        </>
    ),
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
    id: 102,
    type: 'object',
    name: 'Coin',
    category: 'collectible',
    color: 0xFFFF00,
    attributes: { points: 50, gravity: false },
    renderSVG: () => (
        <>
            <ellipse cx="16" cy="16" rx="10" ry="14" fill="currentColor" stroke="#F57F17" strokeWidth="1.5" />
            <ellipse cx="16" cy="16" rx="6" ry="10" fill="none" stroke="#FFF59D" strokeWidth="2" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <path d="M2 18 Q16 -8 30 18 H2 Z" fill="currentColor" />
            <circle cx="8" cy="12" r="3" fill="white" fillOpacity="0.8" />
            <circle cx="24" cy="12" r="3" fill="white" fillOpacity="0.8" />
            <circle cx="16" cy="6" r="4" fill="white" fillOpacity="0.8" />
            <path d="M10 18 V26 Q10 30 16 30 Q22 30 22 26 V18" fill="#FFE0B2" />
            <circle cx="14" cy="22" r="1" fill="black" />
            <circle cx="18" cy="22" r="1" fill="black" />
        </>
    ),
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
    renderSVG: () => (
        <>
            <path d="M2 18 Q16 -8 30 18 H2 Z" fill="#FFA500" />
            <circle cx="8" cy="12" r="3" fill="red" />
            <circle cx="24" cy="12" r="3" fill="red" />
            <circle cx="16" cy="6" r="4" fill="red" />
            <path d="M10 18 V26 Q10 30 16 30 Q22 30 22 26 V18" fill="#FFE0B2" />
            <circle cx="14" cy="22" r="1" fill="black" />
            <circle cx="18" cy="22" r="1" fill="black" />
        </>
    ),
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
    id: 999, // Internal
    type: 'object',
    name: 'Bullet',
    category: 'decoration', // Hidden from palette basically
    color: 0xFF4400,
    attributes: { gravity: false, speed: 8 },
    renderSVG: () => <></>,
    renderPixi: (g, _l, x, y, w, h) => {
        g.circle(x + w/2, y + h/2, w/4).fill(0xFF4400);
        g.circle(x + w/2, y + h/2, w/6).fill(0xFFFF00);
    }
  },
  {
    id: 104,
    type: 'object',
    name: 'Player Start',
    category: 'trigger',
    color: 0x00FF00,
    attributes: { gravity: false },
    renderSVG: () => (
        <>
            <rect x="4" y="4" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 2" />
            <text x="16" y="21" fontSize="16" textAnchor="middle" fill="currentColor">S</text>
        </>
    ),
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
    renderSVG: () => (
         <>
            <rect x="14" y="2" width="4" height="26" fill="gray" />
            <rect x="8" y="28" width="16" height="4" fill="brown" />
            <path d="M18 4 L30 8 L18 12 Z" fill="red" />
            <circle cx="16" cy="2" r="2" fill="gold" />
         </>
    ),
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
    renderSVG: () => (
        <>
            <rect x="2" y="6" width="28" height="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
            <text x="16" y="22" fontSize="18" textAnchor="middle" fill="currentColor">Ab</text>
        </>
    ),
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
