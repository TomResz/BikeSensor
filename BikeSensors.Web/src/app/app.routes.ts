import { Routes } from '@angular/router';
import { DashboardComponent } from '../components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  { path: '**', redirectTo: '' },
];
