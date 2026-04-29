import React from 'react';

export default function LoadingSpinner({ fullScreen = false, size = 'md', text = '' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizes[size]} border-3 border-slate-700 border-t-eco-500 rounded-full animate-spin`}
           style={{ borderWidth: '3px' }} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <span className="text-4xl">🌱</span>
          <div className="h-10 w-10 border-4 border-slate-700 border-t-eco-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading EcoBeacon...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
