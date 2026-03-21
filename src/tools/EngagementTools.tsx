
import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { MessageSquarePlusIcon } from '../components/Icons';
import { generateCommentReplies, enhanceImagePrompt } from '../services/geminiService';

interface EngagementToolsProps {
    initialTab?: 'comment' | 'prompt';
}

const CommentResponder = () => {
    const [comment, setComment] = useState('');
    const [tone, setTone] = useState('Friendly');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!comment.trim()) return;
        setLoading(true); setError(''); setResult('');
        try {
            const data = await generateCommentReplies(comment, tone);
            setResult(data);
        } catch (e: any) { setError(`An error occurred: ${e.message}`); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Paste a comment here..." className="w-full p-3 h-24 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md resize-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none" disabled={loading} />
            <div>
                <label className="text-sm font-medium text-[hsl(var(--card-foreground))]">Response Tone:</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Friendly', 'Witty', 'Professional', 'Thankful'].map(t => (
                        <button key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 text-sm rounded-md ${tone === t ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'}`} disabled={loading}>{t}</button>
                    ))}
                </div>
            </div>
            <button onClick={handleSubmit} disabled={loading || !comment} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Generate Replies'}
            </button>
            {error && <p className="text-red-400">{error}</p>}
            {result && <div className="p-4 bg-[hsl(var(--background))] rounded-md whitespace-pre-wrap text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">{result}</div>}
        </div>
    );
};

const PromptGenerator = () => {
    const [idea, setIdea] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

     const handleSubmit = async () => {
        if (!idea.trim()) return;
        setLoading(true); setError(''); setResult('');
        try {
            const data = await enhanceImagePrompt(idea);
            setResult(data);
        } catch (e: any) { setError(`An error occurred: ${e.message}`); }
        finally { setLoading(false); }
    };

    return (
        <div className="space-y-4">
            <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Enter your simple idea (e.g., 'a cat in space')..." className="w-full p-3 h-24 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md resize-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:outline-none" disabled={loading} />
            <button onClick={handleSubmit} disabled={loading || !idea} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
                {loading ? <Spinner size="sm" /> : 'Generate Detailed Prompts'}
            </button>
            {error && <p className="text-red-400">{error}</p>}
            {result && <div className="p-4 bg-[hsl(var(--background))] rounded-md whitespace-pre-wrap text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">{result}</div>}
        </div>
    );
};


export const EngagementTools: React.FC<EngagementToolsProps> = ({ initialTab = 'comment' }) => {
    const [activeTab, setActiveTab] = useState<'comment' | 'prompt'>(initialTab);

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
                   <MessageSquarePlusIcon/>
                </div>
                <h1 className="text-3xl font-bold">Engagement Tools</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Perfect your audience interaction and AI instructions.</p>
            </div>

            <div className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                <div className="border-b border-[hsl(var(--border))]">
                    <nav className="flex space-x-2 p-2" aria-label="Tabs">
                        <button onClick={() => setActiveTab('comment')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'comment' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Comment Responder</button>
                        <button onClick={() => setActiveTab('prompt')} className={`w-1/2 px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'prompt' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'}`}>Prompt Generator</button>
                    </nav>
                </div>
                <div className="p-6">
                    {activeTab === 'comment' ? <CommentResponder /> : <PromptGenerator />}
                </div>
            </div>
        </div>
    );
};
