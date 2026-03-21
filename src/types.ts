import type React from 'react';

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
  | 'content-calendar'
  | 'ai-agents'
  | 'ai-voice-copilot'
  | 'settings';

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
  content: Script | string | string[] | ThumbnailIdea[];
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

export interface TaskStep {
  id: string;
  name: string;
  status: 'executing' | 'completed' | 'error';
  input: any;
  output?: any;
  error?: string;
}

export type PlanName = 'free' | 'starter' | 'pro';
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanName;
  role: UserRole;
  country?: string;
  phone?: string;
  company?: string;
  channels?: Channel[];
}

export interface Channel {
  id: string;
  platform: 'YouTube' | 'TikTok' | string;
  url: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  icon: string;
  timestamp: string;
}

export interface KeywordUsage {
    count: number;
    resetDate: string;
}

export interface HistoryItem {
    id: string;
    timestamp: string;
    type: HistoryContentType;
    summary: string;
    content: any;
}

export type HistoryContentType = 'Content Idea' | 'Strategy Report' | 'Video Transcript' | 'Generated Prompt' | 'Image Edit' | 'Keyword Analysis' | 'Channel Growth Plan' | 'Sponsorship Opportunities' | 'Brand Pitch' | 'Video Analysis' | 'Animation' | 'GIF' | 'Logo' | 'Generated Image' | 'Generated Video' | 'Repurposed Content' | 'Thumbnail Idea' | 'Comment Reply' | 'Avatar' | 'Avatar Conversation';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string, plan: PlanName) => Promise<void>;
  logout: () => void;
  upgradePlan: (plan: 'starter' | 'pro') => void;
  getAllUsers: () => User[];
  updateUser: (userId: string, updates: Partial<Pick<User, 'plan' | 'role'>>) => void;
  updateProfile: (userId: string, updates: Partial<Pick<User, 'name' | 'email' | 'country' | 'phone' | 'company' | 'channels'>>) => Promise<void>;
  logActivity: (action: string, icon: string) => void;
  getAllActivities: () => ActivityLog[];
  deleteUser: (userId: string) => void;
  getKeywordUsage: () => { remaining: number; limit: number | 'unlimited' };
  logKeywordAnalysis: () => void;
  getContentHistory: () => HistoryItem[];
  addContentToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
}

export interface Plan {
  name: string;
  price: string;
  pricePeriod: string;
  description: string;
  features: string[];
  isFeatured?: boolean;
}

export enum Tab {
  Dashboard = 'dashboard',
  Trends = 'trends',
  Keywords = 'keywords',
  Analytics = 'analytics',
  Chat = 'chat',
  Agents = 'agents',
  AIVoiceCoPilot = 'ai-voice-copilot',
  Ideas = 'ideas',
  Video = 'video',
  Monetization = 'monetization',
  Report = 'report',
  ChannelGrowth = 'channel-growth',
  BrandConnect = 'brand-connect',
  Profile = 'profile',
  Pricing = 'pricing',
  Admin = 'admin',
  Support = 'support',
  Contact = 'contact',
  About = 'about',
  Terms = 'terms',
  License = 'license',
  ContentHistory = 'content-history',
  VideoAnalyzer = 'video-analyzer',
  RepurposeContent = 'repurpose-content',
  Prompt = 'prompt',
  AnimationCreator = 'animation-creator',
  GifCreator = 'gif-creator',
  ImageEditor = 'image-editor',
  LogoCreator = 'logo-creator',
  ImageGenerator = 'image-generator',
  AvatarCreator = 'avatar-creator',
  VideoEditor = 'video-editor',
  ThumbnailGenerator = 'thumbnail-generator',
  CommentResponder = 'comment-responder',
  Affiliate = 'affiliate',
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface TrendingChannel {
    name: string;
    platform: 'YouTube' | 'TikTok';
    channel_url: string;
}

export interface TrendingTopic {
    name: string;
    platform: 'YouTube' | 'TikTok';
    description: string;
}

export interface TrendingVideo {
    title: string;
    channelName: string;
    videoUrl: string;
    thumbnailUrl: string;
    viewCount: string;
    publishedTime: string;
}

export interface TrendingMusic {
    trackTitle: string;
    artistName: string;
    videosUsingSound: string;
    reason: string;
}

export interface TrendingCreator {
    name: string;
    category: string;
    subscriberCount: string;
    channelUrl: string;
    reason: string;
}

export interface ContentIdea {
    title: string;
    hook: string;
    script_outline: string[];
    hashtags: string[];
    virality_potential: {
        score: number;
        reasoning: string;
    };
}

export interface MonetizationStrategy {
    strategy: string;
    description: string;
    requirements: string;
    potential: string;
}

export interface FullReport {
    trendAnalysis: string;
    contentIdeas: ContentIdea[];
    monetizationStrategies: MonetizationStrategy[];
    conclusion: string;
}

export interface KeywordAnalysis {
    keyword: string;
    searchVolume: string;
    competition: 'Low' | 'Medium' | 'High';
    relatedKeywords: string[];
    contentIdeas: string[];
}

export interface ChannelAnalyticsData {
    channelName: string;
    subscriberCount: string;
    totalViews: string;
    videoCount: string;
    averageViewsPerVideo: string;
    engagementRate: string;
    topVideos: { title: string; views: string; url: string }[];
    growthInsights: string;
}

export interface ChannelGrowthPlan {
    contentStrategy: string;
    seoOptimization: string;
    engagementTactics: string;
    monetizationRoadmap: string;
    thumbnailCritique: string;
}

export interface SponsorshipOpportunity {
    brandName: string;
    industry: string;
    whyFit: string;
    estimatedValue: string;
    contactStrategy: string;
}

export interface BrandPitch {
    subject: string;
    body: string;
}

export interface VideoAnalysis {
    summary: string;
    keyPoints: string[];
    audienceSentiment: string;
    improvementSuggestions: string[];
}

export interface RepurposedContent {
    blogPost: string;
    twitterThread: string[];
    instagramCaptions: string[];
    linkedInPost: string;
}

export interface ThumbnailIdea {
    description: string;
    visualElements: string[];
    textOverlay: string;
    style: string;
    imageGenPrompt: string;
}

export interface AvatarProfile {
    name: string;
    role: string;
    gender: 'male' | 'female' | 'non-binary';
    appearance: {
        style: string;
        hair: string;
        eyes: string;
        clothing: string;
    };
    personality: string;
    background: string;
    shotType: string;
}

export interface Agent {
    id: string;
    name: string;
    role: string;
    description: string;
    capabilities: string[];
    keywords: string[];
    starterPrompts: string[];
    color: string;
    icon: any;
    systemInstruction: string;
    isPro?: boolean;
    tools?: { name: string; declaration: any }[];
}

export type AgentType = Agent;

export interface AgentSettings {
    model: string;
    temperature: number;
    topP?: number;
    topK?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model' | 'tool';
    content: string;
    timestamp: string;
    toolCall?: { name: string; args: any };
    toolResult?: any;
}

export type AppChatMessage = ChatMessage;
