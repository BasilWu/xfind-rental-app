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
  const [filteredListings, setFilteredListings] = useState([]);

  // 載入 Google Maps SDK
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // Map onLoad
  const onLoadMap = useCallback(map => {
    mapRef.current = map;
  }, []);

  // 初次載入時，初始化篩後列表及滑桿範圍
  useEffect(() => {
    if (listings.length) {
      const prices = listings.map(l => l.price);
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      setFilters(f => ({ ...f, priceRange: [minP, maxP] }));
      setFilteredListings(listings);
    }
  }, []);

  // 當 searchCenter 變動，自動平移並依據 Bounds 篩選
  useEffect(() => {
    if (searchCenter && mapRef.current) {
      mapRef.current.panTo(searchCenter);
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const geoFiltered = listings.filter(item =>
          item.lat >= sw.lat() &&
          item.lat <= ne.lat() &&
          item.lng >= sw.lng() &&
          item.lng <= ne.lng()
        );
        setFilteredListings(geoFiltered);
      }
    }
  }, [searchCenter]);

  // 當其它篩選條件變動，重新套用所有條件
  useEffect(() => {
    let result = listings;
    // 價格
    const [minPrice, maxPrice] = filters.priceRange;
    result = result.filter(l => l.price >= minPrice && l.price <= maxPrice);
    // 臥室
    if (filters.bedrooms.length && result[0]?.bedrooms !== undefined) {
      result = result.filter(l => filters.bedrooms.includes(l.bedrooms));
    }
    // 衛浴
    if (filters.bathrooms.length && result[0]?.bathrooms !== undefined) {
      result = result.filter(l => filters.bathrooms.includes(l.bathrooms));
    }
    setFilteredListings(result);
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
        }
        toast.success('定位成功');
      },
      err => {
        toast.error(`定位失敗：${err.message}`);
      }
    );
  };

  if (!isLoaded) return <div className="p-4">Loading map…</div>;

  const bedroomOptions = [1, 2, 3, 4].map(n => ({ value: n, label: `${n} 房` }));
  const bathroomOptions = [1, 2, 3].map(n => ({ value: n, label: `${n} 衛` }));

  return (
    <div className="flex h-screen">
      {/* 篩選＋列表 */}
      <div className="w-1/3 bg-gray-50 overflow-y-auto p-4 space-y-6">
        <h2 className="text-xl font-semibold">篩選條件</h2>

        {/* 價格區間 */}
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

      {/* 地圖區 */}
      <div className="flex-1 relative">
        {/* 定位我按鈕 */}
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
          options={{
            gestureHandling: 'greedy',  // 允許滑鼠滾輪直接縮放
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