import api from './api'
import Cookies from "js-cookie";
import {jwtDecode} from 'jwt-decode';

export const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Date.now() / 1000;
    } catch {
        return true;
    }
};

export const AuthService = {

    register: async (userData) => {
        return api.post('/auth/register', userData)
    },
    login: async (credentials) => {
        return api.post('/auth/login', credentials)
    },
    getProfile: async () => {
        return api.get('/auth/profile');
    },
    logout: () => {
        Cookies.remove('accessToken')
        Cookies.remove('refreshToken')
    },
}
