import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  conversations: [],
  messages: [],
  activeConversation: null,
  loading: false,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setConversations: (state, action) => {
      state.conversations = action.payload;
      state.loading = false;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setConversations, setMessages, addMessage, setActiveConversation, setLoading } = messageSlice.actions;
export default messageSlice.reducer;