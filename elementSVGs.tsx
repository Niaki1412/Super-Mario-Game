
import React from 'react';

export const SvgGround = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="currentColor" />
        <path d="M0 0 L32 0" stroke="#3E2723" strokeWidth="4" />
        <path d="M4 10 L8 6 L12 10 M20 20 L24 16 L28 20" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none" />
    </>
);

export const SvgGrass = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="#5D4037" />
        <rect x="0" y="0" width="32" height="10" fill="#4CAF50" />
        <path d="M0 10 L4 14 L8 10 L12 14 L16 10 L20 14 L24 10 L28 14 L32 10 V0 H0 Z" fill="#4CAF50" />
        <path d="M6 4 L8 2 M14 6 L12 3 M24 5 L26 2" stroke="#81C784" strokeWidth="1.5" />
    </>
);

export const SvgSnow = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="#90CAF9" />
        <rect x="0" y="0" width="32" height="12" fill="#FFFFFF" />
        <path d="M0 12 Q8 16 16 12 Q24 8 32 12 V0 H0 Z" fill="#FFFFFF" />
        <circle cx="6" cy="24" r="2" fill="white" opacity="0.6" />
        <circle cx="20" cy="20" r="3" fill="white" opacity="0.6" />
        <circle cx="28" cy="28" r="1.5" fill="white" opacity="0.6" />
    </>
);

export const SvgWater = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="#2196F3" fillOpacity="0.6" />
        <path d="M0 4 Q8 0 16 4 Q24 8 32 4" stroke="#BBDEFB" strokeWidth="1" fill="none" opacity="0.8" />
        <circle cx="8" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
        <circle cx="24" cy="20" r="3" fill="rgba(255,255,255,0.3)" />
        <circle cx="12" cy="26" r="1.5" fill="rgba(255,255,255,0.3)" />
    </>
);

export const SvgLava = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="#D32F2F" />
        <path d="M0 0 Q8 6 16 0 Q24 6 32 0" fill="#FF5722" />
        <circle cx="8" cy="16" r="3" fill="#FFC107" />
        <circle cx="22" cy="24" r="4" fill="#FF9800" />
        <circle cx="28" cy="10" r="2" fill="#FFEB3B" />
    </>
);

export const SvgPipe = () => (
    <>
        <rect x="2" y="0" width="28" height="32" fill="#43A047" stroke="#1B5E20" strokeWidth="2" />
        <rect x="0" y="0" width="32" height="8" fill="#4CAF50" stroke="#1B5E20" strokeWidth="2" />
        <rect x="6" y="8" width="4" height="24" fill="rgba(0,0,0,0.1)" />
        <rect x="8" y="2" width="2" height="4" fill="rgba(255,255,255,0.3)" />
    </>
);

export const SvgSpring = () => (
    <>
        <rect x="2" y="26" width="28" height="6" fill="#333" />
        <path d="M8 26 L24 26 L20 18 L26 12 L6 12 L12 18 Z" fill="#BBB" stroke="#555" strokeWidth="1" />
        <rect x="2" y="8" width="28" height="4" fill="#D32F2F" />
        <path d="M4 12 L2 26" stroke="#333" strokeWidth="1" />
        <path d="M28 12 L30 26" stroke="#333" strokeWidth="1" />
    </>
);

export const SvgBoostPad = () => (
    <>
        <rect x="0" y="24" width="32" height="8" fill="#333" />
        <path d="M4 24 L12 24 L20 14 L12 14 Z" fill="#00E676" />
        <path d="M14 24 L22 24 L30 14 L22 14 Z" fill="#00E676" />
        <path d="M4 24 L20 14" stroke="#FFF" strokeWidth="1" opacity="0.5" />
    </>
);

export const SvgLightning = () => (
    <>
        <circle cx="16" cy="16" r="14" fill="#212121" />
        <path d="M18 4 L10 16 H16 L14 28 L24 14 H18 L18 4 Z" fill="#FFEB3B" stroke="#F57F17" strokeWidth="1" />
    </>
);

export const SvgBrick = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="currentColor" />
        <path d="M0 8 H32 M0 16 H32 M0 24 H32 M16 0 V8 M8 8 V16 M24 8 V16 M16 16 V24 M8 24 V32 M24 24 V32" stroke="rgba(0,0,0,0.4)" strokeWidth="2" />
    </>
);

export const SvgHardBlock = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="currentColor" />
        <rect x="4" y="4" width="24" height="24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
        <path d="M0 0 L4 4 M32 0 L28 4 M0 32 L4 28 M32 32 L28 28" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
        <circle cx="6" cy="6" r="1" fill="rgba(0,0,0,0.5)" />
        <circle cx="26" cy="6" r="1" fill="rgba(0,0,0,0.5)" />
        <circle cx="6" cy="26" r="1" fill="rgba(0,0,0,0.5)" />
        <circle cx="26" cy="26" r="1" fill="rgba(0,0,0,0.5)" />
    </>
);

export const SvgQuestionBlock = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="currentColor" rx="2" />
        <circle cx="4" cy="4" r="2" fill="rgba(0,0,0,0.3)" />
        <circle cx="28" cy="4" r="2" fill="rgba(0,0,0,0.3)" />
        <circle cx="4" cy="28" r="2" fill="rgba(0,0,0,0.3)" />
        <circle cx="28" cy="28" r="2" fill="rgba(0,0,0,0.3)" />
        <text x="16" y="24" fontSize="20" fontWeight="900" textAnchor="middle" fill="rgba(0,0,0,0.3)">?</text>
        <text x="15" y="23" fontSize="20" fontWeight="900" textAnchor="middle" fill="#FFF8E1">?</text>
    </>
);

export const SvgInvisibleDeathBlock = () => (
    <>
        <rect x="1" y="1" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3" />
        <text x="16" y="22" fontSize="14" textAnchor="middle" fill="currentColor">☠️</text>
    </>
);

export const SvgEmptyBlock = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="#654321" />
        <rect x="4" y="4" width="24" height="24" fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="2" />
    </>
);

export const SvgGoomba = () => (
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
);

export const SvgTurtle = () => (
    <>
        <ellipse cx="16" cy="20" rx="10" ry="8" fill="#006400" />
        <ellipse cx="16" cy="20" rx="7" ry="5" stroke="rgba(255,255,255,0.3)" fill="none" />
        <circle cx="10" cy="12" r="5" fill="#32CD32" />
        <circle cx="9" cy="11" r="1.5" fill="black" />
        <path d="M12 26 L8 30 M20 26 L24 30" stroke="#32CD32" strokeWidth="3" />
    </>
);

export const SvgFlyingTurtle = () => (
    <>
        <ellipse cx="16" cy="20" rx="10" ry="8" fill="#FF4500" />
        <ellipse cx="16" cy="20" rx="7" ry="5" stroke="rgba(255,255,255,0.3)" fill="none" />
        <circle cx="10" cy="12" r="5" fill="#FFA07A" />
        <circle cx="9" cy="11" r="1.5" fill="black" />
        {/* Wings */}
        <path d="M14 14 Q8 4 2 10 Q6 16 12 18 Z" fill="white" stroke="#CCC" strokeWidth="1" />
        <path d="M20 14 Q26 6 32 10 Q28 16 22 18 Z" fill="white" stroke="#CCC" strokeWidth="1" />
    </>
);

export const SvgHopper = () => (
    <>
        <path d="M8 30 L24 30 L20 22 L26 16 L6 16 L12 22 Z" fill="#777" />
        <circle cx="16" cy="14" r="10" fill="#4B0082" />
        <circle cx="12" cy="12" r="3" fill="yellow" />
        <circle cx="20" cy="12" r="3" fill="yellow" />
        <path d="M10 24 L6 28 M22 24 L26 28" stroke="black" strokeWidth="2" />
        {/* Spike on top */}
        <path d="M16 4 L14 8 H18 Z" fill="#999" />
    </>
);

export const SvgFireDino = () => (
    <>
        <path d="M8 20 Q12 10 20 12 L24 16 L20 26 L12 28 Z" fill="#DC143C" />
        <rect x="12" y="26" width="4" height="6" fill="#DC143C" />
        <rect x="18" y="26" width="4" height="6" fill="#DC143C" />
        <path d="M22 14 L28 14 L26 18 Z" fill="yellow" /> 
        <circle cx="20" cy="14" r="1.5" fill="black" />
        {/* Spikes */}
        <path d="M10 16 L6 14 L8 18 Z" fill="white" />
        <path d="M12 12 L8 10 L10 14 Z" fill="white" />
    </>
);

export const SvgBomb = () => (
    <>
        <circle cx="16" cy="18" r="10" fill="black" />
        {/* Feet */}
        <path d="M8 26 L4 30 L10 30 Z" fill="#FFD700" />
        <path d="M24 26 L28 30 L22 30 Z" fill="#FFD700" />
        {/* Fuse */}
        <rect x="14" y="4" width="4" height="6" fill="#888" />
        <circle cx="16" cy="4" r="2" fill="orange" />
        {/* Shine */}
        <path d="M12 14 Q14 12 16 14" stroke="#333" strokeWidth="1" fill="none" />
        <circle cx="20" cy="14" r="2" fill="white" opacity="0.5" />
        {/* Key */}
        <path d="M26 18 L30 14 L30 22 Z" fill="#CCC" />
    </>
);

export const SvgBlooper = () => (
    <>
        <path d="M6 10 L16 2 L26 10 L24 22 L16 18 L8 22 Z" fill="#EEE" stroke="#BBB" strokeWidth="1" />
        <circle cx="12" cy="10" r="2" fill="black" />
        <circle cx="20" cy="10" r="2" fill="black" />
        <path d="M10 22 L8 30 M16 18 L16 28 M22 22 L24 30" stroke="#EEE" strokeWidth="3" fill="none" />
    </>
);

export const SvgLakitu = () => (
    <>
        {/* Cloud */}
        <path d="M4 22 Q4 16 10 16 Q12 12 16 12 Q20 12 22 16 Q28 16 28 22 Q28 28 22 28 H10 Q4 28 4 22" fill="white" stroke="#DDD" />
        <circle cx="12" cy="22" r="1" fill="#333" />
        <circle cx="20" cy="22" r="1" fill="#333" />
        <path d="M14 24 Q16 26 18 24" stroke="#333" fill="none" />
        {/* Turtle */}
        <ellipse cx="16" cy="10" rx="6" ry="5" fill="#FFA500" stroke="green" strokeWidth="1"/>
        <circle cx="14" cy="8" r="1.5" fill="black" />
        <rect x="12" y="4" width="8" height="2" fill="green" />
    </>
);

export const SvgStar = () => (
    <>
        <path d="M16 2 L20 12 L30 12 L22 18 L25 28 L16 22 L7 28 L10 18 L2 12 L12 12 Z" fill="#FFD700" stroke="#FFA000" strokeWidth="1" />
        <line x1="14" y1="10" x2="14" y2="14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="18" y1="10" x2="18" y2="14" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
    </>
);

export const SvgPiranhaPlant = () => (
    <>
        <rect x="6" y="16" width="20" height="16" fill="#006400" />
        <rect x="4" y="16" width="24" height="6" fill="#008000" stroke="black" strokeWidth="0.5" />
        <path d="M16 16 V6" stroke="#00FF00" strokeWidth="2" />
        <circle cx="16" cy="6" r="5" fill="red" />
        <path d="M16 6 L20 2 M16 6 L12 2" stroke="white" strokeWidth="1" />
    </>
);

export const SvgPopUpSpike = () => (
    <>
        <rect x="0" y="24" width="32" height="8" fill="#555" />
        <polygon points="4,24 8,8 12,24" fill="#999" />
        <polygon points="14,24 18,8 22,24" fill="#999" />
        <polygon points="24,24 28,8 32,24" fill="#999" />
    </>
);

export const SvgRotatingSpike = () => (
    <>
        <rect x="12" y="12" width="8" height="8" fill="#555" />
        <line x1="16" y1="16" x2="28" y2="4" stroke="#777" strokeWidth="2" />
        <circle cx="28" cy="4" r="4" fill="#333" />
    </>
);

export const SvgCoin = () => (
    <>
        <ellipse cx="16" cy="16" rx="10" ry="14" fill="currentColor" stroke="#F57F17" strokeWidth="1.5" />
        <ellipse cx="16" cy="16" rx="6" ry="10" fill="none" stroke="#FFF59D" strokeWidth="2" />
    </>
);

export const SvgMushroom = () => (
    <>
        <path d="M2 18 Q16 -8 30 18 H2 Z" fill="currentColor" />
        <circle cx="8" cy="12" r="3" fill="white" fillOpacity="0.8" />
        <circle cx="24" cy="12" r="3" fill="white" fillOpacity="0.8" />
        <circle cx="16" cy="6" r="4" fill="white" fillOpacity="0.8" />
        <path d="M10 18 V26 Q10 30 16 30 Q22 30 22 26 V18" fill="#FFE0B2" />
        <circle cx="14" cy="22" r="1" fill="black" />
        <circle cx="18" cy="22" r="1" fill="black" />
    </>
);

export const SvgFireMushroom = () => (
    <>
        <path d="M2 18 Q16 -8 30 18 H2 Z" fill="#FFA500" />
        <circle cx="8" cy="12" r="3" fill="red" />
        <circle cx="24" cy="12" r="3" fill="red" />
        <circle cx="16" cy="6" r="4" fill="red" />
        <path d="M10 18 V26 Q10 30 16 30 Q22 30 22 26 V18" fill="#FFE0B2" />
        <circle cx="14" cy="22" r="1" fill="black" />
        <circle cx="18" cy="22" r="1" fill="black" />
    </>
);

export const SvgCloud = () => (
    <>
        <path d="M6 20 Q2 20 2 16 Q2 12 6 10 Q6 4 12 4 Q16 4 18 6 Q20 2 26 6 Q30 6 30 12 Q30 20 26 20 Z" fill="white" stroke="#DDD" strokeWidth="1" />
    </>
);

export const SvgBullet = () => (
    <></>
);

export const SvgPlayerStart = () => (
    <>
        <rect x="4" y="4" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="4 2" />
        <text x="16" y="21" fontSize="16" textAnchor="middle" fill="currentColor">S</text>
    </>
);

export const SvgFlagpole = () => (
    <>
        <rect x="14" y="2" width="4" height="26" fill="gray" />
        <rect x="8" y="28" width="16" height="4" fill="brown" />
        <path d="M18 4 L30 8 L18 12 Z" fill="red" />
        <circle cx="16" cy="2" r="2" fill="gold" />
    </>
);

export const SvgTextDecoration = () => (
    <>
        <rect x="2" y="6" width="28" height="20" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
        <text x="16" y="22" fontSize="18" textAnchor="middle" fill="currentColor">Ab</text>
    </>
);

export const SvgMario = () => (
    <>
        <path d="M8 20 H24 V30 H8 Z" fill="#2244CC" />
        <path d="M6 28 H12 V32 H6 Z" fill="#441100" />
        <path d="M20 28 H26 V32 H20 Z" fill="#441100" />
        <path d="M2 14 H10 V20 H2 Z" fill="#EE2200" />
        <path d="M22 14 H30 V20 H22 Z" fill="#EE2200" />
        <rect x="10" y="14" width="12" height="16" fill="#2244CC" />
        <circle cx="10" cy="18" r="1.5" fill="#FFDD00" />
        <circle cx="22" cy="18" r="1.5" fill="#FFDD00" />
        <rect x="7" y="5" width="18" height="11" fill="#FFCCAA" rx="2" />
        <path d="M4 5 H28 V9 H4 Z" fill="#EE2200" />
        <path d="M8 2 H24 V5 H8 Z" fill="#EE2200" />
        <circle cx="16" cy="4" r="2" fill="white" opacity="0.8"/>
        <text x="16" y="6.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#EE2200">M</text>
        <rect x="20" y="8" width="2" height="4" fill="black" />
        <path d="M14 12 H26 V14 H14 Z" fill="black" /> 
        <rect x="24" y="10" width="3" height="3" fill="#FFCCAA" /> 
    </>
);

export const SvgWukong = () => (
    <>
        <path d="M4 22 Q0 18 4 14" stroke="#8B4513" strokeWidth="2" fill="none"/>
        <rect x="10" y="14" width="12" height="12" fill="#FFD700" rx="2"/>
        <rect x="8" y="26" width="6" height="6" fill="#8B4513" />
        <rect x="18" y="26" width="6" height="6" fill="#8B4513" />
        <path d="M10 14 H22 L16 18 Z" fill="#FF4500" />
        <circle cx="16" cy="10" r="8" fill="#8B4513" />
        <path d="M12 6 Q16 14 20 6 Q20 16 12 16 Q8 14 12 6" fill="#FFCCAA" />
        <circle cx="14" cy="9" r="1" fill="black" />
        <circle cx="18" cy="9" r="1" fill="black" />
        <path d="M9 5 Q16 1 23 5" stroke="gold" strokeWidth="2" fill="none" />
        <circle cx="16" cy="4" r="1.5" fill="red" />
    </>
);

export const SvgNinja = () => (
    <>
        <path d="M8 30 L4 20 L28 20 L24 30 Z" fill="#111" />
        <rect x="10" y="12" width="12" height="14" fill="#333" />
        <rect x="8" y="26" width="6" height="6" fill="#111" />
        <rect x="18" y="26" width="6" height="6" fill="#111" />
        {/* Scarf */}
        <path d="M6 14 Q2 10 0 16" stroke="#C00" strokeWidth="3" fill="none" />
        <circle cx="16" cy="10" r="7" fill="#222" />
        <path d="M12 8 H20 V12 H12 Z" fill="#FFE0B2" />
        <rect x="13" y="9" width="2" height="1" fill="black" />
        <rect x="17" y="9" width="2" height="1" fill="black" />
        <path d="M14 4 L18 4 L16 1 Z" fill="#555" />
    </>
);

export const SvgMage = () => (
    <>
        <path d="M4 30 L16 10 L28 30 Z" fill="#6A1B9A" />
        <path d="M16 10 L12 2 L20 2 Z" fill="#9C27B0" />
        <circle cx="16" cy="14" r="5" fill="#E1BEE7" />
        <path d="M6 30 L16 32 L26 30" stroke="#4A148C" strokeWidth="2" />
        {/* Staff */}
        <line x1="24" y1="30" x2="30" y2="10" stroke="#8D6E63" strokeWidth="2" />
        <circle cx="30" cy="10" r="3" fill="#00E5FF" opacity="0.8" />
    </>
);

export const SvgTank = () => (
    <>
        <rect x="6" y="24" width="20" height="6" fill="#455A64" rx="2" />
        <circle cx="10" cy="27" r="2" fill="#263238" />
        <circle cx="16" cy="27" r="2" fill="#263238" />
        <circle cx="22" cy="27" r="2" fill="#263238" />
        <rect x="8" y="14" width="16" height="10" fill="#607D8B" />
        <rect x="12" y="10" width="8" height="6" fill="#90A4AE" />
        <circle cx="14" cy="13" r="1.5" fill="#00FF00" />
        <rect x="20" y="16" width="10" height="4" fill="#37474F" />
    </>
);
