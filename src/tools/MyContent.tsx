import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SavedContent, Script } from '../types';
import { MyContentIcon, TrashIcon } from '../components/Icons';

interface ParsedThumbnail {
    text: string;
    imagery: string;
    colorScheme: string;
    emotion: string;
}

// Helper to parse the detailed description from the Thumbnail Ideas tool
function parseThumbnailIdea(idea: string): ParsedThumbnail {
    const textMatch = idea.match(/\*\*Text:\*\*\s*([^\r\n]*)/);
    const imageryMatch = idea.match(/\*\*Imagery:\*\*\s*([^\r\n]*)/);
    const colorSchemeMatch = idea.match(/\*\*Color Scheme:\*\*\s*([^\r\n]*)/);
    const emotionMatch = idea.match(/\*\*Emotion:\*\*\s*([^\r\n]*)/);

    return {
        text: textMatch ? textMatch[1].trim().replace(/"/g, '') : "NO TEXT",
        imagery: imageryMatch ? imageryMatch[1].trim() : "Image description",
        colorScheme: colorSchemeMatch ? colorSchemeMatch[1].trim() : "N/A",
        emotion: emotionMatch ? emotionMatch[1].trim() : "N/A",
    };
}

// Visual component to represent a thumbnail idea
const ThumbnailPreview: React.FC<{ idea: string }> = ({ idea }) => {
    const parsed = parseThumbnailIdea(idea);

    const getBgColor = (scheme: string) => {
        const lowerScheme = scheme.toLowerCase();
        if (lowerScheme.includes('yellow') || lowerScheme.includes('bright')) return 'from-yellow-400 to-amber-500';
        if (lowerScheme.includes('blue') || lowerScheme.includes('calm')) return 'from-blue-500 to-indigo-600';
        if (lowerScheme.includes('red') || lowerScheme.includes('urgency') || lowerScheme.includes('dramatic')) return 'from-red-500 to-rose-600';
        if (lowerScheme.includes('green')) return 'from-green-400 to-emerald-500';
        if (lowerScheme.includes('dark')) return 'from-gray-700 to-gray-800';
        return 'from-gray-600 to-gray-700';
    };

    return (
        <div className={`aspect-video w-full rounded-md p-2 flex flex-col justify-between text-white bg-gradient-to-br ${getBgColor(parsed.colorScheme)} shadow-lg overflow-hidden`}>
            <div className="flex-grow flex items-center justify-center p-1">
                <p className="text-center font-black text-lg md:text-base lg:text-lg leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    {parsed.text}
                </p>
            </div>
            <div className="bg-black/50 p-1.5 rounded-sm backdrop-blur-sm">
                <p className="text-xs truncate font-semibold" title={parsed.imagery}>
                    🖼️ <span className="font-normal">{parsed.imagery}</span>
                </p>
                 <p className="text-xs truncate font-semibold" title={parsed.emotion}>
                    🎭 <span className="font-normal">{parsed.emotion}</span>
                </p>
            </div>
        </div>
    );
};


// Helper component to render different content types
const ContentRenderer = ({ item }: { item: SavedContent }) => {
    switch(item.tool) {
        case 'Script Writer':
            const script = item.content as Script;
            return (
                <div className="text-sm text-[hsl(var(--muted-foreground))] space-y-2">
                    <p><strong>Introduction:</strong> {script.introduction}</p>
                </div>
            );
        case 'Growth Planner':
            const content = item.content as string;
            // Split by what looks like a numbered list item start
            const points = content.split(/\n\s*\d+\.\s/);
            // The first element is whatever is before "1.", so we discard it.
            // We then re-add the number to the beginning of each point.
            const formattedPoints = points.slice(1).map((p, i) => `${i + 1}. ${p.trim()}`);
            const firstTwoPoints = formattedPoints.slice(0, 2).join('\n\n');

            return (
                <p className="text-sm text-[hsl(var(--muted-foreground))] whitespace-pre-wrap">
                    {firstTwoPoints || (item.content as string).substring(0, 200) + '...'}
                </p>
            );
        case 'Thumbnail Ideas':
            const ideas = item.content as string[];
             if (!ideas || ideas.length === 0) {
                return <p className="text-sm text-[hsl(var(--muted-foreground))]">No ideas saved.</p>;
            }
            return <ThumbnailPreview idea={ideas[0]} />;
        default:
            return <p className="text-sm text-[hsl(var(--muted-foreground))]">Cannot display preview for this content type.</p>
    }
}

export const MyContent: React.FC = () => {
    const [savedContent, setSavedContent] = useLocalStorage<SavedContent[]>('my-content', []);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            setSavedContent(prev => prev.filter(item => item.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-full max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-4 rounded-full mb-4 text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
                   <MyContentIcon/>
                </div>
                <h1 className="text-3xl font-bold">My Content</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-2">Your library of saved scripts, plans, and ideas.</p>
            </div>
            
            {savedContent.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center p-6 bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))]">
                        <h2 className="font-semibold text-lg">Your Library is Empty</h2>
                        <p className="text-[hsl(var(--muted-foreground))] mt-2">
                            Go to a tool like the Script Writer and click "Save" to add content here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
                    {savedContent.map(item => (
                        <div key={item.id} className="bg-[hsl(var(--card))] rounded-[var(--radius)] border border-[hsl(var(--border))] flex flex-col justify-between overflow-hidden">
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-semibold bg-[hsl(var(--primary))] bg-opacity-10 text-[hsl(var(--primary))] px-2 py-1 rounded-full inline-block">{item.tool}</p>
                                        <h3 className="font-bold text-[hsl(var(--card-foreground))] mt-2">{item.title}</h3>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="text-[hsl(var(--muted-foreground))] hover:text-red-500 p-1">
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <ContentRenderer item={item} />
                                </div>
                            </div>
                            <div className="p-4 bg-[hsl(var(--secondary))] border-t border-[hsl(var(--border))] text-right">
                                 <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                    Saved on: {new Date(item.createdAt).toLocaleDateString()}
                                 </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};