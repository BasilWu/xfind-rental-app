import React, { useState } from 'react';
import { useAuth }         from '../contexts/AuthContext';
import { useNavigate }     from 'react-router-dom';

export default function Login() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();

  // local state
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');

  // 切換登入/註冊
  const toggleMode = () => {
    setError('');
    setIsSignup(prev => !prev);
  };

  // 處理表單提交
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      // 成功後導回首頁
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  // 如果已經登入，就直接導回首頁
  if (user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignup ? '註冊帳號' : '登入'}
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <label className="block mb-2">
          <span className="text-gray-700">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">密碼</span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSignup ? '註冊' : '登入'}
        </button>

        <p className="mt-4 text-center text-sm">
          {isSignup ? '已經有帳號？' : '還沒有帳號？'}
          <button
            type="button"
            onClick={toggleMode}
            className="ml-1 text-blue-600 hover:underline"
          >
            {isSignup ? '前往登入' : '前往註冊'}
          </button>
        </p>
      </form>
    </div>
  );
}