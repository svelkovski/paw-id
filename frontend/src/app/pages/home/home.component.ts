import { Component, inject, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

import { DogService } from "../../core/services/dog.service";
import { DogSummary } from "../../core/models/dog.model";
import { DogCardComponent } from "../../shared/dog-card/dog-card.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink, DogCardComponent],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit {
  private readonly dogService = inject(DogService);

  dogs: DogSummary[] = [];
  loading = true;
  error: string | null = null;

  get totalDogs(): number {
    return this.dogs.length;
  }

  get totalSightings(): number {
    return this.dogs.reduce((sum, d) => sum + d.sightingCount, 0);
  }

  get urgentCount(): number {
    return this.dogs.filter((d) => d.badge === "URGENT").length;
  }

  get recentDogs(): DogSummary[] {
    return this.dogs.slice(0, 4);
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
}
