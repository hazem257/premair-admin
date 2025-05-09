import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import ProductsTable from "../components/products/ProductsTable";
import QuranVerse from "../components/QuranVerse";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch products
        const productsRes = await fetch('http://localhost/php-project/products.php?action=get');
        const productsData = await productsRes.json();
        setProducts(productsData);

        // Fetch suppliers
        const suppliersRes = await fetch('http://localhost/php-project/supplier.php?action=get');
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData);

      } catch (error) {
        setError('فشل في تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // حساب الإحصائيات
  const totalProducts = products.length;
  const bestSeller = products.length > 0 ? Math.max(...products.map(p => p.sales)) : 0;
  const lowStock = products.length > 0 ? Math.min(...products.map(p => p.stock)) : 0;
  const totalRevenue = products.reduce((sum, product) => sum + (product.price * product.sales), 0);

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='الـمــنـتـجـات' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* الإحصائيات */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard 
            name='مجموع المنتجات' 
            icon={Package} 
            value={totalProducts.toLocaleString()} 
            color='#6366F1' 
          />
          <StatCard 
            name='الأعلى مبيعاَ' 
            icon={TrendingUp} 
            value={bestSeller.toLocaleString()} 
            color='#10B981' 
          />
          <StatCard 
            name='الأقل مخزوناَ' 
            icon={AlertTriangle} 
            value={lowStock.toLocaleString()} 
            color='#F59E0B' 
          />
          <StatCard 
            name='مجموع المكسب' 
            icon={DollarSign} 
            value={`${totalRevenue.toFixed(2)} ج . م`} 
            color='#EF4444' 
          />
        </motion.div>
        
        {/* جدول المنتجات */}
        <ProductsTable 
          products={products} 
          suppliers={suppliers}
          setProducts={setProducts}
          isLoading={isLoading}
          error={error}
        />
        <div className="quran" style={{width:"100%", display:"flex",alignItems:"center", justifyContent:"center"}}>
         <QuranVerse
          arabicText="﴿ إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا﴾"
          reference="﴿الأحزاب: 56﴾"
        />
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;