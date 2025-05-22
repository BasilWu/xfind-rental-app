// src/components/Header.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div>
        <span className="font-semibold">Hello,</span>{' '}
        <span className="font-bold">{user.email}</span>
        <span className="ml-4 text-sm text-gray-600">
          ({profile?.role ?? 'tenant'})
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        登出
      </button>
    </header>
  );
}