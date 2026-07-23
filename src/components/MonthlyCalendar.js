import React from 'react';

const FourMonthCalendar = ({ trades = [] }) => {
  const summary = trades.reduce((acc, trade) => {
    const date = trade.date?.toDate ? trade.date.toDate() : new Date(trade.date || Date.now());
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = { month: key, count: 0, pnl: 0 };
    acc[key].count += 1;
    acc[key].pnl += Number(trade.totalPnl || 0);
    return acc;
  }, {});

  const months = Object.values(summary).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 4);

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">Recent Activity</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {months.length === 0 ? (
          <p className="text-sm text-text-secondary">No trade history yet.</p>
        ) : (
          months.map((item) => {
            const label = new Date(`${item.month}-01`).toLocaleString('default', { month: 'short', year: 'numeric' });
            return (
              <div key={item.month} className="rounded-lg border border-white/10 bg-primary/20 p-4">
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="mt-2 text-sm text-text-secondary">Trades: {item.count}</p>
                <p className={`mt-1 text-sm font-semibold ${item.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  P&L: ₹{Math.round(item.pnl).toLocaleString('en-IN')}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FourMonthCalendar;
