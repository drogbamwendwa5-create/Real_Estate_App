import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MapService from '../../Services/MapService';

export const fetchMapProperties = createAsyncThunk(
  'map/fetchMapProperties',
  async (params, { rejectWithValue }) => {
    try {
      const data = await MapService.getMapProperties(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch map properties');
    }
  }
);

export const fetchNearbyAmenities = createAsyncThunk(
  'map/fetchNearbyAmenities',
  async ({ lat, lng, radius, types }, { rejectWithValue }) => {
    try {
      const data = await MapService.getNearbyAmenities(lat, lng, radius, types);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch nearby amenities');
    }
  }
);

export const geocodeAddress = createAsyncThunk(
  'map/geocodeAddress',
  async (address, { rejectWithValue }) => {
    try {
      const data = await MapService.geocode(address);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to geocode address');
    }
  }
);

export const fetchRoute = createAsyncThunk(
  'map/fetchRoute',
  async ({ from, to, profile }, { rejectWithValue }) => {
    try {
      const data = await MapService.getRoute(from, to, profile);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch route');
    }
  }
);

export const fetchHeatmap = createAsyncThunk(
  'map/fetchHeatmap',
  async ({ bounds, type, zoom }, { rejectWithValue }) => {
    try {
      const data = await MapService.getHeatmapData(bounds, type, zoom);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch heatmap data');
    }
  }
);

export const searchInPolygon = createAsyncThunk(
  'map/searchInPolygon',
  async ({ polygon, filters }, { rejectWithValue }) => {
    try {
      const data = await MapService.polygonSearch(polygon, filters);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to perform polygon search');
    }
  }
);

export const fetchInvestmentScore = createAsyncThunk(
  'map/fetchInvestmentScore',
  async (propertyId, { rejectWithValue }) => {
    try {
      const data = await MapService.getInvestmentScore(propertyId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch investment score');
    }
  }
);

const initialState = {
  properties: [],
  clusters: [],
  selectedProperty: null,
  nearbyAmenities: [],
  route: null,
  heatmapData: [],
  investmentScore: null,
  searchResults: [],
  region: null,
  filters: {
    propertyType: '',
    status: '',
    minPrice: 0,
    maxPrice: 0,
    bedrooms: 0,
  },
  activeOverlay: 'none',
  isDrawingPolygon: false,
  polygonPoints: [],
  loading: false,
  error: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setRegion: (state, action) => {
      state.region = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSelectedProperty: (state, action) => {
      state.selectedProperty = action.payload;
    },
    clearSelectedProperty: (state) => {
      state.selectedProperty = null;
    },
    setActiveOverlay: (state, action) => {
      state.activeOverlay = action.payload;
    },
    togglePolygonDrawing: (state) => {
      state.isDrawingPolygon = !state.isDrawingPolygon;
      if (!state.isDrawingPolygon) {
        state.polygonPoints = [];
      }
    },
    addPolygonPoint: (state, action) => {
      state.polygonPoints.push(action.payload);
    },
    removeLastPolygonPoint: (state) => {
      state.polygonPoints.pop();
    },
    clearPolygon: (state) => {
      state.polygonPoints = [];
      state.isDrawingPolygon = false;
    },
    clearRoute: (state) => {
      state.route = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMapProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMapProperties.fulfilled, (state, action) => {
        state.loading = false;
        const result = action.payload?.data || action.payload || {};
        state.properties = result.properties || [];
        state.clusters = result.clusters || [];
      })
      .addCase(fetchMapProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchNearbyAmenities.fulfilled, (state, action) => {
        state.nearbyAmenities = action.payload.amenities || action.payload.data || [];
      })
      .addCase(fetchRoute.fulfilled, (state, action) => {
        state.route = action.payload.route || action.payload.data;
      })
      .addCase(fetchHeatmap.fulfilled, (state, action) => {
        state.heatmapData = action.payload.heatmapData || action.payload.data || [];
      })
      .addCase(searchInPolygon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchInPolygon.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties || action.payload.data || [];
        state.isDrawingPolygon = false;
        state.activeOverlay = 'none';
      })
      .addCase(searchInPolygon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchInvestmentScore.fulfilled, (state, action) => {
        state.investmentScore = action.payload.score || action.payload.data;
      });
  },
});

export const {
  setRegion,
  setFilters,
  clearFilters,
  setSelectedProperty,
  clearSelectedProperty,
  setActiveOverlay,
  togglePolygonDrawing,
  addPolygonPoint,
  removeLastPolygonPoint,
  clearPolygon,
  clearRoute,
  clearError,
} = mapSlice.actions;

export default mapSlice.reducer;
