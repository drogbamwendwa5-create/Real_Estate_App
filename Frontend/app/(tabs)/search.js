import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropertyCard from '../../Components/Property/PropertyCard';
import PropertyCardSkeleton from '../../Components/Property/PropertyCardSkeleton';
import SectionHeader from '../../Components/Home/SectionHeader';
import MapToggle from '../../Components/Search/MapToggle';
import { HeroSearch } from '../../Components/Search/HeroSearch';
import PropertyService from '../../Services/api/propertyService';
import OSMMapView, { MAP_LAYERS, getPropertyBadge } from '../../Components/Map/OSMMapView';
import PropertyMapCard from '../../Components/Map/PropertyMapCard';
import { useDispatch } from 'react-redux';
import { toggleFavourite as toggleFavouriteAction } from '../../store/slices/favouriteSlice';
import { formatPrice } from '../../Utils/helpers';
import { Ionicons } from '@expo/vector-icons';

// Fallback data with Kenyan coordinates used when the backend is unreachable
const FALLBACK_PROPERTIES = [
  { 
    _id: '1', 
    title: 'Luxury Villa - Runda', 
    price: 85000000, 
    location: 'Runda, Nairobi', 
    bedrooms: 5, 
    bathrooms: 4, 
    area: 450, 
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 
    images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6', 'https://images.unsplash.com/photo-1600596542815-27bfef402323'],
    coordinates: [36.8041, -1.2183],
    locationObj: { type: 'Point', coordinates: [36.8041, -1.2183] }
  },
  { 
    _id: '2', 
    title: 'Modern Apartment - Westlands', 
    price: 18000000, 
    location: 'Westlands, Nairobi', 
    bedrooms: 2, 
    bathrooms: 2, 
    area: 120, 
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
    coordinates: [36.8066, -1.2676],
    locationObj: { type: 'Point', coordinates: [36.8066, -1.2676] }
  },
  { 
    _id: '3', 
    title: 'Cozy Family Home - Lavington', 
    price: 35000000, 
    location: 'Lavington, Nairobi', 
    bedrooms: 3, 
    bathrooms: 3, 
    area: 220, 
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994', 
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994'],
    coordinates: [36.7725, -1.2828],
    locationObj: { type: 'Point', coordinates: [36.7725, -1.2828] }
  },
];

const PAGE_SIZE = 12;

export default function SearchScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const mapRef = useRef(null);

  // Responsive columns: 1 on mobile, 2 on tablet, 3 on desktop
  const numColumns = useMemo(() => {
    if (width >= 1280) return 3;
    if (width >= 640) return 2;
    return 1;
  }, [width]);

  const initialCached = PropertyService.getCachedAggregatedProperties({ page: 1, limit: PAGE_SIZE });
  const initialList = initialCached?.data || initialCached?.properties || (Array.isArray(initialCached) ? initialCached : []);

  const [properties, setProperties] = useState(initialList);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(initialList.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resultsCount, setResultsCount] = useState(initialCached?.total || initialCached?.count || initialList.length);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialCached?.totalPages || 1);
  const [currentParams, setCurrentParams] = useState({});
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [mapLayer, setMapLayer] = useState('detailed'); // 'detailed' | 'satellite' | 'osm'
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  const SKELETON_ITEMS = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const getPropertyKey = (property, index) => (property?._id || property?.id || `property-${index}`).toString();

  const loadProperties = useCallback(async (params = {}, pageNum = 1, isLoadMore = false) => {
    if (isLoadMore && loadingMoreRef.current) return;
    const requestId = ++requestIdRef.current;

    if (isLoadMore) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      // Check cache for instant display
      const cached = PropertyService.getCachedAggregatedProperties({ ...params, page: pageNum, limit: PAGE_SIZE });
      if (cached) {
        const cachedList = cached.data || cached.properties || (Array.isArray(cached) ? cached : []);
        setProperties(cachedList);
        setResultsCount(cached.total || cached.count || cachedList.length);
        setTotalPages(cached.totalPages || 1);
        setPage(pageNum);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setUsingFallback(false);
    }

    try {
      const searchParams = {
        ...params,
        page: pageNum,
        limit: PAGE_SIZE,
      };
      
      const response = await PropertyService.getAggregatedProperties(searchParams);
      const list = response.data || response.properties || [];
      const total = response.total || response.count || list.length;
      const totalP = response.totalPages || Math.ceil(total / PAGE_SIZE) || (list.length === PAGE_SIZE ? pageNum + 1 : pageNum);

      if (isLoadMore) {
        setProperties((prev) => {
          const existing = new Set(prev.map((item, index) => getPropertyKey(item, index)));
          const nextPage = list.filter((item, index) => !existing.has(getPropertyKey(item, index)));
          return [...prev, ...nextPage];
        });
      } else {
        setProperties(list);
      }

      setResultsCount(total);
      setTotalPages(totalP);
      setPage(pageNum);
      setCurrentParams(params);
      setUsingFallback(false);
    } catch {
      if (!isLoadMore && requestId === requestIdRef.current) {
        setProperties(FALLBACK_PROPERTIES);
        setResultsCount(FALLBACK_PROPERTIES.length);
        setTotalPages(1);
        setPage(1);
        setUsingFallback(true);
      }
    } finally {
      if (isLoadMore) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const loadMoreProperties = () => {
    if (!loading && !loadingMoreRef.current && page < totalPages && !usingFallback) {
      loadProperties(currentParams, page + 1, true);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const getPropertyCoords = useCallback((item, index = 0) => {
    const lat = item?.location?.coordinates?.[1] ?? item?.coordinates?.[1] ?? item?.latitude;
    const lng = item?.location?.coordinates?.[0] ?? item?.coordinates?.[0] ?? item?.longitude;

    if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      return { latitude: Number(lat), longitude: Number(lng) };
    }
    // Default fallback coordinates centered around Nairobi with offset per item index
    return {
      latitude: -1.2921 + (index * 0.015) - 0.02,
      longitude: 36.8219 + (index * 0.015) - 0.02,
    };
  }, []);

  const initialRegion = useMemo(() => {
    if (properties.length > 0) {
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      let validCount = 0;

      properties.forEach((p, index) => {
        const coords = getPropertyCoords(p, index);
        if (coords?.latitude && coords?.longitude) {
          minLat = Math.min(minLat, coords.latitude);
          maxLat = Math.max(maxLat, coords.latitude);
          minLng = Math.min(minLng, coords.longitude);
          maxLng = Math.max(maxLng, coords.longitude);
          validCount++;
        }
      });

      if (validCount > 0) {
        const midLat = (minLat + maxLat) / 2;
        const midLng = (minLng + maxLng) / 2;
        const latDelta = Math.max(0.04, (maxLat - minLat) * 1.3);
        const lngDelta = Math.max(0.04, (maxLng - minLng) * 1.3);
        return {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: Math.min(latDelta, 0.4),
          longitudeDelta: Math.min(lngDelta, 0.4),
        };
      }
    }
    return {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }, [properties, getPropertyCoords]);

  const handleFitAllMarkers = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 600);
    }
  };

  const toggleMapLayer = () => {
    const nextLayer = mapLayer === 'detailed' ? 'satellite' : mapLayer === 'satellite' ? 'osm' : 'detailed';
    setMapLayer(nextLayer);
    if (mapRef.current?.setLayer) {
      mapRef.current.setLayer(nextLayer);
    }
  };

  const handleMarkerSelect = (item) => {
    setSelectedProperty(item);
    const coords = getPropertyCoords(item);
    if (mapRef.current && coords) {
      mapRef.current.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  // Safe Native Map Pin Pointer
  const renderNativeMarkers = () => {
    if (Platform.OS === 'web') return null;
    let MarkerComponent = null;
    try {
      const maps = require('react-native-maps');
      MarkerComponent = maps.Marker;
    } catch {
      return null;
    }
    if (!MarkerComponent) return null;

    return properties.map((item, index) => {
      const coords = getPropertyCoords(item, index);
      const isSelected = (selectedProperty?._id || selectedProperty?.id);
      const isCurrent = isSelected === (item._id || item.id);
      const badge = getPropertyBadge(item);
      
      return (
        <MarkerComponent
          key={`native-map-item-${item._id || item.id || index}`}
          coordinate={coords}
          anchor={{ x: 0.5, y: 1.0 }}
          onPress={(e) => {
            if (e && e.stopPropagation) e.stopPropagation();
            handleMarkerSelect(item);
          }}
          tracksViewChanges={false}
        >
          <View style={styles.nativePointerContainer}>
            <Surface
              style={[
                styles.pointerBubble,
                {
                  backgroundColor: isCurrent ? theme.colors.primary : theme.colors.surface,
                  borderColor: isCurrent ? '#FFFFFF' : theme.colors.primary,
                },
              ]}
            >
              <Ionicons 
                name={badge.ionicon} 
                size={11} 
                color={isCurrent ? '#FFFFFF' : theme.colors.primary} 
                style={{ marginRight: 4 }} 
              />
              <Text
                style={[
                  styles.markerBadgeText,
                  { color: isCurrent ? '#FFFFFF' : theme.colors.text },
                ]}
              >
                {badge.label}
              </Text>
            </Surface>
            <View style={[styles.pointerStem, { borderTopColor: isCurrent ? theme.colors.primary : theme.colors.primary }]} />
            <View style={[styles.pointerDot, { backgroundColor: isCurrent ? theme.colors.primary : theme.colors.primary }]} />
          </View>
        </MarkerComponent>
      );
    });
  };

  // ─── FULLSCREEN MAP MODE ───
  if (viewMode === 'map') {
    return (
      <View style={styles.fullscreenContainer}>
        <OSMMapView
          ref={mapRef}
          initialRegion={initialRegion}
          style={StyleSheet.absoluteFill}
          properties={properties}
          selectedProperty={selectedProperty}
          onSelectProperty={handleMarkerSelect}
          onPress={() => setSelectedProperty(null)}
          mapLayer={mapLayer}
        >
          {renderNativeMarkers()}
        </OSMMapView>

        {/* Floating back button – top-left, over the map */}
        <SafeAreaView style={styles.mapOverlayTop} pointerEvents="box-none">
          <View style={styles.mapTopRow} pointerEvents="box-none">
            <TouchableOpacity
              onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
              style={[styles.mapBackButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            {/* Right-side controls */}
            <View style={styles.mapTopRight}>
              <TouchableOpacity
                style={[styles.floatingButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => {
                  setViewMode('list');
                  setSelectedProperty(null);
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Switch to list view"
              >
                <Ionicons name="list" size={16} color={theme.colors.primary} />
                <Text style={[styles.floatingButtonText, { color: theme.colors.primary }]}>List</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.floatingButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={toggleMapLayer}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Toggle map style"
              >
                <Ionicons 
                  name={mapLayer === 'satellite' ? 'earth' : mapLayer === 'osm' ? 'compass' : 'map'} 
                  size={16} 
                  color={theme.colors.primary} 
                />
                <Text style={[styles.floatingButtonText, { color: theme.colors.primary }]}>
                  {mapLayer === 'detailed' ? 'Streets' : mapLayer === 'satellite' ? 'Satellite' : 'OSM'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        {/* Bottom-left floating actions */}
        <View style={styles.mapBottomControls} pointerEvents="box-none">
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={[styles.floatingButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={handleFitAllMarkers}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Fit all properties"
            >
              <Ionicons name="expand-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.floatingButtonText, { color: theme.colors.primary }]}>Fit All</Text>
            </TouchableOpacity>

            <Surface style={[styles.countBadge, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <Ionicons name="location" size={13} color={theme.colors.primary} />
              <Text style={[styles.countBadgeText, { color: theme.colors.text }]}>
                {properties.length} {properties.length === 1 ? 'place' : 'places'}
              </Text>
            </Surface>
          </View>
        </View>

        {/* Selected property card */}
        {selectedProperty && (
          <View style={styles.cardContainer}>
            <PropertyMapCard
              property={selectedProperty}
              onClose={() => setSelectedProperty(null)}
              onViewDetails={() => router.push(`/property/${selectedProperty._id || selectedProperty.id}`)}
              onGetDirections={() => {
                const coords = getPropertyCoords(selectedProperty, 0);
                router.push({
                  pathname: '/map',
                  params: {
                    id: selectedProperty._id || selectedProperty.id,
                    lat: String(coords.latitude),
                    lng: String(coords.longitude),
                    title: selectedProperty.title,
                  },
                });
              }}
            />
          </View>
        )}
      </View>
    );
  }

  // ─── LIST / LOADING MODE ───
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/home')}
          style={[styles.backButton, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Search</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Find your perfect property in Kenya</Text>
          {usingFallback && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
              Showing sample data - backend offline
            </Text>
          )}
        </View>
      </View>

      <HeroSearch onSearch={(p) => loadProperties(p, 1, false)} />

      <View style={styles.toolbar}>
        <MapToggle viewMode={viewMode} onToggle={(mode) => {
          setViewMode(mode);
          setSelectedProperty(null);
        }} />
      </View>

      <SectionHeader title={`${resultsCount} Results`} />

      {loading && properties.length === 0 ? (
        <FlatList
          data={SKELETON_ITEMS}
          keyExtractor={(item) => `skeleton-${item}`}
          key={`skeleton-grid-${numColumns}`}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
          contentContainerStyle={[styles.listContent, numColumns > 1 && { paddingHorizontal: 12 }]}
          showsVerticalScrollIndicator={false}
          renderItem={() => (
            <View style={numColumns > 1 ? { flex: 1, marginHorizontal: 4 } : null}>
              <PropertyCardSkeleton compact={numColumns > 1} />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item, index) => (item._id || item.id || index).toString()}
          key={`property-list-${numColumns}`}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
          contentContainerStyle={[styles.listContent, numColumns > 1 && { paddingHorizontal: 12 }]}
          showsVerticalScrollIndicator={false}
          initialNumToRender={numColumns * 3}
          maxToRenderPerBatch={numColumns * 2}
          windowSize={7}
          updateCellsBatchingPeriod={20}
          removeClippedSubviews={Platform.OS !== 'web'}
          renderItem={({ item, index }) => (
            <View style={numColumns > 1 ? { flex: 1, marginHorizontal: 4 } : null}>
              <PropertyCard
                property={item}
                index={index}
                onPress={() => router.push(`/property/${item._id || item.id}`)}
                onFavorite={(p) => dispatch(toggleFavouriteAction(p))}
                compact={numColumns > 1}
              />
            </View>
          )}
          onEndReached={loadMoreProperties}
          onEndReachedThreshold={0.8}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : (
              <View style={{ height: 24 }} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  nativePointerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.25)',
  },
  pointerStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2563eb',
    marginTop: -1,
  },
  pointerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#2563eb',
    borderWidth: 1,
    borderColor: '#ffffff',
    marginTop: -2,
  },
  markerPriceText: {
    fontSize: 11,
    fontWeight: '800',
  },
  floatingControls: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 15,
    pointerEvents: 'box-none',
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    borderWidth: 1,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
  floatingButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.15)',
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  fullscreenContainer: {
    flex: 1,
    position: 'relative',
  },
  mapOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    pointerEvents: 'box-none',
  },
  mapTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    pointerEvents: 'box-none',
  },
  mapBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.3)',
  },
  mapTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    pointerEvents: 'box-none',
  },
  mapBottomControls: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    zIndex: 15,
    pointerEvents: 'box-none',
  },
  markerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 0,
  },
});
