import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Phone, FileText, Volume2, Users, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWebSocket } from '@/hooks/use-websocket';
import EmergencyMap from '@/components/emergency-map';
import HospitalList from '@/components/hospital-list';
import EmergencyDetails from '@/components/emergency-details';
import { Button } from '@/components/ui/button';
import type { HospitalWithRoute, EmergencyCall, InsertEmergencyCall } from '@shared/schema';
import { EMERGENCY_TYPES, PRIORITY_LEVELS, CHENNAI_CENTER } from '@/lib/hospitals';
import { apiRequest } from '@/lib/queryClient';

interface SystemStatus {
  hospitals: {
    total: number;
    available: number;
    availability_percentage: number;
  };
  ambulances: {
    total: number;
    available: number;
    en_route: number;
    maintenance: number;
  };
  emergencies: {
    active: number;
  };
  metrics: {
    average_response_time: number;
  };
  timestamp: string;
}

export default function EmergencyDispatch() {
  // State management
  const [emergencyLocation, setEmergencyLocation] = useState('');
  const [emergencyType, setEmergencyType] = useState<string>(EMERGENCY_TYPES.MEDICAL);
  const [priority, setPriority] = useState<string>(PRIORITY_LEVELS.HIGH);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalWithRoute | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const queryClient = useQueryClient();

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (message) => {
      console.log('Received WebSocket message:', message);
      
      if (message.type === 'hospital_availability_update') {
        queryClient.invalidateQueries({ queryKey: ['/api/hospitals/nearest'] });
        toast({
          title: 'Hospital Status Updated',
          description: `${message.hospitalId} availability changed`,
        });
      }
      
      if (message.type === 'ambulance_location_update') {
        queryClient.invalidateQueries({ queryKey: ['/api/ambulances'] });
      }
      
      if (message.type === 'new_emergency_call') {
        queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
        toast({
          title: 'New Emergency Call',
          description: 'Emergency dispatch system updated',
          variant: 'destructive',
        });
      }
    },
    onConnect: () => {
      toast({
        title: 'System Connected',
        description: 'Real-time updates enabled',
        variant: 'default',
      });
    },
    onDisconnect: () => {
      toast({
        title: 'Connection Lost',
        description: 'Attempting to reconnect...',
        variant: 'destructive',
      });
    }
  });

  // Fetch nearest hospitals
  const { data: hospitals = [], isLoading: hospitalsLoading, refetch: refetchHospitals } = useQuery<HospitalWithRoute[]>({
    queryKey: ['/api/hospitals/nearest', coordinates?.lat, coordinates?.lng, emergencyType],
    enabled: !!coordinates,
    refetchInterval: 30000, // Refresh every 30 seconds as per requirements
  });

  // Fetch system status
  const { data: systemStatus } = useQuery<SystemStatus>({
    queryKey: ['/api/system/status'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Create emergency call mutation
  const createEmergencyMutation = useMutation({
    mutationFn: async (emergencyData: InsertEmergencyCall) => {
      const response = await apiRequest('POST', '/api/emergency', emergencyData);
      return response.json();
    },
    onSuccess: (data: EmergencyCall) => {
      toast({
        title: 'Emergency Call Created',
        description: `Emergency ID: ${data.id}`,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Create Emergency Call',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Parse coordinates from location string
  useEffect(() => {
    if (emergencyLocation) {
      // Try to parse coordinates from input
      const coordMatch = emergencyLocation.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          setCoordinates({ lat, lng });
        }
      } else {
        // For now, default to Chennai center for text addresses
        // In production, this would use geocoding service
        setCoordinates(CHENNAI_CENTER);
      }
    }
  }, [emergencyLocation]);

  // Auto-select best hospital when hospitals list updates
  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospital) {
      setSelectedHospital(hospitals[0]); // Select the top-ranked hospital
    }
  }, [hospitals, selectedHospital]);

  const handleLocationChange = (location: string) => {
    setEmergencyLocation(location);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setCoordinates(CHENNAI_CENTER); // Fallback to Chennai center
        }
      );
    }
  };

  const handleCreateEmergencyCall = () => {
    if (!coordinates) {
      toast({
        title: 'Location Required',
        description: 'Please provide emergency location',
        variant: 'destructive',
      });
      return;
    }

    const emergencyData: InsertEmergencyCall = {
      location: emergencyLocation,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      emergency_type: emergencyType,
      priority: priority,
      selected_hospital_id: selectedHospital?.id || null,
      estimated_time: selectedHospital?.estimated_time || null,
      distance: selectedHospital?.distance || null,
    };

    createEmergencyMutation.mutate(emergencyData);
  };

  const handleDispatchAmbulance = () => {
    if (!selectedHospital) {
      toast({
        title: 'Hospital Selection Required',
        description: 'Please select a hospital first',
        variant: 'destructive',
      });
      return;
    }

    // In a real implementation, this would dispatch an ambulance
    toast({
      title: 'Ambulance Dispatched',
      description: `Dispatching to ${selectedHospital.name}`,
      variant: 'default',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      hour12: false 
    }) + ' IST';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary p-2 rounded-lg">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Chennai EMS Dispatch</h1>
                <p className="text-muted-foreground text-sm">Emergency Ambulance Routing System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-destructive'}`}></div>
                <span className="text-sm font-medium">
                  {isConnected ? 'System Online' : 'System Offline'}
                </span>
              </div>
              <div className="text-sm text-muted-foreground" data-testid="text-current-time">
                {formatTime(currentTime)}
              </div>
              <Button variant="secondary" size="sm" className="p-2">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
        {/* Map Section */}
        <div className="flex-1 relative">
          <EmergencyMap
            hospitals={hospitals}
            selectedHospital={selectedHospital}
            emergencyLocation={coordinates}
            onHospitalSelect={setSelectedHospital}
            className="w-full h-full"
          />
        </div>

        {/* Control Panel */}
        <div className="w-full md:w-96 lg:w-[400px] bg-card border-l border-border overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Emergency Details */}
            <EmergencyDetails
              location={emergencyLocation}
              emergencyType={emergencyType}
              priority={priority}
              coordinates={coordinates}
              onLocationChange={handleLocationChange}
              onEmergencyTypeChange={(type: string) => setEmergencyType(type as typeof emergencyType)}
              onPriorityChange={(priority: string) => setPriority(priority as typeof priority)}
              onGetCurrentLocation={handleGetCurrentLocation}
              onCreateEmergencyCall={handleCreateEmergencyCall}
              isCreatingCall={createEmergencyMutation.isPending}
            />

            {/* Hospital List */}
            <HospitalList
              hospitals={hospitals}
              selectedHospital={selectedHospital}
              onSelectHospital={setSelectedHospital}
              onRefresh={refetchHospitals}
              isLoading={hospitalsLoading}
            />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleDispatchAmbulance}
                disabled={!selectedHospital}
                className="w-full min-h-[44px] emergency-button emergency-critical"
                data-testid="button-dispatch-ambulance"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  <span>Dispatch to Selected Hospital</span>
                </div>
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="min-h-[44px] font-medium"
                  onClick={() => refetchHospitals()}
                  data-testid="button-optimize-route"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span className="text-sm">Optimize</span>
                  </div>
                </Button>
                <Button
                  className="min-h-[44px] emergency-button emergency-high"
                  data-testid="button-request-backup"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Backup</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* System Status */}
            {systemStatus && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">System Status</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground" data-testid="text-active-ambulances">
                      {systemStatus.ambulances.available}
                    </div>
                    <div className="text-xs text-muted-foreground">Available Units</div>
                  </div>
                  <div className="bg-accent/30 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-success" data-testid="text-avg-response-time">
                      {systemStatus.metrics.average_response_time}
                    </div>
                    <div className="text-xs text-muted-foreground">Avg Response (min)</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hospital Availability</span>
                    <span className="text-success font-medium">
                      {systemStatus.hospitals.availability_percentage}% Available
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-success h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${systemStatus.hospitals.availability_percentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="status-indicator status-online"></div>
                      <span className="text-muted-foreground">Available Ambulances</span>
                    </div>
                    <span className="text-success font-medium">{systemStatus.ambulances.available}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="status-indicator status-warning"></div>
                      <span className="text-muted-foreground">En Route</span>
                    </div>
                    <span className="text-warning font-medium">{systemStatus.ambulances.en_route}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="status-indicator status-offline"></div>
                      <span className="text-muted-foreground">Maintenance</span>
                    </div>
                    <span className="text-destructive font-medium">{systemStatus.ambulances.maintenance}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              
              <div className="space-y-2">
                <Button
                  className="w-full min-h-[44px] emergency-button emergency-critical"
                  data-testid="button-emergency-broadcast"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Volume2 className="w-5 h-5" />
                    <span>Emergency Broadcast</span>
                  </div>
                </Button>
                
                <Button
                  className="w-full min-h-[44px] emergency-button emergency-high"
                  data-testid="button-contact-hospital"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>Contact Hospital</span>
                  </div>
                </Button>
                
                <Button
                  variant="secondary"
                  className="w-full min-h-[44px] font-medium"
                  data-testid="button-view-reports"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>View Reports</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-card border-t border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-online"></div>
              <span className="text-sm text-muted-foreground">GPS Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-online"></div>
              <span className="text-sm text-muted-foreground">Traffic Data Live</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-indicator status-online"></div>
              <span className="text-sm text-muted-foreground">Hospital Network Online</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Last Updated: <span className="text-foreground font-medium">{formatTime(currentTime)}</span>
            </span>
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80 text-sm font-medium p-0"
              onClick={() => window.open('tel:108', '_self')}
            >
              Emergency Hotline: 108
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
