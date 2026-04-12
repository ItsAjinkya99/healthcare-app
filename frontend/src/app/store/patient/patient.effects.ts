import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { switchMap, map, catchError, tap, exhaustMap } from 'rxjs/operators';
import { PatientService } from '../../services/patient.service';
import * as PatientActions from './patient.actions';

@Injectable()
export class PatientEffects {
  getPatients$!: any;
  createPatient$!: any;
  createPatientSuccess$!: any;
  loadPatientsFromStorage$!: any;

  constructor(
    private actions$: Actions,
    private patientService: PatientService
  ) {
    this.getPatients$ = createEffect(() =>
      this.actions$.pipe(
        ofType(PatientActions.getPatients),
        switchMap(() =>
          this.patientService.getPatients().pipe(
            tap((patients) => {
              // Save patients to localStorage
              localStorage.setItem('patients', JSON.stringify(patients));
            }),
            map((patients) =>
              PatientActions.getPatientsSuccess({ patients })
            ),
            catchError((error) =>
              of(PatientActions.getPatientsFailure({
                error: error.error?.message || 'Failed to fetch patients'
              }))
            )
          )
        )
      )
    );

    this.createPatient$ = createEffect(() =>
      this.actions$.pipe(
        ofType(PatientActions.createPatient),
        exhaustMap(({ patientData }) =>
          this.patientService.createPatient(patientData).pipe(
            map((patient) =>
              PatientActions.createPatientSuccess({ patient })
            ),
            catchError((error) =>
              of(PatientActions.createPatientFailure({
                error: error.error?.message || 'Failed to create patient'
              }))
            )
          )
        )
      )
    );

    this.createPatientSuccess$ = createEffect(
      () =>
        this.actions$.pipe(
          ofType(PatientActions.createPatientSuccess),
          tap(() => {
            // You can add a notification here if needed
            console.log('Patient created successfully');
          })
        ),
      { dispatch: false }
    );

    this.loadPatientsFromStorage$ = createEffect(()=>
        this.actions$.pipe(
          ofType(PatientActions.loadPatientsFromStorage),
          map(() => {
            const patientsData = localStorage.getItem('patients');
            const patients = patientsData ? JSON.parse(patientsData) : [];
            return PatientActions.getPatientsSuccess({ patients });
          })
    ))
    
  }
}
