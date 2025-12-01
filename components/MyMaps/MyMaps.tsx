
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle, AlertTriangle, Activity } from 'lucide-react';
import { MapListItem } from '../../api';

// Imports from split files
import { useMyMaps } from './useMyMaps';
import { MyMapsSidebar } from './MyMapsSidebar';
import { DraftsTab } from './DraftsTab';
import { PublishedTab } from './PublishedTab';
import { AuditTab } from './AuditTab';
import { PublishModal } from './PublishModal';

export const MyMaps: React.FC = () => {
  const navigate = useNavigate();
  
  // Logic Hook
  const { 
      activeTab, setTab, userRole, 
      drafts, publishedMaps, auditMaps, 
      loading, error, pagination, 
      toast, actions 
  } = useMyMaps();

  // Local Modal State (UI specific)
  const [isPublishModalOpen, setPublishModalOpen] = useState(false);
  const [selectedMapToPublish, setSelectedMapToPublish] = useState<MapListItem | null>(null);

  const handleOpenPublish = (map: MapListItem) => {
      setSelectedMapToPublish(map);
      setPublishModalOpen(true);
  };

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
        <PublishModal 
            isOpen={isPublishModalOpen}
            selectedMap={selectedMapToPublish}
            onClose={() => setPublishModalOpen(false)}
            onSubmit={actions.executePublish}
        />

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
            <MyMapsSidebar 
                activeTab={activeTab} 
                userRole={userRole} 
                onTabChange={setTab} 
            />

            {/* Main Content Area */}
            <div className="flex-1 bg-gray-950 flex flex-col relative overflow-hidden">
                
                {activeTab === 'drafts' && (
                    <DraftsTab 
                        maps={drafts} 
                        loading={loading} 
                        error={error}
                        pagination={pagination}
                        onDelete={actions.deleteDraft}
                        onRestore={actions.restoreDraft}
                        onPublishClick={handleOpenPublish}
                    />
                )}

                {activeTab === 'published' && (
                    <PublishedTab 
                        maps={publishedMaps}
                        loading={loading}
                        onSubmitAudit={actions.submitAudit}
                    />
                )}

                {activeTab === 'audit' && (
                    <AuditTab 
                        maps={auditMaps}
                        loading={loading}
                        onAudit={actions.performAudit}
                    />
                )}

            </div>
        </div>
    </div>
  );
};
