import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Crown,
  TrendingUp,
  Wallet,
} from 'lucide-react';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const formatCurrency = (value) => currency.format(value);

const buildLinePath = (values, width = 260, height = 140, padding = 18) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values
    .map((value, index) => {
      const x = padding + (index / (values.length - 1)) * (width - padding * 2);
      const normalized = (value - min) / range;
      const y = height - padding - normalized * (height - padding * 2);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const buildAreaPath = (values, width = 260, height = 140, padding = 18) => {
  const linePath = buildLinePath(values, width, height, padding);
  const lastX = width - padding;
  const firstX = padding;
  const baseY = height - padding;
  return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.2)]">
    <div className="h-3 w-20 rounded-full bg-slate-800" />
    <div className="mt-4 h-7 w-24 rounded-full bg-slate-800" />
    <div className="mt-3 h-3 w-28 rounded-full bg-slate-800" />
  </div>
);

const DashboardPage = () => {
  const { userData } = useAuth();
  const isLoading = !userData;

  const kpis = [
    { title: 'Net Profit', value: '$124,280', change: '+12.4%', positive: true, icon: CircleDollarSign },
    { title: "Today's P&L", value: '$4,820', change: '+6.2%', positive: true, icon: TrendingUp },
    { title: 'Total Trades', value: '318', change: '+8', positive: true, icon: BarChart3 },
    { title: 'Win Rate', value: '63.4%', change: '+2.1%', positive: true, icon: Activity },
    { title: 'Profit Factor', value: '2.18', change: '+0.14', positive: true, icon: Wallet },
    { title: 'Avg. R:R', value: '2.7x', change: '+0.3x', positive: true, icon: ArrowUpRight },
    { title: 'Largest Win', value: '$7,240', change: '+11.1%', positive: true, icon: Crown },
    { title: 'Largest Loss', value: '$2,980', change: '-4.8%', positive: false, icon: ArrowDownRight },
  ];

  const equityValues = [24, 29, 26, 33, 30, 38, 44, 48, 46, 54, 58, 63];
  const monthlyValues = [18, 24, 21, 27, 31, 35, 33, 29, 38, 41, 45, 49];
  const drawdownValues = [0, 2, 5, 4, 3, 6, 8, 7, 5, 3, 2, 1];
  const heatmapValues = [0.2, 0.6, 0.3, 0.8, 0.4, 0.7, 0.5, 0.9, 0.1, 0.3, 0.6, 0.4, 0.8, 0.2, 0.7, 0.5];
  const recentTrades = [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%),#020617] p-4 text-slate-100 md:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.3)] backdrop-blur-xl md:flex-row md:items-end md:justify-between">
          <div>
            <div className="h-3 w-28 rounded-full bg-slate-800" />
            <div className="mt-4 h-8 w-56 rounded-full bg-slate-800" />
            <div className="mt-3 h-3 w-72 rounded-full bg-slate-800" />
          </div>
          <div className="h-10 w-32 rounded-full bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_28%),#020617] p-4 text-slate-100 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.3)] backdrop-blur-xl md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-200">
            <Crown size={16} />
            Premium analytics workspace
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Welcome back, {userData?.firstName || 'Trader'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Review execution quality, monitor your edge, and keep every decision grounded in a refined performance view.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
          <Clock3 size={16} className="text-cyan-300" />
          Updated just now
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ title, value, change, positive, icon: Icon }) => (
          <div key={title} className="group rounded-[24px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_18px_45px_rgba(2,6,23,0.2)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_20px_60px_rgba(2,6,23,0.3)]">
            <div className="flex items-center justify-between">
              <div className="rounded-2xl bg-slate-800/70 p-2.5 text-cyan-300">
                <Icon size={17} />
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${positive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
              </span>
            </div>
            <p className="mt-5 text-sm text-slate-400">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Equity curve</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Performance momentum</h2>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
              +18.4% this quarter
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 p-4">
            <svg viewBox="0 0 260 140" className="h-64 w-full">
              <defs>
                <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.01" />
                </linearGradient>
              </defs>
              <path d={buildAreaPath(equityValues)} fill="url(#equityGradient)" />
              <path d={buildLinePath(equityValues)} fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Insights</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Execution quality</h2>
            </div>
            <div className="rounded-full bg-white/5 p-2 text-cyan-300">
              <BarChart3 size={16} />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { label: 'Avg. hold time', value: '4.2h' },
              { label: 'Entries vs exits', value: '1.8:1' },
              { label: 'Risk controlled', value: '94%' },
            ].map((item) => (
              <div key={item.label} className="rounded-[18px] border border-white/10 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between text-sm text-slate-400">
                  <span>{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Monthly performance</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Consistency trend</h2>
            </div>
            <div className="rounded-full bg-white/5 p-2 text-cyan-300">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2 rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 p-4">
            {monthlyValues.map((value, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-[12px] bg-gradient-to-t from-cyan-500/80 to-emerald-400/80" style={{ height: `${Math.max(value, 10)}px` }} />
                <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{['J','F','M','A','M','J','J','A','S','O','N','D'][index]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Drawdown curve</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Risk control</h2>
            </div>
            <div className="rounded-full bg-white/5 p-2 text-cyan-300">
              <Activity size={16} />
            </div>
          </div>
          <div className="mt-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 p-4">
            <svg viewBox="0 0 260 140" className="h-56 w-full">
              <path d={buildLinePath(drawdownValues, 260, 140, 20)} fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Trading calendar</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Heatmap</h2>
            </div>
            <div className="rounded-full bg-white/5 p-2 text-cyan-300">
              <CalendarDays size={16} />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const value = heatmapValues[index % heatmapValues.length];
              const bg = value > 0.75 ? 'bg-emerald-500/80' : value > 0.45 ? 'bg-cyan-500/70' : 'bg-slate-800/80';
              return (
                <div key={index} className={`flex h-10 items-center justify-center rounded-[10px] text-[11px] font-medium text-white ${bg}`}>
                  {index + 1}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Distribution</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Win / loss mix</h2>
            </div>
            <div className="rounded-full bg-white/5 p-2 text-cyan-300">
              <CircleDollarSign size={16} />
            </div>
          </div>
          <div className="mt-8 space-y-5">
            {[
              { label: 'Wins', value: '63%', color: 'from-emerald-400 to-cyan-400' },
              { label: 'Losses', value: '37%', color: 'from-rose-500 to-orange-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span>{item.label}</span>
                  <span className="font-semibold text-white">{item.value}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800">
                  <div className={`h-3 rounded-full bg-gradient-to-r ${item.color}`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/70 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.24)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-300">Recent trades</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Latest activity</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input placeholder="Search symbol, side, status..." className="hidden md:inline-block p-2 rounded-lg bg-primary border border-white/10 text-white" id="dashboard-recent-search" />
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-cyan-400/20 hover:text-white">
              View all
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {recentTrades.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-white/10 bg-slate-950/40 p-8 text-center text-slate-400">
            <p className="text-lg font-medium text-slate-200">No recent trades yet</p>
            <p className="mt-2 text-sm">Your latest executions will appear here once activity is recorded.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[24px] border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="sticky top-0 px-4 py-3 font-medium bg-white/5">Time</th>
                    <th className="sticky top-0 px-4 py-3 font-medium bg-white/5">Symbol</th>
                    <th className="sticky top-0 px-4 py-3 font-medium bg-white/5">Side</th>
                    <th className="sticky top-0 px-4 py-3 font-medium bg-white/5">Size</th>
                    <th className="sticky top-0 px-4 py-3 font-medium bg-white/5">P&L</th>
                    <th className="sticky top-0 px-4 py-3 font-medium bg-white/5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/40 text-slate-300">
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="transition hover:bg-white/5 rounded-md">
                      <td className="px-4 py-3">{trade.time}</td>
                      <td className="px-4 py-3 font-medium text-white">{trade.symbol}</td>
                      <td className="px-4 py-3">{trade.side}</td>
                      <td className="px-4 py-3">{trade.size}</td>
                      <td className={`px-4 py-3 font-semibold ${trade.pnl.startsWith('+') ? 'text-emerald-300' : 'text-rose-300'}`}>{trade.pnl}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs ${trade.status === 'Closed' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-cyan-500/10 text-cyan-300'}`}>
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
