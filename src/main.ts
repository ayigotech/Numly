import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
  Router,
  NavigationStart,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { APP_INITIALIZER, inject, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { AudioService } from './app/core/services/audio.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: APP_INITIALIZER,
      useFactory: () => {
        const router = inject(Router);
        const audio = inject(AudioService);
        return () => {
          router.events
            .pipe(filter((e) => e instanceof NavigationStart))
            .subscribe(() => audio.stopBackground());
        };
      },
      multi: true,
    },
  ],
});