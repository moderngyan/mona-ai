import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GlassCard = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "relative backdrop-blur-3xl bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
      {...props}
    >
      {/* Subtle edge glow */}
      <div className="absolute inset-0 border border-white/5 rounded-3xl pointer-events-none" />
      {/* Light sweep sweep effect */}
      <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-white/5 to-transparent rotate-12 pointer-events-none" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default GlassCard;
