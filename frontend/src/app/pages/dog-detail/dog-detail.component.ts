import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import * as L from "leaflet";

import { DogService } from "../../core/services/dog.service";
import { DogDetail, HealthStatus, Sighting } from "../../core/models/dog.model";

interface MapPin {
  lat: number;
  lng: number;
  label: string;
  kind: "initial" | "sighting";
}

@Component({
  selector: "app-dog-detail",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./dog-detail.component.html",
})
export class DogDetailComponent implements OnInit, OnDestroy {
  @Input({ required: true }) id!: string;

  private readonly dogService = inject(DogService);

  dog: DogDetail | null = null;
  loading = true;
  error: string | null = null;

  private map: L.Map | null = null;

  @ViewChild("mapEl")
  set mapElRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref && !this.map) {
      this.initMap(ref.nativeElement);
    }
  }

  get photoUrl(): string | null {
    return this.dogService.resolvePhotoUrl(this.dog?.photoUrl ?? null);
  }

  get badgeClass(): string {
    if (!this.dog) return "badge";
    return `badge badge--${this.dog.badge.toLowerCase()}`;
  }

  get badgeLabel(): string {
    return this.dog ? titleCase(this.dog.badge) : "";
  }

  get sizeLabel(): string {
    return this.dog ? titleCase(this.dog.size) : "";
  }

  get mapPins(): MapPin[] {
    if (!this.dog) return [];
    const pins: MapPin[] = [];

    if (this.dog.initialLatitude != null && this.dog.initialLongitude != null) {
      pins.push({
        lat: this.dog.initialLatitude,
        lng: this.dog.initialLongitude,
        label: `Registered here${this.dog.initialAreaLabel ? ` — ${this.dog.initialAreaLabel}` : ""}`,
        kind: "initial",
      });
    }

    for (const s of this.dog.sightings) {
      if (s.latitude != null && s.longitude != null) {
        pins.push({
          lat: s.latitude,
          lng: s.longitude,
          label: `Sighting: ${this.healthLabel(s.healthStatus)}${s.areaLabel ? ` — ${s.areaLabel}` : ""}`,
          kind: "sighting",
        });
      }
    }

    return pins;
  }

  get hasMapData(): boolean {
    return this.mapPins.length > 0;
  }

  ngOnInit(): void {
    const numericId = Number(this.id);

    if (!Number.isFinite(numericId)) {
      this.error = "Invalid dog id in URL.";
      this.loading = false;
      return;
    }

    this.dogService.get(numericId).subscribe({
      next: (dog) => {
        this.dog = dog;
        this.loading = false;
      },
      error: (err) => {
        this.error =
          err?.status === 404
            ? "Dog not found."
            : "Unable to load this dog. Is the backend running?";
        this.loading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  healthLabel(status: HealthStatus): string {
    const map: Record<HealthStatus, string> = {
      HEALTHY: "Healthy",
      NEEDS_ATTENTION: "Needs attention",
      INJURED: "Injured",
      SICK: "Sick",
    };
    return map[status];
  }

  healthTextClass(status: HealthStatus): string {
    if (status === "HEALTHY") return "text-badge-new-fg";
    if (status === "NEEDS_ATTENTION") return "text-warning-fg";
    return "text-badge-urgent-fg"; // INJURED or SICK
  }

  healthDotClass(status: HealthStatus): string {
    if (status === "HEALTHY") return "bg-badge-new-fg";
    if (status === "NEEDS_ATTENTION") return "bg-warning-fg";
    return "bg-badge-urgent-fg";
  }

  timeAgo(iso: string): string {
    const diffMs = Math.max(0, Date.now() - new Date(iso).getTime());
    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

    return new Date(iso).toLocaleDateString();
  }

  sightingPhotoUrl(s: Sighting): string | null {
    return this.dogService.resolvePhotoUrl(s.photoUrl);
  }

  private initMap(element: HTMLDivElement): void {
    const pins = this.mapPins;
    if (pins.length === 0) return;

    const center: L.LatLngExpression = [pins[0].lat, pins[0].lng];
    const map = L.map(element, { zoomControl: true }).setView(center, 14);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    for (const pin of pins) {
      const icon = L.divIcon({
        className: "",
        html: `<div class="pawid-pin pawid-pin--${pin.kind}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([pin.lat, pin.lng], { icon }).addTo(map).bindPopup(pin.label);
    }

    if (pins.length > 1) {
      const bounds = L.latLngBounds(
        pins.map((p) => [p.lat, p.lng] as L.LatLngExpression),
      );
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
    }

    this.map = map;
  }
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
