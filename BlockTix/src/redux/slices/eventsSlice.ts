import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Event } from '../../types';
import { Web3Service } from '../../services/web3';

interface EventsState {
  events: Event[];
  featuredEvents: Event[];
  eventAddresses: string[];
  loading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  featuredEvents: [],
  eventAddresses: [],
  loading: false,
  error: null,
};

export const fetchEventAddresses = createAsyncThunk(
  'events/fetchAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const addresses = await Web3Service.getAllEventAddresses();
      return addresses;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  'events/fetchDetails',
  async (addresses: string[], { rejectWithValue }) => {
    try {
      const events = await Promise.all(
        addresses.map(async (address) => {
          const details = await Web3Service.getEventDetails(address);
          return {
            id: address,
            name: details.name,
            venue: 'On-chain Event',
            date: details.date.toISOString(),
            price: 'TBA',
            imageUrl: details.imageUrl,
            description: 'Event details coming soon...',
            totalTickets: details.totalTickets,
            availableTickets: details.totalTickets - details.soldTickets,
          };
        })
      );
      return events;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<Event[]>) => {
      state.events = action.payload;
    },
    setFeaturedEvents: (state, action: PayloadAction<Event[]>) => {
      state.featuredEvents = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEventAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventAddresses.fulfilled, (state, action) => {
        state.eventAddresses = action.payload;
        state.loading = false;
      })
      .addCase(fetchEventAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchEventDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.events = action.payload;
        state.featuredEvents = action.payload.slice(0, 3);
        state.loading = false;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setEvents, setFeaturedEvents } = eventsSlice.actions;
export default eventsSlice.reducer;