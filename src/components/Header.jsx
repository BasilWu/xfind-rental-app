// src/components/Header.jsx
import { Link, useNavigate } from "react-router-dom";
import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

export default function Header({ onPlaceSelect }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const autocompleteRef = useRef(null);
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const onLoadAutocomplete = ref => { autocompleteRef.current = ref; };
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
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        {/* 首頁按鈕 */}
        <button
          onClick={() => navigate('/')}
          className="text-xl font-bold hover:opacity-80"
        >
          XFind
        </button>

        {/* 地址搜尋 */}
        {isLoaded && (
          <Autocomplete
            onLoad={onLoadAutocomplete}
            onPlaceChanged={onPlaceChanged}
          >
            <input
              type="text"
              placeholder="搜尋地址"
              className="border rounded px-3 py-2 w-64 focus:outline-none"
            />
          </Autocomplete>
        )}
      </div>

      <div>
        <span className="mr-4">Hello, {user?.email}</span>
        <Link to="/" className="mr-4 hover:underline">首頁</Link>
        <Link to="/profile" className="mr-4 hover:underline">會員中心</Link>
        {profile?.role === "landlord" && (
          <Link to="/landlord" className="mr-4 hover:underline">
            房東後台
          </Link>
        )}
        <button onClick={handleLogout} className="text-red-500 hover:opacity-80">
          登出
        </button>
      </div>
    </header>
  );
}