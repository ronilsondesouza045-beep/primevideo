import React from 'react';
import { User } from '../types';
import { VirtualAssistant } from './chatbot/VirtualAssistant';

interface SupportChatbotProps {
  user?: User | null;
  onSavePrimeAccess?: () => void;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
}

export const SupportChatbot: React.FC<SupportChatbotProps> = () => {
  return null;
};
