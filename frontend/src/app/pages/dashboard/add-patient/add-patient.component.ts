import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patient.service';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-patient.component.html',
  styleUrl: './add-patient.component.scss'
})
export class AddPatientComponent {
  @Output() close = new EventEmitter<void>();
  @Output() patientAdded = new EventEmitter<any>();

  formData = {
    name: '',
    email: '',
    age: '',
    gender: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private patientService: PatientService) {}

  addPatient() {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.patientService.createPatient(this.formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Patient added successfully!';
        this.patientAdded.emit(res);
        this.resetForm();
        setTimeout(() => this.close.emit(), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to add patient. Please try again.';
        console.error('Error adding patient:', err);
      }
    });
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
