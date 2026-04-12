import { AuthState } from './auth/auth.reducer';
import { PatientState } from './patient/patient.reducer';

export interface AppState {
  auth: AuthState;
  patient: PatientState;
}
