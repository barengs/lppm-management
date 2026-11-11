import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../../utils/api';
import { Save, Plus, Trash2, GripVertical, Edit2, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

// Sortable Item Component
function SortableItem({ item, depth = 0, onDelete, onEdit }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        marginLeft: `${depth * 20}px`,
    };

    return (
        <div ref={setNodeRef} style={style} className="group flex items-center bg-white p-3 mb-2 rounded border border-gray-200 shadow-sm hover:border-green-500 transition">
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 mr-2">
                <GripVertical size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800">{item.title}</div>
                <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
                    <span className="truncate max-w-xs">{item.url || '#'}</span>
                    {item.permission_name && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-mono">
                            {item.permission_name}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center space-x-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    type="button"
                    onClick={() => onEdit(item)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit item"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Hapus item"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}

const INITIAL_FORM_DATA = {
    title: '',
    url: '',
    target: '_self',
    parent_id: '',
    icon: '',
    permission_name: '',
};

function flattenTree(nodes, depth = 0) {
    let result = [];
    (nodes || []).forEach((node) => {
        result.push({ ...node, depth });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenTree(node.children, depth + 1));
        }
    });
    return result;
}

function buildStructureTree(flatItems) {
    const byId = new Set(flatItems.map((i) => i.id));
    const childrenByParent = new Map();

    flatItems.forEach((item) => {
        const parentKey = item.parent_id && byId.has(item.parent_id) ? item.parent_id : null;
        if (!childrenByParent.has(parentKey)) {
            childrenByParent.set(parentKey, []);
        }
        childrenByParent.get(parentKey).push(item);
    });

    const buildNodes = (parentId) => {
        const list = childrenByParent.get(parentId) || [];
        return list.map((item) => ({
            id: item.id,
            children: buildNodes(item.id),
        }));
    };

    return buildNodes(null);
}

function collectDescendantIds(flatItems, rootId) {
    const excluded = new Set();
    if (!rootId) return excluded;

    excluded.add(rootId);
    let added = true;
    while (added) {
        added = false;
        flatItems.forEach((item) => {
            if (item.parent_id && excluded.has(item.parent_id) && !excluded.has(item.id)) {
                excluded.add(item.id);
                added = true;
            }
        });
    }
    return excluded;
}

export default function MenuBuilder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingOrder, setSavingOrder] = useState(false);

    // Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [permissions, setPermissions] = useState([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchMenu = async () => {
        try {
            const res = await api.get(`/menus/${id}`);
            setMenu(res.data?.menu || null);
            setItems(flattenTree(res.data?.items || []));
        } catch (error) {
            console.error(error);
            toast.error('Gagal memuat data menu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMenu();
        api.get('/permissions')
            .then((res) => setPermissions(res.data || []))
            .catch(() => {});
    }, [id]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItems((prevItems) => {
            const oldIndex = prevItems.findIndex((i) => i.id === active.id);
            const newIndex = prevItems.findIndex((i) => i.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return prevItems;
            return arrayMove(prevItems, oldIndex, newIndex);
        });
    };

    const saveOrder = async () => {
        setSavingOrder(true);
        try {
            const structure = buildStructureTree(items);
            await api.post(`/menus/${id}/structure`, { structure });
            await fetchMenu();
            toast.success('Urutan menu disimpan!');
        } catch (e) {
            toast.error('Gagal menyimpan urutan');
        } finally {
            setSavingOrder(false);
        }
    };

    const handleDelete = async (itemId) => {
        if (!confirm('Hapus menu ini?')) return;
        try {
            await api.delete(`/menu-items/${itemId}`);
            toast.success('Menu berhasil dihapus');
            await fetchMenu();
        } catch (error) {
            toast.error('Gagal menghapus menu');
        }
    };

    const handleSaveItem = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            parent_id: formData.parent_id ? Number(formData.parent_id) : null,
            permission_name: formData.permission_name || null,
            icon: formData.icon.trim() || null,
        };

        try {
            if (editItem) {
                await api.put(`/menu-items/${editItem.id}`, payload);
            } else {
                await api.post(`/menus/${id}/items`, payload);
            }
            setIsModalOpen(false);
            setEditItem(null);
            setFormData(INITIAL_FORM_DATA);
            await fetchMenu();
            toast.success('Menu berhasil disimpan');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Gagal menyimpan');
        }
    };

    const openModal = (item = null) => {
        if (item) {
            setEditItem(item);
            setFormData({
                title: item.title || '',
                url: item.url || '',
                target: item.target || '_self',
                parent_id: item.parent_id ? String(item.parent_id) : '',
                icon: item.icon || '',
                permission_name: item.permission_name || '',
            });
        } else {
            setEditItem(null);
            setFormData(INITIAL_FORM_DATA);
        }
        setIsModalOpen(true);
    };

    const availableParents = useMemo(() => {
        const excludedIds = collectDescendantIds(items, editItem?.id);
        return items.filter((i) => !excludedIds.has(i.id));
    }, [items, editItem]);

    if (loading) return <div className="p-6 text-center text-gray-500">Memuat menu...</div>;

    if (!menu) {
        return (
            <div className="p-6 max-w-4xl mx-auto text-center space-y-4">
                <p className="text-red-600 font-medium">Menu tidak ditemukan.</p>
                <button
                    type="button"
                    onClick={() => navigate('/admin/menus')}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700"
                >
                    <ArrowLeft size={16} className="mr-2" /> Kembali ke Manajemen Menu
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/menus')}
                        className="inline-flex items-center text-xs text-gray-500 hover:text-green-700 mb-1"
                    >
                        <ArrowLeft size={14} className="mr-1" /> Kembali
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Menu: {menu.name}</h1>
                    <p className="text-gray-500">Atur struktur dan konten menu.</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => openModal()}
                        className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-800"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Item
                    </button>
                    <button
                        type="button"
                        onClick={saveOrder}
                        disabled={savingOrder}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Save size={18} className="mr-2" /> {savingOrder ? 'Menyimpan...' : 'Simpan Urutan'}
                    </button>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                        {items.map((item) => (
                            <SortableItem
                                key={item.id}
                                item={item}
                                depth={item.depth}
                                onDelete={handleDelete}
                                onEdit={openModal}
                            />
                        ))}
                    </SortableContext>
                </DndContext>

                {items.length === 0 && (
                    <div className="text-center py-10 text-gray-400">
                        Belum ada item menu.
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{editItem ? 'Edit Item' : 'Tambah Item Baru'}</h3>
                        <form onSubmit={handleSaveItem} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Menu</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL / Link</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="/contoh, # atau https://..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Induk Menu (Parent)</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        value={formData.parent_id}
                                        onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                                    >
                                        <option value="">-- Menu Utama (Root) --</option>
                                        {availableParents.map((i) => (
                                            <option key={i.id} value={i.id}>
                                                {'-'.repeat(i.depth)} {i.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                                    <select
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        value={formData.target}
                                        onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    >
                                        <option value="_self">Tab Sama (_self)</option>
                                        <option value="_blank">Tab Baru (_blank)</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permission (Hak Akses)</label>
                                <select
                                    className="w-full border rounded px-3 py-2 text-sm"
                                    value={formData.permission_name}
                                    onChange={(e) => setFormData({ ...formData, permission_name: e.target.value })}
                                >
                                    <option value="">-- Tanpa Permission (Semua User Login) --</option>
                                    {permissions.map((perm) => (
                                        <option key={perm.id} value={perm.name}>
                                            {perm.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Lucide Name)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded px-3 py-2"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. FileText, Users, Shield"
                                />
                            </div>
                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
