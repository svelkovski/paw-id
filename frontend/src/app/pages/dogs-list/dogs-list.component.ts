import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { DogService } from '../../core/services/dog.service';
import { DogBadge, DogSize, DogSummary } from '../../core/models/dog.model';
import { DogCardComponent } from '../../shared/dog-card/dog-card.component';

/**
 * Filter values include an "ALL" sentinel to mean "no filter".
 * We use these union types in the template so the compiler catches typos.
 */
type SizeFilter   = 'ALL' | DogSize;
type StatusFilter = 'ALL' | DogBadge;

/**
 * Each chip row is data-driven: we iterate these arrays in the template
 * instead of hard-coding each button, which makes it trivial to add or
 * remove options later without touching the template.
 */
interface Chip<T extends string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-dogs-list',
  standalone: true,
  imports: [FormsModule, RouterLink, DogCardComponent],
  templateUrl: './dogs-list.component.html'
})
export class DogsListComponent implements OnInit {

  private readonly dogService = inject(DogService);

  // --- state ---
  dogs: DogSummary[] = [];
  loading = true;
  error: string | null = null;

  // Filter state — plain fields bound with [(ngModel)] or updated via click handlers.
  searchTerm = '';
  sizeFilter: SizeFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';

  // --- chip definitions ---
  readonly sizeChips: Chip<SizeFilter>[] = [
    { value: 'ALL',    label: 'All sizes' },
    { value: 'SMALL',  label: 'Small' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LARGE',  label: 'Large' }
  ];

  readonly statusChips: Chip<StatusFilter>[] = [
    { value: 'ALL',    label: 'All statuses' },
    { value: 'NEW',    label: 'New' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  // --- derived ---

  /**
   * Apply all three filters (search text, size, status).
   * Runs on every change detection cycle — fine for a few hundred dogs.
   * If the list grew into the thousands we'd debounce the search and/or
   * cache the result; for MVP this is the simplest correct implementation.
   */
  get filteredDogs(): DogSummary[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.dogs.filter(dog => {
      if (this.sizeFilter   !== 'ALL' && dog.size   !== this.sizeFilter)   return false;
      if (this.statusFilter !== 'ALL' && dog.badge  !== this.statusFilter) return false;

      if (query) {
        const haystack = [
          dog.displayName,
          dog.color,
          dog.areaLabel ?? ''
        ].join(' ').toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }

  get hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0
        || this.sizeFilter   !== 'ALL'
        || this.statusFilter !== 'ALL';
  }

  // --- lifecycle ---

  ngOnInit(): void {
    this.dogService.list().subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dogs. Is the backend running on localhost:8080?';
        this.loading = false;
      }
    });
  }

  // --- actions ---

  clearFilters(): void {
    this.searchTerm = '';
    this.sizeFilter = 'ALL';
    this.statusFilter = 'ALL';
  }
}
