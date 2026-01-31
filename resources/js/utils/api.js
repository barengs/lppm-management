import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // List of public endpoints that should NOT trigger redirect to login
            const publicEndpoints = ['/faculties', '/study-programs'];
            const requestUrl = error.config?.url || '';
            
            // Check if the failed request is to a public endpoint
            const isPublicEndpoint = publicEndpoints.some(endpoint => 
                requestUrl.includes(endpoint)
            );
            
            // Only redirect to login if it's NOT a public endpoint
            if (!isPublicEndpoint) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
