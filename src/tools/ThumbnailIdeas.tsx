
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { SaveIcon, ThumbnailIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { ThumbnailIdea } from '../types';
import { generateThumbnailIdeas } from '../services/geminiService';

export const ThumbnailIdeas: React.FC = () => {
    const [videoTitle, setVideoTitle] = useState('');
    const [ideas, setIdeas] = useState<ThumbnailIdea[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const { addSavedContent } = useAuth();

    const handleSave = () => {
        if (ideas.length === 0) return;
        addSavedContent({
            tool: 'Thumbnail Ideas',
            title: `Thumbnails for ${videoTitle.substring(0, 30)}...`,
            content: ideas,
        });
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

        try {
            const data = await generateThumbnailIdeas(videoTitle);
            setIdeas(data);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]"><ThumbnailIcon /></div>
                <h1 className="text-3xl font-bold">Thumbnail Ideas</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Generate click-worthy thumbnail concepts for your videos.</p>
            </div>
            <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))] space-y-4">
                <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Enter your video title or topic..."
                    className="w-full p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !videoTitle.trim()}
                    className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
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
                                    saved ? 'bg-green-600 text-white' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                                }`}
                            >
                                <SaveIcon /> {saved ? 'Saved!' : 'Save Ideas'}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {ideas.map((idea, index) => (
                                <div key={index} className="bg-[hsl(var(--card))] p-4 rounded-[var(--radius)] border border-[hsl(var(--border))] flex flex-col h-full">
                                    <h3 className="text-lg font-bold mb-2">Idea #{index + 1}</h3>
                                    <div className="flex-grow space-y-3">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Style</span>
                                            <p className="text-sm">{idea.style}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Text Overlay</span>
                                            <p className="text-sm font-mono bg-[hsl(var(--background))] p-1 rounded">{idea.textOverlay}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Description</span>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">{idea.description}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">Visual Elements</span>
                                            <ul className="list-disc list-inside text-sm text-[hsl(var(--muted-foreground))]">
                                                {idea.visualElements.map((el, i) => <li key={i}>{el}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                                        <span className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary))]">AI Image Prompt</span>
                                        <p className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--background))] p-2 rounded mt-1 italic">
                                            {idea.imageGenPrompt}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
