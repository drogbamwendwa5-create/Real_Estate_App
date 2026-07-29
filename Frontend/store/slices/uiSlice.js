import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDarkMode: false,
  notifications: [],
  unreadCount: 0,
  sidebarOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    decrementUnread: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    resetUnread: (state) => {
      state.unreadCount = 0;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleDarkMode, setDarkMode, setNotifications, setUnreadCount, incrementUnread, decrementUnread, resetUnread, toggleSidebar } = uiSlice.actions;
export default uiSlice.reducer;
