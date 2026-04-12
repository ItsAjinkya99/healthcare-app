import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../store/app.state';
import { selectPatientsLoading, selectPatientsError } from '../../../store/patient/patient.selectors';
import { createPatient, createPatientSuccess } from '../../../store/patient/patient.actions';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-patient.component.html',
  styleUrl: './add-patient.component.scss'
})
export class AddPatientComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() patientAdded = new EventEmitter<any>();

  formData = {
    name: '',
    email: '',
    age: '',
    gender: ''
  };

  errorMessage = '';
  successMessage = '';

  isLoading$!: any;
  error$!: any;

  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    // Initialize selectors after store is available
    this.isLoading$ = this.store.select(selectPatientsLoading);
    this.error$ = this.store.select(selectPatientsError);

    // Listen for errors from the store
    this.error$.pipe(takeUntil(this.destroy$)).subscribe((error: string | null) => {
      if (error) {
        this.errorMessage = error;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addPatient() {
    if (!this.validateForm()) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = 'Adding patient...';

    this.store.dispatch(createPatient({ patientData: this.formData }));

    // Wait for success and then close
    setTimeout(() => {
      this.patientAdded.emit(this.formData);
      this.resetForm();
      this.close.emit();
    }, 1500);
  }

  private validateForm(): boolean {
    if (!this.formData.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }

    if (!this.formData.email.trim()) {
      this.errorMessage = 'Email is required';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage = 'Please enter a valid email';
      return false;
    }

    if (!this.formData.age || parseInt(this.formData.age) <= 0) {
      this.errorMessage = 'Age must be a positive number';
      return false;
    }

    if (!this.formData.gender) {
      this.errorMessage = 'Please select a gender';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.formData = {
      name: '',
      email: '',
      age: '',
      gender: ''
    };
  }

  onCancel(): void {
    this.resetForm();
    this.errorMessage = '';
    this.successMessage = '';
    this.close.emit();
  }
}
