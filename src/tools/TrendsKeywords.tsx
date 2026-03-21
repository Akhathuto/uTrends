
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { GroundingChunk } from '../types';
import { TrendingUpIcon } from '../components/Icons';
import { getTrends, getKeywordResearch } from '../services/geminiService';

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
            const data = await getTrends(topic);
            setResult(data.text);
            setSources(data.sources);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter a niche, e.g., 'AI tools' or 'home cooking'" className="w-full p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !topic} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Discover Trends'}
            </button>
            {loading && <div className="text-center"><Spinner /></div>}
            {error && <p className="text-red-400">{error}</p>}
            {result && (
                <div className="p-4 bg-[hsl(var(--background))] rounded-md border border-[hsl(var(--border))]">
                    <p className="whitespace-pre-wrap text-[hsl(var(--muted-foreground))]">{result}</p>
                     {sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
                          <h3 className="text-sm font-semibold mb-2">Sources:</h3>
                          <ul className="space-y-1">
                            {sources.map((s, i) => s.web && s.web.uri && <li key={i}><a href={s.web.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-[hsl(var(--primary))] hover:underline truncate">{s.web.title || s.web.uri}</a></li>)}
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
        try {
            const data = await getKeywordResearch(keyword);
            setResult(data);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter a keyword, e.g., 'passive income ideas'" className="w-full p-3 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !keyword} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Analyze Keyword'}
            </button>
            {loading && <div className="text-center"><Spinner /></div>}
            {error && <p className="text-red-400">{error}</p>}
            {result && <div className="p-4 bg-[hsl(var(--background))] rounded-md whitespace-pre-wrap text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">{result}</div>}
        </div>
    );
};

export const TrendsKeywords: React.FC<TrendsKeywordsProps> = ({ initialTab = 'trends' }) => {
    const [activeTab, setActiveTab] = useState<'trends' | 'keywords'>(initialTab);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
                   <TrendingUpIcon/>
                </div>
                <h1 className="text-3xl font-bold">Trends & Keywords</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Uncover viral opportunities and optimize your SEO strategy.</p>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                <div className="border-b border-[hsl(var(--border))]">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('trends')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'trends' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Trend Discovery</button>
                        <button onClick={() => setActiveTab('keywords')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'keywords' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Keyword Research</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'trends' ? <TrendDiscoveryTab /> : <KeywordResearchTab />}
                </div>
            </div>
        </div>
    );
};
