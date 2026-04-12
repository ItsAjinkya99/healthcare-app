import { createAction, props } from '@ngrx/store';

// Get Patients
export const getPatients = createAction(
  '[Patient Page] Get Patients'
);

export const getPatientsSuccess = createAction(
  '[Patient API] Get Patients Success',
  props<{ patients: any[] }>()
);

export const getPatientsFailure = createAction(
  '[Patient API] Get Patients Failure',
  props<{ error: string }>()
);

// Create Patient
export const createPatient = createAction(
  '[Patient Page] Create Patient',
  props<{ patientData: any }>()
);

export const createPatientSuccess = createAction(
  '[Patient API] Create Patient Success',
  props<{ patient: any }>()
);

export const createPatientFailure = createAction(
  '[Patient API] Create Patient Failure',
  props<{ error: string }>()
);

// Clear patients state
export const clearPatientsState = createAction(
  '[Patient] Clear Patients State'
);

export const loadPatientsFromStorage = createAction(
  '[Patient] Load Patients From Storage'
);
