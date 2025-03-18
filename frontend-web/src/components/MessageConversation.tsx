import { useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useRouter } from 'next/navigation';
import MessageValidationError from './MessageValidationError';

interface MessageConversationProps {
  currentUserId: string;
  otherUserId: string;
  applicationId?: string;
}

export default function MessageConversation({ currentUserId, otherUserId, applicationId }: MessageConversationProps) {
  const [newMessage, setNewMessage] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { messages, sendMessage, loading } = useMessages(currentUserId, otherUserId);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendMessage(newMessage, otherUserId, applicationId);
      setNewMessage('');
    } catch (error) {
      if (error instanceof Error) {
        setValidationError(error.message);
      }
    }
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-[#3bee5e] text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 p-4 border-t border-gray-200">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Écrivez votre message..."
          className="flex-1 border rounded-lg px-4 py-2 text-black"
        />
        <button
          onClick={handleSend}
          className="bg-[#3bee5e] text-white px-4 py-2 rounded-lg hover:bg-[#32d951]"
        >
          Envoyer
        </button>
      </div>

      <MessageValidationError 
        error={validationError} 
        onClose={() => setValidationError(null)} 
      />
    </div>
  );
} 