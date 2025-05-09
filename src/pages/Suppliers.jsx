import { useState } from "react";
import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import SuppliersTable from "../components/suppliers/SuppliersTable";
import QuranVerse from "../components/QuranVerse";
const initialSuppliers = [
  { id: 1, name: "محمد أحمد", email: "mohamed@example.com", country: "مصر" },
];

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState(initialSuppliers);

  // حساب عدد الدول الفريدة
  const uniqueCountries = [...new Set(suppliers.map(s => s.country))].length;

  return (
    <div className='flex-1 overflow-auto relative z-10'>
      <Header title='الــمـورديـن' />

      <main className='max-w-7xl mx-auto py-6 px-4 lg:px-8'>
        {/* STATS */}
        <motion.div
          className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name='مجموع الموردين'
            icon={UsersIcon}
            value={suppliers.length.toLocaleString()}
            color='#6366F1'
          />
          <StatCard
            name='مجموع الدول '
            icon={UserCheck}
            value={uniqueCountries.toLocaleString()}
            color='#F59E0B'
          />
        </motion.div>

        <SuppliersTable 
          suppliers={suppliers} 
          setSuppliers={setSuppliers} 
        />
        <div className="quran" style={{width:"100%", display:"flex",alignItems:"center", justifyContent:"center"}}>
         <QuranVerse
         
          arabicText="﴿ ۞ وَاتْلُ عَلَيْهِمْ نَبَأَ نُوحٍ إِذْ قَالَ لِقَوْمِهِ يَا قَوْمِ إِن كَانَ كَبُرَ عَلَيْكُم مَّقَامِي وَتَذْكِيرِي بِآيَاتِ اللَّهِ فَعَلَى اللَّهِ تَوَكَّلْتُ فَأَجْمِعُوا أَمْرَكُمْ وَشُرَكَاءَكُمْ ثُمَّ لَا يَكُنْ أَمْرُكُمْ عَلَيْكُمْ غُمَّةً ثُمَّ اقْضُوا إِلَيَّ وَلَا تُنظِرُونِ﴾"
          reference="﴿ يونس: 71﴾"
        />
      </div>
      </main>
    </div>
  );
};
export default Suppliers;