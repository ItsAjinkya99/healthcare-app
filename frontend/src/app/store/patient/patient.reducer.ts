import { createReducer, on } from '@ngrx/store';
import * as PatientActions from './patient.actions';

export interface PatientState {
  patients: any[];
  isLoading: boolean;
  error: string | null;
}

export const initialPatientState: PatientState = {
  patients: [],
  isLoading: false,
  error: null
};

export const patientReducer = createReducer(
  initialPatientState,

  // Get Patients
  on(PatientActions.getPatients, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(PatientActions.getPatientsSuccess, (state, { patients }) => ({
    ...state,
    patients,
    isLoading: false,
    error: null
  })),

  on(PatientActions.getPatientsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Create Patient
  on(PatientActions.createPatient, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(PatientActions.createPatientSuccess, (state, { patient }) => ({
    ...state,
    patients: [...state.patients, patient],
    isLoading: false,
    error: null
  })),

  on(PatientActions.createPatientFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Clear state
  on(PatientActions.clearPatientsState, (state) => ({
    ...initialPatientState
  }))
);
