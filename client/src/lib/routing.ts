export interface TrafficZone {
  lat: number;
  lng: number;
  radius: number; // in kilometers
  factor: number; // traffic multiplier
  name: string;
}

export interface RouteInfo {
  coordinates: [number, number][];
  distance: number;
  estimated_time: number;
  traffic_factor: number;
  instructions?: string[];
}

// Chennai traffic congestion zones from requirements
export const CHENNAI_TRAFFIC_ZONES: TrafficZone[] = [
  {
    lat: 13.0418,
    lng: 80.2341,
    radius: 2,
    factor: 1.5,
    name: 'T. Nagar Commercial Area'
  },
  {
    lat: 13.0605,
    lng: 80.2496,
    radius: 1.5,
    factor: 1.3,
    name: 'Anna Salai Corridor'
  },
  {
    lat: 13.0493,
    lng: 80.2137,
    radius: 1,
    factor: 1.2,
    name: 'Vadapalani Junction'
  },
  {
    lat: 12.9915,
    lng: 80.2207,
    radius: 2.5,
    factor: 1.4,
    name: 'Guindy Industrial Area'
  },
  {
    lat: 13.0358,
    lng: 80.1565,
    radius: 3,
    factor: 1.3,
    name: 'Porur IT Corridor'
  }
];

export function getCurrentTrafficMultiplier(): number {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeDecimal = hour + minute / 60;
  const dayOfWeek = now.getDay();

  // Morning Rush: 8:00 AM - 10:30 AM (multiplier: 1.8x travel time)
  if (timeDecimal >= 8 && timeDecimal <= 10.5) {
    return 1.8;
  }
  
  // Evening Rush: 6:00 PM - 9:00 PM (multiplier: 2.2x travel time)
  if (timeDecimal >= 18 && timeDecimal <= 21) {
    return 2.2;
  }
  
  // Lunch Rush: 12:30 PM - 2:00 PM (multiplier: 1.4x travel time)
  if (timeDecimal >= 12.5 && timeDecimal <= 14) {
    return 1.4;
  }
  
  // Weekend Evenings: Saturday 7:00 PM - 10:00 PM (multiplier: 1.6x travel time)
  if (dayOfWeek === 6 && timeDecimal >= 19 && timeDecimal <= 22) {
    return 1.6;
  }
  
  return 1.0; // Normal traffic
}

export function getCongestionFactor(lat: number, lng: number): number {
  for (const zone of CHENNAI_TRAFFIC_ZONES) {
    const distance = calculateDistance(lat, lng, zone.lat, zone.lng);
    if (distance <= zone.radius) {
      return zone.factor;
    }
  }
  return 1.0;
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI/180);
}

export function getTrafficZoneStatus(lat: number, lng: number): { zone: TrafficZone | null; status: 'light' | 'moderate' | 'heavy' } {
  const zone = CHENNAI_TRAFFIC_ZONES.find(z => {
    const distance = calculateDistance(lat, lng, z.lat, z.lng);
    return distance <= z.radius;
  });

  if (!zone) {
    return { zone: null, status: 'light' };
  }

  const currentMultiplier = getCurrentTrafficMultiplier();
  const totalFactor = zone.factor * currentMultiplier;

  if (totalFactor >= 2.0) return { zone, status: 'heavy' };
  if (totalFactor >= 1.3) return { zone, status: 'moderate' };
  return { zone, status: 'light' };
}

export function generateRouteInstructions(startLat: number, startLng: number, endLat: number, endLng: number, hospitalName: string): string[] {
  // This is a simplified instruction generator
  // In a real implementation, this would use a routing service like OSRM
  
  const instructions: string[] = [];
  
  // Determine general direction
  const latDiff = endLat - startLat;
  const lngDiff = endLng - startLng;
  
  if (Math.abs(latDiff) > Math.abs(lngDiff)) {
    if (latDiff > 0) {
      instructions.push("Head north");
    } else {
      instructions.push("Head south");
    }
  } else {
    if (lngDiff > 0) {
      instructions.push("Head east");
    } else {
      instructions.push("Head west");
    }
  }
  
  // Add some Chennai-specific route hints
  const distance = calculateDistance(startLat, startLng, endLat, endLng);
  
  if (distance > 5) {
    instructions.push("Take main arterial road");
  }
  
  // Check if route passes through major areas
  const midLat = (startLat + endLat) / 2;
  const midLng = (startLng + endLng) / 2;
  
  // Check for major Chennai landmarks/roads
  if (midLng > 80.24 && midLng < 80.26) {
    instructions.push("Continue on Anna Salai");
  }
  
  if (midLat > 13.04 && midLat < 13.06) {
    instructions.push("Navigate through T. Nagar area - expect traffic");
  }
  
  instructions.push(`Arrive at ${hospitalName}`);
  
  return instructions;
}

export function estimateTravelTime(distance: number, trafficFactor: number, congestionFactor: number): number {
  // Base speed in Chennai: 30-40 km/h depending on area
  const baseSpeed = 35; // km/h
  const baseTravelTimeHours = distance / baseSpeed;
  const baseTravelTimeMinutes = baseTravelTimeHours * 60;
  
  // Apply traffic and congestion factors
  const adjustedTime = baseTravelTimeMinutes * trafficFactor * congestionFactor;
  
  // Minimum time should be at least 3 minutes for any hospital trip
  return Math.max(Math.round(adjustedTime), 3);
}

export function formatTimeUntilNextUpdate(): string {
  // ETA updates every 30 seconds as per requirements
  const now = new Date();
  const seconds = now.getSeconds();
  const timeUntilUpdate = 30 - (seconds % 30);
  
  if (timeUntilUpdate <= 5) {
    return "Updating...";
  }
  
  return `Next update in ${timeUntilUpdate}s`;
}
