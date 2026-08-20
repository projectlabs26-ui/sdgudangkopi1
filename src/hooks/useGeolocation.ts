"use client";

import { useState, useCallback } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
  distance: number | null;
  isInRange: boolean | null;
}

export function useGeolocation(
  targetLat: number = -6.2088,
  targetLng: number = 106.8456,
  radiusMeters: number = 100
) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    distance: null,
    isInRange: null,
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCurrentPosition = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Browser tidak mendukung geolokasi",
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const dist = calculateDistance(latitude, longitude, targetLat, targetLng);
        const inRange = dist <= radiusMeters;

        setState({
          location: { latitude, longitude },
          error: null,
          loading: false,
          distance: Math.round(dist),
          isInRange: inRange,
        });
      },
      (error) => {
        let errorMessage = "Gagal mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Izin lokasi ditolak. Aktifkan di pengaturan browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Lokasi tidak tersedia";
            break;
          case error.TIMEOUT:
            errorMessage = "Request lokasi timeout";
            break;
        }
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [targetLat, targetLng, radiusMeters]);

  return { ...state, getCurrentPosition };
}
