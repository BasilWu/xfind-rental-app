// src/components/Header.jsx
import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

export default function Header({ onPlaceSelect }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  // 載入 Google Places Library
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
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      onPlaceSelect({ lat, lng });
    }
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
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

      <div className="flex items-center space-x-4">
        <span className="font-semibold">Hello,</span>
        <span className="font-bold">{user.email}</span>
        <span className="ml-2 text-sm text-gray-600">
          ({profile?.role ?? 'tenant'})
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          登出
        </button>
      </div>
    </header>
  );
}