import React from 'react';
import { MessageSquare, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

export default function RevisionHistory({ notes, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 overflow-hidden flex flex-col">
            <div className="p-6 bg-green-700 text-white flex justify-between items-center">
                <div className="flex items-center">
                    <MessageSquare size={20} className="mr-2" />
                    <h3 className="font-bold text-lg uppercase tracking-tight">Riwayat Revisi</h3>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-green-800 rounded-full transition-colors">
                    <CheckCircle size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {notes && notes.length > 0 ? (
                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                        {notes.map((note, index) => (
                            <div key={note.id} className="relative flex items-start group">
                                <div className={`absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 shadow-sm z-10 ${index === 0 ? 'border-green-500' : 'border-gray-200'}`}>
                                    {index === 0 ? <AlertCircle size={18} className="text-green-500" /> : <Clock size={16} className="text-gray-400" />}
                                </div>
                                <div className="ml-14 flex-1">
                                    <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            <User size={10} className="mr-1" /> {note.user?.name}
                                        </div>
                                        <span className="text-[10px] text-gray-400">{new Date(note.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className={`p-3 rounded-sm text-sm ${index === 0 ? 'bg-white border border-green-100 shadow-sm text-gray-800 font-medium' : 'bg-gray-100/50 text-gray-500'}`}>
                                        {note.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-10">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <MessageSquare size={32} />
                        </div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase">Tidak Ada Riwayat</h4>
                        <p className="text-[10px] text-gray-400 mt-2 px-4 italic">Belum ada catatan revisi untuk usulan ini.</p>
                    </div>
                )}
            </div>

            <div className="p-4 bg-gray-100 border-t border-gray-200 text-center">
                <p className="text-[10px] text-gray-400 font-medium uppercase italic">Histori dicatat secara otomatis oleh sistem</p>
            </div>
            
            {/* Overlay to close when clicking outside (conceptual) */}
            <div 
                className="fixed inset-0 -z-10 bg-black/10 backdrop-blur-sm cursor-pointer" 
                onClick={onClose}
            ></div>
        </div>
    );
}
