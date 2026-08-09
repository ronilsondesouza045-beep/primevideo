import React from 'react';
import { AssistantAvatar } from './AssistantAvatar';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-2.5 items-center animate-fadeIn my-1">
      <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
        <AssistantAvatar size="sm" state="typing" interactive={false} />
      </div>

      <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-md text-xs text-slate-300">
        <span className="font-semibold text-purple-300">Assistente 3D digitando</span>
        <div className="flex gap-1 items-center ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-bounce"></span>
        </div>
      </div>
    </div>
  );
};
