import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase';
import { Edit, Mail, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, X, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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

const EditUserModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({ ...user });
    const isSuperAdmin = user.email === 'digitalrajput007@gmail.com';

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.id, formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-primary-light rounded-xl shadow-lg border border-gray-700 p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Edit User</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">First Name</label>
                        <input type="text" name="firstName" value={formData.firstName || ''} onChange={handleChange} className="w-full p-2 rounded-lg bg-primary border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-secondary" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName || ''} onChange={handleChange} className="w-full p-2 rounded-lg bg-primary border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-secondary" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Mobile</label>
                        <input type="text" name="mobile" value={formData.mobile || ''} onChange={handleChange} className="w-full p-2 rounded-lg bg-primary border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-secondary" />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                        <select name="gender" value={formData.gender || ''} onChange={handleChange} className="w-full p-2 rounded-lg bg-primary border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-secondary">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="mb-6">
                        <label className="flex items-center cursor-pointer">
                            <input type="checkbox" name="isAdmin" checked={formData.isAdmin || false} onChange={handleChange} className="sr-only" disabled={isSuperAdmin} />
                            <div className={`w-11 h-6 rounded-full ${formData.isAdmin ? 'bg-secondary' : 'bg-gray-600'} relative transition-colors`}>
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform ${formData.isAdmin ? 'translate-x-5' : ''}`}></div>
                            </div>
                            <span className={`ml-3 text-sm font-medium ${isSuperAdmin ? 'text-gray-500' : 'text-gray-300'}`}>
                                Administrator Role {isSuperAdmin && '(Locked)'}
                            </span>
                        </label>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-dark text-white font-semibold transition-colors">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        const isSuperAdmin = data.email === 'digitalrajput007@gmail.com';
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          status: data.status || 'active',
          isAdmin: data.isAdmin || isSuperAdmin, // Ensure super admin is always admin
        };
      });
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSendResetPassword = async (email) => {
    if (!email) {
      toast.error('User email is not available.');
      return;
    }
    if (window.confirm(`Are you sure you want to send a password reset link to ${email}?`)) {
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success(`Password reset link sent to ${email}`);
        } catch (error) {
            console.error("Error sending password reset email:", error);
            toast.error(`Failed to send link: ${error.message}`);
        }
    }
  };

  const handleToggleActivate = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    if(window.confirm(`Are you sure you want to set this user to ${newStatus}?`)){
        const userRef = doc(db, 'users', userId);
        try {
          await updateDoc(userRef, { status: newStatus });
          fetchUsers();
          toast.success(`User has been set to ${newStatus}.`);
        } catch (error) {
          console.error("Error updating user status:", error);
          toast.error(`Failed to update status: ${error.message}`);
        }
    }
  };
  
  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (userId, newData) => {
    const userRef = doc(db, 'users', userId);
    try {
        await updateDoc(userRef, newData);
        toast.success('User updated successfully!');
        setIsEditModalOpen(false);
        fetchUsers();
    } catch (error) {
        toast.error('Failed to update user.');
        console.error(error);
    }
  };

  const processedUsers = useMemo(() => {
    const adminUser = users.find(u => u.email === 'digitalrajput007@gmail.com');
    let otherUsers = users.filter(u => u.email !== 'digitalrajput007@gmail.com');

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        otherUsers = otherUsers.filter(u => 
            (`${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(q) || 
             u.email?.toLowerCase().includes(q))
        );
    }

    if (sortConfig.key) {
        otherUsers.sort((a, b) => {
            let aValue = a[sortConfig.key];
            let bValue = b[sortConfig.key];

            if(sortConfig.key === 'name') {
                aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim();
                bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim();
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }
    return { adminUser, otherUsers };
  }, [users, searchQuery, sortConfig]);

  const paginatedUsers = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return processedUsers.otherUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [processedUsers.otherUsers, currentPage, itemsPerPage]);

  const requestSort = (key) => {
      let direction = sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending';
      setSortConfig({ key, direction });
      setCurrentPage(1);
  };

  const exportToExcel = () => {
    const dataToExport = processedUsers.otherUsers.map(u => ({
        Name: `${u.firstName || ''} ${u.lastName || ''}`.trim(),
        Email: u.email,
        Mobile: u.mobile,
        Gender: u.gender,
        Role: u.isAdmin ? 'Admin' : 'User',
        Status: u.status,
        'Created Date': u.createdAt ? u.createdAt.toLocaleDateString() : 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, "User_Management_Data.xlsx");
  };

  const SortableHeader = ({ children, name, align = 'left' }) => {
    const isSorted = sortConfig.key === name;
    const alignClass = `text-${align}`;
    const justifyContentClass = `justify-${align}`; 

    return (
        <th className={`sticky top-0 p-3 font-semibold bg-primary-light/60 cursor-pointer ${alignClass}`} onClick={() => requestSort(name)}>
            <div className={`flex items-center ${justifyContentClass}`}>
                {children}
                {isSorted && (sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1"/> : <ChevronDown size={14} className="ml-1" />)}
            </div>
        </th>
    );
  }

  const UserRow = ({ user }) => (
    <tr className="border-b border-gray-700 last:border-b-0 hover:bg-surface/60 transition-colors duration-150">
        <td className="p-3 whitespace-nowrap">{`${user.firstName || ''} ${user.lastName || ''}`}</td>
        <td className="p-3 text-gray-400 whitespace-nowrap">{user.email}</td>
        <td className="p-3 text-gray-400 whitespace-nowrap">{user.mobile}</td>
        <td className="p-3 text-gray-400 whitespace-nowrap">{user.gender}</td>
        <td className="p-3 text-center">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.isAdmin ? 'bg-pink-600 text-white' : 'bg-blue-600 text-white'}`}>
                {user.isAdmin ? 'Admin' : 'User'}
            </span>
        </td>
        <td className="p-3 text-center">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {user.status}
            </span>
        </td>
        <td className="p-3 text-center text-gray-400 whitespace-nowrap">{user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A'}</td>
        <td className="p-3 text-right whitespace-nowrap">
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Edit User" onClick={() => handleEditClick(user)}>
                <Edit size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title="Send Password Reset" onClick={() => handleSendResetPassword(user.email)}>
                <Mail size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors" title={user.status === 'active' ? 'Deactivate User' : 'Activate User'} onClick={() => handleToggleActivate(user.id, user.status)}>
                {user.status === 'active' ? <ToggleRight size={16} className="text-green-500" /> : <ToggleLeft size={16} className="text-red-500" />}
            </button>
        </td>
    </tr>
);

  return (
    <div className="p-4 md:p-6">
        <div className="bg-primary-light p-6 rounded-xl shadow-lg border border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search by name or email..." className="w-full md:w-1/3 p-2 rounded-lg bg-primary border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-secondary" />
                 <button onClick={exportToExcel} className="ml-4 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-dark text-white font-semibold transition-colors flex items-center">
                    <FileDown size={18} className="mr-2" />
                    Export to Excel
                </button>
            </div>
            <div className="overflow-x-auto rounded-lg">
                {loading ? (
                    <div className="text-center py-8 text-text-secondary">Loading users...</div>
                ) : (
                    <>
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-primary-light/60">
                                    <SortableHeader name="name" align="left">Name</SortableHeader>
                                    <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Email</th>
                                    <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Mobile</th>
                                    <th className="sticky top-0 text-left p-3 font-semibold bg-primary-light/60">Gender</th>
                                    <th className="sticky top-0 text-center p-3 font-semibold bg-primary-light/60">Role</th>
                                    <SortableHeader name="status" align="center">Status</SortableHeader>
                                    <SortableHeader name="createdAt" align="center">Created Date</SortableHeader>
                                    <th className="sticky top-0 text-right p-3 font-semibold bg-primary-light/60">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-text-primary">
                                {processedUsers.adminUser && <UserRow user={processedUsers.adminUser} />}
                                {paginatedUsers.map(user => <UserRow key={user.id} user={user} />)}
                            </tbody>
                        </table>
                        <TableControls 
                            totalItems={processedUsers.otherUsers.length} 
                            itemsPerPage={itemsPerPage} 
                            setItemsPerPage={setItemsPerPage} 
                            currentPage={currentPage} 
                            setCurrentPage={setCurrentPage} 
                        />
                    </>
                )}
            </div>
        </div>
        {isEditModalOpen && editingUser && (
            <EditUserModal 
                user={editingUser}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleUpdateUser}
            />
        )}
    </div>
  );
};

export default UserManagement;