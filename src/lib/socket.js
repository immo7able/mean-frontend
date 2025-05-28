import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL

let socket;

export const connectSocket = (token) => {
    if (!socket) {
        socket = io(API_URL, {
            auth: { token },
        });
    }
    return socket;
};

export const getSocket = () => socket;
