import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const GlowButton = ({ 
  variant = 'primary', 
  glowColor = 'cyan', 
  children, 
  icon, 
  className, 
  disabled,
  ...props 
}) => {
  const variants = {
    primary: "bg-white text-black hover:bg-nebula-cyan disabled:bg-white/20 disabled:text-slate-500",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  };

  const glows = {
    cyan: "shadow-[0_0_20px_rgba(0,245,255,0.15)] hover:shadow-[0_0_35px_rgba(0,245,255,0.3)]",
    purple: "shadow-[0_0_20px_rgba(157,0,255,0.15)] hover:shadow-[0_0_35px_rgba(157,0,255,0.3)]",
    gold: "shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_35px_rgba(245,158,11,0.3)]",
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center gap-2.5 px-6 py-3 rounded-2xl font-black tracking-wide transition-all duration-300 overflow-hidden disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        variant !== 'ghost' && !disabled && glows[glowColor],
        className
      )}
      {...props}
    >
      {/* Shimmer on primary */}
      {variant === 'primary' && !disabled && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full hover:animate-nebula-shimmer pointer-events-none" />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="uppercase text-[11px] tracking-[0.2em]">{children}</span>
    </motion.button>
  );
};

export default GlowButton;

