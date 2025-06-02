// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

export default function Header({ onPlaceSelect }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  // 載入 Google Maps Places Autocomplete
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const autocompleteRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const onLoadAutocomplete = ref => {
    autocompleteRef.current = ref;
  };
  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      onPlaceSelect({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow px-6 py-4 flex justify-between items-center">
      {/* 左側：Logo（首頁按鈕）＋搜尋欄 */}
      <div className="flex items-center space-x-6">
        {/* Logo or 首頁按鈕 */}
        <button
          onClick={() => navigate('/')}
          className="text-2xl font-bold hover:opacity-80"
        >
          XFind
        </button>

        {/* 地址搜尋（Autocomplete） */}
        {isLoaded && (
          <Autocomplete
            onLoad={onLoadAutocomplete}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="搜尋地址"
              className="border border-gray-300 rounded px-3 py-2 w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </Autocomplete>
        )}
      </div>

      {/* 右側：使用者資訊＋導覽按鈕 */}
      <div className="flex items-center space-x-4">
        <span className="text-gray-700">Hello, {user?.email}</span>

        <Link to="/" className="text-gray-700 hover:underline">
          首頁
        </Link>

        <Link to="/profile" className="text-gray-700 hover:underline">
          會員中心
        </Link>

        {profile?.role === "landlord" && (
          <Link to="/landlord" className="text-gray-700 hover:underline">
            房東後台
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="text-red-500 hover:opacity-80"
        >
          登出
        </button>
      </div>
    </header>
  );
}