import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/lib/store';

// Sử dụng NEXT_PUBLIC_API_URL từ .env.local hoặc giá trị mặc định
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Kiểm tra xem có đang ở client-side không
const isClient = typeof window !== 'undefined';

// Helper function to safely access token
const getToken = () => {
    if (isClient) {
        try {
            // Try to get token from cookies first
            const cookieToken = Cookies.get('access_token');
            if (cookieToken) return cookieToken;

            // Then try localStorage
            const localToken = localStorage.getItem('access_token');
            if (localToken) return localToken;

            // Finally try sessionStorage
            const sessionToken = sessionStorage.getItem('access_token');
            if (sessionToken) return sessionToken;

            return null;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }
    return null;
};

// Helper function to safely set tokens
export const setTokens = (accessToken: string, refreshToken: string) => {
    if (!accessToken || !refreshToken) {
        console.error('Invalid tokens provided:', { accessToken, refreshToken });
        return;
    }

    try {
        // Ensure tokens are strings
        const accessTokenStr = String(accessToken);
        const refreshTokenStr = String(refreshToken);

        // Set cookies with secure flags
        Cookies.set('access_token', accessTokenStr, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: 1 // 1 day
        });
        Cookies.set('refresh_token', refreshTokenStr, {
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: 7 // 7 days
        });

        // Store in localStorage and sessionStorage if available
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', accessTokenStr);
            localStorage.setItem('refresh_token', refreshTokenStr);
            sessionStorage.setItem('access_token', accessTokenStr);
            sessionStorage.setItem('refresh_token', refreshTokenStr);
        }

        // Update auth store
        useAuthStore.getState().setToken(accessTokenStr);
    } catch (error) {
        console.error('Error setting tokens:', error);
        // Log the actual token values for debugging
        console.log('Token values:', {
            accessToken: typeof accessToken,
            refreshToken: typeof refreshToken
        });
    }
};

// Helper function to safely remove tokens
export const removeTokens = () => {
    // Remove from cookies
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });

    // Remove from localStorage and sessionStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
    }

    // Update auth store
    useAuthStore.getState().logout();
};

// Check authentication status
export const isAuthenticated = () => {
    if (isClient) {
        try {
            const token = Cookies.get('access_token');
            return !!token;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    }
    return false;
};

export const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    // Tắt withCredentials để tránh vấn đề CORS
    withCredentials: false,
});

// Add auth token interceptor
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        console.log('API Request - URL:', config.url);
        console.log('API Request - Method:', config.method);
        console.log('API Request - Token:', token);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('API Request - Authorization header added');
        } else {
            console.log('API Request - No token found');
        }

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add refresh token interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh token yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Get refresh token from cookies
                const refreshToken = getToken();
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh token endpoint
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
                    { refreshToken }
                );

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update tokens in storage
                setTokens(accessToken, newRefreshToken);
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', newRefreshToken);
                sessionStorage.setItem('accessToken', accessToken);
                sessionStorage.setItem('refreshToken', newRefreshToken);

                // Update Authorization header
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh token fails, clear all tokens and redirect to login
                removeTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    login: async (data: { email: string; password: string }) => {
        try {
            console.log('Attempting login with:', { email: data.email });
            const response = await api.post('/api/v1/auth/login', data);
            console.log('Raw login response:', response);
            console.log('Login response data:', response.data);

            // Kiểm tra response.data có tồn tại không
            if (!response.data) {
                console.error('Empty response data');
                throw new Error('Empty response data');
            }

            // Kiểm tra cấu trúc response
            const responseData = response.data;
            console.log('Response data structure:', responseData);

            // Lấy tokens và user từ response
            // Thử các cấu trúc response có thể có
            const access_token = responseData.access_token || responseData.data?.access_token;
            const refresh_token = responseData.refresh_token || responseData.data?.refresh_token;
            const user = responseData.user || responseData.data?.user;

            console.log('Extracted data:', {
                access_token: !!access_token,
                refresh_token: !!refresh_token,
                user: !!user
            });

            if (access_token && refresh_token) {
                setTokens(access_token, refresh_token);
                // Lưu thông tin user vào store nếu có
                if (user) {
                    useAuthStore.getState().setUser(user);
                }
                useAuthStore.getState().setToken(access_token);
                console.log('Login successful, tokens saved');
            } else {
                console.error('Missing tokens in response:', {
                    hasAccessToken: !!access_token,
                    hasRefreshToken: !!refresh_token,
                    responseData
                });
                throw new Error('Missing tokens in response');
            }
            return response;
        } catch (error: any) {
            console.error('Login error:', error);
            // Log thêm thông tin về error nếu có
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw error;
        }
    },
    refreshToken: async (data: { refreshToken: string }) => {
        try {
            const response = await api.post('/api/v1/auth/refresh', data);
            if (response.data.access_token && response.data.refresh_token) {
                setTokens(response.data.access_token, response.data.refresh_token);
                // Cập nhật token trong store
                useAuthStore.getState().setToken(response.data.access_token);
                console.log('Token refresh successful');
            }
            return response;
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    },
    getProfile: () => api.get('/api/v1/auth/profile'),
    logout: () => {
        removeTokens();
        // Xóa thông tin user khỏi store
        useAuthStore.getState().logout();
        if (isClient) {
            window.location.href = '/login';
        }
    }
};

// Users APIs
export const usersAPI = {
    getAll: async () => {
        try {
            console.log('Calling users API...');
            const token = getToken();
            console.log('Current token:', token ? 'Present' : 'Missing');

            const response = await api.get('/api/v1/users');
            console.log('Users API raw response:', response);
            console.log('Users API response data:', response.data);

            // Ensure we have the correct data structure
            if (!response.data?.data) {
                console.log('Response missing data property, adding it');
                return { data: { data: response.data || [] } };
            }

            return response;
        } catch (error: any) {
            console.error('Users API error:', error);
            // If the error is a permission error (403), return empty data
            if (error.response?.status === 403) {
                console.log('Permission denied for users API, returning empty data');
                return { data: { data: [] } };
            }
            // For other errors, rethrow them
            throw error;
        }
    },
    getOne: (id: string) => api.get(`/api/v1/users/${id}`),
    create: (data: any) => api.post('/api/v1/users', data),
    update: (id: string, data: any) => {
        console.log('Updating user with ID:', id);
        console.log('Update data:', data);
        return api.patch(`/api/v1/users/${id}`, data)
            .then(response => {
                console.log('Update successful:', response.data);
                return response;
            });
    },
    delete: (id: string) => api.delete(`/api/v1/users/${id}`),
};

// Fine-tune APIs
export const fineTuneAPI = {
    getAll: async (params?: { page?: number; limit?: number }) => {
        try {
            console.log('Fetching fine-tunes with params:', params);
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const url = `/api/v1/fine-tune${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            console.log('Fine-tunes API URL:', url);

            const response = await api.get(url);
            console.log('Fine-tunes API response:', response);
            return response;
        } catch (error: any) {
            console.error('Fine-tunes API error:', error);
            if (error.response) {
                console.error('Error response:', {
                    status: error.response.status,
                    data: error.response.data,
                    headers: error.response.headers
                });
            }
            if (error.response?.status === 500) {
                return { data: { data: [], total: 0 } };
            }
            throw error;
        }
    },
    search: async (keyword: string, params?: { page?: number; limit?: number }) => {
        try {
            console.log('Searching fine-tunes with keyword:', keyword);
            const queryParams = new URLSearchParams();
            queryParams.append('keyword', keyword);
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());

            const url = `/api/v1/fine-tune/search?${queryParams.toString()}`;
            console.log('Fine-tunes search URL:', url);

            const response = await api.get(url);
            console.log('Fine-tunes search response:', response);
            return response;
        } catch (error) {
            console.error('Fine-tunes search error:', error);
            throw error;
        }
    },
    getOne: (id: string) => api.get(`/api/v1/fine-tune/${id}`),
    create: (data: any) => api.post('/api/v1/fine-tune', data),
    update: (id: string, data: any) => api.patch(`/api/v1/fine-tune/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/fine-tune/${id}`),
    updateIsChecked: (id: string, isChecked: boolean) =>
        api.patch(`/api/v1/fine-tune/${id}/check`, { isChecked }),
};

export default api; 