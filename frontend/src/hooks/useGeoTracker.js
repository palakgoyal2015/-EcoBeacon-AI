import { useState, useRef, useCallback } from 'react';
import { haversineDistance, classifyTransportMode } from '../utils/geoTracking';

const SPEED_HISTORY_SIZE = 8; // rolling window for AI classifier
const MIN_MOVE_METERS = 5;    // ignore GPS jitter below this threshold

export default function useGeoTracker() {
  const [state, setState] = useState({
    status: 'idle',      // idle | requesting | tracking | stopped | error
    distanceKm: 0,
    currentSpeedKmh: 0,
    detectedMode: null,
    positions: [],
    errorMsg: '',
    duration: 0
  });

  const watchIdRef   = useRef(null);
  const lastPosRef   = useRef(null);
  const speedHistRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef     = useRef(null);

  const start = useCallback(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, status: 'error', errorMsg: 'Geolocation is not supported by your browser.' }));
      return;
    }

    setState(s => ({ ...s, status: 'requesting', errorMsg: '' }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lon, speed } = pos.coords;
        const now = Date.now();

        if (!startTimeRef.current) {
          startTimeRef.current = now;
          // Start duration timer
          timerRef.current = setInterval(() => {
            setState(s => ({ ...s, duration: Math.floor((Date.now() - startTimeRef.current) / 1000) }));
          }, 1000);
        }

        setState(prev => {
          let newDistanceKm = prev.distanceKm;

          if (lastPosRef.current) {
            const d = haversineDistance(
              lastPosRef.current.lat, lastPosRef.current.lon, lat, lon
            );
            // Only count if moved more than MIN_MOVE_METERS (filters GPS noise)
            if (d * 1000 >= MIN_MOVE_METERS) {
              newDistanceKm += d;
              lastPosRef.current = { lat, lon };
            }
          } else {
            lastPosRef.current = { lat, lon };
          }

          // Convert m/s → km/h; fallback to 0 if GPS doesn't provide speed
          const speedKmh = speed != null ? speed * 3.6 : 0;

          // Maintain rolling speed history for AI classifier
          speedHistRef.current = [
            ...speedHistRef.current.slice(-(SPEED_HISTORY_SIZE - 1)),
            speedKmh
          ];

          const detectedMode = classifyTransportMode(speedHistRef.current);

          return {
            ...prev,
            status: 'tracking',
            distanceKm: newDistanceKm,
            currentSpeedKmh: speedKmh,
            detectedMode,
            positions: [...prev.positions, { lat, lon, t: now }]
          };
        });
      },
      (err) => {
        const messages = {
          1: 'Location permission denied. Please allow location access.',
          2: 'Location unavailable. Check GPS signal.',
          3: 'Location request timed out.'
        };
        setState(s => ({
          ...s,
          status: 'error',
          errorMsg: messages[err.code] || 'Failed to get location.'
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    lastPosRef.current  = null;
    speedHistRef.current = [];
    startTimeRef.current = null;
    setState(s => ({ ...s, status: 'stopped' }));
  }, []);

  const reset = useCallback(() => {
    stop();
    setState({
      status: 'idle',
      distanceKm: 0,
      currentSpeedKmh: 0,
      detectedMode: null,
      positions: [],
      errorMsg: '',
      duration: 0
    });
  }, [stop]);

  return { ...state, start, stop, reset };
}
