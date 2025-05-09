import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, ChevronDown, ChevronUp, Download } from "lucide-react";
//import * as XLSX from 'xlsx';

const initialUserData = [
  { id: 1, name: "أحمد محمد", email: "ahmed@example.com", points: 150, status: "Active", joinDate: "2023-01-15" ,EndDate: "2023-01-15"},
  { id: 2, name: "سارة علي", email: "sara@example.com", points: 230, status: "Active", joinDate: "2023-02-20",EndDate: "2023-01-15" },
  { id: 3, name: "محمد خالد", email: "mohamed@example.com", points: 75, status: "Inactive", joinDate: "2023-03-10",EndDate: "2023-01-15" },
];

const UserOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(initialUserData);
  const [filteredUsers, setFilteredUsers] = useState(initialUserData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    points: "",
    status: "Active",
    joinDate: new Date().toISOString().split('T')[0]
  });
  
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // التصفية عند تغيير البحث أو البيانات
  useEffect(() => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  // دالة الترتيب
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // تطبيق الترتيب
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // أيقونة الترتيب
  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? 
      <ChevronUp className="inline ml-1" size={16} /> : 
      <ChevronDown className="inline ml-1" size={16} />;
  };

  // تصدير إلى Excel
  const handleExportExcel = () => {
    if (sortedUsers.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }

    const data = [
      ["الاسم", "البريد الإلكتروني", "النقاط", "الحالة", "تاريخ الانضمام","تاريخ أخر معاملة"],
      ...sortedUsers.map(user => [
        user.name,
        user.email,
        user.points,
        user.status === "Active" ? "نشط" : "غير نشط",
        new Date(user.joinDate).toLocaleDateString('ar-EG') ,
        new Date(user.EndDate).toLocaleDateString('ar-EG') ,
      ])
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المستخدمين");
    XLSX.writeFile(wb, "المستخدمين.xlsx");
  };

  // إضافة مستخدم جديد
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      name: "",
      email: "",
      points: "",
      status: "Active",
      joinDate: new Date().toISOString().split('T')[0],
      EndDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  // تعديل مستخدم
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      points: user.points,
      status: user.status,
      joinDate: user.joinDate,
      EndDate: user.EndDate
    });
    setIsModalOpen(true);
  };

  // حذف مستخدم
  const handleDeleteUser = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // حفظ البيانات
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (currentUser) {
      // تحديث مستخدم موجود
      const updatedUsers = users.map(user => 
        user.id === currentUser.id ? { ...formData, id: currentUser.id } : user
      );
      setUsers(updatedUsers);
    } else {
      // إضافة مستخدم جديد
      const newUser = {
        ...formData,
        id: Math.max(...users.map(u => u.id)) + 1,
        points: parseInt(formData.points) || 0
      };
      setUsers([...users, newUser]);
    }
    
    setIsModalOpen(false);
  };

  // تغيير حقول النموذج
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{width:"100%"}}
    >
      {/* شريط البحث والأزرار */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4" style={{width:"100%"}}>
        <h2 className="text-xl font-semibold text-gray-100">إدارة المستخدمين</h2>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="ابحث عن مستخدم..."
              className="w-full bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-1 top-2.5 text-gray-400" size={18} />
          </div>
          
        </div>
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto rounded-lg border border-gray-700" style={{width:"100%"}}>
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr style={{display:"flex" , justifyContent:"space-between", width:"100%" , alignItems:"center"}}>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('name')}
              >
                الاسم {renderSortIcon('name')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('email')}
              >
                البريد الإلكتروني {renderSortIcon('email')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('points')}
              >
                النقاط {renderSortIcon('points')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('status')}
              >
                الحالة {renderSortIcon('status')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('joinDate')}
              >
                تاريخ الانضمام {renderSortIcon('joinDate')}
              </th>
              <th 
                className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('EndDate')}
              >
                أخر تعامل{renderSortIcon('EndDate')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>

          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedUsers.length > 0 ? (
              sortedUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-700"
                  style={{display:"flex" , justifyContent:"space-between", width:"100%" , alignItems:"center"}}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-800 text-blue-100">
                      {user.points}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      user.status === "Active" ? "bg-green-800 text-green-100" : "bg-red-800 text-red-100"
                    }`}>
                      {user.status === "Active" ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                    {new Date(user.joinDate).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                    {new Date(user.EndDate).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-700"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-700"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
                  لا توجد نتائج مطابقة للبحث
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* زر إضافة مستخدم جديد */}
      <div className="mt-4 flex justify-center"style={{padding:'3px', justifyContent:"space-between", }}>
        <button 
          onClick={handleAddUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          مستخدم جديد
        </button>
        <button 
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Download size={18} />
            تصدير إلى Excel
          </button>
      </div>

      {/* نافذة التعديل/الإضافة */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {currentUser ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">الاسم بالكامل</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">النقاط</label>
                <input
                  type="number"
                  name="points"
                  value={formData.points}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">الحالة</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">نشط</option>
                  <option value="Inactive">غير نشط</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">تاريخ الانضمام</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">تاريخ أخر معاملة</label>
                <input
                  type="date"
                  name="EndDate"
                  value={formData.EndDate}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  {currentUser ? "حفظ التغييرات" : "إضافة المستخدم"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default UserOverview;
