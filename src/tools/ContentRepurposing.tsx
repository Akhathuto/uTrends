
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { RepeatIcon } from '../components/Icons';
import { RepurposedContent } from '../types';
import { repurposeContent } from '../services/geminiService';

export const ContentRepurposing = () => {
    const [sourceText, setSourceText] = useState('');
    const [result, setResult] = useState<RepurposedContent | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'blog' | 'twitter' | 'linkedin' | 'instagram'>('blog');

    const handleSubmit = async () => {
        if (!sourceText.trim()) {
            setError('Please enter some source text to repurpose.');
            return;
        }
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await repurposeContent(sourceText);
            setResult(data);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
                   <RepeatIcon/>
                </div>
                <h1 className="text-3xl font-bold">Content Repurposing</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Turn one piece of content into many. Maximize your reach.</p>
            </div>
            
            <div className="flex-grow flex flex-col bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-6 space-y-4">
                <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="Paste your video script or blog post here..."
                    className="w-full flex-grow p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md resize-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Repurpose Content'}
                </button>
            </div>
            
             <div className="mt-6">
                {loading && (
                    <div className="flex justify-center items-center bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-8">
                        <Spinner size="lg" />
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-[hsl(var(--card))] rounded-[var(--radius)] p-4">{error}</p>}
                {result && (
                    <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                        <div className="border-b border-[hsl(var(--border))]">
                            <nav className="flex space-x-2 p-2" aria-label="Tabs">
                                <button onClick={() => setActiveTab('blog')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'blog' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Blog Post</button>
                                <button onClick={() => setActiveTab('twitter')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'twitter' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Tweet Thread</button>
                                <button onClick={() => setActiveTab('instagram')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'instagram' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Instagram</button>
                                <button onClick={() => setActiveTab('linkedin')} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'linkedin' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>LinkedIn Post</button>
                            </nav>
                        </div>
                        <div className="p-6">
                           <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-[hsl(var(--card-foreground))] whitespace-pre-wrap">
                                {activeTab === 'blog' && result.blogPost}
                                {activeTab === 'twitter' && (
                                    <div className="space-y-4">
                                        {result.twitterThread.map((tweet, i) => (
                                            <div key={i} className="p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md">
                                                <span className="text-xs font-bold text-[hsl(var(--primary))] block mb-1">Tweet {i + 1}</span>
                                                {tweet}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'instagram' && (
                                    <div className="space-y-4">
                                        {result.instagramCaptions.map((caption, i) => (
                                            <div key={i} className="p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md">
                                                <span className="text-xs font-bold text-[hsl(var(--primary))] block mb-1">Caption {i + 1}</span>
                                                {caption}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {activeTab === 'linkedin' && result.linkedInPost}
                           </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
