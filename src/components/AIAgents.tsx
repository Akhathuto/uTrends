import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Agent, ChatMessage } from '../types';
import { agents } from '../data/agents';
import { sendMessageToAgent } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';
import { SparklesIcon, ZapIcon, SlidersIcon, SearchIcon, XIcon } from './Icons';
import AgentCard from './AgentCard';
import AgentChat from './AgentChat';

const AIAgents: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pro' | 'free'>('all');

  // Load chat history from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('agent_chat_history');
    if (savedHistory) {
      try {
        setChatHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }
  }, []);

  // Save chat history to local storage whenever it changes
  useEffect(() => {
    if (Object.keys(chatHistory).length > 0) {
      localStorage.setItem('agent_chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  const handleSendMessage = async (content: string) => {
    if (!selectedAgent || !content.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    const currentHistory = chatHistory[selectedAgent.id] || [];
    const updatedHistory = [...currentHistory, userMessage];
    
    setChatHistory(prev => ({
      ...prev,
      [selectedAgent.id]: updatedHistory
    }));

    setIsSending(true);
    try {
      const response = await sendMessageToAgent(
        selectedAgent,
        updatedHistory,
        { model: 'gemini-3-flash-preview', temperature: 0.7 }
      );
      
      setChatHistory(prev => ({
        ...prev,
        [selectedAgent.id]: [...updatedHistory, ...response]
      }));
    } catch (error: any) {
      addToast('Failed to send message: ' + error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearChat = () => {
    if (!selectedAgent) return;
    
    const initialMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'model',
      content: `Hello! I'm ${selectedAgent.name}. How can I help you today?`,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedAgent.id]: [initialMessage]
    }));
  };

  const switchAgent = (agent: Agent) => {
    if (agent.isPro && user?.plan !== 'pro') {
      addToast('This agent requires a Pro plan', 'info');
      return;
    }
    
    setSelectedAgent(agent);
    
    // Initialize chat history if it doesn't exist
    if (!chatHistory[agent.id]) {
      const initialMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        content: `Hello! I'm ${agent.name}. How can I help you today?`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => ({
        ...prev,
        [agent.id]: [initialMessage]
      }));
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'pro' && agent.isPro) || 
                         (filter === 'free' && !agent.isPro);
    return matchesSearch && matchesFilter;
  });

  if (selectedAgent) {
    return (
      <AgentChat
        agent={selectedAgent}
        messages={chatHistory[selectedAgent.id] || []}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedAgent(null)}
        onClearChat={handleClearChat}
        isSending={isSending}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-violet-400" /> AI Agents
          </h1>
          <p className="text-slate-400 mt-1">Specialized AI assistants to help you grow your channel.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1 flex items-center gap-2">
            <ZapIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-slate-300">
              {user?.plan === 'pro' ? 'Pro Access' : 'Free Plan'}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="flex bg-slate-900/50 border border-slate-700/50 rounded-xl p-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('free')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'free' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Free
          </button>
          <button
            onClick={() => setFilter('pro')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'pro' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Pro
          </button>
        </div>
      </div>

      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => switchAgent(agent)}
              isLocked={agent.isPro && user?.plan !== 'pro'}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-700/50">
          <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <SearchIcon className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-300">No agents found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setSearchQuery(''); setFilter('all'); }}
            className="mt-6 text-violet-400 hover:text-violet-300 font-medium flex items-center gap-2 mx-auto"
          >
            <SlidersIcon className="w-4 h-4" /> Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default AIAgents;
