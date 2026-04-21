import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DogService } from '../../core/services/dog.service';
import { DogSummary } from '../../core/models/dog.model';

/**
 * Pure presentational card for a dog in a grid.
 * Takes a DogSummary and renders the photo (or placeholder), badge, name, and meta.
 * The whole card is a link to /dogs/{id} — navigation is built in.
 *
 * Reused by the home page ("Recently registered") and the browse-profiles page.
 */
@Component({
  selector: 'app-dog-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dog-card.component.html'
})
export class DogCardComponent {

  @Input({ required: true }) dog!: DogSummary;

  private readonly dogService = inject(DogService);

  // --- view-model getters ---
  // Each getter re-runs on every change detection cycle. For a single card
  // that's cheap, and it saves a lot of boilerplate vs. precomputing fields.

  get photoUrl(): string | null {
    return this.dogService.resolvePhotoUrl(this.dog.photoUrl);
  }

  /** e.g. "SMALL" -> "Small" for display. */
  get sizeLabel(): string {
    return titleCase(this.dog.size);
  }

  /** e.g. "URGENT" -> "Urgent". */
  get badgeLabel(): string {
    return titleCase(this.dog.badge);
  }

  /** CSS class combo for the status badge, e.g. "badge badge--urgent". */
  get badgeClass(): string {
    return `badge badge--${this.dog.badge.toLowerCase()}`;
  }
}

/** Capitalise the first letter, lowercase the rest. Top-level helper since it's pure. */
function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
