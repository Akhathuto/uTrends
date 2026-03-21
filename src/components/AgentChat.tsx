import React, { useState, useRef, useEffect } from 'react';
import { Agent, ChatMessage } from '../types';
import { SendIcon, BotIcon, UserIcon, TrashIcon, ArrowLeftIcon, SparklesIcon } from './Icons';
import Markdown from 'react-markdown';
import Spinner from './Spinner';

interface AgentChatProps {
  agent: Agent;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onBack: () => void;
  isSending: boolean;
}

const AgentChat: React.FC<AgentChatProps> = ({
  agent,
  messages,
  onSendMessage,
  onClearChat,
  onBack,
  isSending,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSending) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.color} text-white`}>
            <BotIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{agent.name}</h3>
            <p className="text-[10px] text-violet-400 uppercase tracking-widest font-bold">
              {agent.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearChat}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title="Clear Chat"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className={`p-6 rounded-3xl bg-gradient-to-br ${agent.color} text-white mb-6 shadow-2xl shadow-violet-900/20`}>
              <BotIcon className="w-12 h-12" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Hello! I'm {agent.name}</h4>
            <p className="text-slate-400 max-w-xs mx-auto text-sm leading-relaxed">
              {agent.description}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
              msg.role === 'user' ? 'bg-violet-600 text-white' : `bg-gradient-to-br ${agent.color} text-white`
            }`}>
              {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <BotIcon className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user'
                ? 'bg-violet-600/10 border border-violet-500/20 text-white rounded-tr-none'
                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-mono">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex gap-4 animate-in fade-in duration-300">
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${agent.color} text-white shadow-lg`}>
              <BotIcon className="w-5 h-5" />
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm">
              <Spinner className="w-5 h-5 text-violet-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/30">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agent.name}...`}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all group-hover:border-slate-600"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:hover:bg-violet-600 transition-all shadow-lg shadow-violet-900/20"
          >
            {isSending ? <Spinner className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </form>
        <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <SparklesIcon className="w-3 h-3" />
          <span>Powered by Gemini 3.1 AI</span>
        </div>
      </div>
    </div>
  );
};

export default AgentChat;
