
import React from 'react';
import { AuditMapListItem } from '../../api';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2, CheckCircle, ImageOff, Gamepad2, XCircle } from 'lucide-react';

interface AuditTabProps {
    maps: AuditMapListItem[];
    loading: boolean;
    onAudit: (id: number, status: number) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({ maps, loading, onAudit }) => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <ShieldAlert className="text-red-400" />
                    Audit Queue
                </h2>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                ) : maps.length === 0 ? (
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
                                {maps.map((map) => (
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
                                                    <button onClick={() => navigate(`/game?public_id=${map.id}`)} className="text-blue-400 text-xs hover:underline flex items-center gap-1 mt-0.5">
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
                                                    onClick={() => onAudit(map.id, 2)}
                                                    className="px-3 py-1.5 bg-green-900/20 hover:bg-green-600 text-green-400 hover:text-white rounded border border-green-900/50 transition-colors text-xs font-bold flex items-center gap-1"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                                <button 
                                                    onClick={() => onAudit(map.id, 3)}
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
    );
};
