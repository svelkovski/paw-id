import { Component, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { DogService } from "../../core/services/dog.service";
import { DogCardComponent } from "../../shared/dog-card/dog-card.component";
import { DogSummary } from "../../core/models/dog/dog-summary.model";
import { DogSize, DogBadge } from "../../core/models/dog/dog.model";

type SizeFilter = "ALL" | DogSize;
type StatusFilter = "ALL" | DogBadge;

interface Chip<T extends string> {
  value: T;
  label: string;
}

@Component({
  selector: "app-dogs-list",
  standalone: true,
  imports: [FormsModule, RouterLink, DogCardComponent],
  templateUrl: "./dogs-list.component.html",
})
export class DogsListComponent implements OnInit {
  private readonly dogService = inject(DogService);

  dogs: DogSummary[] = [];
  loading = true;
  error: string | null = null;

  searchTerm = "";
  sizeFilter: SizeFilter = "ALL";
  statusFilter: StatusFilter = "ALL";

  readonly sizeChips: Chip<SizeFilter>[] = [
    { value: "ALL", label: "All sizes" },
    { value: "SMALL", label: "Small" },
    { value: "MEDIUM", label: "Medium" },
    { value: "LARGE", label: "Large" },
  ];

  readonly statusChips: Chip<StatusFilter>[] = [
    { value: "ALL", label: "All statuses" },
    { value: "NEW", label: "New" },
    { value: "ACTIVE", label: "Active" },
    { value: "URGENT", label: "Urgent" },
  ];

  get filteredDogs(): DogSummary[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.dogs.filter((dog) => {
      if (this.sizeFilter !== "ALL" && dog.size !== this.sizeFilter)
        return false;
      if (this.statusFilter !== "ALL" && dog.badge !== this.statusFilter)
        return false;

      if (query) {
        const haystack = [dog.displayName, dog.color, dog.areaLabel ?? ""]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.sizeFilter !== "ALL" ||
      this.statusFilter !== "ALL"
    );
  }

  ngOnInit(): void {
    this.dogService.list().subscribe({
      next: (dogs) => {
        this.dogs = dogs;
        this.loading = false;
      },
      error: () => {
        this.error =
          "Unable to load dogs. Is the backend running on localhost:8080?";
        this.loading = false;
      },
    });
  }

  clearFilters(): void {
    this.searchTerm = "";
    this.sizeFilter = "ALL";
    this.statusFilter = "ALL";
  }
}
