import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Edit, Trash2, Plus, Download, RefreshCw } from "lucide-react";
import { utils, writeFile } from "xlsx-js-style";

const API_BASE_URL = "http://localhost/php-project";

const OrdersTable = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customerID: "",
    customer_name: "",
    address: "",
    price: 0,
    PaymentMethod: "Cash",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useExistingCustomer, setUseExistingCustomer] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersResponse, customersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/order1.php`).then(handleResponse),
        fetch(`${API_BASE_URL}/customer.php`).then(handleResponse),
      ]);
      setOrders(ordersResponse);
      setCustomers(customersResponse);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(`حدث خطأ في جلب البيانات: ${err.message}`);
      if (retryCount < 3) {
        setTimeout(() => setRetryCount(retryCount + 1), 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (response) => {
    if (!response.ok) throw new Error(await response.text() || "Request failed");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };

  useEffect(() => { fetchData(); }, [retryCount]);

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.orderID.toString().includes(search) ||
      order.customer_name?.toLowerCase().includes(search) ||
      order.customer_phones?.toString().includes(search)
    );
  });

  const handleDelete = async (orderId) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/order1.php?id=${orderId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(await response.text());
      setOrders((prev) => prev.filter((order) => order.orderID !== orderId));
    } catch (err) {
      console.error("Delete error:", err);
      setError(`فشل في حذف الطلب: ${err.message}`);
    }
  };

  const handleSave = async (isEdit) => {
    const currentOrder = isEdit ? editingOrder : newOrder;
    const parsedPrice = parseFloat(currentOrder.price);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("الرجاء إدخال المبلغ بشكل صحيح");
      return;
    }
    if (!currentOrder.customer_name) {
      setError("الرجاء إدخال اسم العميل");
      return;
    }
    
    if (currentOrder.price <= 0) {
      setError("الرجاء إدخال المبلغ بشكل صحيح");
      return;
    }

    try {
      const orderData = { 
        ...currentOrder,
        customerID: useExistingCustomer ? currentOrder.customerID : null
      };

      const response = await fetch(`${API_BASE_URL}/order1.php`, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) throw new Error(await response.text());
      await fetchData();
      isEdit ? setEditingOrder(null) : setShowAddModal(false);
      if (!isEdit) {
        setNewOrder({ 
          customerID: "", 
          customer_name: "", 
          address: "", 
          price: 0, 
          PaymentMethod: "Cash" 
        });
        setUseExistingCustomer(true);
      }
    } catch (err) {
      console.error("Save error:", err);
      setError(`فشل في حفظ الطلب: ${err.message}`);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = [
        ["رقم الطلب", "اسم العميل", "رقم الهاتف", "العنوان", "المجموع", "التاريخ"],
        ...orders.map((order) => [
          order.orderID,
          order.customer_name || "غير محدد",
          order.customer_phones || "غير محدد",
          order.address || "غير محدد",
          parseFloat(order.price).toFixed(2),
          new Date(order.ReceiveTime).toLocaleDateString("ar-EG"),
        ]),
      ];
      const ws = utils.aoa_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "الطلبات");
      writeFile(wb, "الطلبات.xlsx");
    } catch (err) {
      console.error("Export error:", err);
      setError(`فشل في التصدير: ${err.message}`);
    }
  };

  const OrderModal = ({ isEdit }) => {
    const currentOrder = isEdit ? editingOrder : newOrder;
    const [formError, setFormError] = useState("");

    const handleInputChange = (e) => {
      const { name, value } = e.target;
    
      if (isEdit) {
        setEditingOrder((prev) => ({ ...prev, [name]: value }));
      } else {
        setNewOrder((prev) => ({ ...prev, [name]: value }));
      }
    };
    
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
          <h3 className="text-xl mb-4 text-white">
            {isEdit ? "تعديل الطلب" : "إضافة طلب جديد"}
          </h3>
          {formError && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{formError}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-1">العميل *</label>
              
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setUseExistingCustomer(true)}
                  className={`px-3 py-1 text-sm rounded ${useExistingCustomer ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  اختر عميل موجود
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingCustomer(false)}
                  className={`px-3 py-1 text-sm rounded ${!useExistingCustomer ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                >
                  إضافة عميل جديد
                </button>
              </div>

              {useExistingCustomer ? (
                <select
                  name="customerID"
                  value={currentOrder.customerID}
                  onChange={(e) => {
                    handleInputChange(e);
                    const selectedCustomer = customers.find(c => c.customerID === e.target.value);
                    if (selectedCustomer) {
                      if (isEdit) {
                        setEditingOrder(prev => ({ ...prev, customer_name: selectedCustomer.customer_name }));
                      } else {
                        setNewOrder(prev => ({ ...prev, customer_name: selectedCustomer.customer_name }));
                      }
                    }
                  }}
                  className="bg-gray-700 text-white p-2 rounded w-full"
                  required
                >
                  <option value="">اختر عميل</option>
                  {customers.map((customer) => (
                    <option key={customer.customerID} value={customer.customerID}>
                      {customer.customer_name} - {customer.customerID}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="customer_name"
                  value={currentOrder.customer_name || ''}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded w-full"
                  placeholder="أدخل اسم العميل الجديد"
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-gray-300 mb-1">العنوان</label>
              <input
                type="text"
                name="address"
                value={currentOrder.address}
                onChange={handleInputChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-1">المبلغ </label>
              <input
                 type="number"
                  name="price"
                  value={currentOrder.price}
                  onChange={handleInputChange}
                  className="bg-gray-700 text-white p-2 rounded w-full"
                  placeholder="أدخل المبلغ"
              />

            </div>

            <div>
              <label className="block text-gray-300 mb-1">طريقة الدفع</label>
              <select
                name="PaymentMethod"
                value={currentOrder.PaymentMethod}
                onChange={handleInputChange}
                className="bg-gray-700 text-white p-2 rounded w-full"
              >
                <option value="Cash">نقدي</option>
                <option value="Credit">بطاقة ائتمان</option>
                <option value="BankTransfer">تحويل بنكي</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => (isEdit ? setEditingOrder(null) : setShowAddModal(false))}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleSave(isEdit)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {showAddModal && <OrderModal isEdit={false} />}
      {editingOrder && <OrderModal isEdit={true} />}

      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-semibold text-gray-100">قائمة الطلبات</h2>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث برقم الطلب، اسم العميل أو الهاتف..."
              className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold">خطأ!</p>
              <p>{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-1 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              <RefreshCw size={14} /> إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
          <p>جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? "لا توجد نتائج مطابقة للبحث" : "لا توجد طلبات متاحة"}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-800">
                <tr
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-24">
                    رقم الطلب
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase flex-1 min-w-[150px]">
                    اسم العميل
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-32">
                    رقم الهاتف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-48">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-32">
                    المجموع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-40">
                    طريقة الدفع
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-32">
                    التاريخ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase w-24">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.orderID}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-800 flex"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <td className="px-6 py-4 text-right text-sm text-gray-100 w-24">
                      #{order.orderID}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-300 flex-1 min-w-[150px]">
                      {order.customer_name || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-300 w-32">
                      {order.customer_phones || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-300 w-48">
                      {order.address || "غير محدد"}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-300 w-32">
                      {parseFloat(order.price).toLocaleString("ar-EG", {
                        style: "currency",
                        currency: "EGP",
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-100 w-40">
                      {order.PaymentMethod}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-300 w-32">
                      {new Date(order.ReceiveTime).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-300 w-24 flex gap-2">
                      <button
                        onClick={() => setEditingOrder(order)}
                        className="text-blue-400 hover:text-blue-300"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(order.orderID)}
                        className="text-red-400 hover:text-red-300"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> إضافة طلب
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          disabled={orders.length === 0}
        >
          <Download size={18} /> تصدير إكسل
        </button>
      </div>
    </motion.div>
  );
};

export default OrdersTable;