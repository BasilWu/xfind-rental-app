// src/pages/RentalDetail.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import listings from "../data/listings";

export default function RentalDetail() {
  const { id } = useParams();
  const item = listings.find(l => l.id === id);

  if (!item) return <div className="p-8">找不到該房源</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Link to="/" className="text-blue-600 underline mb-4 inline-block">← 回列表</Link>
      <img src={item.image} alt={item.title} className="w-full h-64 object-cover rounded-lg mb-4" />
      <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
      <div className="text-gray-600 mb-2">{item.address}</div>
      <div className="text-lg text-blue-700 mb-2">{item.price} 元／月</div>
      <div className="text-sm mb-4">{item.desc || '物件描述待補'}</div>
      <div className="text-xs text-gray-400">ID: {item.id}</div>
    </div>
  );
}