import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { FileUploader } from '../components/FileUploader';
import { SearchIcon } from '../components/Icons';

interface ContentAnalyzerProps {
    initialTab?: 'video' | 'channel';
}

const FRAME_COUNT = 8;

const VideoAnalyzerTab = () => {
    const [prompt, setPrompt] = useState('Summarize this video and suggest 3 ways to improve it for better engagement.');
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleFileSelect = (file: File) => { setVideoFile(file); setAnalysis(''); setError(''); };

    const extractFrames = async (): Promise<{ mimeType: string; data: string }[]> => {
        return new Promise((resolve, reject) => {
            if (!videoRef.current || !canvasRef.current || !videoFile) return reject('Video or canvas element not ready.');
            const video = videoRef.current; const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
            const frames: { mimeType: string; data: string }[] = [];
            video.src = URL.createObjectURL(videoFile); video.muted = true;
            video.onloadedmetadata = () => {
                canvas.width = video.videoWidth; canvas.height = video.videoHeight;
                const duration = video.duration; const interval = duration / FRAME_COUNT;
                let currentTime = 0; let framesExtracted = 0;
                const captureFrame = () => {
                    if (framesExtracted >= FRAME_COUNT) { video.pause(); video.src = ''; resolve(frames); return; }
                    video.currentTime = currentTime;
                };
                video.onseeked = () => {
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const dataUrl = canvas.toDataURL('image/jpeg');
                        frames.push({ mimeType: 'image/jpeg', data: dataUrl.split(',')[1] });
                        framesExtracted++; currentTime += interval;
                        if (currentTime <= duration) { captureFrame(); } else { video.pause(); video.src = ''; resolve(frames); }
                    }
                };
                video.play().then(() => { video.pause(); captureFrame(); }).catch(reject);
            };
            video.onerror = (e) => reject(`Error loading video: ${e}`);
        });
    };

    const handleSubmit = async () => {
        if (!prompt.trim() || !videoFile) { setError('Please upload a video and enter a prompt.'); return; }
        setLoading(true); setError(''); setAnalysis('');
        try {
            const frames = await extractFrames();
            const imageParts = frames.map(frame => ({ inlineData: { mimeType: frame.mimeType, data: frame.data } }));
            const textPart = { text: prompt };
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: { parts: [textPart, ...imageParts] } });
            setAnalysis(response.text);
        } catch (e: any) { setError(`An error occurred: ${e.message}`); } 
        finally { setLoading(false); }
    };
    
    return (
        <div className="space-y-4">
            <FileUploader onFileSelect={handleFileSelect} accept="video/*" label="Upload Video File" />
             {videoFile && (<p className="text-center text-sm text-gray-400">Selected: {videoFile.name}</p>)}
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full p-2 h-20 bg-gray-900 border border-gray-600 rounded-md resize-none" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !videoFile} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Analyze Video'}
            </button>
            {loading && <div className="text-center"><Spinner /><p className="text-sm text-gray-400 mt-2">Analyzing frames...</p></div>}
            {error && <p className="text-red-400">{error}</p>}
            {analysis && <div className="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap text-gray-300">{analysis}</div>}
            <video ref={videoRef} style={{ display: 'none' }} /> <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

const ChannelAnalyzerTab = () => {
    const [channelName, setChannelName] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async () => {
        if (!channelName.trim()) { setError('Please enter a channel name or topic.'); return; }
        setLoading(true); setError(''); setAnalysis('');
        const prompt = `Provide a competitor analysis for a YouTube channel focused on "${channelName}". Based on public knowledge, analyze their likely content strategy, strengths, weaknesses, and provide 3 actionable growth opportunities for a new channel entering this niche.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setAnalysis(response.text);
        } catch (e: any) { setError(`An error occurred: ${e.message}`); } 
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="Enter competitor channel name or topic..." className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !channelName} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Analyze Channel Strategy'}
            </button>
            {loading && <div className="text-center"><Spinner /></div>}
            {error && <p className="text-red-400">{error}</p>}
            {analysis && <div className="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap text-gray-300">{analysis}</div>}
        </div>
    );
};

export const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ initialTab = 'video' }) => {
    const [activeTab, setActiveTab] = useState<'video' | 'channel'>(initialTab);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-center mb-8">
                 <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400">
                   <SearchIcon/>
                </div>
                <h1 className="text-3xl font-bold">Content Analyzer</h1>
                <p className="text-gray-400">Get AI-powered analysis of any video or channel.</p>
            </div>
            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('video')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'video' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Video Analyzer</button>
                        <button onClick={() => setActiveTab('channel')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'channel' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Channel Analyzer</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'video' ? <VideoAnalyzerTab /> : <ChannelAnalyzerTab />}
                </div>
            </div>
        </div>
    );
};
