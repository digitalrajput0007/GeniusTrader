import React from 'react';

const BrandLogo = ({ compact = false, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`} aria-label="Genius Trader">
    <div className="gt-mark" aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 33.5 18 24l6 5.5L38 14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M30 14h8v8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 38h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".55" />
      </svg>
    </div>
    {!compact && <span className="gt-wordmark">Genius <em>Trader</em></span>}
  </div>
);

export default BrandLogo;
