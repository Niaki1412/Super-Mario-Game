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
  category: 'terrain' | 'enemy' | 'collectible' | 'trigger';
  color: number; // Hex color for editor visualization
  description?: string;
  // Specific attributes based on category
  attributes?: {
    destructible?: boolean;
    lethal?: boolean;
    solid?: boolean;
    points?: number;
    variant?: string;
  };
}

// Instance of an object in the map
export interface GameObjectData {
  id: string; // Unique instance ID
  type: string; // References the ElementConfig key/name
  x: number; // Pixel X
  y: number; // Pixel Y
  variant?: string;
}

export interface EditorState {
  selectedElementId: number | string | null;
  tool: 'paint' | 'erase' | 'select';
  zoom: number;
}