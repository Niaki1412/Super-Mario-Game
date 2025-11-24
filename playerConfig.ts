
import { TILE_SIZE } from './constants';

export const PLAYER_CONFIG = {
    // Base Physics
    physics: {
        runSpeed: 4,
        acceleration: 0.5,
        friction: 0.8,
        gravity: 0.5,
        terminalVelocity: 12,
        bounceForce: -5, // When jumping on enemies
        bulletSpeed: 8,
    },

    // Projectile Settings
    projectile: {
        width: 14,
        height: 14
    },

    // Form: Small Mario
    small: {
        width: TILE_SIZE * 0.8,
        height: TILE_SIZE * 0.9,
        jumpForce: -10,
        hitboxOffset: { x: 0, y: 0 } 
    },

    // Form: Big Mario
    big: {
        width: TILE_SIZE * 0.9,
        height: TILE_SIZE * 1.8, 
        jumpForce: -11, // Slightly higher jump or different feel
        hitboxOffset: { x: 0, y: 0 }
    },

    // Visual Palette (Normal)
    appearance: {
        hat: 0xEE2200,      // Red
        shirt: 0xEE2200,    // Red
        overalls: 0x2244CC, // Blue
        skin: 0xFFCCAA,
        hair: 0x441100,     // Brown
        shoes: 0x441100,    // Brown
        buttons: 0xFFDD00,  // Gold
        eye: 0x000000
    },

    // Visual Palette (Fire)
    fireAppearance: {
        hat: 0xFFFFFF,      // White
        shirt: 0xFFFFFF,    // White
        overalls: 0xEE2200, // Red
        skin: 0xFFCCAA,
        hair: 0x441100,     // Brown
        shoes: 0x441100,    // Brown
        buttons: 0xFFDD00,  // Gold
        eye: 0x000000
    }
};