
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { SaveIcon, TargetIcon } from '../components/Icons';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SavedContent } from '../types';
import { getGrowthPlan } from '../services/geminiService';

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

        try {
            const data = await getGrowthPlan(channelDescription);
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
                   <TargetIcon/>
                </div>
                <h1 className="text-3xl font-bold">Growth Planner</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Get a custom growth strategy for your channel.</p>
            </div>
            
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-6 space-y-4">
                <textarea
                    value={channelDescription}
                    onChange={(e) => setChannelDescription(e.target.value)}
                    placeholder="Describe your channel, its niche, and your target audience..."
                    className="w-full p-4 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md resize-none h-32 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                    disabled={loading}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !channelDescription.trim()}
                    className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Generate Growth Plan'}
                </button>
            </div>
            
             <div className="mt-6 flex-grow overflow-y-auto">
                {loading && (
                    <div className="flex justify-center items-center bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-8">
                        <Spinner size="lg" />
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-[hsl(var(--card))] rounded-[var(--radius)] p-4">{error}</p>}
                {result && (
                     <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-6">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-xl font-semibold">Your Custom Growth Plan</h2>
                            <button
                                onClick={handleSave}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                                    saved ? 'bg-green-600 text-white' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                                }`}
                            >
                                <SaveIcon /> {saved ? 'Saved!' : 'Save Plan'}
                            </button>
                        </div>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-[hsl(var(--card-foreground))] whitespace-pre-wrap">{result}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
