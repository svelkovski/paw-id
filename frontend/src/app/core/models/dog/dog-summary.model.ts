import { DogBadge, DogSize, HealthStatus } from "./dog.model";

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