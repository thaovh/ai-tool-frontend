import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    }
});

async function testAPI() {
    try {
        // Đăng nhập
        const loginResponse = await api.post('/api/v1/auth/login', {
            email: 'vht2@gmail.com',
            password: 't12345678'
        });
        console.log('Login successful:', loginResponse.data);

        // Lưu token
        const access_token = loginResponse.data.access_token;

        // Thử lấy thông tin profile với token
        const profileResponse = await api.get('/api/v1/auth/profile', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        console.log('Profile:', profileResponse.data);

        // Thử lấy danh sách users với token
        const usersResponse = await api.get('/api/v1/users', {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        console.log('Users:', usersResponse.data);
    } catch (error: any) {
        console.error('API Error:', error.response?.data || error.message);
    }
}

testAPI(); 