
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    getMyMaps, deleteMap, restoreMap, publishMap, uploadFile, 
    MapListItem, getPublicMaps, PublicMapListItem, getUserProfile, 
    getAuditMaps, AuditMapListItem, submitToAudit, auditMap 
} from '../../api';
import { 
    ArrowLeft, Edit, Trash2, Map as MapIcon, Plus, Globe, Upload, X, 
    Loader2, Image as ImageIcon, CheckCircle, AlertTriangle, EyeOff, 
    Activity, Ban, RotateCcw, ChevronLeft, ChevronRight, FileEdit, 
    LayoutGrid, Gamepad2, ImageOff, Calendar, ShieldAlert, Send, Check, XCircle 
} from 'lucide-react';

export const MyMaps: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab State derived from URL to persist across refreshes
  const activeTab = searchParams.get('tab') || 'drafts';

  // User Role State
  const [userRole, setUserRole] = useState<string>('0');

  // Drafts Data
  const [maps, setMaps] = useState<MapListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Published Maps Data
  const [publishedMaps, setPublishedMaps] = useState<PublicMapListItem[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(false);

  // Audit Maps Data
  const [auditMaps, setAuditMaps] = useState<AuditMapListItem[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Pagination State (Drafts only)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

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

  // --- Data Fetching ---

  useEffect(() => {
      const token = localStorage.getItem('access_token');
      if (!token) {
          navigate('/');
          return;
      }
      
      // Fetch User Role
      getUserProfile(token).then(profile => {
          setUserRole(profile.role);
      }).catch(console.error);
  }, []);

  const fetchDrafts = async (page: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      setLoading(true);
      // Status -1 to get all maps (deleted and active)
      const data = await getMyMaps(token, -1, page, pageSize);
      setMaps(data.list || []);
      setTotalPages(data.total_pages || 1);
      setCurrentPage(data.page || 1);
    } catch (err) {
      console.error(err);
      setError('Failed to load maps.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublished = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
          setLoadingPublished(true);
          // dataScope = 1 for current user
          const data = await getPublicMaps(1, token);
          setPublishedMaps(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingPublished(false);
      }
  };

  const fetchAuditMapsData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
          setLoadingAudit(true);
          const data = await getAuditMaps(token);
          setAuditMaps(data);
      } catch (err) {
          console.error(err);
      } finally {
          setLoadingAudit(false);
      }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (activeTab === 'drafts') {
        fetchDrafts(currentPage);
    } else if (activeTab === 'published') {
        fetchPublished();
    } else if (activeTab === 'audit') {
        fetchAuditMapsData();
    }
  }, [navigate, activeTab, currentPage]);

  // --- Handlers ---

  const handleEdit = (id: number) => {
    navigate(`/editor?id=${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this map?')) return;
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      await deleteMap({ map_id: id }, token);
      fetchDrafts(currentPage);
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
      fetchDrafts(currentPage);
      showToast('Map restored successfully', 'success');
    } catch (err) {
      showToast('Failed to restore map', 'error');
    }
  };

  const handlePlayPublished = (publicId: number) => {
      navigate(`/game?public_id=${publicId}`);
  };

  const handleSubmitAudit = async (publicMapId: number) => {
      if (!window.confirm('Submit this map for moderator review?')) return;
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await submitToAudit(publicMapId, token);
          showToast('Submitted for audit successfully!', 'success');
          fetchPublished(); // Refresh to update status
      } catch (e) {
          showToast('Failed to submit for audit', 'error');
      }
  };

  const handleAudit = async (publicMapId: number, status: number) => {
      const action = status === 2 ? 'Approve' : 'Reject';
      if (!window.confirm(`Are you sure you want to ${action} this map?`)) return;
      
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
          await auditMap({
              publish_map_id: publicMapId,
              audit_status: status
          }, token);
          showToast(`Map ${action}d successfully`, 'success');
          fetchAuditMapsData();
      } catch (e) {
          showToast(`Failed to ${action} map`, 'error');
      }
  };

  // --- Publish Modal Handlers ---

  const handlePublishClick = (map: MapListItem) => {
      setSelectedMapId(map.id);
      setPublishForm({
          title: map.title || `My Map #${map.id}`,
          description: ''
      });
      setCoverFile(null);
      setCoverPreview(null);
      setPublishModalOpen(true);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setCoverFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setCoverPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const token = localStorage.getItem('access_token');
      if (!token || !selectedMapId) return;

      setIsPublishing(true);
      try {
          let coverUrl = '';
          if (coverFile) {
              const uploadData = await uploadFile(coverFile, token);
              coverUrl = uploadData.url;
          }

          await publishMap({
              map_id: selectedMapId,
              title: publishForm.title,
              description: publishForm.description,
              cover: coverUrl
          }, token);

          showToast('Map published successfully!', 'success');
          setPublishModalOpen(false);
          fetchDrafts(currentPage); // Refresh status
      } catch (err: any) {
          console.error(err);
          showToast(err.message || 'Failed to publish map', 'error');
      } finally {
          setIsPublishing(false);
      }
  };

  // --- UI Components ---

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
      <button 
          onClick={() => setSearchParams({ tab: id })}
          className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold mb-2
              ${activeTab === id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
          `}
      >
          <Icon size={20} />
          <span>{label}</span>
      </button>
  );

  return (
    <div className="h-screen w-screen bg-gray-950 text-white overflow-hidden flex flex-col font-sans">
        
        {/* Toast Overlay */}
        {toast && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-[fade-in_0.2s_ease-out_forwards] pointer-events-none">
                <div className={`
                    flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border border-white/10 backdrop-blur-md
                    ${toast.type === 'success' ? 'bg-green-900/80 text-green-100' : 
                        toast.type === 'error' ? 'bg-red-900/80 text-red-100' : 
                        'bg-blue-900/80 text-blue-100'}
                `}>
                    {toast.type === 'success' && <CheckCircle size={20} />}
                    {toast.type === 'error' && <AlertTriangle size={20} />}
                    {toast.type === 'info' && <Activity size={20} />}
                    <span className="font-semibold text-sm">{toast.message}</span>
                </div>
            </div>
        )}

        {/* Publish Modal */}
        {isPublishModalOpen && (
            <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-[zoom-in_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                    <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <Globe size={20} className="text-blue-500"/>
                            Publish Map
                        </h3>
                        <button onClick={() => setPublishModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handlePublishSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Map Title</label>
                            <input 
                                type="text" 
                                required
                                value={publishForm.title}
                                onChange={e => setPublishForm({...publishForm, title: e.target.value})}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none"
                                placeholder="Super Mario World 1-1"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
                            <textarea 
                                value={publishForm.description}
                                onChange={e => setPublishForm({...publishForm, description: e.target.value})}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none h-24 resize-none"
                                placeholder="Tell players about your level..."
                            />
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cover Image</label>
                             <div className="flex items-start gap-4">
                                 <label className="flex-1 h-32 border-2 border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 hover:bg-gray-800 transition-all group overflow-hidden relative">
                                     {coverPreview ? (
                                         <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                                     ) : (
                                         <>
                                            <ImageIcon size={24} className="text-gray-500 mb-2 group-hover:text-blue-400" />
                                            <span className="text-xs text-gray-500 group-hover:text-gray-300">Click to upload</span>
                                         </>
                                     )}
                                     <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                                 </label>
                             </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button"
                                onClick={() => setPublishModalOpen(false)}
                                className="flex-1 py-3 rounded-lg font-bold text-gray-400 hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isPublishing}
                                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold py-3 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPublishing ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                                {isPublishing ? 'Publishing...' : 'Publish Now'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Top Navigation Bar */}
        <div className="bg-gray-900 border-b border-gray-800 p-4 shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
                    MY DASHBOARD
                </h1>
            </div>
            <button 
                onClick={() => navigate('/editor')} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
                <Plus size={20} />
                <span className="hidden sm:inline">New Map</span>
            </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 shrink-0 flex flex-col">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Library</div>
                
                <TabButton id="drafts" label="My Drafts" icon={FileEdit} />
                <TabButton id="published" label="Published Maps" icon={Globe} />

                {(userRole === '1' || userRole === '2') && (
                    <>
                        <div className="mt-6 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">Moderation</div>
                        <TabButton id="audit" label="Audit Queue" icon={ShieldAlert} />
                    </>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-950 flex flex-col relative overflow-hidden">
                
                {/* --- DRAFTS TAB --- */}
                {activeTab === 'drafts' && (
                    <div className="flex flex-col h-full">
                         {/* Scrollable Table Area */}
                         <div className="flex-1 overflow-y-auto p-8">
                            <div className="max-w-6xl mx-auto">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <FileEdit className="text-blue-400" />
                                    My Drafts
                                </h2>
                                
                                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                                                <th className="p-4 w-20 text-center">ID</th>
                                                <th className="p-4">Map Name</th>
                                                <th className="p-4 w-32">Status</th>
                                                <th className="p-4 w-32">Visibility</th>
                                                <th className="p-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {loading ? (
                                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading maps...</td></tr>
                                            ) : error ? (
                                                <tr><td colSpan={5} className="p-8 text-center text-red-400">{error}</td></tr>
                                            ) : maps.length === 0 ? (
                                                <tr><td colSpan={5} className="p-12 text-center text-gray-500">No maps found. Create your first one!</td></tr>
                                            ) : (
                                                maps.map((map) => (
                                                    <tr key={map.id} className="hover:bg-gray-800/50 transition-colors group">
                                                        <td className="p-4 text-center font-mono text-gray-500">#{map.id}</td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {map.title || "Untitled Map"}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            {map.status === 0 ? (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50">
                                                                    <Ban size={12} /> Deleted
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50">
                                                                    <Activity size={12} /> Normal
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            {map.is_public ? (
                                                                <span className="inline-flex items-center gap-1.5 text-xs text-blue-400">
                                                                    <Globe size={14} /> Published
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                                                    <EyeOff size={14} /> Draft
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                {map.status === 1 ? (
                                                                    <>
                                                                        <button 
                                                                            onClick={() => handlePublishClick(map)}
                                                                            disabled={map.is_public}
                                                                            className={`
                                                                                p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold
                                                                                ${map.is_public 
                                                                                    ? 'text-gray-600 cursor-not-allowed bg-gray-800/50' 
                                                                                    : 'bg-purple-600 text-white hover:bg-purple-500'}
                                                                            `}
                                                                            title={map.is_public ? "Already Published" : "Publish to Game Center"}
                                                                        >
                                                                            <Globe size={14} />
                                                                            {map.is_public ? 'Published' : 'Publish'}
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleEdit(map.id)}
                                                                            className="p-2 bg-gray-800 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-gray-700"
                                                                            title="Edit Map"
                                                                        >
                                                                            <Edit size={16} />
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleDelete(map.id)}
                                                                            className="p-2 bg-gray-800 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-gray-700"
                                                                            title="Delete Map"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => handleRestore(map.id)}
                                                                        className="px-3 py-2 bg-green-900/20 text-green-400 hover:bg-green-600 hover:text-white rounded-lg transition-colors border border-green-900/50 flex items-center gap-2 text-xs font-bold"
                                                                        title="Restore Map"
                                                                    >
                                                                        <RotateCcw size={14} /> Restore
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                         </div>

                         {/* Fixed Pagination Footer */}
                         <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center shrink-0">
                            <span className="text-sm text-gray-500">
                                Page <span className="text-white font-bold">{currentPage}</span> of {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                         </div>
                    </div>
                )}

                {/* --- PUBLISHED TAB --- */}
                {activeTab === 'published' && (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Globe className="text-green-400" />
                                Published Maps
                            </h2>
                            
                            {loadingPublished ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                            ) : publishedMaps.length === 0 ? (
                                <div className="text-center p-12 bg-gray-900 rounded-xl border border-gray-800">
                                    <Globe size={48} className="mx-auto text-gray-700 mb-4" />
                                    <p className="text-gray-500">You haven't published any maps yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {publishedMaps.map(map => (
                                        <div key={map.id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500/50 hover:shadow-lg transition-all flex flex-col group">
                                            {/* Cover */}
                                            <div className="h-40 bg-gray-800 relative overflow-hidden">
                                                {map.cover ? (
                                                    <img src={map.cover} alt={map.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                                                        <ImageOff size={32} className="mb-2 opacity-50"/>
                                                        <span className="text-[10px] uppercase font-bold">No Cover</span>
                                                    </div>
                                                )}
                                                
                                                {/* Audit Status Badge */}
                                                {map.audit_status === 1 ? (
                                                    <div className="absolute top-2 right-2 bg-yellow-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 backdrop-blur-sm">
                                                        <ShieldAlert size={10} /> Pending Audit
                                                    </div>
                                                ) : map.audit_status === 2 ? (
                                                     <div className="absolute top-2 right-2 bg-green-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 backdrop-blur-sm">
                                                        <Check size={10} /> Approved
                                                    </div>
                                                ) : map.audit_status === 3 ? (
                                                     <div className="absolute top-2 right-2 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1 backdrop-blur-sm">
                                                        <XCircle size={10} /> Rejected
                                                    </div>
                                                ) : null}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <h3 className="font-bold text-white mb-1 truncate" title={map.title}>{map.title}</h3>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-4">
                                                    <Calendar size={12} />
                                                    {new Date(map.create_at).toLocaleDateString()}
                                                </div>
                                                
                                                <div className="mt-auto flex gap-2">
                                                    <button 
                                                        onClick={() => handlePlayPublished(map.id)}
                                                        className="flex-1 bg-gray-800 hover:bg-blue-600 text-blue-400 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Gamepad2 size={14} /> View
                                                    </button>
                                                    
                                                    {/* Submit Audit Button - Only if no status or rejected */}
                                                    {(!map.audit_status || map.audit_status === 0 || map.audit_status === 3) && (
                                                        <button 
                                                            onClick={() => handleSubmitAudit(map.id)}
                                                            className="flex-1 bg-yellow-900/20 hover:bg-yellow-600 text-yellow-500 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-yellow-900/30"
                                                            title="Submit for Moderation"
                                                        >
                                                            <Send size={14} /> Submit
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- AUDIT QUEUE TAB --- */}
                {activeTab === 'audit' && (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <ShieldAlert className="text-red-400" />
                                Audit Queue
                            </h2>

                            {loadingAudit ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                            ) : auditMaps.length === 0 ? (
                                <div className="text-center p-12 bg-gray-900 rounded-xl border border-gray-800">
                                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                                    <p className="text-gray-500">All caught up! No maps pending review.</p>
                                </div>
                            ) : (
                                <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wider border-b border-gray-700">
                                                <th className="p-4 w-20">ID</th>
                                                <th className="p-4">Map Info</th>
                                                <th className="p-4 w-32">Submitted</th>
                                                <th className="p-4 text-right w-64">Verdict</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {auditMaps.map((map) => (
                                                <tr key={map.id} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="p-4 font-mono text-gray-500">#{map.id}</td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-12 h-12 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                                                                {map.cover ? (
                                                                    <img src={map.cover} alt="" className="w-full h-full object-cover" />
                                                                ) : <div className="flex items-center justify-center h-full"><ImageOff size={16} className="text-gray-600"/></div>}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-white text-sm">{map.title}</div>
                                                                <button onClick={() => handlePlayPublished(map.id)} className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
                                                                    <Gamepad2 size={10} /> Preview Map
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-400">
                                                        {new Date(map.create_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleAudit(map.id, 2)}
                                                                className="px-3 py-1.5 bg-green-900/20 hover:bg-green-600 text-green-400 hover:text-white rounded border border-green-900/50 transition-colors text-xs font-bold flex items-center gap-1"
                                                            >
                                                                <CheckCircle size={14} /> Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAudit(map.id, 3)}
                                                                className="px-3 py-1.5 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded border border-red-900/50 transition-colors text-xs font-bold flex items-center gap-1"
                                                            >
                                                                <XCircle size={14} /> Reject
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};
