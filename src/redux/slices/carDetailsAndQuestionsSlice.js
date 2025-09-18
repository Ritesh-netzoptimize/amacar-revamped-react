import api from '@/lib/api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { logout } from './userSlice';

let vin = "";

// Async thunk to fetch vehicle details
export const fetchVehicleDetails = createAsyncThunk(
  'carDetailsAndQuestions/fetchVehicleDetails',
  async ({ vin, zip }, { rejectWithValue }) => {
    try {
      vin = vin;
      console.log(vin, zip);
      const response = await api.get(
        `/vehicle/default-values-by-vin?vin=${vin}&zip=${zip}`
      );
      if (response.data.success) {
        return {
          vehicleData: response.data.values[0], // Vehicle data from values array
          cityState: response.data.city_state,    // Location data from city_state
          vehicleImage: response.data.vehicle_image // Vehicle image from API response
        };
      } else {
        return rejectWithValue('API request failed');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch city and state by ZIP code
export const fetchCityStateByZip = createAsyncThunk(
  'carDetailsAndQuestions/fetchCityStateByZip',
  async (zip, { rejectWithValue }) => {
    try {
    //   console.log('Fetching city/state for ZIP:', zip);
      const response = await api.get(
        `/location/city-state-by-zip?zipcode=${zip}`
      );
    //   console.log('City/State API response:', response.data);
      
      if (response.data.success) {
        return {
          city: response.data.location.city,
          state: response.data.location.state_name,
          zipcode: response.data.location.zipcode,
        };
      } else {
        return rejectWithValue(response.data.message || 'Invalid ZIP code');
      }
    } catch (error) {
      console.log('City/State API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch location data');
    }
  }
);

// Async thunk for Instant Cash Offer API
export const getInstantCashOffer = createAsyncThunk(
  'carDetailsAndQuestions/getInstantCashOffer',
  async (offerData, { rejectWithValue }) => {
    try {
      console.log('Submitting instant cash offer request:', JSON.stringify(offerData, null, 2));
      const response = await api.post('/offer/instant-cash', offerData);
      console.log('Instant Cash Offer API response:', response.data);
      
      if (response.data.status === 'success') {
        return {
          offerAmount: response.data.offer_amount,
          carSummary: response.data.car_summary,
          isAuctionable: response.data.is_auctionable,
          productId: response.data.product_id,
          emailSent: response.data.email_sent,
          timestamp: response.data.timestamp,
          userInfo: response.data.user_info, // Include user info for auto-login
        };
      } else {
        console.log('API returned status:', response.data.status, 'message:', response.data.message);
        return rejectWithValue(response.data.message || 'Failed to get instant cash offer');
      }
    } catch (error) {
      console.log('Instant Cash Offer API error:', error.response?.data || error.message);
      console.log('Error status:', error.response?.status);
      console.log('Error headers:', error.response?.headers);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to get instant cash offer');
    }
  }
);

// Async thunk for uploading vehicle images
export const uploadVehicleImage = createAsyncThunk(
  'carDetailsAndQuestions/uploadVehicleImage',
  async ({ file, productId, imageName }, { rejectWithValue }) => {
    try {
      console.log('Uploading vehicle image:', { productId, imageName, fileName: file.name });
      
      // Validate file type
    //   const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    //   if (!allowedTypes.includes(file.type)) {
    //     return rejectWithValue('Invalid file type. Only JPG, JPEG, PNG, GIF, and WEBP are allowed.');
    //   }

      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('product_id', productId);
      formData.append('image_name', imageName);

      // Upload image
      const response = await api.post('/vehicle/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Image upload API response:', response.data);

      if (response.data.success) {
        return {
          attachmentId: response.data.attachment_id,
          imageUrl: response.data.image_url,
          metaKey: response.data.meta_key,
          productId: response.data.product_id,
          imageName: imageName,
          localUrl: URL.createObjectURL(file) // Keep local URL for immediate display
        };
      } else {
        return rejectWithValue(response.data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.log('Image upload API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to upload image');
    }
  }
);

// Async thunk for deleting vehicle images
export const deleteVehicleImage = createAsyncThunk(
  'carDetailsAndQuestions/deleteVehicleImage',
  async ({ attachmentId }, { rejectWithValue }) => {
    try {
      console.log('Deleting vehicle image:', { attachmentId });
      
      const response = await api.post('/vehicle/delete-image', {
        attachment_id: attachmentId
      });

      console.log('Image delete API response:', response.data);

      if (response.data.success) {
        return {
          attachmentId: response.data.attachment_id,
          message: response.data.message
        };
      } else {
        return rejectWithValue(response.data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.log('Image delete API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete image');
    }
  }
);

// Async thunk for starting auction
export const startAuction = createAsyncThunk(
  'carDetailsAndQuestions/startAuction',
  async ({ productId, termsAccepted }, { rejectWithValue }) => {
    try {
      console.log('Starting auction for product:', productId);
      const response = await api.post('/auction/start', { product_id: productId, auction_terms: termsAccepted });
      console.log('Auction start API response:', response.data);
      if (response.data.success) {
        return {
          productId: response.data.product_id,
          message: response.data.message,
          auctionStartedAt: response.data.auction_started_at,
          auctionEndsAt: response.data.auction_ends_at,
          timestamp: response.data.timestamp
        };
      } else {
        return rejectWithValue(response.data.message || 'Failed to start auction');
      }
    } catch (error) {
      console.log('Auction start API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start auction');
    }
  }
);


// Initial questions with defaults
const initialQuestions = [
  {
    key: 'cosmetic',
    label: 'Cosmetic condition?',
    emoji: '✨',
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
    positive: ['Excellent', 'Good'],
    needsDetails: ['Fair', 'Poor'],
    isMultiSelect: false,
    answer: 'Excellent',
    details: '',
  },
  {
    key: 'smoked',
    label: 'Smoked in?',
    emoji: '🚭',
    options: ['No', 'Yes'],
    positive: ['No'],
    needsDetails: ['Yes'],
    isMultiSelect: false,
    answer: 'No',
    details: '',
  },
  {
    key: 'title',
    label: 'Title status?',
    emoji: '📋',
    options: ['Clean', 'Salvage', 'Rebuilt'],
    positive: ['Clean'],
    needsDetails: ['Salvage', 'Rebuilt'],
    isMultiSelect: false,
    answer: 'Clean',
    details: '',
  },
  {
    key: 'accident',
    label: 'Accident history',
    emoji: '🚗',
    options: ['None', 'Minor', 'Major'],
    positive: ['None'],
    needsDetails: ['Minor', 'Major'],
    isMultiSelect: false,
    answer: 'None',
    details: '',
  },
  {
    key: 'features',
    label: 'Notable features?',
    emoji: '⭐',
    options: ['Navigation', 'Leather', 'Sunroof', 'Alloy Wheels', 'Premium Audio', 'Safety+', 'None of the above'],
    positive: [],
    needsDetails: [],
    isMultiSelect: true,
    answer: [],
    details: '',
  },
  {
    key: 'modifications',
    label: 'Modifications?',
    emoji: '🔧',
    options: ['No', 'Yes'],
    positive: ['No'],
    needsDetails: ['Yes'],
    isMultiSelect: false,
    answer: 'No',
    details: '',
  },
  {
    key: 'warning',
    label: 'Warning lights?',
    emoji: '⚠️',
    options: ['No', 'Yes'],
    positive: ['No'],
    needsDetails: ['Yes'],
    isMultiSelect: false,
    answer: 'No',
    details: '',
  },
  {
    key: 'tread',
    label: 'Tire condition?',
    emoji: '🛞',
    options: ['New', 'Good', 'Fair', 'Replace'],
    positive: ['New', 'Good'],
    needsDetails: ['Fair', 'Replace'],
    isMultiSelect: false,
    answer: 'New',
    details: '',
  },
];

// Initial state
const initialState = {
  userExists: false,
  userInfo: null,
  productId: null,
  vehicleDetails: {},
  stateZip: "",
  stateVin: "",
  questions: initialQuestions,
  loading: false,
  error: null,
  location: {
    city: "",
    state: "",
    zipcode: "",
  },
  locationStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  locationError: null,
  // Modal state management
  modalState: {
    phase: 'form', // 'form' | 'loading' | 'success' | 'error'
    isLoading: false,
    error: null,
    successMessage: null,
  },
  // Instant Cash Offer state
  offer: {
    offerAmount: null,
    carSummary: null,
    isAuctionable: null,
    productId: null,
    emailSent: null,
    timestamp: null,
  },
  offerStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  offerError: null,
  // Image upload state
  uploadedImages: [], // Array of successfully uploaded images
  imageUploadStatus: 'idle', // 'idle' | 'uploading' | 'succeeded' | 'failed'
  imageUploadError: null,
  // Image delete state
  imageDeleteStatus: 'idle', // 'idle' | 'deleting' | 'succeeded' | 'failed'
  imageDeleteError: null,
  // Auction start state
  auctionStartStatus: 'idle', // 'idle' | 'starting' | 'succeeded' | 'failed'
  auctionStartError: null,
  auctionData: {
    productId: null,
    message: null,
    auctionStartedAt: null,
    auctionEndsAt: null,
    timestamp: null
  },  
};

// Create slice
const carDetailsAndQuestionsSlice = createSlice({
  name: 'carDetailsAndQuestions',
  initialState,
  reducers: {
    setVehicleDetails: (state, action) => {
      const { vehicle_data } = action.payload;
      const newDetails = vehicle_data[0] || {};

      console.log('setVehicleDetails - action.payload.vehicleImage:', action.payload.vehicleImage);
      console.log('setVehicleDetails - existing vehicleImg:', state.vehicleDetails.vehicleImg);

      // Merge new details with existing vehicleDetails, prioritizing new details
      state.vehicleDetails = {
        ...state.vehicleDetails,
        ...newDetails,
        vehicleImg: action.payload.vehicleImage || state.vehicleDetails.vehicleImg || '',
        // Ensure these fields are included, using provided values or empty strings
        mileage: newDetails.mileage || '',
        exteriorColor: newDetails.exteriorColor || state.vehicleDetails.exteriorColor || '',
        interiorColor: newDetails.interiorColor || state.vehicleDetails.interiorColor || '',
        bodyType: newDetails.bodytype || newDetails.body || state.vehicleDetails.bodyType || '',
        transmission: newDetails.transmission || state.vehicleDetails.transmission || '',
        engineType:
          newDetails.liters && newDetails.engineconfiguration
            ? `${newDetails.liters}L ${newDetails.cylinders}${newDetails.engineconfiguration}`
            : state.vehicleDetails.engineType || '',
        bodyEngineType:
          newDetails.fueltype
            ? `${newDetails.engineconfiguration}${newDetails.cylinders} / ${newDetails.fueltype}`
            : state.vehicleDetails.bodyEngineType || '',
      };

      
    },
    clearVehicleDetails: (state) => {
      state.vehicleDetails = {};
      state.stateZip = "";
    },
    setStateVin: (state, action) => {
      state.stateVin = action.payload;
    },
    updateQuestion: (state, action) => {
      const { key, answer, details } = action.payload;
      const question = state.questions.find((q) => q.key === key);
      if (question) {
        // Update answer if provided
        if (answer !== undefined) {
          question.answer = answer;
        }
        
        // Update details if provided
        if (details !== undefined) {
          question.details = details;
        }
        
        // Only clear details when answer changes and new answer doesn't need details
        if (answer !== undefined && details === undefined) {
          const shouldClearDetails = question.isMultiSelect
            ? Array.isArray(answer) && answer.length === 0
            : !question.needsDetails?.includes(answer);
            
          if (shouldClearDetails) {
            question.details = '';
          }
        }
      }
    },
    resetQuestions: (state) => {
      state.questions = initialQuestions.map((q) => ({ ...q })); // Deep copy to avoid reference issues
    },
    setZipState: (state, action) => {
      state.stateZip = action.payload; // Update zip
    },
    clearLocation: (state) => {
      state.location = {
        city: "",
        state: "",
        zipcode: "",
      };
      state.locationStatus = 'idle';
      state.locationError = null;
    },
    setLocationError: (state, action) => {
      state.locationError = action.payload;
      state.locationStatus = 'failed';
    },
    // Modal state management actions
    setModalPhase: (state, action) => {
      state.modalState.phase = action.payload;
    },
    setModalLoading: (state, action) => {
      state.modalState.isLoading = action.payload;
      if (action.payload) {
        state.modalState.phase = 'loading';
        state.modalState.error = null;
      }
    },
    setModalError: (state, action) => {
      state.modalState.error = action.payload;
      state.modalState.phase = 'error';
      state.modalState.isLoading = false;
    },
    setModalSuccess: (state, action) => {
      state.modalState.successMessage = action.payload;
      state.modalState.phase = 'success';
      state.modalState.isLoading = false;
      state.modalState.error = null;
    },
    resetModalState: (state) => {
      state.modalState = {
        phase: 'form',
        isLoading: false,
        error: null,
        successMessage: null,
      };
    },
    // Instant Cash Offer actions
    clearOffer: (state) => {
      state.offer = {
        offerAmount: null,
        carSummary: null,
        isAuctionable: null,
        productId: null,
        emailSent: null,
        timestamp: null,
      };
      state.offerStatus = 'idle';
      state.offerError = null;
    },
    setOfferError: (state, action) => {
      state.offerError = action.payload;
      state.offerStatus = 'failed';
    },
    // Image upload actions
    addUploadedImage: (state, action) => {
      state.uploadedImages.push(action.payload);
    },
    removeUploadedImage: (state, action) => {
      state.uploadedImages = state.uploadedImages.filter(img => img.id !== action.payload);
    },
    clearImageUploadError: (state) => {
      state.imageUploadError = null;
    },
    clearUploadedImages: (state) => {
      state.uploadedImages = [];
    },
    // Image delete actions
    clearImageDeleteError: (state) => {
      state.imageDeleteError = null;
    },
    // Auction start reducers
    clearAuctionStartError: (state) => {
      state.auctionStartError = null;
    },
    clearAuctionData: (state) => {
      state.auctionData = {
        productId: null,
        message: null,
        auctionStartedAt: null,
        auctionEndsAt: null,
        timestamp: null
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicleDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicleDetails.fulfilled, (state, action) => {
        state.loading = false;
        const { vehicleData, cityState, vehicleImage } = action.payload;
        
        console.log('fetchVehicleDetails.fulfilled - vehicleImage:', vehicleImage);
        console.log('fetchVehicleDetails.fulfilled - existing vehicleImg:', state.vehicleDetails.vehicleImg);
        
        // Merge fetched vehicle details with existing, ensuring additional fields are preserved
        state.vehicleDetails = {
          ...state.vehicleDetails,
          ...vehicleData,
          vehicleImg: vehicleImage || state.vehicleDetails.vehicleImg || '',
          mileage: state.vehicleDetails.mileage || vehicleData.mileage || '',
          averageMileage: vehicleData.averageMileage || vehicleData.avg_mileage || vehicleData.average_mileage || '',
          exteriorColor: state.vehicleDetails.exteriorColor || vehicleData.exteriorColor || '',
          interiorColor: state.vehicleDetails.interiorColor || vehicleData.interiorColor || '',
          bodyType:
            vehicleData.bodytype || vehicleData.body || state.vehicleDetails.bodyType || '',
          transmission: vehicleData.transmission || state.vehicleDetails.transmission || '',
          fueltype: vehicleData.fueltype || state.vehicleDetails.fueltype || '',
          engineType:
            vehicleData.liters && vehicleData.engineconfiguration
              ? `${vehicleData.liters}L ${vehicleData.cylinders}${vehicleData.engineconfiguration}`
              : state.vehicleDetails.engineType || '',
          bodyEngineType:
            vehicleData.fueltype
              ? `${vehicleData.engineconfiguration}${vehicleData.cylinders} / ${vehicleData.fueltype}`
              : state.vehicleDetails.bodyEngineType || '',
        };
        
        // Store location data from city_state
        state.location = {
          city: cityState.data.city,
          state: cityState.data.state_name,
          zipcode: cityState.data.zipcode,
        };
      })
      .addCase(fetchVehicleDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // City/State by ZIP reducers
      .addCase(fetchCityStateByZip.pending, (state) => {
        state.locationStatus = 'loading';
        state.locationError = null;
      })
      .addCase(fetchCityStateByZip.fulfilled, (state, action) => {
        state.locationStatus = 'succeeded';
        state.location = action.payload;
        state.locationError = null;
      })
      .addCase(fetchCityStateByZip.rejected, (state, action) => {
        state.locationStatus = 'failed';
        state.locationError = action.payload;
        state.location = {
          city: "",
          state: "",
          zipcode: "",
        };
      })
      // Instant Cash Offer reducers
      .addCase(getInstantCashOffer.pending, (state) => {
        state.offerStatus = 'loading';
        state.offerError = null;
      })
      .addCase(getInstantCashOffer.fulfilled, (state, action) => {
        state.offerStatus = 'succeeded';
        state.offer = action.payload;
        state.offerError = null;
        state.productId = action.payload.productId;
        state.userExists = action.payload.userInfo.user_exists;
        state.userInfo = action.payload.userInfo;
      })
      .addCase(getInstantCashOffer.rejected, (state, action) => {
        state.offerStatus = 'failed';
        state.offerError = action.payload;
        state.userExists = false;
        state.userInfo = null;
      })
      // Image upload reducers
      .addCase(uploadVehicleImage.pending, (state) => {
        state.imageUploadStatus = 'uploading';
        state.imageUploadError = null;
      })
      .addCase(uploadVehicleImage.fulfilled, (state, action) => {
        state.imageUploadStatus = 'succeeded';
        state.uploadedImages.push(action.payload);
        state.imageUploadError = null;
      })
      .addCase(uploadVehicleImage.rejected, (state, action) => {
        state.imageUploadStatus = 'failed';
        state.imageUploadError = action.payload;
      })
      // Image delete reducers
      .addCase(deleteVehicleImage.pending, (state) => {
        state.imageDeleteStatus = 'deleting';
        state.imageDeleteError = null;
      })
      .addCase(deleteVehicleImage.fulfilled, (state, action) => {
        state.imageDeleteStatus = 'succeeded';
        // Remove the deleted image from uploadedImages
        state.uploadedImages = state.uploadedImages.filter(img => img.attachmentId !== action.payload.attachmentId);
        state.imageDeleteError = null;
      })
      .addCase(deleteVehicleImage.rejected, (state, action) => {
        state.imageDeleteStatus = 'failed';
        state.imageDeleteError = action.payload;
      })
      // Auction start extraReducers
      .addCase(startAuction.pending, (state) => {
        state.auctionStartStatus = 'starting';
        state.auctionStartError = null;
      })
      .addCase(startAuction.fulfilled, (state) => {
        return initialState;
        // return initialState; // re check by neeraj sir
      })
      .addCase(startAuction.rejected, (state, action) => {
        state.auctionStartStatus = 'failed';
        state.auctionStartError = action.payload;
      })
      .addCase(logout, (state) => {
        return initialState;
      });
  },
});

// Export actions
export const {
  setVehicleDetails,
  updateQuestion,
  resetQuestions,
  setZipState,
  clearLocation,
  setLocationError,
  setModalPhase,
  setModalLoading,
  setModalError,
  setModalSuccess,
  resetModalState,
  clearOffer,
  setOfferError,
  setStateVin,
  addUploadedImage,
  removeUploadedImage,
  clearImageUploadError,
  clearUploadedImages,
  clearImageDeleteError,
  clearAuctionStartError,
  clearAuctionData
} = carDetailsAndQuestionsSlice.actions;

// Export reducer
export default carDetailsAndQuestionsSlice.reducer;