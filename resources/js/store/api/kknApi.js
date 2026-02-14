import { baseApi } from './baseApi';

export const kknApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ============ Registrations ============
        getRegistrations: builder.query({
            query: (params = {}) => ({
                url: '/admin/kkn-registrations',
                params,
            }),
            providesTags: ['Registrations'],
            keepUnusedDataFor: 300, // 5 minutes
        }),

        getRegistrationById: builder.query({
            query: (id) => `/admin/kkn-registrations/${id}`,
            providesTags: (result, error, id) => [{ type: 'Registration', id }],
        }),

        getStatistics: builder.query({
            query: (params = {}) => ({
                url: '/admin/kkn-registrations/statistics',
                params,
            }),
            providesTags: ['Statistics'],
            keepUnusedDataFor: 60, // 1 minute
        }),

        createRegistration: builder.mutation({
            query: (formData) => ({
                url: '/kkn-registrations',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'Registrations', id: 'LIST' }, 'Statistics'],
        }),

        approveRegistration: builder.mutation({
            query: ({ id, note }) => ({
                url: `/admin/kkn-registrations/${id}/approve`,
                method: 'POST',
                body: { note },
            }),
            // Optimistic update
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    kknApi.util.updateQueryData('getRegistrationById', id, (draft) => {
                        draft.status = 'approved';
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Registration', id },
                { type: 'Registrations', id: 'LIST' },
                'Statistics',
            ],
        }),

        rejectRegistration: builder.mutation({
            query: ({ id, note }) => ({
                url: `/admin/kkn-registrations/${id}/reject`,
                method: 'POST',
                body: { note },
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    kknApi.util.updateQueryData('getRegistrationById', id, (draft) => {
                        draft.status = 'rejected';
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Registration', id },
                { type: 'Registrations', id: 'LIST' },
                'Statistics',
            ],
        }),

        requestRevision: builder.mutation({
            query: ({ id, note }) => ({
                url: `/admin/kkn-registrations/${id}/revise`,
                method: 'POST',
                body: { note },
            }),
            async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
                const patchResult = dispatch(
                    kknApi.util.updateQueryData('getRegistrationById', id, (draft) => {
                        draft.status = 'revision';
                    })
                );
                try {
                    await queryFulfilled;
                } catch {
                    patchResult.undo();
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Registration', id },
                { type: 'Registrations', id: 'LIST' },
                'Statistics',
            ],
        }),

        addNote: builder.mutation({
            query: ({ id, note }) => ({
                url: `/admin/kkn-registrations/${id}/note`,
                method: 'POST',
                body: { note },
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Registration', id }],
        }),

        // ============ Document Templates ============
        getDocumentTemplates: builder.query({
            query: (params = {}) => ({
                url: '/kkn-document-templates',
                params,
            }),
            providesTags: ['DocumentTemplates'],
            keepUnusedDataFor: 600, // 10 minutes (rarely changes)
        }),

        getAdminDocumentTemplates: builder.query({
            query: (params = {}) => ({
                url: '/admin/kkn-document-templates',
                params,
            }),
            providesTags: ['DocumentTemplates'],
        }),

        createDocumentTemplate: builder.mutation({
            query: (data) => ({
                url: '/admin/kkn-document-templates',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['DocumentTemplates'],
        }),

        updateDocumentTemplate: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/admin/kkn-document-templates/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['DocumentTemplates'],
        }),

        deleteDocumentTemplate: builder.mutation({
            query: (id) => ({
                url: `/admin/kkn-document-templates/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['DocumentTemplates'],
        }),

        reorderDocumentTemplates: builder.mutation({
            query: (templates) => ({
                url: '/admin/kkn-document-templates/reorder',
                method: 'POST',
                body: { templates },
            }),
            invalidatesTags: ['DocumentTemplates'],
        }),

        // ============ KKN Locations ============
        getKknLocations: builder.query({
            query: (params = {}) => ({
                url: '/kkn-locations',
                params,
            }),
            providesTags: ['KknLocations'],
            keepUnusedDataFor: 300,
        }),

        createKknLocation: builder.mutation({
            query: (data) => ({
                url: '/kkn-locations',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'KknLocations', id: 'LIST' }],
        }),

        updateKknLocation: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/kkn-locations/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'KknLocation', id },
                { type: 'KknLocations', id: 'LIST' },
            ],
        }),

        deleteKknLocation: builder.mutation({
            query: (id) => ({
                url: `/kkn-locations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'KknLocations', id: 'LIST' }],
        }),

        importKknLocations: builder.mutation({
            query: (formData) => ({
                url: '/kkn-locations/import',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'KknLocations', id: 'LIST' }],
        }),

        downloadKknLocationTemplate: builder.mutation({
            query: () => ({
                url: '/kkn-locations/template',
                method: 'GET',
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'locations_template.xlsx');
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    return { success: true };
                },
            }),
        }),

        // ============ Postos ============
        getPostos: builder.query({
            query: (params = {}) => ({
                url: '/kkn/postos',
                params,
            }),
            providesTags: ['Postos'],
        }),

        getPostoById: builder.query({
            query: (id) => `/kkn/postos/${id}`,
            providesTags: (result, error, id) => [{ type: 'Postos', id }],
        }),

        deletePosto: builder.mutation({
            query: (id) => ({
                url: `/kkn-postos/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Postos', id: 'LIST' }],
        }),

        createPosto: builder.mutation({
            query: (data) => ({
                url: '/kkn/postos',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'Postos', id: 'LIST' }],
        }),

        updatePosto: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/kkn/postos/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Postos', id: 'LIST' },
                { type: 'Postos', id },
            ],
        }),

        removePostoMember: builder.mutation({
            query: ({ postoId, memberId }) => ({
                url: `/kkn/postos/${postoId}/members/${memberId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { postoId }) => [
                { type: 'Postos', id: postoId },
            ],
        }),

        updatePostoStatus: builder.mutation({
            query: ({ id, status }) => ({
                url: `/kkn/postos/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Postos', id },
                { type: 'Postos', id: 'LIST' },
            ],
        }),

        importPostos: builder.mutation({
            query: (formData) => ({
                url: '/kkn/postos/import',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: [{ type: 'Postos', id: 'LIST' }],
        }),

        downloadPostoTemplate: builder.mutation({
            query: () => ({
                url: '/kkn/postos/template',
                method: 'GET',
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    window.URL.revokeObjectURL(url);
                    return { success: true };
                },
            }),
        }),

        getAvailableStudents: builder.query({
            query: (params = {}) => ({
                url: '/kkn/postos/available-students',
                params,
            }),
            providesTags: ['AvailableStudents'],
        }),

        addPostoMember: builder.mutation({
            query: ({ postoId, student_id, position }) => ({
                url: `/kkn/postos/${postoId}/members`,
                method: 'POST',
                body: { student_id, position },
            }),
            invalidatesTags: (result, error, { postoId }) => [
                { type: 'Postos', id: postoId },
                'AvailableStudents',
            ],
        }),

        // ============ KKN Periods & Waves ============
        getKknPeriods: builder.query({
            query: (params = {}) => ({
                url: '/kkn-periods',
                params,
            }),
            providesTags: ['KknPeriods'],
        }),

        getKknPeriodById: builder.query({
            query: (id) => `/kkn-periods/${id}`,
            providesTags: (result, error, id) => [{ type: 'KknPeriod', id }],
        }),

        createKknPeriod: builder.mutation({
            query: (data) => ({
                url: '/kkn-periods',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['KknPeriods'],
        }),

        updateKknPeriod: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/kkn-periods/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                'KknPeriods',
                { type: 'KknPeriod', id }
            ],
        }),

        deleteKknPeriod: builder.mutation({
            query: (id) => ({
                url: `/kkn-periods/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['KknPeriods'],
        }),

        createRegistrationPeriod: builder.mutation({
            query: (data) => ({
                url: '/registration-periods',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { kkn_period_id }) => [
                'KknPeriods', 
                { type: 'KknPeriod', id: kkn_period_id }
            ],
        }),

        updateRegistrationPeriod: builder.mutation({
            query: ({ id, kkn_period_id, ...data }) => ({
                url: `/registration-periods/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { kkn_period_id }) => [
                'KknPeriods',
                { type: 'KknPeriod', id: kkn_period_id }
            ],
        }),

        deleteRegistrationPeriod: builder.mutation({
            query: (id) => ({
                url: `/registration-periods/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['KknPeriods'],
        }),

        // ============ Assessments/Grades ============
        getKknGrades: builder.query({
            query: (params = {}) => ({
                url: '/kkn-grades',
                params,
            }),
            providesTags: ['KknGrades'],
        }),

        saveKknGrade: builder.mutation({
            query: (data) => ({
                url: '/kkn-grades',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['KknGrades'],
        }),

        exportKknGrades: builder.mutation({
            query: (params = {}) => ({
                url: '/kkn-grades/export',
                params,
                responseHandler: async (response) => {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `Rekap_Nilai_KKN_${new Date().getTime()}.pdf`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    return { success: true };
                },
            }),
        }),
    }),
});

export const {
    // Registrations
    useGetRegistrationsQuery,
    useGetRegistrationByIdQuery,
    useGetStatisticsQuery,
    useCreateRegistrationMutation,
    useApproveRegistrationMutation,
    useRejectRegistrationMutation,
    useRequestRevisionMutation,
    useAddNoteMutation,
    
    // Document Templates
    useGetDocumentTemplatesQuery,
    useGetAdminDocumentTemplatesQuery,
    useCreateDocumentTemplateMutation,
    useUpdateDocumentTemplateMutation,
    useDeleteDocumentTemplateMutation,
    useReorderDocumentTemplatesMutation,
    
    // KKN Locations
    useGetKknLocationsQuery,
    useCreateKknLocationMutation,
    useUpdateKknLocationMutation,
    useDeleteKknLocationMutation,
    useImportKknLocationsMutation,
    useDownloadKknLocationTemplateMutation,
    
    // Postos
    useGetPostosQuery,
    useGetPostoByIdQuery,
    useCreatePostoMutation,
    useUpdatePostoMutation,
    useDeletePostoMutation,
    useRemovePostoMemberMutation,
    useUpdatePostoStatusMutation,
    useImportPostosMutation,
    useDownloadPostoTemplateMutation,
    useGetAvailableStudentsQuery,
    useAddPostoMemberMutation,
    
    // Assessments/Grades
    useGetKknGradesQuery,
    useSaveKknGradeMutation,
    useExportKknGradesMutation,

    // KKN Periods
    useGetKknPeriodsQuery,
    useGetKknPeriodByIdQuery,
    useCreateKknPeriodMutation,
    useUpdateKknPeriodMutation,
    useDeleteKknPeriodMutation,
    
    // Registration Periods (Waves)
    useCreateRegistrationPeriodMutation,
    useUpdateRegistrationPeriodMutation,
    useDeleteRegistrationPeriodMutation,
} = kknApi;
