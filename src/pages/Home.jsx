// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import LandlordHome from './LandlordHome';
import TenantHome   from './TenantHome';

export default function Home() {
  // 拆出 loading，讀取完成前顯示載入中
  const { profile, loading } = useAuth();
  const [listings, setListings] = useState([]);

  // 真實資料監聽
  useEffect(() => {
    const unsub = onSnapshot(
      collection(firestore, 'listings'),
      snap => setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      err => console.error('Firestore Listen 錯誤:', err)
    );
    return () => unsub();
  }, []);

  // 讀取使用者資料中
  if (loading) {
    return <div className="p-4">載入使用者資料中…</div>;
  }

  // 若 profile 為 null，就當作租客
  const role = profile?.role ?? 'tenant';

  return role === 'landlord'
    ? <LandlordHome />
    : <TenantHome listings={listings} />;
}