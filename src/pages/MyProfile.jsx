import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function MyProfile() {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ displayName });
      alert("儲存成功！");
    } catch (err) {
      alert("更新失敗：" + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">會員中心</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-1">信箱</label>
          <input className="w-full border p-2" value={user?.email || ""} disabled />
        </div>
        <div>
          <label className="block mb-1">顯示名稱</label>
          <input
            className="w-full border p-2"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded"
          disabled={saving}
        >
          {saving ? "儲存中..." : "儲存"}
        </button>
      </form>
    </div>
  );
}