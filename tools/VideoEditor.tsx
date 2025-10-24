import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateVideosOperation, Video } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { VideoEditIcon } from '../components/Icons';

export const VideoEditor = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [previousVideo, setPreviousVideo] = useState<Video | null>(null);
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

    const pollOperation = async (op: GenerateVideosOperation) => {
        let currentOp = op;
        while (!currentOp.done) {
            await new Promise(r => setTimeout(r, 10000));
            setStatus('Checking generation status...');
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                currentOp = await ai.operations.getVideosOperation({ operation: currentOp });
            } catch (e: any) {
                if (e.message?.includes('Requested entity was not found')) {
                    setError('API key error. Please select your API key again.');
                    setApiKeySelected(false);
                    throw new Error('API key not found');
                }
                throw e;
            }
        }
        return currentOp;
    };

    const handleGenerateFirstVideo = async () => {
        if (!prompt.trim()) { setError('Please enter a prompt for the initial scene.'); return; }
        setLoading(true); setStatus('Generating initial video...'); setError(''); setGeneratedVideoUrl(null); setPreviousVideo(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const initialOp = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview', prompt: `A 4-second video of: ${prompt}`,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' },
            });
            const finalOp = await pollOperation(initialOp);
            const video = finalOp.response?.generatedVideos?.[0]?.video;
            if (video) {
                setPreviousVideo(video);
                setGeneratedVideoUrl(`${video.uri}&key=${process.env.API_KEY}`);
                setStatus('Initial video generated. Now describe what happens next.');
            } else { throw new Error("Video generation completed, but no video was returned."); }
        } catch (e: any) {
            if (e.message !== 'API key not found') setError(`An error occurred: ${e.message}`);
        } finally { setLoading(false); }
    };

    const handleExtendVideo = async () => {
        if (!prompt.trim()) { setError('Please describe what should happen next.'); return; }
        if (!previousVideo) { setError('Please generate an initial video first.'); return; }
        setLoading(true); setStatus('Extending video with new scene...'); setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const extendOp = await ai.models.generateVideos({
                model: 'veo-3.1-generate-preview', prompt, video: previousVideo,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
            });
            const finalOp = await pollOperation(extendOp);
            const video = finalOp.response?.generatedVideos?.[0]?.video;
            if (video) {
                setPreviousVideo(video); // Update previous video to the new, longer one
                setGeneratedVideoUrl(`${video.uri}&key=${process.env.API_KEY}`);
                setStatus('Video extended successfully! You can extend it again.');
            } else { throw new Error("Video extension completed, but no video was returned."); }
        } catch (e: any) {
             if (e.message !== 'API key not found') setError(`An error occurred: ${e.message}`);
        } finally { setLoading(false); }
    };
    
    if (!apiKeySelected) return (
        <div className="text-center p-6 max-w-2xl mx-auto">
            <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400"><VideoEditIcon/></div>
            <h1 className="text-3xl font-bold">Video Editor</h1>
            <h3 className="text-xl font-bold mt-4 mb-2">API Key Required</h3>
            <p className="mb-4 text-gray-400">Video generation requires you to select your own API key. Please ensure your project has billing enabled.</p>
            <button onClick={async () => { if ((window as any).aistudio) { await (window as any).aistudio.openSelectKey(); setApiKeySelected(true); }}} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Select API Key</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm text-blue-400 hover:underline">Learn more</a>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400"><VideoEditIcon/></div>
                <h1 className="text-3xl font-bold">Video Editor</h1>
                <p className="text-gray-400">Create a video scene-by-scene with text prompts.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">{previousVideo ? 'Describe the next scene:' : 'Describe the first scene:'}</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., A cute cat appears and starts chasing a laser dot." className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 h-20 resize-none" disabled={loading} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={handleGenerateFirstVideo} disabled={loading} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-500 flex items-center justify-center">
                        {loading && !previousVideo ? <Spinner size="sm" /> : 'Generate New Video'}
                    </button>
                    <button onClick={handleExtendVideo} disabled={loading || !previousVideo} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center">
                        {loading && previousVideo ? <Spinner size="sm" /> : 'Extend Video'}
                    </button>
                </div>
            </div>
            <div className="mt-6">
                {error && <p className="text-red-400 text-center">{error}</p>}
                {loading && <div className="text-center p-8"><Spinner size="lg" /><p className="mt-2 text-gray-400">{status}</p></div>}
                {generatedVideoUrl && !loading && <video controls key={generatedVideoUrl} src={generatedVideoUrl} className="w-full rounded-md" />}
            </div>
        </div>
    );
};
