

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyMaps, deleteMap, restoreMap, publishMap, uploadFile, MapListItem } from '../../api';
import { ArrowLeft, Edit, Trash2, Map as MapIcon, Plus, Globe, Upload, X, Loader2, Image as ImageIcon, CheckCircle, AlertTriangle, Eye, EyeOff, Activity, Ban, RotateCcw } from 'lucide-react';

export const MyMaps: React.FC = () => {
  const navigate = useNavigate();
  const [maps, setMaps] = useState<MapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast State
  const [toast, setToast] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now();
      setToast({ id, message, type });
      setTimeout(() => {
          setToast(current => current?.id === id ? null : current);
      }, 3000);
  };

  // Publish Modal State
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const [publishForm, setPublishForm] = useState({ title: '', description: '' });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchMaps = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      setLoading(true);
      const data = await getMyMaps(token);
      setMaps(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load maps.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
      return;
    }
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
      // Update local state to reflect status change immediately
      setMaps(prev => prev.map(m => m.id === id ? { ...m, status: 0 } : m));
      showToast('Map deleted successfully', 'success');
    } catch (err) {
      showToast('Failed to delete map', 'error');
    }
  };

  const handleRestore = async (id: number) => {
    if (!window.confirm('Are you sure you want to restore this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await restoreMap({ map_id: id }, token);
      // Update local state to reflect status change immediately
      setMaps(prev => prev.map(m => m.id === id ? { ...m, status: 1 } : m));
      showToast('Map restored successfully', 'success');
    } catch (err) {
      showToast('Failed to restore map', 'error');
    }
  };

  // --- Publish Logic ---
  
  const openPublishModal = (id: number, currentTitle?: string) => {
      setSelectedMapId(id);
      setPublishForm({ title: currentTitle || `Map #${id}`, description: '' });
      setCoverFile(null);
      setCoverPreview(null);
      setPublishModalOpen(true);
  };

  const closePublishModal = () => {
      setPublishModalOpen(false);
      setSelectedMapId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setCoverFile(file);
          setCoverPreview(URL.createObjectURL(file));
      }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedMapId) return;
      const token = localStorage.getItem('access_token');
      if (!token) return;

      setIsPublishing(true);

      try {
          let coverUrl = '';
          
          // 1. Upload Cover if exists
          if (coverFile) {
              const uploadRes = await uploadFile(coverFile, token);
              coverUrl = uploadRes.url;
          }

          // 2. Publish Map
          await publishMap({
              map_id: selectedMapId,
              title: publishForm.title,
              description: publishForm.description,
              cover: coverUrl
          }, token);

          showToast('Map published successfully!', 'success');
          closePublishModal();
          fetchMaps(); // Refresh list to update status
      } catch (error) {
          console.error('Publish failed', error);
          showToast('Failed to publish map. Please try again.', 'error');
      } finally {
          setIsPublishing(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans relative">
      {/* Toast Notification */}
      {toast && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-top-4 pointer-events-none">
              <div className={`
                  flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border border-white/10 backdrop-blur-md
                  ${toast.type === 'success' ? 'bg-green-900/90 text-green-100' : 
                    toast.type === 'error' ? 'bg-red-900/90 text-red-100' : 
                    'bg-blue-900/90 text-blue-100'}
              `}>
                  {toast.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
                  {toast.type === 'error' && <AlertTriangle size={20} className="text-red-400" />}
                  <span className="font-semibold text-sm">{toast.message}</span>
              </div>
          </div>
      )}

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
                 <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                                    <th className="p-5 font-semibold">Map Name / ID</th>
                                    <th className="p-5 font-semibold">Status</th>
                                    <th className="p-5 font-semibold">Visibility</th>
                                    <th className="p-5 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {maps.map((map) => (
                                    <tr key={map.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="p-5">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-700 p-2 rounded-lg text-emerald-400">
                                                    <MapIcon size={20} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-200 text-lg">{map.title || 'Untitled Map'}</span>
                                                    <span className="font-mono text-xs text-gray-500">ID: {map.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Status Column */}
                                        <td className="p-5">
                                            {map.status === 1 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                                    <Activity size={12} />
                                                    Normal
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-red-500/10 text-red-400 border-red-500/20">
                                                    <Ban size={12} />
                                                    Deleted
                                                </span>
                                            )}
                                        </td>

                                        {/* Visibility Column */}
                                        <td className="p-5">
                                            {map.is_public ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-purple-500/10 text-purple-400 border-purple-500/20">
                                                    <Globe size={12} />
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-gray-500/10 text-gray-400 border-gray-500/20">
                                                    <EyeOff size={12} />
                                                    Draft
                                                </span>
                                            )}
                                        </td>

                                        <td className="p-5">
                                            <div className="flex justify-end items-center gap-3">
                                                {map.status === 1 && (
                                                    <>
                                                        <button 
                                                            onClick={() => openPublishModal(map.id, map.title)}
                                                            className="flex items-center gap-2 bg-purple-600/10 hover:bg-purple-600 hover:text-white text-purple-400 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-purple-600/20 hover:border-purple-600"
                                                            title="Publish to Game Center"
                                                        >
                                                            <Globe size={14} />
                                                            Publish
                                                        </button>
                                                        <button 
                                                            onClick={() => handleEdit(map.id)}
                                                            className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-400 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-blue-600/20 hover:border-blue-600"
                                                        >
                                                            <Edit size={14} />
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(map.id)}
                                                            className="flex items-center gap-2 bg-red-600/10 hover:bg-red-600 hover:text-white text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-red-600/20 hover:border-red-600"
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                                {map.status === 0 && (
                                                    <button 
                                                        onClick={() => handleRestore(map.id)}
                                                        className="flex items-center gap-2 bg-green-600/10 hover:bg-green-600 hover:text-white text-green-400 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-green-600/20 hover:border-green-600"
                                                        title="Restore Map"
                                                    >
                                                        <RotateCcw size={14} />
                                                        Restore
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                 </div>
             )}
        </div>
      </div>

      {/* PUBLISH MODAL */}
      {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-[#1e1e1e] border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative flex flex-col max-h-[90vh]">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-900/30 rounded-lg text-purple-400">
                              <Globe size={24} />
                          </div>
                          <div>
                              <h2 className="text-xl font-bold text-white">Publish Map</h2>
                              <p className="text-xs text-gray-400">Share your creation with the world</p>
                          </div>
                      </div>
                      <button onClick={closePublishModal} className="text-gray-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                          <X size={20} />
                      </button>
                  </div>

                  {/* Body */}
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      <form id="publishForm" onSubmit={handlePublishSubmit} className="space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Map Title</label>
                              <input 
                                  type="text" 
                                  required
                                  value={publishForm.title}
                                  onChange={(e) => setPublishForm({...publishForm, title: e.target.value})}
                                  className="w-full bg-black/20 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600"
                                  placeholder="e.g. Super Mario World 1-1"
                              />
                          </div>
                          
                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Description</label>
                              <textarea 
                                  rows={4}
                                  value={publishForm.description}
                                  onChange={(e) => setPublishForm({...publishForm, description: e.target.value})}
                                  className="w-full bg-black/20 border border-gray-600 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-600 resize-none"
                                  placeholder="Describe your level..."
                              />
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Cover Image</label>
                              <div className="border-2 border-dashed border-gray-600 rounded-xl p-4 hover:border-gray-500 hover:bg-gray-800/50 transition-colors cursor-pointer group relative">
                                  <input 
                                      type="file" 
                                      accept="image/*"
                                      onChange={handleFileChange}
                                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                  />
                                  
                                  {coverPreview ? (
                                      <div className="relative h-40 w-full rounded-lg overflow-hidden">
                                          <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                              <span className="text-white text-sm font-bold flex items-center gap-2">
                                                  <ImageIcon size={16} /> Change Image
                                              </span>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="flex flex-col items-center justify-center py-8 text-gray-500 group-hover:text-gray-300">
                                          <Upload size={32} className="mb-2" />
                                          <span className="text-sm font-medium">Click to upload cover image</span>
                                          <span className="text-xs opacity-50 mt-1">JPG, PNG supported</span>
                                      </div>
                                  )}
                              </div>
                          </div>
                      </form>
                  </div>

                  {/* Footer */}
                  <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex justify-end gap-3">
                      <button 
                          type="button"
                          onClick={closePublishModal}
                          className="px-5 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg font-bold text-sm transition-colors"
                      >
                          Cancel
                      </button>
                      <button 
                          type="submit"
                          form="publishForm"
                          disabled={isPublishing}
                          className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          {isPublishing ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Publishing...
                              </>
                          ) : (
                              <>
                                <Globe size={16} />
                                Confirm Publish
                              </>
                          )}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};