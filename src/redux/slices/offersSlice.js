import api from '@/lib/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch previous offers
export const fetchPreviousOffers = createAsyncThunk(
  'offers/fetchPreviousOffers',
  async (_, { rejectWithValue }) => {
    try {
      // Use the axios instance which already handles auth headers
      const response = await api.get('/dashboard/previous-offers');
      console.log('Previous offers response:', response);
      console.log('Previous offers response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch offers');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch previous offers');
    }
  }
);

// Async thunk to fetch pending offers
export const fetchPendingOffers = createAsyncThunk(
  'offers/fetchPendingOffers',
  async (_, { rejectWithValue }) => {
    try {
      // Use the axios instance which already handles auth headers
      const response = await api.get('/dashboard/pending-offers');
      console.log('Pending offers response:', response);
      console.log('Pending offers response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch pending offers');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch pending offers');
    }
  }
);

// Async thunk to fetch accepted offers
export const fetchAcceptedOffers = createAsyncThunk(
  'offers/fetchAcceptedOffers',
  async (_, { rejectWithValue }) => {
    try {
      // Use the axios instance which already handles auth headers
      const response = await api.get('/dashboard/accepted-offers');
      console.log('Accepted offers response:', response);
      console.log('Accepted offers response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch accepted offers');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch accepted offers');
    }
  }
);

// Async thunk to fetch live auctions
export const fetchLiveAuctions = createAsyncThunk(
  'offers/fetchLiveAuctions',
  async (_, { rejectWithValue }) => {
    try {
      // Use the axios instance which already handles auth headers
      const response = await api.get('/dashboard/live-auctions');
      console.log('Live auctions response:', response);
      console.log('Live auctions response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch live auctions');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch live auctions');
    }
  }
);

// Async thunk to fetch appointments
export const fetchAppointments = createAsyncThunk(
  'offers/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      // Use the axios instance which already handles auth headers
      const response = await api.get('/dashboard/appointments');
      console.log('Appointments response:', response);
      console.log('Appointments response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch appointments');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch appointments');
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  previousOffers: [],
  acceptedOffers: [],
  pendingOffers: [],
  liveAuctions: [],
  appointments: [],
  totalCount: 0,
  hasOffers: false,
  hasAuctions: false,
  hasAppointments: false,
};

const offersSlice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    // Reset all offers data
    resetOffers: (state) => {
      state.loading = false;
      state.error = null;
      state.previousOffers = [];
      state.acceptedOffers = [];
      state.pendingOffers = [];
      state.liveAuctions = [];
      state.appointments = [];
      state.totalCount = 0;
      state.hasOffers = false;
      state.hasAuctions = false;
      state.hasAppointments = false;
    },
    
    // Add offer to accepted offers
    acceptOffer: (state, action) => {
      const offer = action.payload;
      // Remove from previous offers if it exists there
      state.previousOffers = state.previousOffers.filter(prevOffer => prevOffer.product_id !== offer.product_id);
      // Remove from pending offers if it exists there
      state.pendingOffers = state.pendingOffers.filter(pendingOffer => pendingOffer.product_id !== offer.product_id);
      // Add to accepted offers
      state.acceptedOffers.push(offer);
    },
    
    // Add offer to pending offers
    addPendingOffer: (state, action) => {
      const offer = action.payload;
      // Remove from previous offers if it exists there
      state.previousOffers = state.previousOffers.filter(prevOffer => prevOffer.product_id !== offer.product_id);
      // Add to pending offers
      state.pendingOffers.push(offer);
    },
    
    // Remove offer from accepted offers
    removeAcceptedOffer: (state, action) => {
      const productId = action.payload;
      state.acceptedOffers = state.acceptedOffers.filter(offer => offer.product_id !== productId);
    },
    
    // Remove offer from pending offers
    removePendingOffer: (state, action) => {
      const productId = action.payload;
      state.pendingOffers = state.pendingOffers.filter(offer => offer.product_id !== productId);
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch previous offers
      .addCase(fetchPreviousOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPreviousOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.previousOffers = action.payload.offers || [];
        state.totalCount = action.payload.total_count || 0;
        state.hasOffers = action.payload.has_offers || false;
      })
      .addCase(fetchPreviousOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch previous offers';
      })
      // Fetch pending offers
      .addCase(fetchPendingOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.pendingOffers = action.payload.offers || [];
        state.totalCount = action.payload.total_count || 0;
        state.hasOffers = action.payload.has_offers || false;
      })
      .addCase(fetchPendingOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pending offers';
      })
      // Fetch accepted offers
      .addCase(fetchAcceptedOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAcceptedOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.acceptedOffers = action.payload.offers || [];
        state.totalCount = action.payload.total_count || 0;
        state.hasOffers = action.payload.has_offers || false;
      })
      .addCase(fetchAcceptedOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch accepted offers';
      })
      // Fetch live auctions
      .addCase(fetchLiveAuctions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveAuctions.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.liveAuctions = action.payload.auctions || [];
        state.totalCount = action.payload.total_count || 0;
        state.hasAuctions = action.payload.has_auctions || false;
      })
      .addCase(fetchLiveAuctions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch live auctions';
      })
      // Fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.appointments = action.payload.appointments || [];
        state.totalCount = action.payload.total_count || 0;
        state.hasAppointments = action.payload.has_appointments || false;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch appointments';
      });
  },
});

// Export actions
export const {
  resetOffers,
  acceptOffer,
  addPendingOffer,
  removeAcceptedOffer,
  removePendingOffer,
  clearError,
} = offersSlice.actions;

// Export reducer
export default offersSlice.reducer;

// Selectors for easy access to state
export const selectOffers = (state) => state.offers;
export const selectPreviousOffers = (state) => state.offers.previousOffers;
export const selectAcceptedOffers = (state) => state.offers.acceptedOffers;
export const selectPendingOffers = (state) => state.offers.pendingOffers;
export const selectLiveAuctions = (state) => state.offers.liveAuctions;
export const selectAppointments = (state) => state.offers.appointments;
export const selectOffersLoading = (state) => state.offers.loading;
export const selectOffersError = (state) => state.offers.error;
export const selectTotalCount = (state) => state.offers.totalCount;
export const selectHasOffers = (state) => state.offers.hasOffers;
export const selectHasAuctions = (state) => state.offers.hasAuctions;
export const selectHasAppointments = (state) => state.offers.hasAppointments;
