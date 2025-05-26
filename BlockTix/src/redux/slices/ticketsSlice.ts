import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { Ticket } from '../../types';
import { Web3Service } from '../../services/web3';

interface TicketsState {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
};

export const fetchUserTickets = createAsyncThunk(
  'tickets/fetchUserTickets',
  async (userAddress: string, { rejectWithValue }) => {
    try {
      // Get all event addresses
      const eventAddresses = await Web3Service.getAllEventAddresses();
      
      // For each event, check if the user has any tickets
      const userTickets: Ticket[] = [];
      
      for (const eventAddress of eventAddresses) {
        const eventContract = Web3Service.getEventContract(eventAddress);
        const eventDetails = await Web3Service.getEventDetails(eventAddress);
        
        // Get user's tickets for this event
        const ticketIds = await eventContract.getUserTickets(userAddress);
        
        for (const ticketId of ticketIds) {
          userTickets.push({
            id: ticketId.toString(),
            eventName: eventDetails.name,
            venue: 'On-chain Event',
            date: eventDetails.date.toISOString(),
            price: 'Owned',
            imageUrl: eventDetails.imageUrl,
            description: 'Your NFT Ticket',
            owner: userAddress,
            eventAddress
          });
        }
      }
      
      return userTickets;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    clearTickets: (state) => {
      state.tickets = [];
      state.error = null;
    },
    selectTicket: (state, action: PayloadAction<string>) => {
      state.selectedTicket = state.tickets.find(ticket => ticket.id === action.payload) || null;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserTickets.fulfilled, (state, action) => {
        state.tickets = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tickets = [];
      });
  },
});

export const { clearTickets, selectTicket, clearSelectedTicket } = ticketsSlice.actions;
export default ticketsSlice.reducer;