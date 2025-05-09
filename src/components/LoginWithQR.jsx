<motion.div
className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.2 }}
>
{/* Add Modal */}
{showAddModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg w-96">
      <h3 className="text-xl mb-4 text-white">إضافة منتج جديد</h3>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="الاسم"
          value={newProduct.name}
          onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <select
          value={newProduct.category}
          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        >
          <option value="" disabled>اختر التصنيف</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="السعر"
          value={newProduct.price}
          onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="المخزون"
          value={newProduct.stock}
          onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="المبيعات"
          value={newProduct.sales}
          onChange={(e) => setNewProduct({...newProduct, sales: parseInt(e.target.value)})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={() => setShowAddModal(false)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          إلغاء
        </button>
        <button
          onClick={handleSaveNew}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          إضافة
        </button>
      </div>
    </div>
  </div>
)}

{/* Edit Modal */}
{editingProduct && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg w-96">
      <h3 className="text-xl mb-4 text-white">تعديل المنتج</h3>
      <div className="space-y-4">
        <input
          type="text"
          value={editedData.name}
          onChange={(e) => setEditedData({...editedData, name: e.target.value})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <select
          value={editedData.category}
          onChange={(e) => setEditedData({...editedData, category: e.target.value})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        >
          <option value="" disabled>اختر التصنيف</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <input
          type="number"
          value={editedData.price}
          onChange={(e) => setEditedData({...editedData, price: parseFloat(e.target.value)})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          type="number"
          value={editedData.stock}
          onChange={(e) => setEditedData({...editedData, stock: parseInt(e.target.value)})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
        <input
          type="number"
          value={editedData.sales}
          onChange={(e) => setEditedData({...editedData, sales: parseInt(e.target.value)})}
          className="bg-gray-700 text-white p-2 rounded w-full"
        />
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button 
          onClick={() => setEditingProduct(null)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          إلغاء
        </button>
        <button 
          onClick={handleSaveEdit}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          حفظ
        </button>
      </div>
    </div>
  </div>
)}

{/* Header Section */}
<div className="flex justify-between items-center mb-6">
  <div className="flex items-center gap-4">
    <h2 className="text-xl font-semibold text-gray-100">قــائـمـة الـمـنـتـجــات</h2>
    <span className="bg-gray-700 text-green-400 px-3 py-1 rounded-full text-sm">
      العدد: {products.length}
    </span>
  </div>
  
  <div className="flex items-center gap-4">
    <div className="relative">
      <input
        type="text"
        placeholder="بحث..."
        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={handleSearch}
      />
      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    </div>
  </div>
</div>

{/* Table */}
<div className="overflow-x-auto" dir="rtl">
  <table className="min-w-full divide-y divide-gray-700">
    <thead className="bg-gray-800">
      <tr>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">المنتج</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">التصنيف</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">السعر</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">المخزون</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">المبيعات</th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">الإجراءات</th>
      </tr>
    </thead>
    
    <tbody className="divide-y divide-gray-700">
      {filteredProducts.map((product) => (
        <motion.tr 
          key={product.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hover:bg-gray-800"
        >
          <td className="px-6 py-4 text-right text-sm text-gray-100">{product.name}</td>
          <td className="px-6 py-4 text-right text-sm text-gray-300">{product.category}</td>
          <td className="px-6 py-4 text-right text-sm text-gray-300">${product.price.toFixed(2)}</td>
          <td className="px-6 py-4 text-right text-sm text-gray-300">{product.stock - product.sales}</td>
          <td className="px-6 py-4 text-right text-sm text-gray-300">{product.sales}</td>
          <td className="px-6 py-4 text-right text-sm text-gray-300">
            <button 
              onClick={() => handleEdit(product)}
              className="text-indigo-400 hover:text-indigo-300 mx-2"
            >
              <Edit size={18} />
            </button>
            <button 
              onClick={() => handleDelete(product.id)}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 size={18} />
            </button>
          </td>
        </motion.tr>
      ))}
    </tbody>
  </table>
</div>

{/* Action Buttons */}
<div className="mt-6 flex justify-center gap-4">
  <button
    onClick={handleAdd}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  >
    <Plus size={18} />
    إضافة منتج
  </button>
  <button
    onClick={handleExportExcel}
    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
  >
    <Download size={18} />
    تصدير إكسل
  </button>
</div>
</motion.div>