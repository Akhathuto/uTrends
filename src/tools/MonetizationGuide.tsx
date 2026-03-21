
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { DollarSignIcon } from '../components/Icons';
import { getMonetizationGuide } from '../services/geminiService';

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

        try {
            const data = await getMonetizationGuide(platform, followers);
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
                   <DollarSignIcon/>
                </div>
                <h1 className="text-3xl font-bold">Monetization Guide</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Receive tailored monetization strategies for your channel.</p>
            </div>
            
            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">Primary Platform</label>
                        <select value={platform} onChange={(e) => setPlatform(e.target.value as Platform)} className="w-full p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none appearance-none" 
                        style={{ background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.4-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-4.9-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E\') no-repeat right 0.75rem center / 0.5em', paddingRight: '2.5rem' }}
                        disabled={loading}>
                            <option>YouTube</option>
                            <option>TikTok</option>
                            <option>Instagram</option>
                            <option>Blog/Website</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">Followers / Subscribers</label>
                        <input
                          type="number"
                          value={followers}
                          onChange={(e) => setFollowers(e.target.value)}
                          placeholder="e.g., 10000"
                          className="w-full p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                          disabled={loading}
                        />
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !followers.trim()}
                    className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner size="sm" /> : 'Generate Monetization Guide'}
                </button>
            </div>
            
            <div className="mt-6 flex-grow overflow-y-auto">
                 {loading && (
                    <div className="flex flex-col justify-center items-center bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-8">
                        <Spinner size="lg" />
                        <p className="mt-4 text-[hsl(var(--muted-foreground))]">Unlocking your earning potential...</p>
                    </div>
                )}
                {error && <p className="text-red-400 text-center bg-[hsl(var(--card))] rounded-[var(--radius)] p-4">{error}</p>}
                {result && (
                    <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] p-6">
                        <h2 className="text-xl font-semibold mb-3">Your Custom Monetization Guide</h2>
                        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-[hsl(var(--card-foreground))] whitespace-pre-wrap">
                            {result}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
