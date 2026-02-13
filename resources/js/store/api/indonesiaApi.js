import { baseApi } from './baseApi';

export const indonesiaApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getProvinces: builder.query({
            query: () => '/indonesia/provinces',
            providesTags: ['Provinces'],
        }),
        
        getCities: builder.query({
            query: (provinceId) => `/indonesia/cities?province_id=${provinceId}`,
            providesTags: (result, error, provinceId) => [
                { type: 'Cities', id: provinceId }
            ],
        }),
        
        getDistricts: builder.query({
            query: (cityId) => `/indonesia/districts?city_id=${cityId}`,
            providesTags: (result, error, cityId) => [
                { type: 'Districts', id: cityId }
            ],
        }),
        
        getVillages: builder.query({
            query: (districtId) => `/indonesia/villages?district_id=${districtId}`,
            providesTags: (result, error, districtId) => [
                { type: 'Villages', id: districtId }
            ],
        }),
    }),
});

export const {
    useGetProvincesQuery,
    useGetCitiesQuery,
    useGetDistrictsQuery,
    useGetVillagesQuery,
} = indonesiaApi;
