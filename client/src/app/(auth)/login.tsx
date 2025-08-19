'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [mfa, setMfa] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/login', { userId, password, token });
      alert('Logged in');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setMfa(true);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
        className="border p-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2"
      />
      {mfa && (
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="MFA Code"
          className="border p-2"
        />
      )}
      <button type="submit" className="bg-blue-500 text-white p-2">
        Login
      </button>
    </form>
  );
}
