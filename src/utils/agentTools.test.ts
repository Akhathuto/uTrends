// @vitest-environment jsdom
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
    handleGenerateScript, 
    handleGenerateThumbnailIdeas, 
    handleSearchMyContent 
} from './agentTools';
import { GoogleGenAI } from '@google/genai';
import { SavedContent } from '../types';

// Mock the entire @google/genai module
vi.mock('@google/genai', () => {
    const mockGenerateContent = vi.fn();
    const GoogleGenAI = vi.fn(() => ({
        models: {
            generateContent: mockGenerateContent,
        },
    }));
    return { GoogleGenAI, mockGenerateContent };
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
// FIX: Switched from 'global' to 'window' and specified jsdom environment for browser APIs like localStorage.
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


// FIX: Make the describe block async to allow top-level await for module import.
describe('agentTools', async () => {
    // Get a reference to the mock function after it's been created
    const { mockGenerateContent } = await vi.importActual<any>('@google/genai');
    
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();
    });

    describe('handleGenerateScript', () => {
        it('should call the Gemini API with the correct parameters and return parsed JSON', async () => {
            const mockScript = { title: 'Test Script', hook: 'A great hook.' };
            mockGenerateContent.mockResolvedValue({ text: JSON.stringify(mockScript) });

            const result = await handleGenerateScript({ topic: 'testing', durationInMinutes: 3 });

            expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: process.env.API_KEY });
            expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
                model: 'gemini-2.5-pro',
                contents: expect.stringContaining('about "testing"') && expect.stringContaining('duration is approximately 3 minutes'),
                config: expect.objectContaining({
                    responseMimeType: "application/json"
                })
            }));
            expect(result).toEqual(mockScript);
        });
    });

    describe('handleGenerateThumbnailIdeas', () => {
        it('should call the Gemini API with the correct prompt and return the text', async () => {
            const mockResponse = '1. Idea one.\n2. Idea two.';
            mockGenerateContent.mockResolvedValue({ text: mockResponse });

            const result = await handleGenerateThumbnailIdeas({ videoTitle: 'My Test Video' });

            expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
                model: 'gemini-2.5-pro',
                contents: expect.stringContaining('titled "My Test Video"'),
            }));
            expect(result).toBe(mockResponse);
        });
    });

    describe('handleSearchMyContent', () => {
        it('should return an empty array if localStorage is empty', async () => {
            const result = await handleSearchMyContent({ query: 'anything' });
            expect(result).toEqual([]);
        });

        it('should filter content based on the query in the title', async () => {
            const content: SavedContent[] = [
                { id: '1', userId: 'u1', tool: 'Script', title: 'About Cats', content: '...', createdAt: '' },
                { id: '2', userId: 'u1', tool: 'Script', title: 'About Dogs', content: '...', createdAt: '' },
            ];
            localStorage.setItem('my-content', JSON.stringify(content));

            const result = await handleSearchMyContent({ query: 'Cats' });
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('About Cats');
        });

        it('should filter content based on the query in the content body', async () => {
             const content: SavedContent[] = [
                { id: '1', userId: 'u1', tool: 'Planner', title: 'Plan A', content: 'This plan is about SEO.', createdAt: '' },
                { id: '2', userId: 'u1', tool: 'Planner', title: 'Plan B', content: 'This plan is about marketing.', createdAt: '' },
            ];
            localStorage.setItem('my-content', JSON.stringify(content));
            
            const result = await handleSearchMyContent({ query: 'marketing' });
            expect(result).toHaveLength(1);
            expect(result[0].title).toBe('Plan B');
        });
    });
});