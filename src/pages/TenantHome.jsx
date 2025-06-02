// src/pages/TenantHome.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
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
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import listings from '../data/listings';

const LIBRARIES = ['places'];

export default function TenantHome({ searchCenter }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  // 篩選 state
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],  // 之後會用真實資料計算範圍
    bedrooms: [],             // e.g. [1,2]
    bathrooms: []             // e.g. [1,2]
  });
  // 真正要顯示在列表及地圖上的資料
  const [filteredListings, setFilteredListings] = useState([]);

  // 載入 Google Maps SDK
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // 地圖 onLoad：綁定 map 參考
  const onLoadMap = useCallback((map) => {
    mapRef.current = map;
    // 地圖初次載入時，就做一次範圍篩選
    handleBoundsChanged();
  }, []);

  // 當「searchCenter」變動時，把地圖平移到該中心並更新篩選
  useEffect(() => {
    if (searchCenter && mapRef.current) {
      mapRef.current.panTo(searchCenter);
      mapRef.current.setZoom(14);
      handleBoundsChanged();
    }
  }, [searchCenter]);

  // 初始設定：當 listings 有內容時，先把價格範圍設定好，並且將 filteredListings 初始化為全部列表
  useEffect(() => {
    if (listings.length) {
      const prices = listings.map(l => l.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      setFilters(f => ({
        ...f,
        priceRange: [minPrice, maxPrice]
      }));
      setFilteredListings(listings);
    }
  }, []);

  // 當 filters（價格/臥室/衛浴）變動時，要重新套用篩選（但不動地圖範圍），
  // 先篩出符合條件的 listings，再交給 handleBoundsChanged 去做地圖範圍過濾
  useEffect(() => {
    handleBoundsChanged();
  }, [filters]);

  // 依據目前地圖 Bounds 再加上其他「filters」條件做篩選
  const handleBoundsChanged = () => {
    if (!mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    if (!bounds) return;

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // 先篩出「地圖範圍內」的物件
    let geoFiltered = listings.filter(item =>
      item.lat >= sw.lat() &&
      item.lat <= ne.lat() &&
      item.lng >= sw.lng() &&
      item.lng <= ne.lng()
    );

    // 再套用「價格」篩選
    const [minP, maxP] = filters.priceRange;
    geoFiltered = geoFiltered.filter(l => l.price >= minP && l.price <= maxP);

    // 再套用「臥室」篩選 (如果有 bedrooms 屬性才做)
    if (filters.bedrooms.length && geoFiltered[0]?.bedrooms !== undefined) {
      geoFiltered = geoFiltered.filter(l => filters.bedrooms.includes(l.bedrooms));
    }

    // 再套用「衛浴」篩選 (如果有 bathrooms 屬性才做)
    if (filters.bathrooms.length && geoFiltered[0]?.bathrooms !== undefined) {
      geoFiltered = geoFiltered.filter(l => filters.bathrooms.includes(l.bathrooms));
    }

    setFilteredListings(geoFiltered);
  };

  // 「定位我」功能：只在使用者點擊時，將地圖平移到當前位置
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('您的瀏覽器不支援定位功能');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(14);
          handleBoundsChanged();
          toast.success('已定位到您的位置');
        }
      },
      (err) => {
        toast.error('定位失敗：' + err.message);
      }
    );
  };

  if (!isLoaded) return <div className="p-4">地圖載入中…</div>;

  // 將 rc-slider 以及 react-select 的 option 格式定義好
  const bedroomOptions = [1, 2, 3, 4].map(n => ({ value: n, label: `${n} 房` }));
  const bathroomOptions = [1, 2, 3].map(n => ({ value: n, label: `${n} 衛` }));

  return (
    <div className="flex flex-col h-screen">
      {/* ----------------------- */}
      {/* 1. 上方篩選列（Header） */}
      {/* ----------------------- */}
      <div className="bg-white shadow p-4 flex flex-wrap items-center space-x-4 z-10">
        {/* 定位我按鈕 */}
        <button
          onClick={handleLocateMe}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          定位我
        </button>

        {/* 價格區間 */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">價格：</label>
          <div className="w-64">
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
        </div>

        {/* 臥室數 */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">臥室：</label>
          <div className="w-40">
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
              placeholder="不限"
            />
          </div>
        </div>

        {/* 衛浴數 */}
        <div className="flex items-center space-x-2">
          <label className="text-gray-700">衛浴：</label>
          <div className="w-40">
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
              placeholder="不限"
            />
          </div>
        </div>
      </div>

      {/* ----------------------- */}
      {/* 2. 主要內容：地圖 + 列表 */}
      {/* ----------------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* 2A. 左側：Google Map */}
        <div className="relative flex-1">
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
            //onIdle={handleBoundsChanged}    // 每次拖移或縮放結束時，重新篩選範圍內的物件
            options={{
              gestureHandling: 'greedy',   // 滑鼠滾輪直接縮放
              streetViewControl: false,
              mapTypeControl: false
            }}
          >
            { /* 在地圖上放置 Marker */ }
            {filteredListings.map(item => (
              <Marker
                key={item.id}
                position={{ lat: item.lat, lng: item.lng }}
                onClick={() => navigate(`/detail/${item.id}`)}
              />
            ))}

            { /* InfoWindow 範例 (如果需要呈現選中後的彈窗) */ }
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
                    NT${filteredListings.find(i => i.id === selectedId).price} /月
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* 2B. 右側：房源列表 */}
        <div className="w-1/3 bg-gray-50 overflow-y-auto p-4 space-y-6">
          <h2 className="text-xl font-semibold">房源列表（共 {filteredListings.length} 筆）</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {filteredListings.map(item => (
              <Link
                key={item.id}
                to={`/detail/${item.id}`}
                className="bg-white rounded-lg shadow p-4 block hover:shadow-lg transition"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded"
                />
                <div className="mt-2 font-bold text-lg">{item.title}</div>
                <div className="text-sm text-gray-600">{item.address}</div>
                <div className="text-blue-600 font-semibold mt-1">
                  NT${item.price} 元／月
                </div>
              </Link>
            ))}
            {filteredListings.length === 0 && (
              <div className="text-gray-500 text-center py-6">此範圍內目前沒有房源</div>
            )}
          </div>
        </div>
      </div>

      {/* 全站共用的 Toast 容器 */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        closeOnClick
      />
    </div>
  );
}