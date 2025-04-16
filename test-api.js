import axios from 'axios';

// API base URL
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Test token - replace with your actual token
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InZodDJAZ21haWwuY29tIiwic3ViIjoiYzVkYmQ5ODQtNTJlNi00MmI5LWJlODItOTA5ZTllZDYzZjRkIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzQ0ODE1MzY1LCJleHAiOjE3NDQ4MTg5NjV9.UftuQ3lleiYdlmxU-vkGrbl5l8u_RdyaNxSjvE866o4';

// Create axios instance
const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
    },
});

// Test function
async function testAPI() {
    try {
        // Test profile update
        console.log('Testing profile update...');
        const profileData = {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phoneNumber: '+84123456789'
        };

        console.log('Sending profile update request with data:', profileData);
        const response = await api.patch('/api/v1/users/profile', profileData);
        console.log('Profile update response:', response.data);

        // Test user creation
        console.log('\nTesting user creation...');
        const userData = {
            firstName: 'New',
            lastName: 'User',
            email: 'newuser@example.com',
            phoneNumber: '+84987654321',
            password: 'password123',
            role: 'USER',
            status: 'ACTIVE'
        };

        console.log('Sending user creation request with data:', userData);
        const createResponse = await api.post('/api/v1/users', userData);
        console.log('User creation response:', createResponse.data);

    } catch (error) {
        console.error('Test failed:', error);
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
            console.error('Error headers:', error.response.headers);
        } else {
            console.error('Error message:', error.message);
        }
    }
}

// Run the test
testAPI(); 