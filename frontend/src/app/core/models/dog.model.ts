/**
 * Frontend types that mirror the backend DTOs exactly.
 *
 * When the backend DTOs change, this file changes in lockstep. Keeping everything
 * in one file (instead of one-per-interface) makes it easy to see the whole
 * shape of the API at a glance — useful when students are new to the domain.
 */

// --- enums as string literal unions (simplest TS representation) ---

export type DogSize = 'SMALL' | 'MEDIUM' | 'LARGE';

export type HealthStatus = 'HEALTHY' | 'NEEDS_ATTENTION' | 'INJURED' | 'SICK';

/** Derived on the backend from the latest sighting — see DogService.computeBadge. */
export type DogBadge = 'NEW' | 'ACTIVE' | 'URGENT';

// --- responses ---

export interface DogSummary {
  id: number;
  displayName: string;          // e.g. "Bruno #0041" or "Unknown #0039"
  size: DogSize;
  color: string;
  areaLabel: string | null;
  latestHealthStatus: HealthStatus;
  photoUrl: string | null;      // "/uploads/abc.jpg" — resolve with DogService.resolvePhotoUrl
  sightingCount: number;
  createdAt: string;            // ISO-8601
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
  reporterName: string;   // display name of the reporter, or "Anonymous"
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

// --- requests ---

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
