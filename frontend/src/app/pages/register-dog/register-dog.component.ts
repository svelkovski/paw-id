import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import * as L from 'leaflet';

import { DogService } from '../../core/services/dog.service';
import {
  CreateDogRequest,
  DogSize,
  HealthStatus
} from '../../core/models/dog.model';
import { WebcamModalComponent } from '../../shared/webcam-modal/webcam-modal';

/** Option descriptor for the size and health chip rows. */
interface ChipOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Approximate default center for the map picker when we don't know the user's
 * location yet. Skopje city center — matches the seed data and is sensible for
 * the dev location. Changing this doesn't break anything; it's just what the map
 * shows before the user pans or drops a pin.
 */
const DEFAULT_CENTER: L.LatLngExpression = [41.9981, 21.4254];

@Component({
  selector: 'app-register-dog',
  standalone: true,
  imports: [FormsModule, RouterLink, WebcamModalComponent],
  templateUrl: './register-dog.component.html'
})
export class RegisterDogComponent implements OnDestroy {

  private readonly dogService = inject(DogService);
  private readonly router = inject(Router);

  // --- form state (plain fields, bound with [(ngModel)]) ---

  name = '';
  size: DogSize | null = null;
  color = '';
  description = '';
  healthStatus: HealthStatus | null = null;
  areaLabel = '';
  latitude: number | null = null;
  longitude: number | null = null;

  // --- photo state ---

  photoFile: File | null = null;
  /** Object URL for the photo preview. Revoked in ngOnDestroy and on replace. */
  photoPreviewUrl: string | null = null;
  showWebcam = false;
  // --- submission state ---

  submitting = false;
  locationRequesting = false;
  error: string | null = null;
  /** Per-field error messages, keyed by field name. */
  errors: Record<string, string> = {};

  // --- chip definitions (iterated in the template) ---

  readonly sizeOptions: ChipOption<DogSize>[] = [
    { value: 'SMALL',  label: 'Small' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LARGE',  label: 'Large' }
  ];

  readonly healthOptions: ChipOption<HealthStatus>[] = [
    { value: 'HEALTHY',          label: 'Healthy' },
    { value: 'NEEDS_ATTENTION',  label: 'Needs attention' },
    { value: 'INJURED',          label: 'Injured' },
    { value: 'SICK',             label: 'Sick' }
  ];

  // --- map instance state (not exposed to template) ---

  private map: L.Map | null = null;
  private locationMarker: L.Marker | null = null;

  /**
   * ViewChild setter — fires when the map div first appears in the DOM.
   * See dog-detail for an explanation of why a setter is cleaner than
   * ngAfterViewInit for async-rendered elements. Here the div is always
   * rendered (no @if around it) so the setter fires once at view init.
   */
  @ViewChild('mapEl')
  set mapElRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref && !this.map) {
      this.initMap(ref.nativeElement);
    }
  }

  // --- lifecycle ---

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;

    // Always release object URLs we created — otherwise the file bytes
    // stay in memory until the page navigates.
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
  }

  // --- photo handling ---

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Replace any previous preview cleanly.
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.photoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);

    // Reset the input value so the same file can be selected again later
    // — without this, re-picking the same file silently does nothing.
    input.value = '';
  }

  clearPhoto(): void {
    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.photoFile = null;
    this.photoPreviewUrl = null;
  }

  openWebcam(): void {
  this.showWebcam = true;
}

onWebcamPhoto(file: File): void {
  this.showWebcam = false;
  if (this.photoPreviewUrl) URL.revokeObjectURL(this.photoPreviewUrl);
  this.photoFile = file;
  this.photoPreviewUrl = URL.createObjectURL(file);
}

  // --- map / location handling ---

  private initMap(element: HTMLDivElement): void {
    this.map = L.map(element).setView(DEFAULT_CENTER, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    // Click anywhere on the map to set/move the location pin.
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.setLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  /**
   * Update lat/lng fields and move (or create) the marker on the map.
   * Called from the map click handler and from "Use my location".
   */
  private setLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;

    if (!this.map) return;
    const latlng: L.LatLngExpression = [lat, lng];

    if (this.locationMarker) {
      this.locationMarker.setLatLng(latlng);
    } else {
      const icon = L.divIcon({
        className: '',
        html: '<div class="pawid-pin pawid-pin--initial"></div>',
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

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locationRequesting = false;
        this.setLocation(pos.coords.latitude, pos.coords.longitude);
        // Zoom in a bit — we now have a precise point.
        this.map?.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      () => {
        this.locationRequesting = false;
        this.error = 'Could not get your location. You can click on the map to set it manually.';
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }

  clearLocation(): void {
    this.latitude = null;
    this.longitude = null;
    this.locationMarker?.remove();
    this.locationMarker = null;
  }

  // --- validation + submit ---

  /**
   * Basic client-side validation. Populates `this.errors` and returns whether
   * the form is currently valid. Server-side Bean Validation is the real safety
   * net; this is just for instant feedback.
   */
  private validate(): boolean {
    const errors: Record<string, string> = {};

    if (!this.size) {
      errors['size'] = 'Please pick a size.';
    }
    if (!this.color.trim()) {
      errors['color'] = 'Color is required.';
    }
    if (!this.healthStatus) {
      errors['healthStatus'] = 'Please pick a current health status.';
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    // validate() updates this.errors. If anything's invalid, bail here —
    // inline messages will have rendered beneath the offending fields.
    if (!this.validate()) return;

    this.submitting = true;
    this.error = null;

    // Build the API payload. Optional fields stay undefined when empty so
    // they're omitted from the JSON instead of sent as "".
    const payload: CreateDogRequest = {
      name: this.name.trim() || undefined,
      size: this.size!,
      color: this.color.trim(),
      description: this.description.trim() || undefined,
      initialHealthStatus: this.healthStatus!,
      initialAreaLabel: this.areaLabel.trim() || undefined,
      initialLatitude: this.latitude ?? undefined,
      initialLongitude: this.longitude ?? undefined
    };

    this.dogService.create(payload, this.photoFile).subscribe({
      next: (dog) => {
        // On success, go straight to the newly-created dog's profile page.
        this.router.navigate(['/dogs', dog.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err?.error?.message ?? 'Failed to register the dog. Please try again.';
      }
    });
  }
}
