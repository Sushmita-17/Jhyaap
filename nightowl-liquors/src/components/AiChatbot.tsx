import { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, Send, X, Sparkles } from 'lucide-react';
import { useCatalogStore } from '@/store/catalogStore';
import { useOrdersStore } from '@/store/ordersStore';
import { useAuthStore } from '@/store/authStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { useAppStore } from '@/store/appStore';
import { ChatMessage, getChatbotReply, QUICK_PROMPTS } from '@/lib/chatbotBrain';
import { STORE_INFO } from '@/lib/storeInfo';

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hey! I'm Jhyaap Station AI 🦉 — ask about our store location, Google Maps, live tracking, delivery, loyalty points, or Instagram.",
  createdAt: new Date().toISOString(),
};

export default function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const products = useCatalogStore((s) => s.products);
  const orders = useOrdersStore((s) => s.orders);
  const user = useAuthStore((s) => s.user);
  const getPoints = useLoyaltyStore((s) => s.getPoints);
  const { setPage } = useAppStore();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const reply = await getChatbotReply(trimmed, {
      products,
      orders,
      userId: user?.id,
      userName: user?.name,
      loyaltyPoints: user ? getPoints(user.id) : 0,
    });

    const botMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      role: 'assistant',
      content: reply,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, botMsg]);
    setTyping(false);

    if (trimmed.toLowerCase().includes('track') && orders.length > 0) {
      const latest = orders[orders.length - 1];
      useOrdersStore.getState().selectOrder(latest.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[100] flex flex-col items-end gap-2">
      {open && (
        <div className="flex h-[min(520px,calc(100vh-8rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-night-700 bg-night-900/98 shadow-2xl backdrop-blur-xl">
          <header className="flex items-center justify-between border-b border-white/10 bg-night-900 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-primary/15 text-gold-primary">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-night-200">Jhyaap Station AI</p>
                <p className="flex items-center gap-1 text-[10px] text-green-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Online · orders &amp; tracking
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-night-400 hover:bg-white/5 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 bg-[#1C1410]/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gold-primary text-black font-medium'
                      : 'border border-white/5 bg-night-800 text-night-200 shadow-sm'
                  }`}
                >
                  {msg.content.replace(/\*\*(.*?)\*\*/g, '$1')}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl border border-white/5 bg-night-800 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-night-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3 bg-night-900">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    if (prompt === 'Track my order' && orders.length > 0) {
                      setPage('order-tracking');
                    }
                    sendMessage(prompt);
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-night-400 hover:border-gold-primary/40 hover:text-gold-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="input-field flex-1 py-1.5 text-sm bg-night-800 border-white/10"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="btn-primary flex h-9 w-9 items-center justify-center p-0 disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <a
              href={STORE_INFO.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-night-500 hover:text-green-500"
            >
              <MessageCircle className="h-3 w-3" />
              Or chat on WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-full border border-gold-primary/30 bg-[#1C1410] py-2.5 pl-3 pr-4 text-night-200 shadow-xl backdrop-blur-xl transition-all hover:border-gold-primary/60 active:scale-95"
        aria-label="Open AI chat"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-primary/10 text-gold-primary group-hover:bg-gold-primary group-hover:text-black transition-all">
          {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </span>
        <span className="text-sm font-bold uppercase tracking-wider">{open ? 'Close' : 'AI Chat'}</span>
      </button>
    </div>
  );
}
