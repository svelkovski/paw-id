import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'PawID — Stray dog registry'
  },
  {
    path: 'dogs',
    loadComponent: () => import('./pages/dogs-list/dogs-list.component').then(m => m.DogsListComponent),
    title: 'PawID — Browse profiles'
  },
  {
    path: 'dogs/register',
    loadComponent: () => import('./pages/register-dog/register-dog.component').then(m => m.RegisterDogComponent),
    title: 'PawID — Register a dog'
  },
  {
    path: 'dogs/:id',
    loadComponent: () => import('./pages/dog-detail/dog-detail.component').then(m => m.DogDetailComponent),
    title: 'PawID — Dog profile'
  },
  {
    path: 'dogs/:id/report',
    loadComponent: () => import('./pages/report-sighting/report-sighting.component').then(m => m.ReportSightingComponent),
    title: 'PawID — Report a sighting'
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
    title: 'PawID — About'
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent),
    title: 'PawID — Privacy Policy'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    title: 'PawID — Sign in'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'PawID — Create account'
  },
  {
    path: 'map',
    loadComponent: () => import('./pages/map/map').then(m => m.MapPageComponent),
    title: 'PawID — Map'
  },
  { path: '**', redirectTo: '' }
];
