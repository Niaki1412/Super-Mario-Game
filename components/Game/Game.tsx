
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GameMap } from '../../types';
import { getMapById, getPublicMapById } from '../../api';
import { GameUI } from './GameUI';
import { GameLoader } from './GameLoader';
import { GameCanvas } from './GameCanvas';

const DEFAULT_CONTROLS = {
    left: 'a',
    right: 'd',
    down: 's',
    jump: ' ',
    shoot: 'i',
    doubleJump: ' '
};

interface GameProps {
    initialMapData?: GameMap;
    width?: number;
    height?: number;
    onClose?: () => void;
    embedded?: boolean;
}

export const Game: React.FC<GameProps> = ({ 
    initialMapData, 
    width, 
    height, 
    onClose,
    embedded = false 
}) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Game State
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [controls, setControls] = useState(DEFAULT_CONTROLS);
    
    // Initialize character synchronously from localStorage to avoid flickering
    const [character, setCharacter] = useState(() => {
        return localStorage.getItem('SELECTED_CHARACTER') || 'mario';
    });

    // Map Data State
    const [originalMap, setOriginalMap] = useState<GameMap | null>(() => {
        return initialMapData ? JSON.parse(JSON.stringify(initialMapData)) : null;
    });
    const [currentMap, setCurrentMap] = useState<GameMap | null>(() => {
        return initialMapData ? JSON.parse(JSON.stringify(initialMapData)) : null;
    });

    // --- Init Configs ---
    useEffect(() => {
        const savedControls = localStorage.getItem('MARIO_CONTROLS');
        if (savedControls) {
            try { setControls({ ...DEFAULT_CONTROLS, ...JSON.parse(savedControls) }); } catch(e) {}
        }
    }, []);

    // --- URL Params Handling ---
    useEffect(() => {
        const mapIdParam = searchParams.get('id');
        const publicIdParam = searchParams.get('public_id');

        if (publicIdParam && !currentMap && !embedded) {
            loadMapFromApi(Number(publicIdParam), true);
            return;
        }
        if (mapIdParam && !currentMap && !embedded) {
            loadMapFromApi(Number(mapIdParam), false); 
        }
    }, [searchParams]);

    const loadMapFromApi = async (id: number, isPublic: boolean) => {
        const token = localStorage.getItem('access_token');
        if (!token && !isPublic) {
            alert("Please login to play cloud maps");
            return;
        }
        try {
            const fetchFn = isPublic ? getPublicMapById : (id: number) => getMapById(id, token);
            const mapData = await fetchFn(id);
            
            if (mapData.map_data) {
                const json = typeof mapData.map_data === 'string' 
                    ? JSON.parse(mapData.map_data) 
                    : mapData.map_data;
                
                if(!json.customImages) json.customImages = [];
                
                setOriginalMap(json); 
                setCurrentMap(JSON.parse(JSON.stringify(json))); 
            } else {
                alert("Map data is empty");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load map");
        }
    };

    // --- Handlers ---

    const handleLoadMap = (map: GameMap) => {
        setOriginalMap(map);
        setCurrentMap(JSON.parse(JSON.stringify(map)));
    };

    const handleRetry = () => {
        if (originalMap) {
            // Deep clone to reset state completely
            const resetMap = JSON.parse(JSON.stringify(originalMap));
            // Ensure tile array is fresh
            resetMap.tiles = originalMap.tiles.map((row: number[]) => [...row]);
            setCurrentMap(resetMap);
            setGameOver(false);
            setGameWon(false);
            setScore(0);
        }
    };

    const handleExit = () => {
        if (onClose) onClose();
        else navigate('/');
    };

    // --- Render ---

    if (!currentMap) {
        return <GameLoader onLoadMap={handleLoadMap} onExit={handleExit} />;
    }

    return (
        <div className={`${embedded ? 'w-full h-full' : 'h-screen w-screen'} overflow-hidden relative bg-gray-900`}>
            {/* Game Canvas (Logic & Rendering) */}
            <GameCanvas 
                mapData={currentMap}
                width={width}
                height={height}
                controls={controls}
                character={character}
                onScoreUpdate={setScore}
                onGameOver={() => setGameOver(true)}
                onGameWon={() => setGameWon(true)}
            />

            {/* UI Overlay */}
            <GameUI 
                score={score}
                controls={controls}
                gameOver={gameOver}
                gameWon={gameWon}
                embedded={embedded}
                onExit={handleExit}
                onRetry={handleRetry}
            />
        </div>
    );
};
