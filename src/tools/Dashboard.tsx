import React, { useState, useEffect } from 'react';
import { Tool, TrendItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import { 
    SparklesIcon, FileTextIcon, TargetIcon, RepeatIcon, TrendingUpIcon, SearchIcon, ThumbnailIcon, UserHexagonIcon, DollarSignIcon, 
    NoloIcon, ExternalLinkIcon, LightbulbIcon, XIcon, YouTubeIcon, TikTokIcon
} from '../components/Icons';
import { getCreatorTip, getDashboardTrends, generateTrendIdeas } from '../services/geminiService';

interface DashboardProps {
    setActiveTool: (tool: Tool) => void;
}

// --- NEW SUB-COMPONENTS ---

// 1. At a Glance Stats
const AtAGlance: React.FC = () => {
    const { getSavedContent } = useAuth();
    const savedContent = getSavedContent();

    const stats = savedContent.reduce((acc, item) => {
        if (item.tool === 'Script Writer') acc.scripts++;
        if (item.tool === 'Growth Planner') acc.plans++;
        if (item.tool === 'Thumbnail Ideas') acc.ideas++;
        return acc;
    }, { scripts: 0, plans: 0, ideas: 0 });

    const statItems = [
        { title: 'Scripts Saved', value: stats.scripts, icon: <FileTextIcon className="w-6 h-6"/> },
        { title: 'Growth Plans', value: stats.plans, icon: <TargetIcon className="w-6 h-6"/> },
        { title: 'Thumbnail Ideas', value: stats.ideas, icon: <ThumbnailIcon className="w-6 h-6"/> },
    ];

    return (
        <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-bold mb-4">At a Glance</h3>
            <div className="grid grid-cols-3 gap-4">
                {statItems.map(item => (
                    <div key={item.title} className="bg-[hsl(var(--background))] p-3 rounded-md text-center border border-[hsl(var(--border))]">
                        <div className="text-[hsl(var(--primary))] mx-auto w-8 h-8 flex items-center justify-center">{item.icon}</div>
                        <p className="text-2xl font-bold mt-2">{item.value}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">{item.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 2. Creator Tip of the Day
const CreatorTip: React.FC = () => {
    const [tip, setTip] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            try {
                const tipText = await getCreatorTip();
                setTip(tipText);
            } catch (e) {
                console.error("Failed to fetch creator tip:", e);
                setTip("Focus on creating content that genuinely excites you. Your passion is contagious and will attract a dedicated audience.");
            } finally {
                setLoading(false);
            }
        };
        fetchTip();
    }, []);

    return (
        <div className="bg-gradient-to-tr from-[hsl(var(--primary))] to-blue-600 p-6 rounded-[var(--radius)] text-white relative overflow-hidden shadow-lg">
             <div className="absolute -right-4 -bottom-4 text-white/10">
                <LightbulbIcon className="w-28 h-28" />
            </div>
            <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Creator Tip of the Day</h3>
                {loading ? <div className="h-12 flex items-center"><div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div></div> : <p className="text-sm leading-relaxed">{tip}</p>}
            </div>
        </div>
    );
};

// 3. Recent Content Preview
const RecentContent: React.FC<{ setActiveTool: (tool: Tool) => void }> = ({ setActiveTool }) => {
    const { getSavedContent } = useAuth();
    const savedContent = getSavedContent();
    const recentItems = savedContent.slice(0, 3);

    if (recentItems.length === 0) {
        return (
            <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))] text-center">
                 <h3 className="text-lg font-bold mb-2">Recent Content</h3>
                 <p className="text-sm text-[hsl(var(--muted-foreground))]">You haven't saved any content yet. Start creating!</p>
            </div>
        )
    }

    return (
        <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))]">
            <h3 className="text-lg font-bold mb-4">Recent Content</h3>
            <div className="space-y-3">
                {recentItems.map(item => (
                    <div key={item.id} className="bg-[hsl(var(--background))] p-3 rounded-md border border-[hsl(var(--border))]">
                        <p className="text-xs font-semibold text-[hsl(var(--primary))]">{item.tool}</p>
                        <p className="font-semibold truncate text-sm mt-0.5">{item.title}</p>
                    </div>
                ))}
                 <button onClick={() => setActiveTool('my-content')} className="w-full text-center text-sm font-semibold text-[hsl(var(--primary))] hover:underline mt-2 pt-2">
                    View All Content
                </button>
            </div>
        </div>
    );
};


const PlatformIcon = ({ platform }: { platform: string }) => {
    switch (platform.toLowerCase()) {
        case 'youtube': return <YouTubeIcon className="w-5 h-5 text-red-500" />;
        case 'tiktok': return <TikTokIcon className="w-5 h-5 text-white" />;
        default: return null;
    }
};

const RealtimeTrends: React.FC = () => {
    const [trends, setTrends] = useState<TrendItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ideasState, setIdeasState] = useState<{ loading: boolean; error: string; content: string; forTrend: string | null; }>({ loading: false, error: '', content: '', forTrend: null });

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            setError('');
            try {
                const trendsData = await getDashboardTrends();
                setTrends(trendsData);
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
            const ideas = await generateTrendIdeas(trend.title, trend.creator);
            setIdeasState({ loading: false, error: '', content: ideas, forTrend: trend.title });
        } catch (e: any) {
            setIdeasState({ loading: false, error: `Failed to get ideas: ${e.message}`, content: '', forTrend: trend.title });
        }
    };

    if (loading) return <div className="flex justify-center items-center h-48 bg-[hsl(var(--card))] rounded-[var(--radius)]"><Spinner /></div>;
    if (error) return <div className="p-4 bg-red-900/50 text-red-300 rounded-[var(--radius)]">{error}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trends.map((trend, index) => (
                <div key={index} className="bg-[hsl(var(--card))] p-4 rounded-[var(--radius)] border border-[hsl(var(--border))] flex flex-col group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-md text-[hsl(var(--card-foreground))] pr-2 flex-grow">{trend.title}</h3>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black flex items-center justify-center"><PlatformIcon platform={trend.platform} /></div>
                    </div>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{trend.creator}</p>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] italic mt-2 flex-grow">"{trend.reasonForTrending}"</p>
                    <div className="flex gap-2 mt-4">
                        <a href={trend.url} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] text-sm font-semibold py-2 rounded-md hover:bg-[hsl(var(--accent))] transition-colors flex items-center justify-center gap-1.5">View <ExternalLinkIcon className="w-4 h-4" /></a>
                        <button onClick={() => handleGetIdeas(trend)} disabled={ideasState.loading && ideasState.forTrend === trend.title} className="flex-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-semibold py-2 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5">Ideas <LightbulbIcon className="w-4 h-4" /></button>
                    </div>
                    {ideasState.forTrend === trend.title && (
                        <div className="mt-4 p-3 bg-[hsl(var(--background))] rounded-lg border border-[hsl(var(--border))]">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-bold">Content Ideas</h4>
                                <button onClick={() => setIdeasState({ loading: false, error: '', content: '', forTrend: null })} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"><XIcon className="w-4 h-4"/></button>
                            </div>
                            {ideasState.loading && <div className="flex justify-center"><Spinner size="sm" /></div>}
                            {ideasState.error && <p className="text-xs text-red-500">{ideasState.error}</p>}
                            {ideasState.content && <p className="text-xs text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">{ideasState.content}</p>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// FIX: Refactored to apply className directly to icons to fix cloneElement type error and improve consistency.
const quickTools = [
  { title: 'Nolo AI Chat', description: 'Brainstorm and get advice from AI assistants.', tool: 'nolo-ai', icon: <NoloIcon className="w-6 h-6" /> },
  { title: 'Media Generator', description: 'Create images, videos, and logos with AI.', tool: 'media-generator', icon: <SparklesIcon className="w-6 h-6" /> },
  { title: 'Script Writer', description: 'Generate a complete video script from a simple topic.', tool: 'script-writer', icon: <FileTextIcon className="w-6 h-6" /> },
  { title: 'Growth Planner', description: 'Get a custom monetization and growth strategy.', tool: 'growth-planner', icon: <TargetIcon className="w-6 h-6" /> },
  { title: 'Repurpose Content', description: 'Turn one piece of content into multiple formats.', tool: 'content-repurposing', icon: <RepeatIcon className="w-6 h-6" /> },
  { title: 'Trends & Keywords', description: 'Discover viral trends and research keywords.', tool: 'trends-keywords', icon: <TrendingUpIcon className="w-6 h-6" /> },
  { title: 'Content Analyzer', description: 'Get AI-powered insights on videos and channels.', tool: 'content-analyzer', icon: <SearchIcon className="w-6 h-6" /> },
  { title: 'Thumbnail Ideas', description: 'Generate click-worthy thumbnail concepts.', tool: 'thumbnail-ideas', icon: <ThumbnailIcon className="w-6 h-6" /> },
  { title: 'Avatar Studio', description: 'Design and chat with your own AI persona.', tool: 'avatar-studio', icon: <UserHexagonIcon className="w-6 h-6" /> },
  { title: 'Monetization Guide', description: 'Receive tailored monetization strategies.', tool: 'monetization-guide', icon: <DollarSignIcon className="w-6 h-6" /> }
];

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTool }) => {
    const { user } = useAuth();
    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    return (
        <div className="flex flex-col h-full space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{greeting}, {user?.name.split(' ')[0]}!</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">Your command center for content creation is ready.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <CreatorTip />
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Realtime Trends</h2>
                        <RealtimeTrends />
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <AtAGlance />
                    <RecentContent setActiveTool={setActiveTool} />
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-bold mb-4">Quick Tools</h2>
                <p className="text-[hsl(var(--muted-foreground))] mb-6">Your all-in-one toolkit for content creation. What would you like to do today?</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {quickTools.map((item) => (
                        <button 
                            key={item.tool}
                            onClick={() => setActiveTool(item.tool as Tool)}
                            className="bg-[hsl(var(--card))] p-5 rounded-[var(--radius)] border border-[hsl(var(--border))] text-left group hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] transition-all duration-300"
                        >
                            <div className="w-10 h-10 mb-4 text-[hsl(var(--primary))] bg-[hsl(var(--primary))] bg-opacity-10 dark:bg-opacity-20 flex items-center justify-center rounded-lg group-hover:scale-110 transition-transform duration-300">
                               {item.icon}
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--card-foreground))]">{item.title}</h3>
                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{item.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};