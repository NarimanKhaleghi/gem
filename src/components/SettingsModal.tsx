import { useState } from 'react';
import { useAppStore } from '../store';
import { X, Key, Server, Cpu, Brain, Search, Code, Check } from 'lucide-react';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
    const { settings, setSettings, addApiKey, removeApiKey } = useAppStore();
    const [newKey, setNewKey] = useState("");

    const handleAddKey = () => {
        if (newKey.trim()) {
            addApiKey(newKey.trim());
            setNewKey("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1e1f20] border border-[#333537] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-[#333537]">
                    <h2 className="text-xl font-medium text-[#e3e3e3]">Settings</h2>
                    <button onClick={onClose} className="text-[#9aa0a6] hover:text-[#e3e3e3] p-2 rounded-full hover:bg-[#2d2f31] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* API Keys */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#e3e3e3] font-medium">
                            <Key size={18} className="text-blue-400" /> API Keys (Stored locally & encrypted)
                        </div>
                        <div className="space-y-2">
                            {settings.apiKeys.map((key, i) => (
                                <div key={i} className="flex flex-col gap-1 p-3 bg-[#131314] border border-[#333537] rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="radio" 
                                                name="activeKey" 
                                                checked={settings.currentKeyIndex === i}
                                                onChange={() => setSettings({ currentKeyIndex: i })}
                                                className="accent-blue-500 w-4 h-4"
                                            />
                                            <code className="text-sm text-[#9aa0a6]">
                                                {key.substring(0, 8)}...{key.substring(key.length - 4)}
                                            </code>
                                        </div>
                                        <button onClick={() => removeApiKey(i)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
                                    </div>
                                    {settings.currentKeyIndex === i && <span className="text-xs text-blue-400 ml-7">Active Key</span>}
                                </div>
                            ))}
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    placeholder="Enter Gemini API Key..." 
                                    className="flex-1 bg-[#131314] border border-[#333537] rounded-lg px-4 py-2 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8]"
                                    value={newKey}
                                    onChange={e => setNewKey(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddKey()}
                                />
                                <button onClick={handleAddKey} className="bg-[#2d2f31] hover:bg-[#37393b] text-[#e3e3e3] px-4 py-2 rounded-lg text-sm transition-colors">Add</button>
                            </div>
                        </div>
                    </div>

                    {/* Proxy */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#e3e3e3] font-medium">
                            <Server size={18} className="text-green-400" /> Proxy URL
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-[#131314] border border-[#333537] rounded-lg px-4 py-2 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8]"
                            value={settings.proxyUrl}
                            onChange={(e) => setSettings({ proxyUrl: e.target.value })}
                            placeholder="e.g. https://my-worker.workers.dev"
                        />
                        <p className="text-xs text-[#9aa0a6]">All requests are routed through this proxy. Default is local proxy.</p>
                    </div>

                    {/* Model Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#e3e3e3] font-medium">
                            <Cpu size={18} className="text-purple-400" /> Model Configuration
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs text-[#9aa0a6]">Model</label>
                                <select 
                                    className="w-full bg-[#131314] border border-[#333537] rounded-lg px-4 py-2 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8]"
                                    value={settings.model}
                                    onChange={e => setSettings({ model: e.target.value })}
                                >
                                    <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-[#9aa0a6]">Thinking Level</label>
                                <select 
                                    className="w-full bg-[#131314] border border-[#333537] rounded-lg px-4 py-2 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8]"
                                    value={settings.thinkingLevel}
                                    onChange={e => setSettings({ thinkingLevel: e.target.value as any })}
                                >
                                    <option value="none">Disabled</option>
                                    <option value="low">Minimal</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Capabilities */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#e3e3e3] font-medium">
                            <Brain size={18} className="text-yellow-400" /> Capabilities
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${settings.useGoogleSearch ? 'bg-blue-500 border-blue-500' : 'border-[#333537] bg-[#131314]'}`}>
                                    {settings.useGoogleSearch && <Check size={14} className="text-[#e3e3e3]" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={settings.useGoogleSearch} onChange={e => setSettings({ useGoogleSearch: e.target.checked })} />
                                <span className="text-sm text-[#e3e3e3] flex items-center gap-2"><Search size={14}/> Google Search Grounding</span>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${settings.useCodeExecution ? 'bg-blue-500 border-blue-500' : 'border-[#333537] bg-[#131314]'}`}>
                                    {settings.useCodeExecution && <Check size={14} className="text-[#e3e3e3]" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={settings.useCodeExecution} onChange={e => setSettings({ useCodeExecution: e.target.checked })} />
                                <span className="text-sm text-[#e3e3e3] flex items-center gap-2"><Code size={14}/> Code Execution</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
