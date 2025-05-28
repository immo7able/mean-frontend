export default function ChatList({ chats, onSelect, activeChatId }) {
    return (
        <div>
            {chats.map((chat) => (
                <div
                    key={chat._id}
                    onClick={() => onSelect(chat._id)}
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${
                        chat._id === activeChatId ? 'bg-gray-200' : ''
                    }`}
                >
                    {chat.otherUser.username || 'Без названия'}
                </div>
            ))}
        </div>
    );
}
