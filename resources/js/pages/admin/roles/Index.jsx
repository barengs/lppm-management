import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../hooks/useAuth';
import { Shield, Plus, Trash2, CheckSquare, Square, Search, Sidebar as SidebarIcon } from 'lucide-react';
import DataTable from '../../../components/DataTable';

const MODULE_LABELS = {
    dashboard: 'Dashboard LPPM',
    dashboard_kkn: 'Dashboard KKN',
    proposals: 'Proposal & Penilaian Penelitian',
    pkm_proposals: 'Proposal & Penilaian PKM',
    pkm_master_data: 'Master PKM',
    admin_proposals: 'Monitoring Penelitian',
    admin_pkm: 'Monitoring PKM',
    reports: 'Monitoring & Laporan KKN/Abmas',
    journal_consultations: 'Cek Jurnal',
    kkn: 'Status KKN Saya (Mahasiswa)',
    kkn_group: 'Kelompok KKN Saya',
    kkn_periods: 'Periode KKN',
    kkn_registrations: 'Pendaftaran KKN',
    kkn_locations: 'Lokasi KKN',
    kkn_postos: 'Posko KKN',
    kkn_participants: 'Peserta KKN',
    kkn_guidance: 'Bimbingan KKN',
    kkn_reports: 'Laporan & Kegiatan KKN',
    kkn_grades: 'Penilaian & Sertifikat KKN',
    kkn_document_templates: 'Template Dokumen KKN',
    kkn_field_monitorings: 'Monitoring Lapangan KKN',
    kkn_monitor_team: 'Tim Monitoring KKN',
    faculties: 'Fakultas',
    study_programs: 'Program Studi',
    fiscal_years: 'Tahun Akademik',
    schemes: 'Skema Program',
    students: 'Data Mahasiswa',
    master_science_clusters: 'Rumpun Ilmu',
    master_research_priorities: 'Prioritas Riset',
    master_selections: 'Tema SDG',
    users: 'Pengguna',
    roles: 'Role & Permission',
    permissions: 'Master ID Izin',
    menus: 'Manajemen Menu',
    pages: 'Halaman Statis',
    settings: 'Pengaturan Sistem',
    posts: 'Berita & Artikel',
    documents: 'Dokumen',
    galleries: 'Galeri',
    lecturer_stats: 'Kinerja Dosen',
    organization: 'Organisasi',
};

const ACTION_LABELS = {
    view: 'Lihat',
    create: 'Tambah',
    edit: 'Ubah',
    delete: 'Hapus',
    publish: 'Terbitkan',
    submit: 'Ajukan',
    review: 'Review / Penilaian',
    approve: 'Setujui',
    reject: 'Tolak',
    verify: 'Verifikasi',
    revise: 'Revisi',
    reply: 'Balas',
    close: 'Tutup',
    manage: 'Kelola',
    manage_trash: 'Kelola Sampah',
    manage_members: 'Kelola Anggota',
    download_certificate: 'Sertifikat',
    settings: 'Pengaturan Penilaian',
    view_all: 'Laporan Monitoring (Semua)',
    register: 'Akses Pendaftaran',
};

const STANDALONE_PERMISSION_MAP = {
    manage_proposal_trash: { resource: 'admin_proposals', action: 'manage_trash' },
    manage_pkm_trash: { resource: 'admin_pkm', action: 'manage_trash' },
};

const FALLBACK_CATEGORY_ORDER = [
    'Main',
    'Penelitian & Pengabdian',
    'KKN (Kuliah Kerja Nyata)',
    'Master Data',
    'Manajemen Sistem',
    'CMS & Informasi',
    'Profil',
    'Hak Akses Lainnya',
];

function parsePermission(perm) {
    if (STANDALONE_PERMISSION_MAP[perm.name]) {
        const mapped = STANDALONE_PERMISSION_MAP[perm.name];
        return {
            id: perm.id,
            name: perm.name,
            resource: mapped.resource,
            action: mapped.action,
        };
    }

    const parts = perm.name.split('.');
    const resource = parts[0];
    const action = parts.length > 1 ? parts.slice(1).join('.') : 'manage';

    return {
        id: perm.id,
        name: perm.name,
        resource,
        action,
    };
}

export default function RolesIndex() {
    const { token, fetchUser } = useAuth();
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [sidebarGroups, setSidebarGroups] = useState([]);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [matrixSearch, setMatrixSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRoles = async () => {
        try {
            const response = await axios.get('/api/roles', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRoles(response.data);
        } catch (error) {
            console.error('Failed to fetch roles', error);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await axios.get('/api/permissions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPermissions(response.data);
        } catch (error) {
            console.error('Failed to fetch permissions', error);
        }
    };

    const fetchSidebarMenus = async () => {
        try {
            const response = await axios.get('/api/menus/sidebar', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSidebarGroups(response.data?.items || []);
        } catch (error) {
            console.error('Failed to fetch sidebar menus', error);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchRoles();
        fetchPermissions();
        fetchSidebarMenus();
    }, [token]);

    // Map each permission_name & resource to its sidebar menu items and primary group
    const sidebarMeta = useMemo(() => {
        const permToMenus = {};
        const resourceToGroup = {};
        const resourceToMenus = {};
        const groupOrder = [];

        sidebarGroups.forEach((group) => {
            const groupTitle = group.title || 'Lainnya';
            if (!groupOrder.includes(groupTitle)) {
                groupOrder.push(groupTitle);
            }

            (group.children || []).forEach((item) => {
                if (!item.permission_name) return;
                const parsed = parsePermission({ id: 0, name: item.permission_name });

                if (!permToMenus[item.permission_name]) {
                    permToMenus[item.permission_name] = [];
                }
                permToMenus[item.permission_name].push({
                    groupTitle,
                    title: item.title,
                    url: item.url,
                });

                if (!resourceToGroup[parsed.resource]) {
                    resourceToGroup[parsed.resource] = groupTitle;
                }

                if (!resourceToMenus[parsed.resource]) {
                    resourceToMenus[parsed.resource] = [];
                }
                resourceToMenus[parsed.resource].push({
                    title: item.title,
                    url: item.url,
                    permissionName: item.permission_name,
                    action: parsed.action,
                    groupTitle,
                });
            });
        });

        return { permToMenus, resourceToGroup, resourceToMenus, groupOrder };
    }, [sidebarGroups]);

    // Deduplicate permissions by name and group by resource & sidebar section
    const categorizedResources = useMemo(() => {
        const uniqueMap = new Map();
        permissions.forEach((p) => {
            if (!uniqueMap.has(p.name)) {
                uniqueMap.set(p.name, p);
            }
        });

        const groups = {};
        uniqueMap.forEach((p) => {
            const parsed = parsePermission(p);
            if (!groups[parsed.resource]) {
                groups[parsed.resource] = [];
            }
            groups[parsed.resource].push(parsed);
        });

        // Bucket resources into sidebar categories
        const sectionMap = {};
        Object.entries(groups).forEach(([resource, perms]) => {
            const category = sidebarMeta.resourceToGroup[resource] || 'Hak Akses Lainnya';
            if (!sectionMap[category]) {
                sectionMap[category] = [];
            }
            sectionMap[category].push({
                resource,
                label: MODULE_LABELS[resource] || resource.replace(/_/g, ' '),
                perms,
                menus: sidebarMeta.resourceToMenus[resource] || [],
            });
        });

        const orderedNames = [
            ...sidebarMeta.groupOrder,
            ...FALLBACK_CATEGORY_ORDER.filter((g) => !sidebarMeta.groupOrder.includes(g)),
            ...Object.keys(sectionMap).filter(
                (g) => !sidebarMeta.groupOrder.includes(g) && !FALLBACK_CATEGORY_ORDER.includes(g)
            ),
        ];

        return orderedNames
            .filter((cat) => sectionMap[cat]?.length > 0)
            .map((cat) => ({
                category: cat,
                modules: sectionMap[cat],
            }));
    }, [permissions, sidebarMeta]);

    const filteredSections = useMemo(() => {
        const q = matrixSearch.trim().toLowerCase();
        if (!q) return categorizedResources;

        return categorizedResources
            .map((sec) => {
                const matchingModules = sec.modules.filter((mod) => {
                    if (sec.category.toLowerCase().includes(q)) return true;
                    if (mod.label.toLowerCase().includes(q)) return true;
                    if (mod.resource.toLowerCase().includes(q)) return true;
                    if (mod.menus.some((m) => m.title.toLowerCase().includes(q) || (m.url || '').toLowerCase().includes(q))) {
                        return true;
                    }
                    return mod.perms.some(
                        (p) =>
                            p.name.toLowerCase().includes(q) ||
                            (ACTION_LABELS[p.action] || p.action).toLowerCase().includes(q)
                    );
                });
                return { ...sec, modules: matchingModules };
            })
            .filter((sec) => sec.modules.length > 0);
    }, [categorizedResources, matrixSearch]);

    const allUniquePermissionNames = useMemo(
        () => Array.from(new Set(permissions.map((p) => p.name))),
        [permissions]
    );

    const handleAddClick = () => {
        setName('');
        setSelectedPermissions([]);
        setMatrixSearch('');
        setIsEditing(false);
        setShowModal(true);
    };

    const handleEditClick = (role) => {
        setName(role.name);
        setSelectedPermissions(Array.from(new Set((role.permissions || []).map((p) => p.name))));
        setSelectedId(role.id);
        setMatrixSearch('');
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDeleteClick = async (id, roleName) => {
        if (['admin', 'dosen', 'reviewer', 'mahasiswa'].includes(roleName)) {
            alert('Cannot delete system roles.');
            return;
        }

        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await axios.delete(`/api/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchRoles();
        } catch (error) {
            console.error(error);
            alert('Failed to delete role.');
        }
    };

    const togglePermission = (permissionName) => {
        setSelectedPermissions((prev) =>
            prev.includes(permissionName)
                ? prev.filter((p) => p !== permissionName)
                : [...prev, permissionName]
        );
    };

    const toggleGroupPermissions = (permNames) => {
        const allSelected = permNames.every((p) => selectedPermissions.includes(p));
        setSelectedPermissions((prev) => {
            if (allSelected) {
                return prev.filter((p) => !permNames.includes(p));
            }
            const next = new Set(prev);
            permNames.forEach((p) => next.add(p));
            return Array.from(next);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const payload = { name, permissions: selectedPermissions };

            if (isEditing) {
                await axios.put(`/api/roles/${selectedId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post('/api/roles', payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setShowModal(false);
            await Promise.all([fetchRoles(), fetchUser()]);
        } catch (error) {
            console.error(error);
            alert('Failed to save role.');
        }
        setIsSubmitting(false);
    };

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nama Role',
                cell: ({ row }) => (
                    <span className="font-medium text-gray-900 capitalize">{row.original.name}</span>
                ),
            },
            {
                id: 'permissions_count',
                header: 'Hak Akses',
                cell: ({ row }) => (
                    <span className="text-gray-500 text-xs px-2 py-1 bg-gray-100 rounded-full">
                        {row.original.permissions?.length || 0} Permissions
                    </span>
                ),
            },
            {
                id: 'actions',
                header: 'Aksi',
                cell: ({ row }) => {
                    const isSystemRole = ['admin', 'dosen', 'reviewer', 'mahasiswa'].includes(
                        row.original.name
                    );
                    return (
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => handleEditClick(row.original)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Manage Permissions"
                            >
                                <Shield size={16} />
                            </button>
                            <button
                                onClick={() => handleDeleteClick(row.original.id, row.original.name)}
                                className={`text-red-600 hover:text-red-900 ${
                                    isSystemRole ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={isSystemRole}
                                title={isSystemRole ? 'System Role cannot be deleted' : 'Delete'}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    );
                },
            },
        ],
        []
    );

    const renderCheckbox = (perm) => {
        if (!perm) return <span className="text-gray-300">-</span>;
        const isChecked = selectedPermissions.includes(perm.name);
        const linkedMenus = sidebarMeta.permToMenus[perm.name] || [];
        const tooltipText =
            linkedMenus.length > 0
                ? `${perm.name} — Membuka menu sidebar: ${linkedMenus.map((m) => m.title).join(', ')}`
                : perm.name;

        return (
            <button
                type="button"
                onClick={() => togglePermission(perm.name)}
                className={`w-5 h-5 mx-auto rounded border flex items-center justify-center cursor-pointer transition-colors ${
                    isChecked
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-gray-300 hover:border-green-500'
                }`}
                title={tooltipText}
            >
                {isChecked && <CheckSquare size={14} />}
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Shield className="mr-2 text-green-700" /> Manajemen Hak Akses (Role)
                </h1>
                <button
                    onClick={handleAddClick}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center shadow-sm"
                >
                    <Plus size={18} className="mr-2" /> Tambah Role
                </button>
            </div>

            <div className="bg-white shadow rounded-lg p-4">
                <DataTable
                    data={roles}
                    columns={columns}
                    options={{
                        enableGlobalFilter: true,
                        enableSorting: true,
                        enablePagination: true,
                        initialPageSize: 10,
                        searchPlaceholder: 'Cari role...',
                        emptyMessage: 'Tidak ada data role',
                    }}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-6xl h-[92vh] flex flex-col">
                        {/* Header */}
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    {isEditing ? 'Edit Role & Permissions' : 'Tambah Role Baru'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Matrix disusun berdasarkan kategori menu sidebar agar pengaturan menu & hak akses lebih akurat.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                            {/* Scrollable Content */}
                            <div className="flex-grow overflow-y-auto p-6">
                                <div className="mb-5">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nama Role
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. staff_keuangan"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 border p-2"
                                        value={name}
                                        onChange={(e) => {
                                            const val = e.target.value
                                                .toLowerCase()
                                                .replace(/\s+/g, '_')
                                                .replace(/[^a-z0-9_]/g, '');
                                            setName(val);
                                        }}
                                        disabled={
                                            isEditing &&
                                            ['admin', 'dosen', 'mahasiswa', 'reviewer'].includes(name)
                                        }
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: Huruf kecil, angka, dan underscore (_). Spasi otomatis diubah menjadi underscore.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <CheckSquare size={18} className="mr-2 text-green-600" />
                                        Menu & Permission Matrix
                                        <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                            {selectedPermissions.length} / {allUniquePermissionNames.length} dipilih
                                        </span>
                                    </h3>

                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search
                                                size={14}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                type="text"
                                                value={matrixSearch}
                                                onChange={(e) => setMatrixSearch(e.target.value)}
                                                placeholder="Cari menu / modul..."
                                                className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroupPermissions(allUniquePermissionNames)}
                                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
                                        >
                                            {allUniquePermissionNames.every((p) =>
                                                selectedPermissions.includes(p)
                                            )
                                                ? 'Kosongkan Semua'
                                                : 'Pilih Semua'}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    {filteredSections.map((section) => {
                                        const sectionPerms = section.modules.flatMap((m) =>
                                            m.perms.map((p) => p.name)
                                        );
                                        const allSectionSelected =
                                            sectionPerms.length > 0 &&
                                            sectionPerms.every((p) =>
                                                selectedPermissions.includes(p)
                                            );

                                        return (
                                            <div
                                                key={section.category}
                                                className="border rounded-lg overflow-hidden"
                                            >
                                                <div className="bg-green-50/70 px-4 py-2.5 border-b flex items-center justify-between">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-green-900 flex items-center gap-1.5">
                                                        <SidebarIcon size={14} className="text-green-700" />
                                                        {section.category}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleGroupPermissions(sectionPerms)}
                                                        className="text-xs font-medium text-green-700 hover:text-green-900"
                                                    >
                                                        {allSectionSelected
                                                            ? 'Batalkan Kategori'
                                                            : 'Pilih Kategori Ini'}
                                                    </button>
                                                </div>

                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                                                                    Modul & Menu Sidebar
                                                                </th>
                                                                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                                                    Lihat / Akses
                                                                </th>
                                                                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                                                    Tambah
                                                                </th>
                                                                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                                                    Ubah
                                                                </th>
                                                                <th className="px-3 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                                                                    Hapus
                                                                </th>
                                                                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Aksi Tambahan / Menu Khusus
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {section.modules.map((mod) => {
                                                                const findPerm = (action) =>
                                                                    mod.perms.find((p) => p.action === action);
                                                                const viewPerm = findPerm('view') || findPerm('register');
                                                                const createPerm = findPerm('create');
                                                                const editPerm = findPerm('edit');
                                                                const deletePerm = findPerm('delete');
                                                                const mainPermNames = new Set(
                                                                    [viewPerm, createPerm, editPerm, deletePerm]
                                                                        .filter(Boolean)
                                                                        .map((p) => p.name)
                                                                );
                                                                const otherPerms = mod.perms.filter(
                                                                    (p) => !mainPermNames.has(p.name)
                                                                );
                                                                const rowPermNames = mod.perms.map((p) => p.name);
                                                                const allRowSelected = rowPermNames.every((p) =>
                                                                    selectedPermissions.includes(p)
                                                                );

                                                                return (
                                                                    <tr
                                                                        key={mod.resource}
                                                                        className="hover:bg-gray-50 transition-colors"
                                                                    >
                                                                        <td className="px-4 py-3 text-sm">
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <div>
                                                                                    <div className="font-medium text-gray-900">
                                                                                        {mod.label}
                                                                                    </div>
                                                                                    {mod.menus.length > 0 && (
                                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                                            {mod.menus.map((m, idx) => {
                                                                                                const isMenuEnabled =
                                                                                                    selectedPermissions.includes(
                                                                                                        m.permissionName
                                                                                                    );
                                                                                                return (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        key={`${m.url}-${idx}`}
                                                                                                        onClick={() =>
                                                                                                            togglePermission(
                                                                                                                m.permissionName
                                                                                                            )
                                                                                                        }
                                                                                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                                                                                            isMenuEnabled
                                                                                                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                                                                                                : 'bg-gray-50 text-gray-400 border-gray-200 line-through hover:bg-gray-100'
                                                                                                        }`}
                                                                                                        title={`Klik untuk aktif/nonaktifkan menu sidebar "${m.title}" (${m.permissionName})`}
                                                                                                    >
                                                                                                        {isMenuEnabled ? (
                                                                                                            <CheckSquare size={10} />
                                                                                                        ) : (
                                                                                                            <Square size={10} />
                                                                                                        )}
                                                                                                        Menu: {m.title}
                                                                                                    </button>
                                                                                                );
                                                                                            })}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        toggleGroupPermissions(rowPermNames)
                                                                                    }
                                                                                    className="text-[11px] text-gray-400 hover:text-green-700 shrink-0"
                                                                                    title="Toggle semua izin baris ini"
                                                                                >
                                                                                    {allRowSelected ? 'Reset' : 'Semua'}
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-3 py-3 text-center">
                                                                            {renderCheckbox(viewPerm)}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-center">
                                                                            {renderCheckbox(createPerm)}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-center">
                                                                            {renderCheckbox(editPerm)}
                                                                        </td>
                                                                        <td className="px-3 py-3 text-center">
                                                                            {renderCheckbox(deletePerm)}
                                                                        </td>
                                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {otherPerms.map((p) => {
                                                                                    const isChecked =
                                                                                        selectedPermissions.includes(
                                                                                            p.name
                                                                                        );
                                                                                    const linkedMenus =
                                                                                        sidebarMeta.permToMenus[
                                                                                            p.name
                                                                                        ] || [];
                                                                                    const label =
                                                                                        ACTION_LABELS[p.action] ||
                                                                                        p.action.replace(/_/g, ' ');
                                                                                    return (
                                                                                        <button
                                                                                            type="button"
                                                                                            key={p.name}
                                                                                            onClick={() =>
                                                                                                togglePermission(
                                                                                                    p.name
                                                                                                )
                                                                                            }
                                                                                            title={
                                                                                                linkedMenus.length > 0
                                                                                                    ? `${p.name} — Membuka menu: ${linkedMenus
                                                                                                          .map((m) => m.title)
                                                                                                          .join(', ')}`
                                                                                                    : p.name
                                                                                            }
                                                                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer border transition-colors ${
                                                                                                isChecked
                                                                                                    ? 'bg-green-100 text-green-800 border-green-300'
                                                                                                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                                                            }`}
                                                                                        >
                                                                                            {isChecked ? (
                                                                                                <CheckSquare size={12} />
                                                                                            ) : (
                                                                                                <Square size={12} />
                                                                                            )}
                                                                                            {label}
                                                                                            {linkedMenus.length > 0 && (
                                                                                                <span className="ml-0.5 text-[10px] opacity-75">
                                                                                                    • Menu
                                                                                                </span>
                                                                                            )}
                                                                                        </button>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 shadow-sm"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
