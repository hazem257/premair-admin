// App.jsx
import { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import OverviewPage from './pages/OverviewPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import SalesPage from './pages/SalesPage';
import OrdersPage from './pages/OrdersPage';
import Suppliers from './pages/Suppliers';
import Login from './pages/LogIn'; 
import Employee from './pages/Employee';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : [];
  });
  const [orders, setOrders] = useState([]); // أضف هذه السطر إذا كان `orders` غير معرّف

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);
  }, []);

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div className='flex h-screen bg-gray-900 text-gray-100 overflow-hidden'>
      {/* الخلفية */}
      <div className='fixed inset-0 z-0'>
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80' />
        <div className='absolute inset-0 backdrop-blur-sm' />
      </div>

      <Sidebar setIsLoggedIn={setIsLoggedIn} />
      
      <Routes>
        <Route path='/' element={<OverviewPage  />} />
        <Route 
          path='/products' 
          element={
            <ProductsPage 
              products={products} 
              setProducts={setProducts} 
            />
          } 
        />
        <Route path='/suppliers' element={<Suppliers />} />
        <Route path='/users' element={<UsersPage />} />
        <Route path='/employee' element={<Employee />} />
        <Route path='/sales' element={<SalesPage />} />
        <Route 
          path='/orders' 
          element={
            <OrdersPage 
              orders={orders} 
              setOrders={setOrders} 
              products={products} 
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
