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

// Async thunk to accept a bid
export const acceptBid = createAsyncThunk(
  'offers/acceptBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bid/accept', {
        bid_id: bidData.bidId,
        product_id: bidData.productId,
        bidder_id: bidData.bidderId
      });
      
      console.log('Accept bid response:', response);
      console.log('Accept bid response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to accept bid');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to accept bid');
    }
  }
);

// Async thunk to reject a bid
export const rejectBid = createAsyncThunk(
  'offers/rejectBid',
  async (bidData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bid/reject', {
        bid_id: bidData.bidId,
        product_id: bidData.productId,
        bidder_id: bidData.bidderId
      });
      
      console.log('Reject bid response:', response);
      console.log('Reject bid response data:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reject bid');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to reject bid');
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
  // Bid operation states
  bidOperationLoading: false,
  bidOperationError: null,
  bidOperationSuccess: false,
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
    
    // Clear bid operation states
    clearBidOperationStates: (state) => {
      state.bidOperationLoading = false;
      state.bidOperationError = null;
      state.bidOperationSuccess = false;
    },
    
    // Update bid status in live auctions
    updateBidStatus: (state, action) => {
      const { auctionId, bidId, status } = action.payload;
      const auction = state.liveAuctions.find(auction => auction.product_id === auctionId);
      if (auction && auction.bid) {
        const bid = auction.bid.find(bid => bid.id === bidId);
        if (bid) {
          bid.is_accepted = status === 'accepted';
          bid.is_expired = status === 'rejected';
        }
      }
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
      })
      // Accept bid
      .addCase(acceptBid.pending, (state) => {
        state.bidOperationLoading = true;
        state.bidOperationError = null;
        state.bidOperationSuccess = false;
      })
      .addCase(acceptBid.fulfilled, (state, action) => {
        state.bidOperationLoading = false;
        state.bidOperationError = null;
        state.bidOperationSuccess = true;
        // Update the bid status in live auctions
        const { bidId, productId } = action.meta.arg;
        const auction = state.liveAuctions.find(auction => auction.product_id === productId);
        if (auction && auction.bid) {
          // Mark the accepted bid as accepted
          const acceptedBid = auction.bid.find(bid => bid.id === bidId);
          if (acceptedBid) {
            acceptedBid.is_accepted = true;
            acceptedBid.is_expired = false;
          }
          // Mark all other bids as expired
          auction.bid.forEach(bid => {
            if (bid.id !== bidId) {
              bid.is_accepted = false;
              bid.is_expired = true;
            }
          });
        }
      })
      .addCase(acceptBid.rejected, (state, action) => {
        state.bidOperationLoading = false;
        state.bidOperationError = action.payload || 'Failed to accept bid';
        state.bidOperationSuccess = false;
      })
      // Reject bid
      .addCase(rejectBid.pending, (state) => {
        state.bidOperationLoading = true;
        state.bidOperationError = null;
        state.bidOperationSuccess = false;
      })
      .addCase(rejectBid.fulfilled, (state, action) => {
        state.bidOperationLoading = false;
        state.bidOperationError = null;
        state.bidOperationSuccess = true;
        // Update the bid status in live auctions
        const { bidId, productId } = action.meta.arg;
        const auction = state.liveAuctions.find(auction => auction.product_id === productId);
        if (auction && auction.bid) {
          const bid = auction.bid.find(bid => bid.id === bidId);
          if (bid) {
            bid.is_accepted = false;
            bid.is_expired = true;
          }
        }
      })
      .addCase(rejectBid.rejected, (state, action) => {
        state.bidOperationLoading = false;
        state.bidOperationError = action.payload || 'Failed to reject bid';
        state.bidOperationSuccess = false;
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
  clearBidOperationStates,
  updateBidStatus,
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
// Bid operation selectors
export const selectBidOperationLoading = (state) => state.offers.bidOperationLoading;
export const selectBidOperationError = (state) => state.offers.bidOperationError;
export const selectBidOperationSuccess = (state) => state.offers.bidOperationSuccess;
