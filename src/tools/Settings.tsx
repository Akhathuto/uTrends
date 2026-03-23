import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SettingsIcon, UserIcon, Star, Shield, LoaderIcon } from '../components/Icons';
import { PlanName } from '../types';

type Theme = 'light' | 'dark';

interface SettingsProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const Settings: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const { user, updateProfile, upgradePlan } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setUpdating(true);
        setMessage(null);
        try {
            await updateProfile(user.id, { name, email });
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to update profile' });
        } finally {
            setUpdating(false);
        }
    };

    const handleUpgrade = async (plan: PlanName) => {
        if (!user || plan === user.plan) return;
        setUpdating(true);
        try {
            await upgradePlan(plan as any);
            setMessage({ type: 'success', text: `Successfully upgraded to ${plan}!` });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to upgrade plan' });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="text-center mb-8">
                <div className="inline-block bg-[hsl(var(--card))] p-3 rounded-full mb-2 text-[hsl(var(--primary))] border border-[hsl(var(--border))]">
                   <SettingsIcon/>
                </div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-[hsl(var(--muted-foreground))]">Manage your profile, plan, and application preferences.</p>
            </div>

            {message && (
                <div className={`p-4 rounded-md text-sm text-center border ${
                    message.type === 'success' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2 mb-4">
                        <UserIcon className="w-5 h-5 text-[hsl(var(--primary))]" />
                        <h2 className="text-xl font-semibold">Profile</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800/50 border border-[hsl(var(--border))] rounded-md text-white focus:ring-violet-500 focus:border-violet-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-800/50 border border-[hsl(var(--border))] rounded-md text-white focus:ring-violet-500 focus:border-violet-500"
                            />
                        </div>
                        {user?.providerId && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Login Provider</label>
                                <div className="px-3 py-2 bg-slate-800/30 border border-[hsl(var(--border))] rounded-md text-slate-400 text-sm flex items-center gap-2">
                                    <span className="capitalize">{user.providerId.replace('.com', '')}</span>
                                </div>
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={updating}
                            className="w-full py-2 px-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                            {updating && <LoaderIcon className="w-4 h-4 animate-spin" />}
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Plan Management */}
                <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))]">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-xl font-semibold">Current Plan: <span className="text-violet-400 uppercase">{user?.plan}</span></h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            Upgrade your plan to unlock more AI features, higher limits, and advanced tools.
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {['starter', 'pro'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handleUpgrade(p as any)}
                                    disabled={updating || user?.plan === p}
                                    className={`w-full py-2 px-4 rounded-md font-bold transition-all flex items-center justify-between ${
                                        user?.plan === p
                                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg'
                                    }`}
                                >
                                    <span>Upgrade to {p.toUpperCase()}</span>
                                    {user?.plan === p && <Shield className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Appearance Settings */}
                <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))]">
                    <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--card-foreground))] mb-2">Theme</label>
                        <div className="flex space-x-2">
                            <button 
                                onClick={() => setTheme('light')} 
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'light' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]'}`}
                            >
                                Light
                            </button>
                             <button 
                                onClick={() => setTheme('dark')} 
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${theme === 'dark' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--accent))]'}`}
                            >
                                Dark
                            </button>
                        </div>
                    </div>
                </div>

                {/* Data Management Settings */}
                <div className="bg-[hsl(var(--card))] p-6 rounded-[var(--radius)] border border-[hsl(var(--border))]">
                    <h2 className="text-xl font-semibold mb-4">Data Management</h2>
                    <div>
                        <label className="block text-sm font-medium text-[hsl(var(--card-foreground))]">My Content Library</label>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 mb-3">Your content is securely stored in the cloud. You can manage it in the "My Content" section.</p>
                        <button 
                            disabled
                            className="bg-red-600/50 text-white/50 font-semibold py-2 px-4 rounded-lg cursor-not-allowed"
                        >
                            Clear All Saved Content (Coming Soon)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
