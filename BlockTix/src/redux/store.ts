import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './slices/themeSlice';
import ticketsReducer from './slices/ticketsSlice';
import eventsReducer from './slices/eventsSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    tickets: ticketsReducer,
    events: eventsReducer,
    wallet: walletReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;