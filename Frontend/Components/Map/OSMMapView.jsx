import React, { forwardRef, useEffect, useRef, useImperativeHandle, useCallback, useState } from 'react';
import { StyleSheet, View, Platform, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';
import { formatPrice } from '../../Utils/helpers';

const DEFAULT_REGION = {
  latitude: -1.2921,
  longitude: 36.8219,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export const CARTO_API_ENDPOINT = 'https://gcp-europe-west1.api.carto.com/mcp/ac_be5k43cc';

// Free map tile providers — no API key required
export const MAP_LAYERS = {
  detailed: {
    name: 'Detailed Streets',
    icon: 'map-outline',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: [],
    maxZoom: 19,
    attribution: '',
  },
  satellite: {
    name: 'Satellite Aerial',
    icon: 'earth-outline',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: [],
    maxZoom: 19,
    attribution: '',
  },
  osm: {
    name: 'Topo Map',
    icon: 'compass-outline',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 17,
    attribution: '',
  },
};

/**
 * Returns a friendly property badge with category icon and property type/beds
 * (e.g. 🏰 5 Bed Villa, 🏢 2 Bed Apt, 🏡 3 Bed House, 📍 Land)
 */
export const getPropertyBadge = (item) => {
  const type = (item?.propertyType || item?.type || '').toLowerCase();
  const bedrooms = item?.bedrooms;
  const title = (item?.title || '').toLowerCase();

  let icon = '🏠';
  let ionicon = 'home';
  let label = 'Property';

  if (type.includes('villa') || title.includes('villa')) {
    icon = '🏰';
    ionicon = 'business';
    label = bedrooms ? `${bedrooms} Bed Villa` : 'Villa';
  } else if (type.includes('apartment') || type.includes('flat') || title.includes('apartment') || title.includes('apt')) {
    icon = '🏢';
    ionicon = 'business';
    label = bedrooms ? `${bedrooms} Bed Apt` : 'Apartment';
  } else if (type.includes('house') || type.includes('townhouse') || type.includes('home') || title.includes('home') || title.includes('house')) {
    icon = '🏡';
    ionicon = 'home';
    label = bedrooms ? `${bedrooms} Bed House` : 'House';
  } else if (type.includes('condo') || title.includes('condo')) {
    icon = '🏙️';
    ionicon = 'business';
    label = bedrooms ? `${bedrooms} Bed Condo` : 'Condo';
  } else if (type.includes('commercial') || type.includes('office') || title.includes('office') || title.includes('commercial')) {
    icon = '🏬';
    ionicon = 'briefcase';
    label = 'Commercial';
  } else if (type.includes('land') || type.includes('plot') || title.includes('land') || title.includes('plot')) {
    icon = '📍';
    ionicon = 'map';
    label = 'Land Plot';
  } else {
    label = bedrooms ? `${bedrooms} Beds` : (item?.propertyType ? item.propertyType.charAt(0).toUpperCase() + item.propertyType.slice(1) : 'Property');
  }

  return { icon, ionicon, label };
};

const getCoords = (item, index = 0) => {
  const lat = item?.location?.coordinates?.[1] ?? item?.coordinates?.[1] ?? item?.latitude;
  const lng = item?.location?.coordinates?.[0] ?? item?.coordinates?.[0] ?? item?.longitude;

  if (lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
    return { latitude: Number(lat), longitude: Number(lng) };
  }
  return {
    latitude: -1.2921 + (index * 0.015) - 0.02,
    longitude: 36.8219 + (index * 0.015) - 0.02,
  };
};

/**
 * High-Detail Cross-Platform Map component with clean UI (no watermarks) and precise location pointers
 * Native: Uses react-native-maps with CARTO Voyager / High-Detail OSM tile overlay
 * Web: Uses interactive Leaflet with high-resolution tiles, pointer stems, and layer toggles
 */
const OSMMapView = forwardRef(function OSMMapView({
  initialRegion = DEFAULT_REGION,
  onRegionChange,
  onPress,
  children,
  style,
  showsUserLocation,
  mapRef: propMapRef,
  properties = [],
  selectedProperty = null,
  onSelectProperty,
  mapLayer = 'detailed', // 'detailed' | 'satellite' | 'osm'
  onLayerChange,
}, forwardedRef) {
  const { theme, isDark } = useTheme();
  const isWeb = Platform.OS === 'web';
  const [currentLayer, setCurrentLayer] = useState(mapLayer);
  const internalRef = useRef(null);
  const iframeRef = useRef(null);

  // Sync external mapLayer prop
  useEffect(() => {
    if (mapLayer && mapLayer !== currentLayer) {
      setCurrentLayer(mapLayer);
    }
  }, [mapLayer]);

  // Expose imperative map controls (animateToRegion, fitToCoordinates, setLayer)
  useImperativeHandle(forwardedRef || propMapRef, () => ({
    animateToRegion: (region, duration = 500) => {
      if (isWeb) {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({
              type: 'SET_VIEW',
              latitude: region.latitude,
              longitude: region.longitude,
              zoom: region.latitudeDelta ? Math.round(Math.log2(360 / region.latitudeDelta)) : 14,
            }),
            '*'
          );
        }
      } else if (internalRef.current?.animateToRegion) {
        internalRef.current.animateToRegion(region, duration);
      }
    },
    fitToCoordinates: (coordinates, options) => {
      if (isWeb) {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ type: 'FIT_BOUNDS', coordinates }),
            '*'
          );
        }
      } else if (internalRef.current?.fitToCoordinates) {
        internalRef.current.fitToCoordinates(coordinates, options);
      }
    },
    setLayer: (layerKey) => {
      setCurrentLayer(layerKey);
      if (isWeb && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ type: 'SWITCH_LAYER', layer: layerKey }),
          '*'
        );
      }
    },
  }));

  // Handle messages from Web Leaflet iframe
  const handleWebMessage = useCallback((event) => {
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!data || typeof data !== 'object') return;

      if (data.type === 'PROPERTY_SELECTED') {
        const found = properties.find((p, index) => {
          const key = (p?._id || p?.id || index).toString();
          return key === String(data.id);
        });
        if (found && onSelectProperty) {
          onSelectProperty(found);
        }
      } else if (data.type === 'MAP_CLICK') {
        if (onPress) onPress();
      } else if (data.type === 'REGION_CHANGED') {
        if (onRegionChange) {
          onRegionChange({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: data.latitudeDelta || 0.05,
            longitudeDelta: data.longitudeDelta || 0.05,
          });
        }
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, [properties, onSelectProperty, onPress, onRegionChange]);

  useEffect(() => {
    if (!isWeb) return;
    window.addEventListener('message', handleWebMessage);
    return () => {
      window.removeEventListener('message', handleWebMessage);
    };
  }, [isWeb, handleWebMessage]);

  // Sync selectedProperty highlight to Web iframe
  useEffect(() => {
    if (!isWeb || !iframeRef.current?.contentWindow) return;
    const selectedId = selectedProperty?._id || selectedProperty?.id;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ type: 'UPDATE_SELECTED', selectedId: selectedId ? String(selectedId) : null }),
      '*'
    );
  }, [isWeb, selectedProperty]);

  // Sync layer switch to Web iframe
  useEffect(() => {
    if (!isWeb || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ type: 'SWITCH_LAYER', layer: currentLayer }),
      '*'
    );
  }, [isWeb, currentLayer]);

  if (isWeb) {
    const centerLat = initialRegion?.latitude ?? DEFAULT_REGION.latitude;
    const centerLng = initialRegion?.longitude ?? DEFAULT_REGION.longitude;
    const zoomLevel = initialRegion?.latitudeDelta
      ? Math.max(9, Math.min(18, Math.round(Math.log2(360 / initialRegion.latitudeDelta))))
      : 14;

    const markersData = properties.map((item, index) => {
      const coords = getCoords(item, index);
      const id = (item?._id || item?.id || index).toString();
      const badge = getPropertyBadge(item);
      const title = (item?.title || 'Property').replace(/"/g, '&quot;');
      const isSelected = (selectedProperty?._id || selectedProperty?.id)?.toString() === id;

      return {
        id,
        lat: coords.latitude,
        lng: coords.longitude,
        badgeIcon: badge.icon,
        badgeLabel: badge.label,
        title,
        isSelected,
      };
    });

    const primaryColor = theme?.colors?.primary || '#2563eb';
    const surfaceColor = theme?.colors?.surface || '#ffffff';
    const textColor = theme?.colors?.text || '#1e293b';
    const bgColor = theme?.colors?.background || '#f8fafc';

    const leafletHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: ${bgColor}; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; overflow: hidden; }
    #map { width: 100%; height: 100%; }
    
    /* Clean UI: Strip all watermarks, logos, and attribution boxes */
    .leaflet-control-attribution,
    .leaflet-control-container .leaflet-bottom,
    .leaflet-control-container .leaflet-bottom.leaflet-right,
    .leaflet-attribution-flag {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
      height: 0 !important;
      width: 0 !important;
    }
    
    /* Custom Pin Pointer Styling */
    .custom-pointer-wrapper {
      background: transparent !important;
      border: none !important;
    }
    .property-pointer {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -100%);
      cursor: pointer;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
      transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      user-select: none;
    }
    .property-pointer:hover {
      transform: translate(-50%, -100%) scale(1.15);
      z-index: 1000 !important;
    }
    .property-pointer.active-selected {
      transform: translate(-50%, -100%) scale(1.22) !important;
      z-index: 2000 !important;
      filter: drop-shadow(0 8px 18px rgba(37,99,235,0.55));
    }
    .pointer-bubble {
      background: ${surfaceColor};
      color: ${textColor};
      border: 2px solid ${primaryColor};
      padding: 4px 9px;
      border-radius: 14px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 5px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
    }
    .property-pointer.active-selected .pointer-bubble {
      background: ${primaryColor};
      color: #ffffff;
      border-color: #ffffff;
    }
    .pointer-icon {
      font-size: 13px;
    }
    .pointer-stem {
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid ${primaryColor};
      margin-top: -1px;
    }
    .pointer-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${primaryColor};
      border: 1.5px solid #ffffff;
      margin-top: -3px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
    .pointer-pulse {
      position: absolute;
      bottom: -6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: rgba(37,99,235,0.4);
      animation: pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      display: none;
      pointer-events: none;
    }
    .property-pointer.active-selected .pointer-pulse {
      display: block;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.4); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${centerLat}, ${centerLng}],
      zoom: ${zoomLevel},
      zoomControl: true,
      attributionControl: false
    });

    var layerDefinitions = ${JSON.stringify(MAP_LAYERS)};
    var currentTileLayer = null;

    function setMapTileLayer(layerKey) {
      if (currentTileLayer) {
        map.removeLayer(currentTileLayer);
      }
      var config = layerDefinitions[layerKey] || layerDefinitions.detailed;
      currentTileLayer = L.tileLayer(config.url, {
        maxZoom: config.maxZoom || 19,
        subdomains: config.subdomains || ['a', 'b', 'c', 'd'],
        attribution: ''
      }).addTo(map);
    }

    setMapTileLayer('${currentLayer}');

    var markersMap = {};
    var markerGroup = L.featureGroup().addTo(map);
    var rawMarkers = ${JSON.stringify(markersData)};

    function renderMarkers(dataList) {
      markerGroup.clearLayers();
      markersMap = {};

      dataList.forEach(function(item) {
        var iconHtml = '<div class="property-pointer' + (item.isSelected ? ' active-selected' : '') + '" id="pointer-' + item.id + '">' +
          '<div class="pointer-bubble"><span class="pointer-icon">' + item.badgeIcon + '</span><span>' + item.badgeLabel + '</span></div>' +
          '<div class="pointer-stem"></div>' +
          '<div class="pointer-dot"></div>' +
          '<div class="pointer-pulse"></div>' +
        '</div>';

        var customIcon = L.divIcon({
          className: 'custom-pointer-wrapper',
          html: iconHtml,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        var m = L.marker([item.lat, item.lng], { icon: customIcon }).addTo(markerGroup);
        m.on('click', function(e) {
          L.DomEvent.stopPropagation(e);
          window.parent.postMessage(JSON.stringify({ type: 'PROPERTY_SELECTED', id: item.id }), '*');
        });
        markersMap[item.id] = m;
      });

      if (dataList.length > 1) {
        map.fitBounds(markerGroup.getBounds().pad(0.12));
      }
    }

    renderMarkers(rawMarkers);

    map.on('click', function() {
      window.parent.postMessage(JSON.stringify({ type: 'MAP_CLICK' }), '*');
    });

    map.on('moveend', function() {
      var center = map.getCenter();
      var bounds = map.getBounds();
      window.parent.postMessage(JSON.stringify({
        type: 'REGION_CHANGED',
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: Math.abs(bounds.getNorth() - bounds.getSouth()),
        longitudeDelta: Math.abs(bounds.getEast() - bounds.getWest())
      }), '*');
    });

    window.addEventListener('message', function(event) {
      try {
        var msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!msg) return;

        if (msg.type === 'UPDATE_SELECTED') {
          var selId = msg.selectedId;
          Object.keys(markersMap).forEach(function(id) {
            var el = document.getElementById('pointer-' + id);
            if (el) {
              if (selId && id === selId) {
                el.classList.add('active-selected');
              } else {
                el.classList.remove('active-selected');
              }
            }
          });
        } else if (msg.type === 'SWITCH_LAYER') {
          setMapTileLayer(msg.layer);
        } else if (msg.type === 'SET_VIEW') {
          map.setView([msg.latitude, msg.longitude], msg.zoom || map.getZoom());
        } else if (msg.type === 'FIT_BOUNDS' && msg.coordinates && msg.coordinates.length > 0) {
          var bounds = msg.coordinates.map(function(c) { return [c.latitude, c.longitude]; });
          map.fitBounds(bounds, { padding: [30, 30] });
        }
      } catch(e) {}
    });
  </script>
</body>
</html>`;

    return (
      <View style={[styles.container, style]}>
        <iframe
          ref={iframeRef}
          srcDoc={leafletHtml}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Clean High-Detail Map View"
        />
      </View>
    );
  }

  // Native iOS / Android MapView implementation
  let MapViewComponent = View;
  let UrlTileComponent = null;
  try {
    const maps = require('react-native-maps');
    MapViewComponent = maps.default || maps;
    UrlTileComponent = maps.UrlTile;
  } catch {
    MapViewComponent = View;
  }

  const activeLayerConfig = MAP_LAYERS[currentLayer] || MAP_LAYERS.detailed;

  return (
    <View style={[styles.container, style]}>
      <MapViewComponent
        ref={(ref) => {
          internalRef.current = ref;
          if (typeof forwardedRef === 'function') forwardedRef(ref);
          else if (forwardedRef) forwardedRef.current = ref;
          if (propMapRef) propMapRef.current = ref;
        }}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={onRegionChange}
        onPress={onPress}
        showsUserLocation={showsUserLocation}
        mapType={currentLayer === 'satellite' ? 'hybrid' : 'standard'}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {UrlTileComponent && currentLayer !== 'satellite' && (
          <UrlTileComponent
            urlTemplate={activeLayerConfig.url}
            maximumZ={activeLayerConfig.maxZoom || 19}
            flipY={false}
          />
        )}
        {children}
      </MapViewComponent>
    </View>
  );
});

export default OSMMapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
