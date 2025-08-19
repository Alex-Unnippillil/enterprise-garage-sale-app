interface Message {
  id: number;
  senderCognitoId: string;
  content: string;
  createdAt: string;
}

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {messages.map((m) => (
        <div key={m.id} className="mb-2">
          <div className="text-xs text-gray-500">{m.senderCognitoId}</div>
          <div>{m.content}</div>
        </div>
      ))}
    </div>
  );
}
