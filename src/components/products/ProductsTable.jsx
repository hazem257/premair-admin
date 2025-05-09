import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Download } from "lucide-react";
import { utils, writeFile } from "xlsx-js-style";

const categories = ["Meat", "Dairy products", "others"];

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    packing_date: "",
    SupplierId: "",
    price: "",
    stock: "",
    sales: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products
        const productsRes = await fetch('http://localhost/php-project/products.php?action=get');
        if (!productsRes.ok) throw new Error('فشل في جلب المنتجات');
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Fetch suppliers
        const suppliersRes = await fetch('http://localhost/php-project/supplier.php?action=get');
        if (!suppliersRes.ok) throw new Error('فشل في جلب الموردين');
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);

      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handlers
  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());

  const handleDelete = async (productId) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const res = await fetch(`http://localhost/php-project/products.php?action=delete&id=${productId}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في الحذف');
      }
      
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setEditedData({ 
      ...product,
      SupplierId: product.SupplierId.toString() // Convert to string for select value
    });
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch('http://localhost/php-project/products.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...editedData,
          action: 'update',
          SupplierId: parseInt(editedData.SupplierId),
          price: parseFloat(editedData.price),
          stock: parseInt(editedData.stock)
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في التحديث');
      }

      const updatedProduct = await res.json();
      setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setEditingProduct(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAdd = () => setShowAddModal(true);

  const handleSaveNew = async () => {
    try {
      const res = await fetch('http://localhost/php-project/products.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProduct,
          action: 'add',
          SupplierId: parseInt(newProduct.SupplierId),
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في الإضافة');
      }

      const addedProduct = await res.json();
      setProducts([...products, addedProduct]);
      setShowAddModal(false);
      setNewProduct({
        name: "",
        category: "",
        packing_date: "",
        SupplierId: "",
        price: "",
        stock: "",
        sales: 0,
      });
    } catch (error) {
      alert(error.message);
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    const data = [
      ["الاسم", "التصنيف", "المورد", "تاريخ التعبئة", "السعر", "المخزون", "المبيعات"],
      ...products.map(p => [
        p.name,
        p.category,
        suppliers.find(s => s.id === p.SupplierId)?.name || 'غير معروف',
        p.packing_date ? new Date(p.packing_date).toLocaleDateString('ar-EG') : 'غير محدد',
        `$${p.price.toFixed(2)}`,
        p.stock - p.sales,
        p.sales,
      ]),
    ];
    const ws = utils.aoa_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "المنتجات");
    writeFile(wb, "Products.xlsx");
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm) ||
    p.category.toLowerCase().includes(searchTerm)
  );

  return (
    <motion.div 
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 mb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search and Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100">إدارة المنتجات</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearch}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl mb-4 text-white">إضافة منتج جديد</h3>
            <input
              type="text"
              placeholder="اسم المنتج"
              value={newProduct.name}
              onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            />
            <select
              value={newProduct.category}
              onChange={(e) => setNewProduct(prev => ({...prev, category: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            >
              <option value="">اختر التصنيف</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="date"
              value={newProduct.packing_date}
              onChange={(e) => setNewProduct(prev => ({...prev, packing_date: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            />
            <select
              value={newProduct.SupplierId}
              onChange={(e) => setNewProduct(prev => ({...prev, SupplierId: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            >
              <option value="">اختر المورد</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="السعر"
              value={newProduct.price}
              onChange={(e) => setNewProduct(prev => ({...prev, price: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            />
            <input
              type="number"
              placeholder="الكمية"
              value={newProduct.stock}
              onChange={(e) => setNewProduct(prev => ({...prev, stock: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNew}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl mb-4 text-white">تعديل المنتج</h3>
            <input
              type="text"
              value={editedData.name}
              onChange={(e) => setEditedData(prev => ({...prev, name: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            />
            <select
              value={editedData.category}
              onChange={(e) => setEditedData(prev => ({...prev, category: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <input
              type="date"
              value={editedData.packing_date}
              onChange={(e) => setEditedData(prev => ({...prev, packing_date: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            />
            <select
              value={editedData.SupplierId}
              onChange={(e) => setEditedData(prev => ({...prev, SupplierId: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={editedData.price}
              onChange={(e) => setEditedData(prev => ({...prev, price: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-2"
            />
            <input
              type="number"
              value={editedData.stock}
              onChange={(e) => setEditedData(prev => ({...prev, stock: e.target.value}))}
              className="bg-gray-700 text-white p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">التصنيف</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المورد</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">تاريخ التعبئة</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">السعر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المخزون</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">المبيعات</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 bg-opacity-50 divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    جاري تحميل البيانات...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-red-400">
                  ❌ {error}
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                  لا توجد منتجات متاحة
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 text-right text-sm text-gray-100">{p.name}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">{p.category}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">
                    {suppliers.find(s => s.id === p.SupplierId)?.name || 'غير معروف'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">
                    {p.packing_date ? 
                      new Date(p.packing_date).toLocaleDateString('ar-EG') : 
                      'غير محدد'
                    }
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">{p.stock - p.sales}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">{p.sales}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-300">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-indigo-900/20 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          إضافة منتج جديد
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download size={18} />
          تصدير إلى Excel
        </button>
      </div>
    </motion.div>
  );
};

export default ProductsTable;