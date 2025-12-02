

// Map Data Structure
export interface GameMap {
  width: number; // Width in tiles
  height: number; // Height in tiles
  tileSize: number; // Pixels per tile
  backgroundColor: string;
  customImages: CustomImageDef[]; // Registry of uploaded images
  tiles: number[][]; // 2D array of Tile IDs (0 = empty)
  objects: GameObjectData[]; // Array of entities
}

export interface CustomImageDef {
    id: string; // uuid
    name: string;
    data: string; // Base64 string
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
    // New Attributes
    friction?: number; // 0.0 to 1.0 (Lower is slippery)
    liquidType?: 'water' | 'lava';
    bounceForce?: number; // For springs
    boostSpeed?: number; // For speed pads
  };
}

// Instance of an object in the map (JSON data)
export interface GameObjectData {
  id: string; // Unique instance ID
  type: string; // References the ElementConfig key/name OR 'CustomImage'
  x: number; // Pixel X
  y: number; // Pixel Y
  variant?: string;
  text?: string; // Content for Text elements
  
  // Instance specific properties
  properties?: {
      customImageId?: string; // For CustomImage type
      opacity?: number;
      scale?: number;
      width?: number;
      height?: number;
  };
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
  jumpCount?: number; // For double jump
  isCrouching?: boolean; // For crouch state
  
  // New Player Ability States
  isHovering?: boolean; // For Stella
  hoverTimer?: number;
  spikeImmunity?: boolean; // For Iron
  
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

  // New Enemy Types
  jumpTimer?: number; // For Bouncing Hopper
  shootTimer?: number; // For Fire Dino
  bombState?: 'walking' | 'ignited'; // For Bomb
  bombTimer?: number; // For Bomb explosion

  // Physics specific
  hasGravity?: boolean;
  isInWater?: boolean; // Physics state for water
  frictionMultiplier?: number; // Physics state for ice

  // Decoration specific
  text?: string;
  
  // Custom Image
  customImageId?: string;
  opacity?: number;
  scale?: number;
  
  // Bullet variant
  bulletVariant?: 'fireball' | 'banana' | 'shuriken' | 'magic' | 'cannon';

  // Warp & Victory
  warpState?: 'idle' | 'entering' | 'exiting';
  warpTarget?: string; // ID of target pipe
  warpTimer?: number;
  flagProgress?: number; // 0 (top) to 1 (bottom)
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: number;
    life: number;
}