// Haversine formula — distance between two GPS points in km
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// AI speed-based transport mode classifier
// Uses a weighted average of recent speeds to reduce GPS noise
export const classifyTransportMode = (speedHistory = []) => {
  if (speedHistory.length === 0) return null;

  // Weight recent readings more heavily
  const weighted = speedHistory.map((s, i) => s * (i + 1));
  const avgSpeed = weighted.reduce((a, b) => a + b, 0) /
    speedHistory.map((_, i) => i + 1).reduce((a, b) => a + b, 0);

  if (avgSpeed < 1)   return { mode: 'walking',      label: 'Stationary',     icon: '🧍', color: 'text-slate-400' };
  if (avgSpeed < 7)   return { mode: 'walking',      label: 'Walking',         icon: '🚶', color: 'text-eco-400' };
  if (avgSpeed < 25)  return { mode: 'bike',         label: 'Cycling',         icon: '🚴', color: 'text-blue-400' };
  if (avgSpeed < 60)  return { mode: 'bus',          label: 'Bus / City Drive', icon: '🚌', color: 'text-amber-400' };
  if (avgSpeed < 130) return { mode: 'car',          label: 'Car',             icon: '🚗', color: 'text-orange-400' };
  if (avgSpeed < 350) return { mode: 'train',        label: 'Train',           icon: '🚂', color: 'text-purple-400' };
  return               { mode: 'flight',             label: 'Flight',          icon: '✈️', color: 'text-red-400' };
};

export const formatDistance = (km) => {
  if (km < 1) return `${(km * 1000).toFixed(0)} m`;
  return `${km.toFixed(2)} km`;
};

export const formatSpeed = (kmh) => `${kmh.toFixed(1)} km/h`;
