export type DogSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type HealthStatus = 'HEALTHY' | 'NEEDS_ATTENTION' | 'INJURED' | 'SICK';

export type DogBadge = 'NEW' | 'ACTIVE' | 'URGENT';

export interface DogSummary {
  id: number;
  displayName: string;          
  size: DogSize;
  color: string;
  areaLabel: string | null;
  latestHealthStatus: HealthStatus;
  photoUrl: string | null;      
  sightingCount: number;
  createdAt: string;            
  badge: DogBadge;
}

export interface Sighting {
  id: number;
  healthStatus: HealthStatus;
  note: string | null;
  areaLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  reportedAt: string;
  reporterName: string;   
}

export interface DogDetail {
  id: number;
  displayName: string;
  name: string | null;
  size: DogSize;
  color: string;
  description: string | null;
  initialHealthStatus: HealthStatus;
  initialAreaLabel: string | null;
  initialLatitude: number | null;
  initialLongitude: number | null;
  photoUrl: string | null;
  createdAt: string;
  badge: DogBadge;
  sightings: Sighting[];
}

export interface CreateDogRequest {
  name?: string;
  size: DogSize;
  color: string;
  description?: string;
  initialHealthStatus: HealthStatus;
  initialAreaLabel?: string;
  initialLatitude?: number;
  initialLongitude?: number;
}

export interface CreateSightingRequest {
  healthStatus: HealthStatus;
  note?: string;
  areaLabel?: string;
  latitude?: number;
  longitude?: number;
}
