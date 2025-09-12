import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const HeatmapLayer = ({ points, show }) => {
  const map = useMap();

  useEffect(() => {
    if (!show || !points || points.length === 0) return;

    // Convert points to the format expected by leaflet.heat
    const heatData = points.map(point => [point.lat, point.lng, point.intensity]);

    // Create heat layer
    const heat = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.4: 'blue',
        0.6: 'cyan',
        0.7: 'lime',
        0.8: 'yellow',
        1.0: 'red'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [map, points, show]);

  return null;
};

export default HeatmapLayer;