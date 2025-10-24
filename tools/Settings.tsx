import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SavedContent } from '../types';
import { SettingsIcon } from '../components/Icons';

type Theme = 'light' | 'dark';

interface SettingsProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const [, setSavedContent] = useLocalStorage<SavedContent[]>('my-content', []);

    const handleClearContent = () => {
        if (window.confirm('Are you sure you want to delete all saved content? This action cannot be undone.')) {
            setSavedContent([]);
            alert('Your "My Content" library has been cleared.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <div className="inline-block bg-gray-100 dark:bg-gray-800 p-3 rounded-full mb-2 text-blue-500 dark:text-blue-400">
                   <SettingsIcon/>
                </div>
                <h1 className="text-3xl font-bold">App Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your application preferences and data.</p>
            </div>

            <div className="space-y-8">
                {/* Appearance Settings */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setTheme('light')} 
                                className={`px-4 py-2 text-sm font-medium rounded-md ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                Light
                            </button>
                             <button 
                                onClick={() => setTheme('dark')} 
                                className={`px-4 py-2 text-sm font-medium rounded-md ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management Settings */}
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">My Content Library</label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-3">This will permanently delete all scripts, plans, and ideas you have saved. This action cannot be undone.</p>
                        <button 
                            onClick={handleClearContent}
                            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-500 transition-colors"
                        >
                            Clear All Saved Content
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
