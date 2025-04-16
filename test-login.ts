import { authAPI } from './lib/api';

async function testLogin() {
    try {
        // Đăng nhập
        const response = await authAPI.login({
            email: 'vht2@gmail.com',
            password: 't12345678'
        });
        console.log('Login successful:', response.data);

        // Kiểm tra token đã được lưu
        const access_token = localStorage.getItem('access_token');
        const refresh_token = localStorage.getItem('refresh_token');
        console.log('Stored tokens:', { access_token, refresh_token });

        // Thử lấy thông tin profile
        const profileResponse = await authAPI.getProfile();
        console.log('Profile:', profileResponse.data);
    } catch (error: any) {
        console.error('Login failed:', error.response?.data || error.message);
    }
}

testLogin(); 