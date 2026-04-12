import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { authReducer } from './store/auth/auth.reducer';
import { patientReducer } from './store/patient/patient.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { PatientEffects } from './store/patient/patient.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore({
      auth: authReducer,
      patient: patientReducer
    }),
    provideEffects([AuthEffects, PatientEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false })
  ]
};
