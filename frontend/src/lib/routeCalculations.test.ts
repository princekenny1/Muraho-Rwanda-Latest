import { describe, it, expect } from "vitest";
import {
  haversineDistance,
  calculateRouteDistance,
  estimateTravelDuration,
  calculateTotalDuration,
  formatDistance,
  formatDuration,
} from "./routeCalculations";

describe("haversineDistance", () => {
  it("calculates distance between two nearby points", () => {
    // Kigali coordinates (approximately)
    const lat1 = -1.9403;
    const lon1 = 29.8739;
    // A point roughly 10km away
    const lat2 = -1.8503;
    const lon2 = 29.8739;
    
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    expect(distance).toBeGreaterThan(9);
    expect(distance).toBeLessThan(11);
  });

  it("returns 0 for same coordinates", () => {
    const distance = haversineDistance(-1.9403, 29.8739, -1.9403, 29.8739);
    expect(distance).toBe(0);
  });

  it("calculates long distance correctly", () => {
    // Kigali to London (approximately 6500 km)
    const distance = haversineDistance(-1.9403, 29.8739, 51.5074, -0.1278);
    expect(distance).toBeGreaterThan(6000);
    expect(distance).toBeLessThan(7000);
  });
});

describe("calculateRouteDistance", () => {
  it("returns 0 for less than 2 stops", () => {
    expect(calculateRouteDistance([])).toBe(0);
    expect(calculateRouteDistance([{ latitude: -1.9403, longitude: 29.8739, stop_order: 1 }])).toBe(0);
  });

  it("calculates distance for multiple stops in order", () => {
    const stops = [
      { latitude: -1.9403, longitude: 29.8739, stop_order: 1 },
      { latitude: -1.9303, longitude: 29.8739, stop_order: 2 },
      { latitude: -1.9203, longitude: 29.8739, stop_order: 3 },
    ];
    
    const distance = calculateRouteDistance(stops);
    expect(distance).toBeGreaterThan(2);
    expect(distance).toBeLessThan(3);
  });

  it("sorts stops by order before calculating", () => {
    const stops = [
      { latitude: -1.9203, longitude: 29.8739, stop_order: 3 },
      { latitude: -1.9403, longitude: 29.8739, stop_order: 1 },
      { latitude: -1.9303, longitude: 29.8739, stop_order: 2 },
    ];
    
    const distance = calculateRouteDistance(stops);
    expect(distance).toBeGreaterThan(2);
    expect(distance).toBeLessThan(3);
  });
});

describe("estimateTravelDuration", () => {
  it("estimates walking duration correctly", () => {
    // 5 km at 5 km/h = 60 minutes
    const duration = estimateTravelDuration(5, "walking");
    expect(duration).toBe(60);
  });

  it("estimates driving duration correctly", () => {
    // 40 km at 40 km/h = 60 minutes
    const duration = estimateTravelDuration(40, "driving");
    expect(duration).toBe(60);
  });

  it("estimates cycling duration correctly", () => {
    // 15 km at 15 km/h = 60 minutes
    const duration = estimateTravelDuration(15, "cycling");
    expect(duration).toBe(60);
  });
});

describe("calculateTotalDuration", () => {
  it("combines travel time and stop time", () => {
    const stops = [
      { estimated_time_minutes: 30 },
      { estimated_time_minutes: 20 },
    ];
    
    // 40 km driving = 60 min travel + 50 min stops = 110 min
    const duration = calculateTotalDuration(40, stops, "driving");
    expect(duration).toBe(110);
  });

  it("uses default 15 min for null stop times", () => {
    const stops = [
      { estimated_time_minutes: null },
      { estimated_time_minutes: null },
    ];
    
    // 40 km driving = 60 min travel + 30 min stops = 90 min
    const duration = calculateTotalDuration(40, stops, "driving");
    expect(duration).toBe(90);
  });
});

describe("formatDistance", () => {
  it("formats small distances in meters", () => {
    expect(formatDistance(0.5)).toBe("500 m");
    expect(formatDistance(0.1)).toBe("100 m");
  });

  it("formats larger distances in kilometers", () => {
    expect(formatDistance(1.5)).toBe("1.5 km");
    expect(formatDistance(10.0)).toBe("10.0 km");
  });
});

describe("formatDuration", () => {
  it("formats short durations in minutes", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(59)).toBe("59 min");
  });

  it("formats longer durations with hours", () => {
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h 30min");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(150)).toBe("2h 30min");
  });
});
