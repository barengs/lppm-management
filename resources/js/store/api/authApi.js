import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),

        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
        }),

        me: builder.query({
            query: () => '/auth/me',
            providesTags: ['User'],
        }),

        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'POST',
            }),
        }),

        getProfile: builder.query({
            query: () => '/profile/me',
            providesTags: ['User'],
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useMeQuery,
    useLazyMeQuery,
    useRefreshMutation,
    useGetProfileQuery,
} = authApi;
