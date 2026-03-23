import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtrendLogo } from './Logo';
import { Button } from './ui/button';
import { LogIn, UserPlus, Loader2, Github } from 'lucide-react';

export const Login: React.FC = () => {
    const { login, signUp, loginWithGoogle, loginWithGithub, resetPassword } = useAuth();
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [plan, setPlan] = useState<'free' | 'starter' | 'pro'>('free');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            if (isForgotPassword) {
                await resetPassword(email);
                setSuccessMessage('Password reset email sent! Check your inbox.');
            } else if (isSignUp) {
                await signUp(name, email, password, plan);
            } else {
                await login(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGithubLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await loginWithGithub();
        } catch (err: any) {
            setError(err.message || 'Github login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] p-4">
            <div className="max-w-md w-full space-y-8 bg-[hsl(var(--card))] p-8 rounded-2xl border border-[hsl(var(--border))] shadow-2xl">
                <div className="text-center">
                    <UtrendLogo className="h-16 w-16 mx-auto mb-4 animate-logo-pulse" />
                    <h2 className="text-3xl font-extrabold text-[hsl(var(--card-foreground))]">
                        {isForgotPassword ? 'Reset your password' : isSignUp ? 'Create your account' : 'Sign in to uTrends'}
                    </h2>
                    <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                        {isForgotPassword ? 'Enter your email to receive a reset link' : isSignUp ? 'Join the autonomous AI content suite' : 'Welcome back to your AI content partner'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm text-center">
                            {error}
                        </div>
                    )}
                    {successMessage && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-md text-sm text-center">
                            {successMessage}
                        </div>
                    )}

                    <div className="rounded-md shadow-sm space-y-4">
                        {isSignUp && !isForgotPassword && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-[hsl(var(--border))] placeholder-slate-500 text-white rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm bg-slate-800/50"
                                    placeholder="John Doe"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none relative block w-full px-3 py-2 border border-[hsl(var(--border))] placeholder-slate-500 text-white rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm bg-slate-800/50"
                                placeholder="you@example.com"
                            />
                        </div>
                        {!isForgotPassword && (
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-400">Password</label>
                                    {!isSignUp && (
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-xs font-medium text-violet-400 hover:text-violet-300"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2 border border-[hsl(var(--border))] placeholder-slate-500 text-white rounded-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm bg-slate-800/50"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {isSignUp && !isForgotPassword && (
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Select Plan</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['free', 'starter', 'pro'].map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setPlan(p as any)}
                                            className={`px-3 py-2 text-xs font-bold rounded-md border transition-all ${
                                                plan === p 
                                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg' 
                                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                        >
                                            {p.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : isForgotPassword ? (
                                'Send Reset Link'
                            ) : isSignUp ? (
                                <><UserPlus className="h-5 w-5 mr-2" /> Sign Up</>
                            ) : (
                                <><LogIn className="h-5 w-5 mr-2" /> Sign In</>
                            )}
                        </Button>

                        {!isForgotPassword && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-[hsl(var(--card))] text-slate-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        type="button"
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Google
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleGithubLogin}
                                        disabled={loading}
                                        variant="outline"
                                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                    >
                                        <Github className="h-5 w-5 mr-2" />
                                        GitHub
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </form>

                <div className="text-center mt-4 space-y-2">
                    {isForgotPassword ? (
                        <button
                            onClick={() => setIsForgotPassword(false)}
                            className="text-sm font-medium text-violet-400 hover:text-violet-300"
                        >
                            Back to sign in
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-medium text-violet-400 hover:text-violet-300"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
