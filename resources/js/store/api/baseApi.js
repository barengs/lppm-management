import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query with token injection
const baseQuery = fetchBaseQuery({
    baseUrl: '/api', // Fixed: baseUrl not baseURL
    credentials: 'include', // Include cookies for session-based auth
    prepareHeaders: (headers, { getState }) => {
        // Get token from Redux state (more reliable than localStorage)
        const token = getState().auth?.token || localStorage.getItem('token');
        

        
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        headers.set('Accept', 'application/json');
        headers.set('Content-Type', 'application/json');
        return headers;
    },
});

// Base query with error handling
const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    
    if (result.error && result.error.status === 401) {
        // Token expired, logout user
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
    
    return result;
};

// Create base API
export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,
    tagTypes: [
        'Registrations',
        'Registration',
        'Statistics',
        'DocumentTemplates',
        'FiscalYears',
        'Faculties',
        'StudyPrograms',
        'KknLocations',
        'Postos',
        'User'
    ],
    endpoints: () => ({}),
});
