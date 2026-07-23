import { Timestamp } from 'firebase/firestore';

export const normalizeHeader = (header = '') =>
  String(header)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

export const normalizeResult = (value = '') => {
  const result = String(value).trim().toLowerCase();
  if (result === 'profit' || result === 'win') return 'Profit';
  if (result === 'loss' || result === 'lose') return 'Loss';
  return 'NPNL';
};

export const parseTradeDate = (value) => {
  if (!value && value !== 0) return Timestamp.now();

  if (value instanceof Date) {
    return Timestamp.fromDate(value);
  }

  if (typeof value === 'number') {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    return Timestamp.fromDate(date);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return Timestamp.now();

    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return Timestamp.fromDate(parsed);
    }

    const fallback = new Date(trimmed.replace(/-/g, '/'));
    if (!Number.isNaN(fallback.getTime())) {
      return Timestamp.fromDate(fallback);
    }
  }

  return Timestamp.now();
};

export const parseTradeNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]/g, '');
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const normalizeTradeRow = (row, headers = []) => {
  const normalized = {};
  headers.forEach((header, index) => {
    const key = normalizeHeader(header);
    const rawValue = row?.[index] ?? row?.[header] ?? '';

    if (key === 'date') normalized.date = rawValue;
    else if (key === 'symbol') normalized.symbol = String(rawValue ?? '').trim();
    else if (key === 'type') normalized.type = String(rawValue ?? '').trim() || 'Long';
    else if (key === 'entry') normalized.entry = rawValue;
    else if (key === 'stoploss') normalized.stopLoss = rawValue;
    else if (key === 'target') normalized.target = rawValue;
    else if (key === 'result') normalized.result = rawValue;
    else if (key === 'totalpnl' || key === 'totalpl') normalized.totalPnl = rawValue;
    else normalized[key] = rawValue;
  });

  return normalized;
};

export const buildTradePayload = (row, headers = []) => {
  const normalizedRow = normalizeTradeRow(row, headers);
  return {
    date: parseTradeDate(normalizedRow.date),
    symbol: normalizedRow.symbol || '',
    type: normalizedRow.type || 'Long',
    entry: parseTradeNumber(normalizedRow.entry),
    stopLoss: parseTradeNumber(normalizedRow.stopLoss),
    target: parseTradeNumber(normalizedRow.target),
    result: normalizeResult(normalizedRow.result),
    totalPnl: parseTradeNumber(normalizedRow.totalPnl)
  };
};
