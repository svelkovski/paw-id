import { HealthStatus } from "../dog/dog.model";

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