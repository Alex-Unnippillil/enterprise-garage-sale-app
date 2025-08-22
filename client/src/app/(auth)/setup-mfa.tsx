'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/config';

export default function SetupMfa() {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [verified, setVerified] = useState(false);

  const handleSetup = async () => {
    const res = await axios.post(`${API_URL}/auth/mfa/setup`, { userId });
    setSecret(res.data.secret);
  };

  const handleVerify = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/mfa/verify`, { userId, token });
      setVerified(true);
      if (res.data?.token || res.data?.jwt) {
        localStorage.setItem('jwt', res.data.token ?? res.data.jwt);
      }
      router.push('/dashboard');
    } catch {
      setVerified(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="User ID"
        className="border p-2"
      />
      <button onClick={handleSetup} className="bg-blue-500 text-white p-2">
        Generate Secret
      </button>
      {secret && <p className="break-all">Secret: {secret}</p>}
      {secret && (
        <>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter MFA Code"
            className="border p-2"
          />
          <button onClick={handleVerify} className="bg-green-500 text-white p-2">
            Verify
          </button>
        </>
      )}
      {verified && <p>MFA Enabled</p>}
    </div>
  );
}
