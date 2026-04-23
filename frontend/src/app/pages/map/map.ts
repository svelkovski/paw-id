import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { DogService } from '../../core/services/dog.service';
import { DogDetail, DogSummary } from '../../core/models/dog.model';

/** One pin on the global map — one per dog, at their last known location. */
interface DogPin {
  id: number;
  lat: number;
  lng: number;
  displayName: string;
  /**
   * 'sighting' if coords came from the latest sighting (fresher, more accurate).
   * 'initial' if we fell back to the registration point.
   */
  kind: 'initial' | 'sighting';
}

/**
 * Same Skopje default as register-dog — ensures the map renders something
 * sensible even if we fail to load any dogs.
 */
const DEFAULT_CENTER: L.LatLngExpression = [41.9981, 21.4254];

@Component({
  selector: 'app-map-page',
  standalone: true,
  imports: [],
  templateUrl: './map.html'
})
export class MapPageComponent implements OnInit, OnDestroy {

  private readonly dogService = inject(DogService);
  private readonly router = inject(Router);

  // --- state ---
  loading = true;
  error: string | null = null;
  pins: DogPin[] = [];

  private map: L.Map | null = null;
  private pendingPins: DogPin[] | null = null;

  /**
   * Setter-based @ViewChild — same pattern as dog-detail. The div lives
   * inside @if blocks, so we only construct the Leaflet instance once
   * the element actually exists in the DOM.
   */
  @ViewChild('mapEl')
  set mapElRef(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref && !this.map) {
      this.initMap(ref.nativeElement);
      if (this.pendingPins) {
        this.renderPins(this.pendingPins);
        this.pendingPins = null;
      }
    }
  }

  // --- lifecycle ---

  ngOnInit(): void {
    this.dogService.list().subscribe({
      next: (summaries) => this.loadCoordinates(summaries),
      error: () => {
        this.error = 'Unable to load dogs. Is the backend running on localhost:8080?';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  // --- data ---

  /**
   * We need coordinates to pin each dog, but the list endpoint only returns
   * summaries (no lat/lng). So we fan out to /api/dogs/{id} for each dog in
   * parallel via forkJoin and combine the results. Failures on individual
   * dogs don't abort the whole map — we just skip them.
   *
   * Note: this is O(N) requests. Fine for the MVP's small dataset. For
   * production you'd add a backend endpoint like /api/dogs/map that returns
   * just {id, displayName, lat, lng} in a single call.
   */
  private loadCoordinates(summaries: DogSummary[]): void {
    if (summaries.length === 0) {
      this.pins = [];
      this.loading = false;
      return;
    }

    const requests = summaries.map(s =>
      this.dogService.get(s.id).pipe(
        catchError(() => of(null))   // swallow per-dog errors
      )
    );

    forkJoin(requests).subscribe(details => {
      const pins: DogPin[] = [];
      for (const detail of details) {
        if (!detail) continue;
        const pin = this.toPin(detail);
        if (pin) pins.push(pin);
      }

      this.pins = pins;
      this.loading = false;

      if (this.map) {
        this.renderPins(pins);
      } else {
        // Map not yet created (the @if is still gated on loading).
        // Stash the pins so the ViewChild setter can render them.
        this.pendingPins = pins;
      }
    });
  }

  /**
   * Pick the freshest coordinate we have for this dog:
   *  - prefer the latest sighting's coord (sightings arrive newest-first on the
   *    backend; pick the first one that actually has lat/lng)
   *  - fall back to the initial registration coord
   *  - otherwise skip this dog entirely
   */
  private toPin(detail: DogDetail): DogPin | null {
    for (const s of detail.sightings) {
      if (s.latitude != null && s.longitude != null) {
        return {
          id: detail.id,
          lat: s.latitude,
          lng: s.longitude,
          displayName: detail.displayName,
          kind: 'sighting'
        };
      }
    }
    if (detail.initialLatitude != null && detail.initialLongitude != null) {
      return {
        id: detail.id,
        lat: detail.initialLatitude,
        lng: detail.initialLongitude,
        displayName: detail.displayName,
        kind: 'initial'
      };
    }
    return null;
  }

  // --- map setup ---

  private initMap(element: HTMLDivElement): void {
    this.map = L.map(element, { zoomControl: true }).setView(DEFAULT_CENTER, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);
  }

  private renderPins(pins: DogPin[]): void {
    if (!this.map || pins.length === 0) return;

    for (const pin of pins) {
      const icon = L.divIcon({
        className: '',
        html: `<div class="pawid-pin pawid-pin--${pin.kind}"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      });

      const marker = L.marker([pin.lat, pin.lng], { icon }).addTo(this.map);
     marker.bindTooltip(
  `<div class="pawid-card">
     <div class="pawid-card__title">${escapeHtml(pin.displayName)}</div>
     <div class="pawid-card__meta">
       ${pin.kind === 'sighting' ? 'Latest sighting' : 'Registered location'}
     </div>
   </div>`,
  {
    direction: 'top',
    offset: [0, -10],
    opacity: 1,
    sticky: true 
  }
);

      // Navigate to the dog's detail page on marker click.
      // We run this inside NgZone via router.navigate — which is already
      // zone-aware, so no manual zone.run() is needed.
      marker.on('click', () => {
        this.router.navigate(['/dogs', pin.id]);
      });
    }

    // Zoom/pan to include every pin, with padding.
    const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng] as L.LatLngExpression));
    this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }
}

/** Minimal HTML escape so dog names can't break out of the popup markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}