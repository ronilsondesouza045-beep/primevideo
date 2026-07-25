import React from 'react';

interface StandingBotAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isWaving?: boolean;
  isHappy?: boolean;
  className?: string;
}

export const StandingBotAvatar: React.FC<StandingBotAvatarProps> = ({
  size = 'md',
  isWaving = true,
  isHappy = true,
  className = ''
}) => {
  // Dimensions map
  const dimensions = {
    sm: { width: 48, height: 64 },
    md: { width: 72, height: 96 },
    lg: { width: 110, height: 140 },
    xl: { width: 160, height: 200 }
  }[size];

  return (
    <div className={`relative inline-flex flex-col items-center justify-center animate-botFloat ${className}`}>
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 120 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_8px_16px_rgba(220,38,38,0.35)]"
      >
        <defs>
          {/* Body Gradient */}
          <linearGradient id="metalBody" x1="20" y1="20" x2="100" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="30%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          {/* Chest Plate Gradient */}
          <linearGradient id="chestGradient" x1="40" y1="70" x2="80" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>

          {/* Visor Screen */}
          <linearGradient id="visorGradient" x1="35" y1="35" x2="85" y2="55" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#090d16" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Glow Filters */}
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floating Shadow Base */}
        <ellipse cx="60" cy="154" rx="36" ry="6" fill="#000000" opacity="0.45" />
        <ellipse cx="60" cy="154" rx="24" ry="4" fill="#dc2626" opacity="0.3" filter="url(#redGlow)" />

        {/* --- LEGS & FEET (Standing Tall) --- */}
        {/* Left Leg */}
        <rect x="42" y="115" width="12" height="28" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <rect x="38" y="138" width="18" height="12" rx="5" fill="#0f172a" stroke="#dc2626" strokeWidth="1.5" />
        {/* Foot Light */}
        <line x1="42" y1="144" x2="52" y2="144" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" filter="url(#cyanGlow)" />

        {/* Right Leg */}
        <rect x="66" y="115" width="12" height="28" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <rect x="64" y="138" width="18" height="12" rx="5" fill="#0f172a" stroke="#dc2626" strokeWidth="1.5" />
        {/* Foot Light */}
        <line x1="68" y1="144" x2="78" y2="144" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" filter="url(#cyanGlow)" />

        {/* --- TORSO & CHEST --- */}
        {/* Main Body Shell */}
        <rect x="32" y="65" width="56" height="52" rx="16" fill="url(#metalBody)" stroke="#475569" strokeWidth="2" />

        {/* Chest Core Reactor (Glowing VIP Badge) */}
        <rect x="42" y="74" width="36" height="34" rx="10" fill="url(#chestGradient)" stroke="#f87171" strokeWidth="1.5" filter="url(#redGlow)" />
        {/* Core Heart Pulse */}
        <circle cx="60" cy="91" r="8" fill="#ffffff" opacity="0.9" filter="url(#cyanGlow)" />
        <path d="M56 91 L60 87 L64 91 L60 95 Z" fill="#dc2626" />
        <text x="60" y="80" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold" fontFamily="sans-serif">VIP</text>

        {/* --- LEFT ARM (Idle at side) --- */}
        <rect x="18" y="70" width="12" height="30" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
        <circle cx="24" cy="102" r="6" fill="#0f172a" stroke="#dc2626" strokeWidth="1.5" />

        {/* --- RIGHT ARM (Waving Hello) --- */}
        <g className={isWaving ? "animate-armWave" : ""}>
          {/* Upper Arm angled up */}
          <rect x="88" y="58" width="12" height="28" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" transform="rotate(-30 88 58)" />
          {/* Hand/Mitten */}
          <circle cx="106" cy="46" r="7" fill="#dc2626" filter="url(#redGlow)" />
          {/* Wave sparkle */}
          <path d="M112 36 L114 40 L118 42 L114 44 L112 48 L110 44 L106 42 L110 40 Z" fill="#38bdf8" filter="url(#cyanGlow)" />
        </g>

        {/* --- NECK --- */}
        <rect x="52" y="55" width="16" height="12" rx="3" fill="#020617" stroke="#334155" strokeWidth="1.5" />

        {/* --- HEAD & FACE --- */}
        {/* Antenna */}
        <line x1="60" y1="28" x2="60" y2="12" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
        <circle cx="60" cy="9" r="6" fill="#ec4899" className="animate-antennaPulse" filter="url(#redGlow)" />
        <circle cx="60" cy="9" r="2.5" fill="#ffffff" />

        {/* Head Helmet */}
        <rect x="28" y="24" width="64" height="36" rx="14" fill="url(#metalBody)" stroke="#64748b" strokeWidth="2" />

        {/* Ear Bolts */}
        <rect x="22" y="32" width="6" height="18" rx="3" fill="#dc2626" />
        <rect x="92" y="32" width="6" height="18" rx="3" fill="#dc2626" />

        {/* Visor Screen (Glowing Dark Mirror) */}
        <rect x="34" y="30" width="52" height="24" rx="10" fill="url(#visorGradient)" stroke="#38bdf8" strokeWidth="1.5" />

        {/* Animated Blinking Visor Eyes */}
        <g className="animate-eyeBlink">
          {/* Left Eye */}
          <ellipse cx="48" cy="40" rx="6" ry="6" fill="#38bdf8" filter="url(#cyanGlow)" />
          <circle cx="50" cy="38" r="2" fill="#ffffff" />

          {/* Right Eye */}
          <ellipse cx="72" cy="40" rx="6" ry="6" fill="#38bdf8" filter="url(#cyanGlow)" />
          <circle cx="74" cy="38" r="2" fill="#ffffff" />
        </g>

        {/* Mouth/Mouth Screen Smile */}
        {isHappy ? (
          <path d="M52 48 Q60 54 68 48" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" filter="url(#cyanGlow)" />
        ) : (
          <line x1="53" y1="50" x2="67" y2="50" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" filter="url(#cyanGlow)" />
        )}
      </svg>
    </div>
  );
};
