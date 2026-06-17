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
  setContacts: (contacts: Contact[]) => void;
  setMessages: (contactId: string, messages: ChatMessage[]) => void;
  sendMessage: (contactId: string, content: string, senderId: string, senderName: string) => void;
  receiveMessage: (contactId: string, content: string, senderId: string, senderName: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  contacts: [],
  messages: {},
  activeContactId: null,
  setActiveContactId: (id) => set({ activeContactId: id }),
  addContact: (contact) => set((state) => {
    if (state.contacts.some(c => c.id === contact.id)) return state;
    return { contacts: [contact, ...state.contacts] };
  }),
  setContacts: (contacts) => set({ contacts }),
  setMessages: (contactId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [contactId]: messages
    }
  })),
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
