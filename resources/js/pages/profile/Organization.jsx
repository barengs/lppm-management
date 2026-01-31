import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tree, TreeNode } from 'react-organizational-chart';
import styled from '@emotion/styled';
import { Users, Mail, Phone, Building2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

// Styled components for organization chart
const StyledNode = styled.div`
    padding: 8px 10px;
    border-radius: 6px;
    display: inline-block;
    background: ${props => {
        if (props.level === 1) return 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)';
        if (props.level === 2) return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
        return 'linear-gradient(135deg, #64748b 0%, #475569 100%)';
    }};
    color: white;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
    transition: all 0.3s ease;
    min-width: 160px;
    max-width: 190px;

    &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
`;

const MemberCard = ({ member }) => {
    return (
        <StyledNode level={member.level}>
            <div className="flex items-start space-x-1.5">
                <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-base font-bold">
                        {member.user?.name?.charAt(0) || '?'}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold mb-0.5 truncate leading-tight">{member.user?.name || 'N/A'}</h3>
                    <p className="text-[10px] opacity-90 mb-0.5 line-clamp-2 leading-tight">{member.position}</p>
                    {member.user?.email && (
                        <div className="flex items-center text-[9px] opacity-80 mb-0.5">
                            <Mail size={8} className="mr-0.5 flex-shrink-0" />
                            <span className="truncate">{member.user.email}</span>
                        </div>
                    )}
                </div>
            </div>
        </StyledNode>
    );
};

const OrganizationNode = ({ member }) => {
    if (!member.children || member.children.length === 0) {
        return (
            <TreeNode label={<MemberCard member={member} />} />
        );
    }

    return (
        <TreeNode label={<MemberCard member={member} />}>
            {member.children.map(child => (
                <OrganizationNode key={child.id} member={child} />
            ))}
        </TreeNode>
    );
};

export default function OrganizationIndex() {
    const { token } = useAuthStore();
    const [organization, setOrganization] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrganization();
    }, []);

    const fetchOrganization = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/organization-members/public');
            
            // Build tree structure from flat data
            const buildTree = (items, parentId = null) => {
                return items
                    .filter(item => item.parent_id === parentId)
                    .sort((a, b) => a.order_index - b.order_index)
                    .map(item => ({
                        ...item,
                        children: buildTree(items, item.id)
                    }));
            };

            const tree = buildTree(response.data);
            setOrganization(tree[0]); // Root node (Ketua)
        } catch (error) {
            console.error('Failed to fetch organization', error);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat struktur organisasi...</p>
                </div>
            </div>
        );
    }

    if (!organization) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Struktur organisasi belum tersedia</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Users className="mr-2 text-green-700" />
                            Struktur Organisasi LPPM UIM
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Lembaga Penelitian dan Pengabdian kepada Masyarakat
                        </p>
                    </div>
                </div>
            </div>

            {/* Organization Chart */}
            <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
                <div className="min-w-max">
                    <Tree
                        lineWidth="2px"
                        lineColor="#cbd5e1"
                        lineBorderRadius="10px"
                        label={<MemberCard member={organization} />}
                    >
                        {organization.children && organization.children.map(child => (
                            <OrganizationNode key={child.id} member={child} />
                        ))}
                    </Tree>
                </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Keterangan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-green-800"></div>
                        <div>
                            <p className="font-medium">Level 1</p>
                            <p className="text-sm text-gray-600">Ketua LPPM</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800"></div>
                        <div>
                            <p className="font-medium">Level 2</p>
                            <p className="text-sm text-gray-600">Kepala Divisi & Koordinator</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-500 to-slate-700"></div>
                        <div>
                            <p className="font-medium">Level 3</p>
                            <p className="text-sm text-gray-600">Staff</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
