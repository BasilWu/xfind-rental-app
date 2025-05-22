// src/pages/MyProfile.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getAuth, updateProfile } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyProfile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 儲存個人資料
  const handleSave = async () => {
    if (!displayName) {
      toast.error("姓名不能為空！");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(getAuth().currentUser, {
        displayName,
        photoURL,
      });
      toast.success("資料已更新！");
      setIsEditing(false);
    } catch (error) {
      toast.error("更新失敗：" + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">會員中心</h2>
      <div className="flex items-center mb-6">
        <img
          src={photoURL || "https://ui-avatars.com/api/?name=" + encodeURIComponent(displayName)}
          alt="頭貼"
          className="w-20 h-20 rounded-full object-cover border mr-6"
        />
        <div>
          <div className="text-lg font-semibold">{displayName}</div>
          <div className="text-sm text-gray-500">{user?.email}</div>
          <span className="inline-block mt-2 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded">
            {user?.role === "landlord" ? "房東" : "租客"}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 text-gray-600">姓名</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={displayName}
            disabled={!isEditing}
            onChange={e => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-600">頭貼圖片 URL</label>
          <input
            className="border rounded px-3 py-2 w-full"
            value={photoURL}
            disabled={!isEditing}
            onChange={e => setPhotoURL(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-600">信箱</label>
          <input
            className="border rounded px-3 py-2 w-full bg-gray-100"
            value={user?.email}
            disabled
          />
        </div>
        <div>
          <label className="block mb-1 text-gray-600">角色</label>
          <input
            className="border rounded px-3 py-2 w-full bg-gray-100"
            value={user?.role === "landlord" ? "房東" : "租客"}
            disabled
          />
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        {!isEditing ? (
          <button
            className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setIsEditing(true)}
          >
            編輯
          </button>
        ) : (
          <>
            <button
              className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={handleSave}
              disabled={saving}
            >
              儲存
            </button>
            <button
              className="px-5 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={() => setIsEditing(false)}
              disabled={saving}
            >
              取消
            </button>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}