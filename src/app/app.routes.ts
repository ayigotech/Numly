import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full',
  },
  {
    path: 'splash',
    loadComponent: () =>
      import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'age',
    loadComponent: () => import('./pages/age/age.page').then( m => m.AgePage)
  },
  {
    path: 'skills/subitizing',
    loadComponent: () =>
      import('./pages/skills/subitizing/subitizing/subitizing.page').then(
        (m) => m.SubitizingPage
      ),
  },

];