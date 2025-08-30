import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertEmergencyCallSchema } from "@shared/schema";
import { z } from "zod";

// N8N Authentication Middleware
function authenticateN8N(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const apiKey = req.headers['x-api-key'];
  const n8nWebhookAuth = req.headers['x-n8n-webhook-auth'];
  
  // Skip auth for GET endpoints (status checks)
  if (req.method === 'GET') {
    return next();
  }
  
  // Check for valid authentication
  if (authHeader === `Bearer ${process.env.N8N_API_KEY}` || 
      apiKey === process.env.N8N_API_KEY ||
      n8nWebhookAuth === process.env.N8N_WEBHOOK_SECRET) {
    return next();
  }
  
  // Allow requests from localhost in development
  if (process.env.NODE_ENV === 'development' && 
      (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
    return next();
  }
  
  res.status(401).json({ 
    success: false,
    error: 'Unauthorized - Invalid API key or webhook authentication' 
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Emergency dispatch client connected');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WebSocket message received:', data);
        
        // Handle different message types
        if (data.type === 'ambulance_location_update') {
          // Broadcast ambulance location to all clients
          broadcastToAll({
            type: 'ambulance_location_update',
            ambulanceId: data.ambulanceId,
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Emergency dispatch client disconnected');
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connection_confirmed',
      timestamp: new Date().toISOString()
    }));
  });

  function broadcastToAll(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Hospital endpoints
  app.get("/api/hospitals", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      res.json(hospitals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch hospitals" });
    }
  });

  app.get("/api/hospitals/nearest", async (req, res) => {
    try {
      const { lat, lng, emergency_type, count } = req.query;
      
      if (!lat || !lng || !emergency_type) {
        return res.status(400).json({ error: "Missing required parameters: lat, lng, emergency_type" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const emergencyType = emergency_type as string;
      const hospitalCount = count ? parseInt(count as string) : 5;

      const nearestHospitals = await storage.findNearestHospitals(latitude, longitude, emergencyType, hospitalCount);
      res.json(nearestHospitals);
    } catch (error) {
      console.error("Error finding nearest hospitals:", error);
      res.status(500).json({ error: "Failed to find nearest hospitals" });
    }
  });

  app.patch("/api/hospitals/:id/availability", async (req, res) => {
    try {
      const { id } = req.params;
      const { available } = req.body;
      
      if (typeof available !== 'boolean') {
        return res.status(400).json({ error: "Available must be a boolean" });
      }

      const hospital = await storage.updateHospitalAvailability(id, available);
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      // Broadcast hospital availability update
      broadcastToAll({
        type: 'hospital_availability_update',
        hospitalId: id,
        available,
        timestamp: new Date().toISOString()
      });

      res.json(hospital);
    } catch (error) {
      res.status(500).json({ error: "Failed to update hospital availability" });
    }
  });

  // Emergency call endpoints
  app.post("/api/emergency", async (req, res) => {
    try {
      const validatedData = insertEmergencyCallSchema.parse(req.body);
      const emergencyCall = await storage.createEmergencyCall(validatedData);
      
      // Broadcast new emergency call to all connected clients
      broadcastToAll({
        type: 'new_emergency_call',
        emergencyCall,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(emergencyCall);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid emergency call data", details: error.errors });
      }
      console.error("Error creating emergency call:", error);
      res.status(500).json({ error: "Failed to create emergency call" });
    }
  });

  app.get("/api/emergency/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const emergencyCall = await storage.getEmergencyCall(id);
      
      if (!emergencyCall) {
        return res.status(404).json({ error: "Emergency call not found" });
      }

      res.json(emergencyCall);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emergency call" });
    }
  });

  app.patch("/api/emergency/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const emergencyCall = await storage.updateEmergencyCall(id, updates);
      if (!emergencyCall) {
        return res.status(404).json({ error: "Emergency call not found" });
      }

      // Broadcast emergency call update
      broadcastToAll({
        type: 'emergency_call_update',
        emergencyCall,
        timestamp: new Date().toISOString()
      });

      res.json(emergencyCall);
    } catch (error) {
      res.status(500).json({ error: "Failed to update emergency call" });
    }
  });

  app.get("/api/emergency", async (req, res) => {
    try {
      const activeEmergencyCalls = await storage.getActiveEmergencyCalls();
      res.json(activeEmergencyCalls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active emergency calls" });
    }
  });

  // Route calculation endpoint
  app.get("/api/route/:hospitalId", async (req, res) => {
    try {
      const { hospitalId } = req.params;
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: "Missing required parameters: lat, lng" });
      }

      const hospital = await storage.getHospital(hospitalId);
      if (!hospital) {
        return res.status(404).json({ error: "Hospital not found" });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      // Calculate route using storage helper
      const hospitals = await storage.findNearestHospitals(latitude, longitude, "medical", 10);
      const selectedHospital = hospitals.find(h => h.id === hospitalId);
      
      if (!selectedHospital) {
        return res.status(404).json({ error: "Route calculation failed" });
      }

      res.json({
        hospital: selectedHospital,
        route: {
          coordinates: selectedHospital.route_coordinates,
          distance: selectedHospital.distance,
          estimated_time: selectedHospital.estimated_time,
          traffic_factor: selectedHospital.traffic_factor
        }
      });
    } catch (error) {
      console.error("Error calculating route:", error);
      res.status(500).json({ error: "Failed to calculate route" });
    }
  });

  // Ambulance endpoints
  app.get("/api/ambulances", async (req, res) => {
    try {
      const ambulances = await storage.getAmbulances();
      res.json(ambulances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ambulances" });
    }
  });

  app.patch("/api/ambulances/:id/location", async (req, res) => {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ error: "Latitude and longitude must be numbers" });
      }

      const ambulance = await storage.updateAmbulanceLocation(id, latitude, longitude);
      if (!ambulance) {
        return res.status(404).json({ error: "Ambulance not found" });
      }

      // Broadcast ambulance location update
      broadcastToAll({
        type: 'ambulance_location_update',
        ambulanceId: id,
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      res.json(ambulance);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ambulance location" });
    }
  });

  app.post("/api/ambulances/:id/assign", async (req, res) => {
    try {
      const { id } = req.params;
      const { emergency_call_id } = req.body;
      
      const ambulance = await storage.assignAmbulance(id, emergency_call_id);
      if (!ambulance) {
        return res.status(404).json({ error: "Ambulance not found" });
      }

      // Broadcast ambulance assignment
      broadcastToAll({
        type: 'ambulance_assigned',
        ambulanceId: id,
        emergencyCallId: emergency_call_id,
        timestamp: new Date().toISOString()
      });

      res.json(ambulance);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign ambulance" });
    }
  });

  // N8N Integration Endpoints
  // ==========================

  // N8N Webhook for Emergency Dispatch
  app.post("/webhook/n8n/emergency", authenticateN8N, async (req, res) => {
    try {
      const { location, latitude, longitude, emergency_type, priority, webhook_id, external_id } = req.body;
      
      if (!location || !latitude || !longitude || !emergency_type || !priority) {
        return res.status(400).json({ 
          success: false,
          error: "Missing required fields: location, latitude, longitude, emergency_type, priority" 
        });
      }

      // Create emergency call
      const emergencyData = {
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        emergency_type,
        priority,
        selected_hospital_id: null,
        estimated_time: null,
        distance: null,
      };

      const validatedData = insertEmergencyCallSchema.parse(emergencyData);
      const emergencyCall = await storage.createEmergencyCall(validatedData);
      
      // Find nearest hospitals
      const nearestHospitals = await storage.findNearestHospitals(
        parseFloat(latitude), 
        parseFloat(longitude), 
        emergency_type, 
        3
      );

      // Broadcast to all clients
      broadcastToAll({
        type: 'n8n_emergency_call',
        emergencyCall,
        nearestHospitals,
        webhook_id,
        external_id,
        timestamp: new Date().toISOString()
      });

      res.status(201).json({
        success: true,
        data: {
          emergency_id: emergencyCall.id,
          nearest_hospitals: nearestHospitals,
          estimated_dispatch_time: nearestHospitals[0]?.estimated_time || null,
          recommended_hospital: nearestHospitals[0] || null
        },
        webhook_id,
        external_id,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("N8N Emergency webhook error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to process emergency call",
        details: error instanceof z.ZodError ? error.errors : (error as Error).message 
      });
    }
  });

  // N8N Hospital Status Webhook
  app.get("/webhook/n8n/hospitals/status", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      const ambulances = await storage.getAmbulances();
      
      const hospitalStatus = hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.name,
        location: {
          latitude: hospital.latitude,
          longitude: hospital.longitude
        },
        available: hospital.available,
        capacity: hospital.capacity,
        emergency_level: hospital.emergency_level,
        specialties: hospital.specialties,
        cost: hospital.cost
      }));

      const ambulanceStatus = {
        total: ambulances.length,
        available: ambulances.filter(a => a.status === 'available').length,
        en_route: ambulances.filter(a => a.status === 'en_route').length,
        maintenance: ambulances.filter(a => a.status === 'maintenance').length
      };

      res.json({
        success: true,
        data: {
          hospitals: hospitalStatus,
          ambulances: ambulanceStatus,
          system_status: 'operational'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Failed to fetch system status" 
      });
    }
  });

  // N8N Hospital Availability Update
  app.patch("/webhook/n8n/hospitals/:id/availability", authenticateN8N, async (req, res) => {
    try {
      const { id } = req.params;
      const { available, reason } = req.body;
      
      if (typeof available !== 'boolean') {
        return res.status(400).json({ 
          success: false,
          error: "Available must be a boolean" 
        });
      }

      const hospital = await storage.updateHospitalAvailability(id, available);
      if (!hospital) {
        return res.status(404).json({ 
          success: false,
          error: "Hospital not found" 
        });
      }

      // Broadcast hospital availability update
      broadcastToAll({
        type: 'n8n_hospital_availability_update',
        hospitalId: id,
        available,
        reason,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          hospital_id: id,
          name: hospital.name,
          available,
          reason
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Failed to update hospital availability" 
      });
    }
  });

  // N8N Traffic Alert Webhook
  app.post("/webhook/n8n/traffic/alert", authenticateN8N, async (req, res) => {
    try {
      const { zone_name, severity, duration_minutes, affected_routes } = req.body;
      
      // Broadcast traffic alert to all clients
      broadcastToAll({
        type: 'n8n_traffic_alert',
        zone_name,
        severity,
        duration_minutes,
        affected_routes,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: "Traffic alert broadcasted to all emergency dispatch clients",
        data: {
          zone_name,
          severity,
          duration_minutes,
          affected_routes
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Failed to process traffic alert" 
      });
    }
  });

  // N8N Ambulance Dispatch Webhook
  app.post("/webhook/n8n/ambulance/dispatch", authenticateN8N, async (req, res) => {
    try {
      const { emergency_id, hospital_id, ambulance_id, external_reference } = req.body;
      
      if (!emergency_id || !hospital_id) {
        return res.status(400).json({ 
          success: false,
          error: "Missing required fields: emergency_id, hospital_id" 
        });
      }

      const emergencyCall = await storage.getEmergencyCall(emergency_id);
      const hospital = await storage.getHospital(hospital_id);
      
      if (!emergencyCall || !hospital) {
        return res.status(404).json({ 
          success: false,
          error: "Emergency call or hospital not found" 
        });
      }

      // Update emergency call with selected hospital
      const updatedCall = await storage.updateEmergencyCall(emergency_id, {
        selected_hospital_id: hospital_id,
        status: 'dispatched'
      });

      // Assign ambulance if specified
      if (ambulance_id) {
        await storage.assignAmbulance(ambulance_id, emergency_id);
      }

      // Broadcast dispatch confirmation
      broadcastToAll({
        type: 'n8n_ambulance_dispatched',
        emergency_id,
        hospital_id,
        ambulance_id,
        external_reference,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: {
          emergency_id,
          hospital: {
            id: hospital.id,
            name: hospital.name,
            location: {
              latitude: hospital.latitude,
              longitude: hospital.longitude
            }
          },
          ambulance_id,
          external_reference,
          status: 'dispatched'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Failed to dispatch ambulance" 
      });
    }
  });

  // System status endpoint
  app.get("/api/system/status", async (req, res) => {
    try {
      const hospitals = await storage.getHospitals();
      const ambulances = await storage.getAmbulances();
      const activeEmergencies = await storage.getActiveEmergencyCalls();
      
      const availableHospitals = hospitals.filter(h => h.available).length;
      const availableAmbulances = ambulances.filter(a => a.status === 'available').length;
      const enRouteAmbulances = ambulances.filter(a => a.status === 'en_route').length;
      const maintenanceAmbulances = ambulances.filter(a => a.status === 'maintenance').length;
      
      // Calculate average response time (mock calculation)
      const avgResponseTime = 6.2; // This would be calculated from historical data
      
      res.json({
        hospitals: {
          total: hospitals.length,
          available: availableHospitals,
          availability_percentage: Math.round((availableHospitals / hospitals.length) * 100)
        },
        ambulances: {
          total: ambulances.length,
          available: availableAmbulances,
          en_route: enRouteAmbulances,
          maintenance: maintenanceAmbulances
        },
        emergencies: {
          active: activeEmergencies.length
        },
        metrics: {
          average_response_time: avgResponseTime
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system status" });
    }
  });

  return httpServer;
}
