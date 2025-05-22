// src/pages/TenantHome.jsx
import listings from '../data/listings';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
// keep libraries array static to avoid reloading script
const LIBRARIES = ['places'];
import Select from 'react-select';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

export default function TenantHome({ searchCenter }) {
  // Google Map loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  const mapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  // 篩選 state
  const [filters, setFilters] = useState({
    priceRange: [0, 10000],    // 初始上下限
    bedrooms: [],              // [1,2,...]
    bathrooms: []              // [1,2,...]
  });

  // 原始與篩後列表
  const [filteredListings, setFilteredListings] = useState([]);

  // 地圖初始化
  const onLoadMap = useCallback(map => {
    mapRef.current = map;
  }, []);

  // 當 listings 改變，先設定篩後資料跟價格滑桿範圍
  useEffect(() => {
    if (listings.length) {
      const prices = listings.map(l => l.price);
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      setFilters(f => ({ ...f, priceRange: [minP, maxP] }));
      setFilteredListings(listings);
    }
  }, []);

  // 當 searchCenter 改變，先套用地理篩選
  useEffect(() => {
    if (searchCenter && mapRef.current) {
      mapRef.current.panTo(searchCenter);
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();
        const geoFiltered = listings.filter(item =>
          item.lat >= sw.lat() && item.lat <= ne.lat() &&
          item.lng >= sw.lng() && item.lng <= ne.lng()
        );
        setFilteredListings(geoFiltered);
      }
    }
  }, [searchCenter]);

  // 當 filters 或 listings 變動，套用所有篩選條件
  useEffect(() => {
    let result = listings;

    // 價格區間
    const [minPrice, maxPrice] = filters.priceRange;
    result = result.filter(l => l.price >= minPrice && l.price <= maxPrice);

    // 臥室數
    // （如果你資料有要補上 bedrooms 屬性才會作用，否則不會過濾）
    if (filters.bedrooms.length && result[0]?.bedrooms !== undefined) {
      result = result.filter(l => filters.bedrooms.includes(l.bedrooms));
    }
    // 衛浴數
    if (filters.bathrooms.length && result[0]?.bathrooms !== undefined) {
      result = result.filter(l => filters.bathrooms.includes(l.bathrooms));
    }

    setFilteredListings(result);
  }, [filters]);

  if (!isLoaded) return <div>Loading map…</div>;

  // react-select option 格式
  const bedroomOptions = [1,2,3,4].map(n => ({ value: n, label: `${n} 房` }));
  const bathroomOptions = [1,2,3].map(n => ({ value: n, label: `${n} 衛` }));

  return (
    <div className="flex h-screen">
      {/* 左側篩選＋列表 */}
      <div className="w-1/3 bg-gray-50 overflow-y-auto p-4 space-y-6">
        <h2 className="text-xl font-semibold">篩選條件</h2>

        {/* 價格區間滑桿 */}
        <div>
          <label className="block text-gray-700 mb-2">價格區間 (NT$)</label>
          <Slider
            range
            min={filters.priceRange[0]}
            max={filters.priceRange[1]}
            defaultValue={filters.priceRange}
            value={filters.priceRange}
            allowCross={false}
            onChange={vals => setFilters(f => ({ ...f, priceRange: vals }))}
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>NT${filters.priceRange[0]}</span>
            <span>NT${filters.priceRange[1]}</span>
          </div>
        </div>

        {/* 臥室數多選 */}
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

        {/* 衛浴數多選 */}
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
        {/* 列表區 */}
        <h2 className="text-xl font-semibold">房源列表</h2>
        <div className="grid grid-cols-1 gap-4 mt-6">
          {filteredListings.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-4">
              <img
                src={item.image || item.imageUrl}
                alt={item.title}
                className="w-full h-48 object-cover rounded"
              />
              <div className="mt-2 font-bold text-lg">{item.title}</div>
              <div className="text-sm text-gray-600">{item.address}</div>
              <div className="text-blue-600 font-semibold mt-2">{item.price} 元／月</div>
            </div>
          ))}
        </div>
      </div>

      {/* 地圖 */}
      <div className="flex-1 relative">
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
        >
          {filteredListings.map(item => (
            <Marker
              key={item.id}
              position={{ lat: item.lat, lng: item.lng }}
              onClick={() => setSelectedId(item.id)}
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
    </div>
  );
}