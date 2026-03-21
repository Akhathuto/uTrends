import React, { useState, useEffect, useRef } from 'react';
import Spinner from '../components/Spinner';
import { NoloIcon, SendIcon, CheckCircleIcon, CopyIcon, MicIcon, PaperclipIcon } from '../components/Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChatMessage, Tab } from '../types';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import AIAgents from '../components/AIAgents';
import { createChat } from '../services/geminiService';
import { Chat } from '@google/genai';

interface NoloAIProps {
    initialTab?: 'chat' | 'agents';
    setActiveTab?: (tab: Tab) => void;
}

const NoloChat: React.FC<{ onVoiceClick?: () => void }> = ({ onVoiceClick }) => {
    const [history, setHistory] = useLocalStorage<ChatMessage[]>('nolo-chat-history', []);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const { copied: conversationCopied, copy: copyConversation } = useCopyToClipboard(
        history.map(m => `${m.role === 'user' ? 'You' : 'Nolo'}: ${m.content}`).join('\n\n')
    );


    useEffect(() => {
        const chatInstance = createChat("You are Nolo, a friendly and helpful AI assistant for content creators. Provide concise, actionable advice.");
        setChat(chatInstance);
    }, []);
    
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [history]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading || !chat) return;

        const userMessage: ChatMessage = { 
            id: crypto.randomUUID(),
            role: 'user', 
            content: message,
            timestamp: new Date().toISOString()
        };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);
        setError('');

        try {
            let fullResponse = '';
            const result = await chat.sendMessageStream({ message });
            
            for await (const chunk of result) {
                fullResponse += chunk.text;
                const modelMessage: ChatMessage = { 
                    id: crypto.randomUUID(),
                    role: 'model', 
                    content: fullResponse,
                    timestamp: new Date().toISOString()
                };
                setHistory(prev => {
                    const last = prev[prev.length - 1];
                    if (last && last.role === 'model') {
                        return [...prev.slice(0, -1), modelMessage];
                    }
                    return [...prev, modelMessage];
                });
            }

        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
            const errorMessage: ChatMessage = { 
                id: crypto.randomUUID(),
                role: 'model', 
                content: `Sorry, I encountered an error: ${e.message}`,
                timestamp: new Date().toISOString()
            };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center text-white"><NoloIcon className="w-5 h-5" /></div>}
                        <div className={`px-4 py-2.5 rounded-2xl max-w-lg ${msg.role === 'user' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-br-lg' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] rounded-bl-lg'}`}>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex-shrink-0 bg-[hsl(var(--primary))] rounded-full flex items-center justify-center text-white"><NoloIcon className="w-5 h-5" /></div>
                        <div className="px-4 py-2 rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]"><Spinner size="sm" /></div>
                    </div>
                )}
                 {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
            </div>
            <form onSubmit={handleSubmit} className="p-3 border-t border-[hsl(var(--border))] flex items-center gap-2">
                <div className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
                    <button type="button" onClick={() => alert('Feature coming soon!')} className="p-2 hover:bg-[hsl(var(--accent))] rounded-full transition-colors" title="Upload File">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => copyConversation()} className="p-2 hover:bg-[hsl(var(--accent))] rounded-full transition-colors" title="Copy Conversation">
                        {conversationCopied ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                    </button>
                    <button type="button" onClick={onVoiceClick} className="p-2 hover:bg-[hsl(var(--accent))] rounded-full transition-colors" title="Use Voice">
                        <MicIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative w-full">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ask Nolo anything..."
                        className="w-full bg-[hsl(var(--background))] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] pl-4 pr-12"
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[hsl(var(--primary))] text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
                        <SendIcon className="w-5 h-5"/>
                    </button>
                </div>
            </form>
        </div>
    );
};

export const NoloAI: React.FC<NoloAIProps> = ({ initialTab = 'chat', setActiveTab }) => {
    const [activeTab, setActiveTabInternal] = useState<'chat' | 'agents'>(initialTab);

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
             <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
                   <NoloIcon className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold">Nolo AI</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Your personal AI assistant and autonomous agent for content creation.</p>
            </div>
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] flex-grow flex flex-col">
                 <div className="border-b border-[hsl(var(--border))] flex-shrink-0">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTabInternal('chat')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'chat' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Chat</button>
                        <button onClick={() => setActiveTabInternal('agents')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'agents' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Agent Mode</button>
                    </nav>
                </div>
                <div className="p-2 sm:p-6 flex-grow overflow-hidden h-full">
                    {activeTab === 'chat' ? (
                        <NoloChat onVoiceClick={() => setActiveTab?.(Tab.AIVoiceCoPilot)} />
                    ) : (
                        <AIAgents />
                    )}
                </div>
            </div>
        </div>
    );
};