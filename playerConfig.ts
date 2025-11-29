
import { TILE_SIZE } from './constants';
import { GAME_SETTINGS } from './gameSettings';

export const PLAYER_CONFIG = {
    // Base Physics linked to Global Settings
    physics: {
        runSpeed: GAME_SETTINGS.runSpeed,
        acceleration: GAME_SETTINGS.acceleration,
        friction: GAME_SETTINGS.friction,
        gravity: GAME_SETTINGS.gravity,
        terminalVelocity: GAME_SETTINGS.terminalVelocity,
        bounceForce: GAME_SETTINGS.bounceForce,
        bulletSpeed: GAME_SETTINGS.bulletSpeed,
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

    // Visual Palette (Normal Mario)
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

    // Visual Palette (Fire Mario)
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

export const CHARACTERS = {
    mario: {
        name: "Mario",
        description: "The classic plumber.",
        color: 0xEE2200
    },
    wukong: {
        name: "Sun Wukong",
        description: "The Monkey King. Transforms into a Gorilla.",
        color: 0xFFD700
    }
};
