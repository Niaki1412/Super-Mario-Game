
import React from 'react';
import { FileEdit, Globe, ShieldAlert } from 'lucide-react';

interface SidebarProps {
    activeTab: string;
    userRole: string;
    onTabChange: (tab: string) => void;
}

export const MyMapsSidebar: React.FC<SidebarProps> = ({ activeTab, userRole, onTabChange }) => {
    
    const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
        <button 
            onClick={() => onTabChange(id)}
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
    );
};
