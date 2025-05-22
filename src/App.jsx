// src/App.jsx
import React from 'react';
import Header from './components/Header';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth }   from './contexts/AuthContext';
import Login         from './pages/Login';
import Home          from './pages/Home';
import './index.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-4">載入中…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公開的登入／註冊頁 */}
        <Route path="/login" element={<Login />} />

        {/* 受保護的所有路由 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              {/* 全域 Header */}
              <Header />
              {/* 根據角色自動切換的主頁 */}
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}