
import React from 'react';
import { MapListItem } from '../../api';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Ban, Activity, Globe, EyeOff, Edit, Trash2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

interface DraftsTabProps {
    maps: MapListItem[];
    loading: boolean;
    error: string | null;
    pagination: {
        currentPage: number;
        setCurrentPage: (p: number | ((prev: number) => number)) => void;
        totalPages: number;
    };
    onDelete: (id: number) => void;
    onRestore: (id: number) => void;
    onPublishClick: (map: MapListItem) => void;
}

export const DraftsTab: React.FC<DraftsTabProps> = ({ 
    maps, loading, error, pagination, 
    onDelete, onRestore, onPublishClick 
}) => {
    const navigate = useNavigate();
    const { currentPage, setCurrentPage, totalPages } = pagination;

    return (
        <div className="flex flex-col h-full">
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
                                                                onClick={() => onPublishClick(map)}
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
                                                                onClick={() => navigate(`/editor?id=${map.id}`)}
                                                                className="p-2 bg-gray-800 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors border border-gray-700"
                                                                title="Edit Map"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => onDelete(map.id)}
                                                                className="p-2 bg-gray-800 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-gray-700"
                                                                title="Delete Map"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button 
                                                            onClick={() => onRestore(map.id)}
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

            {/* Pagination Footer */}
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
    );
};
