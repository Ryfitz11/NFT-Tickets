import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { WalletState } from '../../types';
import { Web3Service } from '../../services/web3';
import { TARGET_NETWORK } from '../../config/contracts';

const initialState: WalletState = {
  address: null,
  chainId: null,
  networkName: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (_, { rejectWithValue }) => {
    try {
      const { address, chainId } = await Web3Service.connectWallet();
      
      if (chainId !== TARGET_NETWORK.chainId) {
        await Web3Service.switchNetwork();
      }

      await Web3Service.initialize();

      return { 
        address, 
        chainId: TARGET_NETWORK.chainId,
        networkName: TARGET_NETWORK.name 
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletAddress: (state, action: PayloadAction<string | null>) => {
      state.address = action.payload;
      state.isConnected = !!action.payload;
    },
    setChainId: (state, action: PayloadAction<number | null>) => {
      state.chainId = action.payload;
    },
    setNetworkName: (state, action: PayloadAction<string | null>) => {
      state.networkName = action.payload;
    },
    disconnectWallet: (state) => {
      state.address = null;
      state.chainId = null;
      state.networkName = null;
      state.isConnected = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnecting = false;
        state.isConnected = true;
        state.address = action.payload.address;
        state.chainId = action.payload.chainId;
        state.networkName = action.payload.networkName;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnecting = false;
        state.isConnected = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setWalletAddress,
  setChainId,
  setNetworkName,
  disconnectWallet,
  setError,
} = walletSlice.actions;

export default walletSlice.reducer;