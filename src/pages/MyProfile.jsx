import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function MyProfile() {
  const { user } = useAuth();

  if (!user) return <div>載入中...</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">會員中心</h2>
      <div className="space-y-3">
        <div><b>Email：</b>{user.email}</div>
        <div><b>身分：</b>{user.role === 'landlord' ? '房東' : '租客'}</div>
        {/* 這邊可加暱稱、電話等資料，未來串接後端 */}
      </div>
      {/* 房東專屬 */}
      {user.role === 'landlord' && (
        <div className="mt-10 border-t pt-6">
          <h3 className="font-bold mb-2">我的房源管理</h3>
          <p>（後續可在這裡增加房東上架、編輯、刪除房源功能）</p>
        </div>
      )}
    </div>
  );
}