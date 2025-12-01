
import { TILE_SIZE } from './constants';
import { GAME_SETTINGS } from './gameSettings';
import { SvgMario, SvgWukong, SvgNinja, SvgMage, SvgTank } from './elementSVGs';

// --- COMMON ATTRIBUTES ---
// Shared by all characters unless overridden
export const COMMON_PHYSICS = {
    friction: GAME_SETTINGS.friction,
    gravity: GAME_SETTINGS.gravity,
    terminalVelocity: GAME_SETTINGS.terminalVelocity,
    bounceForce: GAME_SETTINGS.bounceForce,
    bulletSpeed: GAME_SETTINGS.bulletSpeed,
    acceleration: GAME_SETTINGS.acceleration,
    runSpeed: GAME_SETTINGS.runSpeed,
    projectileSize: { width: 14, height: 14 }
};

// Hitbox Definitions
export const HITBOXES = {
    small: {
        width: TILE_SIZE * 0.8,
        height: TILE_SIZE * 0.9,
    },
    big: {
        width: TILE_SIZE * 0.9,
        height: TILE_SIZE * 1.8, 
    }
};

// --- CHARACTER DEFINITIONS ---

export interface CharacterDef {
    id: string;
    name: string;
    description: string;
    // Display Stats (0-10)
    stats: {
        speed: number;
        jump: number;
        difficulty: number;
    };
    // Special Ability Label
    abilityName: string;
    // Private Physics Overrides
    physics: {
        moveSpeedMult: number; // Multiplier for base runSpeed
        jumpForce: number;     // Specific jump force
        doubleJump?: boolean;  // Ability flag
        canHover?: boolean;    // Ability flag
        spikeImmunity?: boolean;// Ability flag
        transform?: boolean;   // Wukong flag
    };
    // Visual Settings
    visuals: {
        icon: any; // SVG Component
        themeColor: string; // Tailwind gradient classes
        colors: {
            primary: number;
            secondary: number;
            accent: number;
        }
    }
}

export const CHARACTERS: Record<string, CharacterDef> = {
    mario: {
        id: 'mario',
        name: "Mario",
        description: "The balanced hero. Good for beginners.",
        stats: { speed: 6, jump: 6, difficulty: 3 },
        abilityName: "Growth & Fireballs",
        physics: {
            moveSpeedMult: 1.0,
            jumpForce: -10, // Standard jump
        },
        visuals: {
            icon: SvgMario,
            themeColor: 'from-red-500 to-red-700',
            colors: { primary: 0xEE2200, secondary: 0x2244CC, accent: 0xFFDD00 }
        }
    },
    wukong: {
        id: 'wukong',
        name: "Sun Wukong",
        description: "The Monkey King. High agility.",
        stats: { speed: 9, jump: 8, difficulty: 7 },
        abilityName: "Banana Shot & Cloud",
        physics: {
            moveSpeedMult: 1.3, // Fast
            jumpForce: -11,
            transform: true
        },
        visuals: {
            icon: SvgWukong,
            themeColor: 'from-yellow-500 to-orange-600',
            colors: { primary: 0x8B4513, secondary: 0xFFD700, accent: 0xFF0000 }
        }
    },
    shadow: {
        id: 'shadow',
        name: "Shadow",
        description: "A ninja who moves unseen.",
        stats: { speed: 10, jump: 7, difficulty: 8 },
        abilityName: "Double Jump & Backflip",
        physics: {
            moveSpeedMult: 1.4, // Very fast
            jumpForce: -9.5,    // Slightly lower base jump
            doubleJump: true    // Key ability
        },
        visuals: {
            icon: SvgNinja,
            themeColor: 'from-gray-800 to-black',
            colors: { primary: 0x1a1a1a, secondary: 0x333333, accent: 0xFF0000 }
        }
    },
    stella: {
        id: 'stella',
        name: "Stella",
        description: "A mage who defies gravity.",
        stats: { speed: 4, jump: 10, difficulty: 5 },
        abilityName: "Hover & Float",
        physics: {
            moveSpeedMult: 0.8, // Slow
            jumpForce: -12,     // High jump
            canHover: true      // Key ability
        },
        visuals: {
            icon: SvgMage,
            themeColor: 'from-purple-600 to-pink-600',
            colors: { primary: 0x9C27B0, secondary: 0xE1BEE7, accent: 0x00E5FF }
        }
    },
    iron: {
        id: 'iron',
        name: "Iron-01",
        description: "Heavy mech suit. Tough but slow.",
        stats: { speed: 3, jump: 4, difficulty: 4 },
        abilityName: "Spike Immunity",
        physics: {
            moveSpeedMult: 0.7, // Very Slow
            jumpForce: -8,      // Low jump
            spikeImmunity: true // Key ability
        },
        visuals: {
            icon: SvgTank,
            themeColor: 'from-slate-600 to-slate-800',
            colors: { primary: 0x607D8B, secondary: 0x455A64, accent: 0x00FF00 }
        }
    }
};
