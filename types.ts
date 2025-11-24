
// Map Data Structure
export interface GameMap {
  width: number; // Width in tiles
  height: number; // Height in tiles
  tileSize: number; // Pixels per tile
  backgroundColor: string;
  tiles: number[][]; // 2D array of Tile IDs (0 = empty)
  objects: GameObjectData[]; // Array of entities
}

// Configuration for a specific type of game element
export interface ElementConfig {
  id: number; // For tiles, 0 is empty
  type: 'tile' | 'object';
  name: string;
  category: 'terrain' | 'enemy' | 'collectible' | 'trigger' | 'decoration';
  color: number; // Hex color for editor visualization
  description?: string;
  // Specific attributes based on category
  attributes?: {
    destructible?: boolean;
    lethal?: boolean;
    solid?: boolean; // Tiles are solid by default if this is true. Objects need special handling.
    points?: number;
    variant?: string;
    gravity?: boolean;
    speed?: number;
    win?: boolean;
  };
}

// Instance of an object in the map (JSON data)
export interface GameObjectData {
  id: string; // Unique instance ID
  type: string; // References the ElementConfig key/name
  x: number; // Pixel X
  y: number; // Pixel Y
  variant?: string;
  text?: string; // Content for Text elements
}

export interface EditorState {
  selectedElementId: number | string | null;
  tool: 'paint' | 'erase' | 'select';
  zoom: number;
}

// --- Game Runtime Types ---

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Entity extends Rect {
  id: string;
  type: string;
  vx: number;
  vy: number;
  isDead: boolean;
  grounded: boolean;
  
  // Specific properties
  isPlayer?: boolean;
  isEnemy?: boolean;
  isCollectible?: boolean;
  isEffect?: boolean;
  isBullet?: boolean;
  
  // Player specific
  isBig?: boolean;
  canShoot?: boolean;
  invincibleTimer?: number;
  shootCooldown?: number;
  
  // Enemy specific
  patrolCenter?: number;
  isShell?: boolean; // For Turtle enemies
  
  // Piranha Plant specific
  plantState?: 'hidden' | 'extending' | 'out' | 'retracting';
  plantTimer?: number;
  plantOffset?: number; // Y offset from base (0 = hidden, negative = out)

  // Spike specific
  spikeState?: 'hidden' | 'warning' | 'active';
  spikeTimer?: number;
  rotationAngle?: number;

  // Physics specific
  hasGravity?: boolean;

  // Decoration specific
  text?: string;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
    life: number;
}