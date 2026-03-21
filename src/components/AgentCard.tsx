import React from 'react';
import { Agent } from '../types';
import { BotIcon, ChevronsRightIcon, ZapIcon } from './Icons';

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
  isLocked: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isLocked }) => {
  // Extract color name for gradient
  const colorName = agent.color.replace('text-', '').split('-')[0];
  const gradientClass = `from-${colorName}-500 to-${colorName}-600`;

  return (
    <div 
      onClick={onClick}
      className={`group relative bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 hover:border-violet-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-violet-900/10 overflow-hidden ${isLocked ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Background Glow */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 bg-${colorName}-600/10 blur-3xl rounded-full group-hover:bg-${colorName}-600/20 transition-all`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center ${agent.color} group-hover:scale-110 transition-transform duration-300`}>
            <BotIcon className="w-7 h-7" />
          </div>
          {agent.isPro && (
            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-500/20 uppercase tracking-wider">
              Pro
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-100 mb-1 group-hover:text-violet-400 transition-colors">{agent.name}</h3>
        <p className="text-xs font-medium text-violet-400 mb-3 uppercase tracking-wide">{agent.role}</p>
        <p className="text-slate-400 text-sm line-clamp-2 mb-6 group-hover:text-slate-300 transition-colors">{agent.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-violet-500/20 to-teal-500/20"></div>
                </div>
              ))}
            </div>
            <span className="text-[10px] text-slate-500 font-medium">1.2k+ users</span>
          </div>
          
          <div className="text-slate-500 group-hover:text-violet-400 transition-all transform group-hover:translate-x-1">
            <ChevronsRightIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
            <ZapIcon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-100">Pro Feature</p>
            <p className="text-[10px] text-slate-400 mb-3">Upgrade to unlock this agent</p>
            <button 
              className="text-[10px] bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg font-bold transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;
