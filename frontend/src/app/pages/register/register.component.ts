import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../store/app.state';
import { selectIsLoading, selectAuthError, selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { register } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = '';
  errorMessage = '';
  successMessage = '';

  isLoading$!: any;
  error$!: any;
  isLoggedIn$!: any;

  private destroy$ = new Subject<void>();

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit() {
    // Initialize selectors after store is available
    this.isLoading$ = this.store.select(selectIsLoading);
    this.error$ = this.store.select(selectAuthError);
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);

    // If already logged in, redirect to dashboard
    this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigateByUrl('/dashboard');
      }
    });

    // Handle registration success
    this.isLoggedIn$.pipe(takeUntil(this.destroy$)).subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn && this.successMessage) {
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  register() {
    if (!this.name || !this.email || !this.password || !this.confirmPassword || !this.role) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.errorMessage = '';
    this.successMessage = 'Account created successfully! Redirecting...';

    this.store.dispatch(register({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role
    }));
  }
}
