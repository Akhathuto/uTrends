import React, { useState } from 'react';
import Spinner from '../components/Spinner';
import { FileTextIcon, SaveIcon, CopyIcon, CheckCircleIcon } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { Script } from '../types';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { generateScript } from '../services/geminiService';

const ScriptSection: React.FC<{ title: string; content: string; children?: React.ReactNode }> = ({ title, content, children }) => {
    const { copied, copy } = useCopyToClipboard(content);
    return (
        <div className="bg-[hsl(var(--card))] p-5 rounded-[var(--radius)] border border-[hsl(var(--border))]">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-lg text-[hsl(var(--primary))]">{title}</h3>
                <button onClick={() => copy()} title="Copy section" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] p-1 rounded-md hover:bg-[hsl(var(--accent))] transition-colors">
                    {copied ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                </button>
            </div>
            {children || <p className="text-[hsl(var(--muted-foreground))]">{content}</p>}
        </div>
    );
};


export const ScriptWriter: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('5');
    const [script, setScript] = useState<Script | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const { addSavedContent } = useAuth();

    const handleSave = () => {
        if (!script) return;
        addSavedContent({
            tool: 'Script Writer',
            title: script.title,
            content: script,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleSubmit = async () => {
        if (!topic.trim()) {
            setError('Please enter a video topic.');
            return;
        }
        setLoading(true);
        setError('');
        setScript(null);

        try {
            const data = await generateScript(topic, duration);
            setScript(data);
        } catch (e: any) {
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]"><FileTextIcon /></div>
                <h1 className="text-3xl font-bold">Script Writer</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Generate a complete video script from a simple topic.</p>
            </div>
            <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))] space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--card-foreground))]">Video Topic</label>
                    <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., The history of artificial intelligence" className="mt-1 w-full p-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[hsl(var(--card-foreground))]">Target Duration (minutes)</label>
                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 w-full p-2 bg-[hsl(var(--background))] border border-[hsl(var(--border))] rounded-md">
                        <option value="2">2 (Short)</option>
                        <option value="5">5 (Standard)</option>
                        <option value="10">10 (Deep Dive)</option>
                    </select>
                </div>
                <button onClick={handleSubmit} disabled={loading || !topic.trim()} className="w-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
                    {loading ? <Spinner size="sm" /> : 'Write My Script'}
                </button>
            </div>
            {loading && <div className="text-center mt-6"><Spinner size="lg" /></div>}
            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
            {script && (
                <div className="mt-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                        <h2 className="text-2xl font-bold text-[hsl(var(--card-foreground))] leading-tight">{script.title}</h2>
                        <button
                            onClick={handleSave}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors flex-shrink-0 ${
                                saved ? 'bg-green-600 text-white' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--accent))]'
                            }`}
                        >
                            <SaveIcon /> {saved ? 'Saved!' : 'Save Script'}
                        </button>
                    </div>

                    <ScriptSection title="Hook" content={script.hook}>
                        <p className="text-[hsl(var(--muted-foreground))] italic">"{script.hook}"</p>
                    </ScriptSection>
                    
                    <ScriptSection title="Introduction" content={script.introduction} />
                    
                    <ScriptSection title="Main Points" content={script.main_points.join('\n\n')}>
                         <ul className="space-y-4">
                            {script.main_points.map((point, index) => (
                                <li key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-6 h-6 bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] rounded-full flex items-center justify-center font-bold text-sm mt-1">{index + 1}</div>
                                    <p className="text-[hsl(var(--muted-foreground))]">{point}</p>
                                </li>
                            ))}
                        </ul>
                    </ScriptSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ScriptSection title="Conclusion" content={script.conclusion} />
                        <ScriptSection title="Call to Action" content={script.call_to_action} />
                    </div>
                </div>
            )}
        </div>
    );
};