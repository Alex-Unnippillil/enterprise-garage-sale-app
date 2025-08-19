'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import MessageList from './message-list';
import MessageInput from './message-input';

interface Message {
  id: number;
  senderCognitoId: string;
  content: string;
  createdAt: string;
}

interface ChatWindowProps {
  conversationId: number;
  token: string;
}

export default function ChatWindow({ conversationId, token }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io('', {
      auth: { token },
    });
    s.emit('joinConversation', conversationId);
    s.on('newMessage', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [conversationId, token]);

  const handleSend = (content: string) => {
    socket?.emit('sendMessage', { conversationId, content });
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <MessageInput onSend={handleSend} />
    </div>
  );
}
