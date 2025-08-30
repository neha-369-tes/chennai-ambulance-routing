import { type Hospital, type InsertHospital, type EmergencyCall, type InsertEmergencyCall, type Ambulance, type InsertAmbulance, type HospitalWithRoute } from "@shared/schema";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  // Hospital operations
  getHospitals(): Promise<Hospital[]>;
  getHospital(id: string): Promise<Hospital | undefined>;
  updateHospitalAvailability(id: string, available: boolean): Promise<Hospital | undefined>;
  
  // Emergency call operations
  createEmergencyCall(call: InsertEmergencyCall): Promise<EmergencyCall>;
  getEmergencyCall(id: string): Promise<EmergencyCall | undefined>;
  updateEmergencyCall(id: string, updates: Partial<EmergencyCall>): Promise<EmergencyCall | undefined>;
  getActiveEmergencyCalls(): Promise<EmergencyCall[]>;
  
  // Ambulance operations
  getAmbulances(): Promise<Ambulance[]>;
  updateAmbulanceLocation(id: string, latitude: number, longitude: number): Promise<Ambulance | undefined>;
  assignAmbulance(ambulanceId: string, emergencyCallId: string): Promise<Ambulance | undefined>;
  
  // Routing operations
  findNearestHospitals(latitude: number, longitude: number, emergencyType: string, count?: number): Promise<HospitalWithRoute[]>;
}

export class MemStorage implements IStorage {
  private hospitals: Map<string, Hospital>;
  private emergencyCalls: Map<string, EmergencyCall>;
  private ambulances: Map<string, Ambulance>;

  constructor() {
    this.hospitals = new Map();
    this.emergencyCalls = new Map();
    this.ambulances = new Map();
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Load Chennai hospitals data
      const hospitalDataPath = path.resolve(process.cwd(), "data", "chennai_hospitals.json");
      const hospitalData = await fs.readFile(hospitalDataPath, "utf-8");
      const { hospitals } = JSON.parse(hospitalData);
      
      hospitals.forEach((hospital: Hospital) => {
        this.hospitals.set(hospital.id, hospital);
      });

      // Initialize sample ambulances
      const ambulanceIds = ["AMB001", "AMB002", "AMB003", "AMB004", "AMB005", "AMB006", "AMB007", "AMB008"];
      ambulanceIds.forEach((id, index) => {
        const ambulance: Ambulance = {
          id,
          status: index < 6 ? "available" : index < 8 ? "en_route" : "maintenance",
          current_latitude: 13.0827 + (Math.random() - 0.5) * 0.1,
          current_longitude: 80.2707 + (Math.random() - 0.5) * 0.1,
          emergency_call_id: null,
          last_updated: new Date(),
        };
        this.ambulances.set(id, ambulance);
      });
      
      console.log(`Loaded ${hospitals.length} Chennai hospitals and ${ambulanceIds.length} ambulances`);
    } catch (error) {
      console.error("Failed to load hospital data:", error);
    }
  }

  async getHospitals(): Promise<Hospital[]> {
    return Array.from(this.hospitals.values());
  }

  async getHospital(id: string): Promise<Hospital | undefined> {
    return this.hospitals.get(id);
  }

  async updateHospitalAvailability(id: string, available: boolean): Promise<Hospital | undefined> {
    const hospital = this.hospitals.get(id);
    if (hospital) {
      const updated = { ...hospital, available, last_updated: new Date() };
      this.hospitals.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async createEmergencyCall(insertCall: InsertEmergencyCall): Promise<EmergencyCall> {
    const id = randomUUID();
    const call: EmergencyCall = {
      ...insertCall,
      id,
      status: insertCall.status || 'active',
      selected_hospital_id: insertCall.selected_hospital_id || null,
      estimated_time: insertCall.estimated_time || null,
      distance: insertCall.distance || null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.emergencyCalls.set(id, call);
    return call;
  }

  async getEmergencyCall(id: string): Promise<EmergencyCall | undefined> {
    return this.emergencyCalls.get(id);
  }

  async updateEmergencyCall(id: string, updates: Partial<EmergencyCall>): Promise<EmergencyCall | undefined> {
    const call = this.emergencyCalls.get(id);
    if (call) {
      const updated = { ...call, ...updates, updated_at: new Date() };
      this.emergencyCalls.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async getActiveEmergencyCalls(): Promise<EmergencyCall[]> {
    return Array.from(this.emergencyCalls.values()).filter(call => call.status === 'active' || call.status === 'dispatched');
  }

  async getAmbulances(): Promise<Ambulance[]> {
    return Array.from(this.ambulances.values());
  }

  async updateAmbulanceLocation(id: string, latitude: number, longitude: number): Promise<Ambulance | undefined> {
    const ambulance = this.ambulances.get(id);
    if (ambulance) {
      const updated = { ...ambulance, current_latitude: latitude, current_longitude: longitude, last_updated: new Date() };
      this.ambulances.set(id, updated);
      return updated;
    }
    return undefined;
  }

  async assignAmbulance(ambulanceId: string, emergencyCallId: string): Promise<Ambulance | undefined> {
    const ambulance = this.ambulances.get(ambulanceId);
    if (ambulance) {
      const updated = { ...ambulance, emergency_call_id: emergencyCallId, status: "en_route", last_updated: new Date() };
      this.ambulances.set(ambulanceId, updated);
      return updated;
    }
    return undefined;
  }

  async findNearestHospitals(latitude: number, longitude: number, emergencyType: string, count: number = 5): Promise<HospitalWithRoute[]> {
    const hospitals = Array.from(this.hospitals.values()).filter(h => h.available);
    
    // Calculate distance and ETA for each hospital
    const hospitalsWithRoutes: HospitalWithRoute[] = hospitals.map(hospital => {
      const distance = this.calculateDistance(latitude, longitude, hospital.latitude, hospital.longitude);
      const trafficFactor = this.getTrafficMultiplier();
      const congestionFactor = this.getCongestionFactor(hospital.latitude, hospital.longitude);
      
      // Base travel time calculation (assuming 40 km/h average speed in city)
      const baseTravelTime = (distance / 40) * 60; // minutes
      const adjustedTime = Math.round(baseTravelTime * trafficFactor * congestionFactor);
      
      // Filter by emergency type capabilities
      let priority = 1;
      if (emergencyType === 'trauma' && hospital.emergency_level === 'level_1_trauma') {
        priority = 0.8; // Prefer trauma centers for trauma cases
      }
      if (hospital.cost === 'free') {
        priority *= 0.9; // Slight preference for free hospitals
      }
      
      return {
        ...hospital,
        distance: parseFloat(distance.toFixed(2)),
        estimated_time: Math.max(adjustedTime, 3), // Minimum 3 minutes
        traffic_factor: trafficFactor,
        route_coordinates: this.generateSimpleRoute(latitude, longitude, hospital.latitude, hospital.longitude),
      };
    });

    // Sort by adjusted time and return top results
    return hospitalsWithRoutes
      .sort((a, b) => a.estimated_time - b.estimated_time)
      .slice(0, count);
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  private getTrafficMultiplier(): number {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeDecimal = hour + minute / 60;

    // Chennai traffic patterns from requirements
    if (timeDecimal >= 8 && timeDecimal <= 10.5) return 1.8; // Morning rush
    if (timeDecimal >= 18 && timeDecimal <= 21) return 2.2; // Evening rush
    if (timeDecimal >= 12.5 && timeDecimal <= 14) return 1.4; // Lunch rush
    
    // Weekend evening traffic
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 6 && timeDecimal >= 19 && timeDecimal <= 22) return 1.6;
    
    return 1.0;
  }

  private getCongestionFactor(lat: number, lon: number): number {
    // High congestion zones from requirements
    const congestionZones = [
      { lat: 13.0418, lon: 80.2341, radius: 2, factor: 1.5 }, // T. Nagar
      { lat: 13.0605, lon: 80.2496, radius: 1.5, factor: 1.3 }, // Anna Salai
      { lat: 13.0493, lon: 80.2137, radius: 1, factor: 1.2 }, // Vadapalani
      { lat: 12.9915, lon: 80.2207, radius: 2.5, factor: 1.4 }, // Guindy
      { lat: 13.0358, lon: 80.1565, radius: 3, factor: 1.3 }, // Porur IT
    ];

    for (const zone of congestionZones) {
      const distance = this.calculateDistance(lat, lon, zone.lat, zone.lon);
      if (distance <= zone.radius) {
        return zone.factor;
      }
    }

    return 1.0;
  }

  private generateSimpleRoute(lat1: number, lon1: number, lat2: number, lon2: number): [number, number][] {
    // Generate a simple route with a few waypoints
    const midLat = (lat1 + lat2) / 2;
    const midLon = (lon1 + lon2) / 2;
    
    return [
      [lat1, lon1],
      [midLat + (Math.random() - 0.5) * 0.01, midLon + (Math.random() - 0.5) * 0.01],
      [lat2, lon2]
    ];
  }
}

export const storage = new MemStorage();
