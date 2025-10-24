import React from 'react';
import { ToolId } from '../types';
import { HomeIcon, SparklesIcon, VideoEditIcon, SearchIcon, FileTextIcon, ThumbnailIcon, MessageSquarePlusIcon, RepeatIcon, TargetIcon, DollarSignIcon, UserHexagonIcon, NoloIcon, MyContentIcon, XIcon, MenuIcon, TrendingUpIcon, UTrendsIcon } from './Icons';

interface SidebarProps {
  activeTool: ToolId;
  setActiveTool: (tool: ToolId) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const toolConfig: { id: ToolId; name: string; icon: React.ReactNode; group: string }[] = [
  { id: 'dashboard', name: 'Dashboard', icon: <HomeIcon />, group: 'Main' },
  { id: 'nolo-ai', name: 'Nolo AI Chat', icon: <NoloIcon />, group: 'Main' },
  
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
      <div className={`fixed z-20 inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:flex md:flex-col`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <UTrendsIcon />
            </div>
            <h1 className="text-xl font-bold">uTrends</h1>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <XIcon />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {Object.entries(groupedTools).map(([group, tools]) => (
            <div key={group}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">{group}</h2>
              <div className="space-y-1">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => { setActiveTool(tool.id); setIsOpen(false); }}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      activeTool === tool.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="w-5 h-5 mr-3">{tool.icon}</div>
                    <span>{tool.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
       {isOpen && <div className="fixed inset-0 bg-black/50 z-10 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};