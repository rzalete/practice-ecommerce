import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        if (error.response?.status === 403) {
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api;