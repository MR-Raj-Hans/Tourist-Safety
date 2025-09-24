import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import { FiMapPin, FiAlertTriangle, FiUser, FiShield } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});
const createCustomIcon = (color, iconType) => {
  const iconHtml = iconType === 'alert' 
    ? '<i class="fas fa-exclamation-triangle"></i>'
    : iconType === 'police'
    ? '<i class="fas fa-shield-alt"></i>'
    : '<i class="fas fa-map-marker-alt"></i>';

  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${iconHtml}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'custom-marker'
  });
};

const touristIcon = createCustomIcon('#3B82F6', 'tourist');
const alertIcon = createCustomIcon('#EF4444', 'alert');
const policeIcon = createCustomIcon('#059669', 'police');

const MapView = ({ 
  center = [28.6139, 77.2090],
  zoom = 13,
  alerts = [],
  tourists = [],
  policeOfficers = [],
  geoFences = [],
  userLocation = null,
  showAlerts = true,
  showTourists = true,
  showPolice = true,
  showGeoFences = true,
  onMarkerClick = null,
  height = '400px'
}) => {
  const [map, setMap] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (map && userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], zoom);
    }
  }, [map, userLocation, zoom]);

  const getAlertColor = (alertType, priority) => {
    if (priority === 'critical') return '#DC2626';
    if (priority === 'high') return '#EA580C';
    if (alertType === 'medical') return '#DC2626';
    if (alertType === 'panic') return '#B91C1C';
    if (alertType === 'crime') return '#C2410C';
    return '#EAB308';
  };

  const getFenceColor = (fenceType) => {
    switch (fenceType) {
      case 'safe_zone': return '#10B981';
      case 'restricted_zone': return '#EF4444';
      case 'tourist_area': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getFenceOpacity = (fenceType) => {
    switch (fenceType) {
      case 'restricted_zone': return 0.3;
      case 'safe_zone': return 0.2;
      default: return 0.15;
    }
  };

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-gray-300 touch-manipulation">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenCreated={setMap}
        touchZoom={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        tap={true}
        touchExtend={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User's current location */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={touristIcon}
          >
            <Popup className="touch-friendly-popup">
              <div className="text-center p-2">
                <FiUser className="h-4 w-4 sm:h-5 sm:w-5 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <div className="font-semibold text-sm sm:text-base">
                  {t('map.yourLocation', 'Your Location')}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 break-all">
                  {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                </div>
                {userLocation.accuracy && (
                  <div className="text-xs text-gray-500">
                    {t('map.accuracy', 'Accuracy')}: ±{userLocation.accuracy}m
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* User location accuracy circle */}
        {userLocation && userLocation.accuracy && (
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={userLocation.accuracy}
            pathOptions={{
              color: '#3B82F6',
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              weight: 1
            }}
          />
        )}

        {/* Alert markers */}
        {showAlerts && alerts.map((alert) => (
          <Marker
            key={`alert-${alert.id}`}
            position={[alert.latitude, alert.longitude]}
            icon={createCustomIcon(getAlertColor(alert.alert_type, alert.priority), 'alert')}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick('alert', alert)
            }}
          >
            <Popup>
              <div className="min-w-48">
                <div className="flex items-center mb-2">
                  <FiAlertTriangle className="h-4 w-4 mr-2 text-red-600" />
                  <span className="font-semibold text-red-800">
                    {t(`map.alertTypes.${alert.alert_type}`, alert.alert_type.toUpperCase())}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>{t('map.tourist', 'Tourist')}:</strong> {alert.tourist_name}
                  </div>
                  <div>
                    <strong>{t('map.priority', 'Priority')}:</strong> 
                    <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                      alert.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      alert.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <strong>{t('map.time', 'Time')}:</strong> {new Date(alert.created_at).toLocaleString()}
                  </div>
                  {alert.description && (
                    <div>
                      <strong>{t('map.description', 'Description')}:</strong> {alert.description}
                    </div>
                  )}
                  {alert.tourist_phone && (
                    <div>
                      <strong>{t('map.contact', 'Contact')}:</strong> {alert.tourist_phone}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tourist markers */}
        {showTourists && tourists.map((tourist) => (
          tourist.current_location && (
            <Marker
              key={`tourist-${tourist.id}`}
              position={[
                JSON.parse(tourist.current_location).latitude,
                JSON.parse(tourist.current_location).longitude
              ]}
              icon={touristIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick('tourist', tourist)
              }}
            >
              <Popup>
                <div className="min-w-48">
                  <div className="flex items-center mb-2">
                    <FiUser className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-semibold text-blue-800">
                      {t('map.tourist', 'Tourist')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>{t('map.name', 'Name')}:</strong> {tourist.name}
                    </div>
                    <div>
                      <strong>{t('map.nationality', 'Nationality')}:</strong> {tourist.nationality}
                    </div>
                    <div>
                      <strong>{t('map.status', 'Status')}:</strong> 
                      <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                        tourist.status === 'active' ? 'bg-green-100 text-green-800' :
                        tourist.status === 'emergency' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tourist.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {t('map.lastUpdate', 'Last Update')}: {
                        new Date(JSON.parse(tourist.current_location).timestamp).toLocaleString()
                      }
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Police officer markers */}
        {showPolice && policeOfficers.map((officer) => (
          officer.current_location && (
            <Marker
              key={`police-${officer.id}`}
              position={[
                JSON.parse(officer.current_location).latitude,
                JSON.parse(officer.current_location).longitude
              ]}
              icon={policeIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick('police', officer)
              }}
            >
              <Popup>
                <div className="min-w-48">
                  <div className="flex items-center mb-2">
                    <FiShield className="h-4 w-4 mr-2 text-green-600" />
                    <span className="font-semibold text-green-800">
                      {t('map.policeOfficer', 'Police Officer')}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>{t('map.name', 'Name')}:</strong> {officer.name}
                    </div>
                    <div>
                      <strong>{t('map.badge', 'Badge')}:</strong> {officer.badge_number}
                    </div>
                    <div>
                      <strong>{t('map.rank', 'Rank')}:</strong> {officer.rank}
                    </div>
                    <div>
                      <strong>{t('map.station', 'Station')}:</strong> {officer.station}
                    </div>
                    <div>
                      <strong>{t('map.status', 'Status')}:</strong> 
                      <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                        officer.status === 'on_duty' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {officer.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}

        {/* Geo-fences */}
        {showGeoFences && geoFences.map((fence) => {
          if (!fence.is_active) return null;
          
          const coordinates = fence.coordinates.map(coord => [coord.latitude, coord.longitude]);
          const color = getFenceColor(fence.fence_type);
          
          return (
            <Polygon
              key={`fence-${fence.id}`}
              positions={coordinates}
              pathOptions={{
                color: color,
                weight: 2,
                fillColor: color,
                fillOpacity: getFenceOpacity(fence.fence_type)
              }}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick('fence', fence)
              }}
            >
              <Popup>
                <div className="min-w-48">
                  <div className="flex items-center mb-2">
                    <FiMapPin className="h-4 w-4 mr-2" style={{ color }} />
                    <span className="font-semibold" style={{ color }}>
                      {t(`map.fenceTypes.${fence.fence_type}`, fence.fence_type.replace('_', ' ').toUpperCase())}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div>
                      <strong>{t('map.name', 'Name')}:</strong> {fence.name}
                    </div>
                    {fence.description && (
                      <div>
                        <strong>{t('map.description', 'Description')}:</strong> {fence.description}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {t('map.created', 'Created')}: {new Date(fence.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;