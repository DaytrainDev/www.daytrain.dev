'use client';

import { Session } from 'next-auth';
import { SessionProvider, useSession } from 'next-auth/react';
import { useRef, useState } from 'react';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  role?: string;
  content?: string;
  error?: string;
}

interface ChatUIProps {
  handleSubmit: (messages: ChatMessage[], user: string) => Promise<ChatResponse>;
}

export function ChatUI({ handleSubmit }: ChatUIProps) {
  const session = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    const content = promptRef.current?.value?.trim();
    if (!content || loading) return;

    // Clear input immediately
    if (promptRef.current) {
      promptRef.current.value = '';
    }

    const userMessage: ChatMessage = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setLoading(true);
    setError('');

    try {
      const userId = session.data?.user?.email || 'anonymous';
      const response = await handleSubmit(updatedMessages, userId);

      if (response?.error) {
        setError(response.error);
      } else if (response?.content) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: response.content! },
        ]);
      }
    } catch {
      setError('Failed to get response. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError('');
  };

  if (session.status === 'loading') {
    return <div className="p-4">Loading...</div>;
  }

  if (session.status !== 'authenticated') {
    return (
      <div className="p-4">
        <div>You need to be logged in to chat.</div>
        <div className="mt-2">
          <a href="/" className="text-blue-400 hover:underline">
            ...back to home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 gap-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl border-slate-100 border-2 border-dashed p-2">
          Chatbot
        </h1>
        {messages.length > 0 && (
          <button
            onClick={handleClearChat}
            className="text-sm px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="w-full p-4 text-white bg-red-500 rounded"
        >
          {error}
        </div>
      )}

      <div className="w-full min-h-[300px] max-h-[500px] overflow-y-auto border-slate-600 border-2 rounded p-4 bg-slate-900">
        {messages.length === 0 ? (
          <div className="text-slate-500 text-center py-8">
            Start a conversation...
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded ${
                message.role === 'user'
                  ? 'bg-blue-900 ml-8'
                  : 'bg-slate-800 mr-8'
              }`}
            >
              <div className="text-xs text-slate-400 mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))
        )}
        {loading && (
          <div className="mb-4 p-3 rounded bg-slate-800 mr-8">
            <div className="text-xs text-slate-400 mb-1">Assistant</div>
            <div className="text-slate-400">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="w-full">
        <textarea
          ref={promptRef}
          className="w-full bg-slate-800 border-2 border-slate-600 rounded p-2 text-white resize-none"
          rows={3}
          placeholder="Type your message..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
      </div>

      <button
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded transition-colors"
        onClick={handleSendMessage}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
}

interface ChatSessionProps {
  session: Session | null;
  handleSubmit: (messages: ChatMessage[], user: string) => Promise<ChatResponse>;
}

export function ChatSession({ session, handleSubmit }: ChatSessionProps) {
  return (
    <SessionProvider session={session}>
      <ChatUI handleSubmit={handleSubmit} />
    </SessionProvider>
  );
}
