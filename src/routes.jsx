// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }           from './contexts/AuthContext';
import Login                 from './pages/Login';
import Home                  from './pages/Home';       // 你先前的首頁組件
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>載入中…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 登入／註冊 */}
        <Route path="/login" element={<Login />} />

        {/* 受保護的首頁路由 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* 其他路由… */}
      </Routes>
    </BrowserRouter>
  );
}