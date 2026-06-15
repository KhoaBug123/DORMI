import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  role?: 'landlord' | 'tenant' | 'roommate';
}

interface ChatState {
  contacts: Contact[];
  messages: Record<string, ChatMessage[]>; // Map contactId -> messages
  activeContactId: string | null;
  setActiveContactId: (id: string | null) => void;
  addContact: (contact: Contact) => void;
  sendMessage: (contactId: string, content: string, senderId: string, senderName: string) => void;
  receiveMessage: (contactId: string, content: string, senderId: string, senderName: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  contacts: [
    { id: 'l-1', name: 'Chủ Trọ Nguyễn Văn Hùng', role: 'landlord', lastMessage: 'Chào em, phòng trọ bên Tạ Quang Bửu vẫn còn em nhé.' },
    { id: 'cand-1', name: 'Đặng Tuấn Anh', role: 'roommate', lastMessage: 'Chào cậu, cậu học CNTT à? Bọn mình ghép phòng đi.' },
    { id: 'cand-2', name: 'Nguyễn Tiến Đạt', role: 'roommate', lastMessage: 'Cậu làm khảo sát chưa?' }
  ],
  messages: {
    'l-1': [
      { id: 'm-1', senderId: 'l-1', senderName: 'Chủ Trọ Nguyễn Văn Hùng', content: 'Chào em, phòng trọ bên Tạ Quang Bửu vẫn còn em nhé.', timestamp: '14:20' }
    ],
    'cand-1': [
      { id: 'm-2', senderId: 'cand-1', senderName: 'Đặng Tuấn Anh', content: 'Chào cậu, cậu học CNTT à? Bọn mình ghép phòng đi.', timestamp: '15:10' }
    ],
    'cand-2': [
      { id: 'm-3', senderId: 'cand-2', senderName: 'Nguyễn Tiến Đạt', content: 'Cậu làm khảo sát chưa?', timestamp: '16:02' }
    ]
  },
  activeContactId: 'l-1',
  setActiveContactId: (id) => set({ activeContactId: id }),
  addContact: (contact) => set((state) => {
    if (state.contacts.some(c => c.id === contact.id)) return state;
    return { contacts: [contact, ...state.contacts] };
  }),
  sendMessage: (contactId, content, senderId, senderName) => set((state) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessages = state.messages[contactId] || [];
    
    // Cập nhật tin nhắn cuối cùng trong danh bạ
    const updatedContacts = state.contacts.map(c => 
      c.id === contactId ? { ...c, lastMessage: content } : c
    );

    return {
      messages: {
        ...state.messages,
        [contactId]: [...currentMessages, newMessage]
      },
      contacts: updatedContacts
    };
  }),
  receiveMessage: (contactId, content, senderId, senderName) => set((state) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const currentMessages = state.messages[contactId] || [];
    const updatedContacts = state.contacts.map(c => 
      c.id === contactId ? { ...c, lastMessage: content } : c
    );

    return {
      messages: {
        ...state.messages,
        [contactId]: [...currentMessages, newMessage]
      },
      contacts: updatedContacts
    };
  })
}));
