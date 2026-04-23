import { DogSize, HealthStatus, DogBadge } from "./dog.model";
import { Sighting } from "../sighting/sighting.model";

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
