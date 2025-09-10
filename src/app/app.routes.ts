import { Routes } from '@angular/router';
import { MainComponent } from './widgets/main/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
        runGuardsAndResolvers: 'always',
      },
      {
        path: 'access',
        loadComponent: () =>
          import('./features/auth/pages/access/access.page').then(
            (m) => m.AccessPage
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/pages/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'inspections',
        loadComponent: () =>
          import(
            './features/dashboard/pages/inspections/inspections.page'
          ).then((m) => m.InspectionsPage),
      },
      {
        path: 'inspection',
        pathMatch: 'full',
        redirectTo: 'inspections',
      },
      {
        path: 'inspection/:id',
        loadComponent: () =>
          import('./features/dashboard/pages/inspection/inspection.page').then(
            (m) => m.InspectionPage
          ),
      },
      {
        path: 'inspection/:id/expenses',
        loadComponent: () =>
          import('./features/dashboard/pages/expenses/expenses.page').then(
            (m) => m.ExpensesPage
          ),
      },
      {
        path: 'inspection/:id/policies',
        loadComponent: () =>
          import('./features/dashboard/pages/policies/policies.page').then(
            (m) => m.PoliciesPage
          ),
      },
      {
        path: 'advance',
        loadComponent: () =>
          import('./features/dashboard/pages/advance/advance.page').then(
            (m) => m.AdvancePage
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/pages/profile/profile.page').then(
            (m) => m.ProfilePage
          ),
      },
    ],
  },
  {
    path: 'onboard',
    loadComponent: () =>
      import('./features/onboard/pages/onboard/onboard.page').then(
        (m) => m.OnboardPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'onboard',
    loadComponent: () =>
      import('./features/onboard/pages/onboard/onboard.page').then(
        (m) => m.OnboardPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'expenses',
    loadComponent: () => import('./features/dashboard/pages/expenses/expenses.page').then( m => m.ExpensesPage)
  },
];
