// src/pages/TenantHome.jsx
import React, {
  useRef,
  useState,
  useEffect,
  useCallback
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import Select from 'react-select';
import {
  GoogleMap,
  Marker,
  InfoWindow,
  useJsApiLoader
} from '@react-google-maps/api';
import listings from '../data/listings';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LIBRARIES = ['places'];

export default function TenantHome({ searchCenter }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  // 篩選 state
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],
    bedrooms: [],
    bathrooms: []
  });
  // 真正要顯示在列表和地圖上的房源
  const [filteredListings, setFilteredListings] = useState([]);

  // Google Maps SDK 載入
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // Map onLoad 時綁訂 reference
  const onLoadMap = useCallback(map => {
    mapRef.current = map;
    // 地圖一載入就觸發一次篩選
    handleBoundsChanged();
  }, []);

  // 依據當前地圖 Bounds 篩選
  const handleBoundsChanged = () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const geoFiltered = listings.filter(item =>
      item.lat >= sw.lat() &&
      item.lat <= ne.lat() &&
      item.lng >= sw.lng() &&
      item.lng <= ne.lng()
    );
    // 再套入其餘篩選條件
    const [minPrice, maxPrice] = filters.priceRange;
    let result = geoFiltered.filter(l => l.price >= minPrice && l.price <= maxPrice);
    if (filters.bedrooms.length && result[0]?.bedrooms !== undefined) {
      result = result.filter(l => filters.bedrooms.includes(l.bedrooms));
    }
    if (filters.bathrooms.length && result[0]?.bathrooms !== undefined) {
      result = result.filter(l => filters.bathrooms.includes(l.bathrooms));
    }
    setFilteredListings(result);
  };

  // 初次載入時，設定價格滑桿範圍（但列表還是先顯示全部）
  useEffect(() => {
    if (listings.length) {
      const prices = listings.map(l => l.price);
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      setFilters(f => ({ ...f, priceRange: [minP, maxP] }));
      setFilteredListings(listings);
    }
  }, []);

  // 當 searchCenter 改變，就平移並觸發一次篩選
  useEffect(() => {
    if (searchCenter && mapRef.current) {
      mapRef.current.panTo(searchCenter);
      mapRef.current.setZoom(14);
      handleBoundsChanged();
    }
  }, [searchCenter]);

  // 當純屬價格/臥室/衛浴篩選改變，也要觸發地圖 Bounds 篩選（否則只改條件卻沒重新套用 Bounds）
  useEffect(() => {
    handleBoundsChanged();
  }, [filters]);

  // 定位我功能
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('您的瀏覽器不支援定位');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        if (mapRef.current) {
          mapRef.current.panTo({ lat: latitude, lng: longitude });
          mapRef.current.setZoom(14);
          handleBoundsChanged();
        }
        toast.success('定位成功');
      },
      err => {
        toast.error(`定位失敗：${err.message}`);
      }
    );
  };

  if (!isLoaded) return <div className="p-4">Loading map…</div>;

  // react-select option 格式
  const bedroomOptions = [1, 2, 3, 4].map(n => ({ value: n, label: `${n} 房` }));
  const bathroomOptions = [1, 2, 3].map(n => ({ value: n, label: `${n} 衛` }));

  return (
    <div className="flex h-screen">
      {/* 左側：篩選 + 列表 */}
      <div className="w-1/3 bg-gray-50 overflow-y-auto p-4 space-y-6">
        <h2 className="text-xl font-semibold">篩選條件</h2>

        {/* 價格區間滑桿 */}
        <div>
          <label className="block text-gray-700 mb-2">價格區間 (NT$)</label>
          <Slider
            range
            min={filters.priceRange[0]}
            max={filters.priceRange[1]}
            value={filters.priceRange}
            allowCross={false}
            onChange={vals => setFilters(f => ({ ...f, priceRange: vals }))}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>NT${filters.priceRange[0]}</span>
            <span>NT${filters.priceRange[1]}</span>
          </div>
        </div>

        {/* 臥室多選 */}
        <div>
          <label className="block text-gray-700 mb-2">臥室數</label>
          <Select
            isMulti
            options={bedroomOptions}
            value={bedroomOptions.filter(o => filters.bedrooms.includes(o.value))}
            onChange={selected =>
              setFilters(f => ({
                ...f,
                bedrooms: selected.map(o => o.value)
              }))
            }
          />
        </div>

        {/* 衛浴多選 */}
        <div>
          <label className="block text-gray-700 mb-2">衛浴數</label>
          <Select
            isMulti
            options={bathroomOptions}
            value={bathroomOptions.filter(o => filters.bathrooms.includes(o.value))}
            onChange={selected =>
              setFilters(f => ({
                ...f,
                bathrooms: selected.map(o => o.value)
              }))
            }
          />
        </div>

        {/* 房源列表 */}
        <h2 className="text-xl font-semibold">房源列表</h2>
        <div className="grid grid-cols-1 gap-4 mt-6">
          {filteredListings.map(item => (
            <Link
              key={item.id}
              to={`/detail/${item.id}`}
              className="bg-white rounded-lg shadow p-4 block hover:shadow-lg transition"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-48 object-cover rounded"
              />
              <div className="mt-2 font-bold text-lg">{item.title}</div>
              <div className="text-sm text-gray-600">{item.address}</div>
              <div className="text-blue-600 font-semibold mt-2">
                {item.price} 元／月
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 右側：地圖 + 定位我按鈕 */}
      <div className="flex-1 relative">
        <button
          onClick={handleLocateMe}
          className="absolute top-4 right-4 z-10 bg-white p-2 rounded shadow hover:bg-gray-100"
        >
          定位我
        </button>

        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={
            searchCenter ||
            (filteredListings[0]
              ? { lat: filteredListings[0].lat, lng: filteredListings[0].lng }
              : { lat: 25.033, lng: 121.565 })
          }
          zoom={14}
          onLoad={onLoadMap}
          onIdle={handleBoundsChanged}  // 每次滑動／縮放完就重新篩選
          options={{
            gestureHandling: 'greedy',   // 滑鼠滾輪直接縮放
            streetViewControl: false,
            mapTypeControl: false
          }}
        >
          {filteredListings.map(item => (
            <Marker
              key={item.id}
              position={{ lat: item.lat, lng: item.lng }}
              onClick={() => navigate(`/detail/${item.id}`)}
            />
          ))}

          {selectedId && (
            <InfoWindow
              position={{
                lat: filteredListings.find(i => i.id === selectedId).lat,
                lng: filteredListings.find(i => i.id === selectedId).lng
              }}
              onCloseClick={() => setSelectedId(null)}
            >
              <div>
                <h3 className="font-bold">
                  {filteredListings.find(i => i.id === selectedId).title}
                </h3>
                <p>
                  NT${filteredListings.find(i => i.id === selectedId).price}/mo
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
      />
    </div>
  );
}