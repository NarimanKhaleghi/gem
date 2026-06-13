import { Plus, Settings, MessageSquare, Trash2, LogIn, LogOut } from 'lucide-react';
import { useAppStore } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { loginWithGoogle, logout } from '../lib/firebase';
import clsx from 'clsx';

export default function Sidebar({ onOpenSettings, user }: { onOpenSettings: () => void, user: any }) {
    const { chats, currentChatId, setCurrentChat, addChat, deleteChat } = useAppStore();

    const handleNewChat = () => {
        addChat({
            id: uuidv4(),
            title: 'New Chat',
            messages: [],
            updatedAt: Date.now(),
            createdAt: Date.now()
        });
    };

    return (
        <div className="w-[280px] bg-[#1e1f20] flex flex-col border-r border-[#333537] transition-all">
            <div className="p-4">
                <button 
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-3 bg-[#2a2b2d] hover:bg-[#37393b] text-white rounded-full py-3 px-4 font-medium transition-colors text-sm"
                >
                    <Plus size={18} />
                    New Chat
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-2 space-y-1">
                {chats.map(chat => (
                    <div 
                        key={chat.id}
                        onClick={() => setCurrentChat(chat.id)}
                        className={clsx(
                            "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-sm",
                            currentChatId === chat.id ? "bg-[#2d2f31] text-[#e3e3e3]" : "text-[#9aa0a6] hover:bg-[#2d2f31] hover:text-[#e3e3e3]"
                        )}
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <MessageSquare size={16} className="shrink-0" />
                            <span className="truncate text-sm">{chat.title}</span>
                        </div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); deleteChat(chat.id); }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-[#333537] space-y-2">
                <button 
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 p-3 text-[#9aa0a6] hover:bg-[#2d2f31] hover:text-[#e3e3e3] rounded-lg transition-colors text-sm"
                >
                    <Settings size={18} />
                    Settings
                </button>
                {user ? (
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 p-3 text-[#9aa0a6] hover:bg-[#2d2f31] hover:text-[#e3e3e3] rounded-lg transition-colors text-sm"
                    >
                        <LogOut size={18} />
                        {user.displayName} (Logout)
                    </button>
                ) : (
                    <button 
                        onClick={loginWithGoogle}
                        className="w-full flex items-center gap-3 p-3 text-[#9aa0a6] hover:bg-[#2d2f31] hover:text-[#e3e3e3] rounded-lg transition-colors text-sm"
                    >
                        <LogIn size={18} />
                        Login to Sync
                    </button>
                )}
            </div>
        </div>
    );
}
