import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import uiReducer from './slices/uiSlice';
import favouriteReducer from './slices/favouriteSlice';
import messageReducer from './slices/messageSlice';
import aggregationReducer from './slices/aggregationSlice';
import mapReducer from './slices/mapSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'ui'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  property: propertyReducer,
  ui: uiReducer,
  favourite: favouriteReducer,
  message: messageReducer,
  aggregation: aggregationReducer,
  map: mapReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
