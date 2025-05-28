import api from './api'
import Cookies from 'js-cookie'
import { isTokenExpired } from './auth'

export const MotorcycleService = {
    getAll: async (query) => api.get(`/motorcycles${query ? `?${query}` : ''}`),

    getById: async (id) => api.get(`/motorcycles/${id}`),

    create: async (data) => {
        return api.post('/motorcycles', data)
    },

    update: async (id, data) => {
        return api.patch(`/motorcycles/${id}`, data)
    },

    delete: async (id) => {
        return api.delete(`/motorcycles/${id}`)
    },

    getUserMotorcycles: async () => {
        return api.get('/motorcycles/my')
    },

    toggleFavorite: async (id) => {
        return api.patch(`/motorcycles/${id}/favorite`)
    },
}
