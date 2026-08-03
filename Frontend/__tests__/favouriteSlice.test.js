import favouriteReducer, { toggleFavourite } from '../store/slices/favouriteSlice';

describe('favouriteSlice', () => {
  it('adds and removes a property from favourites', () => {
    const added = favouriteReducer(
      { favourites: [], loading: false },
      toggleFavourite({ _id: 'property-1', title: 'Sample home' })
    );

    expect(added.favourites).toHaveLength(1);
    expect(added.favourites[0].title).toBe('Sample home');

    const removed = favouriteReducer(added, toggleFavourite({ _id: 'property-1', title: 'Sample home' }));
    expect(removed.favourites).toHaveLength(0);
  });
});
