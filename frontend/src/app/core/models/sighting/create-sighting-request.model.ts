import { HealthStatus } from "../dog/dog.model";

export interface CreateSightingRequest {
  healthStatus: HealthStatus;
  note?: string;
  areaLabel?: string;
  latitude?: number;
  longitude?: number;
}