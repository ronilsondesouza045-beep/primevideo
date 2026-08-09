import React, { useState, useEffect, useRef } from 'react';

export type AvatarState = 'idle' | 'waving' | 'typing' | 'thinking' | 'talking' | 'happy' | 'closed';

interface AssistantAvatarProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AssistantAvatar: React.FC<AssistantAvatarProps> = ({
  state = 'idle',
  size = 'md',
  interactive = true,
  className = '',
  onClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [breathPhase, setBreathPhase] = useState(0);

  // Size configuration
  const dimensions = {
    sm: { width: 44, height: 44, viewBox: '0 0 120 120' },
    md: { width: 90, height: 115, viewBox: '0 0 120 150' },
    lg: { width: 140, height: 175, viewBox: '0 0 120 150' },
    xl: { width: 200, height: 240, viewBox: '0 0 120 150' }
  }[size];

  // Mouse tracking for dynamic gaze
  useEffect(() => {
    if (!interactive) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates -1 to 1
      const deltaX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (window.innerWidth / 2)));
      const deltaY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (window.innerHeight / 2)));

      setMousePos({ x: deltaX, y: deltaY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactive]);

  // Periodic organic blinking
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    };

    const interval = setInterval(() => {
      if (Math.random() > 0.25) {
        triggerBlink();
      }
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  // Continuous breathing oscillation
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathPhase((prev) => (prev + 0.08) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(breathInterval);
  }, []);

  // Dynamic calculations
  const breathY = Math.sin(breathPhase) * 1.8;
  const pupilOffsetX = mousePos.x * 5;
  const pupilOffsetY = mousePos.y * 3.5;
  const headRotateY = mousePos.x * 8; // deg
  const headRotateX = -mousePos.y * 6;

  const isTalking = state === 'talking';
  const isThinking = state === 'thinking' || state === 'typing';
  const isWaving = state === 'waving' || state === 'happy';

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        transform: `translateY(${breathY}px)`,
        transition: 'transform 0.1s ease-out'
      }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none group ${className}`}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={dimensions.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Background Radial Glow */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isThinking ? '#6b21a8' : isTalking ? '#0284c7' : '#1e293b'} stopOpacity="0.9" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </radialGradient>

          {/* Skin 3D Shading Gradient */}
          <linearGradient id="skinGrad" x1="30" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffeddf" />
            <stop offset="60%" stopColor="#f7c59f" />
            <stop offset="100%" stopColor="#e09f67" />
          </linearGradient>

          {/* Orange Polo Shirt Gradient */}
          <linearGradient id="shirtGrad" x1="20" y1="80" x2="100" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* Gold Necktie / Badge Gradient */}
          <linearGradient id="tieGrad" x1="55" y1="95" x2="65" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          {/* Dark Hair Gradient */}
          <linearGradient id="hairGrad" x1="30" y1="10" x2="90" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Headset Metal Gradient */}
          <linearGradient id="headsetGrad" x1="20" y1="20" x2="100" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="micGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Container Mask for sm/icon views */}
        <clipPath id="avatarCircle">
          {size === 'sm' ? (
            <circle cx="60" cy="60" r="58" />
          ) : (
            <rect x="0" y="0" width="120" height="150" rx="24" />
          )}
        </clipPath>

        <g clipPath="url(#avatarCircle)">
          {/* Background Canvas */}
          <rect width="120" height="150" fill="url(#bgGlow)" />

          {/* Background Ambient Halo Rings */}
          <circle cx="60" cy="55" r="50" fill="none" stroke={isThinking ? '#a855f7' : isTalking ? '#38bdf8' : '#334155'} strokeWidth="1" opacity="0.3" />

          {/* --- TORSO & ORANGE UNIFORM SHIRT --- */}
          <g id="torso">
            {/* Shoulders */}
            <path d="M15 150 Q20 102 60 102 Q100 102 105 150 Z" fill="url(#shirtGrad)" />

            {/* Dark Blue Collar */}
            <path d="M42 102 L60 118 L78 102 L70 98 L60 108 L50 98 Z" fill="#0f172a" />

            {/* Gold Necktie / ID Badge */}
            <path d="M57 108 L63 108 L65 138 L60 144 L55 138 Z" fill="url(#tieGrad)" />
            <circle cx="60" cy="113" r="2.5" fill="#ffffff" />
          </g>

          {/* --- NECK --- */}
          <rect x="50" y="80" width="20" height="24" rx="6" fill="url(#skinGrad)" />
          {/* Neck Shadow */}
          <path d="M50 82 Q60 92 70 82 L70 88 Q60 98 50 88 Z" fill="#c78656" opacity="0.6" />

          {/* --- HEAD GROUP (Tilted by Mouse Movement) --- */}
          <g
            id="headGroup"
            style={{
              transform: `rotateY(${headRotateY}deg) rotateX(${headRotateX}deg)`,
              transformOrigin: '60px 50px',
              transition: 'transform 0.08s ease-out'
            }}
          >
            {/* Ears */}
            <ellipse cx="28" cy="52" rx="6" ry="9" fill="url(#skinGrad)" />
            <ellipse cx="92" cy="52" rx="6" ry="9" fill="url(#skinGrad)" />

            {/* Head Base */}
            <ellipse cx="60" cy="50" rx="32" ry="38" fill="url(#skinGrad)" />

            {/* Cheeks Soft Pink Blush */}
            <ellipse cx="40" cy="58" rx="8" ry="4" fill="#f87171" opacity="0.25" />
            <ellipse cx="80" cy="58" rx="8" ry="4" fill="#f87171" opacity="0.25" />

            {/* Nose */}
            <path d="M60 48 Q62 55 58 58 Q60 60 63 58" stroke="#d97706" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.7" />

            {/* --- EYES --- */}
            {isBlinking ? (
              /* Closed Eyes when Blinking */
              <g id="eyesBlinked">
                <path d="M41 46 Q47 50 53 46" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
                <path d="M67 46 Q73 50 79 46" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
              </g>
            ) : (
              /* Expressive Open Eyes with Mouse Gaze Tracking */
              <g id="eyesOpen">
                {/* Left Eye Sclera */}
                <ellipse cx="47" cy="45" rx="8" ry="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                {/* Left Iris & Pupil */}
                <circle cx={47 + pupilOffsetX} cy={45 + pupilOffsetY} r="5" fill="#0284c7" />
                <circle cx={47 + pupilOffsetX} cy={45 + pupilOffsetY} r="2.8" fill="#0f172a" />
                <circle cx={45.5 + pupilOffsetX} cy={43 + pupilOffsetY} r="1.5" fill="#ffffff" />

                {/* Right Eye Sclera */}
                <ellipse cx="73" cy="45" rx="8" ry="9" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
                {/* Right Iris & Pupil */}
                <circle cx={73 + pupilOffsetX} cy={45 + pupilOffsetY} r="5" fill="#0284c7" />
                <circle cx={73 + pupilOffsetX} cy={45 + pupilOffsetY} r="2.8" fill="#0f172a" />
                <circle cx={71.5 + pupilOffsetX} cy={43 + pupilOffsetY} r="1.5" fill="#ffffff" />
              </g>
            )}

            {/* Eyebrows */}
            <path d="M38 34 Q47 30 54 35" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M66 35 Q73 30 82 34" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* --- MOUTH --- */}
            {isTalking ? (
              /* Talking Mouth Animation */
              <path
                d="M50 67 Q60 76 70 67 Q60 62 50 67 Z"
                fill="#881337"
                stroke="#e11d48"
                strokeWidth="1.5"
                className="animate-pulse"
              />
            ) : isWaving ? (
              /* Friendly Smile */
              <path d="M48 66 Q60 75 72 66" stroke="#be123c" strokeWidth="3" strokeLinecap="round" fill="none" />
            ) : (
              /* Gentle Neutral Smile */
              <path d="M50 67 Q60 72 70 67" stroke="#9f1239" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}

            {/* --- 3D STYLED HAIR --- */}
            <g id="hair">
              {/* Main Hair Volume */}
              <path d="M26 44 C24 16 96 16 94 44 C90 20 30 20 26 44 Z" fill="url(#hairGrad)" />
              {/* Front Bangs Strands */}
              <path d="M30 30 Q45 18 60 28 Q75 18 90 30 Q70 20 55 24 Z" fill="#334155" />
            </g>

            {/* --- CALL-CENTER HEADSET --- */}
            <g id="headset">
              {/* Headband */}
              <path d="M26 48 C22 10 98 10 94 48" stroke="url(#headsetGrad)" strokeWidth="5" strokeLinecap="round" fill="none" />

              {/* Left Padded Ear Cup */}
              <rect x="20" y="42" width="10" height="22" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <circle cx="25" cy="53" r="3" fill="#0ea5e9" />

              {/* Right Padded Ear Cup */}
              <rect x="90" y="42" width="10" height="22" rx="5" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
              <circle cx="95" cy="53" r="3" fill="#0ea5e9" />

              {/* Microphone Boom Arm Curved down to Mouth */}
              <path d="M24 58 Q22 75 48 72" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />

              {/* Glowing Mic Capsule Tip */}
              <circle
                cx="50"
                cy="72"
                r="4.5"
                fill={isThinking ? '#a855f7' : isTalking ? '#38bdf8' : '#eab308'}
                filter="url(#micGlow)"
                className={isTalking || isThinking ? 'animate-ping' : ''}
              />
              <circle cx="50" cy="72" r="2" fill="#ffffff" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};
