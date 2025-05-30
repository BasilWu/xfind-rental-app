// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';

// 頁面元件
import Login         from './pages/Login';
import Home          from './pages/Home';
import MyProfile     from './pages/MyProfile';
import RentalDetail  from './pages/RentalDetail';
import LandlordHome  from './pages/LandlordHome';


function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">載入中…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

// 受保護的共用佈局：先渲染 Header，再渲染對應頁面
function ProtectedLayout({ onPlaceSelect }) {
  return (
    <>
      <Header onPlaceSelect={onPlaceSelect} />
      <Outlet />
    </>
  );
}

export default function App() {
  const [searchCenter, setSearchCenter] = useState(null);
  const handlePlaceSelect = center => setSearchCenter(center);

  return (
    <BrowserRouter>
      <Routes>
        {/* 只有未登入時才能進 /login */}
        <Route path="/login" element={<Login />} />

        {/* 以下所有路由都套用 ProtectedRoute + ProtectedLayout */}
        <Route element={
          <ProtectedRoute>
            <ProtectedLayout onPlaceSelect={handlePlaceSelect} />
          </ProtectedRoute>
        }>
          <Route path="/"            element={<Home searchCenter={searchCenter} />} />
          <Route path="/profile"     element={<MyProfile />} />
          <Route path="/detail/:id"  element={<RentalDetail />} />
          <Route path="/landlord"    element={<LandlordHome />} />
        </Route>

        {/* 其他不符合的自動跳回首頁 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}