
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { MyContentIcon } from '../components/Icons'; // Using a relevant icon

interface CalendarEntry {
    day: string;
    idea: string;
    format: string;
    platform: string;
}

export const ContentCalendar: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [calendar, setCalendar] = useState<CalendarEntry[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!topic.trim()) {
            setError('Please describe your channel or topic.');
            return;
        }
        setLoading(true);
        setError('');
        setCalendar(null);

        const prompt = `Generate a 7-day content calendar for a creator focused on "${topic}". The plan should include a mix of content formats (e.g., long-form video, short-form video, community post) and platforms (e.g., YouTube, TikTok, Instagram). Provide a specific, actionable content idea for each day.`;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.STRING, description: "e.g., Day 1: Monday" },
                                idea: { type: Type.STRING, description: "The content idea for the day." },
                                format: { type: Type.STRING, description: "e.g., Long-form video, Short, Poll" },
                                platform: { type: Type.STRING, description: "e.g., YouTube, TikTok" },
                            },
                             required: ['day', 'idea', 'format', 'platform']
                        },
                    },
                },
            });
            const jsonResponse = JSON.parse(response.text);
            setCalendar(jsonResponse);
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
                   <MyContentIcon/>
                </div>
                <h1 className="text-3xl font-bold">Content Calendar</h1>
                <p className="text-gray-400">Plan your content for the week ahead.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-gray-300 mb-2">Channel Topic / Niche</label>
                    <input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., 'Home gardening' or 'AI news and tutorials'"
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={loading}
                    />
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !topic.trim()}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Generate Calendar'}
                </button>
            </div>
            
            <div className="mt-6 flex-grow overflow-y-auto">
                 {loading && (
                    <div className="flex flex-col justify-center items-center bg-gray-800 rounded-lg border border-gray-700 p-8">
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-400">Planning your content schedule...</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-gray-800 rounded-lg p-4">{error}</p>}
                {calendar && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                        <div className="p-4">
                            <h2 className="text-xl font-semibold mb-3">Your 7-Day Content Plan</h2>
                            <div className="space-y-4">
                                {calendar.map((entry, index) => (
                                    <div key={index} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <h3 className="font-bold text-white">{entry.day}</h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full">{entry.platform}</span>
                                                <span className="text-xs font-medium bg-gray-700 text-gray-300 px-2 py-1 rounded-full">{entry.format}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300">{entry.idea}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
