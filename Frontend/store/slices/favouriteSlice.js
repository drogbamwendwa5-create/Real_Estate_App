import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  favourites: [],
  loading: false,
};

const favouriteSlice = createSlice({
  name: 'favourite',
  initialState,
  reducers: {
    setFavourites: (state, action) => {
      state.favourites = action.payload;
      state.loading = false;
    },
    addFavourite: (state, action) => {
      state.favourites.unshift(action.payload);
    },
    removeFavourite: (state, action) => {
      state.favourites = state.favourites.filter((f) => f._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setFavourites, addFavourite, removeFavourite, setLoading } = favouriteSlice.actions;
export default favouriteSlice.reducer;