
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/app.state';
import { selectIsLoading, selectAuthError, selectIsLoggedIn } from '../../store/auth/auth.selectors';
import { login } from '../../store/auth/auth.actions';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  errorMessage = '';

  isLoading$!: any;
  error$!: any;
  isLoggedIn$!: any;

  constructor(private store: Store<AppState>, private router: Router) {}

  ngOnInit() {
    // Initialize selectors after store is available
    this.isLoading$ = this.store.select(selectIsLoading);
    this.error$ = this.store.select(selectAuthError);
    this.isLoggedIn$ = this.store.select(selectIsLoggedIn);

    // If already logged in, redirect to dashboard
    this.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      if (isLoggedIn) {
        this.router.navigateByUrl('/dashboard');
      }
    });
  }

  login() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.store.dispatch(login({ email: this.email, password: this.password }));
  }
}
