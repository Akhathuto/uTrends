import { FunctionDeclaration, GoogleGenAI, Type } from '@google/genai';
import { SavedContent } from '../types';

// --- Tool: generateScript ---
export const generateScriptTool: FunctionDeclaration = {
    name: "generateScript",
    parameters: {
        type: Type.OBJECT,
        description: "Generates a complete YouTube video script from a given topic and duration.",
        properties: {
            topic: {
                type: Type.STRING,
                description: "The topic of the video."
            },
            durationInMinutes: {
                type: Type.NUMBER,
                description: "The target duration of the video in minutes."
            }
        },
        required: ["topic", "durationInMinutes"]
    }
};

export const handleGenerateScript = async ({ topic, durationInMinutes }: { topic: string, durationInMinutes: number }): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Create a YouTube video script about "${topic}". The target video duration is approximately ${durationInMinutes} minutes. The script should be engaging, well-structured, and easy to follow. Include a catchy title, a strong hook, an introduction, 3-4 main points, a conclusion, and a call to action.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview', contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING }, hook: { type: Type.STRING }, introduction: { type: Type.STRING },
                    main_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                    conclusion: { type: Type.STRING }, call_to_action: { type: Type.STRING }
                },
                required: ['title', 'hook', 'introduction', 'main_points', 'conclusion', 'call_to_action']
            },
        },
    });
    return JSON.parse(response.text);
};

// --- Tool: generateThumbnailIdeas ---
export const generateThumbnailIdeasTool: FunctionDeclaration = {
    name: "generateThumbnailIdeas",
    parameters: {
        type: Type.OBJECT,
        description: "Generates 3 distinct and click-worthy thumbnail ideas for a given video title.",
        properties: {
            videoTitle: {
                type: Type.STRING,
                description: "The title of the video for which to generate thumbnail ideas."
            }
        },
        required: ["videoTitle"]
    }
};

export const handleGenerateThumbnailIdeas = async ({ videoTitle }: { videoTitle: string }): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `For a video titled "${videoTitle}", generate 3 distinct and click-worthy thumbnail ideas. For each idea, provide a detailed visual description including layout, imagery, text, and color scheme. Format as a numbered list.`;
    const response = await ai.models.generateContent({ model: 'gemini-3.1-pro-preview', contents: prompt });
    return response.text;
};

// --- Tool: searchMyContent ---
export const searchMyContentTool: FunctionDeclaration = {
    name: "searchMyContent",
    parameters: {
        type: Type.OBJECT,
        description: "Searches the user's saved content library for a specific topic or keyword.",
        properties: { query: { type: Type.STRING, description: "The keyword or topic to search for." } },
        required: ["query"]
    }
};

export const handleSearchMyContent = async ({ query }: { query: string }): Promise<SavedContent[]> => {
    const content = localStorage.getItem('my-content');
    if (!content) return [];
    const parsedContent: SavedContent[] = JSON.parse(content);
    return parsedContent.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (JSON.stringify(item.content).toLowerCase().includes(query.toLowerCase()))
    );
};

// --- Tool Definitions ---
export const availableTools = {
    generateScript: handleGenerateScript,
    generateThumbnailIdeas: handleGenerateThumbnailIdeas,
    searchMyContent: handleSearchMyContent,
};

export const toolDeclarations = [
    generateScriptTool,
    generateThumbnailIdeasTool,
    searchMyContentTool,
];