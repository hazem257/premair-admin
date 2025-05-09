import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Download, ChevronDown, ChevronUp } from "lucide-react";
import { utils, writeFile } from "xlsx-js-style";

const COUNTRIES = [
  "مصر", "السعودية", "الإمارات", "الجزائر", "المغرب",
  "العراق", "الكويت", "قطر", "عُمان", "لبنان",
  "سوريا", "الأردن", "اليمن", "ليبيا", "تونس",
  "السودان", "الصومال", "موريتانيا", "البحرين", "فلسطين"
];

const SupplierTable = ({ suppliers, setSuppliers }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    country: "",
    contacts: []
  });
  const [expandedRows, setExpandedRows] = useState({});

  // ───── Handlers ───────────────────────────────────
  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleDelete = async (supplierId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المورد؟")) return;
    try {
      await fetch(`http://localhost/php-project/supplier.php?action=delete&id=${supplierId}`, {
        method: 'DELETE'
      });
      setSuppliers(suppliers.filter(s => s.id !== supplierId));
    } catch (error) {
      alert('فشل في الحذف');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setEditedData({ ...supplier });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch('http://localhost/php-project/supplier.php?action=update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedData),
      });
      const updatedSupplier = await response.json();
      setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
      setEditingSupplier(null);
    } catch (error) {
      alert('فشل في التحديث');
    }
  };
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch('http://localhost/php-project/supplier.php?action=get');
        const data = await response.json();
        console.log('البيانات المستلمة:', data); // للتأكد من وصول البيانات
        setSuppliers(data);
      } catch (error) {
        console.error('فشل في جلب البيانات:', error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleAdd = () => setShowAddModal(true);

  const handleSaveNew = async () => {
    if (!newSupplier.name || !newSupplier.country) {
      alert("الرجاء إدخال جميع البيانات المطلوبة");
      return;
    }
    try {
      const response = await fetch('http://localhost/php-project/supplier.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier),
      });
      const addedSupplier = await response.json();
      setSuppliers([...suppliers, addedSupplier]);
      setShowAddModal(false);
      setNewSupplier({ name: "", country: "", contacts: [] });
    } catch (error) {
      alert('فشل في الإضافة');
    }
  };

  const toggleRowExpand = (supplierId) => {
    setExpandedRows(prev => ({ ...prev, [supplierId]: !prev[supplierId] }));
  };

  const handleExportExcel = () => {
    if (suppliers.length === 0) {
      alert("لا توجد بيانات للتصدير");
      return;
    }
    const data = [
      ["الاسم", "الدولة", "أرقام التواصل"],
      ...suppliers.map(supp => [
        supp.name,
        supp.country,
        supp.contacts?.join(', ') || 'لا توجد أرقام'
      ])
    ];
    const ws = utils.aoa_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "الموردين");
    // تنسيق العناوين
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } },
      alignment: { horizontal: "center" }
    };
    for (let col = 0; col < data[0].length; col++) {
      const cell = utils.encode_cell({ r: 0, c: col });
      ws[cell].s = headerStyle;
    }
    writeFile(wb, "الموردين.xlsx");
  };

  const filteredSuppliers = suppliers.filter(supp =>
    supp.name.toLowerCase().includes(searchTerm) ||
    supp.country.toLowerCase().includes(searchTerm)
  );

  // ───── UI ────────────────────────────────────────
  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-4 md:p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg md:text-xl mb-4 text-white">إضافة مورد جديد</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="الاسم"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <select
                value={newSupplier.country}
                onChange={(e) => setNewSupplier({ ...newSupplier, country: e.target.value })}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الدولة</option>
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">أرقام التواصل:</label>
                {newSupplier.contacts.map((contact, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        const newContacts = [...newSupplier.contacts];
                        newContacts[index] = e.target.value;
                        setNewSupplier({ ...newSupplier, contacts: newContacts });
                      }}
                      className="bg-gray-700 text-white p-2 rounded w-full"
                    />
                    <button
                      onClick={() => {
                        const newContacts = newSupplier.contacts.filter((_, i) => i !== index);
                        setNewSupplier({ ...newSupplier, contacts: newContacts });
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setNewSupplier({ ...newSupplier, contacts: [...newSupplier.contacts, ""] })}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>إضافة رقم جديد</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNew}
                className="px-3 py-1 md:px-4 md:py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 md:p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg md:text-xl mb-4 text-white">تعديل المورد</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editedData.name}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <select
                value={editedData.country}
                onChange={(e) => setEditedData({ ...editedData, country: e.target.value })}
                className="bg-gray-700 text-white p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">أرقام التواصل:</label>
                {editedData.contacts?.map((contact, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        const newContacts = [...editedData.contacts];
                        newContacts[index] = e.target.value;
                        setEditedData({ ...editedData, contacts: newContacts });
                      }}
                      className="bg-gray-700 text-white p-2 rounded w-full"
                    />
                    <button
                      onClick={() => {
                        const newContacts = editedData.contacts.filter((_, i) => i !== index);
                        setEditedData({ ...editedData, contacts: newContacts });
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setEditedData({ ...editedData, contacts: [...editedData.contacts, ""] })}
                  className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>إضافة رقم جديد</span>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditingSupplier(null)}
                className="px-3 py-1 md:px-4 md:py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm md:text-base"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 md:px-4 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-100">المـورديـن</h2>
          <span className="bg-gray-700 text-green-400 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
            العدد: {suppliers.length}
          </span>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="بحث..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm md:text-base"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={handleAdd}
              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1 text-xs md:text-sm"
            >
              <Plus size={14} className="md:size-[16px]" />
              <span>إضافة</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1 text-xs md:text-sm"
            >
              <Download size={14} className="md:size-[16px]" />
              <span>تصدير</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الاســم</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الـدولة</th>
              <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">    ارقام التواصل  <span style={{color:"#3F7D58" ,fontWeight:"bold"}}>( whatsapp )</span></th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredSuppliers.length > 0 ? (
              filteredSuppliers.map(supp => (
                <motion.tr
                  key={supp.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right text-sm text-gray-100">{supp.name}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right text-sm text-gray-300">{supp.country}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right text-sm text-gray-300">
                    {supp.contacts?.join(', ') || 'لا توجد أرقام'}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(supp)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-900/30 transition-colors"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(supp.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30 transition-colors"
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
                <td colSpan="4" className="px-6 py-4 text-center text-gray-400">
                  {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد بيانات متاحة"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile List View */}
      <div className="md:hidden space-y-2">
        {filteredSuppliers.length > 0 ? (
          filteredSuppliers.map(supp => (
            <motion.div
              key={supp.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div 
                className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => toggleRowExpand(supp.id)}
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm mr-2">
                    {supp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-100">{supp.name}</div>
                    <div className="text-xs text-gray-400">{supp.country}</div>
                  </div>
                </div>
                {expandedRows[supp.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedRows[supp.id] && (
                <div className="p-3 pt-0 border-t border-gray-700 bg-gray-800">
                  <div className="mb-2">
                    <div className="text-xs text-gray-400">أرقام التواصل:</div>
                    <div className="text-sm text-gray-200">
                      {supp.contacts?.join(', ') || 'لا توجد أرقام'}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(supp)}
                      className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-900/30 transition-colors text-xs flex items-center gap-1"
                    >
                      <Edit size={14} />
                      <span>تعديل</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(supp.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/30 transition-colors text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-400 bg-gray-900 rounded-lg border border-gray-700">
            {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد بيانات متاحة"}
          </div>
        )}
      </div>

      {/* Pagination Status */}
      <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-400 text-center">
        عرض {filteredSuppliers.length} من أصل {suppliers.length} مورد
      </div>
    </motion.div>
  );
};

export default SupplierTable;