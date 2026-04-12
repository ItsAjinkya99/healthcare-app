
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppState } from '../../store/app.state';
import { selectUser, selectUserRole } from '../../store/auth/auth.selectors';
import { selectPatients, selectPatientsLoading, selectPatientsError } from '../../store/patient/patient.selectors';
import { loadUserFromStorage, logout } from '../../store/auth/auth.actions';
import { AddPatientComponent } from './add-patient/add-patient.component';
import { getPatients, loadPatientsFromStorage } from '../../store/patient/patient.actions';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AddPatientComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  showAddPatientModal = false;

  // Selectors from store
  currentUser$!: Observable<any>;
  patients$!: Observable<any>;
  isLoadingPatients$!: Observable<boolean>;
  loadingError$!: Observable<string | null>;
  userRole$!: Observable<string | null>;

  // Helper observable for checking roles (defined in ngOnInit)
  isAdmin$!: Observable<boolean>;
  isDoctor$!: Observable<boolean>;
  isReceptionist$!: Observable<boolean>;

  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>, private router: Router) { }

  ngOnInit() {
    // Initialize selectors after store is available
    this.currentUser$ = this.store.select(selectUser);
    this.patients$ = this.store.select(selectPatients);
    this.isLoadingPatients$ = this.store.select(selectPatientsLoading);
    this.loadingError$ = this.store.select(selectPatientsError);
    this.userRole$ = this.store.select(selectUserRole);

    // Helper observables for checking roles
    this.isAdmin$ = this.userRole$.pipe(map(role => role === 'ADMIN'));
    this.isDoctor$ = this.userRole$.pipe(map(role => role === 'DOCTOR'));
    this.isReceptionist$ = this.userRole$.pipe(map(role => role === 'RECEPTIONIST'));

    // Dispatch action to load patients

    localStorage.getItem('patients') ? this.store.dispatch(loadPatientsFromStorage()) : this.store.dispatch(getPatients());

    this.store.dispatch(loadUserFromStorage());

  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAddPatientModal(): void {
    this.showAddPatientModal = true;
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal = false;
  }

  onPatientAdded(newPatient: any): void {
    // Patient will be added to store via effects
    this.showAddPatientModal = false;
  }

  logout() {
    this.store.dispatch(logout());
    this.router.navigate(['/']);
  }
}
