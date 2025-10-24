import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, FunctionCall } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { NoloIcon, SendIcon, BotIcon, LoaderIcon, CheckCircleIcon, XCircleIcon, PaperclipIcon, ClipboardCopyIcon, MicIcon } from '../components/Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChatMessage, TaskStep } from '../types';
import { availableTools, toolDeclarations } from '../utils/agentTools';

interface NoloAIProps {
    initialTab?: 'chat' | 'agents';
}

const NoloChat: React.FC = () => {
    const [history, setHistory] = useLocalStorage<ChatMessage[]>('nolo-chat-history', []);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: "You are Nolo, a friendly and helpful AI assistant for content creators. Provide concise, actionable advice.",
            },
        });
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

        const userMessage: ChatMessage = { role: 'user', text: message };
        setHistory(prev => [...prev, userMessage]);
        setMessage('');
        setLoading(true);
        setError('');

        try {
            let fullResponse = '';
            const result = await chat.sendMessageStream({ message });
            
            for await (const chunk of result) {
                fullResponse += chunk.text;
                const modelMessage: ChatMessage = { role: 'model', text: fullResponse };
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
            const errorMessage: ChatMessage = { role: 'model', text: `Sorry, I encountered an error: ${e.message}` };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyConversation = () => {
        const conversationText = history.map(m => `${m.role === 'user' ? 'You' : 'Nolo'}: ${m.text}`).join('\n\n');
        navigator.clipboard.writeText(conversationText);
        alert('Conversation copied to clipboard!');
    };

    return (
        <div className="flex flex-col h-full">
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-900 rounded-t-lg">
                {history.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center"><NoloIcon className="w-5 h-5" /></div>}
                        <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 flex-shrink-0 bg-blue-600 rounded-full flex items-center justify-center"><NoloIcon className="w-5 h-5" /></div>
                        <div className="px-4 py-2 rounded-lg bg-gray-700 text-gray-200"><Spinner size="sm" /></div>
                    </div>
                )}
                 {error && <p className="text-red-400 text-center">{error}</p>}
            </div>
            <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg flex items-center gap-4">
                <div className="flex items-center gap-1 text-gray-400">
                    <button type="button" onClick={() => alert('Feature coming soon!')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Upload File">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={handleCopyConversation} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Copy Conversation">
                        <ClipboardCopyIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={() => alert('Feature coming soon!')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Use Voice">
                        <MicIcon className="w-5 h-5" />
                    </button>
                </div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask Nolo anything..."
                    className="flex-grow bg-gray-700 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button type="submit" disabled={loading || !message.trim()} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500">
                    <SendIcon />
                </button>
            </form>
        </div>
    );
};

const AIAgents: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [taskLog, setTaskLog] = useState<TaskStep[]>([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-pro',
            config: { tools: [{ functionDeclarations: toolDeclarations }] },
        });
        setChat(chatInstance);
    }, []);

    const executeFunctionCall = async (functionCall: FunctionCall) => {
        const { name, args } = functionCall;
        const toolName = name as keyof typeof availableTools;

        if (availableTools[toolName]) {
            // FIX: Cast `args` to `any` to satisfy TypeScript for this dynamic dispatch.
            // The AI model ensures the args match the function declaration, so this is safe at runtime.
            return await availableTools[toolName](args as any);
        } else {
            throw new Error(`Unknown tool: ${name}`);
        }
    };

    const runConversation = async (userMessage: string) => {
        if (!chat) return;
        setLoading(true);
        setHistory(prev => [...prev, { role: 'user', text: userMessage }]);
        
        let response = await chat.sendMessage({ message: userMessage });

        while(response.functionCalls) {
            const functionCalls = response.functionCalls;
            // FIX: Changed structure to create an array of `FunctionResponsePart` objects for the API.
            const functionResponseParts = [];

            for (const fc of functionCalls) {
                const taskId = `${Date.now()}-${fc.name}`;
                setTaskLog(prev => [...prev, { id: taskId, name: fc.name, status: 'executing', input: fc.args }]);
                
                try {
                    const result = await executeFunctionCall(fc);
                    functionResponseParts.push({ functionResponse: { name: fc.name, response: { result } } });
                    setTaskLog(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', output: result } : t));
                } catch (e: any) {
                    const errorMsg = `Error executing tool ${fc.name}: ${e.message}`;
                    functionResponseParts.push({ functionResponse: { name: fc.name, response: { error: errorMsg } } });
                    setTaskLog(prev => prev.map(t => t.id === taskId ? { ...t, status: 'error', error: errorMsg } : t));
                }
            }
            // FIX: Pass the array of `FunctionResponsePart` as the `message` property to `sendMessage`.
            response = await chat.sendMessage({ message: functionResponseParts });
        }
        
        setHistory(prev => [...prev, { role: 'model', text: response.text }]);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading) return;
        setTaskLog([]);
        runConversation(message);
        setMessage('');
    };
    
     const handleCopyConversation = () => {
        const conversationText = history.map(m => `${m.role === 'user' ? 'You' : 'Agent'}: ${m.text}`).join('\n\n');
        navigator.clipboard.writeText(conversationText);
        alert('Conversation copied to clipboard!');
    };

    const StatusIcon = ({ status }: { status: TaskStep['status'] }) => {
        switch (status) {
            case 'executing': return <LoaderIcon className="w-5 h-5 text-blue-400" />;
            case 'completed': return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case 'error': return <XCircleIcon className="w-5 h-5 text-red-400" />;
            default: return <BotIcon className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            <div className="lg:w-2/3 flex flex-col h-full">
                <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-gray-900 rounded-t-lg">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                             {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-gray-700 rounded-full flex items-center justify-center"><BotIcon className="w-5 h-5" /></div>}
                             <div className={`px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
                 <form onSubmit={handleSubmit} className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400">
                        <button type="button" onClick={() => alert('Feature coming soon!')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Upload File">
                            <PaperclipIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={handleCopyConversation} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Copy Conversation">
                            <ClipboardCopyIcon className="w-5 h-5" />
                        </button>
                        <button type="button" onClick={() => alert('Feature coming soon!')} className="p-2 hover:bg-gray-700 rounded-full transition-colors" title="Use Voice">
                            <MicIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="e.g., Write a script about space travel and get thumbnail ideas for it" className="flex-grow bg-gray-700 p-3 rounded-lg focus:outline-none" disabled={loading} />
                    <button type="submit" disabled={loading || !message.trim()} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500"><SendIcon /></button>
                </form>
            </div>
             <div className="lg:w-1/3 bg-gray-900 rounded-lg p-4 flex flex-col">
                <h3 className="text-lg font-bold mb-4 border-b border-gray-700 pb-2">Task Log</h3>
                {taskLog.length === 0 ? <p className="text-gray-500 text-sm">The agent's tasks will appear here.</p> :
                <div className="space-y-3 overflow-y-auto">
                    {taskLog.map(task => (
                        <div key={task.id} className="text-sm">
                           <div className="flex items-center gap-2">
                                <StatusIcon status={task.status} />
                                <span className="font-semibold">{task.name}</span>
                                <span className="text-gray-400 capitalize">{task.status}</span>
                            </div>
                           {task.error && <p className="text-red-400 text-xs ml-7">{task.error}</p>}
                        </div>
                    ))}
                </div>
                }
            </div>
        </div>
    );
};

export const NoloAI: React.FC<NoloAIProps> = ({ initialTab = 'chat' }) => {
    const [activeTab, setActiveTab] = useState<'chat' | 'agents'>(initialTab);

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
             <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400">
                   <NoloIcon/>
                </div>
                <h1 className="text-3xl font-bold">Nolo AI</h1>
                <p className="text-gray-400">Your personal AI assistant and autonomous agent for content creation.</p>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700 flex-grow flex flex-col">
                 <div className="border-b border-gray-700 flex-shrink-0">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('chat')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Chat</button>
                        <button onClick={() => setActiveTab('agents')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'agents' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Agent Mode</button>
                    </nav>
                </div>
                <div className="p-2 sm:p-6 flex-grow overflow-hidden h-full">
                    {activeTab === 'chat' ? <NoloChat /> : <AIAgents />}
                </div>
            </div>
        </div>
    );
};