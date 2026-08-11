import { baseApi } from './baseApi';

export const masterDataApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // ============ Fiscal Years ============
        getFiscalYears: builder.query({
            query: () => '/fiscal-years',
            providesTags: ['FiscalYears'],
            keepUnusedDataFor: 600, // 10 minutes
        }),

        getActiveFiscalYear: builder.query({
            query: () => '/fiscal-years/active',
            providesTags: ['FiscalYears'],
            keepUnusedDataFor: 600,
        }),

        // ============ Faculties ============
        getFaculties: builder.query({
            query: () => '/faculties',
            providesTags: ['Faculties'],
            keepUnusedDataFor: 600, // Rarely changes
        }),

        // ============ Study Programs ============
        getStudyPrograms: builder.query({
            query: () => '/study-programs',
            providesTags: ['StudyPrograms'],
            keepUnusedDataFor: 600,
        }),

        // ============ Users ============
        getUsersByRole: builder.query({
            query: (params) => ({
                url: '/users',
                params: typeof params === 'string' ? { role: params } : params,
            }),
            providesTags: (result, error, params) => [{ type: 'Users', id: typeof params === 'string' ? params : JSON.stringify(params) }],
            keepUnusedDataFor: 300, // 5 minutes
        }),
    }),
});

export const {
    useGetFiscalYearsQuery,
    useGetActiveFiscalYearQuery,
    useGetFacultiesQuery,
    useGetStudyProgramsQuery,
    useGetUsersByRoleQuery,
} = masterDataApi;
