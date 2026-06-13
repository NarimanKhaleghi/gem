import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store';
import { Send, Bot, User, Paperclip } from 'lucide-react';
import { sendMessageStream } from '../lib/gemini';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ChatArea() {
    const { chats, currentChatId, addMessage, appendMessageChunk, updateChat } = useAppStore();
    const chat = chats.find(c => c.id === currentChatId);
    
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    if (!chat) {
        return (
            <div className="flex-1 flex items-center justify-center text-neutral-500 flex-col gap-4">
                <Bot size={48} className="opacity-20" />
                <p>Select a chat or start a new one</p>
            </div>
        );
    }

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsgText = inputValue;
        setInputValue('');
        
        const userMsg = { id: uuidv4(), role: 'user' as const, text: userMsgText, timestamp: Date.now() };
        addMessage(chat.id, userMsg);

        const modelMsgId = uuidv4();
        addMessage(chat.id, { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() });
        
        setIsLoading(true);
        try {
            const result = await sendMessageStream(
                chat.messages, 
                userMsgText, 
                [], // files
                chat.interactionId,
                (chunk) => {
                    appendMessageChunk(chat.id, modelMsgId, chunk);
                }
            );
            if (result.newInteractionId) {
                updateChat(chat.id, { interactionId: result.newInteractionId });
            }
        } catch (e: any) {
            appendMessageChunk(chat.id, modelMsgId, `\n\n**Error:** ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-transparent">
            <div className="h-16 border-b border-[#333537] flex justify-between items-center px-8 bg-[#131314]/80 backdrop-blur-md sticky top-0 z-10">
               <h1 className="text-xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-red-400">{chat.title}</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {chat.messages.length === 0 && (
                    <div className="h-full flex items-center justify-center text-center">
                        <div className="max-w-2xl w-full text-center space-y-4">
                            <h2 className="text-5xl font-semibold mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-red-400 text-transparent bg-clip-text">How can I help you today?</h2>
                            <p className="text-[#9aa0a6]">This connects directly to Gemini via your secure proxy.</p>
                        </div>
                    </div>
                )}
                
                {chat.messages.map(msg => (
                    <div key={msg.id} className={`flex gap-4 max-w-4xl mx-auto w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        <div className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-neutral-800">
                                {msg.role === 'user' ? <User size={16} className="text-blue-400" /> : <Bot size={16} className="text-purple-400" />}
                            </div>
                            <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : ''}`}>
                                <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#1e1f20] border border-[#333537] text-[#e3e3e3]' : 'bg-transparent text-[#e3e3e3] prose prose-invert mx-max-none'}`}>
                                    {msg.role === 'user' ? (
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    ) : (
                                        <div className="markdown-body text-sm leading-relaxed">
                                            <ReactMarkdown
                                                components={{
                                                    code: ({node, className, children, ...props}) => {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        return match ? (
                                                            <SyntaxHighlighter
                                                                style={vscDarkPlus as any}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                className="rounded-xl !bg-neutral-950 !my-4"
                                                                {...props as any}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-blue-300 font-mono text-xs" {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>
            
            <div className="px-8 pb-8 pt-4">
                <div className="max-w-4xl mx-auto relative bg-[#1e1f20] rounded-[32px] border border-[#333537] p-2 focus-within:ring-1 ring-[#8ab4f8] transition-shadow">
                    <textarea 
                        className="w-full bg-transparent resize-none outline-none p-4 pb-12 text-base text-[#e3e3e3] placeholder-[#9aa0a6]"
                        rows={3}
                        placeholder="Enter a prompt here..."
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center px-4">
                        <button className="p-2 text-[#9aa0a6] hover:text-[#e3e3e3] hover:bg-[#333537] rounded-full transition">
                            <Paperclip size={24} />
                        </button>
                        <button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className={`p-2 rounded-full transition-colors ${!inputValue.trim() || isLoading ? 'text-[#9aa0a6] opacity-50 bg-[#131314]' : 'text-blue-400 bg-[#131314]'}`}
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
