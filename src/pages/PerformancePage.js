import React, { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp, addDoc } from 'firebase/firestore';
import ExcelUpload from '../components/ExcelUpload';
import * as XLSX from 'xlsx';
import { Upload, Edit, Trash2, Check, ArrowDown, ArrowUp, CheckCircle, XCircle, MinusCircle, TrendingUp, TrendingDown, Calendar, BarChart2, Zap, Target, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AddNewTradeForm from '../components/AddNewTradeForm';
import FourMonthCalendar from '../components/MonthlyCalendar';
import { ResponsiveLine } from '@nivo/line';
import { motion } from 'framer-motion';
import { buildTradePayload } from '../utils/tradeImport';

const PerformancePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [trades, setTrades] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [editing, setEditing] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [timeRange, setTimeRange] = useState('This Month');
    const [customDate, setCustomDate] = useState({ startDate: '', endDate: '' });

    const headers = ["Date", "Symbol", "Type", "Entry", "Stop Loss", "Target", "Result", "Total P&L"];

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (user) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setTrades([]);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        const fetchTrades = async () => {
            try {
                const tradesCollectionRef = collection(db, "users", currentUser.uid, "performance_data");
                const querySnapshot = await getDocs(tradesCollectionRef);
                const tradesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTrades(tradesData);
            } catch (error) {
                toast.error("Failed to fetch trades.");
            }
        };
        fetchTrades();
    }, [currentUser]);

    const monthlySummary = useMemo(() => {
        const summary = {};
        trades.forEach(trade => {
            const date = trade.date.toDate();
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!summary[month]) {
                summary[month] = { month, totalPnl: 0, profitTrades: 0, lossTrades: 0, npnlTrades: 0, totalTrades: 0 };
            }
            summary[month].totalPnl += trade.totalPnl;
            summary[month].totalTrades++;
            if (trade.result === 'Profit') {
                summary[month].profitTrades++;
            } else if (trade.result === 'Loss') {
                summary[month].lossTrades++;
            } else if (trade.result === 'NPNL') {
                summary[month].npnlTrades++;
            }
        });

        return Object.values(summary).map(monthData => ({
            ...monthData,
            accuracy: monthData.totalTrades > 0 ? ((monthData.profitTrades / (monthData.profitTrades + monthData.lossTrades)) * 100) : 0
        })).sort((a, b) => b.month.localeCompare(a.month));
    }, [trades]);

    const kpis = useMemo(() => {
        if (monthlySummary.length === 0) return {};

        const bestPnlMonth = monthlySummary.reduce((prev, current) => (prev.totalPnl > current.totalPnl) ? prev : current);
        const worstPnlMonth = monthlySummary.reduce((prev, current) => (prev.totalPnl < current.totalPnl) ? prev : current);
        const bestAccuracyMonth = monthlySummary.reduce((prev, current) => (prev.accuracy > current.accuracy) ? prev : current);
        const worstAccuracyMonth = monthlySummary.reduce((prev, current) => (prev.accuracy < current.accuracy) ? prev : current);

        return {
            bestPnl: `${new Date(bestPnlMonth.month).toLocaleString('default', { month: 'short', year: 'numeric' })} (₹${Math.round(bestPnlMonth.totalPnl).toLocaleString('en-IN')})`,
            worstPnl: `${new Date(worstPnlMonth.month).toLocaleString('default', { month: 'short', year: 'numeric' })} (₹${Math.round(worstPnlMonth.totalPnl).toLocaleString('en-IN')})`,
            bestAccuracy: `${new Date(bestAccuracyMonth.month).toLocaleString('default', { month: 'short', year: 'numeric' })} (${bestAccuracyMonth.accuracy.toFixed(2)}%)`,
            worstAccuracy: `${new Date(worstAccuracyMonth.month).toLocaleString('default', { month: 'short', year: 'numeric' })} (${worstAccuracyMonth.accuracy.toFixed(2)}%)`,
        };
    }, [monthlySummary]);

    const stats = useMemo(() => {
        const data = selectedMonth === 'All' ? trades : trades.filter(t => {
            const date = t.date.toDate();
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            return month === selectedMonth;
        });

        const totalTrades = data.length;
        const winningTrades = data.filter(t => t.result === 'Profit').length;
        const losingTrades = data.filter(t => t.result === 'Loss').length;
        const npnlTrades = data.filter(t => t.result === 'NPNL').length;
        const winRate = totalTrades > 0 ? (winningTrades / (winningTrades + losingTrades)) * 100 : 0;

        return { totalTrades, winningTrades, losingTrades, npnlTrades, winRate };
    }, [trades, selectedMonth]);

    const streakData = useMemo(() => {
        if (trades.length === 0) {
            return { currentWinningStreak: 0, bestWinningStreak: 0, currentLosingStreak: 0, worstLosingStreak: 0 };
        }
    
        const sorted = [...trades].sort((a, b) => a.date.toDate() - b.date.toDate());
    
        let currentWinningStreak = 0;
        let bestWinningStreak = 0;
        let currentLosingStreak = 0;
        let worstLosingStreak = 0;

        sorted.forEach(trade => {
            if (trade.result === 'Profit') {
                currentLosingStreak = 0;
                currentWinningStreak++;
            } else if (trade.result === 'Loss') {
                currentWinningStreak = 0;
                currentLosingStreak++;
            } else {
                currentWinningStreak = 0;
                currentLosingStreak = 0;
            }
    
            if (currentWinningStreak > bestWinningStreak) {
                bestWinningStreak = currentWinningStreak;
            }
            if (currentLosingStreak > worstLosingStreak) {
                worstLosingStreak = currentLosingStreak;
            }
        });

        const lastTrade = sorted[sorted.length - 1];
        let finalCurrentWinning = 0;
        let finalCurrentLosing = 0;

        if(lastTrade.result === 'Profit') finalCurrentWinning = currentWinningStreak;
        if(lastTrade.result === 'Loss') finalCurrentLosing = currentLosingStreak;


        return { 
            currentWinningStreak: finalCurrentWinning,
            bestWinningStreak: bestWinningStreak,
            currentLosingStreak: finalCurrentLosing,
            worstLosingStreak: worstLosingStreak
         };
    }, [trades]);

    const longShortData = useMemo(() => {
        const longTrades = trades.filter(t => t.type === 'Long');
        const shortTrades = trades.filter(t => t.type === 'Short');
        const longNet = longTrades.reduce((acc, trade) => acc + trade.totalPnl, 0);
        const shortNet = shortTrades.reduce((acc, trade) => acc + trade.totalPnl, 0);
        const longAccuracy = longTrades.length > 0 ? (longTrades.filter(t => t.result === 'Profit').length / longTrades.length) * 100 : 0;
        const shortAccuracy = shortTrades.length > 0 ? (shortTrades.filter(t => t.result === 'Profit').length / shortTrades.filter(t => t.result !== 'NPNL').length) * 100 : 0;

        return {
            longNet,
            shortNet,
            longAccuracy,
            shortAccuracy
        }
    }, [trades]);

    const lineGraphData = useMemo(() => {
        let dataForGraph = [];
        const now = new Date();
    
        switch (timeRange) {
            case 'Last 7 Days':
                const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
                dataForGraph = trades.filter(t => t.date.toDate() >= sevenDaysAgo);
                break;
            case 'Last 30 Days':
                const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
                dataForGraph = trades.filter(t => t.date.toDate() >= thirtyDaysAgo);
                break;
            case 'This Month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                dataForGraph = trades.filter(t => t.date.toDate() >= startOfMonth);
                break;
            case 'Previous Month':
                const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                prevMonthEnd.setHours(23, 59, 59, 999);
                dataForGraph = trades.filter(t => {
                    const tradeDate = t.date.toDate();
                    return tradeDate >= prevMonthStart && tradeDate <= prevMonthEnd;
                });
                break;
            case 'Current Year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                dataForGraph = trades.filter(t => t.date.toDate() >= startOfYear);
                break;
            case 'Custom Date':
                if (customDate.startDate && customDate.endDate) {
                    const start = new Date(customDate.startDate);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(customDate.endDate);
                    end.setHours(23, 59, 59, 999);
                    dataForGraph = trades.filter(t => {
                        const tradeDate = t.date.toDate();
                        return tradeDate >= start && tradeDate <= end;
                    });
                }
                break;
            default:
                dataForGraph = trades;
        }
    
        if (dataForGraph.length === 0) return [];
    
        const sorted = dataForGraph.sort((a, b) => a.date.toDate() - b.date.toDate());
    
        const dailyPnl = {};
        sorted.forEach(trade => {
            const date = trade.date.toDate().toISOString().split('T')[0];
            if (!dailyPnl[date]) {
                dailyPnl[date] = 0;
            }
            dailyPnl[date] += trade.totalPnl;
        });

        let cumulativePnl = 0;
        const pnlOverTime = Object.keys(dailyPnl).map(date => {
            cumulativePnl += dailyPnl[date];
            return {
                x: new Date(date),
                y: Math.round(cumulativePnl),
                dailyPnl: Math.round(dailyPnl[date])
            };
        }).sort((a,b) => a.x - b.x);

        return [{ id: 'Cumulative P&L', data: pnlOverTime }];
    }, [trades, timeRange, customDate]);

    const sortedTrades = useMemo(() => {
        let sortableItems = [...trades];
        sortableItems.sort((a, b) => {
            const aDate = a.date?.toDate ? a.date.toDate() : new Date(0);
            const bDate = b.date?.toDate ? b.date.toDate() : new Date(0);
            return bDate - aDate;
        });

        if (sortConfig.key && sortConfig.direction) {
            sortableItems.sort((a, b) => {
                const key = sortConfig.key;
                const aValue = a[key];
                const bValue = b[key];

                let compare = 0;
                if (key === 'date') {
                    const aDate = aValue?.toDate ? aValue.toDate() : new Date(0);
                    const bDate = bValue?.toDate ? bValue.toDate() : new Date(0);
                    if (aDate < bDate) compare = -1;
                    if (aDate > bDate) compare = 1;
                } else {
                     if (aValue < bValue) compare = -1;
                     if (aValue > bValue) compare = 1;
                }

                return sortConfig.direction === 'asc' ? compare : -compare;
            });
        }
        return sortableItems;
    }, [trades, sortConfig]);


    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = null;
            key = null;
        }
        setSortConfig({ key, direction });
    };

    const handleDataUpload = async (uploadedData) => {
        if (!currentUser) return toast.error("You must be logged in to upload trades.");
        
        const tradesCollectionRef = collection(db, "users", currentUser.uid, "performance_data");
        const existingTradesSnapshot = await getDocs(tradesCollectionRef);
        const existingTrades = existingTradesSnapshot.docs.map(doc => doc.data());

        const newTrades = [];
        let duplicateCount = 0;
        const total = uploadedData.data.length;
        setUploadProgress({ completed: 0, total });

        try {
            for (const [index, row] of uploadedData.data.entries()) {
                if (!Array.isArray(row)) continue;

                const tradeToSave = buildTradePayload(row, uploadedData.headers);

                const isDuplicate = existingTrades.some(existingTrade => {
                    const existingDate = existingTrade.date?.toDate ? existingTrade.date.toDate().getTime() : 0;
                    const incomingDate = tradeToSave.date?.toDate ? tradeToSave.date.toDate().getTime() : 0;
                    return existingDate === incomingDate &&
                           existingTrade.type === tradeToSave.type &&
                           existingTrade.entry === tradeToSave.entry;
                });

                if (isDuplicate) {
                    duplicateCount++;
                } else {
                    const docRef = await addDoc(tradesCollectionRef, tradeToSave);
                    newTrades.push({ ...tradeToSave, id: docRef.id });
                    existingTrades.push(tradeToSave);
                }

                setUploadProgress({ completed: index + 1, total });
            }

            setTrades(prev => [...newTrades, ...prev]);
            let message = `${newTrades.length} trades imported successfully!`;
            if (duplicateCount > 0) {
                message += ` ${duplicateCount} duplicate trades were skipped.`
            }
            toast.success(message);

        } catch (error) {
            toast.error("An error occurred during import.");
            console.error("Import Error: ", error);
        } finally {
            setTimeout(() => {
                setIsModalOpen(false);
                setUploadProgress(null);
            }, 1500);
        }
    };    
    const onTradeAdded = (newTrade) => {
        setTrades(prev => [newTrade, ...prev]);
    }

    const handleUpdateTrade = async () => {
        if (!currentUser || !editing) return;
        const tradeDocRef = doc(db, "users", currentUser.uid, "performance_data", editing.id);
        const { id, ...tradeData } = editing;
        const updatedData = {
            ...tradeData,
            date: Timestamp.fromDate(new Date(editing.date)),
            entry: Number(editing.entry),
            stopLoss: Number(editing.stopLoss),
            target: Number(editing.target),
            totalPnl: Number(editing.totalPnl)
        };
        try {
            await updateDoc(tradeDocRef, updatedData);
            setTrades(prev => prev.map(t => t.id === editing.id ? { ...updatedData, id: editing.id } : t));
            setEditing(null);
            toast.success("Trade updated successfully!");
        } catch (error) {
            toast.error("Failed to update trade.");
        }
    };    
    const handleDelete = (id) => {
        setTradeToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleBulkDelete = () => {
        if (selected.size === 0) return;
        setTradeToDelete(Array.from(selected));
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!currentUser || !tradeToDelete) return;

        try {
            if (Array.isArray(tradeToDelete)) {
                const deletePromises = tradeToDelete.map(id => deleteDoc(doc(db, "users", currentUser.uid, "performance_data", id)));
                await Promise.all(deletePromises);
                setTrades(prev => prev.filter(t => !tradeToDelete.includes(t.id)));
                setSelected(new Set());
                toast.success("Selected trades deleted.");
            } else {
                const tradeDocRef = doc(db, "users", currentUser.uid, "performance_data", tradeToDelete);
                await deleteDoc(tradeDocRef);
                setTrades(prev => prev.filter(t => t.id !== tradeToDelete));
                toast.success("Trade deleted.");
            }
        } catch (error) {
            toast.error("Failed to delete trade(s).");
        } finally {
            setIsDeleteModalOpen(false);
            setTradeToDelete(null);
        }
    };

    const toggleSelect = (id) => {
        const newSelected = new Set(selected);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelected(newSelected);
    };

    const toggleSelectAll = () => {
        if (selected.size === trades.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(trades.map(t => t.id)));
        }
    };

    const createSampleExcel = () => {
        const sampleData = [
            headers,
            ["2023-10-26", "AAPL", "Long", 170.50, 168.00, 175.00, "Profit", 4.75],
            ["2023-10-25", "GOOG", "Short", 138.90, 140.00, 137.00, "Loss", -1.40],
        ];
        const ws = XLSX.utils.aoa_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, "sample.xlsx");
    };

    const renderCell = (trade, header) => {
        let key = header.toLowerCase().replace(/\s+/g, '');
        if (key === 'totalp&l') key = 'totalPnl';
        if (key === 'stoploss') key = 'stopLoss';

        if (editing?.id === trade.id) {
            if (key === 'result') {
                return <td className="p-1 text-center"><select value={editing[key]} onChange={(e) => setEditing({...editing, result: e.target.value})} className="w-full p-1 bg-gray-700 rounded"><option>Profit</option><option>Loss</option><option>NPNL</option></select></td>;
            } 
            if (key === 'type') {
                return <td className="p-1 text-center"><select value={editing[key]} onChange={(e) => setEditing({...editing, type: e.target.value})} className="w-full p-1 bg-gray-700 rounded"><option>Long</option><option>Short</option></select></td>;
            }
            if (key === 'date') {
                const dateValue = editing.date?.toDate ? editing.date.toDate().toISOString().split('T')[0] : editing.date;
                return <td className="p-1 text-center"><input type="date" value={dateValue} onChange={(e) => setEditing({...editing, date: e.target.value})} className="w-full p-1 bg-gray-700 rounded"/></td>;
            }
            return <td className="p-1 text-center"><input type={typeof editing[key] === 'number' ? 'number' : 'text'} value={editing[key]} onChange={(e) => setEditing({...editing, [key]: e.target.value})} className="w-full p-1 bg-gray-700 rounded"/></td>;
        }

        let cellValue = trade[key];
        if (key === 'date' && cellValue) {
            cellValue = cellValue.toDate().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
        } else if (['entry', 'stopLoss', 'target', 'totalPnl'].includes(key)) {
            cellValue = `₹${Math.round(Number(cellValue)).toLocaleString('en-IN')}`;
        }

        const pnlClass = key === 'totalPnl' && parseFloat(trade[key]) > 0 ? 'text-green-400' : key === 'totalPnl' && parseFloat(trade[key]) < 0 ? 'text-red-400' : '';
        return <td className={`p-2 text-center ${pnlClass}`}>{cellValue}</td>;
    }

    const renderSortArrow = (key) => {
        if (sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') return <ArrowUp size={14} className="ml-1" />;
        return <ArrowDown size={14} className="ml-1" />;
    };

    const StatCard = ({ title, value, icon, isLoading }) => {
        const Icon = icon;
        if (isLoading) {
            return (
                <div className="bg-surface/50 backdrop-blur-sm p-5 rounded-xl border border-white/10 shadow-soft h-full">
                    <div className="animate-pulse flex flex-col justify-between h-full">
                        <div className="h-4 bg-text-tertiary rounded w-3/4 mb-2"></div>
                        <div className="h-8 bg-text-tertiary rounded w-1/2"></div>
                    </div>
                </div>
            )
        }
        return (
            <motion.div 
                className="bg-surface/50 backdrop-blur-sm p-5 rounded-xl border border-white/10 shadow-soft flex flex-col justify-between h-full"
                whileHover={{ scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
            >
                <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-text-secondary">{title}</p>
                    <Icon className="text-text-tertiary" size={20} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-text-primary mt-2">{value}</h3>
                </div>
            </motion.div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Performance</h1>
                {currentUser && (
                    <motion.button 
                        onClick={() => setIsModalOpen(true)} 
                        className="p-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Upload Trades"
                    >
                        <Upload size={20} />
                    </motion.button>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <motion.div 
                        className="bg-surface rounded-xl p-8 w-full max-w-4xl border border-white/10 shadow-lifted"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                    >
                        <ExcelUpload onDataUpload={handleDataUpload} createSampleExcel={createSampleExcel} />
                        
                        {uploadProgress && (
                            <div className="mt-6">
                                <div className="text-center mb-2 font-semibold text-text-primary">{`Importing... ${uploadProgress.completed} / ${uploadProgress.total} trades completed.`}</div>
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                    <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}></div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end mt-6">
                            <button 
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setUploadProgress(null);
                                }} 
                                className="bg-surface/80 hover:bg-surface text-text-primary font-bold py-2 px-4 rounded-lg transition"
                                disabled={uploadProgress && uploadProgress.completed < uploadProgress.total}
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <motion.div 
                        className="bg-surface rounded-xl p-8 w-full max-w-md border border-white/10 shadow-lifted"
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                    >
                        <h2 className="text-xl font-bold mb-4 text-text-primary">Confirm Deletion</h2>
                        <p className="text-text-secondary">Are you sure you want to permanently delete {Array.isArray(tradeToDelete) ? `${tradeToDelete.length} trades` : 'this trade'}? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4 mt-6">
                            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="bg-surface/80 hover:bg-surface text-text-primary font-bold py-2 px-4 rounded-lg transition">Cancel</button>
                            <button type="button" onClick={confirmDelete} className="bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition">Delete</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {currentUser && (
                <>
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-text-primary">Analytics</h2>
                        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="bg-surface border-white/10 border text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="All">All Months</option>
                            {monthlySummary.map(s => <option key={s.month} value={s.month}>{new Date(s.month).toLocaleString('default', { month: 'short', year: 'numeric' })}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                        <StatCard title="Total Trades" value={stats.totalTrades} icon={BarChart2} isLoading={!trades.length} />
                        <StatCard title="Winning Trades" value={stats.winningTrades} icon={CheckCircle} isLoading={!trades.length} />
                        <StatCard title="Losing Trades" value={stats.losingTrades} icon={XCircle} isLoading={!trades.length} />
                        <StatCard title="NPNL Trades" value={stats.npnlTrades} icon={MinusCircle} isLoading={!trades.length} />
                        <div className="bg-surface/50 backdrop-blur-sm p-5 rounded-xl border border-white/10 shadow-soft flex flex-col justify-center items-center">
                             <p className="text-sm font-medium text-text-secondary mb-2">Win Rate</p>
                             <div className="w-full bg-surface rounded-full h-4">
                                <motion.div 
                                    className="bg-primary h-4 rounded-full"
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${stats.winRate.toFixed(2)}%` }} 
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className="text-lg font-bold mt-2 text-text-primary">{stats.winRate.toFixed(2)}%</p>
                        </div>
                    </div>

                    <motion.div 
                        className="bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-soft mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold text-text-primary mb-4">Monthly Analysis</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-white/10 text-text-secondary">
                                    <tr>
                                        <th className="p-3 text-left font-semibold">Month</th>
                                        <th className="p-3 text-center font-semibold">Net P&L (₹)</th>
                                        <th className="p-3 text-center font-semibold">Accuracy (%)</th>
                                        <th className="p-3 text-center font-semibold">Total Trades</th>
                                        <th className="p-3 text-center font-semibold">Profit Trades</th>
                                        <th className="p-3 text-center font-semibold">Loss Trades</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-primary">
                                    {monthlySummary.map(s => (
                                        <tr key={s.month} className="border-b border-white/5 last:border-b-0 hover:bg-surface/70 transition-colors">
                                            <td className="p-3 text-left">{new Date(s.month).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                                            <td className={`p-3 text-center font-bold ${s.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{Math.round(s.totalPnl).toLocaleString('en-IN')}</td>
                                            <td className="p-3 text-center">{s.accuracy.toFixed(2)}%</td>
                                            <td className="p-3 text-center">{s.totalTrades}</td>
                                            <td className="p-3 text-center text-green-400">{s.profitTrades}</td>
                                            <td className="p-3 text-center text-red-400">{s.lossTrades}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-soft mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-text-primary">Cumulative P&L</h2>
                            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="bg-surface border-white/10 border text-sm rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Month</option>
                                <option>Previous Month</option>
                                <option>Current Year</option>
                                <option>Custom Date</option>
                            </select>
                        </div>
                        {timeRange === 'Custom Date' && (
                             <div className="flex items-center space-x-2 mb-4">
                                <input type="date" value={customDate.startDate} onChange={e => setCustomDate({...customDate, startDate: e.target.value})} className="bg-surface border-white/10 border text-sm rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"/>
                                <span className="text-text-secondary">to</span>
                                <input type="date" value={customDate.endDate} onChange={e => setCustomDate({...customDate, endDate: e.target.value})} className="bg-surface border-white/10 border text-sm rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"/>
                            </div>
                        )}
                        {lineGraphData.length > 0 && lineGraphData[0].data.length > 0 ? (
                            <div className="h-96">
                                <ResponsiveLine
                                    data={lineGraphData}
                                    margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
                                    xScale={{ type: 'time', format: 'native' }}
                                    yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                                    axisTop={null}
                                    axisRight={null}
                                    axisBottom={{
                                        format: '%b %d',
                                        tickValues: 'every 2 days',
                                        legend: 'Date',
                                        legendOffset: 45,
                                        legendPosition: 'middle',
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                    }}
                                    axisLeft={{
                                        legend: 'Cumulative P&L (₹)',
                                        legendOffset: -70,
                                        legendPosition: 'middle',
                                        tickSize: 5,
                                        tickPadding: 5,
                                        tickRotation: 0,
                                    }}
                                    colors={['#34D399']}
                                    lineWidth={3}
                                    enablePoints={false}
                                    useMesh={true}
                                    enableGridX={false}
                                    gridYValues={5}
                                    theme={{
                                        axis: {
                                            ticks: { text: { fill: '#A1A1AA' } },
                                            legend: { text: { fill: '#A1A1AA', fontSize: 14 } },
                                        },
                                        grid: { line: { stroke: '#52525B', strokeDasharray: '3 3' } },
                                        tooltip: { container: { background: '#1C1C1C', color: '#E4E4E7', fontSize: '12px', borderRadius: '6px', border: '1px solid #52525B' } },
                                    }}
                                    tooltip={({ point }) => {
                                        const pnl = point.data.dailyPnl;
                                        const pnlColor = pnl >= 0 ? '#34D399' : '#F87171';
                                        return (
                                            <div className="p-2 rounded-md shadow-lg">
                                                <strong className="text-text-primary">{point.data.x.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong><br />
                                                <span style={{ color: pnlColor }}>Daily P&L: ₹{pnl.toLocaleString('en-IN')}</span><br />
                                                <span className="text-text-secondary">Cumulative: ₹{point.data.y.toLocaleString('en-IN')}</span>
                                            </div>
                                        )
                                    }}
                                />
                            </div>
                        ) : <p className="text-center text-text-secondary py-16">No data available for this period.</p>}
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard title="Winning Streak" value={`${streakData.currentWinningStreak} (Best: ${streakData.bestWinningStreak})`} icon={Zap} isLoading={!trades.length} />
                        <StatCard title="Losing Streak" value={`${streakData.currentLosingStreak} (Worst: ${streakData.worstLosingStreak})`} icon={Zap} isLoading={!trades.length} />
                        <StatCard title="Best P&L Month" value={kpis.bestPnl} icon={TrendingUp} isLoading={!trades.length} />
                        <StatCard title="Worst P&L Month" value={kpis.worstPnl} icon={TrendingDown} isLoading={!trades.length} />
                        <StatCard title="Best Accuracy Month" value={kpis.bestAccuracy} icon={Target} isLoading={!trades.length} />
                        <StatCard title="Worst Accuracy Month" value={kpis.worstAccuracy} icon={HelpCircle} isLoading={!trades.length} />
                        <StatCard title="Long Net" value={`₹${Math.round(longShortData.longNet).toLocaleString('en-IN')}`} icon={BarChart2} isLoading={!trades.length} />
                        <StatCard title="Short Net" value={`₹${Math.round(longShortData.shortNet).toLocaleString('en-IN')}`} icon={BarChart2} isLoading={!trades.length} />
                    </div>

                    <motion.div 
                        className="bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-soft mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                       <FourMonthCalendar trades={trades} />
                    </motion.div>

                    <AddNewTradeForm currentUser={currentUser} onTradeAdded={onTradeAdded} />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-text-primary">Trade Log</h2>
                            {selected.size > 0 && (
                                <motion.button 
                                    onClick={handleBulkDelete} 
                                    className="bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Trash2 size={16} className="mr-2" />
                                    Delete Selected ({selected.size})
                                </motion.button>
                            )}
                        </div>
                        <div className="overflow-x-auto bg-surface/50 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-soft">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-white/10 text-text-secondary">
                                    <tr>
                                        <th className="p-3 text-center"><input type="checkbox" onChange={toggleSelectAll} checked={trades.length > 0 && selected.size === trades.length} className="bg-surface border-white/20 rounded"/></th>
                                        {headers.map(header => {
                                             let key = header.toLowerCase().replace(/\s+/g, '');
                                             if(key === 'totalp&l') key = 'totalPnl';
                                             if(key === 'stoploss') key = 'stopLoss';
                                            return (
                                                <th key={key} className="p-3 text-center cursor-pointer hover:bg-surface/70 transition-colors" onClick={() => handleSort(key)}>
                                                    <div className="flex items-center justify-center">
                                                        {header}
                                                        {renderSortArrow(key)}
                                                    </div>
                                                </th>
                                            )
                                        })}
                                        <th className="p-3 text-center font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-primary">
                                    {sortedTrades.map(trade => (
                                        <tr key={trade.id} className={`border-b border-white/5 ${selected.has(trade.id) ? 'bg-primary/20' : 'hover:bg-surface/70'} transition-colors`}>
                                            <td className="p-3 text-center"><input type="checkbox" checked={selected.has(trade.id)} onChange={() => toggleSelect(trade.id)} className="bg-surface border-white/20 rounded"/></td>
                                            {headers.map(header => renderCell(trade, header))}
                                            <td className="p-3 text-center">
                                                {editing?.id === trade.id ? (
                                                    <button onClick={handleUpdateTrade} className="text-primary hover:text-primary-dark"><Check size={20} /></button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => setEditing({...trade, date: trade.date.toDate().toISOString().split('T')[0]})} className="text-text-secondary hover:text-text-primary mr-2"><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(trade.id)} className="text-text-secondary hover:text-red-400"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </>
            )}
            {!currentUser && <p className="text-center text-text-secondary py-32">Please log in to view your performance data.</p>}
        </div>
    );
};

export default PerformancePage;
