import React from 'react';
import { ChatMessage as ChatMessageType } from '../../types';
import { AssistantAvatar } from './AssistantAvatar';
import { User as UserIcon, Volume2 } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onSpeak?: (text: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message, onSpeak }) => {
  const isAssistant = message.role === 'assistant';

  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1">
        {lines.map((line, lineIdx) => {
          const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
          return (
            <p key={lineIdx} className="leading-relaxed min-h-[1.25rem]">
              {parts.map((part, partIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong key={partIdx} className="font-bold text-white">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                  return (
                    <code
                      key={partIdx}
                      className="bg-slate-950 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[11px] border border-slate-700/60"
                    >
                      {part.slice(1, -1)}
                    </code>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      {isAssistant && (
        <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-slate-900 via-purple-950 to-slate-900 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
          <AssistantAvatar size="sm" state="idle" interactive={false} />
        </div>
      )}

      <div
        className={`max-w-[84%] p-3 rounded-2xl transition-all ${
          isAssistant
            ? 'bg-slate-800/95 text-slate-200 rounded-tl-none border border-slate-700/80 shadow-lg shadow-slate-950/40'
            : 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-medium rounded-tr-none shadow-lg shadow-red-950/30'
        }`}
      >
        {renderFormattedContent(message.content)}

        <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-white/5 text-[9px] opacity-75">
          {isAssistant && onSpeak && (
            <button
              onClick={() => onSpeak(message.content)}
              className="hover:text-cyan-300 flex items-center gap-1 transition-colors font-semibold"
              title="Ouvir resposta em voz alta"
            >
              <Volume2 className="w-3 h-3 text-cyan-400" />
              <span>Ouvir</span>
            </button>
          )}
          <span className="ml-auto font-mono text-slate-400">{message.timestamp}</span>
        </div>
      </div>

      {!isAssistant && (
        <div className="w-8 h-8 rounded-2xl bg-red-600/30 text-red-300 flex items-center justify-center flex-shrink-0 border border-red-500/30 shadow-md">
          <UserIcon className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
