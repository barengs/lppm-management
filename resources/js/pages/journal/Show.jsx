import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Paperclip, FileText, User, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';

export default function JournalShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [journal, setJournal] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [newFile, setNewFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchData = async () => {
        try {
            const response = await api.get(`/journals/${id}`);
            setJournal(response.data);
            setMessages(response.data.messages || []);
        } catch (error) {
            toast.error("Gagal memuat data konsultasi");
            navigate('/journals');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage && !newFile) return;

        setIsSending(true);
        const formData = new FormData();
        formData.append('message', newMessage);
        if (newFile) formData.append('file', newFile);

        try {
            const res = await api.post(`/journals/${id}/messages`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessages([...messages, res.data]);
            setNewMessage('');
            setNewFile(null);
        } catch (error) {
            toast.error("Gagal mengirim pesan");
        } finally {
            setIsSending(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Ubah status menjadi ${newStatus}?`)) return;
        try {
            const res = await api.put(`/journals/${id}/status`, { status: newStatus });
            setJournal({ ...journal, status: res.data.status });
            toast.success("Status diperbarui");
        } catch (error) {
            toast.error("Gagal update status");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    if (!journal) return <div>Data not found</div>;

    const isAdmin = user?.role === 'admin' || user?.role === 'lppm';

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-6">
            {/* Left/Top Panel: Details */}
            <div className="md:w-1/3 space-y-4 overflow-y-auto">
                <button onClick={() => navigate('/journals')} className="flex items-center text-gray-600 hover:text-green-600 mb-2">
                    <ChevronLeft size={16} /> Kembali
                </button>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">{journal.title}</h1>
                    <div className="space-y-3 text-sm">
                         <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Penulis</span>
                            <span className="font-medium">{journal.user?.name}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Target Publisher</span>
                            <span className="font-medium text-blue-600">{journal.target_publisher || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Status</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                journal.status === 'approved' ? 'bg-green-100 text-green-700' : 
                                journal.status === 'revision_needed' ? 'bg-yellow-100 text-yellow-700' :
                                journal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>{journal.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Abstrak</span>
                            <div className="bg-gray-50 p-3 rounded text-gray-700 max-h-40 overflow-y-auto text-xs">
                                {journal.abstract || 'Tidak ada abstrak'}
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="mt-6 pt-4 border-t">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Update Status</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleStatusChange('in_review')} className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-xs hover:bg-blue-100">Reviewing</button>
                                <button onClick={() => handleStatusChange('revision_needed')} className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded text-xs hover:bg-yellow-100">Revisi</button>
                                <button onClick={() => handleStatusChange('approved')} className="bg-green-50 text-green-600 px-3 py-1 rounded text-xs hover:bg-green-100">Setujui</button>
                                <button onClick={() => handleStatusChange('rejected')} className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-100">Tolak</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right/Bottom Panel: Chat/Timeline */}
            <div className="md:w-2/3 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-full">
                <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700 flex items-center">
                    <Clock size={18} className="mr-2" /> Riwayat Diskusi & Revisi
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 py-10">Belum ada diskusi. Mulai dengan mengirim pesan atau file.</div>
                    )}
                    
                    {messages.map((msg) => {
                        const isMe = msg.user_id === user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                                    isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'
                                }`}>
                                    <div className="flex items-center text-xs opacity-75 mb-1 space-x-2">
                                        <span className="font-bold">{msg.user?.name}</span>
                                        <span>• {new Date(msg.created_at).toLocaleString()}</span>
                                    </div>
                                    
                                    {msg.message && <div className="whitespace-pre-wrap text-sm">{msg.message}</div>}
                                    
                                    {msg.file_path && (
                                        <div className={`mt-2 p-2 rounded flex items-center gap-2 ${isMe ? 'bg-green-700' : 'bg-gray-100'}`}>
                                            <FileText size={16} />
                                            <div className="flex-1 overflow-hidden">
                                                <a 
                                                    href={`/storage/${msg.file_path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={`text-xs truncate hover:underline block ${isMe ? 'text-green-100' : 'text-blue-600'}`}
                                                >
                                                    {msg.file_name || 'Download File'}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                    {newFile && (
                        <div className="flex items-center mb-2 bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm w-fit">
                            <Paperclip size={14} className="mr-1" />
                            <span className="truncate max-w-xs">{newFile.name}</span>
                            <button type="button" onClick={() => setNewFile(null)} className="ml-2 text-red-500 hover:text-red-700 font-bold">×</button>
                        </div>
                    )}
                    <div className="flex space-x-2">
                        <label className="cursor-pointer text-gray-400 hover:text-gray-600 p-2 border rounded-lg hover:bg-gray-50 transition-colors">
                            <Paperclip size={20} />
                            <input type="file" className="hidden" onChange={(e) => setNewFile(e.target.files[0])} />
                        </label>
                        <input 
                            type="text" 
                            className="flex-1 border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                            placeholder="Tulis pesan..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isSending || (!newMessage && !newFile)}
                            className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
