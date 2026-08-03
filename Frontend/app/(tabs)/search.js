import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useTheme } from '../../Context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropertyCard from '../../Components/Property/PropertyCard';
import SectionHeader from '../../Components/Home/SectionHeader';
import MapToggle from '../../Components/Search/MapToggle';
import { HeroSearch } from '../../Components/Search/HeroSearch';
import PropertyService from '../../Services/api/propertyService';
import OSMMapView from '../../Components/Map/OSMMapView';
import PropertyMapCard from '../../Components/Map/PropertyMapCard';
import { useDispatch } from 'react-redux';
import { toggleFavourite as toggleFavouriteAction } from '../../store/slices/favouriteSlice';
import { formatPrice } from '../../Utils/helpers';

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
  const MapMarker = Platform.OS === 'web' ? View : require('react-native-maps').Marker;
  const { theme } = useTheme();
  const [properties, setProperties] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [resultsCount, setResultsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentParams, setCurrentParams] = useState({});
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  const getPropertyKey = (property, index) => (property?._id || property?.id || `property-${index}`).toString();

  const loadProperties = useCallback(async (params = {}, pageNum = 1, isLoadMore = false) => {
    if (isLoadMore && loadingMoreRef.current) return;
    const requestId = ++requestIdRef.current;

    if (isLoadMore) {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
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
    } catch (error) {
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
  }, []);

  const getPropertyCoords = (item, index) => {
    const lat = item?.location?.coordinates?.[1] || item?.coordinates?.[1] || item?.latitude;
    const lng = item?.location?.coordinates?.[0] || item?.coordinates?.[0] || item?.longitude;

    if (lat && lng) {
      return { latitude: Number(lat), longitude: Number(lng) };
    }
    // Default fallback coordinates centered around Nairobi with offset per item index
    return {
      latitude: -1.2921 + (index * 0.015) - 0.02,
      longitude: 36.8219 + (index * 0.015) - 0.02,
    };
  };

  const initialRegion = useMemo(() => {
    if (properties.length > 0) {
      const coords = getPropertyCoords(properties[0], 0);
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    return {
      latitude: -1.2921,
      longitude: 36.8219,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    };
  }, [properties]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Search</Text>
        <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>Find your perfect property in Kenya</Text>
        {usingFallback && (
          <Text style={{ color: theme.colors.error, fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
            Showing sample data - backend offline
          </Text>
        )}
      </View>

      <HeroSearch onSearch={(p) => loadProperties(p, 1, false)} />

      <View style={styles.toolbar}>
        <MapToggle viewMode={viewMode} onToggle={(mode) => {
          setViewMode(mode);
          setSelectedProperty(null);
        }} />
      </View>

      <SectionHeader title={`${resultsCount} Results`} />

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
          data={properties}
          keyExtractor={(item, index) => (item._id || item.id || index).toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <PropertyCard
              property={item}
              onPress={() => router.push(`/property/${item._id || item.id}`)}
              onFavorite={(p) => dispatch(toggleFavouriteAction(p))}
            />
          )}
          onEndReached={loadMoreProperties}
          onEndReachedThreshold={0.5}
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
      ) : (
        <View style={styles.mapContainer}>
          <OSMMapView
            initialRegion={initialRegion}
            style={styles.map}
            onPress={() => setSelectedProperty(null)}
          >
            {properties.map((item, index) => {
              const coords = getPropertyCoords(item, index);
              const isSelected = selectedProperty?._id || selectedProperty?.id;
              const isCurrent = isSelected === (item._id || item.id);
              
              return (
                <MapMarker
                  key={`map-item-${item._id || item.id || index}`}
                  coordinate={coords}
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedProperty(item);
                  }}
                >
                  <Surface
                    style={[
                      styles.markerBadge,
                      {
                        backgroundColor: isCurrent ? theme.colors.primary : theme.colors.surface,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.markerPriceText,
                        { color: isCurrent ? '#FFFFFF' : theme.colors.primary },
                      ]}
                    >
                      {formatPrice(item.price)}
                    </Text>
                  </Surface>
                </MapMarker>
              );
            })}
          </OSMMapView>

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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
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
  loader: {
    marginTop: 24,
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  markerPriceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
});
