import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const toLocalDate = (value) => {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const dayKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
const signedMoney = (value) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${money.format(Math.abs(value))}`;

const CalendarMonth = ({ date, dailyPnl, maximum, onDayEnter, onDayLeave }) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const startDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const key = monthKey(date);
  const monthPnl = Object.entries(dailyPnl).filter(([day]) => day.startsWith(key)).reduce((sum, [, value]) => sum + value, 0);
  const cells = Array.from({ length: startDay + totalDays }, (_, index) => index < startDay ? null : index - startDay + 1);

  return <section className="gt-heatmap-month">
    <div className="gt-heatmap-month__header"><h3>{date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</h3><span className={monthPnl > 0 ? 'is-profit' : monthPnl < 0 ? 'is-loss' : ''}>{monthPnl === 0 ? '—' : signedMoney(monthPnl)}</span></div>
    <div className="gt-heatmap-weekdays">{WEEK_DAYS.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
    <div className="gt-heatmap-grid">{cells.map((day, index) => {
      if (!day) return <span key={`blank-${index}`} className="gt-heatmap-day gt-heatmap-day--blank" />;
      const cellDate = new Date(year, month, day);
      const pnl = dailyPnl[dayKey(cellDate)];
      const hasTrade = pnl !== undefined;
      const strength = hasTrade ? Math.max(.22, Math.min(1, Math.abs(pnl) / maximum)) : 0;
      const tone = pnl > 0 ? 'profit' : pnl < 0 ? 'loss' : 'flat';
      return <button key={day} type="button" className={`gt-heatmap-day ${hasTrade ? `gt-heatmap-day--${tone}` : ''}`} style={hasTrade ? { '--heat-strength': strength } : undefined} onMouseEnter={(event) => hasTrade && onDayEnter(event, cellDate, pnl)} onMouseMove={(event) => hasTrade && onDayEnter(event, cellDate, pnl)} onMouseLeave={onDayLeave} onFocus={(event) => hasTrade && onDayEnter(event, cellDate, pnl)} onBlur={onDayLeave} aria-label={hasTrade ? `${cellDate.toLocaleDateString('en-IN')}: ${signedMoney(pnl)}` : cellDate.toLocaleDateString('en-IN')}>
        {day}
      </button>;
    })}</div>
  </section>;
};

const FourMonthCalendar = ({ trades = [] }) => {
  const [tooltip, setTooltip] = useState(null);
  const { dailyPnl, maximum, latestMonth } = useMemo(() => {
    const daily = {};
    let latest = new Date();
    trades.forEach((trade) => {
      const date = toLocalDate(trade.date);
      if (!date) return;
      const key = dayKey(date);
      daily[key] = (daily[key] || 0) + Number(trade.totalPnl || 0);
      if (date > latest) latest = date;
    });
    return { dailyPnl: daily, maximum: Math.max(1, ...Object.values(daily).map((value) => Math.abs(value))), latestMonth: new Date(latest.getFullYear(), latest.getMonth(), 1) };
  }, [trades]);
  const [anchorOffset, setAnchorOffset] = useState(0);
  const anchor = new Date(latestMonth.getFullYear(), latestMonth.getMonth() + anchorOffset, 1);
  const months = Array.from({ length: 6 }, (_, index) => new Date(anchor.getFullYear(), anchor.getMonth() - 3 + index, 1));
  const rangeLabel = `${months[0].toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} – ${months[5].toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;

  const showTooltip = (event, date, pnl) => {
    const bounds = event.currentTarget.closest('.gt-heatmap')?.getBoundingClientRect();
    if (!bounds) return;
    setTooltip({ x: event.clientX - bounds.left, y: event.clientY - bounds.top, date, pnl });
  };

  return <section className="gt-heatmap" aria-label="Daily profit and loss calendar">
    <div className="gt-heatmap__topline"><div><p className="gt-heatmap__eyebrow">DAILY PERFORMANCE</p><h2>Trading calendar</h2></div><div className="gt-heatmap__controls"><span>{rangeLabel}</span><button type="button" onClick={() => { setAnchorOffset((value) => value - 1); setTooltip(null); }} aria-label="View previous months" title="Previous months"><ChevronLeft size={16} /></button><button type="button" onClick={() => { setAnchorOffset((value) => value + 1); setTooltip(null); }} aria-label="View following months" title="Following months"><ChevronRight size={16} /></button></div><div className="gt-heatmap__legend"><span><i className="profit-low" /> Profit</span><span><i className="loss-low" /> Loss</span><span><i className="empty" /> No trades</span></div></div>
    <div className="gt-heatmap__months">{months.map((month) => <CalendarMonth key={monthKey(month)} date={month} dailyPnl={dailyPnl} maximum={maximum} onDayEnter={showTooltip} onDayLeave={() => setTooltip(null)} />)}</div>
    {tooltip && <div className={`gt-heatmap-tooltip ${tooltip.pnl >= 0 ? 'is-profit' : 'is-loss'}`} style={{ left: tooltip.x, top: tooltip.y }} role="status"><strong>{signedMoney(tooltip.pnl)}</strong><span>{tooltip.date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span></div>}
  </section>;
};

export default FourMonthCalendar;
