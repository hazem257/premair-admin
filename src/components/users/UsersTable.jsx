import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UsersTable = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        points: '0'
    });

    // جلب بيانات العملاء
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost/php-project/customer.php');
            if (response.data && response.data.success) {
                setUsers(response.data.data || []);
            } else {
                throw new Error(response.data?.error || 'حدث خطأ في جلب البيانات');
            }
        } catch (err) {
            setError(err.message);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openModal = (user = null) => {
        setCurrentUser(user);
        setFormData({
            name: user?.customer_name || '',
            address: user?.cust_address || '',
            phone: user?.phones || '',
            points: user?.cust_points?.toString() || '0'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const userData = {
                customer_name: formData.name,
                cust_address: formData.address,
                cust_points: parseInt(formData.points) || 0,
                phones: formData.phone.split(',').map(p => p.trim()).filter(p => p)
            };

            if (currentUser) {
                await axios.put(`http://localhost/php-project/customer.php?id=${currentUser.customerID}`, userData);
                toast.success('تم تحديث العميل بنجاح');
            } else {
                await axios.post('http://localhost/php-project/customer.php', userData);
                toast.success('تم إضافة العميل بنجاح');
            }
            
            fetchUsers();
            setModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || 'حدث خطأ');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
            setLoading(true);
            try {
                await axios.delete(`http://localhost/php-project/customer.php?id=${id}`);
                toast.success('تم حذف العميل بنجاح');
                fetchUsers();
            } catch (err) {
                toast.error(err.response?.data?.error || err.message || 'حدث خطأ أثناء الحذف');
                console.error('Error deleting:', err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-center">نظام إدارة العملاء</h1>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-4 flex justify-end">
                <button 
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                    disabled={loading}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    إضافة عميل
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2">جاري تحميل البيانات...</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
                    <table className="min-w-full bg-gray-800">
                        <thead className="bg-gray-700">
                            <tr>
                                <th className="py-3 px-6 text-right font-semibold text-gray-300 border-b border-gray-600">الاسم</th>
                                <th className="py-3 px-6 text-right font-semibold text-gray-300 border-b border-gray-600">العنوان</th>
                                <th className="py-3 px-6 text-right font-semibold text-gray-300 border-b border-gray-600">الهاتف</th>
                                <th className="py-3 px-6  font-semibold  text-gray-300 border-b border-gray-600">النقاط</th>
                                <th className="py-3 px-6  font-semibold text-gray-300 border-b border-gray-600">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? users.map(user => (
                                <tr key={user.customerID} className="hover:bg-gray-700 transition-colors">
                                    <td className="py-4 px-6 border-b border-gray-700">{user.customer_name}</td>
                                    <td className="py-4 px-6 border-b border-gray-700 text-gray-400">{user.cust_address || 'لا يوجد'}</td>
                                    <td className="py-4 px-6 border-b border-gray-700 text-gray-400 dir-ltr">
                                        {user.phones ? user.phones.split(',').map((phone, i) => (
                                            <div key={i} className="text-blue-400 hover:text-blue-300">
                                                {phone.trim()}
                                            </div>
                                        )) : 'لا يوجد'}
                                    </td>
                                    <td className="py-4 px-6 border-b border-gray-700 text-center">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${user.cust_points > 100 ? 'bg-green-900 text-green-100' : 'bg-blue-900 text-blue-100'}`}>
                                            {user.cust_points}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 border-b border-gray-700 text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => openModal(user)}
                                                className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-yellow-900 transition-colors"
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.customerID)}
                                                className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900 transition-colors"
                                                disabled={loading}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="py-4 text-center text-gray-400">لا يوجد عملاء مسجلين</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                        <div className="p-4 border-b border-gray-700">
                            <h2 className="text-xl font-semibold">
                                {currentUser ? 'تعديل العميل' : 'إضافة عميل جديد'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4">
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">الاسم *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">العنوان</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    disabled={loading}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">أرقام الهاتف *</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    required
                                    disabled={loading}
                                    placeholder="مفصولة بفاصلة: 0123456789, 9876543210"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-300 mb-2">النقاط</label>
                                <input
                                    type="number"
                                    name="points"
                                    value={formData.points}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    min="0"
                                    disabled={loading}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white"
                                    disabled={loading}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            جاري الحفظ...
                                        </>
                                    ) : currentUser ? 'حفظ التعديلات' : 'إضافة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer
                position="top-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    );
};

export default UsersTable;