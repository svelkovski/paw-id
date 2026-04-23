import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateDogRequest } from '../models/dog/create-dog-request.model';
import { DogDetail } from '../models/dog/dog-detail.model';
import { DogSummary } from '../models/dog/dog-summary.model';
import { CreateSightingRequest } from '../models/sighting/create-sighting-request.model';
import { Sighting } from '../models/sighting/sighting.model';

const API_BASE = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class DogService {

  private readonly http = inject(HttpClient);

  list(): Observable<DogSummary[]> {
    return this.http.get<DogSummary[]>(`${API_BASE}/api/dogs`);
  }

  get(id: number): Observable<DogDetail> {
    return this.http.get<DogDetail>(`${API_BASE}/api/dogs/${id}`);
  }

  create(data: CreateDogRequest, photo: File | null): Observable<DogDetail> {
    const form = buildMultipartForm(data, photo);
    return this.http.post<DogDetail>(`${API_BASE}/api/dogs`, form);
  }

  reportSighting(dogId: number, data: CreateSightingRequest, photo: File | null): Observable<Sighting> {
    const form = buildMultipartForm(data, photo);
    return this.http.post<Sighting>(`${API_BASE}/api/dogs/${dogId}/sightings`, form);
  }

  resolvePhotoUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url.startsWith('http') ? url : `${API_BASE}${url}`;
  }
}

function buildMultipartForm(data: object, photo: File | null): FormData {
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
  if (photo) {
    form.append('photo', photo);
  }
  return form;
}
