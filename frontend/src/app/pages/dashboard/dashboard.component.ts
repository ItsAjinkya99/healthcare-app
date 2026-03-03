
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
patient: any[] = [];
  constructor(private auth: AuthService, private router: Router, private patientService: Patie) {}

  ngOnInit() {
    this.currentUser = this.auth.getUser();
  }

  getPatients() {
    this.auth.getPatients().subscribe({
      next: (res) => {
        this.patient = res;
      },
      error: (err) => {
        console.error('Failed to fetch patients:', err);
      }
    });
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
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
