
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from './store/app.state';
import { loadUserFromStorage } from './store/auth/auth.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <h1>HealthCare Dashboard</h1>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    // Load user from localStorage on app initialization
    this.store.dispatch(loadUserFromStorage());
  }
}
