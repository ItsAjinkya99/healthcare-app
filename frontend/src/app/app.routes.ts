
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './gaurds/auth.guard';
import { roleGuard } from './gaurds/role.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] }
  },
  { path: '**', redirectTo: '' }
];
