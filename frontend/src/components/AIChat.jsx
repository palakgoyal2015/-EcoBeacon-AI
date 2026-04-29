import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';

const QUICK_QUESTIONS = [
  'What is my biggest emission source?',
  'How can I reduce car emissions?',
  'What is the Paris Agreement target?',
  'How do I improve my eco score?',
  'Tips for sustainable food choices',
  'How do badges work?',
];

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your EcoBeacon AI assistant 🌱 Ask me anything about reducing your carbon footprint or understanding your eco data." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: msg });
      setMessages(m => [...m, { role: 'assistant', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', text: 'Sorry, I could not connect right now. Try again shortly.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-eco-600 hover:bg-eco-500 text-white text-2xl shadow-lg shadow-eco-900/50 flex items-center justify-center transition-all duration-200 hover:scale-110"
        title="AI Eco Assistant"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-eco-900/60 border-b border-slate-700">
            <span className="text-xl">🌿</span>
            <div>
              <p className="text-white text-sm font-semibold">EcoBeacon AI</p>
              <p className="text-eco-400 text-xs">Sustainability assistant</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-eco-400">
              <span className="w-2 h-2 rounded-full bg-eco-400 animate-pulse" />
              Online
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-eco-700 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  {[0, 1, 2].map(d => (
                    <span key={d} className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                      style={{ animationDelay: `${d * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          <div className="px-4 py-2 border-t border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} type="button" onClick={() => sendMessage(q)}
                className="text-xs whitespace-nowrap px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full border border-slate-700 transition-colors flex-shrink-0">
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 px-4 py-3 border-t border-slate-800">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Ask about sustainability..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-eco-500 transition-colors"
            />
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="px-3 py-2 bg-eco-600 hover:bg-eco-500 disabled:opacity-50 text-white rounded-xl transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
