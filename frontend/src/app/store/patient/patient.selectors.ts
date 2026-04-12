import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PatientState } from './patient.reducer';

// Feature selector
export const selectPatientState = createFeatureSelector<PatientState>('patient');

// Selectors
export const selectPatients = createSelector(
  selectPatientState,
  (state: PatientState) => state.patients
);

export const selectPatientsLoading = createSelector(
  selectPatientState,
  (state: PatientState) => state.isLoading
);

export const selectPatientsError = createSelector(
  selectPatientState,
  (state: PatientState) => state.error
);

export const selectPatientCount = createSelector(
  selectPatients,
  (patients: any[]) => patients?.length || 0
);

export const selectPatientById = (id: string) =>
  createSelector(
    selectPatients,
    (patients: any[]) => patients?.find((p) => p.id === id) || null
  );
