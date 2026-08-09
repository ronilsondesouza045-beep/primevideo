import React from 'react';
import { AssistantAvatar } from './chatbot/AssistantAvatar';

interface StandingBotAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isWaving?: boolean;
  isHappy?: boolean;
  className?: string;
}

export const StandingBotAvatar: React.FC<StandingBotAvatarProps> = ({
  size = 'md',
  isWaving = true,
  isHappy = false,
  className = ''
}) => {
  const state = isHappy ? 'happy' : isWaving ? 'waving' : 'idle';
  return (
    <AssistantAvatar
      size={size}
      state={state}
      interactive={true}
      className={className}
    />
  );
};
