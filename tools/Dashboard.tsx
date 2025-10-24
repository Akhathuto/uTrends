import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Tool, TrendItem } from '../types';
import { Spinner } from '../components/Spinner';
import { SparklesIcon, FileTextIcon, TargetIcon, RepeatIcon, TrendingUpIcon, SearchIcon, ThumbnailIcon, UserHexagonIcon, DollarSignIcon, NoloIcon, ExternalLinkIcon, LightbulbIcon, XIcon } from '../components/Icons';

interface DashboardProps {
    setActiveTool: (tool: Tool) => void;
}

interface IdeasState {
    loading: boolean;
    error: string;
    content: string;
    forTrend: string | null;
}

const RealtimeTrends: React.FC = () => {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ideasState, setIdeasState] = useState<IdeasState>({ loading: false, error: '', content: '', forTrend: null });

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            setError('');
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `
                    Find the top 4 trending videos or content pieces right now from top creators on major social media platforms like YouTube and TikTok.
                    For each, provide a direct URL to view the content.

                    You MUST format your response as a single, valid JSON array of objects. Do not include any text, markdown formatting, or explanations outside of the JSON array itself.
                    The JSON array should have this structure:
                    [
                      {
                        "title": "Content Title",
                        "creator": "Creator or Channel Name",
                        "platform": "Platform Name (e.g., YouTube, TikTok)",
                        "reasonForTrending": "A brief, one-sentence explanation of why this is trending (e.g., 'Went viral for a new dance challenge', 'A highly anticipated new video essay').",
                        "url": "https://www.platform.com/view/content-url"
                      }
                    ]
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: prompt,
                    config: {
                        tools: [{ googleSearch: {} }],
                    }
                });
                
                let rawJson = response.text.trim();
                if (rawJson.startsWith('```json') && rawJson.endsWith('```')) {
                    rawJson = rawJson.substring(7, rawJson.length - 3).trim();
                } else if (rawJson.startsWith('```') && rawJson.endsWith('```')) {
                    rawJson = rawJson.substring(3, rawJson.length - 3).trim();
                }
                
                const jsonResponse = JSON.parse(rawJson);
                setTrends(jsonResponse);
            } catch (e: any) {
                setError(`Failed to fetch trends: ${e.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchTrends();
    }, []);

    const handleGetIdeas = async (trend: TrendItem) => {
        setIdeasState({ loading: true, error: '', content: '', forTrend: trend.title });
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the trending topic "${trend.title}" by ${trend.creator} on ${trend.platform}, which is trending because "${trend.reasonForTrending}", generate 3 unique and engaging video ideas for a content creator. Format the ideas as a simple numbered list.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setIdeasState({ loading: false, error: '', content: response.text, forTrend: trend.title });
        } catch (e: any) {
            setIdeasState({ loading: false, error: `Failed to get ideas: ${e.message}`, content: '', forTrend: trend.title });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-48 bg-gray-100 dark:bg-gray-800 rounded-lg"><Spinner /></div>;
    if (error) return <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg">{error}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trends.map((trend, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300">
                    <h3 className="font-bold text-md text-gray-900 dark:text-white">{trend.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{trend.creator} on <span className="font-semibold">{trend.platform}</span></p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-2 flex-grow">"{trend.reasonForTrending}"</p>
                    <div className="flex gap-2 mt-4">
                        <a href={trend.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm font-semibold py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2">
                            View <ExternalLinkIcon />
                        </a>
                        <button onClick={() => handleGetIdeas(trend)} disabled={ideasState.loading && ideasState.forTrend === trend.title} className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                            Ideas <LightbulbIcon />
                        </button>
                    </div>
                    {ideasState.forTrend === trend.title && (
                        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold">Content Ideas</h4>
                                <button onClick={() => setIdeasState({ loading: false, error: '', content: '', forTrend: null })} className="text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white">
                                    <XIcon />
                                </button>
                            </div>
                            {ideasState.loading && <div className="flex justify-center"><Spinner size="sm" /></div>}
                            {ideasState.error && <p className="text-xs text-red-500 dark:text-red-400">{ideasState.error}</p>}
                            {ideasState.content && <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{ideasState.content}</p>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const quickTools = [
  { title: 'Nolo AI Chat', description: 'Brainstorm and get advice from AI assistants.', tool: 'nolo-ai', icon: <NoloIcon /> },
  { title: 'Media Generator', description: 'Create images, videos, and logos with AI.', tool: 'media-generator', icon: <SparklesIcon /> },
  { title: 'Script Writer', description: 'Generate a complete video script from a simple topic.', tool: 'script-writer', icon: <FileTextIcon /> },
  { title: 'Growth Planner', description: 'Get a custom monetization and growth strategy.', tool: 'growth-planner', icon: <TargetIcon /> },
  { title: 'Repurpose Content', description: 'Turn one piece of content into multiple formats.', tool: 'content-repurposing', icon: <RepeatIcon /> },
  { title: 'Trends & Keywords', description: 'Discover viral trends and research keywords.', tool: 'trends-keywords', icon: <TrendingUpIcon /> },
  { title: 'Content Analyzer', description: 'Get AI-powered insights on videos and channels.', tool: 'content-analyzer', icon: <SearchIcon /> },
  { title: 'Thumbnail Ideas', description: 'Generate click-worthy thumbnail concepts.', tool: 'thumbnail-ideas', icon: <ThumbnailIcon /> },
  { title: 'Avatar Studio', description: 'Design and chat with your own AI persona.', tool: 'avatar-studio', icon: <UserHexagonIcon /> },
  { title: 'Monetization Guide', description: 'Receive tailored monetization strategies.', tool: 'monetization-guide', icon: <DollarSignIcon /> }
];

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTool }) => {
    return (
        <div className="flex flex-col h-full space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">uTrends Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Your command center for content creation.</p>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Realtime Trends</h2>
                <RealtimeTrends />
            </div>

            <div>
                 <h2 className="text-2xl font-bold mb-4">Quick Tools</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Your all-in-one toolkit for content creation. What would you like to do today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {quickTools.map((item) => (
                    <button 
                        key={item.tool}
                        onClick={() => setActiveTool(item.tool as Tool)}
                        className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-left hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex items-center mb-3">
                            <div className="w-8 h-8 mr-4 text-blue-500 dark:text-blue-400">{item.icon}</div>
                            <h3 className="text-lg font-bold">{item.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};