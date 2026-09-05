'use client';
import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';

export default function CoachPage() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userMessage,
          history: messages // Gửi lịch sử để AI nhớ ngữ cảnh
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', content: data.data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: 'Error: ' + (data.error || 'Unknown error') }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Network Error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto p-8 space-y-6">
        <div className="border-b pb-4">
          <h1 className="text-3xl font-extrabold text-blue-700">{t.coach.title}</h1>
          <p className="text-gray-600">{t.coach.subtitle}</p>
        </div>

        <div className="h-[500px] bg-white border rounded-xl shadow-sm p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              Ask a question to start the conversation.
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="font-bold text-xs mb-1">{msg.role === 'user' ? t.coach.you : t.coach.ai}</div>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-center text-gray-400">AI is thinking...</div>}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.coach.placeholder}
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            {t.coach.send}
          </button>
        </div>
      </main>
    </div>
  );
}