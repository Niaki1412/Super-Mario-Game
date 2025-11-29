
// This file controls the rhythm and speed of the game.
// Adjust these values to fine-tune the gameplay experience.

export const GAME_SETTINGS = {
    // --- Global Speed Control ---
    // Multiplier for the game loop delta time.
    // 1.0 = Normal Speed
    // 0.8 = 80% Speed (Slower)
    // 1.2 = 120% Speed (Faster)
    timeScale: 1.0,

    // Cap for delta time to prevent physics glitches during frame drops
    maxDelta: 2.0,

    // --- Physics Parameters ---
    
    // Gravity: Pulls entities down (pixels/frame^2)
    gravity: 0.5,
    
    // Terminal Velocity: Maximum falling speed (pixels/frame)
    terminalVelocity: 12,

    // --- Player Movement ---
    
    // Run Speed: Max horizontal speed (pixels/frame)
    runSpeed: 4,
    
    // Acceleration: How fast the player reaches max speed
    acceleration: 0.5,
    
    // Friction: How fast the player stops when no key is pressed (0.0 - 1.0)
    // Lower is slippery, Higher is sticky.
    friction: 0.8,
    
    // Bounce Force: Upward velocity when stomping an enemy
    bounceForce: -5,

    // --- Combat ---
    
    // Bullet Speed: Speed of fireballs/projectiles
    bulletSpeed: 8,
    
    // Shoot Cooldown: Frames between shots
    shootCooldown: 20,
    
    // Invincibility Frames: How long player is safe after taking damage
    damageInvincibility: 120,
};
