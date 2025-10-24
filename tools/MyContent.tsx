import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
// FIX: Import 'Script' type to use for type assertion.
import { SavedContent, Script } from '../types';
import { MyContentIcon, TrashIcon } from '../components/Icons';

// Helper component to render different content types
const ContentRenderer = ({ item }: { item: SavedContent }) => {
    switch(item.tool) {
        case 'Script Writer':
            // FIX: Assert 'item.content' as 'Script' to access its properties safely.
            // The union type of 'content' is too broad for TypeScript to infer from the 'item.tool' string.
            const script = item.content as Script;
            return (
                <div className="text-xs text-gray-400 space-y-2">
                    <p><strong>Hook:</strong> {script.hook.substring(0, 100)}...</p>
                    <p><strong>Conclusion:</strong> {script.conclusion.substring(0, 100)}...</p>
                </div>
            );
        case 'Growth Planner':
            // FIX: Assert 'item.content' as 'string' to use string methods.
            // The union type of 'content' is too broad for TypeScript to infer from the 'item.tool' string.
            return <p className="text-xs text-gray-400 whitespace-pre-wrap">{(item.content as string).substring(0, 200)}...</p>;
        case 'Thumbnail Ideas':
            const ideas = item.content as string[];
            return (
                <ul className="list-disc list-inside text-xs text-gray-400">
                    {ideas.map((idea, index) => (
                        <li key={index}>{idea.substring(0, 100).split('\n')[0]}...</li>
                    ))}
                </ul>
            );
        default:
            return <p className="text-xs text-gray-400">Cannot display preview for this content type.</p>
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
                <div className="inline-block bg-gray-800 p-4 rounded-full mb-4 text-blue-400">
                   <MyContentIcon/>
                </div>
                <h1 className="text-3xl font-bold">My Content</h1>
                <p className="text-gray-400 mt-2">Your library of saved scripts, plans, and ideas.</p>
            </div>
            
            {savedContent.length === 0 ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                        <h2 className="font-semibold text-lg">Your Library is Empty</h2>
                        <p className="text-gray-400 mt-2">
                            Go to a tool like the Script Writer and click "Save" to add content here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
                    {savedContent.map(item => (
                        <div key={item.id} className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col justify-between">
                            <div className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-semibold bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full inline-block">{item.tool}</p>
                                        <h3 className="font-bold text-white mt-2">{item.title}</h3>
                                    </div>
                                    <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-red-400 p-1">
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <ContentRenderer item={item} />
                                </div>
                            </div>
                            <div className="p-4 bg-gray-900/50 border-t border-gray-700 text-right">
                                 <p className="text-xs text-gray-500">
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
