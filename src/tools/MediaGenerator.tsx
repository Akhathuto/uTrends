
import React, { useState, useEffect, useCallback } from 'react';
import Spinner from '../components/Spinner';
import { SparklesIcon, VideoEditIcon } from '../components/Icons';
import { generateImage, generateVideo } from '../services/geminiService';

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
            const finalPrompt = generatorType === 'logo-creator' 
                ? `A modern, minimalist vector logo for: "${prompt}". Simple, clean lines, on a white background.`
                : prompt;

            const data = await generateImage(finalPrompt);
            setImage(data);
        } catch (e: any) {
            setError(`Failed to generate image: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">Describe your vision</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md p-2 h-24 resize-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                    disabled={loading}
                />
            </div>
            <button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : `Generate ${generatorType === 'logo-creator' ? 'Logo' : 'Image'}`}
            </button>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="mt-4 aspect-square bg-[hsl(var(--background))] rounded-md flex items-center justify-center border border-[hsl(var(--border))]">
                {loading ? <Spinner /> : image ? <img src={image} alt="Generated media" className="max-w-full max-h-full object-contain rounded-md" /> : <p className="text-[hsl(var(--muted-foreground))]">Your generated media will appear here</p>}
            </div>
        </div>
    );
};

const VideoGenerator: React.FC<{ generatorType: 'video-generator' | 'animation-creator' | 'gif-creator' }> = ({ generatorType }) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(4);
    const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
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
    
    useEffect(() => {
        if (generatorType === 'gif-creator') {
            setAspectRatio('9:16');
        } else {
            setAspectRatio('16:9');
        }
    }, [generatorType]);


    const handleSubmit = async () => {
        if (!prompt.trim()) { setError('Please enter a prompt.'); return; }
        setLoading(true);
        setStatus('Starting video generation...');
        setError('');
        setVideoUrl(null);

        try {
            let finalPrompt = `A ${duration}-second video of: ${prompt}`;

            if (generatorType === 'animation-creator') {
                finalPrompt = `A ${duration}-second, looping 2D animation of: ${prompt}. Simple, clean art style.`;
            } else if (generatorType === 'gif-creator') {
                finalPrompt = `A ${duration}-second, looping, funny GIF of: ${prompt}.`;
            }

            const data = await generateVideo(finalPrompt, { duration, resolution, aspectRatio });
            setVideoUrl(data.url);
            setStatus('Video generated!');
        } catch (e: any) {
             if (e.message.includes('Requested entity was not found')) {
                setError('API key error. Please select your API key again.');
                setApiKeySelected(false);
             } else if (e.message !== 'API key not found') {
                setError(`An error occurred: ${e.message}`);
             }
        } finally {
            setLoading(false);
        }
    };

    if (!apiKeySelected) return (
        <div className="text-center p-6">
            <div className="inline-block bg-[hsl(var(--secondary))] p-3 rounded-full mb-2 text-[hsl(var(--primary))]"><VideoEditIcon/></div>
            <h3 className="text-xl font-bold mt-4 mb-2">API Key Required</h3>
            <p className="mb-4 text-[hsl(var(--muted-foreground))]">Video generation requires you to select your own API key. Please ensure your project has billing enabled.</p>
            <button onClick={async () => { if ((window as any).aistudio) { await (window as any).aistudio.openSelectKey(); setApiKeySelected(true); }}} className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2 px-4 rounded-lg hover:opacity-90">Select API Key</button>
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="block mt-2 text-sm text-[hsl(var(--primary))] hover:underline">Learn more</a>
        </div>
    );
    
    return (
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">Describe your scene</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A robot surfing on a giant wave of data"
                    className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md p-2 h-24 resize-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                    disabled={loading}
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">Length (4-10s)</label>
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
                        className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md p-2 focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                        disabled={loading}
                    />
                </div>
                 <div>
                    <label htmlFor="aspectRatio" className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">Aspect Ratio</label>
                    <select
                        id="aspectRatio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
                        className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md p-2.5 appearance-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                        style={{ background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.4-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-4.9-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E\') no-repeat right 0.75rem center / 0.5em', paddingRight: '2.5rem' }}
                        disabled={loading}
                    >
                        <option value="16:9">16:9 (Landscape)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="resolution" className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-1">Resolution</label>
                    <select
                        id="resolution"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value as '720p' | '1080p')}
                        className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md p-2.5 appearance-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none"
                        style={{ background: 'url(\'data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-13%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2013l128%20128c3.6%203.6%207.8%205.4%2013%205.4s9.4-1.8%2013-5.4l128-128c3.6-3.6%205.4-7.8%205.4-13%200-4.9-1.8-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E\') no-repeat right 0.75rem center / 0.5em', paddingRight: '2.5rem' }}
                        disabled={loading}
                    >
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                    </select>
                </div>
            </div>
            <button onClick={handleSubmit} disabled={loading || !prompt.trim()} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Generate Video'}
            </button>
            {error && <p className="text-red-400 text-center">{error}</p>}
            <div className="mt-4 aspect-video bg-[hsl(var(--background))] rounded-md flex items-center justify-center border border-[hsl(var(--border))]">
                {loading 
                    ? <div><Spinner /><p className="text-[hsl(var(--muted-foreground))] mt-2 text-sm">{status}</p></div> 
                    : videoUrl 
                        ? <video controls key={videoUrl} src={videoUrl} className="max-w-full max-h-full rounded-md" /> 
                        : <p className="text-[hsl(var(--muted-foreground))]">Your generated video will appear here</p>}
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
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]"><SparklesIcon /></div>
                <h1 className="text-3xl font-bold">Media Generator</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Create stunning visuals and videos with AI.</p>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                <div className="border-b border-[hsl(var(--border))]">
                    <nav className="flex space-x-1 p-2 flex-wrap justify-center" aria-label="Tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTool(tab.id)} className={`px-3 py-2 font-medium text-sm rounded-md ${activeTool === tab.id ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>{tab.name}</button>
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
