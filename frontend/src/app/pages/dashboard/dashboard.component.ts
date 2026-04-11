
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PatientService } from '../../services/patient.service';
import { AddPatientComponent } from './add-patient/add-patient.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, AddPatientComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  patient: any[] = [];
  showAddPatientModal = false;
  isLoadingPatients = true;
  loadingError: string | null = null;

  constructor(private auth: AuthService, private router: Router, private patientService: PatientService) { }

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.getPatients();
  }

  getPatients() {
    this.isLoadingPatients = true;
    this.loadingError = null;
    this.patientService.getPatients().subscribe({
      next: (res) => {
        console.log('Fetched patients:', res);
        this.patient = res;
        this.isLoadingPatients = false;
        console.log(this.patient.length)
      },
      error: (err) => {
        console.error('Failed to fetch patients:', err);
        this.isLoadingPatients = false;
        this.loadingError = err.error?.message || 'Failed to load patients. Please try again.';
      }
    });
  }

  openAddPatientModal(): void {
    this.showAddPatientModal = true;
  }

  closeAddPatientModal(): void {
    this.showAddPatientModal = false;
  }

  onPatientAdded(newPatient: any): void {
    this.patient.push(newPatient);
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  isDoctor(): boolean {
    return this.currentUser?.role === 'DOCTOR';
  }

  isReceptionist(): boolean {
    return this.currentUser?.role === 'RECEPTIONIST';
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearAccessToken();
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error('Logout failed:', err);
        this.auth.clearAccessToken();
        this.router.navigate(['/']);
      }
    });
  }
}
