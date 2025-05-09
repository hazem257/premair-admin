// OrdersPage.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import OrdersTable from "../components/orders/OrdersTable";
import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import QuranVerse from "../components/QuranVerse" ;
const OrdersPage = ({ orders, setOrders, products }) => {
  const orderStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status === "قيد المعالجة").length,
    completedOrders: orders.filter(order => order.status === "تم التسليم").length,
    totalRevenue: orders
      .reduce((sum, order) => sum + order.total, 0)
      .toLocaleString('ar-EG', { style: 'currency', currency: 'EGP' })
  };

  return (
    <div className='flex-1 relative z-10 overflow-auto'>
      <Header title={"الــطـلـبـات"} />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard name='مجموع الطلبات' icon={ShoppingBag} value={orderStats.totalOrders} color='#6366F1' />
          <StatCard name='الطلبات المعلقة' icon={Clock} value={orderStats.pendingOrders} color='#F59E0B' />
          <StatCard
            name='الطلبات المكتمله'
            icon={CheckCircle}
            value={orderStats.completedOrders}
            color='#10B981'
          />
          <StatCard name='مجموع المكسب ' icon={DollarSign} value={orderStats.totalRevenue} color='#EF4444' />
        </motion.div>

        <OrdersTable 
          orders={orders} 
          setOrders={setOrders} 
          products={products} 
        />
         <QuranVerse
          arabicText="﴿ وَإِذَا جَاءَكَ الَّذِينَ يُؤْمِنُونَ بِآيَاتِنَا فَقُلْ سَلَامٌ عَلَيْكُمْ ۖ كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ ۖ أَنَّهُ مَنْ عَمِلَ مِنكُمْ سُوءًا بِجَهَالَةٍ ثُمَّ تَابَ مِن بَعْدِهِ وَأَصْلَحَ فَأَنَّهُ غَفُورٌ رَّحِيمٌ﴾"
          reference="﴿ الأنعام : 54﴾"
        />
      </main>
    </div>
  );
};

export default OrdersPage;
