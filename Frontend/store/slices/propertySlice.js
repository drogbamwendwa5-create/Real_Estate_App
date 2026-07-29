import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  properties: [],
  featuredProperties: [],
  currentProperty: null,
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
};

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setProperties: (state, action) => {
      state.properties = action.payload.properties;
      state.totalPages = action.payload.totalPages;
      state.currentPage = action.payload.currentPage;
      state.loading = false;
    },
    setFeaturedProperties: (state, action) => {
      state.featuredProperties = action.payload;
    },
    setCurrentProperty: (state, action) => {
      state.currentProperty = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
  },
});

export const { setProperties, setFeaturedProperties, setCurrentProperty, setLoading, setError, clearCurrentProperty } = propertySlice.actions;
export default propertySlice.reducer;
