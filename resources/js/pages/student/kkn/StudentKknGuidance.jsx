import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { MessageSquare, Plus, Send, User, Paperclip, File, X } from 'lucide-react';

export default function StudentKknGuidance() {
    const { token, user } = useAuth();
    const [posto, setPosto] = useState(null);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isCreatingTopic, setIsCreatingTopic] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicMessage, setNewTopicMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef(null);

    // File States
    const [newTopicFiles, setNewTopicFiles] = useState([]);
    const [messageFiles, setMessageFiles] = useState([]);

    const [error, setError] = useState(null);

    // 1. Fetch User's Posto ID
    useEffect(() => {
        const fetchPosto = async () => {
            setError(null);
            try {
                const response = await axios.get('/api/dashboard/kkn/my-posto', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPosto(response.data.posto);
            } catch (error) {
                console.error("No posto found", error);
                setError(error.response?.data?.message || 'Gagal memuat informasi posko.');
            }
        };
        fetchPosto();
    }, [token]);

    // 2. Fetch Topics when Posto is ready
    useEffect(() => {
        if (posto) {
            fetchTopics();
        }
    }, [posto]);

    const fetchTopics = async () => {
        try {
            const response = await axios.get(`/api/kkn-guidance?kkn_posto_id=${posto.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopics(response.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    // 3. Fetch Messages when Topic Selected
    useEffect(() => {
        if (selectedTopic) {
            fetchMessages(selectedTopic.id);
        }
    }, [selectedTopic]);

    const fetchMessages = async (topicId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/api/kkn-guidance/${topicId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    // Real-time Listener
    useEffect(() => {
        if (!selectedTopic || !window.Echo) return;

        const channel = window.Echo.private(`guidance.${selectedTopic.id}`);
        
        channel.listen('GuidanceMessageSent', (e) => {
            console.log('New Message Event:', e);
            setMessages(prev => [...prev, e.message]);
        });

        return () => {
            channel.stopListening('GuidanceMessageSent');
        };
    }, [selectedTopic]);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('kkn_posto_id', posto.id);
            formData.append('title', newTopicTitle);
            formData.append('initial_message', newTopicMessage);
            for (let i = 0; i < newTopicFiles.length; i++) {
                formData.append('attachments[]', newTopicFiles[i]);
            }

            const response = await axios.post('/api/kkn-guidance', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setTopics([response.data, ...topics]);
            setIsCreatingTopic(false);
            setNewTopicTitle('');
            setNewTopicMessage('');
            setNewTopicFiles([]);
            setSelectedTopic(response.data); // Open immediately
        } catch (error) {
            alert('Failed to create topic');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && messageFiles.length === 0) return;

        try {
            const formData = new FormData();
            formData.append('message', newMessage);
            for (let i = 0; i < messageFiles.length; i++) {
                formData.append('attachments[]', messageFiles[i]);
            }

            const response = await axios.post(`/api/kkn-guidance/${selectedTopic.id}/messages`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            fetchMessages(selectedTopic.id);
            setNewMessage('');
            setMessageFiles([]);
        } catch (error) {
            alert('Failed to send message');
        }
    };

    if (!posto) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-gray-100 text-gray-500 rounded-lg border border-dashed border-gray-300">
                <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-600 mb-2">Bimbingan Belum Tersedia</p>
                <p className="text-sm">{error || "Anda belum tergabung dalam Kelompok KKN."}</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-100px)] bg-gray-100 rounded-lg overflow-hidden shadow-sm border">
            {/* Sidebar List */}
            <div className="w-1/3 bg-white border-r flex flex-col">
                <div className="h-20 px-4 border-b bg-gray-50 flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-gray-700 flex items-center">
                        <MessageSquare className="mr-2 text-green-600" size={20} /> Bimbingan
                    </h2>
                    <button 
                        onClick={() => setIsCreatingTopic(true)}
                        className="bg-green-600 text-white p-1.5 rounded-full hover:bg-green-700"
                        title="Topik Baru"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                    {topics.map(topic => (
                        <div 
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedTopic?.id === topic.id ? 'bg-green-50 border-l-4 border-green-600' : ''}`}
                        >
                            <h3 className="font-medium text-gray-800 truncate">{topic.title}</h3>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(topic.created_at).toLocaleDateString()} • {topic.user?.name}
                            </p>
                        </div>
                    ))}
                    {topics.length === 0 && <div className="p-4 text-center text-xs text-gray-400">Belum ada topik diskusi.</div>}
                </div>
            </div>

            {/* Chat Area */}
            <div className="w-2/3 flex flex-col bg-gray-50">
                {selectedTopic ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 px-4 bg-white border-b shadow-sm flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{selectedTopic.title}</h3>
                                <p className="text-xs text-gray-500">
                                    Dibuat oleh <span className="font-medium">{selectedTopic.user?.name}</span>
                                </p>
                            </div>
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full capitalize">
                                {selectedTopic.status}
                            </span>
                        </div>

                        {/* Messages */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {isLoading ? <div className="text-center p-4">Loading...</div> : messages.map((msg, idx) => {
                                const isMe = msg.user_id == user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="flex-shrink-0 mx-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                                    {msg.user?.name?.substring(0,2).toUpperCase()}
                                                </div>
                                            </div>
                                            <div>
                                                <div className={`p-3 rounded-lg text-sm shadow-sm ${
                                                    isMe ? 'bg-green-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'
                                                }`}>
                                                    <p className="whitespace-pre-wrap">{msg.message}</p>
                                                    
                                                    {/* Attachments */}
                                                    {msg.attachments && msg.attachments.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {msg.attachments.map((att, i) => (
                                                                <a 
                                                                    key={i} 
                                                                    href={`/storage/${att.path}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className={`flex items-center gap-2 p-2 rounded text-xs ${isMe ? 'bg-green-700/50 hover:bg-green-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                                                                >
                                                                    <File size={14} />
                                                                    <span className="truncate max-w-[150px]">{att.name}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                                    {msg.user?.name}, {new Date(msg.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 bg-white border-t">
                             {/* File Preview */}
                             {messageFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2 p-2 bg-gray-50 rounded-lg">
                                    {Array.from(messageFiles).map((file, i) => (
                                        <div key={i} className="flex items-center bg-white px-2 py-1 rounded border shadow-sm text-xs">
                                            <span className="truncate max-w-[100px]">{file.name}</span>
                                            <button 
                                                onClick={() => {
                                                    const newFiles = [...messageFiles];
                                                    newFiles.splice(i, 1);
                                                    setMessageFiles(newFiles);
                                                }}
                                                className="ml-2 text-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                             )}

                             <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <label className="cursor-pointer p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Paperclip size={20} />
                                    <input 
                                        type="file" multiple 
                                        className="hidden"
                                        onChange={(e) => setMessageFiles([...messageFiles, ...Array.from(e.target.files)])}
                                    />
                                </label>
                                <input
                                    type="text"
                                    className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Tulis pesan..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={selectedTopic.status === 'closed'}
                                />
                                <button 
                                    type="submit" 
                                    className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                    disabled={(!newMessage.trim() && messageFiles.length === 0) || selectedTopic.status === 'closed'}
                                >
                                    <Send size={20} />
                                </button>
                             </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-gray-400 flex-col">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p>Pilih topik diskusi di sebelah kiri</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isCreatingTopic && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="font-bold text-lg mb-4">Buat Topik Bimbingan Baru</h3>
                        <form onSubmit={handleCreateTopic}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Judul Topik</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded p-2"
                                    value={newTopicTitle}
                                    onChange={e => setNewTopicTitle(e.target.value)}
                                    required
                                    placeholder="Contoh: Konsultasi Program Kerja..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Pesan Awal</label>
                                <textarea 
                                    className="w-full border rounded p-2 h-24"
                                    value={newTopicMessage}
                                    onChange={e => setNewTopicMessage(e.target.value)}
                                    required
                                    placeholder="Jelaskan apa yang ingin didiskusikan..."
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Lampiran (Opsional)</label>
                                <input 
                                    type="file" multiple
                                    className="w-full border rounded p-2 text-sm"
                                    onChange={e => setNewTopicFiles(e.target.files)}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsCreatingTopic(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Buat Topik
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
