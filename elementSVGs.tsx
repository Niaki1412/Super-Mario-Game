import React from 'react';

export const SvgGround = () => (
    <>
        <rect x="0" y="0" width="32" height="32" fill="currentColor" />
        <path d="M0 0 L32 0" stroke="#3E2723" strokeWidth="4" />
        <path d="M4 10 L8 6 L12 10 M20 20 L24 16 L28 20" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none" />
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
        {/* Legs */}
        <path d="M8 20 H24 V30 H8 Z" fill="#2244CC" />
        {/* Shoes */}
        <path d="M6 28 H12 V32 H6 Z" fill="#441100" />
        <path d="M20 28 H26 V32 H20 Z" fill="#441100" />
        {/* Shirt/Arms */}
        <path d="M2 14 H10 V20 H2 Z" fill="#EE2200" />
        <path d="M22 14 H30 V20 H22 Z" fill="#EE2200" />
        <rect x="10" y="14" width="12" height="16" fill="#2244CC" />
        {/* Buttons */}
        <circle cx="10" cy="18" r="1.5" fill="#FFDD00" />
        <circle cx="22" cy="18" r="1.5" fill="#FFDD00" />
        {/* Head */}
        <rect x="7" y="5" width="18" height="11" fill="#FFCCAA" rx="2" />
        {/* Hat */}
        <path d="M4 5 H28 V9 H4 Z" fill="#EE2200" />
        <path d="M8 2 H24 V5 H8 Z" fill="#EE2200" />
        <circle cx="16" cy="4" r="2" fill="white" opacity="0.8"/>
        <text x="16" y="6.5" fontSize="3" fontWeight="bold" textAnchor="middle" fill="#EE2200">M</text>
        {/* Features */}
        <rect x="20" y="8" width="2" height="4" fill="black" />
        <path d="M14 12 H26 V14 H14 Z" fill="black" /> 
        <rect x="24" y="10" width="3" height="3" fill="#FFCCAA" /> 
    </>
);

export const SvgWukong = () => (
    <>
        {/* Tail */}
        <path d="M4 22 Q0 18 4 14" stroke="#8B4513" strokeWidth="2" fill="none"/>
        {/* Body */}
        <rect x="10" y="14" width="12" height="12" fill="#FFD700" rx="2"/>
        <rect x="8" y="26" width="6" height="6" fill="#8B4513" />
        <rect x="18" y="26" width="6" height="6" fill="#8B4513" />
        {/* Scarf/Collar */}
        <path d="M10 14 H22 L16 18 Z" fill="#FF4500" />
        {/* Head */}
        <circle cx="16" cy="10" r="8" fill="#8B4513" />
        <path d="M12 6 Q16 14 20 6 Q20 16 12 16 Q8 14 12 6" fill="#FFCCAA" />
        {/* Eyes */}
        <circle cx="14" cy="9" r="1" fill="black" />
        <circle cx="18" cy="9" r="1" fill="black" />
        {/* Circlet */}
        <path d="M9 5 Q16 1 23 5" stroke="gold" strokeWidth="2" fill="none" />
        <circle cx="16" cy="4" r="1.5" fill="red" />
    </>
);
