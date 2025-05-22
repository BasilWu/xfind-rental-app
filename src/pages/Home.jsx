import React, { useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import '../index.css';

export default function Home() {
  // —— 1. 所有 Hook 必須放在最頂端、無條件呼叫 ——  
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });
  const [address, setAddress] = useState('');
  const [filters, setFilters] = useState({ priceMin: '', priceMax: '', beds: '' });
  const mapRef = useRef(null);
  const onLoadMap = useCallback(mapInstance => {
    mapRef.current = mapInstance;
  }, []);
  const [selectedId, setSelectedId] = useState(null);

  // —— 2. 假資料 & 過濾邏輯 ——  
  const rawListings = [
    { id: 1, title: 'Cozy Studio', price: 8000, beds: 0, lat: 25.034, lng: 121.564 },
    { id: 2, title: '1BR Apt',     price: 12000, beds: 1, lat: 25.032, lng: 121.566 },
    { id: 3, title: '2BR Loft',    price: 15000, beds: 2, lat: 25.036, lng: 121.562 }
  ];
  const listings = rawListings.filter(item => {
    if (filters.priceMin && item.price < +filters.priceMin) return false;
    if (filters.priceMax && item.price > +filters.priceMax) return false;
    if (filters.beds !== '' && item.beds < +filters.beds) return false;
    return true;
  });

  // —— 3. 條件渲染：先處理錯誤或載入中 ——  
  if (loadError) {
    return <div className="p-4">地圖錯誤：{loadError.message}</div>;
  }
  if (!isLoaded) {
    return <div className="p-4">地圖載入中…</div>;
  }

  // —— 4. 列表點擊，地圖平移並打開 InfoWindow ——  
  const handleCardClick = item => {
    mapRef.current.panTo({ lat: item.lat, lng: item.lng });
    setSelectedId(item.id);
  };

  // —— 5. 正式渲染整個頁面 ——  
  return (
    <div className="h-screen flex flex-col">
      {/* 頂部搜尋欄（可自行擴展） */}
      <div className="bg-white p-4 shadow-md z-10">
        {/* 這裡放搜尋輸入、篩選按鈕… */}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左側列表區 */}
        <div className="w-1/3 bg-gray-50 overflow-y-auto p-4">
          <h2 className="text-xl font-semibold mb-4">Homes for Rent</h2>
          {listings.map(item => (
            <div
              key={item.id}
              onClick={() => handleCardClick(item)}
              className="mb-4 p-4 bg-white border rounded hover:shadow cursor-pointer transition"
            >
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-gray-600">NT${item.price.toLocaleString()}/mo</p>
              <p className="text-gray-500">
                {item.beds > 0 ? `${item.beds} Beds` : 'Studio'}
              </p>
            </div>
          ))}
          {listings.length === 0 && (
            <p className="text-gray-500 mt-8">沒有符合篩選條件的房源。</p>
          )}
        </div>

        {/* 右側地圖區 */}
        <div className="flex-1 relative">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={
              listings[0]
                ? { lat: listings[0].lat, lng: listings[0].lng }
                : { lat: 25.033, lng: 121.565 }
            }
            zoom={14}
            onLoad={onLoadMap}
          >
            {listings.map(item => (
              <Marker
                key={item.id}
                position={{ lat: item.lat, lng: item.lng }}
                onClick={() => setSelectedId(item.id)}
              />
            ))}

            {selectedId && (
              <InfoWindow
                position={{
                  lat: listings.find(i => i.id === selectedId).lat,
                  lng: listings.find(i => i.id === selectedId).lng
                }}
                onCloseClick={() => setSelectedId(null)}
              >
                <div>
                  <h3 className="font-bold">
                    {listings.find(i => i.id === selectedId).title}
                  </h3>
                  <p>NT${listings.find(i => i.id === selectedId).price}/mo</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}