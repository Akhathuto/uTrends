import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { SaveIcon, TargetIcon } from '../components/Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SavedContent } from '../types';

export const GrowthPlanner: React.FC = () => {
    const [channelDescription, setChannelDescription] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [, setSavedContent] = useLocalStorage<SavedContent[]>('my-content', []);


    const handleSave = () => {
        const newContent: SavedContent = {
            id: Date.now().toString(),
            tool: 'Growth Planner',
            title: `Growth Plan for ${channelDescription.substring(0, 30)}...`,
            content: result,
            createdAt: new Date().toISOString(),
        };
        setSavedContent(prev => [newContent, ...prev]);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSubmit = async () => {
        if (!channelDescription.trim()) {
            setError('Please describe your channel.');
            return;
        }
        setLoading(true);
        setError('');
        setResult('');

        const prompt = `
            Create a detailed growth plan for a content creator with the following channel: "${channelDescription}".

            The plan should cover the next 3 months and include:
            1.  **Content Strategy:** Suggest 3 specific content pillars or series ideas.
            2.  **Audience Engagement:** Provide 2 unique ways to engage with the community.
            3.  **Collaboration:** Suggest one type of collaboration partner that would be a good fit.
            4.  **Promotion:** Outline a simple cross-promotion strategy for one other social media platform.
            5.  **Key Metrics:** List 3 key metrics they should track to measure success.

            Format the response in clear, actionable Markdown.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            setResult(response.text);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400">
                   <TargetIcon/>
                </div>
                <h1 className="text-3xl font-bold">Growth Planner</h1>
                <p className="text-gray-400">Get a custom growth strategy for your channel.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
                <textarea
                    value={channelDescription}
                    onChange={(e) => setChannelDescription(e.target.value)}
                    placeholder="Describe your channel, its niche, and your target audience..."
                    className="w-full flex-grow p-4 bg-gray-900 border border-gray-600 rounded-lg resize-none h-32 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !channelDescription.trim()}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Generate Growth Plan'}
                </button>
            </div>
            
             <div className="mt-6 flex-grow overflow-y-auto">
                {loading && (
                    <div className="flex justify-center items-center bg-gray-800 rounded-lg border border-gray-700 p-8">
                        <Spinner size="lg" />
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-gray-800 rounded-lg p-4">{error}</p>}
                {result && (
                     <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold">Your Custom Growth Plan</h2>
                            <button
                                onClick={handleSave}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                                    saved ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                <SaveIcon /> {saved ? 'Saved!' : 'Save Plan'}
                            </button>
                        </div>
                        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
};