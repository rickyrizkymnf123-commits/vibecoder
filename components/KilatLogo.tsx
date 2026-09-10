'use client';

import React from 'react';

interface KilatLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function KilatLogo({ size = 'md', showText = true, className = '' }: KilatLogoProps) {
  const badgeSize =
    size === 'sm'
      ? 'w-7 h-7 rounded-lg'
      : size === 'lg'
      ? 'w-10 h-10 rounded-2xl'
      : 'w-8 h-8 rounded-xl';

  const iconSize =
    size === 'sm'
      ? 'w-4 h-4'
      : size === 'lg'
      ? 'w-6 h-6'
      : 'w-5 h-5';

  const textSize =
    size === 'sm'
      ? 'text-sm'
      : size === 'lg'
      ? 'text-xl'
      : 'text-base';

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Dark Obsidian Glass Badge (Zero Blurry Halo) */}
      <div
        className={`relative ${badgeSize} bg-[#0a0f1d] border border-slate-800 hover:border-amber-400/50 flex items-center justify-center shadow-lg shadow-black/60 transition-all duration-300 overflow-hidden shrink-0 group`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-cyan-500/5 pointer-events-none" />

        {/* Hero Flash / Avengers Electric SVG Lightning Bolt */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSize} relative z-10 animate-bolt-flicker`}
        >
          <path
            d="M3 13L6 11.5M18 12.5L21 11M5 5L7.5 7.5M19 19L16.5 16.5"
            stroke="#38bdf8"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="animate-electric-crackle opacity-75"
          />
          <path
            d="M13.5 2L4 13.5H11.5L9.5 22L20 10.5H12.5L14.5 2H13.5Z"
            fill="url(#kilatGradient)"
            stroke="#f59e0b"
            strokeWidth="0.75"
            strokeLinejoin="round"
          />
          <path
            d="M13 4L5.8 13H11.5L10.2 19.5L18 11H12.5L13.8 4H13Z"
            fill="#ffffff"
            opacity="0.95"
          />
          <defs>
            <linearGradient id="kilatGradient" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="0.3" stopColor="#fef08a" />
              <stop offset="0.7" stopColor="#f59e0b" />
              <stop offset="1" stopColor="#d97706" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Sliced Lightning Font: Slices, Glitches/Shatters, Snaps Back Whole, and Loops */}
      {showText && (
        <div className="kilat-slice-wrapper leading-none">
          {/* Top Half Slice */}
          <div className={`kilat-slice-top ${textSize} font-black tracking-tight flex items-center gap-1.5`}>
            <span className="text-amber-400">Kilat</span>
            <span className="text-white">Tools</span>
          </div>

          {/* Bottom Half Slice */}
          <div className={`kilat-slice-bottom ${textSize} font-black tracking-tight flex items-center gap-1.5`}>
            <span className="text-amber-400">Kilat</span>
            <span className="text-white">Tools</span>
          </div>

          {/* Cutting Lightning Bolt Arc (Electric Blade that Slices Through the Font) */}
          <svg className="kilat-cut-bolt" viewBox="0 0 160 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 4L28 1L52 6L80 2L105 7L132 2L160 5"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0 4L28 1L52 6L80 2L105 7L132 2L160 5"
              stroke="#38bdf8"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />
          </svg>

          {/* Subtle cyan electric dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse ml-1.5 shrink-0" />
        </div>
      )}
    </div>
  );
}
