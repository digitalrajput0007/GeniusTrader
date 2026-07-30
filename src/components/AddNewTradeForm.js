import React, { useState, useEffect } from 'react';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

const AddNewTradeForm = ({ currentUser, onTradeAdded }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Long',
    entry: '',
    stopLoss: '',
    target: '',
    result: 'NPNL',
    totalPnl: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const entryPrice = parseFloat(formData.entry);
    if (!isNaN(entryPrice)) {
      const calculatedStopLoss = formData.type === 'Long' ? entryPrice - 20 : entryPrice + 20;
      setFormData(prev => ({ ...prev, stopLoss: calculatedStopLoss.toFixed(2) }));
    } else {
      setFormData(prev => ({ ...prev, stopLoss: '' }));
    }
  }, [formData.entry, formData.type]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      toast.error('Please sign in to add a trade.');
      return;
    }

    setSubmitting(true);
    try {
      const tradeToSave = {
        symbol: formData.symbol.trim(),
        date: Timestamp.fromDate(new Date(`${formData.date}T12:00:00`)),
        type: formData.type,
        entry: Number(formData.entry) || 0,
        stopLoss: Number(formData.stopLoss) || 0,
        target: Number(formData.target) || 0,
        result: formData.result,
        totalPnl: Number(formData.totalPnl) || 0
      };

      const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'performance_data'), tradeToSave);
      onTradeAdded({ ...tradeToSave, id: docRef.id });
      toast.success('Trade added successfully.');
      setFormData({
        symbol: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Long',
        entry: '',
        stopLoss: '',
        target: '',
        result: 'NPNL',
        totalPnl: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Unable to add trade.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-white/10 bg-surface/50 p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Add New Trade</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <select name="symbol" value={formData.symbol} onChange={handleChange} className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none" required>
          <option value="" disabled>Select symbol</option>
          <option value="NIFTY">NIFTY</option>
          <option value="SENSEX">SENSEX</option>
          <option value="BANKNIFTY">BANKNIFTY</option>
        </select>
        <input name="date" type="date" value={formData.date} onChange={handleChange} className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none" required />
        <select name="type" value={formData.type} onChange={handleChange} className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none">
          <option>Long</option>
          <option>Short</option>
        </select>
        <select name="result" value={formData.result} onChange={handleChange} className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none">
          <option>Profit</option>
          <option>Loss</option>
          <option>NPNL</option>
        </select>
        <input name="entry" type="number" step="0.01" value={formData.entry} onChange={handleChange} placeholder="Entry" className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none" />
        <input name="stopLoss" type="number" step="0.01" value={formData.stopLoss} onChange={handleChange} placeholder="Stop Loss" className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none" readOnly />
        <input name="target" type="number" step="0.01" value={formData.target} onChange={handleChange} placeholder="Target" className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none" />
        <input name="totalPnl" type="number" step="0.01" value={formData.totalPnl} onChange={handleChange} placeholder="Total P&L" className="rounded-lg border border-white/10 bg-primary p-2 text-text-primary outline-none" />
      </div>
      <div className="mt-4">
        <button type="submit" disabled={submitting} className="rounded-lg bg-secondary px-4 py-2 font-semibold text-white transition hover:bg-secondary/80 disabled:opacity-60">
          {submitting ? 'Saving...' : 'Save Trade'}
        </button>
      </div>
    </form>
  );
};

export default AddNewTradeForm;