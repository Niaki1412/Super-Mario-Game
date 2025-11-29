
import React from 'react';
import { LogOut, RotateCcw } from 'lucide-react';

interface GameUIProps {
    score: number;
    controls: { left: string; right: string; down: string; jump: string; doubleJump: string };
    gameOver: boolean;
    gameWon: boolean;
    embedded: boolean;
    onExit: () => void;
    onRetry: () => void;
}

export const GameUI: React.FC<GameUIProps> = ({
    score,
    controls,
    gameOver,
    gameWon,
    embedded,
    onExit,
    onRetry
}) => {
    const getKeyDisplay = (key: string) => {
        if (key === ' ') return 'SPACE';
        return key.toUpperCase();
    };

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* HUD */}
            <div className="absolute top-4 left-4 text-white font-mono text-xl font-bold drop-shadow-md z-10 select-none">
                SCORE: {score}
            </div>
            {!embedded && (
                <div className="absolute top-10 left-4 text-white font-mono text-xs opacity-70 drop-shadow-md z-10 select-none">
                    CONTROLS: {getKeyDisplay(controls.left)}/{getKeyDisplay(controls.right)} Move, {getKeyDisplay(controls.down)} Crouch, {getKeyDisplay(controls.jump)} Jump, {getKeyDisplay(controls.doubleJump)} Double Jump
                </div>
            )}

            {/* Exit Button - Pointer events enabled */}
            <button 
                onClick={onExit} 
                className="absolute top-4 right-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg z-10 backdrop-blur-sm border border-red-500 flex items-center gap-2 transition-all hover:scale-105 pointer-events-auto"
            >
                <LogOut size={16} />
                EXIT GAME
            </button>

            {/* Game Over Screen */}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 animate-fade-in backdrop-blur-sm pointer-events-auto">
                    <h1 className="text-6xl text-red-500 font-black mb-4 animate-bounce">GAME OVER</h1>
                    <p className="text-white text-xl mb-8 font-mono">Final Score: {score}</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={onRetry} 
                            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all"
                        >
                            <RotateCcw size={20} />
                            Play Again
                        </button>
                        <button 
                            onClick={onExit} 
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center gap-2 transform hover:scale-105 transition-all"
                        >
                            <LogOut size={20} />
                            Quit
                        </button>
                    </div>
                </div>
            )}

            {/* Win Screen */}
            {gameWon && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-600/90 z-20 backdrop-blur-md animate-fade-in pointer-events-auto">
                    <h1 className="text-6xl text-yellow-300 font-black mb-4 animate-bounce drop-shadow-lg stroke-black">LEVEL CLEARED!</h1>
                    <p className="text-white text-3xl font-bold mb-8 drop-shadow-md">Score: {score}</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={onRetry} 
                            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <RotateCcw size={20} />
                            Replay
                        </button>
                        <button 
                            onClick={onExit} 
                            className="bg-white hover:bg-gray-100 text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
                        >
                            Return to Menu
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
