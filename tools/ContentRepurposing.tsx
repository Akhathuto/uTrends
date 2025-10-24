
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { RepeatIcon } from '../components/Icons';

interface RepurposedContent {
    blogPost: string;
    tweetThread: string;
    linkedinPost: string;
}

export const ContentRepurposing = () => {
    const [sourceText, setSourceText] = useState('');
    const [result, setResult] = useState<RepurposedContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'blog' | 'twitter' | 'linkedin'>('blog');

    const handleSubmit = async () => {
        if (!sourceText.trim()) {
            setError('Please enter some source text to repurpose.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the following text, repurpose it into three formats: a blog post, a tweet thread (series of short tweets), and a LinkedIn post. The tone should be engaging and professional.\n\nSource Text:\n${sourceText}`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            blogPost: {
                                type: Type.STRING,
                                description: 'A well-structured blog post with a title and paragraphs.',
                            },
                            tweetThread: {
                                type: Type.STRING,
                                description: 'A numbered tweet thread, where each tweet is short and engaging.',
                            },
                            linkedinPost: {
                                type: Type.STRING,
                                description: 'A professional post suitable for LinkedIn, including relevant hashtags.'
                            }
                        }
                    }
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            setResult(jsonResponse);
            
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
                   <RepeatIcon/>
                </div>
                <h1 className="text-3xl font-bold">Content Repurposing</h1>
                <p className="text-gray-400">Turn one piece of content into many. Maximize your reach.</p>
            </div>
            
            <div className="flex-grow flex flex-col bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
                <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Paste your video script or blog post here..."
                    className="w-full flex-grow p-4 bg-gray-900 border border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Repurpose Content'}
                </button>
            </div>
            
             <div className="mt-6">
                {loading && (
                    <div className="flex justify-center items-center bg-gray-800 rounded-lg border border-gray-700 p-8">
                        <Spinner size="lg" />
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-gray-800 rounded-lg p-4">{error}</p>}
                {result && (
                    <div className="bg-gray-800 rounded-lg border border-gray-700">
                        <div className="border-b border-gray-700">
                            <nav className="flex space-x-4 p-2" aria-label="Tabs">
                                <button onClick={() => setActiveTab('blog')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'blog' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Blog Post</button>
                                <button onClick={() => setActiveTab('twitter')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'twitter' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Tweet Thread</button>
                                <button onClick={() => setActiveTab('linkedin')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'linkedin' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>LinkedIn Post</button>
                            </nav>
                        </div>
                        <div className="p-6">
                           <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                                {activeTab === 'blog' && result.blogPost}
                                {activeTab === 'twitter' && result.tweetThread}
                                {activeTab === 'linkedin' && result.linkedinPost}
                           </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
