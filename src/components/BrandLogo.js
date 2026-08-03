import React from 'react';

const BrandLogo = ({ className = '' }) => (
    <div
        className={`flex items-center text-white ${className}`}
        aria-label="Genius Trader"
    >
        <svg
            width="42"
            height="42"
            viewBox="0 0 42 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-3"
            aria-hidden="true"
        >
            <rect width="42" height="42" rx="12" fill="#1D4ED8" />
            <path
                d="M28.6667 14.8333C28.6667 13.5623 27.9103 12.3931 26.705 11.8519C25.4997 11.3107 24.0384 11.4852 23 12.25L15.5833 17.5833C14.7992 18.1065 14.1611 18.8258 13.7383 19.6667C13.3155 20.5075 13.1238 21.4406 13.1833 22.3833C13.2429 23.3261 13.5516 24.2348 14.0833 25.0333L17.25 30.3333"
                stroke="#93C5FD"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21 21L28.6667 21C29.6333 21 30.5 21.5 31 22.3333L31.6667 23.6667C32.1667 24.5 32.1667 25.5 31.6667 26.3333L31 27.6667C30.5 28.5 29.6333 29 28.6667 29H25.3333"
                stroke="#93C5FD"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
        <div className="flex flex-col justify-center">
            <span className="text-xl font-bold tracking-tighter lh-1">
                Genius Trader
            </span>
        </div>
    </div>
);

export default BrandLogo;
