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
    }),
});

export const {
    useGetFiscalYearsQuery,
    useGetActiveFiscalYearQuery,
    useGetFacultiesQuery,
    useGetStudyProgramsQuery,
} = masterDataApi;
