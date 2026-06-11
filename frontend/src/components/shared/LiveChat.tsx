'use client';
import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

const BOT_REPLIES: Record<string, string> = {
  order: "You can track your packages live using the 'Visual Order Tracking' route under Customer Orders page.",
  refund: "Refunds on UPI payments are processed within 2-4 working hours directly to your source wallet.",
  cancel: "Refunds on UPI payments are processed within 2-4 working hours directly to your source wallet.",
  gst: "Sellers must possess standard 15-digit state GST credentials to initiate catalog dispatch.",
};

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Welcome to BUYZONE Marketplace Support. How can we help you today?' }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    const clean = input.toLowerCase();
    setInput('');

    setTimeout(() => {
      let botText = "I have queued your support ticket. An executive will join momentarily.";
      for (const [key, reply] of Object.entries(BOT_REPLIES)) {
        if (clean.includes(key)) { botText = reply; break; }
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botText }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-[#2874F0] hover:bg-blue-500 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <MessageSquare size={18} />
          <span className="text-xs font-black uppercase">Live Chat Support</span>
        </button>
      ) : (
        <div className="bg-white dark:bg-slate-800 w-80 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden text-xs">
          {/* Header */}
          <div className="bg-[#2874F0] text-white p-3.5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-extrabold uppercase">BUYZONE Live Agent</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 h-60 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-900 flex flex-col">
            {messages.map((msg, i) => (
              <div key={i}
                className={`p-2.5 rounded max-w-[80%] leading-relaxed ${msg.sender === 'bot'
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 self-start border dark:border-slate-700'
                  : 'bg-[#2874F0] text-white self-end'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-1.5">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type query (e.g. order tracking)..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 p-2 border dark:border-slate-700 rounded focus:outline-none text-xs"
            />
            <button onClick={sendMessage}
              className="bg-[#2874F0] text-white px-3 rounded hover:bg-blue-500 transition-colors">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
