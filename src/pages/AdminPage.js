import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import toast from 'react-hot-toast';

// --- SVG Icon for Export Button ---
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

// --- Reusable Pagination Component ---
const TableControls = ({ totalItems, itemsPerPage, setItemsPerPage, currentPage, setCurrentPage }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startRecord = totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endRecord = Math.min(currentPage * itemsPerPage, totalItems);

    const pageNumbers = useMemo(() => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 4) pages.push('...');
            
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 4) {
                start = 2;
                end = 5;
            } else if (currentPage >= totalPages - 3) {
                start = totalPages - 4;
                end = totalPages - 1;
            }

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 3) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    }, [totalPages, currentPage]);
    
    return (
        <div className="flex flex-col md:flex-row items-center justify-between mt-4 text-sm text-text-secondary space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
                <span>Show</span>
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }} 
                    className="p-1 bg-primary border border-gray-600 rounded-md text-white"
                >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                </select>
                <span>records</span>
            </div>

            {totalItems > 0 && (
                <div className="flex items-center justify-center space-x-1">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'<<'}</button>
                    <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'<'}</button>
                    {pageNumbers.map((num, index) => (
                        <button
                            key={index}
                            onClick={() => typeof num === 'number' && setCurrentPage(num)}
                            disabled={typeof num !== 'number'}
                            className={`px-3 py-1 rounded-md disabled:cursor-not-allowed ${currentPage === num ? 'bg-secondary text-white font-bold' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {num}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'>'}</button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">{'>>'}</button>
                </div>
            )}
            
            <div>
                <span>Showing {startRecord} to {endRecord} of {totalItems} records</span>
            </div>
        </div>
    );
};


const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchQuery) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.role || '').toLowerCase().includes(q));
    }, [users, searchQuery]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollectionRef = collection(db, 'users');
                const querySnapshot = await getDocs(usersCollectionRef);
                const usersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                usersList.sort((a, b) => {
                    if (a.role === 'admin' && b.role !== 'admin') return -1;
                    if (a.role !== 'admin' && b.role === 'admin') return 1;
                    return 0;
                });

                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
                toast.error("Failed to fetch user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const formatDate = (timestamp) => {
        if (timestamp && timestamp.seconds) {
            return new Date(timestamp.seconds * 1000).toLocaleDateString('en-IN');
        }
        return 'N/A';
    };

    const handleExport = () => {
        if (typeof window.XLSX === 'undefined') {
            toast.error("Excel export library is not available.");
            return;
        }

        const dataToExport = users.map(user => ({
            'Name': `${user.firstName} ${user.lastName}`,
            'Email': user.email,
            'Mobile': user.mobile || 'N/A',
            'Gender': user.gender || 'N/A',
            'Role': user.role || 'user',
            'Created At': formatDate(user.createdAt),
        }));

        const ws = window.XLSX.utils.json_to_sheet(dataToExport);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Users");
        window.XLSX.writeFile(wb, "TradeDash_Users.xlsx");
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center w-full md:w-1/2">
                    <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search users, email or role..." className="w-full p-2 rounded-lg bg-primary border border-white/10 text-white" />
                </div>
                <div className="flex items-center">
                    <button 
                        onClick={handleExport} 
                        className="flex items-center bg-secondary hover:bg-secondary-dark text-white font-bold py-2 px-4 rounded-lg transition"
                        disabled={loading || users.length === 0}
                    >
                        <ExportIcon />
                        Export to Excel
                    </button>
                </div>
            </div>

            <div className="bg-primary-light p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="overflow-x-auto rounded-lg">
                    {loading ? (
                        <p className="text-center text-text-secondary">Loading users...</p>
                    ) : (
                        <>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-primary-light/60">
                                        <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Name</th>
                                        <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Email</th>
                                        <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Mobile</th>
                                        <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Gender</th>
                                        <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Role</th>
                                        <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Created At</th>
                                    </tr>
                                </thead>
                                <tbody className="text-text-primary">
                                    {paginatedUsers.map(user => (
                                        <tr 
                                            key={user.id} 
                                            className="border-b last:rounded-b-lg hover:bg-surface/60 transition-colors rounded-md"
                                        >
                                            <td className="p-3">{user.firstName} {user.lastName}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">{user.mobile || 'N/A'}</td>
                                            <td className="p-3">{user.gender || 'N/A'}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-secondary text-white' : 'bg-gray-600 text-text-secondary'}`}>
                                                    {user.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="p-3">{formatDate(user.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             <TableControls 
                                totalItems={filteredUsers.length} 
                                itemsPerPage={itemsPerPage} 
                                setItemsPerPage={setItemsPerPage} 
                                currentPage={currentPage} 
                                setCurrentPage={setCurrentPage} 
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
