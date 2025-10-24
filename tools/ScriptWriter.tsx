import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { FileTextIcon, SaveIcon } from '../components/Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SavedContent } from '../types';

interface Script {
    title: string;
    hook: string;
    introduction: string;
    main_points: string[];
    conclusion: string;
    call_to_action: string;
}

export const ScriptWriter: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('5');
    const [script, setScript] = useState<Script | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [, setSavedContent] = useLocalStorage<SavedContent[]>('my-content', []);

    const handleSave = () => {
        if (!script) return;
        const newContent: SavedContent = {
            id: Date.now().toString(),
            tool: 'Script Writer',
            title: script.title,
            content: script,
            createdAt: new Date().toISOString(),
        };
        setSavedContent(prev => [newContent, ...prev]);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSubmit = async () => {
        if (!topic.trim()) {
            setError('Please enter a video topic.');
            return;
        }
        setLoading(true);
        setError('');
        setScript(null);

        const prompt = `
            Create a YouTube video script about "${topic}".
            The target video duration is approximately ${duration} minutes.
            The script should be engaging, well-structured, and easy to follow.
            Include a catchy title, a strong hook, an introduction, 3-4 main points, a conclusion, and a call to action.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: "A catchy and SEO-friendly title." },
                            hook: { type: Type.STRING, description: "A strong opening hook (1-2 sentences) to grab viewer attention." },
                            introduction: { type: Type.STRING, description: "A brief introduction to the topic." },
                            main_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of strings, each being a detailed paragraph for a main point." },
                            conclusion: { type: Type.STRING, description: "A summary of the main points." },
                            call_to_action: { type: Type.STRING, description: "A call to action, e.g., asking viewers to like, subscribe, or comment." }
                        },
                        required: ['title', 'hook', 'introduction', 'main_points', 'conclusion', 'call_to_action']
                    },
                },
            });
            const jsonResponse = JSON.parse(response.text);
            setScript(jsonResponse);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400"><FileTextIcon /></div>
                <h1 className="text-3xl font-bold">Script Writer</h1>
                <p className="text-gray-400">Generate a complete video script from a simple topic.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Video Topic</label>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The history of artificial intelligence" className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">Target Duration (minutes)</label>
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 w-full p-2 bg-gray-900 border border-gray-600 rounded-md">
                        <option value="2">2 (Short)</option>
                        <option value="5">5 (Standard)</option>
                        <option value="10">10 (Deep Dive)</option>
                    </select>
                </div>
                <button onClick={handleSubmit} disabled={loading || !topic.trim()} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center">
                    {loading ? <Spinner size="sm" /> : 'Write My Script'}
                </button>
            </div>
            {loading && <div className="text-center mt-6"><Spinner size="lg" /></div>}
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            {script && (
                <div className="mt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                        <h2 className="text-2xl font-bold text-white leading-tight">{script.title}</h2>
                        <button
                            onClick={handleSave}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors flex-shrink-0 ${
                                saved ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                        >
                            <SaveIcon /> {saved ? 'Saved!' : 'Save Script'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-lg text-blue-400 mb-2">Hook</h3>
                            <p className="text-gray-300 italic">"{script.hook}"</p>
                        </div>
                        
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-lg text-blue-400 mb-2">Introduction</h3>
                            <p className="text-gray-300">{script.introduction}</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h3 className="font-semibold text-lg text-blue-400 mb-3">Main Points</h3>
                        <ul className="space-y-4">
                            {script.main_points.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-gray-700 text-blue-300 rounded-full flex items-center justify-center font-bold text-xs mt-1">{index + 1}</div>
                                    <p className="text-gray-300">{point}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-lg text-blue-400 mb-2">Conclusion</h3>
                            <p className="text-gray-300">{script.conclusion}</p>
                        </div>

                        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                            <h3 className="font-semibold text-lg text-blue-400 mb-2">Call to Action</h3>
                            <p className="text-gray-300">{script.call_to_action}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};