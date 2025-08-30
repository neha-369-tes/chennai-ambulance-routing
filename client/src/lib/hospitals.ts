import type { Hospital, HospitalWithRoute } from "@shared/schema";

export const CHENNAI_CENTER = {
  lat: 13.0827,
  lng: 80.2707
};

export const EMERGENCY_TYPES = {
  MEDICAL: 'medical',
  TRAUMA: 'trauma'
} as const;

export const PRIORITY_LEVELS = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium'
} as const;

export const HOSPITAL_CAPACITY_COLORS = {
  very_high: 'bg-success/20 text-success',
  high: 'bg-success/20 text-success',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-destructive/20 text-destructive'
};

export const EMERGENCY_LEVEL_COLORS = {
  level_1_trauma: 'bg-primary/20 text-primary',
  level_2: 'bg-blue-500/20 text-blue-400',
  basic: 'bg-muted/20 text-muted-foreground'
};

export const COST_COLORS = {
  free: 'bg-blue-500/20 text-blue-400',
  moderate: 'bg-warning/20 text-warning',
  expensive: 'bg-destructive/20 text-destructive'
};

export function getHospitalRecommendationRank(hospital: HospitalWithRoute): 'recommended' | 'good' | 'fallback' {
  if (hospital.estimated_time <= 10 && hospital.capacity === 'high' || hospital.capacity === 'very_high') {
    return 'recommended';
  }
  if (hospital.estimated_time <= 15) {
    return 'good';
  }
  return 'fallback';
}

export function getTimeColor(minutes: number): string {
  if (minutes <= 8) return 'text-success';
  if (minutes <= 15) return 'text-warning';
  return 'text-destructive';
}

export function formatSpecialties(specialties: string[]): string[] {
  const specialtyMap: Record<string, string> = {
    cardiology: 'Cardiology',
    neurology: 'Neurology',
    emergency: 'Emergency',
    trauma: 'Trauma',
    orthopedics: 'Orthopedics',
    oncology: 'Oncology',
    general_surgery: 'General Surgery',
    internal_medicine: 'Internal Medicine',
    transplant: 'Transplant'
  };

  return specialties.map(specialty => specialtyMap[specialty] || specialty);
}

export function formatCapacity(capacity: string): string {
  const capacityMap: Record<string, string> = {
    very_high: 'Very High Capacity',
    high: 'High Capacity',
    medium: 'Medium Capacity',
    low: 'Low Capacity'
  };

  return capacityMap[capacity] || capacity;
}

export function formatEmergencyLevel(level: string): string {
  const levelMap: Record<string, string> = {
    level_1_trauma: 'Level 1 Trauma Center',
    level_2: 'Level 2 Emergency',
    basic: 'Basic Emergency'
  };

  return levelMap[level] || level;
}

export function formatCost(cost: string | undefined): string {
  if (!cost) return '';
  
  const costMap: Record<string, string> = {
    free: 'Free Treatment',
    moderate: 'Moderate Cost',
    expensive: 'Premium Care'
  };

  return costMap[cost] || cost;
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI/180);
}

export function isHospitalSuitableForEmergency(hospital: Hospital, emergencyType: string): boolean {
  if (emergencyType === EMERGENCY_TYPES.TRAUMA) {
    return hospital.emergency_level === 'level_1_trauma' && 
           (hospital.specialties || []).includes('trauma');
  }
  
  if (emergencyType === EMERGENCY_TYPES.MEDICAL) {
    return (hospital.specialties || []).includes('emergency') || 
           (hospital.specialties || []).includes('internal_medicine');
  }
  
  return true;
}
