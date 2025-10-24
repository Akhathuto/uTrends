import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { SparklesIcon, VideoEditIcon } from '../components/Icons';
import { Tool } from '../types';

type GeneratorType = 'image-generator' | 'video-generator' | 'animation-creator' | 'gif-creator' | 'logo-creator';

interface MediaGeneratorProps {
    initialTool: GeneratorType;
}

const ImageGenerator: React.FC<{ generatorType: 'image-generator' | 'logo-creator' }> = ({ generatorType }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const placeholder = generatorType === 'logo-creator' 
        ? "e.g., 'A coffee shop called The Daily Grind'"
        : "e.g., 'A majestic lion wearing a crown, cinematic lighting'";

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt.');
            return;
        }
        setLoading(true);
        setError('');
        setImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const finalPrompt = generatorType === 'logo-creator' 
                ? `A modern, minimalist vector logo for: "${prompt}". Simple, clean lines, on a white background.`
                : prompt;

            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: finalPrompt,
                config: { numberOfImages: 1, aspectRatio: '1:1' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            setImage(`data:image/jpeg;base64,${base64ImageBytes}`);
        } catch (e: any) {
            setError(`Failed to generate image: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Describe your vision</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 h-24 resize-none"
                    disabled={loading}
                />
            </div>
            <button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : `Generate ${generatorType === 'logo-creator' ? 'Logo' : 'Image'}`}
            </button>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="mt-4 aspect-square bg-gray-900 rounded-md flex items-center justify-center border border-gray-600">
                {loading ? <Spinner /> : image ? <img src={image} alt="Generated media" className="max-w-full max-h-full object-contain rounded-md" /> : <p className="text-gray-500">Your generated media will appear here</p>}
            </div>
        </div>
    );
};

const VideoGenerator: React.FC<{ generatorType: 'video-generator' | 'animation-creator' | 'gif-creator' }> = ({ generatorType }) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(4);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
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
            setStatus('Checking generation status... This can take a few minutes.');
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

    const handleSubmit = async () => {
        if (!prompt.trim()) { setError('Please enter a prompt.'); return; }
        setLoading(true);
        setStatus('Starting video generation...');
        setError('');
        setVideoUrl(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let finalPrompt = `A ${duration}-second video of: ${prompt}`;
            let aspectRatio: "16:9" | "9:16" = "16:9";

            if (generatorType === 'animation-creator') {
                finalPrompt = `A ${duration}-second, looping 2D animation of: ${prompt}. Simple, clean art style.`;
            } else if (generatorType === 'gif-creator') {
                finalPrompt = `A ${duration}-second, looping, funny GIF of: ${prompt}.`;
                aspectRatio = "9:16";
            }

            const operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: finalPrompt,
                config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
            });
            
            const finalOp = await pollOperation(operation);
            const video = finalOp.response?.generatedVideos?.[0]?.video;
            if (video) {
                setVideoUrl(`${video.uri}&key=${process.env.API_KEY}`);
                setStatus('Video generated!');
            } else {
                throw new Error("Video generation completed, but no video was returned.");
            }
        } catch (e: any) {
             if (e.message !== 'API key not found') setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (!apiKeySelected) return (
        <div className="text-center p-6">
            <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400"><VideoEditIcon/></div>
            <h3 className="text-xl font-bold mt-4 mb-2">API Key Required</h3>
            <p className="mb-4 text-gray-400">Video generation requires you to select your own API key. Please ensure your project has billing enabled.</p>
            <button onClick={async () => { if ((window as any).aistudio) { await (window as any).aistudio.openSelectKey(); setApiKeySelected(true); }}} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Select API Key</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm text-blue-400 hover:underline">Learn more</a>
        </div>
    );
    
    return (
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Describe your scene</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A robot surfing on a giant wave of data"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 h-24 resize-none"
                    disabled={loading}
                />
            </div>
             <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Video Length (4-10 seconds)</label>
                <input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => {
                        const val = Math.max(4, Math.min(10, Number(e.target.value) || 4));
                        setDuration(val);
                    }}
                    min="4"
                    max="10"
                    className="w-full bg-gray-900 border border-gray-600 rounded-md p-2"
                    disabled={loading}
                />
            </div>
            <button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Generate Video'}
            </button>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="mt-4 aspect-video bg-gray-900 rounded-md flex items-center justify-center border border-gray-600">
                {loading 
                    ? <div><Spinner /><p className="text-gray-400 mt-2 text-sm">{status}</p></div> 
                    : videoUrl 
                        ? <video controls key={videoUrl} src={videoUrl} className="max-w-full max-h-full rounded-md" /> 
                        : <p className="text-gray-500">Your generated video will appear here</p>}
            </div>
        </div>
    );
};

const toolToGeneratorMap: Record<GeneratorType, 'image' | 'video'> = {
    'image-generator': 'image',
    'logo-creator': 'image',
    'video-generator': 'video',
    'animation-creator': 'video',
    'gif-creator': 'video',
};

const tabs: { id: GeneratorType; name: string }[] = [
    { id: 'image-generator', name: 'Image' },
    { id: 'video-generator', name: 'Video' },
    { id: 'animation-creator', name: 'Animation' },
    { id: 'gif-creator', name: 'GIF' },
    { id: 'logo-creator', name: 'Logo' },
];

export const MediaGenerator: React.FC<MediaGeneratorProps> = ({ initialTool }) => {
    const [activeTool, setActiveTool] = useState<GeneratorType>(initialTool);
    const activeGeneratorType = toolToGeneratorMap[activeTool];

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400"><SparklesIcon /></div>
                <h1 className="text-3xl font-bold">Media Generator</h1>
                <p className="text-gray-400">Create stunning visuals and videos with AI.</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-1 p-2 flex-wrap justify-center" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTool(tab.id)} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTool === tab.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>{tab.name}</button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    {activeGeneratorType === 'image' && <ImageGenerator generatorType={activeTool as 'image-generator' | 'logo-creator'} />}
                    {activeGeneratorType === 'video' && <VideoGenerator generatorType={activeTool as 'video-generator' | 'animation-creator' | 'gif-creator'} />}
                </div>
            </div>
        </div>
    );
};