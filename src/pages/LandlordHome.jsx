import React, { useState } from "react";
// 假資料（之後串接 firestore 再換）
const sampleListings = [
  {
    id: "1",
    title: "豪宅套房",
    address: "台中市西屯區 XX 路",
    price: 25000,
    status: "已上架",
    createdAt: "2024-07-10",
    image: "https://source.unsplash.com/featured/?apartment",
  },
  // ...更多假資料
];

export default function LandlordHome() {
  const [listings, setListings] = useState(sampleListings);

  // 刪除房源
  const handleDelete = (id) => {
    if (window.confirm("確定要刪除這筆房源嗎？")) {
      setListings((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">房東後台 - 房源管理</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + 新增房源
        </button>
      </div>
      <table className="w-full border rounded shadow text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">圖片</th>
            <th className="p-2">標題</th>
            <th className="p-2">地址</th>
            <th className="p-2">價格</th>
            <th className="p-2">狀態</th>
            <th className="p-2">建立日期</th>
            <th className="p-2">操作</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="p-2"><img src={item.image} alt="" className="w-20 h-12 object-cover rounded" /></td>
              <td className="p-2">{item.title}</td>
              <td className="p-2">{item.address}</td>
              <td className="p-2 text-blue-600">{item.price} 元/月</td>
              <td className="p-2">{item.status}</td>
              <td className="p-2">{item.createdAt}</td>
              <td className="p-2 space-x-2">
                <button className="text-sm px-2 py-1 bg-yellow-500 text-white rounded">編輯</button>
                <button
                  className="text-sm px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => handleDelete(item.id)}
                >
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}