// src/App.jsx
import React, { useState } from 'react';
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
  // 搜尋後的地點中心
  const [searchCenter, setSearchCenter] = useState(null);

  const handlePlaceSelect = center => {
    setSearchCenter(center);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Header onPlaceSelect={handlePlaceSelect} />
              <Home searchCenter={searchCenter} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}