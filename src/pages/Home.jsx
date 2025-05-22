// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { firestore } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import LandlordHome from './LandlordHome';
import TenantHome   from './TenantHome';

export default function Home({ searchCenter }) {
  const { profile, loading } = useAuth();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(firestore, 'listings'),
      snap => setListings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      err => console.error('Firestore Listen 錯誤:', err)
    );
    return () => unsub();
  }, []);

  if (loading) {
    return <div className="p-4">載入使用者資料中…</div>;
  }

  const role = profile?.role ?? 'tenant';
  return role === 'landlord'
    ? <LandlordHome />
    : <TenantHome listings={listings} searchCenter={searchCenter} />;
}