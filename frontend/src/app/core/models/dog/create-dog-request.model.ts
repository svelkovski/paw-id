import { DogSize, HealthStatus } from "./dog.model";

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