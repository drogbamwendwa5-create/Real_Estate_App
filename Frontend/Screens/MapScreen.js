import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FAB, Surface, Text } from 'react-native-paper';
import { useTheme } from '../Context/ThemeContext';

import {
  fetchMapProperties,
  fetchNearbyAmenities,
  fetchHeatmap,
  fetchRoute,
  searchInPolygon,
  setRegion,
  setSelectedProperty,
  clearSelectedProperty,
  setActiveOverlay,
  togglePolygonDrawing,
  addPolygonPoint,
  clearPolygon,
  clearRoute,
} from '../store/slices/mapSlice';

// Map Components
import OSMMapView from '../Components/Map/OSMMapView';
import PropertyCluster from '../Components/Map/PropertyCluster';
import AmenityMarker from '../Components/Map/AmenityMarker';
import PropertyMapCard from '../Components/Map/PropertyMapCard';
import PremiumSearchBar from '../Components/Search/PremiumSearchBar';
import MapFilters from '../Components/Map/MapFilters';
import RouteOverlay from '../Components/Map/RouteOverlay';
import HeatmapOverlay from '../Components/Map/HeatmapOverlay';
import PolygonDrawer from '../Components/Map/PolygonDrawer';
import InvestmentScoreCard from '../Components/Map/InvestmentScoreCard';

const INITIAL_REGION = {
  latitude: -1.2921, // Nairobi CBD
  longitude: 36.8219,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapScreen = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const mapRef = useRef(null);
  const MapMarker = Platform.OS === 'web' ? View : require('react-native-maps').Marker;

  const {
    properties,
    clusters,
    selectedProperty,
    nearbyAmenities,
    route,
    heatmapData,
    region,
    filters,
    activeOverlay,
    isDrawingPolygon,
    polygonPoints,
    loading,
    error,
  } = useSelector((state) => state.map);

  const [currentRegion, setCurrentRegion] = useState(region || INITIAL_REGION);
  const [showSearchHere, setShowSearchHere] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    getCurrentLocation();
    if (!region) {
      dispatch(setRegion(INITIAL_REGION));
    }
    loadPropertiesInBounds(region || INITIAL_REGION);
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow location access to use this feature.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log('Error getting location', error);
    }
  };

  const loadPropertiesInBounds = (r) => {
    dispatch(fetchMapProperties({
      north: r.latitude + r.latitudeDelta / 2,
      south: r.latitude - r.latitudeDelta / 2,
      east: r.longitude + r.longitudeDelta / 2,
      west: r.longitude - r.longitudeDelta / 2,
      zoom: Math.max(1, Math.round(Math.log(360 / r.longitudeDelta) / Math.LN2)),
      ...filters,
    }));
  };

  const handleRegionChangeComplete = (newRegion) => {
    setCurrentRegion(newRegion);
    dispatch(setRegion(newRegion));
    setShowSearchHere(true);
    
    if (activeOverlay === 'heatmap') {
      const bounds = `${newRegion.longitude - newRegion.longitudeDelta / 2},${
        newRegion.latitude - newRegion.latitudeDelta / 2
      },${newRegion.longitude + newRegion.longitudeDelta / 2},${
        newRegion.latitude + newRegion.latitudeDelta / 2
      }`;
      const zoom = Math.round(Math.log(360 / newRegion.longitudeDelta) / Math.LN2);
      dispatch(fetchHeatmap({ bounds, type: 'price', zoom }));
    }
  };

  const handleSearchHere = () => {
    setShowSearchHere(false);
    loadPropertiesInBounds(currentRegion);
  };

  const handleMapPress = (e) => {
    if (isDrawingPolygon) {
      dispatch(addPolygonPoint(e.nativeEvent.coordinate));
    } else {
      dispatch(clearSelectedProperty());
    }
  };

  const handlePolygonComplete = () => {
    if (polygonPoints.length > 2) {
      dispatch(searchInPolygon({ polygon: polygonPoints, filters }));
    }
  };

  const handlePropertySelect = (property) => {
    dispatch(setSelectedProperty(property));
    if (activeOverlay === 'amenities' && property?.location?.coordinates) {
      dispatch(
        fetchNearbyAmenities({
          lat: property.location.coordinates[1],
          lng: property.location.coordinates[0],
          radius: 2000,
          types: ['school', 'hospital', 'mall'],
        })
      );
    }
  };

  const handleViewDetails = () => {
    if (selectedProperty?._id) {
      router.push(`/property/${selectedProperty._id}`);
    }
  };

  const handleGetDirections = () => {
    if (selectedProperty?.location?.coordinates && userLocation) {
      dispatch(
        fetchRoute({
          from: [userLocation.latitude, userLocation.longitude],
          to: [selectedProperty.location.coordinates[1], selectedProperty.location.coordinates[0]],
          profile: 'driving',
        })
      );
      dispatch(setActiveOverlay('route'));
    } else if (!userLocation) {
      Alert.alert('Location required', 'Please enable location services to get directions.');
      getCurrentLocation();
    }
  };

  const toggleOverlay = (overlay) => {
    if (activeOverlay === overlay) {
      dispatch(setActiveOverlay('none'));
    } else {
      dispatch(setActiveOverlay(overlay));
      if (overlay === 'heatmap') {
        const bounds = `${currentRegion.longitude - currentRegion.longitudeDelta / 2},${
          currentRegion.latitude - currentRegion.latitudeDelta / 2
        },${currentRegion.longitude + currentRegion.longitudeDelta / 2},${
          currentRegion.latitude + currentRegion.latitudeDelta / 2
        }`;
        dispatch(fetchHeatmap({ bounds, type: 'price', zoom: 12 }));
      }
    }
  };

  const togglePolygonMode = () => {
    dispatch(togglePolygonDrawing());
    if (!isDrawingPolygon) {
      dispatch(setActiveOverlay('polygon'));
    } else {
      dispatch(setActiveOverlay('none'));
    }
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      getCurrentLocation();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topOverlay, { zIndex: 10 }]}>
        <PremiumSearchBar
          onLocationSelect={(loc) => {
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: loc.lat,
                longitude: loc.lng,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              });
            }
          }}
        />
        <MapFilters />
      </View>

      <OSMMapView
        ref={mapRef}
        style={styles.map}
        initialRegion={currentRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        showsUserLocation={true}
      >
        {!isDrawingPolygon && activeOverlay !== 'heatmap' && (
          <>
            {clusters.map((cluster, index) => (
              <MapMarker
                key={`cluster-${cluster.id || index}`}
                coordinate={{ latitude: Number(cluster.lat), longitude: Number(cluster.lng) }}
                onPress={() => {
                  if (mapRef.current) {
                    mapRef.current.animateToRegion({
                      latitude: Number(cluster.lat),
                      longitude: Number(cluster.lng),
                      latitudeDelta: currentRegion.latitudeDelta / 2,
                      longitudeDelta: currentRegion.longitudeDelta / 2,
                    });
                  }
                }}
              >
                <PropertyCluster count={cluster.count} />
              </MapMarker>
            ))}
            {properties.map((property) => (
              <MapMarker
                key={`prop-${property._id}`}
                coordinate={{
                  latitude: property.location.coordinates[1],
                  longitude: property.location.coordinates[0],
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  handlePropertySelect(property);
                }}
              >
                <Surface style={[styles.markerSurface, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.markerText}>KES {property.price}</Text>
                </Surface>
              </MapMarker>
            ))}
          </>
        )}

        {activeOverlay === 'amenities' &&
          nearbyAmenities.map((amenity, index) => (
            <AmenityMarker key={`amenity-${index}`} amenity={amenity} />
          ))}

        {activeOverlay === 'heatmap' && heatmapData.length > 0 && (
          <HeatmapOverlay points={heatmapData} />
        )}

        {activeOverlay === 'route' && route && (
          <RouteOverlay route={route} />
        )}

        {isDrawingPolygon && (
          <PolygonDrawer
            points={polygonPoints}
            onComplete={handlePolygonComplete}
          />
        )}
      </OSMMapView>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
        </View>
      )}

      {showSearchHere && !loading && (
        <View style={styles.searchHereContainer}>
          <TouchableOpacity
            style={[styles.searchHereBtn, { backgroundColor: theme.colors.surface, shadowColor: theme.shadows?.md || '#000' }]}
            onPress={handleSearchHere}
          >
            <Ionicons name="search" size={16} color={theme.colors.primary} style={{ marginRight: theme.spacing?.xs || 4 }} />
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Search this area</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.actionButtonsContainer}>
        <FAB
          icon="school"
          style={[styles.fab, activeOverlay === 'amenities' && { backgroundColor: theme.colors.primary }]}
          color={activeOverlay === 'amenities' ? theme.colors.surface : theme.colors.text}
          onPress={() => toggleOverlay('amenities')}
          small
        />
        <FAB
          icon="fire"
          style={[styles.fab, activeOverlay === 'heatmap' && { backgroundColor: theme.colors.primary }]}
          color={activeOverlay === 'heatmap' ? theme.colors.surface : theme.colors.text}
          onPress={() => toggleOverlay('heatmap')}
          small
        />
        <FAB
          icon="crop"
          style={[styles.fab, isDrawingPolygon && { backgroundColor: theme.colors.primary }]}
          color={isDrawingPolygon ? theme.colors.surface : theme.colors.text}
          onPress={togglePolygonMode}
          small
        />
        <FAB
          icon="crosshairs-gps"
          style={styles.fab}
          color={theme.colors.text}
          onPress={centerOnUser}
          small
        />
      </View>

      {selectedProperty && (
        <View style={styles.bottomCardContainer}>
          <PropertyMapCard
            property={selectedProperty}
            onViewDetails={handleViewDetails}
            onGetDirections={handleGetDirections}
          />
          {activeOverlay === 'investment' && (
            <InvestmentScoreCard propertyId={selectedProperty._id} />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 20,
  },
  searchHereContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 140 : 120,
    alignSelf: 'center',
    zIndex: 10,
  },
  searchHereBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 16,
    top: '35%',
    zIndex: 10,
  },
  fab: {
    marginVertical: 8,
    backgroundColor: '#ffffff',
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  markerSurface: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default MapScreen;
