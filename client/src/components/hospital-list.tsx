import { useState } from 'react';
import { CheckCircle, Clock, MapPin, Phone, Stethoscope } from 'lucide-react';
import type { HospitalWithRoute } from '@shared/schema';
import { 
  getHospitalRecommendationRank, 
  getTimeColor,
  formatSpecialties,
  formatCapacity,
  formatEmergencyLevel,
  formatCost,
  HOSPITAL_CAPACITY_COLORS,
  EMERGENCY_LEVEL_COLORS,
  COST_COLORS
} from '@/lib/hospitals';
import { Button } from '@/components/ui/button';

interface HospitalListProps {
  hospitals: HospitalWithRoute[];
  selectedHospital: HospitalWithRoute | null;
  onSelectHospital: (hospital: HospitalWithRoute) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export default function HospitalList({
  hospitals,
  selectedHospital,
  onSelectHospital,
  onRefresh,
  isLoading = false
}: HospitalListProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    setLastUpdated(new Date());
    onRefresh();
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000 / 60);
    if (diff < 1) return 'just now';
    if (diff === 1) return '1 min ago';
    return `${diff} min ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Nearest Hospitals</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="text-primary hover:text-primary/80 transition-colors"
          data-testid="button-refresh-hospitals"
        >
          {isLoading ? (
            <Clock className="w-4 h-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {hospitals.length === 0 ? (
          <div className="text-center py-8" data-testid="text-no-hospitals">
            <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hospitals found nearby</p>
            <p className="text-sm text-muted-foreground mt-2">Try refreshing or check your location</p>
          </div>
        ) : (
          hospitals.map((hospital, index) => {
            const isSelected = selectedHospital?.id === hospital.id;
            const rank = getHospitalRecommendationRank(hospital);
            const timeColorClass = getTimeColor(hospital.estimated_time);

            return (
              <div
                key={hospital.id}
                className={`
                  rounded-lg p-4 cursor-pointer transition-all duration-200 border-2
                  ${isSelected 
                    ? 'bg-accent/50 border-primary' 
                    : 'bg-card border-border hover:bg-accent/30'
                  }
                `}
                onClick={() => onSelectHospital(hospital)}
                data-testid={`card-hospital-${hospital.id}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground text-base" data-testid={`text-hospital-name-${hospital.id}`}>
                      {hospital.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {hospital.type.replace('_', ' ')} • {formatEmergencyLevel(hospital.emergency_level)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${timeColorClass}`} data-testid={`text-eta-${hospital.id}`}>
                      {hospital.estimated_time} min
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`text-distance-${hospital.id}`}>
                      {hospital.distance} km
                    </div>
                  </div>
                </div>

                {/* Hospital badges */}
                <div className="flex items-center space-x-2 mb-2 flex-wrap gap-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${HOSPITAL_CAPACITY_COLORS[hospital.capacity as keyof typeof HOSPITAL_CAPACITY_COLORS]}`}>
                    {formatCapacity(hospital.capacity)}
                  </span>
                  
                  {hospital.emergency_level === 'level_1_trauma' && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${EMERGENCY_LEVEL_COLORS[hospital.emergency_level]}`}>
                      Trauma Center
                    </span>
                  )}
                  
                  {hospital.cost && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${COST_COLORS[hospital.cost as keyof typeof COST_COLORS]}`}>
                      {formatCost(hospital.cost)}
                    </span>
                  )}
                  
                  {(hospital.specialties || []).length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                      {formatSpecialties((hospital.specialties || []).slice(0, 1))[0]}
                      {(hospital.specialties || []).length > 1 && ` +${(hospital.specialties || []).length - 1}`}
                    </span>
                  )}
                </div>

                {/* Hospital status and actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {rank === 'recommended' && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-xs text-success font-medium">Recommended</span>
                      </div>
                    )}
                    
                    {hospital.traffic_factor > 1.5 && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-warning" />
                        <span className="text-xs text-warning font-medium">Heavy traffic</span>
                      </div>
                    )}
                    
                    {hospital.available && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-xs text-success font-medium">Available</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {hospital.phone && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`tel:${hospital.phone}`, '_self');
                        }}
                        className="p-1 h-auto"
                        data-testid={`button-call-${hospital.id}`}
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <span className="text-xs text-muted-foreground">
                      Updated {formatTimeAgo(lastUpdated)}
                    </span>
                  </div>
                </div>

                {/* Additional hospital info on selection */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Specialties:</span>
                        <div className="mt-1">
                          {formatSpecialties(hospital.specialties || []).map((specialty, idx) => (
                            <span key={idx} className="inline-block text-xs bg-secondary px-2 py-1 rounded mr-1 mb-1">
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Route Info:</span>
                        <div className="mt-1 text-xs">
                          <div>Traffic factor: {hospital.traffic_factor}x</div>
                          {hospital.route_coordinates && (
                            <div>{hospital.route_coordinates.length} waypoints</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Hospital location */}
                    <div className="mt-2 flex items-center space-x-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>Lat: {hospital.latitude.toFixed(4)}, Lng: {hospital.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Hospital ranking explanation */}
      {hospitals.length > 0 && (
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Ranking Factors</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Distance and estimated travel time</div>
            <div>• Hospital capacity and emergency level</div>
            <div>• Current traffic conditions</div>
            <div>• Specialty match for emergency type</div>
          </div>
        </div>
      )}
    </div>
  );
}
