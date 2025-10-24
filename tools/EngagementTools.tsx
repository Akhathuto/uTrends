import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { MessageSquarePlusIcon } from '../components/Icons';

interface EngagementToolsProps {
    initialTab?: 'comment' | 'prompt';
}

const CommentResponder = () => {
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState('Friendly');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        setLoading(true); setError(''); setResult('');
        const prompt = `Generate 3 reply options for the following comment. The tone of the replies should be ${tone}.\n\nComment: "${comment}"\n\nReply Options:`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setResult(response.text);
        } catch (e: any) { setError(`An error occurred: ${e.message}`); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Paste a comment here..." className="w-full p-3 h-24 bg-gray-900 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
            <div>
                <label className="text-sm font-medium text-gray-300">Response Tone:</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Friendly', 'Witty', 'Professional', 'Thankful'].map(t => (
                        <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 text-sm rounded-md ${tone === t ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`} disabled={loading}>{t}</button>
                    ))}
                </div>
            </div>
            <button onClick={handleSubmit} disabled={loading || !comment} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Generate Replies'}
            </button>
            {error && <p className="text-red-400">{error}</p>}
            {result && <div className="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap text-gray-300">{result}</div>}
        </div>
    );
};

const PromptGenerator = () => {
    const [idea, setIdea] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

     const handleSubmit = async () => {
        if (!idea.trim()) return;
        setLoading(true); setError(''); setResult('');
        const prompt = `I need to generate an image for my content. My basic idea is: "${idea}".\n\nEnhance this into a detailed, descriptive prompt for an AI image generator like Imagen or Midjourney. Include details about style (e.g., photorealistic, cartoon, watercolor), lighting (e.g., cinematic, soft), composition (e.g., wide shot, close-up), and mood. Provide 3 distinct prompt options.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setResult(response.text);
        } catch (e: any) { setError(`An error occurred: ${e.message}`); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Enter your simple idea (e.g., 'a cat in space')..." className="w-full p-3 h-24 bg-gray-900 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !idea} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Generate Detailed Prompts'}
            </button>
            {error && <p className="text-red-400">{error}</p>}
            {result && <div className="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap text-gray-300">{result}</div>}
        </div>
    );
};


export const EngagementTools: React.FC<EngagementToolsProps> = ({ initialTab = 'comment' }) => {
    const [activeTab, setActiveTab] = useState<'comment' | 'prompt'>(initialTab);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400">
                   <MessageSquarePlusIcon/>
                </div>
                <h1 className="text-3xl font-bold">Engagement Tools</h1>
                <p className="text-gray-400">Perfect your audience interaction and AI instructions.</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('comment')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'comment' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Comment Responder</button>
                        <button onClick={() => setActiveTab('prompt')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'prompt' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Prompt Generator</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'comment' ? <CommentResponder /> : <PromptGenerator />}
                </div>
            </div>
        </div>
    );
};
