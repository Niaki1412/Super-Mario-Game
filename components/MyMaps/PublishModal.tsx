
import React, { useState, useEffect } from 'react';
import { MapListItem, PublishIn } from '../../api';
import { Globe, X, ImageIcon, Loader2, Upload } from 'lucide-react';

interface PublishModalProps {
    isOpen: boolean;
    selectedMap: MapListItem | null;
    onClose: () => void;
    onSubmit: (data: PublishIn, coverFile: File | null) => Promise<void>;
}

export const PublishModal: React.FC<PublishModalProps> = ({ isOpen, selectedMap, onClose, onSubmit }) => {
    const [publishForm, setPublishForm] = useState({ title: '', description: '' });
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && selectedMap) {
            setPublishForm({
                title: selectedMap.title || `My Map #${selectedMap.id}`,
                description: ''
            });
            setCoverFile(null);
            setCoverPreview(null);
            setError(null);
        }
    }, [isOpen, selectedMap]);

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
        if (!selectedMap) return;

        setIsPublishing(true);
        setError(null);
        try {
            await onSubmit({
                map_id: selectedMap.id,
                title: publishForm.title,
                description: publishForm.description,
            }, coverFile);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to publish');
        } finally {
            setIsPublishing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-[zoom-in_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <Globe size={20} className="text-blue-500"/>
                        Publish Map
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handlePublishSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-900/30 text-red-400 p-3 rounded text-sm border border-red-900/50">
                            {error}
                        </div>
                    )}
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
                            onClick={onClose}
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
    );
};
