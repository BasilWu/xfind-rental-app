// src/pages/MyProfile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAuth, updateProfile } from "firebase/auth";
import { toast } from 'react-toastify';

export default function MyProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // 儲存個人資料
  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName) return toast.error('請輸入暱稱');
    try {
      await updateProfile(getAuth().currentUser, { displayName });
      toast.success('更新成功！');
      setEditing(false);
    } catch (err) {
      toast.error('更新失敗：' + err.message);
    }
  };

  if (!user) return <div>請先登入</div>;

  return (
    <div className="max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">會員中心</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-2 text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            className="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>
        <div>
          <label className="block mb-2 text-gray-700">暱稱</label>
          <input
            type="text"
            value={displayName}
            disabled={!editing}
            onChange={e => setDisplayName(e.target.value)}
            className={`w-full p-2 border rounded ${editing ? '' : 'bg-gray-100'}`}
          />
        </div>
        <div className="flex gap-3 mt-4">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded"
            >
              編輯
            </button>
          ) : (
            <>
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white py-2 px-4 rounded"
              >
                取消
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}