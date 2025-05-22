import { Link } from "react-router-dom";
import React, { useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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

      <div>
        <span>Hello, {user?.email}</span>
        <Link to="/profile" className="ml-4 hover:underline">會員中心</Link>
        {/* 只有房東看到 */}
        {profile?.role === "landlord" && (
          <Link to="/landlord" className="ml-4 hover:underline">
            房東後台
          </Link>
        )}
        <button onClick={handleLogout} className="ml-4 text-red-500">登出</button>
      </div>
    </header>
  );
}