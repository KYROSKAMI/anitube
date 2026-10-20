import React from 'react';

interface AnitubeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const AnitubeLogo: React.FC<AnitubeLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision recreation of Anitube geometric glyph */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_2px_10px_rgba(229,9,20,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Triangular Bold A in crisp white */}
          <path
            d="M50 12L15 84H34L43 65H57L66 84H85L50 12Z"
            fill="#FFFFFF"
          />
          {/* Inner Play arrow badge in signature crimson red */}
          <path
            d="M48 40L63 51L48 62V40Z"
            fill="#E50914"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-black tracking-wider ${textSizes[size]} leading-none`}>
          <span className="text-white">ANI</span>
          <span className="text-[#E50914] tracking-tight">TUBE</span>
        </span>
      )}
    </div>
  );
};
