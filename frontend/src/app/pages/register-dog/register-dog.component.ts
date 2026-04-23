import {
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import * as L from "leaflet";

import { DogService } from "../../core/services/dog.service";
import {
  CreateDogRequest,
  DogSize,
  HealthStatus,
} from "../../core/models/dog.model";
import { WebcamModalComponent } from "../../shared/webcam-modal/webcam-modal";

interface ChipOption<T extends string> {
  value: T;
  label: string;
}

const DEFAULT_CENTER: L.LatLngExpression = [41.9981, 21.4254];

@Component({
  selector: "app-register-dog",
  standalone: true,
  imports: [FormsModule, RouterLink, WebcamModalComponent],
  templateUrl: "./register-dog.component.html",
})
export class RegisterDogComponent implements OnDestroy {
  private readonly dogService = inject(DogService);
  private readonly router = inject(Router);

  name = "";
  size: DogSize | null = null;
  color = "";
  description = "";
  healthStatus: HealthStatus | null = null;
  areaLabel = "";
  latitude: number | null = null;
  longitude: number | null = null;

  photoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  showWebcam = false;

  submitting = false;
  locationRequesting = false;
  error: string | null = null;
  errors: Record<string, string> = {};

  readonly sizeOptions: ChipOption<DogSize>[] = [
    { value: "SMALL", label: "Small" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LARGE", label: "Large" },
  ];

  readonly healthOptions: ChipOption<HealthStatus>[] = [
    { value: "HEALTHY", label: "Healthy" },
    { value: "NEEDS_ATTENTION", label: "Needs attention" },
    { value: "INJURED", label: "Injured" },
    { value: "SICK", label: "Sick" },
  ];

  private map: L.Map | null = null;
  private locationMarker: L.Marker | null = null;

  @ViewChild("mapEl")
  set mapElRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref && !this.map) {
      this.initMap(ref.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (this.photoPreviewUrl) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }

    this.photoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);

    input.value = "";
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

  private initMap(element: HTMLDivElement): void {
    this.map = L.map(element).setView(DEFAULT_CENTER, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      this.setLocation(e.latlng.lat, e.latlng.lng);
    });
  }

  private setLocation(lat: number, lng: number): void {
    this.latitude = lat;
    this.longitude = lng;

    if (!this.map) return;
    const latlng: L.LatLngExpression = [lat, lng];

    if (this.locationMarker) {
      this.locationMarker.setLatLng(latlng);
    } else {
      const icon = L.divIcon({
        className: "",
        html: '<div class="pawid-pin pawid-pin--initial"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      this.locationMarker = L.marker(latlng, { icon }).addTo(this.map);
    }

    this.map.panTo(latlng);
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      this.error = "Geolocation is not supported in this browser.";
      return;
    }

    this.locationRequesting = true;
    this.error = null;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        this.locationRequesting = false;
        this.setLocation(pos.coords.latitude, pos.coords.longitude);
        this.map?.setView([pos.coords.latitude, pos.coords.longitude], 16);
      },
      () => {
        this.locationRequesting = false;
        this.error =
          "Could not get your location. You can click on the map to set it manually.";
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  clearLocation(): void {
    this.latitude = null;
    this.longitude = null;
    this.locationMarker?.remove();
    this.locationMarker = null;
  }

  private validate(): boolean {
    const errors: Record<string, string> = {};

    if (!this.size) {
      errors["size"] = "Please pick a size.";
    }
    if (!this.color.trim()) {
      errors["color"] = "Color is required.";
    }
    if (!this.healthStatus) {
      errors["healthStatus"] = "Please pick a current health status.";
    }

    this.errors = errors;
    return Object.keys(errors).length === 0;
  }

  onSubmit(): void {
    if (!this.validate()) return;

    this.submitting = true;
    this.error = null;

    const payload: CreateDogRequest = {
      name: this.name.trim() || undefined,
      size: this.size!,
      color: this.color.trim(),
      description: this.description.trim() || undefined,
      initialHealthStatus: this.healthStatus!,
      initialAreaLabel: this.areaLabel.trim() || undefined,
      initialLatitude: this.latitude ?? undefined,
      initialLongitude: this.longitude ?? undefined,
    };

    this.dogService.create(payload, this.photoFile).subscribe({
      next: (dog) => {
        this.router.navigate(["/dogs", dog.id]);
      },
      error: (err) => {
        this.submitting = false;
        this.error =
          err?.error?.message ??
          "Failed to register the dog. Please try again.";
      },
    });
  }
}
