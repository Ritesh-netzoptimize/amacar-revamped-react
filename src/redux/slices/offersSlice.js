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

// Async thunk to re-auction a vehicle
export const reAuctionVehicle = createAsyncThunk(
  'offers/reAuctionVehicle',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post('/vehicle/re-auction', {
        product_id: productId
      });
      
      console.log('Re-auction vehicle response:', response);
      console.log('Re-auction vehicle response data:', response.data);
      
      if (!response.data.success) {
        // Handle specific error cases
        const errorData = response.data;
        if (errorData.days_remaining !== undefined) {
          // 7-day rule error
          return rejectWithValue({
            type: 'DAYS_REMAINING',
            message: errorData.message,
            days_remaining: errorData.days_remaining,
            offer_date: errorData.offer_date,
            redirect_to_homepage: errorData.redirect_to_homepage
          });
        } else if (errorData.message?.includes('not authorized')) {
          // Authorization error
          return rejectWithValue({
            type: 'UNAUTHORIZED',
            message: errorData.message
          });
        } else if (errorData.message?.includes('not found')) {
          // Product not found error
          return rejectWithValue({
            type: 'NOT_FOUND',
            message: errorData.message
          });
        } else if (errorData.message?.includes('instant cash offer')) {
          // No instant cash offer error
          return rejectWithValue({
            type: 'NO_CASH_OFFER',
            message: errorData.message
          });
        } else {
          // Generic error
          return rejectWithValue({
            type: 'GENERIC',
            message: errorData.message || 'Failed to re-auction vehicle'
          });
        }
      }

      return response.data;
    } catch (error) {
      // Handle network or other errors
      const errorResponse = error.response?.data;
      if (errorResponse) {
        return rejectWithValue({
          type: 'NETWORK',
          message: errorResponse.message || error.message || 'Network error occurred'
        });
      }
      return rejectWithValue({
        type: 'NETWORK',
        message: error.message || 'Failed to re-auction vehicle'
      });
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
  // Re-auction operation states
  reAuctionLoading: false,
  reAuctionError: null,
  reAuctionSuccess: false,
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
    
    // Clear re-auction operation states
    clearReAuctionStates: (state) => {
      state.reAuctionLoading = false;
      state.reAuctionError = null;
      state.reAuctionSuccess = false;
    },
    
    // Move vehicle from previous offers to live auctions
    moveToLiveAuctions: (state, action) => {
      const { productId, auctionData } = action.payload;
      // Remove from previous offers
      state.previousOffers = state.previousOffers.filter(offer => offer.product_id !== productId);
      // Add to live auctions (this would typically come from a separate API call)
      // For now, we'll just remove from previous offers
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
      })
      // Re-auction vehicle
      .addCase(reAuctionVehicle.pending, (state) => {
        state.reAuctionLoading = true;
        state.reAuctionError = null;
        state.reAuctionSuccess = false;
      })
      .addCase(reAuctionVehicle.fulfilled, (state, action) => {
        state.reAuctionLoading = false;
        state.reAuctionError = null;
        state.reAuctionSuccess = true;
        // Remove the vehicle from previous offers
        const productId = action.meta.arg;
        state.previousOffers = state.previousOffers.filter(offer => offer.product_id !== productId);
      })
      .addCase(reAuctionVehicle.rejected, (state, action) => {
        state.reAuctionLoading = false;
        state.reAuctionError = action.payload;
        state.reAuctionSuccess = false;
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
  clearReAuctionStates,
  moveToLiveAuctions,
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
// Re-auction operation selectors
export const selectReAuctionLoading = (state) => state.offers.reAuctionLoading;
export const selectReAuctionError = (state) => state.offers.reAuctionError;
export const selectReAuctionSuccess = (state) => state.offers.reAuctionSuccess;
