// src/pages/LandlordHome.jsx
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth }   from '../contexts/AuthContext';

export default function LandlordHome() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [lat, setLat]     = useState('');
  const [lng, setLng]     = useState('');
  const [beds, setBeds]   = useState('');

  // 讀取自己發布的房源
  useEffect(() => {
    const fetchListings = async () => {
      const q = query(collection(firestore, 'listings'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchListings();
  }, [user]);

  // 新增房源
  const handleAdd = async e => {
    e.preventDefault();
    await addDoc(collection(firestore, 'listings'), {
      title,
      price: Number(price),
      lat: Number(lat),
      lng: Number(lng),
      beds: Number(beds),
      ownerId: user.uid
    });
    // 清空表單
    setTitle(''); setPrice(''); setLat(''); setLng(''); setBeds('');
    // 重新抓一次
    const q = query(collection(firestore, 'listings'), where('ownerId', '==', user.uid));
    const snapshot = await getDocs(q);
    setListings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">房東管理介面</h2>

      <form onSubmit={handleAdd} className="mb-6 p-4 bg-white border rounded">
        <div className="grid grid-cols-2 gap-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="標題" className="border p-2 rounded" required />
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="租金" className="border p-2 rounded" required />
          <input value={lat} onChange={e => setLat(e.target.value)} placeholder="緯度" className="border p-2 rounded" required />
          <input value={lng} onChange={e => setLng(e.target.value)} placeholder="經度" className="border p-2 rounded" required />
          <input value={beds} onChange={e => setBeds(e.target.value)} placeholder="房間數" className="border p-2 rounded" required />
        </div>
        <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded">新增房源</button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-2">我的房源</h3>
        {listings.map(item => (
          <div key={item.id} className="mb-3 p-3 bg-white border rounded">
            <p><strong>{item.title}</strong> — NT${item.price}/mo — {item.beds} 房</p>
          </div>
        ))}
      </div>
    </div>
  );
}