/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate the total distance of a route given an array of stops
 * @returns Total distance in kilometers
 */
export function calculateRouteDistance(
  stops: Array<{ latitude: number; longitude: number; stop_order: number }>
): number {
  if (stops.length < 2) return 0;

  // Sort stops by order
  const sortedStops = [...stops].sort((a, b) => a.stop_order - b.stop_order);
  
  let totalDistance = 0;
  for (let i = 0; i < sortedStops.length - 1; i++) {
    const current = sortedStops[i];
    const next = sortedStops[i + 1];
    totalDistance += haversineDistance(
      Number(current.latitude),
      Number(current.longitude),
      Number(next.latitude),
      Number(next.longitude)
    );
  }
  
  return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
}

/**
 * Estimate travel duration based on distance and mode
 * @param distanceKm Distance in kilometers
 * @param mode Travel mode (walking, driving, cycling)
 * @returns Duration in minutes
 */
export function estimateTravelDuration(
  distanceKm: number,
  mode: "walking" | "driving" | "cycling" = "driving"
): number {
  // Average speeds in km/h
  const speeds = {
    walking: 5,    // ~5 km/h walking
    cycling: 15,   // ~15 km/h cycling
    driving: 40,   // ~40 km/h urban driving (accounting for traffic, stops)
  };
  
  const speed = speeds[mode];
  const hours = distanceKm / speed;
  return Math.round(hours * 60); // Convert to minutes
}

/**
 * Calculate total route duration including stop time
 * @param distanceKm Total route distance
 * @param stops Array of stops with estimated time
 * @param travelMode Travel mode for between-stop travel
 * @returns Total duration in minutes
 */
export function calculateTotalDuration(
  distanceKm: number,
  stops: Array<{ estimated_time_minutes: number | null }>,
  travelMode: "walking" | "driving" | "cycling" = "driving"
): number {
  const travelTime = estimateTravelDuration(distanceKm, travelMode);
  const stopTime = stops.reduce(
    (total, stop) => total + (stop.estimated_time_minutes || 15),
    0
  );
  return travelTime + stopTime;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}
