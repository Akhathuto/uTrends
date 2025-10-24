// @google/genai Coding Guidelines:
// This file defines shared TypeScript types used across the application.

export type ToolId =
  | 'dashboard'
  | 'nolo-ai'
  | 'media-generator'
  | 'media-editor'
  | 'video-editor'
  | 'avatar-studio'
  | 'script-writer'
  | 'thumbnail-ideas'
  | 'engagement-tools'
  | 'trends-keywords'
  | 'content-analyzer'
  | 'growth-planner'
  | 'monetization-guide'
  | 'content-repurposing'
  | 'my-content'
  | 'content-calendar';

export type Tool =
  | ToolId
  | 'image-generator'
  | 'logo-creator'
  | 'video-generator'
  | 'animation-creator'
  | 'gif-creator'
  | 'trend-discovery'
  | 'keyword-research'
  | 'channel-analytics'
  | 'ai-agents'
  | 'content-generator'
  | 'strategy-report'
  | 'channel-growth-plan'
  | 'brand-connect'
  | 'repurpose-content';

export interface Script {
    title: string;
    hook: string;
    introduction: string;
    main_points: string[];
    conclusion: string;
    call_to_action: string;
}
  
export interface SavedContent {
  id: string;
  tool: string;
  title: string;
  content: Script | string | string[];
  createdAt: string;
}

export interface TrendItem {
  title: string;
  creator: string;
  platform: string;
  reasonForTrending: string;
  url: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        uri?: string;
        title?: string;
        snippet?: string;
      }[];
    }
  }
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface TaskStep {
  id: string;
  name: string;
  status: 'executing' | 'completed' | 'error';
  input: any;
  output?: any;
  error?: string;
}
