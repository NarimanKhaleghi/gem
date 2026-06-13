export interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    isError?: boolean;
    files?: {
        name: string;
        mimeType: string;
        data: string; // base64
    }[];
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    updatedAt: number;
    createdAt: number;
    interactionId?: string;
}

export interface UserSettings {
    proxyUrl: string;
    apiKeys: string[];
    currentKeyIndex: number;
    model: string;
    thinkingLevel: 'none' | 'low' | 'high';
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    useGoogleSearch: boolean;
    useCodeExecution: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
    proxyUrl: '/api/proxy',
    apiKeys: [],
    currentKeyIndex: 0,
    model: 'gemini-3.5-flash',
    thinkingLevel: 'none',
    temperature: 0.7,
    maxTokens: 8192,
    topP: 0.95,
    topK: 40,
    useGoogleSearch: true,
    useCodeExecution: false,
};
