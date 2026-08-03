import React from 'react';

// Helper function to determine color based on percentage change
const getColorForPercentage = (percent) => {
    if (percent > 2) return 'bg-green-200 hover:bg-green-300 text-green-800';
    if (percent > 0) return 'bg-green-100 hover:bg-green-200 text-green-700';
    if (percent < -2) return 'bg-red-200 hover:bg-red-300 text-red-800';
    if (percent < 0) return 'bg-red-100 hover:bg-red-200 text-red-700';
    return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
};

const Heatmap = ({ data }) => {
    return (
        <div className="gt-heatmap">
            <div className="gt-heatmap__topline">
                <div>
                    <span className="gt-heatmap__eyebrow">Market Snapshot</span>
                    <h2>Nifty 50 Heatmap</h2>
                </div>
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2">
                {data.map(stock => (
                    <div
                        key={stock.symbol}
                        className={`p-2 rounded-md text-center flex flex-col justify-center items-center transition-all duration-200 cursor-pointer ${getColorForPercentage(stock.changePercent)}`}
                        title={`₹${stock.price.toFixed(2)}`}
                    >
                        <p className="text-xs font-bold">{stock.symbol}</p>
                        <p className="text-xs">{stock.changePercent.toFixed(2)}%</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Heatmap;
