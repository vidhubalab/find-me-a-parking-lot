export type HubZone = 'Orchard' | 'Marina' | 'HarbourFront' | 'JurongLake' | 'All';

export type VehicleType = 'car' | 'motorcycle' | 'heavy_vehicle';

export interface EVChargerInfo {
  available: boolean;
  count: number;
  operator: string; // e.g. "SP Group", "Shell Recharge", "CDG ENGIE"
  powerKw: number; // e.g. 50
  plugTypes: string[]; // e.g. ["Type 2", "CCS 2"]
}

export interface PricingRate {
  weekdayDayRate: string; // e.g. "$1.50 / 30 mins"
  weekdayPerEntry?: string; // e.g. "$3.50 after 5pm"
  weekendRate: string; // e.g. "$2.40 / 30 mins"
  hourlyEstimate: number; // in SGD, for sorting
  gracePeriodMins: number; // e.g. 10
}

export interface Carpark {
  id: string;
  name: string;
  hub: HubZone;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  totalLots: number;
  availableLots: number;
  trend: 'stable' | 'filling' | 'emptying';
  historicalCrowd: 'light' | 'moderate' | 'heavy' | 'critical';
  isSheltered: boolean;
  heightClearanceMeters: number; // e.g. 2.1
  walkingDistanceMeters: number; // to primary hub anchor
  walkingTimeMinutes: number;
  pricing: PricingRate;
  evCharging: EVChargerInfo;
  accessibleLots: number;
  motorcycleLots: number;
  gantryHeightExceeded?: boolean;
}

export interface FilterPreferences {
  hub: HubZone;
  searchQuery: string;
  vehicleType: VehicleType;
  vehicleHeightMeters: number; // e.g. 1.85m default
  maxHourlyRate: number; // max budget e.g. $10
  shelteredOnly: boolean;
  evChargingOnly: boolean;
  accessibleLotsOnly: boolean;
  sortBy: 'lots' | 'distance' | 'cheapest' | 'clearance';
}

export interface TrackedSlots {
  primary: Carpark | null;
  backup1: Carpark | null;
  backup2: Carpark | null;
}

export interface VoiceAlertSettings {
  enabled: boolean;
  tenMinuteAlertEnabled: boolean;
  lowLotAlertEnabled: boolean;
  lowLotThreshold: number; // defaults to 10
  speechRate: number; // 1.0
  volume: number; // 1.0
  voiceGender: 'female' | 'male' | 'system';
}

export interface TripSimulationState {
  isNavigating: boolean;
  destinationName: string;
  currentEtaMinutes: number;
  tenMinAlertTriggered: boolean;
  lowLotAlertTriggered: boolean;
  lastSpokenText: string | null;
  isSpeaking: boolean;
}
