import api from './api';

export const AdminService = {
    getAllBrands: async () => {
        const res = await api.get('/admin/brands');
        return res.data;
    },

    createBrand: async (name) => {
        const res = await api.post('/admin/brands', { name });
        return res.data;
    },

    updateBrand: async (id, name) => {
        const res = await api.patch(`/admin/brands/${id}`, { name });
        return res.data;
    },

    deleteBrand: async (id) => {
        const res = await api.delete(`/admin/brands/${id}`);
        return res.data;
    },

    getAllModels: async () => {
        const res = await api.get('/admin/models');
        return res.data;
    },

    createModel: async (name, brandId) => {
        const res = await api.post('/admin/models', { name, brand: brandId });
        return res.data;
    },

    updateModel: async (id, name, brandId) => {
        const res = await api.patch(`/admin/models/${id}`, { name, brand: brandId });
        return res.data;
    },

    deleteModel: async (id) => {
        const res = await api.delete(`/admin/models/${id}`);
        return res.data;
    },

    getModelsByBrand: async (brandId) => {
        const res = await api.get(`/admin/brands/${brandId}/models`);
        return res.data;
    }
};
