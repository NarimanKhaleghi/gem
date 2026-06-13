import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, UserSettings, DEFAULT_SETTINGS, Message } from '../types';

interface AppState {
    settings: UserSettings;
    setSettings: (settings: Partial<UserSettings>) => void;
    addApiKey: (key: string) => void;
    removeApiKey: (index: number) => void;

    chats: Chat[];
    currentChatId: string | null;
    setCurrentChat: (id: string | null) => void;
    addChat: (chat: Chat) => void;
    updateChat: (id: string, updates: Partial<Chat>) => void;
    deleteChat: (id: string) => void;
    addMessage: (chatId: string, message: Message) => void;
    appendMessageChunk: (chatId: string, messageId: string, chunk: string) => void;
    
    // For sync
    setChats: (chats: Chat[]) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            settings: DEFAULT_SETTINGS,
            setSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
            addApiKey: (key) => set((state) => ({ settings: { ...state.settings, apiKeys: [...state.settings.apiKeys, key] } })),
            removeApiKey: (index) => set((state) => {
                const keys = [...state.settings.apiKeys];
                keys.splice(index, 1);
                return { settings: { ...state.settings, apiKeys: keys, currentKeyIndex: 0 } };
            }),

            chats: [],
            currentChatId: null,
            setCurrentChat: (id) => set({ currentChatId: id }),
            addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats], currentChatId: chat.id })),
            updateChat: (id, updates) => set((state) => ({
                chats: state.chats.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c))
            })),
            deleteChat: (id) => set((state) => ({
                chats: state.chats.filter((c) => c.id !== id),
                currentChatId: state.currentChatId === id ? null : state.currentChatId
            })),
            addMessage: (chatId, message) => set((state) => ({
                chats: state.chats.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() } : c))
            })),
            appendMessageChunk: (chatId, messageId, chunk) => set((state) => ({
                chats: state.chats.map((c) => (c.id === chatId ? {
                    ...c,
                    messages: c.messages.map((m) => m.id === messageId ? { ...m, text: m.text + chunk } : m),
                    updatedAt: Date.now()
                } : c))
            })),
            setChats: (chats) => set({ chats })
        }),
        {
            name: 'gemini-pwa-storage',
            partialize: (state) => ({ settings: state.settings, chats: state.chats })
        }
    )
);
