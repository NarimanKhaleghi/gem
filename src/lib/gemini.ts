import { GoogleGenAI } from '@google/genai';
import { useAppStore } from '../store';
import { Message } from '../types';

function buildConfig() {
    const { settings } = useAppStore.getState();
    const config: any = {
        temperature: settings.temperature,
        topP: settings.topP,
        topK: settings.topK,
        maxOutputTokens: settings.maxTokens
    };
    if (settings.thinkingLevel && settings.thinkingLevel !== 'none') {
        config.thinkingConfig = {
            thinkingLevel: settings.thinkingLevel === 'high' ? 'high' : 'minimal'
        };
    }
    return config;
}

function buildTools() {
    const { settings } = useAppStore.getState();
    const tools = [];
    if (settings.useGoogleSearch) {
        tools.push({ type: 'google_search' });
    }
    if (settings.useCodeExecution) {
        tools.push({ type: 'code_execution' });
    }
    return tools.length > 0 ? tools : undefined;
}

export async function sendMessageStream(
    chatContext: Message[], 
    newMessage: string, 
    files: { data: string, mimeType: string }[],
    interactionId: string | undefined,
    onChunk: (text: string) => void
): Promise<{ text: string, newInteractionId?: string }> {
    const { settings, setSettings } = useAppStore.getState();
    const tryKey = async (keyIndex: number): Promise<any> => {
        const key = settings.apiKeys[keyIndex];
        if (!key) throw new Error("No valid API Key found. Please add one in Settings.");

        const ai = new GoogleGenAI({
            apiKey: key,
            httpOptions: { baseUrl: settings.proxyUrl || window.location.origin + '/api/proxy' }
        });

        try {
            const inputParts: any[] = [];
            for (const file of files) {
                inputParts.push({ inlineData: { data: file.data, mimeType: file.mimeType } });
            }
            inputParts.push({ text: newMessage });

            const stream = await ai.interactions.create({
                model: settings.model,
                input: inputParts,
                previous_interaction_id: interactionId,
                tools: buildTools(),
                stream: true,
                generation_config: buildConfig(),
            });

            let fullText = '';
            let lastId = interactionId;
            for await (const event of stream) {
                if (event.event_type === "step.delta" && event.delta && event.delta.type === "text") {
                    fullText += event.delta.text;
                    onChunk(event.delta.text);
                }
                if ('interaction' in event && event.interaction && event.interaction.id) {
                    lastId = event.interaction.id;
                }
            }
            return { text: fullText, newInteractionId: lastId };
        } catch (e: any) {
            if (e.status === 429 && keyIndex + 1 < settings.apiKeys.length) {
                console.warn(`Key ${keyIndex} rate limited, switching to ${keyIndex + 1}`);
                setSettings({ currentKeyIndex: keyIndex + 1 });
                return tryKey(keyIndex + 1);
            }
            throw e;
        }
    };
    
    return tryKey(settings.currentKeyIndex);
}
