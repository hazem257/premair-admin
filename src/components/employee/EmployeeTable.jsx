import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus } from "lucide-react";
import axios from 'axios';

const API_URL = 'http://localhost/php-project/employee.php';
const BRANCHES_API = 'http://localhost/php-project/branch.php';

const EmployeeTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    shift: "",
    income: "",
    status: "",
    branch_id: ""
  });

  useEffect(() => {
    fetchEmployees();
    fetchBranches();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(API_URL);
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await axios.get(BRANCHES_API);
      console.log("Branches API response:", response.data);
      setBranches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddEmployee = () => {
    setCurrentEmployee(null);
    setFormData({
      name: "",
      shift: "",
      income: "",
      status: "",
      branch_id: ""
    });
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee) => {
    setCurrentEmployee(employee);
    setFormData({
      name: employee.name,
      shift: employee.shift || "",
      income: employee.income,
      status: employee.status,
      branch_id: employee.branch_id || ""
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        income: formData.income,
        status: formData.status,
        branch_id: formData.branch_id
      };
  
      if (currentEmployee) {
        await axios.put(`${API_URL}?id=${currentEmployee.id}`, payload);
      } else {
        await axios.post(API_URL, payload);
      }
      await fetchEmployees(); // إضافة await لتأكيد التحديث
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving employee:', error.response?.data || error.message);
    }
  };
  
  // في دالة handleDeleteEmployee:
  const handleDeleteEmployee = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      try {
        await axios.delete(`${API_URL}?id=${id}`);
        await fetchEmployees(); // إضافة await لتأكيد التحديث
      } catch (error) {
        console.error('Error deleting employee:', error.response?.data || error.message);
      }
    }
  };

  const filteredEmployees = employees.filter(
    (employee) => 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      employee.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
    className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    >
    <div className='flex justify-between items-center mb-6'>
      <h2 className='text-xl font-semibold text-gray-100'>الموظفين</h2>
      <div className='flex items-center gap-4'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search Employees...'
            className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
        </div>
        <button 
          onClick={handleAddEmployee}
          className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
        >
          <Plus size={18} />
          إضافة موظف 
        </button>
      </div>
    </div>
    
    <div className='overflow-x-auto'>
    <table className='min-w-full divide-y divide-gray-700'>
          <thead className="bg-gray-800">
            <tr>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>الاسم</th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>الفرع</th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>العنوان</th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>الفترة</th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>المرتب</th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>الحالة</th>
              <th className='px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase w-1/6'>الإجراءات</th>
            </tr>
          </thead>

          <tbody className='divide-y divide-gray-700'>
            {filteredEmployees.map((employee) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className='px-4 py-4 text-sm text-gray-100 text-right'>{employee.name}</td>
                <td className='px-4 py-4 text-sm text-gray-300 text-right'>{employee.branch_name}</td>
                <td className='px-4 py-4 text-sm text-gray-300 text-right'>{employee.branch_address || 'غير محدد'}</td>
                <td className='px-4 py-4 text-sm text-gray-300 text-right'>{employee.shift}</td>
                <td className='px-4 py-4 text-right'>
                  <span className='inline-block px-3 py-1 text-xs font-semibold rounded-full bg-blue-800 text-blue-100'>
                    {employee.income}
                  </span>
                </td>
                <td className='px-4 py-4 text-right'>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      employee.status === "Manager" 
                        ? "bg-green-800 text-green-100"
                        : "bg-red-800 text-red-100"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className='px-4 py-4 text-right'>
                  <div className="flex gap-3 justify-end">
                    <button 
                      onClick={() => handleEditEmployee(employee)}
                      className='text-indigo-400 hover:text-indigo-300'
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className='text-red-400 hover:text-red-300'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
    </div>
    
    {/* Modal for Add/Edit EMPLOYEE */}
    {isModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div 
          className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h3 className="text-lg font-semibold text-gray-100 mb-4">
            {currentEmployee ? "تعديل الموظف " : "إضافة موظف جديد"}
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">الاسم</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">الفرع</label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                
              >
                <option value="">اختر فرع</option>
                {branches.map((branch) => (
                  <option key={branch.ID} value={branch.ID}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
              {formData.branch_id && (
                <p className="mt-2 text-sm text-gray-400">
                  العنوان: {branches.find(b => b.ID == formData.branch_id)?.address || 'غير متوفر'}
                </p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-2">المرتب</label>
              <input
                type="number"
                name="income"
                value={formData.income}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-300 text-sm mb-2">القسم</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Manager">Manager</option>
                <option value="worker">worker</option>
                <option value="accountant">accountant</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                {currentEmployee ? "حفظ التعديلات" : "إضافة موظف"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    )}
    </motion.div>
  );
};

export default EmployeeTable;