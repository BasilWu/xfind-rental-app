// src/pages/MyProfile.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function MyProfile() {
  const { user } = useAuth();

  if (!user) return <div>載入中…</div>;

  return (
    <div className="max-w-lg mx-auto p-6 mt-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">會員中心</h2>
      <div className="space-y-4">
        <div>
          <span className="font-semibold">信箱：</span>
          <span>{user.email}</span>
        </div>
        <div>
          <span className="font-semibold">角色：</span>
          <span>{user.role || '租客／房東'}</span>
        </div>
        {/* 這裡可以放頭像、姓名等 */}
      </div>
      <button className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        編輯
      </button>
    </div>
  );
}