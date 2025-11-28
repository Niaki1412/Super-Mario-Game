
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyMaps, deleteMap, MapListItem } from '../../api';
import { ArrowLeft, Edit, Trash2, Map as MapIcon, Plus } from 'lucide-react';

export const MyMaps: React.FC = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }

    const fetchMaps = async () => {
      try {
        const data = await getMyMaps(token);
        setMaps(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load maps.');
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();
  }, [navigate]);

  const handleEdit = (id: number) => {
    navigate(`/editor?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await deleteMap({ map_id: id }, token);
      setMaps(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      alert('Failed to delete map');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
      <div className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10 flex items-center justify-between shadow-md">
        <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
            <ArrowLeft size={20} />
            <span className="font-bold">Back to Menu</span>
        </button>
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
            MY MAPS
        </h1>
        <button 
             onClick={() => navigate('/editor')}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg transition-transform hover:scale-105 text-sm"
        >
            <Plus size={16} />
            <span>Create New</span>
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
             {loading ? (
                <div className="flex justify-center mt-20">
                     <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
             ) : error ? (
                 <div className="text-center text-red-400 mt-10 bg-red-900/20 p-6 rounded-xl border border-red-900/50">
                     {error}
                 </div>
             ) : maps.length === 0 ? (
                 <div className="text-center text-gray-500 mt-20 flex flex-col items-center">
                     <MapIcon size={64} className="mb-4 opacity-30" />
                     <p className="text-xl font-bold mb-2">No maps found</p>
                     <p className="text-sm">Create your first map in the Editor!</p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {maps.map((map) => (
                         <div key={map.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all shadow-lg flex flex-col">
                             <div className="flex justify-between items-start mb-4">
                                 <div className="bg-gray-700/50 p-3 rounded-lg text-emerald-400">
                                     <MapIcon size={28} />
                                 </div>
                                 <div className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border ${map.status === 1 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                     {map.status === 1 ? 'Published' : 'Draft'}
                                 </div>
                             </div>
                             
                             <h3 className="text-xl font-bold text-gray-200 mb-1">Map #{map.id}</h3>
                             <p className="text-xs text-gray-500 mb-6 font-mono">ID: {map.id}</p>
                             
                             <div className="mt-auto grid grid-cols-2 gap-3">
                                 <button 
                                    onClick={() => handleEdit(map.id)}
                                    className="flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 py-2.5 rounded-lg text-sm font-bold transition-all border border-blue-600/20 hover:border-blue-600"
                                 >
                                     <Edit size={16} />
                                     Edit
                                 </button>
                                 <button 
                                    onClick={() => handleDelete(map.id)}
                                    className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 py-2.5 rounded-lg text-sm font-bold transition-all border border-red-600/20 hover:border-red-600"
                                 >
                                     <Trash2 size={16} />
                                     Delete
                                 </button>
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
