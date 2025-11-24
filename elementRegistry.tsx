
import React from 'react';
import * as PIXI from 'pixi.js';
import { ElementConfig } from './types';

export interface RegistryItem extends ElementConfig {
    renderSVG: () => React.ReactNode;
    renderPixi: (g: PIXI.Graphics, labels: PIXI.Container | null, x: number, y: number, w: number, h: number) => void;
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
    id: 104,
    type: 'object',
    name: 'Player Start',
    category: 'trigger',
    color: 0x00FF00,
    attributes: {},
    renderSVG: () => (
         <>
             <circle cx="16" cy="8" r="6" fill="currentColor" />
             <path d="M8 32 L8 18 Q8 14 16 14 Q24 14 24 18 L24 32" fill="currentColor" />
             <path d="M4 22 L8 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
             <path d="M28 22 L24 18" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
         </>
    ),
    renderPixi: (g, _l, x, y, w, h) => {
        const c = 0x00FF00;
        g.circle(x + w/2, y + h*0.25, 6).fill(c);
        g.moveTo(x + w/2, y + h*0.45).lineTo(x + w/2, y + h*0.9).stroke({ width: 3, color: c });
        g.moveTo(x + w*0.2, y + h*0.6).lineTo(x + w*0.8, y + h*0.6).stroke({ width: 3, color: c });
        g.moveTo(x + w/2, y + h*0.9).lineTo(x + w*0.2, y + h).stroke({ width: 3, color: c });
        g.moveTo(x + w/2, y + h*0.9).lineTo(x + w*0.8, y + h).stroke({ width: 3, color: c });
    }
  },
  {
    id: 105,
    type: 'object',
    name: 'Flagpole',
    category: 'trigger',
    color: 0x00A800,
    attributes: { win: true },
    renderSVG: () => (
         <>
             <rect x="14" y="2" width="4" height="30" fill="#C0C0C0" />
             <circle cx="16" cy="2" r="3" fill="#FFD700" />
             <path d="M18 4 L30 10 L18 16 Z" fill="red" />
         </>
    ),
    renderPixi: (g, _l, x, y, w, h) => {
        // Base coordinate (Bottom of the object)
        const baseY = y + h;
        
        // Visual Height: Use h if it's large (Game), else default to ~9 tiles (Editor visual)
        const visualHeight = h > w * 2 ? h : w * 9;
        const topY = baseY - visualHeight;

        // Pole
        g.rect(x + w/2 - 2, topY, 4, visualHeight).fill(0xC0C0C0); // Silver pole
        
        // Ball at top
        g.circle(x + w/2, topY, 4).fill(0xFFD700); // Gold ball

        // Flag (Triangle)
        g.moveTo(x + w/2 + 2, topY + 4)
         .lineTo(x + w/2 + 2 + w, topY + w/2 + 8)
         .lineTo(x + w/2 + 2, topY + w + 8)
         .fill(0xFF0000);

        // Base Block (Green)
        g.rect(x, baseY - w, w, w).fill(0x00A800);
        g.rect(x+4, baseY - w+4, w-8, w-8).stroke({ width: 2, color: 0x004400 });
    }
  }
];

export const getElementById = (id: number | string | null): RegistryItem | undefined => {
  if (id === null) return undefined;
  return GAME_ELEMENTS_REGISTRY.find(el => el.id === id || el.name.toLowerCase() === String(id).toLowerCase());
};

export const getElementByName = (name: string): RegistryItem | undefined => {
    return GAME_ELEMENTS_REGISTRY.find(el => el.name.toLowerCase() === name.toLowerCase());
};
