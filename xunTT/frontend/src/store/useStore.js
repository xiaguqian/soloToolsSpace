import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(persist(
  (set, get) => ({
    user: null,
    token: null,
    friends: [],
    friendGroups: [],
    groups: [],
    conversations: [],
    currentConversation: null,
    messages: {},
    searchKeyword: '',
    unreadCount: 0,
    wsConnected: false,

    setUser: (user) => set({ user }),
    setToken: (token) => set({ token }),
    setWsConnected: (connected) => set({ wsConnected: connected }),
    
    login: (data) => set({
      user: data.user,
      token: data.token
    }),

    logout: () => set({
      user: null,
      token: null,
      friends: [],
      friendGroups: [],
      groups: [],
      conversations: [],
      currentConversation: null,
      messages: {},
      searchKeyword: '',
      unreadCount: 0,
      wsConnected: false
    }),

    setFriends: (friends) => set({ friends }),
    setFriendGroups: (groups) => set({ friendGroups: groups }),
    setGroups: (groups) => set({ groups }),
    setConversations: (conversations) => set({ conversations }),
    
    setCurrentConversation: (conv) => set({ 
      currentConversation: conv 
    }),

    addMessage: (message) => set((state) => {
      const convId = message.conversationId;
      const existingMessages = state.messages[convId] || [];
      return {
        messages: {
          ...state.messages,
          [convId]: [...existingMessages, message]
        }
      };
    }),

    setMessages: (convId, messages) => set((state) => ({
      messages: {
        ...state.messages,
        [convId]: messages
      }
    })),

    updateMessageStatus: (messageId, status) => set((state) => {
      const newMessages = { ...state.messages };
      Object.keys(newMessages).forEach(convId => {
        newMessages[convId] = newMessages[convId].map(msg =>
          msg.id === messageId ? { ...msg, status } : msg
        );
      });
      return { messages: newMessages };
    }),

    setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

    addConversation: (conv) => set((state) => {
      const exists = state.conversations.find(c => c.conversationId === conv.conversationId);
      if (exists) {
        return {
          conversations: state.conversations.map(c =>
            c.conversationId === conv.conversationId ? { ...c, ...conv } : c
          )
        };
      }
      return { conversations: [conv, ...state.conversations] };
    }),

    updateConversation: (convId, updates) => set((state) => ({
      conversations: state.conversations.map(c =>
        c.conversationId === convId ? { ...c, ...updates } : c
      )
    })),

    incrementUnread: (convId) => set((state) => {
      const conv = state.conversations.find(c => c.conversationId === convId);
      if (conv) {
        return {
          unreadCount: state.unreadCount + 1,
          conversations: state.conversations.map(c =>
            c.conversationId === convId 
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        };
      }
      return { unreadCount: state.unreadCount + 1 };
    }),

    markConversationRead: (convId) => set((state) => {
      const conv = state.conversations.find(c => c.conversationId === convId);
      const unreadDelta = conv?.unreadCount || 0;
      return {
        unreadCount: Math.max(0, state.unreadCount - unreadDelta),
        conversations: state.conversations.map(c =>
          c.conversationId === convId ? { ...c, unreadCount: 0 } : c
        )
      };
    }),

    updateFriend: (friendId, updates) => set((state) => ({
      friends: state.friends.map(f =>
        f.friendId === friendId ? { ...f, ...updates } : f
      )
    }))
  }),
  {
    name: 'solo-im-storage',
    partialize: (state) => ({
      user: state.user,
      token: state.token
    })
  }
));

export default useStore;
