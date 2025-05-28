import api from "@/services/api";

export const ChatService = {
    startChat: async (toUserId, adId) => {
        const res = await api.post(`/chat/start`, { toUserId, adId });
        return res.data;
    },

    getMyChats: async () => {
        const res = await api.get('/chat/my');
        return res.data;
    },

    getChatMessages: async (chatId) => {
        const res = await api.get(`/chat/${chatId}/messages`);
        return res.data;
    }
};
