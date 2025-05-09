import { BarChart2, DollarSign, Menu, SquareChartGantt, ShoppingBag, ShoppingCart, TrendingUp, Users, LogOut } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Employee from "../../pages/Employee";

const SIDEBAR_ITEMS = [
  {
    name: "نظرة عامة",
    icon: BarChart2,
    color: "#6366f1",
    href: "/",
  },
  { name: "الموظفين", icon:Users, color: "green", href: "/employee" },
  { name: "المنتجات", icon: ShoppingBag, color: "#8B5CF6", href: "/products" },
  { name: "الموردين", icon: SquareChartGantt, color: "#8B5CF6", href: "/suppliers" },
  { name: "المستخدمين", icon: Users, color: "#EC4899", href: "/users" },
  { name: "المبيعات", icon: DollarSign, color: "#10B981", href: "/sales" },
  { name: "الطلبات", icon: ShoppingCart, color: "#F59E0B", href: "/orders" },
];

const Sidebar = ({ setIsLoggedIn }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    
    setIsLoggedIn(false);
    
    navigate("/login");
    
    window.location.reload();
  };

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className='h-full bg-gray-800 bg-opacity-50 backdrop-blur-md p-4 flex flex-col border-r border-gray-700'>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className='p-2 rounded-full hover:bg-gray-700 transition-colors max-w-fit'
        >
          <Menu size={24} />
        </motion.button>

        <nav className='mt-8 flex-grow'>
          {SIDEBAR_ITEMS.map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mb-2'>
                <item.icon size={20} style={{ color: item.color, minWidth: "20px", marginLeft:"10px" }} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className='ml-4 whitespace-nowrap'
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* زر تسجيل الخروج */}
        <motion.button
          onClick={handleLogout}
          className='flex items-center p-4 text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors mt-auto mb-4 '
        >
          <LogOut size={20} style={{ color: "#EF4444", minWidth: "20px", marginLeft:"10px" }} />
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                className='ml-4 whitespace-nowrap'
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                تسجيل الخروج
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
