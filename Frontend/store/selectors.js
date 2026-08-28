import { createSelector } from 'reselect';
import { LEGAL } from '../Constants';

const getFavourites = (state) => state.favourite?.favourites || [];

export const createFavouriteIdsSelector = () =>
  createSelector([getFavourites], (items) => {
    return items.map((item) => item?._id || item?.id || item?.property?._id || item?.property?.id);
  });

export const selectLegalConsent = (state) => state.auth?.legalConsent || { acceptedAt: null, version: null };

export const selectHasAcceptedLegal = createSelector([selectLegalConsent], (consent) => {
  return !!consent?.acceptedAt && consent?.version === LEGAL.version;
});
