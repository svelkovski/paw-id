import { Component, Input, inject } from "@angular/core";
import { RouterLink } from "@angular/router";

import { DogService } from "../../core/services/dog.service";
import { DogSummary } from "../../core/models/dog/dog-summary.model";

@Component({
  selector: "app-dog-card",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./dog-card.component.html",
})
export class DogCardComponent {
  @Input({ required: true }) dog!: DogSummary;

  private readonly dogService = inject(DogService);

  get photoUrl(): string | null {
    return this.dogService.resolvePhotoUrl(this.dog.photoUrl);
  }

  get sizeLabel(): string {
    return titleCase(this.dog.size);
  }

  get badgeLabel(): string {
    return titleCase(this.dog.badge);
  }

  get badgeClass(): string {
    return `badge badge--${this.dog.badge.toLowerCase()}`;
  }
}

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}
