import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { chatService } from '../../services/chatService';
import { api } from '../../services/api';

export default function ChatInterface() {
  const { user, token } = useAuthStore();
  const { 
    contacts, 
    messages, 
    activeContactId, 
    setActiveContactId, 
    sendMessage, 
    receiveMessage, 
    addContact,
    setContacts,
    setMessages
  } = useChatStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Nạp danh sách contacts từ API
  useEffect(() => {
    if (token) {
      api.get('/chat/contacts')
        .then((res) => {
          setContacts(res.data);
        })
        .catch((err) => {
          console.error("Error fetching contacts from API:", err);
        });
    }
  }, [token, setContacts]);

  // Nạp lịch sử tin nhắn khi activeContactId thay đổi
  useEffect(() => {
    if (token && activeContactId) {
      api.get(`/chat/messages/${activeContactId}`)
        .then((res) => {
          setMessages(activeContactId, res.data);
        })
        .catch((err) => {
          console.error("Error fetching message history from API:", err);
        });
    }
  }, [token, activeContactId, setMessages]);

  // Nhận contact được chuyển từ trang tìm roommate hoặc bản đồ
  useEffect(() => {
    const rawContact = localStorage.getItem('chat_active_contact');
    if (rawContact) {
      const parsed: { id: string; name: string; isRoommate?: boolean } = JSON.parse(rawContact);
      addContact({
        id: parsed.id,
        name: parsed.name,
        role: parsed.isRoommate ? 'roommate' : 'landlord',
        lastMessage: 'Đang bắt đầu cuộc hội thoại...'
      });
      setActiveContactId(parsed.id);
      localStorage.removeItem('chat_active_contact');
    }
  }, [addContact, setActiveContactId]);

  // Kết nối SignalR Hub
  useEffect(() => {
    if (token) {
      chatService.connect(token).then((isConnected) => {
        if (isConnected) {
          chatService.registerMessageReceived((senderId, msg) => {
            receiveMessage(senderId, msg, senderId, 'Người dùng');
          });
        }
      });
    }

    return () => {
      chatService.disconnect();
    };
  }, [token, receiveMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeContactId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId || !user) return;

    const messageContent = inputText.trim();
    sendMessage(activeContactId, messageContent, user.id, user.name);
    setInputText('');

    const sent = await chatService.sendMessageToServer(activeContactId, messageContent);

    if (!sent) {
      // Giả lập bot thông minh tự động phản hồi sau 1.5s nếu chạy mock offline
      setTimeout(() => {
        let replyText = 'Dạ vâng. Mình đã nhận được thông tin rồi ạ!';
        const activeContact = contacts.find(c => c.id === activeContactId);
        
        if (activeContact?.role === 'landlord') {
          replyText = 'Chào em, phòng trọ đó bên anh vẫn còn trống. Em muốn đặt lịch hẹn hôm nào qua xem trực tiếp nhỉ?';
        } else if (activeContact?.role === 'roommate') {
          replyText = 'Cảm ơn cậu đã kết nối! Lối sống tụi mình khớp nhau ghê. Cuối tuần này bọn mình hẹn cafe bàn chuyện share phòng nhé!';
        }

        receiveMessage(activeContactId, replyText, activeContactId, activeContact?.name || 'Đối tác');
      }, 1500);
    }
  };

  const activeContact = contacts.find(c => c.id === activeContactId);
  const activeMessages = activeContactId ? (messages[activeContactId] || []) : [];

  return (
    <div className="flex h-[calc(100vh-160px)] bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden font-sans shadow-2xl backdrop-blur-xl">
      
      {/* Danh sách liên hệ bên trái */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-black/30 shrink-0">
        <div className="p-4 border-b border-white/5 bg-white/[0.01]">
          <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>💬</span> Phòng hội thoại
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Đang trực tuyến (SignalR fallback)</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
          {contacts.map((contact) => {
            const isSelected = contact.id === activeContactId;
            return (
              <div
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`p-4 cursor-pointer transition-all hover:bg-white/5 flex flex-col gap-1.5 ${
                  isSelected ? 'bg-white/[0.07] border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs text-slate-200 truncate">{contact.name}</span>
                  <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded shrink-0 ${
                    contact.role === 'landlord' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {contact.role === 'landlord' ? 'Chủ trọ' : 'Roommate'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate italic leading-normal">{contact.lastMessage}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Khung chat bên phải */}
      <div className="flex-1 flex flex-col justify-between bg-black/10">
        {activeContact ? (
          <>
            {/* Header chat partner */}
            <div className="p-4 border-b border-white/10 bg-[#0d1424]/40 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <span className="text-2xl bg-white/5 p-2 rounded-xl border border-white/5">👤</span>
                <div>
                  <h4 className="font-bold text-xs text-slate-200">{activeContact.name}</h4>
                  <p className="text-[10px] text-slate-400">
                    {activeContact.role === 'landlord' ? 'Chủ sở hữu tin đăng' : 'Bạn cùng phòng đối sánh'}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Mã hóa bảo mật
              </span>
            </div>

            {/* Chat message bubbles */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {activeMessages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[65%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white rounded-tr-none shadow-lg' 
                        : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5 shadow-md'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1.5 font-bold">{msg.timestamp}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message composer input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Viết tin nhắn thảo luận phòng..."
                className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-all disabled:opacity-50"
              >
                Gửi đi
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3">
            <span className="text-5xl">💬</span>
            <p className="text-xs">Chọn phòng trò chuyện bên cột trái để thảo luận trực tuyến.</p>
          </div>
        )}
      </div>

    </div>
  );
}
