
import React, { useEffect, useState } from 'react';
import { Cloud, ArrowLeft } from 'lucide-react';
import { getMyMaps, getMapById, MapListItem } from '../../api';
import { GameMap } from '../../types';

interface GameLoaderProps {
    onLoadMap: (map: GameMap) => void;
    onExit: () => void;
}

export const GameLoader: React.FC<GameLoaderProps> = ({ onLoadMap, onExit }) => {
    const [myMaps, setMyMaps] = useState<MapListItem[]>([]);
    const [isLoadingMaps, setIsLoadingMaps] = useState(false);
    const isLoggedIn = !!localStorage.getItem('access_token');

    useEffect(() => {
        if (isLoggedIn) {
            setIsLoadingMaps(true);
            getMyMaps(localStorage.getItem('access_token')!, 1, 1, -1)
                .then((data) => setMyMaps(data.list || []))
                .catch(err => console.error("Failed to load maps", err))
                .finally(() => setIsLoadingMaps(false));
        }
    }, [isLoggedIn]);

    const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                onLoadMap(json);
            } catch { 
                alert('Invalid Map JSON'); 
            }
        };
        reader.readAsText(file);
    };

    const handleLoadCloudMap = async (id: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const mapData = await getMapById(id, token);
            if (mapData.map_data) {
                const json = typeof mapData.map_data === 'string' 
                    ? JSON.parse(mapData.map_data) 
                    : mapData.map_data;
                
                if (!json.customImages) json.customImages = [];
                onLoadMap(json);
            } else {
                alert("Map data is empty");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to load map from cloud");
        }
    };

    return (
        <div className="h-full w-full bg-gray-900 flex flex-col items-center justify-center text-white p-8 overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6">Load a Map to Play</h2>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                
                {/* Local File */}
                <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-300">Local File</h3>
                    <label className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded cursor-pointer transition-colors shadow-lg">
                        Select JSON Map
                        <input type="file" accept=".json" onChange={handleImportMap} className="hidden" />
                    </label>
                </div>

                {/* Cloud Maps */}
                <div className="flex flex-col items-center p-6 bg-gray-800 rounded-lg border border-gray-700 max-h-[400px]">
                    <h3 className="text-xl font-bold mb-4 text-gray-300 flex items-center gap-2">
                        <Cloud size={24} /> My Cloud Maps
                    </h3>
                    {isLoadingMaps ? (
                        <div className="text-gray-400">Loading maps...</div>
                    ) : myMaps.length > 0 ? (
                        <div className="w-full grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                            {myMaps.map((map) => (
                                <div key={map.id} className="group bg-gray-700 p-1 rounded flex items-center justify-between border border-gray-600 hover:border-blue-500 transition-all pr-2">
                                    <button onClick={() => handleLoadCloudMap(map.id)} className="flex-1 p-2 text-left hover:bg-gray-600 rounded mr-2">
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-sm text-white group-hover:text-blue-300">
                                                {map.title ? map.title : `Map #${map.id}`}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                Status: {map.is_public ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            {isLoggedIn ? "No maps found in cloud." : "Login to access cloud maps."}
                        </div>
                    )}
                </div>
            </div>
            <button onClick={onExit} className="mt-8 text-gray-400 hover:text-white underline flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Menu
            </button>
        </div>
    );
};
