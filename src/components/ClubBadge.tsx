import React from 'react';
import { getClubStyle } from '../constants/clubColors';

interface ClubBadgeProps {
  clubIdOrName: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ClubBadge: React.FC<ClubBadgeProps> = ({ clubIdOrName, size = 'md' }) => {
  const style = getClubStyle(clubIdOrName);
  const initial = clubIdOrName ? clubIdOrName.trim().charAt(0).toUpperCase() : '?';

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm font-extrabold',
    lg: 'w-12 h-12 text-base font-extrabold'
  };

  return (
    <div 
      className={`rounded-full flex items-center justify-center border border-white/20 shadow-lg ${sizeClasses[size]}`}
      style={{
        background: `linear-gradient(135deg, ${style.bgFrom}, ${style.bgTo})`,
        color: style.textColor
      }}
      title={clubIdOrName}
    >
      {initial}
    </div>
  );
};