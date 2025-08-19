'use client';

import { useState, FormEvent } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export default function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onSend(value);
    setValue('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex p-2 border-t">
      <input
        className="flex-1 border rounded px-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="ml-2 px-4 py-1 bg-blue-500 text-white rounded">
        Send
      </button>
    </form>
  );
}
