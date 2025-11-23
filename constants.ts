import { ElementConfig } from './types';

export const TILE_SIZE = 32;
export const DEFAULT_MAP_WIDTH = 20;
export const DEFAULT_MAP_HEIGHT = 15;
export const TOOL_ERASER = 'TOOL_ERASER';

// Tile IDs correspond to the integer in the 2D array
// Object IDs are strings used in the "type" field
export const GAME_ELEMENTS: ElementConfig[] = [
  // --- TERRAIN TILES (IDs 1-99) ---
  {
    id: 1,
    type: 'tile',
    name: 'Ground',
    category: 'terrain',
    color: 0x8B4513, // SaddleBrown
    attributes: { solid: true, destructible: false }
  },
  {
    id: 2,
    type: 'tile',
    name: 'Brick (Breakable)',
    category: 'terrain',
    color: 0xB22222, // FireBrick
    attributes: { solid: true, destructible: true }
  },
  {
    id: 3,
    type: 'tile',
    name: 'Hard Block',
    category: 'terrain',
    color: 0x708090, // SlateGray
    attributes: { solid: true, destructible: false }
  },
  {
    id: 4,
    type: 'tile',
    name: 'Question Block',
    category: 'collectible',
    color: 0xFFD700, // Gold
    attributes: { solid: true, destructible: false }
  },
  {
    id: 5,
    type: 'tile',
    name: 'Invisible Death Block',
    category: 'trigger',
    color: 0x800080, // Purple (visible in editor, invisible in game)
    attributes: { solid: false, lethal: true }
  },

  // --- OBJECTS (IDs 100+) ---
  // Note: ID here is for selection purposes in the editor.
  // In JSON, objects use string types.
  {
    id: 101,
    type: 'object',
    name: 'Goomba',
    category: 'enemy',
    color: 0xA0522D, // Sienna
    attributes: { points: 100 }
  },
  {
    id: 102,
    type: 'object',
    name: 'Coin',
    category: 'collectible',
    color: 0xFFFF00, // Yellow
    attributes: { points: 50 }
  },
  {
    id: 103,
    type: 'object',
    name: 'Mushroom',
    category: 'collectible',
    color: 0xFF4500, // OrangeRed
    attributes: { points: 1000 }
  },
  {
    id: 104,
    type: 'object',
    name: 'Player Start',
    category: 'trigger',
    color: 0x00FF00, // Green
  }
];

export const getElementById = (id: number | string | null): ElementConfig | undefined => {
  if (id === null) return undefined;
  return GAME_ELEMENTS.find(el => el.id === id || el.name.toLowerCase() === String(id).toLowerCase());
};