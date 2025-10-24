import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Spinner } from '../components/Spinner';
import { GroundingChunk } from '../types';
import { TrendingUpIcon } from '../components/Icons';

interface TrendsKeywordsProps {
    initialTab?: 'trends' | 'keywords';
}

const TrendDiscoveryTab: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [result, setResult] = useState('');
    const [sources, setSources] = useState<GroundingChunk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!topic.trim()) { setError('Please enter a topic or niche.'); return; }
        setLoading(true); setError(''); setResult(''); setSources([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `What are the latest trending topics and rising content ideas related to ${topic} for YouTube and TikTok?`,
                config: { tools: [{ googleSearch: {} }] },
            });
            setResult(response.text);
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) setSources(chunks);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a niche, e.g., 'AI tools' or 'home cooking'" className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !topic} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Discover Trends'}
            </button>
            {loading && <div className="text-center"><Spinner /></div>}
            {error && <p className="text-red-400">{error}</p>}
            {result && (
                <div className="p-4 bg-gray-900 rounded-lg">
                    <p className="whitespace-pre-wrap text-gray-300">{result}</p>
                     {sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <h3 className="text-sm font-semibold mb-2">Sources:</h3>
                          <ul className="space-y-1">
                            {/* FIX: Add check for s.web.uri as it is optional in the GroundingChunk type. */}
                            {sources.map((s, i) => s.web && s.web.uri && <li key={i}><a href={s.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate">{s.web.title || s.web.uri}</a></li>)}
                          </ul>
                        </div>
                      )}
                </div>
            )}
        </div>
    );
};

const KeywordResearchTab: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async () => {
        if (!keyword.trim()) { setError('Please enter a keyword.'); return; }
        setLoading(true); setError(''); setResult('');
        const prompt = `Provide a detailed keyword analysis for "${keyword}". Include estimated search volume (High, Medium, Low), competition level (High, Medium, Low), and a list of at least 10 related long-tail keywords and content ideas.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
            setResult(response.text);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter a keyword, e.g., 'passive income ideas'" className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !keyword} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg disabled:bg-gray-500 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Analyze Keyword'}
            </button>
            {loading && <div className="text-center"><Spinner /></div>}
            {error && <p className="text-red-400">{error}</p>}
            {result && <div className="p-4 bg-gray-900 rounded-lg whitespace-pre-wrap text-gray-300">{result}</div>}
        </div>
    );
};

export const TrendsKeywords: React.FC<TrendsKeywordsProps> = ({ initialTab = 'trends' }) => {
    const [activeTab, setActiveTab] = useState<'trends' | 'keywords'>(initialTab);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-800 p-3 rounded-full mb-2 text-blue-400">
                   <TrendingUpIcon/>
                </div>
                <h1 className="text-3xl font-bold">Trends & Keywords</h1>
                <p className="text-gray-400">Uncover viral opportunities and optimize your SEO strategy.</p>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="border-b border-gray-700">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('trends')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'trends' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Trend Discovery</button>
                        <button onClick={() => setActiveTab('keywords')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'keywords' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Keyword Research</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'trends' ? <TrendDiscoveryTab /> : <KeywordResearchTab />}
                </div>
            </div>
        </div>
    );
};