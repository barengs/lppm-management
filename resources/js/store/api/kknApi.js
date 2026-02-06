import { baseApi } from './baseApi';

export const kknApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ============ Registrations ============
        getRegistrations: builder.query({
            query: (params = {}) => ({
                url: '/admin/kkn-registrations',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.data.map(({ id }) => ({ type: 'Registration', id })),
                          { type: 'Registrations', id: 'LIST' },
                      ]
                    : [{ type: 'Registrations', id: 'LIST' }],
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

        // ============ Postos ============
        getPostos: builder.query({
            query: (params = {}) => ({
                url: '/kkn-postos',
                params,
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.map(({ id }) => ({ type: 'Postos', id })),
                          { type: 'Postos', id: 'LIST' },
                      ]
                    : [{ type: 'Postos', id: 'LIST' }],
        }),

        getPostoById: builder.query({
            query: (id) => `/kkn-postos/${id}`,
            providesTags: (result, error, id) => [{ type: 'Postos', id }],
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
    
    // Postos
    useGetPostosQuery,
    useGetPostoByIdQuery,
} = kknApi;
