'use client';

import { useEffect, useState } from 'react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';
import { ChatService } from '@/services/chat';

export default function ChatLayout() {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    useEffect(() => {
        const loadChats = async () => {
            try {
                const res = await ChatService.getMyChats();
                setChats(res);
                if (res.length > 0) setActiveChatId(res[0]._id);
            } catch (err) {
                console.error('Ошибка загрузки чатов', err);
            }
        };
        loadChats();
    }, []);

    return (
        <div className="flex h-screen">
            <div className="w-1/3 border-r overflow-y-auto">
                <ChatList chats={chats} onSelect={setActiveChatId} activeChatId={activeChatId} />
            </div>
            <div className="flex-1 overflow-y-auto">
                {activeChatId && <ChatWindow chatId={activeChatId} />}
            </div>
        </div>
    );
}
