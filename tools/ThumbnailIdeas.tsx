import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { SaveIcon, ThumbnailIcon } from '../components/Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SavedContent } from '../types';

export const ThumbnailIdeas: React.FC = () => {
    const [videoTitle, setVideoTitle] = useState('');
    const [ideas, setIdeas] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [, setSavedContent] = useLocalStorage<SavedContent[]>('my-content', []);

    const handleSave = () => {
        if (ideas.length === 0) return;
        const newContent: SavedContent = {
            id: Date.now().toString(),
            tool: 'Thumbnail Ideas',
            title: `Thumbnails for ${videoTitle.substring(0, 30)}...`,
            content: ideas,
            createdAt: new Date().toISOString(),
        };
        setSavedContent(prev => [newContent, ...prev]);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSubmit = async () => {
        if (!videoTitle.trim()) {
            setError('Please enter a video title or topic.');
            return;
        }
        setLoading(true);
        setError('');
        setIdeas([]);

        const prompt = `
            You are an expert YouTube thumbnail designer.
            For a video titled "${videoTitle}", generate 3 distinct and click-worthy thumbnail ideas.

            For each idea, provide a detailed visual description including:
            - **Layout:** Where key elements are placed.
            - **Imagery:** What photos or graphics to use (e.g., 'A dramatic photo of...', 'A clean graphic showing...').
            - **Text:** The exact, short, punchy text to put on the thumbnail (use ALL CAPS for text).
            - **Color Scheme:** Suggested colors to evoke a certain mood (e.g., 'Bright and energetic with yellow and blue').
            - **Emotion:** The key emotion the thumbnail should evoke (e.g., 'Curiosity', 'Excitement', 'Urgency').

            Format the response as a numbered list.
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
            });
            
            // Robustly parse the numbered list response without using a regular expression
            const lines = response.text.split('\n');
            const ideasAccumulator: string[] = [];
            let currentIdea = '';

            for (const line of lines) {
                const trimmedLine = line.trim();
                // Check if the line starts with a number like "1." or "2. "
                const isNewIdea = trimmedLine.length > 1 && 
                                  trimmedLine[0] >= '1' && 
                                  trimmedLine[0] <= '9' && 
                                  trimmedLine.substring(1).trim().startsWith('.');
                
                if (isNewIdea) {
                    if (currentIdea) {
                        ideasAccumulator.push(currentIdea.trim());
                    }
                    currentIdea = line;
                } else {
                    currentIdea += '\n' + line;
                }
            }
            if (currentIdea.trim()) {
                ideasAccumulator.push(currentIdea.trim());
            }
            setIdeas(ideasAccumulator);

        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400"><ThumbnailIcon /></div>
                <h1 className="text-3xl font-bold">Thumbnail Ideas</h1>
                <p className="text-gray-400">Generate click-worthy thumbnail concepts for your videos.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
                <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter your video title or topic..."
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !videoTitle.trim()}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Generate Ideas'}
                </button>
            </div>
            <div className="mt-6">
                {loading && <div className="text-center"><Spinner size="lg" /></div>}
                {error && <p className="text-red-400 text-center">{error}</p>}
                {ideas.length > 0 && (
                    <>
                        <div className="flex justify-end mb-4">
                            <button
                                onClick={handleSave}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                                    saved ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                <SaveIcon /> {saved ? 'Saved!' : 'Save Ideas'}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {ideas.map((idea, index) => (
                                <div key={index} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                    <h3 className="text-lg font-bold mb-2">Idea #{index + 1}</h3>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{idea.substring(idea.indexOf('.') + 1).trim()}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};