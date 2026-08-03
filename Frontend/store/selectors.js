import { createSelector } from 'reselect';

const getFavourites = (state) => state.favourite?.favourites || [];

export const createFavouriteIdsSelector = () =>
  createSelector([getFavourites], (items) => {
    return items.map((item) => item?._id || item?.id || item?.property?._id || item?.property?.id);
  });
