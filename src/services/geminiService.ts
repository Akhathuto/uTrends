import { GoogleGenAI, Type, Modality, Part, VideoGenerationReferenceImage, VideoGenerationReferenceType, Chat, GroundingChunk } from "@google/genai";
import { 
    TrendingChannel, TrendingTopic, ContentIdea, MonetizationStrategy, FullReport, KeywordAnalysis, 
    ChannelAnalyticsData, ChannelGrowthPlan, SponsorshipOpportunity, BrandPitch, VideoAnalysis, RepurposedContent, ThumbnailIdea, Channel, AvatarProfile, AgentType, AgentSettings, AppChatMessage,
    Script, TrendItem
} from '../types';
import { avatarStyles, genders, shotTypes, hairStyles, eyeColors, facialHairOptions, glassesOptions } from '../data/avatarOptions';

const getAi = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY });
const ai = {
    get models() { return getAi().models; },
    get chats() { return getAi().chats; },
    get operations() { return getAi().operations; },
    get live() { return getAi().live; }
};

const parseJsonResponse = <T>(text: string | undefined | null, fallback: T): T => {
    try {
        if (!text) {
             console.warn("No content found in response text, returning fallback.");
             return fallback;
        }

        const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonStr = match ? match[1] : text.trim();

        if (!jsonStr) {
             console.warn("No content found in response text, returning fallback.");
             return fallback;
        }

        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response:", e, "Response text:", text);
        return fallback;
    }
};

export async function getRealtimeTrends(plan: string, country: string): Promise<{ channels: TrendingChannel[], topics: TrendingTopic[] }> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Get the top 4 trending YouTube and TikTok channels and topics in ${country}. The user is on the ${plan} plan. Free plan users see less.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    channels: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                platform: { type: Type.STRING, enum: ['YouTube', 'TikTok'] },
                                channel_url: { type: Type.STRING }
                            },
                            required: ["name", "platform", "channel_url"],
                        }
                    },
                    topics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                platform: { type: Type.STRING, enum: ['YouTube', 'TikTok'] },
                                description: { type: Type.STRING }
                            },
                            required: ["name", "platform", "description"],
                        }
                    }
                }
            }
        }
    });
    return parseJsonResponse(response.text, { channels: [], topics: [] });
}

export async function getTrendingContent(contentType: string, plan: string, country: string, category: string, platform: 'YouTube' | 'TikTok'): Promise<any[]> {
    const videoSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, channelName: { type: Type.STRING }, videoUrl: { type: Type.STRING }, thumbnailUrl: { type: Type.STRING }, viewCount: { type: Type.STRING }, publishedTime: { type: Type.STRING }, }, required: ["title", "channelName", "videoUrl", "thumbnailUrl", "viewCount", "publishedTime"] } };
    const musicSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { trackTitle: { type: Type.STRING }, artistName: { type: Type.STRING }, videosUsingSound: { type: Type.STRING }, reason: { type: Type.STRING }, }, required: ["trackTitle", "artistName", "videosUsingSound", "reason"] } };
    const creatorSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, category: { type: Type.STRING }, subscriberCount: { type: Type.STRING }, channelUrl: { type: Type.STRING }, reason: { type: Type.STRING }, }, required: ["name", "category", "subscriberCount", "channelUrl", "reason"] } };
    const topicSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, platform: { type: Type.STRING, enum: ['YouTube', 'TikTok'] }, description: { type: Type.STRING } }, required: ["name", "platform", "description"], } };
    let schema;
    switch (contentType) {
        case 'videos': schema = videoSchema; break;
        case 'music': schema = musicSchema; break;
        case 'creators': schema = creatorSchema; break;
        case 'topics': schema = topicSchema; break;
        default: schema = { type: Type.ARRAY, items: { type: Type.OBJECT } };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List the top 8 trending ${contentType} on ${platform} for the ${category} category in ${country}. User is on ${plan} plan.`,
        config: { responseMimeType: 'application/json', responseSchema: schema }
    });
    return parseJsonResponse(response.text, []);
}

export async function findTrends(term: string, platform: 'YouTube' | 'TikTok' | 'Both', country: string, category: string): Promise<any> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze and summarize the current trends for "${term}" on ${platform} in ${country} for the ${category} category. Provide content ideas and relevant insights.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return response; // Return the full response object to access grounding metadata
}

export async function generateContentIdeas(topic: string, platform: 'YouTube' | 'TikTok' | 'Both', plan: string): Promise<ContentIdea[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 viral content ideas for a ${platform} creator on the topic of "${topic}". The user is on the ${plan} plan. For each idea, provide a catchy title, a strong hook, a 3-5 step script outline, relevant hashtags, and a virality potential score out of 10 with a short reasoning.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        hook: { type: Type.STRING },
                        script_outline: { type: Type.ARRAY, items: { type: Type.STRING } },
                        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        virality_potential: {
                            type: Type.OBJECT,
                            properties: { score: { type: Type.INTEGER }, reasoning: { type: Type.STRING } },
                            required: ['score', 'reasoning']
                        }
                    },
                    required: ['title', 'hook', 'script_outline', 'hashtags', 'virality_potential']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateVideoScript(idea: ContentIdea): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Using Pro for higher quality scripts
        contents: `Write a full video script based on this idea:\nTitle: ${idea.title}\nHook: ${idea.hook}\nOutline: ${idea.script_outline.join(', ')}. The script should be engaging and production-ready, including visual cues and camera directions. Make it sound natural for a person to speak.`,
    });
    return response.text;
}

export async function getMonetizationStrategies(platform: 'YouTube' | 'TikTok', followers: number): Promise<MonetizationStrategy[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List 3-4 relevant monetization strategies for a ${platform} creator with ${followers} followers. For each strategy, provide a description, requirements, and earning potential.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        strategy: { type: Type.STRING },
                        description: { type: Type.STRING },
                        requirements: { type: Type.STRING },
                        potential: { type: Type.STRING }
                    },
                    required: ['strategy', 'description', 'requirements', 'potential']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateFullReport(topic: string, followers: number): Promise<FullReport> {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Pro for better quality reports
        contents: `Create a comprehensive content strategy report for the topic "${topic}" for a creator with ${followers} followers. Include a detailed trend analysis, 5 creative content ideas (with hook, outline, hashtags, and virality score), and 3 relevant monetization strategies with actionable steps.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    trendAnalysis: { type: Type.STRING },
                    contentIdeas: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING }, hook: { type: Type.STRING }, script_outline: { type: Type.ARRAY, items: { type: Type.STRING } }, hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
                                virality_potential: { type: Type.OBJECT, properties: { score: { type: Type.INTEGER }, reasoning: { type: Type.STRING } }, required: ['score', 'reasoning'] }
                            },
                            required: ['title', 'hook', 'script_outline', 'hashtags', 'virality_potential']
                        }
                    },
                    monetizationStrategies: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { strategy: { type: Type.STRING }, description: { type: Type.STRING }, requirements: { type: Type.STRING }, potential: { type: Type.STRING } },
                            required: ['strategy', 'description', 'requirements', 'potential']
                        }
                    }
                },
                required: ['trendAnalysis', 'contentIdeas', 'monetizationStrategies']
            }
        }
    });
    return parseJsonResponse(response.text, { 
        trendAnalysis: '', 
        contentIdeas: [], 
        monetizationStrategies: [],
        conclusion: ''
    });
}

export async function extendVideo(prompt: string, previousVideo: any, aspectRatio: string): Promise<any> {
    const localAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return await localAi.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt,
        video: previousVideo,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio as "16:9" | "9:16",
        }
    });
}

export async function generateAnimation(prompt: string, style: string, aspectRatio: string, resolution: string): Promise<any> {
    const localAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = `An animated video in a ${style} style showing: ${prompt}`;
    return await localAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: { 
            numberOfVideos: 1,
            aspectRatio: aspectRatio as "16:9" | "9:16",
            resolution: resolution as "1080p" | "720p",
        }
    });
}

export async function generateGif(prompt: string): Promise<any> {
    const localAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fullPrompt = `A short, seamlessly looping GIF of: ${prompt}`;
     return await localAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        config: { numberOfVideos: 1 }
    });
}

export async function editVideo(prompt: string, image: { imageBytes: string, mimeType: string }): Promise<any> {
    const localAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return await localAi.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image,
        config: { numberOfVideos: 1 }
    });
}

export async function checkVideoStatus(operation: any): Promise<any> {
    const localAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return await localAi.operations.getVideosOperation({ operation });
}

export async function generateTranscriptFromPrompt(prompt: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this video prompt: "${prompt}", write a concise and engaging voiceover script/transcript. It should be written in a natural, spoken style.`,
    });
    return response.text;
}

export async function getTickerTrends(): Promise<string[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: "List 10 current, very specific and interesting trending topics on social media (YouTube, TikTok, X). Output as a simple JSON array of strings.",
        config: { 
            responseMimeType: "application/json",
            responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function getChannelSnapshots(channels: Channel[]): Promise<any[]> {
    if (channels.length === 0) return [];
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `For the following channels, provide an estimated follower count, total views, a 7-day view growth percentage, and a follower/view trend ('up', 'down', 'stable'). Use Google Search. Channels: ${JSON.stringify(channels.map(c => ({ id: c.id, url: c.url, platform: c.platform })))}. Your response must be a valid JSON array of objects, where each object corresponds to a channel and has the following keys: 'id', 'followerCount', 'totalViews', 'weeklyViewGrowth', 'followerTrend', 'viewsTrend'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateContentPrompt(topic: string, audience: string, style: string, elements: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create an optimized, detailed prompt for an AI video generator. Topic: ${topic}. Audience: ${audience}. Style: ${style}. Key Elements: ${elements}.`,
    });
    return response.text;
}

export async function getKeywordAnalysis(keyword: string): Promise<KeywordAnalysis> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the keyword "${keyword}" for a content creator. Provide search volume and competition ('Very High', 'High', 'Medium', 'Low', 'Very Low'), 5 related long-tail keywords, and 3 content ideas.`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    searchVolume: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },
                    competition: { type: Type.STRING, enum: ['Very High', 'High', 'Medium', 'Low', 'Very Low'] },
                    relatedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                    contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['searchVolume', 'competition', 'relatedKeywords', 'contentIdeas']
            }
        }
    });
    return parseJsonResponse(response.text, { 
        keyword: keyword,
        searchVolume: 'Medium', 
        competition: 'Medium', 
        relatedKeywords: [], 
        contentIdeas: [] 
    });
}

export async function getChannelAnalytics(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelAnalyticsData> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the ${platform} channel at ${channelUrl}. Provide channel name, subscriber/follower count, total views, video count, average views per video, engagement rate, top 3 videos (title, views, url), and growth insights. Use Google Search. Your response must be a single valid JSON object with keys: 'channelName', 'subscriberCount', 'totalViews', 'videoCount', 'averageViewsPerVideo', 'engagementRate', 'topVideos', 'growthInsights'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { 
        channelName: 'N/A', 
        subscriberCount: 'N/A', 
        totalViews: 'N/A', 
        videoCount: 'N/A', 
        averageViewsPerVideo: 'N/A', 
        engagementRate: 'N/A', 
        topVideos: [], 
        growthInsights: 'Analysis failed. Please try again.' 
    } as ChannelAnalyticsData);
}

export async function generateChannelOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<string[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the ${platform} channel at ${channelUrl}, provide 3 specific, actionable growth opportunities. Your response must be a valid JSON array of strings.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateImage(prompt: string, aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'): Promise<string> {
    const ai = getAi();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, aspectRatio },
    });
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function generateVideo(prompt: string, config: { duration?: number; resolution?: '720p' | '1080p'; aspectRatio?: '16:9' | '9:16'; video?: any }): Promise<{ url: string; video: any }> {
    const ai = getAi();
    let operation = await ai.models.generateVideos({
        model: config.video ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview',
        prompt,
        video: config.video,
        config: { 
            numberOfVideos: 1, 
            resolution: config.resolution || '1080p', 
            aspectRatio: config.aspectRatio || '16:9' 
        },
    });
    
    while (!operation.done) {
        await new Promise(r => setTimeout(r, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }

    const video = operation.response?.generatedVideos?.[0]?.video;
    if (video) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        const separator = video.uri.includes('?') ? '&' : '?';
        return {
            url: `${video.uri}${separator}key=${apiKey}`,
            video: video
        };
    }
    throw new Error("Video generation completed, but no video was returned.");
}

export async function editImage(prompt: string, originalImage: { base64: string; mimeType: string }): Promise<string> {
    const imagePart = {
        inlineData: {
            data: originalImage.base64,
            mimeType: originalImage.mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
    }
    
    throw new Error("No image was generated. The model may not have been able to fulfill the request.");
}

export async function generateCommentReplies(comment: string, tone: string): Promise<string> {
    const prompt = `Generate 3 reply options for the following comment. The tone of the replies should be ${tone}.\n\nComment: "${comment}"\n\nReply Options:`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
}

export async function enhanceImagePrompt(idea: string): Promise<string> {
    const prompt = `I need to generate an image for my content. My basic idea is: "${idea}".\n\nEnhance this into a detailed, descriptive prompt for an AI image generator like Imagen or Midjourney. Include details about style (e.g., photorealistic, cartoon, watercolor), lighting (e.g., cinematic, soft), composition (e.g., wide shot, close-up), and mood. Provide 3 distinct prompt options.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
}

export function createChat(systemInstruction: string): Chat {
    return ai.chats.create({
        model: 'gemini-3.1-pro-preview',
        config: {
            systemInstruction,
        },
    });
}

export async function repurposeContent(sourceText: string): Promise<RepurposedContent> {
    const prompt = `Based on the following text, repurpose it into four formats: a blog post, a tweet thread (series of short tweets), three Instagram captions, and a LinkedIn post. The tone should be engaging and professional.\n\nSource Text:\n${sourceText}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    blogPost: { type: Type.STRING },
                    twitterThread: { type: Type.ARRAY, items: { type: Type.STRING } },
                    instagramCaptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    linkedInPost: { type: Type.STRING }
                },
                required: ['blogPost', 'twitterThread', 'instagramCaptions', 'linkedInPost']
            }
        }
    });

    return parseJsonResponse(response.text, {
        blogPost: '',
        twitterThread: [],
        instagramCaptions: [],
        linkedInPost: ''
    });
}

export async function analyzeVideoFrames(prompt: string, frames: { mimeType: string; data: string }[]): Promise<string> {
    const imageParts = frames.map(frame => ({ inlineData: { mimeType: frame.mimeType, data: frame.data } }));
    const textPart = { text: prompt };
    const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-pro', 
        contents: { parts: [textPart, ...imageParts] } 
    });
    return response.text;
}

export async function analyzeChannelStrategy(channelName: string): Promise<string> {
    const prompt = `Provide a competitor analysis for a YouTube channel focused on "${channelName}". Based on public knowledge, analyze their likely content strategy, strengths, weaknesses, and provide 3 actionable growth opportunities for a new channel entering this niche.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
}

export async function generateScript(topic: string, duration: string): Promise<Script> {
    const prompt = `
        Create a YouTube video script about "${topic}".
        The target video duration is approximately ${duration} minutes.
        The script should be engaging, well-structured, and easy to follow.
        Include a catchy title, a strong hook, an introduction, 3-4 main points, a conclusion, and a call to action.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "A catchy and SEO-friendly title." },
                    hook: { type: Type.STRING, description: "A strong opening hook (1-2 sentences) to grab viewer attention." },
                    introduction: { type: Type.STRING, description: "A brief introduction to the topic." },
                    main_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of strings, each being a detailed paragraph for a main point." },
                    conclusion: { type: Type.STRING, description: "A summary of the main points." },
                    call_to_action: { type: Type.STRING, description: "A call to action, e.g., asking viewers to like, subscribe, or comment." }
                },
                required: ['title', 'hook', 'introduction', 'main_points', 'conclusion', 'call_to_action']
            },
        },
    });
    
    return parseJsonResponse(response.text, {
        title: "Untitled Script",
        hook: "",
        introduction: "",
        main_points: [],
        conclusion: "",
        call_to_action: ""
    });
}

export async function getGrowthPlan(channelDescription: string): Promise<string> {
    const prompt = `
        Create a detailed growth plan for a content creator with the following channel: "${channelDescription}".

        The plan should cover the next 3 months and include:
        1.  **Content Strategy:** Suggest 3 specific content pillars or series ideas.
        2.  **Audience Engagement:** Provide 2 unique ways to engage with the community.
        3.  **Collaboration:** Suggest one type of collaboration partner that would be a good fit.
        4.  **Promotion:** Outline a simple cross-promotion strategy for one other social media platform.
        5.  **Key Metrics:** List 3 key metrics they should track to measure success.

        Format the response in clear, actionable Markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function getMonetizationGuide(platform: string, followers: string): Promise<string> {
    const prompt = `
        You are a creator economy expert. A content creator is seeking monetization advice.
        Their primary platform is ${platform} and they have ${followers} followers/subscribers.

        Based on this information, provide a tailored monetization guide. The guide should include:
        1.  **Immediate Opportunities:** At least 2 strategies they can implement right now, suitable for their current audience size.
        2.  **Mid-Term Goals (Next 6-12 months):** At least 2 strategies to work towards as their audience grows.
        3.  **Long-Term Vision:** At least 1 ambitious, long-term monetization strategy.
        4.  **Actionable First Step:** For one of the "Immediate Opportunities", provide a concrete first step they can take this week.

        Explain why each strategy is a good fit for their platform and audience size. Format the response in clean Markdown.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });
    return response.text;
}

export async function getTrends(topic: string): Promise<{ text: string; sources: GroundingChunk[] }> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `What are the latest trending topics and rising content ideas related to ${topic} for YouTube and TikTok?`,
        config: { tools: [{ googleSearch: {} }] },
    });
    
    return {
        text: response.text,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
}

export async function getKeywordResearch(keyword: string): Promise<string> {
    const prompt = `Provide a detailed keyword analysis for "${keyword}". Include estimated search volume (High, Medium, Low), competition level (High, Medium, Low), and a list of at least 10 related long-tail keywords and content ideas.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
    return response.text;
}

export async function generateDashboardTip(channels: Channel[]): Promise<string> {
    const channelInfo = channels.length > 0 ? `The user's channels are: ${JSON.stringify(channels.map(c => c.url))}` : "The user has not connected any channels yet.";
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate one unique, actionable tip of the day for a content creator. ${channelInfo}. The tip should be creative and insightful.`,
    });
    return response.text;
}

export async function getCreatorTip(): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Provide a single, concise, and actionable tip for a content creator. The tip should be no more than two sentences long.',
    });
    return response.text;
}

export async function getDashboardTrends(): Promise<TrendItem[]> {
    const prompt = `
        Find the top 4 trending videos or content pieces right now from top creators on major social media platforms like YouTube and TikTok.
        For each, provide a direct URL to view the content.
        You MUST format your response as a single, valid JSON array of objects. Do not include any text, markdown formatting, or explanations outside of the JSON array itself.
        The JSON array should have this structure:
        [{"title": "Content Title", "creator": "Creator Name", "platform": "Platform", "reasonForTrending": "Brief reason.", "url": "https://..."}]
    `;

    const response = await ai.models.generateContent({ 
        model: 'gemini-2.5-pro', 
        contents: prompt, 
        config: { tools: [{ googleSearch: {} }] } 
    });
    
    return parseJsonResponse(response.text, []);
}

export async function generateTrendIdeas(trendTitle: string, creator: string): Promise<string> {
    const prompt = `Based on the trending topic "${trendTitle}" by ${creator}, generate 3 unique and engaging video ideas. Format as a simple numbered list.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
    return response.text;
}

export async function generateChannelGrowthPlan(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<ChannelGrowthPlan> {
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', // Pro for better analysis
        contents: `Create a detailed channel growth plan for the ${platform} channel at ${channelUrl}. Analyze and provide recommendations for: Content Strategy, SEO & Discoverability, Audience Engagement, and Thumbnail Critique. For each section, provide an 'analysis' text and a 'recommendations' array of strings. Your response must be a valid JSON object.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { 
        contentStrategy: 'Analysis failed. Please try again.',
        seoOptimization: 'Analysis failed. Please try again.',
        engagementTactics: 'Analysis failed. Please try again.',
        monetizationRoadmap: 'Analysis failed. Please try again.',
        thumbnailCritique: 'Analysis failed. Please try again.'
    } as ChannelGrowthPlan);
}

export async function findSponsorshipOpportunities(channelUrl: string, platform: 'YouTube' | 'TikTok'): Promise<SponsorshipOpportunity[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the content of the ${platform} channel at ${channelUrl}, find 5 potential brand sponsors. For each, provide brand name, industry, a brief explanation of relevance, and a sponsor match score out of 100. Your response must be a valid JSON array of objects.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateBrandPitch(channelName: string, platform: 'YouTube' | 'TikTok', brandName: string, industry: string): Promise<BrandPitch> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a professional sponsorship pitch email from the creator of the ${platform} channel "${channelName}" to the brand "${brandName}" in the ${industry} industry. Provide a 'subject' and a 'body'.`,
        config: { responseMimeType: "application/json", responseSchema: { type: Type.OBJECT, properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } } } }
    });
    return parseJsonResponse(response.text, { subject: '', body: '' });
}

export async function analyzeVideoUrl(url: string): Promise<VideoAnalysis> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the video at this URL: ${url}. Provide the video title, an AI summary, a content analysis (what makes it good/bad), an engagement analysis (why people are reacting), and an array of 3-4 specific improvement suggestions. Your response must be a valid JSON object.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { 
        summary: 'Could not analyze the video. Please check the URL and try again.', 
        keyPoints: [], 
        audienceSentiment: 'N/A', 
        improvementSuggestions: [] 
    } as VideoAnalysis);
}

export async function repurposeVideoContent(url: string): Promise<RepurposedContent> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Watch the video at ${url} and repurpose its content into a blog post, a tweet thread (as an array of strings), and a LinkedIn post. Your response must be a valid JSON object with keys 'blogPost', 'tweetThread', and 'linkedInPost'.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    return parseJsonResponse(response.text, { 
        blogPost: '', 
        twitterThread: [], 
        instagramCaptions: [], 
        linkedInPost: '' 
    });
}

export async function generateThumbnailIdeas(title: string): Promise<ThumbnailIdea[]> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 3 distinct and click-worthy thumbnail ideas for a video titled "${title}". For each idea provide a style, text overlay, a visual description (description), a list of visual elements (visualElements), and a detailed prompt for an AI image generator to create it (imageGenPrompt).`,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { 
                        description: { type: Type.STRING },
                        visualElements: { type: Type.ARRAY, items: { type: Type.STRING } },
                        textOverlay: { type: Type.STRING },
                        style: { type: Type.STRING },
                        imageGenPrompt: { type: Type.STRING }
                    },
                    required: ['description', 'visualElements', 'textOverlay', 'style', 'imageGenPrompt']
                }
            }
        }
    });
    return parseJsonResponse(response.text, []);
}

export async function generateLogo(prompt: string, style: string, transparentBg: boolean): Promise<string> {
    const fullPrompt = `A professional logo for "${prompt}". Style: ${style}. ${transparentBg ? 'Use a transparent background.' : ''}`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function generateAvatar(gender: string, style: string, features: string, background: string, shotType: string): Promise<string> {
    const fullPrompt = `${shotType} of a ${gender} avatar. Style: ${style}. Features: ${features}. Background: ${background}. 1:1 aspect ratio.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: fullPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/png', aspectRatio: '1:1' }
    });
    return response.generatedImages[0].image.imageBytes;
}

export async function generateAvatarFromPhoto(base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [ { inlineData: { data: base64ImageData, mimeType: mimeType } }, { text: prompt } ] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    return response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data || null;
}

export async function generateRandomAvatarProfile(): Promise<AvatarProfile> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a random, interesting character profile for an AI avatar. Be creative and concise. Provide details for the following fields.
- gender: Choose from ${genders.join(', ')}.
- avatarStyle: Choose from ${avatarStyles.join(', ')}.
- hairStyle: Choose from ${hairStyles.join(', ')}.
- hairColor: A creative hair color.
- eyeColor: Choose from ${eyeColors.join(', ')}.
- facialHair: Choose from ${facialHairOptions.join(', ')}.
- glasses: Choose from ${glassesOptions.join(', ')}.
- otherFacialFeatures: A brief, interesting feature, or empty string.
- clothingTop: A top clothing item.
- clothingBottom: A bottom clothing item.
- clothingShoes: A type of shoe.
- outerwear: A type of outerwear (jacket, coat, etc.), or empty string.
- accessoriesHat: A type of hat, or empty string.
- accessoriesJewelry: A type of jewelry, or empty string.
- handheldItem: An item the avatar is holding (book, coffee, etc.), or empty string.
- extraDetails: Any other extra visual details, or empty string.
- background: A scene for the background.
- shotType: Choose from ${shotTypes.join(', ')}.
- personality: A 1-sentence personality description for conversation.
Your response must be a single, valid JSON object with exactly these keys. Do not include markdown formatting.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { gender: { type: Type.STRING }, avatarStyle: { type: Type.STRING }, hairStyle: { type: Type.STRING }, hairColor: { type: Type.STRING }, eyeColor: { type: Type.STRING }, facialHair: { type: Type.STRING }, glasses: { type: Type.STRING }, otherFacialFeatures: { type: Type.STRING }, clothingTop: { type: Type.STRING }, clothingBottom: { type: Type.STRING }, clothingShoes: { type: Type.STRING }, outerwear: { type: Type.STRING }, accessoriesHat: { type: Type.STRING }, accessoriesJewelry: { type: Type.STRING }, handheldItem: { type: Type.STRING }, extraDetails: { type: Type.STRING }, background: { type: Type.STRING }, shotType: { type: Type.STRING }, personality: { type: Type.STRING }, },
                 required: [ "gender", "avatarStyle", "hairStyle", "hairColor", "eyeColor", "facialHair", "glasses", "otherFacialFeatures", "clothingTop", "clothingBottom", "clothingShoes", "outerwear", "accessoriesHat", "accessoriesJewelry", "handheldItem", "extraDetails", "background", "shotType", "personality" ]
            }
        }
    });
    return parseJsonResponse(response.text, { 
        name: 'New Avatar',
        role: 'Assistant',
        gender: genders[0] as any, 
        appearance: {
            style: avatarStyles[0],
            hair: hairStyles[0],
            eyes: eyeColors[0],
            clothing: 'T-shirt and Jeans'
        },
        personality: 'A friendly and helpful persona.',
        background: 'Simple color background',
        shotType: shotTypes[0]
    } as AvatarProfile);
}

export async function generateCommentResponse(comment: string, tone: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a concise, engaging, and ${tone.toLowerCase()} reply to the following user comment on a video: "${comment}". The reply should encourage further engagement. Do not include your own username or signature.`,
    });
    return response.text;
}

export async function sendMessageToNolo(
    history: { role: 'user' | 'model', content: string }[],
    systemInstruction?: string,
    image?: { base64: string; mimeType: string }
): Promise<string> {
    const chatHistoryForSDK = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
    }));

    const lastMessage = chatHistoryForSDK.pop();
    if (!lastMessage || lastMessage.role !== 'user') {
        throw new Error("Last message must be from user");
    }

    const chat = ai.chats.create({
        model: 'gemini-3.1-flash-preview',
        history: chatHistoryForSDK,
        config: {
            systemInstruction: systemInstruction || `You are Nolo, an expert AI content co-pilot. Your personality is helpful, creative, and proactive. Your goal is to assist content creators. If a user's request could lead to using another tool in the app, suggest it using the format ACTION:[TOOL_NAME,"parameter"]. For example: 'That's a great topic! I can create a full strategy report for you. ACTION:[REPORT,"Keto Recipes"]'. Valid tools are: REPORT, TRENDS, IDEAS, KEYWORDS. Always be encouraging and provide actionable advice. Write your responses in a natural, spoken style, using conversational phrasing and punctuation suitable for a text-to-speech engine to read aloud.`
        }
    });

    const userMessageParts: Part[] = [];
    const textContent = lastMessage.parts[0].text || '';
    userMessageParts.push({ text: textContent });

    if (image) {
        userMessageParts.push({ inlineData: { data: image.base64, mimeType: image.mimeType } });
    }

    const result = await chat.sendMessage({ message: userMessageParts });
    return result.text;
}

async function youtubeSearch(query: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-preview',
            contents: `Use Google Search to find YouTube videos about "${query}". Return a summary of the top 3 results including title, channel, and a brief description. Format the response as a single, readable string.`,
            config: { tools: [{ googleSearch: {} }] },
        });
        return response.text ?? "I couldn't find any information on that topic.";
    } catch (error) {
        console.error("Error in youtubeSearch tool:", error);
        return "Sorry, I was unable to perform the search.";
    }
}

const availableTools: { [key: string]: (args: any) => Promise<string> } = {
    youtubeSearch: (args: { query: string }) => youtubeSearch(args.query),
};

export async function sendMessageToAgent(agent: AgentType, history: AppChatMessage[], settings: AgentSettings): Promise<AppChatMessage[]> {
    const message = history[history.length - 1].content;

    const chatHistoryForSDK = history.slice(0, -1).map(msg => {
        if (msg.role === 'tool') {
            return {
                role: 'model',
                parts: [{ functionResponse: { name: msg.toolCall!.name, response: msg.toolResult } }]
            };
        }
        return {
            role: msg.role as 'user' | 'model',
            parts: [{ text: msg.content }],
        };
    });

    const processedTools = agent.tools?.map(tool => {
        if (tool.declaration) {
            return { functionDeclarations: [tool.declaration] };
        }
        return null;
    }).filter(Boolean);

    const chat = ai.chats.create({
        model: settings.model,
        history: chatHistoryForSDK,
        config: {
            systemInstruction: agent.systemInstruction,
            temperature: settings.temperature,
            tools: processedTools && processedTools.length > 0 ? (processedTools as any) : undefined,
        },
    });

    let result = await chat.sendMessage({ message });
    let functionCalls = result.functionCalls;
    const toolMessages: AppChatMessage[] = [];

    while (functionCalls && functionCalls.length > 0) {
        const functionResponses: Part[] = [];
        for (const functionCall of functionCalls) {
            const { name, args } = functionCall;

            const toolMessage: AppChatMessage = { 
                id: self.crypto.randomUUID(),
                role: 'tool', 
                content: `Using tool: ${name}...`, 
                timestamp: new Date().toISOString(),
                toolCall: { name, args } 
            };
            toolMessages.push(toolMessage);

            let toolOutputResult: any;
            if (name in availableTools) {
                toolOutputResult = await availableTools[name](args);
            } else {
                toolOutputResult = `Error: Tool "${name}" not found.`;
            }

            functionResponses.push({
                functionResponse: { name, response: { result: toolOutputResult } }
            });

            toolMessage.toolResult = { result: toolOutputResult };
        }

        result = await chat.sendMessage({ message: functionResponses });
        functionCalls = result.functionCalls;
    }

    const finalResponse: AppChatMessage = { 
        id: self.crypto.randomUUID(),
        role: 'model', 
        content: result.text || '', 
        timestamp: new Date().toISOString() 
    };

    return [...toolMessages, finalResponse];
}

export async function generateSpeech(text: string, voiceName: string): Promise<string | null> {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
}
