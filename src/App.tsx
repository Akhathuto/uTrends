
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { MenuIcon } from './components/Icons';
import { UtrendLogo } from './components/Logo';
import { Login } from './components/Login';
import { Loader2 } from 'lucide-react';
import { Tool, ToolId } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAuth } from './contexts/AuthContext';

// Import all tool components
import { Dashboard } from './tools/Dashboard';
import { ContentRepurposing } from './tools/ContentRepurposing';
import { GrowthPlanner } from './tools/GrowthPlanner';
import { EngagementTools } from './tools/EngagementTools';
import { AvatarStudio } from './tools/AvatarStudio';
import { MediaEditor } from './tools/MediaEditor';
import { MediaGenerator } from './tools/MediaGenerator';
import { ScriptWriter } from './tools/ScriptWriter';
import { ContentAnalyzer } from './tools/ContentAnalyzer';
import { TrendsKeywords } from './tools/TrendsKeywords';
import { NoloAI } from './tools/NoloAI';
import { MyContent } from './tools/MyContent';
import { ThumbnailIdeas } from './tools/ThumbnailIdeas';
import { VideoEditor } from './tools/VideoEditor';
import { MonetizationGuide } from './tools/MonetizationGuide';
import { ContentCalendar } from './tools/ContentCalendar';
import { Settings } from './tools/Settings';
import AIVoiceCoPilot from './components/AIVoiceCoPilot';

type Theme = 'light' | 'dark';

const App: React.FC = () => {
    const { user, loading } = useAuth();
    const [activeTool, setActiveTool] = useState<ToolId>('dashboard');
    const [initialToolState, setInitialToolState] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-[hsl(var(--background))] flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-violet-500" />
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const handleSetActiveTool = (tool: Tool) => {
        setInitialToolState(null); 

        switch (tool) {
            case 'image-generator': case 'logo-creator': case 'video-generator': case 'animation-creator': case 'gif-creator':
                setActiveTool('media-generator'); setInitialToolState({ initialTool: tool }); break;
            case 'trend-discovery': case 'keyword-research':
                setActiveTool('trends-keywords'); setInitialToolState({ initialTab: tool === 'trend-discovery' ? 'trends' : 'keywords' }); break;
            case 'channel-analytics':
                setActiveTool('content-analyzer'); setInitialToolState({ initialTab: 'channel' }); break;
            case 'nolo-ai': case 'ai-agents':
                 setActiveTool('nolo-ai'); setInitialToolState({ initialTab: tool === 'ai-agents' ? 'agents' : 'chat' }); break;
            case 'content-generator': case 'script-writer':
                setActiveTool('script-writer'); break;
            case 'strategy-report': case 'channel-growth-plan': case 'brand-connect': case 'growth-planner':
                setActiveTool('growth-planner'); break;
            case 'monetization-guide':
                setActiveTool('monetization-guide'); break;
            case 'repurpose-content': case 'content-repurposing':
                setActiveTool('content-repurposing'); break;
            default:
                setActiveTool(tool as ToolId); break;
        }
    };

    const renderActiveTool = () => {
        switch (activeTool) {
            case 'dashboard': return <Dashboard setActiveTool={handleSetActiveTool} />;
            case 'content-repurposing': return <ContentRepurposing />;
            case 'growth-planner': return <GrowthPlanner />;
            case 'engagement-tools': return <EngagementTools {...initialToolState} />;
            case 'avatar-studio': return <AvatarStudio />;
            case 'media-editor': return <MediaEditor />;
            case 'media-generator': return <MediaGenerator initialTool='image-generator' {...initialToolState} />;
            case 'script-writer': return <ScriptWriter />;
            case 'content-analyzer': return <ContentAnalyzer {...initialToolState} />;
            case 'trends-keywords': return <TrendsKeywords {...initialToolState} />;
            case 'nolo-ai': return <NoloAI {...initialToolState} setActiveTab={handleSetActiveTool as any} />;
            case 'ai-voice-copilot': return <AIVoiceCoPilot setActiveTab={handleSetActiveTool as any} />;
            case 'my-content': return <MyContent />;
            case 'thumbnail-ideas': return <ThumbnailIdeas />;
            case 'video-editor': return <VideoEditor />;
            case 'monetization-guide': return <MonetizationGuide />;
            case 'content-calendar': return <ContentCalendar />;
            case 'settings': return <Settings theme={theme} setTheme={setTheme} />;
            default: return <Dashboard setActiveTool={handleSetActiveTool} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] flex overflow-hidden">
             <Sidebar activeTool={activeTool} setActiveTool={handleSetActiveTool as (tool: ToolId) => void} isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
            <main className="flex-1 flex flex-col overflow-hidden">
                 <div className="md:hidden flex items-center justify-between p-4 bg-[hsl(var(--background))] border-b border-[hsl(var(--border))] flex-shrink-0 h-16">
                    <button onClick={() => setSidebarOpen(true)} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                        <MenuIcon />
                    </button>
                     <div className="flex items-center">
                        <UtrendLogo className="h-7 w-7 mr-2" />
                        <h1 className="text-lg font-bold">uTrends</h1>
                    </div>
                     <div className="w-8"></div>
                </div>
                <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderActiveTool()}
                </div>
            </main>
        </div>
    );
};

export default App;