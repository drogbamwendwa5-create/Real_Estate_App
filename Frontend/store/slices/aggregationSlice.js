import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAggregatedProperties,
  getAggregatedProperty,
  getAggregatedFeatured,
  getAggregatedRecommended,
  getAggregatedNearby,
  getAggregatedVerified,
  getAggregatedSaved,
  getAggregatedSearchHistory,
  toggleAggregatedSaved,
} from '../../Services/api';

const initialState = {
  properties: [],
  currentProperty: null,
  featuredProperties: [],
  recommendedProperties: [],
  nearbyProperties: [],
  verifiedProperties: [],
  savedProperties: [],
  searchHistory: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAggregatedProperties = createAsyncThunk(
  'aggregation/fetchProperties',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await getAggregatedProperties(params);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch aggregated properties');
    }
  }
);

export const fetchAggregatedProperty = createAsyncThunk(
  'aggregation/fetchProperty',
  async (id, { rejectWithValue }) => {
    try {
      return await getAggregatedProperty(id);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch property');
    }
  }
);

export const fetchAggregatedFeatured = createAsyncThunk(
  'aggregation/fetchFeatured',
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await getAggregatedFeatured(limit);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch featured properties');
    }
  }
);

export const fetchAggregatedRecommended = createAsyncThunk(
  'aggregation/fetchRecommended',
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await getAggregatedRecommended(limit);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch recommendations');
    }
  }
);

export const fetchAggregatedNearby = createAsyncThunk(
  'aggregation/fetchNearby',
  async ({ lat, lng, radius = 5000 }, { rejectWithValue }) => {
    try {
      return await getAggregatedNearby(lat, lng, radius);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch nearby properties');
    }
  }
);

export const fetchAggregatedVerified = createAsyncThunk(
  'aggregation/fetchVerified',
  async (limit = 10, { rejectWithValue }) => {
    try {
      return await getAggregatedVerified(limit);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch verified properties');
    }
  }
);

export const fetchAggregatedSaved = createAsyncThunk(
  'aggregation/fetchSaved',
  async (_, { rejectWithValue }) => {
    try {
      return await getAggregatedSaved();
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch saved properties');
    }
  }
);

export const fetchAggregatedSearchHistory = createAsyncThunk(
  'aggregation/fetchSearchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await getAggregatedSearchHistory();
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch search history');
    }
  }
);

export const toggleSavedProperty = createAsyncThunk(
  'aggregation/toggleSaved',
  async (propertyId, { rejectWithValue }) => {
    try {
      return await toggleAggregatedSaved(propertyId);
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to toggle save');
    }
  }
);

const aggregationSlice = createSlice({
  name: 'aggregation',
  initialState,
  reducers: {
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAggregatedProperties
      .addCase(fetchAggregatedProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAggregatedProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.data || [];
      })
      .addCase(fetchAggregatedProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAggregatedProperty
      .addCase(fetchAggregatedProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAggregatedProperty.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        state.currentProperty = payload.data || payload;
      })
      .addCase(fetchAggregatedProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchAggregatedFeatured
      .addCase(fetchAggregatedFeatured.fulfilled, (state, action) => {
        state.featuredProperties = action.payload.data || [];
      })
      // fetchAggregatedRecommended
      .addCase(fetchAggregatedRecommended.fulfilled, (state, action) => {
        state.recommendedProperties = action.payload.data || [];
      })
      // fetchAggregatedNearby
      .addCase(fetchAggregatedNearby.fulfilled, (state, action) => {
        state.nearbyProperties = action.payload.data || [];
      })
      // fetchAggregatedVerified
      .addCase(fetchAggregatedVerified.fulfilled, (state, action) => {
        state.verifiedProperties = action.payload.data || [];
      })
      // fetchAggregatedSaved
      .addCase(fetchAggregatedSaved.fulfilled, (state, action) => {
        state.savedProperties = action.payload.data || [];
      })
      // fetchAggregatedSearchHistory
      .addCase(fetchAggregatedSearchHistory.fulfilled, (state, action) => {
        state.searchHistory = action.payload.data || [];
      })
      // toggleSavedProperty
      .addCase(toggleSavedProperty.fulfilled, (state, action) => {
        const saved = action.payload.data;
        const exists = state.savedProperties.find((p) => p._id === saved?._id);
        if (exists) {
          state.savedProperties = state.savedProperties.filter((p) => p._id !== saved._id);
        } else {
          if (saved) state.savedProperties.push(saved);
        }
      });
  },
});

export const { clearCurrentProperty, clearError } = aggregationSlice.actions;
export default aggregationSlice.reducer;