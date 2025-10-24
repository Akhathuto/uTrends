import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { DollarSignIcon } from '../components/Icons';

type Platform = 'YouTube' | 'TikTok' | 'Instagram' | 'Blog/Website';

export const MonetizationGuide = () => {
    const [platform, setPlatform] = useState<Platform>('YouTube');
    const [followers, setFollowers] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!followers.trim()) {
            setError('Please enter your follower/subscriber count.');
            return;
        }
        setLoading(true);
        setError('');
        setResult('');

        const prompt = `
            You are a creator economy expert. A content creator is seeking monetization advice.
            Their primary platform is ${platform} and they have ${followers} followers/subscribers.

            Based on this information, provide a tailored monetization guide. The guide should include:
            1.  **Immediate Opportunities:** At least 2 strategies they can implement right now, suitable for their current audience size.
            2.  **Mid-Term Goals (Next 6-12 months):** At least 2 strategies to work towards as their audience grows.
            3.  **Long-Term Vision:** At least 1 ambitious, long-term monetization strategy.
            4.  **Actionable First Step:** For one of the "Immediate Opportunities", provide a concrete first step they can take this week.

            Explain why each strategy is a good fit for their platform and audience size. Format the response in clean Markdown.
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
                   <DollarSignIcon/>
                </div>
                <h1 className="text-3xl font-bold">Monetization Guide</h1>
                <p className="text-gray-400">Receive tailored monetization strategies for your channel.</p>
            </div>
            
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Primary Platform</label>
                        <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500" disabled={loading}>
                            <option>YouTube</option>
                            <option>TikTok</option>
                            <option>Instagram</option>
                            <option>Blog/Website</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Followers / Subscribers</label>
                        <input
                          type="number"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                          placeholder="e.g., 10000"
                          className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                          disabled={loading}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !followers.trim()}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Generate Monetization Guide'}
                </button>
            </div>
            
            <div className="mt-6 flex-grow overflow-y-auto">
                 {loading && (
                    <div className="flex flex-col justify-center items-center bg-gray-800 rounded-lg border border-gray-700 p-8">
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-400">Unlocking your earning potential...</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-gray-800 rounded-lg p-4">{error}</p>}
                {result && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                        <h2 className="text-xl font-semibold mb-3">Your Custom Monetization Guide</h2>
                        {/* FIX: Replaced dangerouslySetInnerHTML with safer direct rendering, relying on CSS for whitespace handling. */}
                        <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};