import React from 'react';

interface HaysSonsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  lightMode?: boolean;
}

export const HaysSonsBadge: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10';

  return (
    <div className={`relative ${dims} flex items-center justify-center shrink-0`}>
      <svg viewBox="0 0 74 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Left vertical red bar */}
        <rect x="2" y="6" width="16" height="52" fill="#D32F2F" />
        {/* Horizontal black crossbar bridging red bar into the plus */}
        <rect x="18" y="24" width="54" height="16" fill="#000000" />
        {/* Vertical black bar of the plus sign */}
        <rect x="37" y="8" width="16" height="48" fill="#000000" />
      </svg>
    </div>
  );
};

export const HaysSonsLogo: React.FC<HaysSonsLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = true,
  lightMode = false,
}) => {
  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Stylized H+ Badge */}
      <HaysSonsBadge size={size} />

      {/* Brand Wordmark & Tagline */}
      <div className="flex flex-col">
        <div className="flex items-baseline tracking-tight">
          <span
            className={`font-black tracking-tight ${
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
            } ${lightMode ? 'text-white' : 'text-[#111827]'}`}
          >
            Hays
          </span>
          <span className="mx-1 text-[#D32F2F] font-black text-xl leading-none">+</span>
          <span
            className={`font-black tracking-tight ${
              size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
            } ${lightMode ? 'text-white' : 'text-[#111827]'}`}
          >
            Sons
          </span>
        </div>
        {showTagline && (
          <span
            className={`text-[11px] font-semibold tracking-wide uppercase ${
              lightMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            We Do Restoration Right
          </span>
        )}
      </div>
    </div>
  );
};

export default HaysSonsLogo;
