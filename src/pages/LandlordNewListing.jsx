import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";  // 取得目前登入的使用者（房東）

export default function LandlordNewListing() {
  // 表單欄位的 state
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [roomType, setRoomType] = useState("");      // 房型選擇
  const [images, setImages] = useState([]);          // 上傳的圖片（File 物件陣列）
  const [error, setError] = useState("");            // 錯誤訊息狀態

  const navigate = useNavigate();
  const { user } = useAuth();  // 當前登入的使用者（假定為房東身分）

  // 處理圖片檔案選擇變更
  const handleFileChange = (e) => {
    const files = e.target.files;
    // 將 FileList 轉換為陣列儲存到 state（便於日後處理多張圖片）
    setImages(files ? Array.from(files) : []);
  };

  // 表單提交處理函式
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 簡單欄位驗證：檢查所有必填欄位是否都有填寫，且至少選擇一張圖片
    if (!title.trim() || !address.trim() || !price || !roomType || images.length === 0) {
      setError("請填寫完整資料");
      return;
    }
    setError("");  // 清除先前的錯誤訊息

    try {
      // 上傳所有選擇的圖片檔案到 Firebase Storage，並取得每張圖片的下載 URL
      const imageUrls = [];
      for (const file of images) {
        const storageRef = ref(storage, `listings/${user.uid}_${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        imageUrls.push(downloadURL);
      }

      // 將房源資料（含圖片URL列表等）新增到 Firestore "listings" 集合
      await addDoc(collection(firestore, "listings"), {
        title: title.trim(),
        address: address.trim(),
        price: Number(price),      // 價格轉為數值型別存儲
        roomType: roomType,        // 房型
        images: imageUrls,         // 上傳後的圖片 URL 陣列
        status: "已上架",           // 房源狀態（預設為「已上架」）
        createdAt: serverTimestamp(),  // 建立時間戳（Firestore 服務端時間）
        landlordId: user.uid           // 房東（擁有者）的用户ID，關聯此房源發布者
      });

      // 資料新增成功，導覽回房東後台首頁
      navigate("/landlord");
    } catch (err) {
      console.error("Error adding listing: ", err);
      // 如有錯誤，設定錯誤訊息狀態，提示使用者儲存失敗
      setError("儲存失敗，請稍後重試");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow mt-10">
      <h2 className="text-2xl font-bold mb-6">新增房源</h2>
      {/* 房源資料表單 */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 若有錯誤訊息，顯示在表單頂部 */}
        {error && <div className="text-red-600 mb-2">{error}</div>}

        {/* 標題欄位 */}
        <div>
          <label className="block mb-1 font-medium">標題</label>
          <input 
            type="text"
            className="w-full border border-gray-300 p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="輸入房源標題"
          />
        </div>

        {/* 地址欄位 */}
        <div>
          <label className="block mb-1 font-medium">地址</label>
          <input 
            type="text"
            className="w-full border border-gray-300 p-2 rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="輸入房源地址"
          />
        </div>

        {/* 價格欄位 */}
        <div>
          <label className="block mb-1 font-medium">價格</label>
          <input 
            type="number"
            className="w-full border border-gray-300 p-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="輸入出租價格"
          />
        </div>

        {/* 房型欄位 */}
        <div>
          <label className="block mb-1 font-medium">房型</label>
          <select 
            className="w-full border border-gray-300 p-2 rounded bg-white"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
            <option value="">請選擇房型</option>
            <option value="整層住家">整層住家</option>
            <option value="獨立套房">獨立套房</option>
            <option value="分租套房">分租套房</option>
            <option value="雅房">雅房</option>
          </select>
        </div>

        {/* 上傳圖片欄位 */}
        <div>
          <label className="block mb-1 font-medium">上傳圖片</label>
          <input 
            type="file"
            multiple 
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
          {/* 若有選擇圖片，顯示預覽縮圖 */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {images.map((file) => (
                <img 
                  key={file.name}
                  src={URL.createObjectURL(file)} 
                  alt="選擇的圖片預覽"
                  className="h-20 w-20 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>

        {/* 表單提交按鈕 */}
        <div className="text-right mt-6">
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            儲存
          </button>
        </div>
      </form>
    </div>
  );
}