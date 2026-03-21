import React from 'react';
import { ToolId } from '../types';
import { HomeIcon, SparklesIcon, VideoEditIcon, SearchIcon, FileTextIcon, ThumbnailIcon, MessageSquarePlusIcon, RepeatIcon, TargetIcon, DollarSignIcon, UserHexagonIcon, NoloIcon, MyContentIcon, XIcon, MenuIcon, TrendingUpIcon, SettingsIcon } from './Icons';
import { UtrendLogo } from './Logo';

interface SidebarProps {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const toolConfig: { id: ToolId; name: string; icon: React.ReactNode; group: string }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <HomeIcon />, group: 'Main' },
  { id: 'nolo-ai', name: 'Nolo AI Chat', icon: <NoloIcon />, group: 'Main' },
  { id: 'ai-agents', name: 'AI Agents', icon: <UserHexagonIcon />, group: 'Main' },
  { id: 'ai-voice-copilot', name: 'Voice Co-Pilot', icon: <SparklesIcon />, group: 'Main' },
  { id: 'settings', name: 'Settings', icon: <SettingsIcon />, group: 'Main' },
  
  { id: 'media-generator', name: 'Media Generator', icon: <SparklesIcon />, group: 'Content Creation' },
  { id: 'media-editor', name: 'Image Editor', icon: <VideoEditIcon />, group: 'Content Creation' },
  { id: 'video-editor', name: 'Video Editor', icon: <VideoEditIcon />, group: 'Content Creation' },
  { id: 'avatar-studio', name: 'Avatar Studio', icon: <UserHexagonIcon />, group: 'Content Creation' },
  { id: 'script-writer', name: 'Script Writer', icon: <FileTextIcon />, group: 'Content Creation' },
  { id: 'thumbnail-ideas', name: 'Thumbnail Ideas', icon: <ThumbnailIcon />, group: 'Content Creation' },
  { id: 'engagement-tools', name: 'Engagement Tools', icon: <MessageSquarePlusIcon />, group: 'Content Creation' },

  { id: 'trends-keywords', name: 'Trends & Keywords', icon: <TrendingUpIcon />, group: 'Strategy & Growth' },
  { id: 'content-analyzer', name: 'Content Analyzer', icon: <SearchIcon />, group: 'Strategy & Growth' },
  { id: 'growth-planner', name: 'Growth Planner', icon: <TargetIcon />, group: 'Strategy & Growth' },
  { id: 'monetization-guide', name: 'Monetization Guide', icon: <DollarSignIcon />, group: 'Strategy & Growth' },
  { id: 'content-repurposing', name: 'Repurpose Content', icon: <RepeatIcon />, group: 'Strategy & Growth' },
  
  { id: 'my-content', name: 'My Content', icon: <MyContentIcon />, group: 'Library' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, setActiveTool, isOpen, setIsOpen }) => {
  const groupedTools = toolConfig.reduce((acc, tool) => {
    acc[tool.group] = acc[tool.group] || [];
    acc[tool.group].push(tool);
    return acc;
  }, {} as Record<string, typeof toolConfig>);

  return (
    <>
      <div className={`fixed z-20 inset-y-0 left-0 w-64 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--border))] flex-shrink-0 h-16">
          <div className="flex items-center">
            <UtrendLogo className="h-8 w-8 mr-3" />
            <h1 className="text-xl font-bold text-[hsl(var(--card-foreground))]">uTrends</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
            <XIcon />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {Object.entries(groupedTools).map(([group, tools]) => (
            <div key={group}>
              <h2 className="text-sm font-semibold text-[hsl(var(--muted-foreground))] tracking-wider mb-2 px-2">{group}</h2>
              <div className="space-y-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveTool(tool.id); setIsOpen(false); }}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 relative ${
                      activeTool === tool.id
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                        : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]'
                    }`}
                  >
                     {activeTool === tool.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-white rounded-r-full"></div>}
                    <div className="w-5 h-5 mr-3">{tool.icon}</div>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
       {isOpen && <div className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};