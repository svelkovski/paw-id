import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";

import { DogService } from "../../core/services/dog.service";
import { DogSummary } from "../../core/models/dog.model";
import { DogCardComponent } from "../../shared/dog-card/dog-card.component";
import { DonateModalComponent } from '../../shared/donate-modal/donate-modal';


@Component({
  selector: "app-home",
  standalone: true,
  imports: [RouterLink, DogCardComponent, DonateModalComponent],
  templateUrl: "./home.component.html",
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly dogService = inject(DogService);

  dogs: DogSummary[] = [];
  loading = true;
  error: string | null = null;

  @ViewChild("howItWorks") howItWorksRef?: ElementRef<HTMLElement>;

  // Controls the donate modal visibility.
  readonly showDonateModal = signal(false);

  @ViewChild("statsSection")
  set statsSection(ref: ElementRef<HTMLElement> | undefined) {
    if (!ref || this.statsAnimated) {
      return;
    }
    if (this.prefersReducedMotion()) {
      this.animatedTotalDogs.set(this.totalDogs);
      this.animatedTotalSightings.set(this.totalSightings);
      this.animatedUrgentCount.set(this.urgentCount);
      this.statsAnimated = true;
      return;
    }
    this.setupStatsObserver(ref.nativeElement);
  }

  currentStep = signal(0);
  lineProgress = signal(0);

  animatedTotalDogs = signal(0);
  animatedTotalSightings = signal(0);
  animatedUrgentCount = signal(0);

  private howItWorksObserver?: IntersectionObserver;
  private statsObserver?: IntersectionObserver;
  private statsAnimated = false;
  private animationTimeouts: ReturnType<typeof setTimeout>[] = [];
  private animationFrames: number[] = [];

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

  ngAfterViewInit(): void {
    if (!this.howItWorksRef) {
      return;
    }

    if (this.prefersReducedMotion()) {
      this.currentStep.set(4);
      this.lineProgress.set(1);
      return;
    }

    this.howItWorksObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && this.currentStep() === 0) {
            this.animateHowItWorks();
            this.howItWorksObserver?.disconnect();
          }
        }
      },
      { threshold: 0.3 }
    );

    this.howItWorksObserver.observe(this.howItWorksRef.nativeElement);
  }

  private setupStatsObserver(element: HTMLElement): void {
    this.statsObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !this.statsAnimated) {
            this.statsAnimated = true;
            this.animateCounter(this.animatedTotalDogs, this.totalDogs, 1400);
            this.animateCounter(
              this.animatedTotalSightings,
              this.totalSightings,
              1600
            );
            this.animateCounter(
              this.animatedUrgentCount,
              this.urgentCount,
              1200
            );
            this.statsObserver?.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );

    this.statsObserver.observe(element);
  }

  private animateCounter(
    target: ReturnType<typeof signal<number>>,
    toValue: number,
    duration: number
  ): void {
    if (toValue === 0) {
      target.set(0);
      return;
    }

    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = Math.round(toValue * ease(progress));
      target.set(value);

      if (progress < 1) {
        const frame = requestAnimationFrame(tick);
        this.animationFrames.push(frame);
      }
    };

    const frame = requestAnimationFrame(tick);
    this.animationFrames.push(frame);
  }

  private animateHowItWorks(): void {
    const schedule = (fn: () => void, delay: number) => {
      this.animationTimeouts.push(setTimeout(fn, delay));
    };

    schedule(() => this.currentStep.set(1), 100);
    schedule(() => this.lineProgress.set(1 / 3), 600);
    schedule(() => this.currentStep.set(2), 1100);
    schedule(() => this.lineProgress.set(2 / 3), 1400);
    schedule(() => this.currentStep.set(3), 1900);
    schedule(() => this.lineProgress.set(1), 2200);
    schedule(() => this.currentStep.set(4), 2700);
  }

  private prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  ngOnDestroy(): void {
    this.howItWorksObserver?.disconnect();
    this.statsObserver?.disconnect();
    this.animationTimeouts.forEach((t) => clearTimeout(t));
    this.animationFrames.forEach((f) => cancelAnimationFrame(f));
    this.animationTimeouts = [];
    this.animationFrames = [];
  }

  // --- donate modal handlers ---

  onDonateClick(): void {
    this.showDonateModal.set(true);
  }

  onDonateClose(): void {
    this.showDonateModal.set(false);
  }

  onDonateSubmit(amount: number): void {
    // TODO: wire up to a real payment provider.
    // For now, log the amount and close — replace with Stripe/PayPal redirect later.
    console.log('Donation requested:', amount, 'EUR');
    this.showDonateModal.set(false);
    alert(`Thank you! Proceeding to payment for €${amount}. (Payment provider not yet configured.)`);
  }
}