import { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EMERGENCY_TYPES, PRIORITY_LEVELS, CHENNAI_CENTER } from '@/lib/hospitals';

interface EmergencyDetailsProps {
  location: string;
  emergencyType: string;
  priority: string;
  onLocationChange: (location: string) => void;
  onEmergencyTypeChange: (type: string) => void;
  onPriorityChange: (priority: string) => void;
  onGetCurrentLocation: () => void;
  onCreateEmergencyCall: () => void;
  isCreatingCall?: boolean;
  coordinates?: { lat: number; lng: number } | null;
}

export default function EmergencyDetails({
  location,
  emergencyType,
  priority,
  onLocationChange,
  onEmergencyTypeChange,
  onPriorityChange,
  onGetCurrentLocation,
  onCreateEmergencyCall,
  isCreatingCall = false,
  coordinates
}: EmergencyDetailsProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            onLocationChange(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            onGetCurrentLocation();
            setIsGettingLocation(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            // Fallback to Chennai center
            onLocationChange(`${CHENNAI_CENTER.lat}, ${CHENNAI_CENTER.lng}`);
            setIsGettingLocation(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      } else {
        console.error('Geolocation not supported');
        setIsGettingLocation(false);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setIsGettingLocation(false);
    }
  };

  const getPriorityColor = (level: string) => {
    switch (level) {
      case PRIORITY_LEVELS.CRITICAL:
        return 'text-destructive';
      case PRIORITY_LEVELS.HIGH:
        return 'text-warning';
      case PRIORITY_LEVELS.MEDIUM:
        return 'text-success';
      default:
        return 'text-foreground';
    }
  };

  const getPriorityIcon = (level: string) => {
    switch (level) {
      case PRIORITY_LEVELS.CRITICAL:
        return '🔴';
      case PRIORITY_LEVELS.HIGH:
        return '🟡';
      case PRIORITY_LEVELS.MEDIUM:
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Emergency Details</h2>
        <div className="emergency-status bg-primary px-3 py-1 rounded-full">
          <span className="text-xs font-bold text-primary-foreground">ACTIVE</span>
        </div>
      </div>

      {/* Emergency Location Input */}
      <div className="space-y-2">
        <Label htmlFor="emergency-location" className="text-sm font-medium text-foreground">
          Emergency Location
        </Label>
        <div className="relative">
          <Input
            id="emergency-location"
            type="text"
            placeholder="Enter address or coordinates"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="min-h-[44px] pr-12"
            data-testid="input-emergency-location"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2"
            data-testid="button-get-current-location"
          >
            {isGettingLocation ? (
              <Navigation className="w-5 h-5 animate-spin" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
          </Button>
        </div>
        {coordinates && (
          <p className="text-xs text-muted-foreground">
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
        )}
      </div>

      {/* Emergency Type Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">Emergency Type</Label>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant={emergencyType === EMERGENCY_TYPES.MEDICAL ? "default" : "secondary"}
            className="min-h-[44px] font-medium"
            onClick={() => onEmergencyTypeChange(EMERGENCY_TYPES.MEDICAL)}
            data-testid="button-emergency-type-medical"
          >
            Medical
          </Button>
          <Button
            variant={emergencyType === EMERGENCY_TYPES.TRAUMA ? "default" : "secondary"}
            className="min-h-[44px] font-medium"
            onClick={() => onEmergencyTypeChange(EMERGENCY_TYPES.TRAUMA)}
            data-testid="button-emergency-type-trauma"
          >
            Trauma
          </Button>
        </div>
      </div>

      {/* Priority Level */}
      <div className="space-y-2">
        <Label htmlFor="priority-select" className="text-sm font-medium text-foreground">
          Priority Level
        </Label>
        <Select 
          value={priority} 
          onValueChange={onPriorityChange}
        >
          <SelectTrigger className="min-h-[44px]" data-testid="select-priority-level">
            <SelectValue placeholder="Select priority level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PRIORITY_LEVELS.CRITICAL}>
              <div className="flex items-center space-x-2">
                <span>🔴</span>
                <span>Critical - Life Threatening</span>
              </div>
            </SelectItem>
            <SelectItem value={PRIORITY_LEVELS.HIGH}>
              <div className="flex items-center space-x-2">
                <span>🟡</span>
                <span>High - Urgent Care Needed</span>
              </div>
            </SelectItem>
            <SelectItem value={PRIORITY_LEVELS.MEDIUM}>
              <div className="flex items-center space-x-2">
                <span>🟢</span>
                <span>Medium - Stable Condition</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Emergency Type Description */}
      <div className="p-3 bg-muted/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium mb-1">
              {emergencyType === EMERGENCY_TYPES.TRAUMA ? 'Trauma Emergency' : 'Medical Emergency'}
            </div>
            <div className="text-muted-foreground">
              {emergencyType === EMERGENCY_TYPES.TRAUMA 
                ? 'Requires trauma center with advanced emergency capabilities. Hospitals with Level 1 trauma certification will be prioritized.'
                : 'General medical emergency. All hospitals with emergency departments can provide care.'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Current Priority Display */}
      {priority && (
        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getPriorityIcon(priority)}</span>
              <span className="font-medium">Current Priority:</span>
            </div>
            <span className={`font-semibold ${getPriorityColor(priority)}`}>
              {priority.toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Create Emergency Call Button */}
      <div className="pt-2">
        <Button
          onClick={onCreateEmergencyCall}
          disabled={!location || !emergencyType || !priority || isCreatingCall}
          className="w-full min-h-[44px] font-semibold"
          data-testid="button-create-emergency-call"
        >
          {isCreatingCall ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Emergency Call...</span>
            </div>
          ) : (
            'Create Emergency Call'
          )}
        </Button>
      </div>

      {/* Emergency Guidelines */}
      <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
        <h4 className="text-sm font-semibold text-destructive mb-2">Emergency Guidelines</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <div>• Provide accurate location information</div>
          <div>• Select appropriate emergency type for proper hospital matching</div>
          <div>• Critical cases: Call 108 immediately for fastest response</div>
          <div>• Keep phone line clear for emergency services</div>
        </div>
      </div>
    </div>
  );
}
