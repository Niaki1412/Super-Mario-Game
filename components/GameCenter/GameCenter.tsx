
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicMaps, PublicMapListItem } from '../../api';
import { ArrowLeft, Gamepad2, Calendar, ImageOff } from 'lucide-react';

export const GameCenter: React.FC = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<PublicMapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMaps = async () => {
      try {
        const data = await getPublicMaps();
        setMaps(data);
      } catch (err) {
        setError('Failed to load public maps. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, []);

  const handlePlayMap = (mapId: number) => {
    navigate(`/game?id=${mapId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-bold">Back to Menu</span>
          </button>
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            GAME CENTER
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400">Loading worlds...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/20 p-8 rounded-lg border border-red-900/50">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded text-white text-sm"
              >
                Retry
              </button>
            </div>
          ) : maps.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p className="text-xl">No public maps available yet.</p>
              <p className="text-sm mt-2">Be the first to publish one from the Editor!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {maps.map((map) => (
                <div 
                  key={map.id} 
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Cover Image */}
                  <div className="relative h-48 bg-gray-800 overflow-hidden">
                    {map.cover && map.cover !== "暂无封面" ?(
                      <img 
                        src={map.cover} 
                        alt={map.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-gray-800 group-hover:bg-gray-750 transition-colors">
                        <ImageOff size={48} className="mb-2 opacity-50" />
                        <span className="text-xs font-mono uppercase">No Cover</span>
                      </div>
                    )}
                    
                    {/* Hover Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button 
                            onClick={() => handlePlayMap(map.map_id)}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-full font-bold shadow-lg transform scale-90 group-hover:scale-100 transition-all flex items-center gap-2"
                        >
                            <Gamepad2 size={20} />
                            PLAY NOW
                        </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-1 truncate" title={map.title}>{map.title}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                        {map.description || "No description provided."}
                    </p>
                    
                    <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-gray-800 pt-3">
                        <div className="flex items-center gap-1">
                            <Calendar size={12} />
                            <span>{new Date(map.create_at).toLocaleDateString()}</span>
                        </div>
                        <span className="font-mono">ID: {map.map_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
