import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';

import { DogService } from '../../core/services/dog.service';
import {
  CreateSightingRequest,
  DogDetail,
  HealthStatus
} from '../../core/models/dog.model';

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Map center used as a last resort — only applies if the dog has no known
 * coordinates anywhere (no initial registration lat/lng, no sightings with
 * coordinates). Skopje city center, matching the seed data.
 */
const FALLBACK_CENTER: L.LatLngExpression = [41.9981, 21.4254];

@Component({
  selector: 'app-report-sighting',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './report-sighting.component.html'
})
export class ReportSightingComponent implements OnInit, OnDestroy {

  /** Route param bound via withComponentInputBinding() — the dog we're reporting on. */
  @Input({ required: true }) id!: string;

  private readonly dogService = inject(DogService);
  private readonly router = inject(Router);

  // --- dog fetch state ---
  dog: DogDetail | null = null;
  loadingDog = true;
  dogError: string | null = null;

  // --- form state (plain fields, bound with [(ngModel)]) ---
  healthStatus: HealthStatus | null = null;
  note = '';
  areaLabel = '';
  latitude: number | null = null;
  longitude: number | null = null;

  // --- photo state ---
  photoFile: File | null = null;
  photoPreviewUrl: string | null = null;

  // --- submission state ---
  submitting = false;
  locationRequesting = false;
  error: string | null = null;
  errors: Record<string, string> = {};

  // --- chip options ---
  readonly healthOptions: ChipOption<HealthStatus>[] = [
    { value: 'HEALTHY',          label: 'Healthy' },
    { value: 'NEEDS_ATTENTION',  label: 'Needs attention' },
    { value: 'INJURED',          label: 'Injured' },
    { value: 'SICK',             label: 'Sick' }
  ];

  // --- map state ---
  private map: L.Map | null = null;
  private locationMarker: L.Marker | null = null;

  @ViewChild('mapEl')
  set mapElRef(ref: ElementRef<HTMLDivElement> | undefined) {
    // The map div lives inside an @if that waits for the dog to load, so the
    // setter fires once that @if becomes true. If the dog data arrived first,
    // the map will have a sensible starting location; otherwise it shows the
    // fallback center until the data arrives.
    if (ref && !this.map) {
      this.initMap(ref.nativeElement);
    }
  }

  // --- derived: dog display helpers ---

  get dogPhotoUrl(): string | null {
    return this.dogService.resolvePhotoUrl(this.dog?.photoUrl ?? null);
  }

  get priorSightingCount(): number {
    return this.dog?.sightings.length ?? 0;
  }

  // --- lifecycle ---

  ngOnInit(): void {
    const numericId = Number(this.id);
    if (!Number.isFinite(numericId)) {
      this.dogError = 'Invalid dog id in URL.';
      this.loadingDog = false;
      return;
    }

    this.dogService.get(numericId).subscribe({
      next: (dog) => {
        this.dog = dog;
        this.loadingDog = false;
        // If the map has already been created (e.g. the div mounted before
        // this callback), re-center it on the dog's most recent location.
        this.centerMapOnDogIfReady();
      },
      error: (err) => {
        this.loadingDog = false;
        this.dogError = err?.status === 404
          ? 'Dog not found. You can only report sightings for registered dogs.'
          : 'Unable to load this dog. Is the backend running?';
      }
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
  }

  // --- photo handling (same pattern as register-dog) ---

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.photoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);
    input.value = '';  // allow re-selecting the same file later
  }

  clearPhoto(): void {
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoFile = null;
    this.photoPreviewUrl = null;
  }

  // --- map handling ---

  private initMap(element: HTMLDivElement): void {
    // Try to start at the dog's most recent location; otherwise fallback center.
    const startCenter = this.findLastKnownLocation() ?? FALLBACK_CENTER;

    this.map = L.map(element).setView(startCenter, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  /**
   * Find the dog's most recent known coordinates.
   * Sightings are returned newest-first by the backend, so the first sighting
   * with coordinates is the most recent. Fall back to the initial registration
   * location if no sighting has coords yet.
   */
  private findLastKnownLocation(): L.LatLngExpression | null {
    if (!this.dog) return null;

    for (const s of this.dog.sightings) {
      if (s.latitude != null && s.longitude != null) {
        return [s.latitude, s.longitude];
      }
    }

    if (this.dog.initialLatitude != null && this.dog.initialLongitude != null) {
      return [this.dog.initialLatitude, this.dog.initialLongitude];
    }

    return null;
  }

  /**
   * Called after the dog loads — if the map happens to exist already (race
   * between view init and HTTP), re-pan to the dog's last known location.
   */
  private centerMapOnDogIfReady(): void {
    if (!this.map) return;
    const coords = this.findLastKnownLocation();
    if (coords) {
      this.map.setView(coords, 14);
    }
  }

  private setLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;

    if (!this.map) return;
    const latlng: L.LatLngExpression = [lat, lng];

    if (this.locationMarker) {
      this.locationMarker.setLatLng(latlng);
    } else {
      // Using the "sighting" variant — matches the pin color on dog-detail
      // so users mentally link "this pin = a sighting" consistently.
      const icon = L.divIcon({
        className: '',
        html: '<div class="pawid-pin pawid-pin--sighting"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });
      this.locationMarker = L.marker(latlng, { icon }).addTo(this.map);
    }

    this.map.panTo(latlng);
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.error = 'Geolocation is not supported in this browser.';
      return;
    }

    this.locationRequesting = true;
    this.error = null;

    // First attempt: high-accuracy (GPS). Falls back to network/IP if it fails.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locationRequesting = false;
        this.setLocation(pos.coords.latitude, pos.coords.longitude);
        this.map?.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      () => {
        // High-accuracy failed — retry without it (uses Wi-Fi/IP, works on desktops without GPS)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            this.locationRequesting = false;
            this.setLocation(pos.coords.latitude, pos.coords.longitude);
            this.map?.setView([pos.coords.latitude, pos.coords.longitude], 15);
          },
          (err) => {
            this.locationRequesting = false;
            if (err.code === err.PERMISSION_DENIED) {
              this.error = 'Location access was denied. Please allow it in your browser settings, or click the map to set it manually.';
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              this.error = 'Your location is currently unavailable. Click the map to set it manually.';
            } else {
              this.error = 'Location request timed out. Click the map to set it manually.';
            }
          },
          { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
        );
      },
      { enableHighAccuracy: true, timeout: 6_000, maximumAge: 30_000 }
    );
  }

  clearLocation(): void {
    this.latitude = null;
    this.longitude = null;
    this.locationMarker?.remove();
    this.locationMarker = null;
  }

  // --- submit ---

  private validate(): boolean {
    const errors: Record<string, string> = {};
    if (!this.healthStatus) {
      errors['healthStatus'] = 'Please pick a current health status.';
    }
    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    this.submitting = true;
    this.error = null;

    const payload: CreateSightingRequest = {
      healthStatus: this.healthStatus!,
      note: this.note.trim() || undefined,
      areaLabel: this.areaLabel.trim() || undefined,
      latitude: this.latitude ?? undefined,
      longitude: this.longitude ?? undefined
    };

    this.dogService.reportSighting(Number(this.id), payload, this.photoFile).subscribe({
      next: () => {
        // Redirect back to the dog's profile — the new sighting appears
        // at the top of their sightings list (backend returns newest first).
        this.router.navigate(['/dogs', this.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message ?? 'Failed to report the sighting. Please try again.';
      }
    });
  }
}
