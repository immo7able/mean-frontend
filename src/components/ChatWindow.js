'use client';

import { useEffect, useState } from 'react';
import { ChatService } from '@/services/chat';
import { AuthService } from '@/services/auth';
import { connectSocket, getSocket } from '@/lib/socket';
import Cookies from "js-cookie";

export default function ChatWindow({ chatId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const setup = async () => {
            const userRes = await AuthService.getProfile();
            setUser(userRes.data);

            const msgRes = await ChatService.getChatMessages(chatId);
            setMessages(msgRes);

            const token = Cookies.get('accessToken');
            const socketInstance = connectSocket(token);
            setSocket(socketInstance);

            socketInstance.emit('joinChat', chatId);

            socketInstance.on('receiveMessage', (message) => {
                setMessages((prev) => {
                    const exists = prev.some((m) => m._id === message._id);
                    return exists ? prev : [...prev, message];
                });
            });

            socketInstance.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
            });
        };

        setup();

        return () => {
            getSocket()?.off('receiveMessage');
        };
    }, [chatId]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !socket) return;

        socket.emit('sendMessage', { chatId, text: newMessage });
        setNewMessage('');
    };

    return (
        <div className="p-4 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((msg) => (
                    <div key={msg._id} className="mb-2">
                        <span className="font-semibold">
                            {msg.senderId._id === user?._id ? 'Вы' : msg.senderId.username}:
                        </span>{' '}
                        {msg.text}
                    </div>
                ))}
            </div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    className="flex-1 border rounded px-2 py-1"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-500 text-white px-4 py-1 rounded"
                >
                    Отправить
                </button>
            </div>
        </div>
    );
}
