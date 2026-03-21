
import React, { useState, useEffect, useCallback } from 'react';
import Spinner from '../components/Spinner';
import { VideoEditIcon } from '../components/Icons';
import { generateVideo } from '../services/geminiService';

export const VideoEditor = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [previousVideo, setPreviousVideo] = useState<any | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    const checkApiKey = useCallback(async () => {
        if ((window as any).aistudio) {
            setApiKeySelected(await (window as any).aistudio.hasSelectedApiKey());
        }
    }, []);

    useEffect(() => { checkApiKey(); }, [checkApiKey]);

    const handleGenerateFirstVideo = async () => {
        if (!prompt.trim()) { setError('Please enter a prompt for the initial scene.'); return; }
        setLoading(true); setStatus('Generating initial video...'); setError(''); setGeneratedVideoUrl(null); setPreviousVideo(null);
        try {
            const data = await generateVideo(`A 4-second video of: ${prompt}`, { resolution: '720p', aspectRatio: '16:9' });
            setPreviousVideo(data.video);
            setGeneratedVideoUrl(data.url);
            setStatus('Initial video generated. Now describe what happens next.');
        } catch (e: any) {
             if (e.message.includes('Requested entity was not found')) {
                setError('API key error. Please select your API key again.');
                setApiKeySelected(false);
             } else if (e.message !== 'API key not found') {
                setError(`An error occurred: ${e.message}`);
             }
        } finally { setLoading(false); }
    };

    const handleExtendVideo = async () => {
        if (!prompt.trim()) { setError('Please describe what should happen next.'); return; }
        if (!previousVideo) { setError('Please generate an initial video first.'); return; }
        setLoading(true); setStatus('Extending video with new scene...'); setError('');
        try {
            const data = await generateVideo(prompt, { video: previousVideo, resolution: '720p', aspectRatio: '16:9' });
            setPreviousVideo(data.video); // Update previous video to the new, longer one
            setGeneratedVideoUrl(data.url);
            setStatus('Video extended successfully! You can extend it again.');
        } catch (e: any) {
             if (e.message.includes('Requested entity was not found')) {
                setError('API key error. Please select your API key again.');
                setApiKeySelected(false);
             } else if (e.message !== 'API key not found') {
                setError(`An error occurred: ${e.message}`);
             }
        } finally { setLoading(false); }
    };
    
    if (!apiKeySelected) return (
        <div className="text-center p-6 max-w-2xl mx-auto">
            <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]"><VideoEditIcon/></div>
            <h1 className="text-3xl font-bold">Video Editor</h1>
            <h3 className="text-xl font-bold mt-4 mb-2">API Key Required</h3>
            <p className="mb-4 text-[hsl(var(--muted-foreground))]">Video generation requires you to select your own API key. Please ensure your project has billing enabled.</p>
            <button onClick={async () => { if ((window as any).aistudio) { await (window as any).aistudio.openSelectKey(); setApiKeySelected(true); }}} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2 px-4 rounded-lg hover:opacity-90">Select API Key</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm text-[hsl(var(--primary))] hover:underline">Learn more</a>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]"><VideoEditIcon/></div>
                <h1 className="text-3xl font-bold">Video Editor</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Create a video scene-by-scene with text prompts.</p>
            </div>
            <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))] space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">{previousVideo ? 'Describe the next scene:' : 'Describe the first scene:'}</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A cute cat appears and starts chasing a laser dot." className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md p-2 h-20 resize-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none" disabled={loading} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleGenerateFirstVideo} disabled={loading} className="w-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] font-semibold py-3 rounded-lg hover:bg-[hsl(var(--accent))] disabled:opacity-50 flex items-center justify-center">
                        {loading && !previousVideo ? <Spinner size="sm" /> : 'Generate New Video'}
                    </button>
                    <button onClick={handleExtendVideo} disabled={loading || !previousVideo} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
                        {loading && previousVideo ? <Spinner size="sm" /> : 'Extend Video'}
                    </button>
                </div>
            </div>
            <div className="mt-6">
                {error && <p className="text-red-400 text-center">{error}</p>}
                <div className="aspect-video bg-[hsl(var(--background))] rounded-[var(--radius)] border border-[hsl(var(--border))] flex items-center justify-center">
                    {loading ? <div className="text-center p-8"><Spinner size="lg" /><p className="mt-2 text-[hsl(var(--muted-foreground))]">{status}</p></div>
                    : generatedVideoUrl 
                        ? <video controls autoPlay key={generatedVideoUrl} src={generatedVideoUrl} className="w-full rounded-md" />
                        : <p className="text-[hsl(var(--muted-foreground))]">Your generated video will appear here</p>
                    }
                </div>
            </div>
        </div>
    );
};
