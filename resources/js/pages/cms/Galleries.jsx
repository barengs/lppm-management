import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';
import { Image, Plus, Trash2 } from 'lucide-react';

export default function GalleriesIndex() {
    const { token } = useAuthStore();
    const [galleries, setGalleries] = useState([]);
    
    // Simple placeholder for now as backend for Gallery Items is complex
    // Need to implement complex gallery management later if requested
    
    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Image className="mr-2 text-green-700" /> Galeri Kegiatan
                </h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center opacity-50 cursor-not-allowed">
                    <Plus size={18} className="mr-2" /> Tambah Album (Soon)
                </button>
            </div>
            
            <div className="bg-white p-10 text-center text-gray-500">
                Fitur Galeri akan segera hadir.
            </div>
        </div>
    );
}
