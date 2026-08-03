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
    toggleFavourite: (state, action) => {
      const property = action.payload;
      const exists = state.favourites.some((item) => {
        const id = item?._id || item?.id || item?.property?._id || item?.property?.id;
        return id === property?._id || id === property?.id;
      });

      if (exists) {
        state.favourites = state.favourites.filter((item) => {
          const id = item?._id || item?.id || item?.property?._id || item?.property?.id;
          return id !== (property?._id || property?.id);
        });
      } else {
        state.favourites.push(property);
      }
    },
    addFavourite: (state, action) => {
      const property = action.payload;
      const alreadyExists = state.favourites.some((item) => {
        const id = item?._id || item?.id || item?.property?._id || item?.property?.id;
        return id === property?._id || id === property?.id;
      });
      if (!alreadyExists) state.favourites.unshift(property);
    },
    removeFavourite: (state, action) => {
      const propertyId = action.payload;
      state.favourites = state.favourites.filter((item) => {
        const id = item?._id || item?.id || item?.property?._id || item?.property?.id;
        return id !== propertyId;
      });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setFavourites, toggleFavourite, addFavourite, removeFavourite, setLoading } = favouriteSlice.actions;
export default favouriteSlice.reducer;
