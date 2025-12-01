
import React from 'react';
import { PublicMapListItem } from '../../api';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, ImageOff, ShieldAlert, Check, XCircle, Calendar, Gamepad2, Send } from 'lucide-react';

interface PublishedTabProps {
    maps: PublicMapListItem[];
    loading: boolean;
    onSubmitAudit: (id: number) => void;
}

export const PublishedTab: React.FC<PublishedTabProps> = ({ maps, loading, onSubmitAudit }) => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Globe className="text-green-400" />
                    Published Maps
                </h2>
                
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                ) : maps.length === 0 ? (
                    <div className="text-center p-12 bg-gray-900 rounded-xl border border-gray-800">
                        <Globe size={48} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500">You haven't published any maps yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {maps.map(map => (
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
                                            onClick={() => navigate(`/game?public_id=${map.id}`)}
                                            className="flex-1 bg-gray-800 hover:bg-blue-600 text-blue-400 hover:text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Gamepad2 size={14} /> View
                                        </button>
                                        
                                        {/* Submit Audit Button - Only if no status or rejected */}
                                        {(!map.audit_status || map.audit_status === 0 || map.audit_status === 3) && (
                                            <button 
                                                onClick={() => onSubmitAudit(map.id)}
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
    );
};
