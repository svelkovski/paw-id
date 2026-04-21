import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateDogRequest,
  CreateSightingRequest,
  DogDetail,
  DogSummary,
  Sighting
} from '../models/dog.model';

/**
 * The base URL of the Spring Boot API.
 * Moved to a constant so it's easy to change in one place.
 * In a multi-environment setup you'd promote this to an Angular environment file,
 * but for a 4-day local project a constant is clearer.
 */
const API_BASE = 'http://localhost:8080';

/**
 * Single place that knows how to talk to the backend. Every page/component
 * goes through this service — never calls HttpClient directly. That keeps
 * URL and payload concerns out of the UI layer.
 */
@Injectable({ providedIn: 'root' })
export class DogService {

  private readonly http = inject(HttpClient);

  /** GET /api/dogs — newest first. */
  list(): Observable<DogSummary[]> {
    return this.http.get<DogSummary[]>(`${API_BASE}/api/dogs`);
  }

  /** GET /api/dogs/{id} — full profile incl. all sightings. */
  get(id: number): Observable<DogDetail> {
    return this.http.get<DogDetail>(`${API_BASE}/api/dogs/${id}`);
  }

  /**
   * POST /api/dogs — register a new dog.
   * Sent as multipart/form-data because we may also be uploading a photo.
   * The JSON part must be typed as application/json so Spring's @RequestPart deserialises it correctly.
   */
  create(data: CreateDogRequest, photo: File | null): Observable<DogDetail> {
    const form = buildMultipartForm(data, photo);
    return this.http.post<DogDetail>(`${API_BASE}/api/dogs`, form);
  }

  /** POST /api/dogs/{id}/sightings — report a follow-up sighting. */
  reportSighting(dogId: number, data: CreateSightingRequest, photo: File | null): Observable<Sighting> {
    const form = buildMultipartForm(data, photo);
    return this.http.post<Sighting>(`${API_BASE}/api/dogs/${dogId}/sightings`, form);
  }

  /**
   * Turn a backend-relative photo URL (e.g. "/uploads/abc.jpg") into an absolute URL
   * the browser can load. Returns null if the dog has no photo.
   */
  resolvePhotoUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  }
}

/**
 * Build a multipart/form-data payload with:
 *   - part "data"  : the JSON body (typed as application/json)
 *   - part "photo" : the optional image file
 *
 * The JSON-as-Blob trick is what makes Spring's @RequestPart work cleanly —
 * otherwise the field arrives as a plain string and Spring won't deserialise it.
 */
function buildMultipartForm(data: object, photo: File | null): FormData {
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photo) {
    form.append('photo', photo);
  }
  return form;
}
