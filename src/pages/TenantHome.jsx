// src/pages/TenantHome.jsx
import React, { useRef, useCallback, useState } from 'react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';

export default function TenantHome({ listings }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  const mapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const onLoadMap = useCallback(map => { mapRef.current = map; }, []);

  if (!isLoaded) return <div>Loading map…</div>;

  return (
    <div className="flex h-screen">
      <div className="w-1/3 bg-gray-50 overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-4">租客瀏覽介面</h2>
        {listings.map(item => (
          <div
            key={item.id}
            onClick={() => { mapRef.current.panTo({ lat: item.lat, lng: item.lng }); setSelectedId(item.id); }}
            className="mb-4 p-4 bg-white border rounded hover:shadow cursor-pointer"
          >
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-gray-600">NT${item.price}/mo</p>
          </div>
        ))}
      </div>

      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={listings[0] ? { lat: listings[0].lat, lng: listings[0].lng } : { lat: 25.033, lng: 121.565 }}
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
                <h3 className="font-bold">{listings.find(i => i.id === selectedId).title}</h3>
                <p>NT${listings.find(i => i.id === selectedId).price}/mo</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}