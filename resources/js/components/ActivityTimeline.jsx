import React from 'react';
import { 
    CheckCircle, XCircle, AlertCircle, Clock, 
    MessageSquare, Upload, UserCheck 
} from 'lucide-react';

const ACTION_CONFIG = {
    created: {
        label: 'Pendaftaran Dibuat',
        icon: UserCheck,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300'
    },
    approved: {
        label: 'Disetujui',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-300'
    },
    rejected: {
        label: 'Ditolak',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-300'
    },
    needs_revision: {
        label: 'Perlu Revisi',
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        borderColor: 'border-orange-300'
    },
    comment: {
        label: 'Catatan Ditambahkan',
        icon: MessageSquare,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-300'
    },
    document_uploaded: {
        label: 'Dokumen Diupload',
        icon: Upload,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-300'
    }
};

export default function ActivityTimeline({ logs }) {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-2 opacity-50" />
                <p>Belum ada aktivitas</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit yang lalu`;
        if (diffHours < 24) return `${diffHours} jam yang lalu`;
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        return formatDate(dateString);
    };

    return (
        <div className="space-y-4">
            {logs.map((log, index) => {
                const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.comment;
                const Icon = config.icon;
                const isLast = index === logs.length - 1;

                return (
                    <div key={log.id} className="relative">
                        {/* Timeline Line */}
                        {!isLast && (
                            <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200" />
                        )}

                        {/* Timeline Item */}
                        <div className="flex space-x-3">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center border-2 ${config.borderColor} relative z-10`}>
                                <Icon className={config.color} size={20} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{config.label}</h4>
                                        <p className="text-sm text-gray-600">
                                            oleh <span className="font-medium">{log.creator?.name || 'System'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500" title={formatDate(log.created_at)}>
                                            {getRelativeTime(log.created_at)}
                                        </p>
                                    </div>
                                </div>

                                {/* Status Change */}
                                {log.old_status && log.new_status && (
                                    <div className="mb-2 flex items-center space-x-2 text-sm">
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                            {log.old_status}
                                        </span>
                                        <span className="text-gray-400">→</span>
                                        <span className={`px-2 py-1 rounded ${config.bgColor} ${config.color}`}>
                                            {log.new_status}
                                        </span>
                                    </div>
                                )}

                                {/* Note */}
                                {log.note && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-gray-300">
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{log.note}</p>
                                    </div>
                                )}

                                {/* Metadata */}
                                {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        {log.metadata.uploaded_documents && (
                                            <p>Dokumen: {log.metadata.uploaded_documents.join(', ')}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
