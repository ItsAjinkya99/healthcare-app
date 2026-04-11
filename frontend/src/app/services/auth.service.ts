
import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  accessToken: string;
  user: { id: string; name: string; email: string; role: string };
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUser = signal<any>(this.getUserFromToken());
  public currentUser$ = computed(() => this.currentUser());
  private tokenRefreshTimer: any;

  constructor(private http: HttpClient) {
    this.startTokenRefreshTimer();
  }

  register(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/register`, 
      data,
      { withCredentials: true }
    );
  }

  login(data: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`, 
      data,
      { withCredentials: true }
    );
  }

  /**
   * Save access token to localStorage
   * Refresh token is automatically stored in HTTPOnly cookie by backend
   */
  saveAccessToken(accessToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    this.currentUser.set(this.getUserFromToken());
    this.startTokenRefreshTimer();
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Refresh access token
   * Browser automatically sends refresh token cookie
   */
  refreshAccessToken(): Observable<{ accessToken: string }> {
    return this.http.post<{ accessToken: string }>(
      `${this.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Logout - backend clears refresh token cookie
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
  }

  /**
   * Clear access token from localStorage
   */
  clearAccessToken(): void {
    localStorage.removeItem('accessToken');
    this.currentUser.set(null);
    this.clearTokenRefreshTimer();
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getUser() {
    return this.currentUser();
  }

  private getUserFromToken(): any {
    const token = this.getAccessToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      return null;
    }
  }

  getRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Check if access token is expired
   */
  isAccessTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Date.now() >= expirationTime;
    } catch (e) {
      return true;
    }
  }

  /**
   * Get time until access token expires (in milliseconds)
   */
  getTimeUntilTokenExpiry(): number {
    const token = this.getAccessToken();
    if (!token) return 0;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000;
      return Math.max(0, expirationTime - Date.now());
    } catch (e) {
      return 0;
    }
  }

  /**
   * Start auto-refresh timer (refresh 1 minute before expiry)
   */
  private startTokenRefreshTimer(): void {
    this.clearTokenRefreshTimer();

    const timeUntilExpiry = this.getTimeUntilTokenExpiry();
    const refreshTime = Math.max(30000, timeUntilExpiry - 60000);

    if (refreshTime > 0) {
      this.tokenRefreshTimer = setTimeout(() => {
        this.refreshAccessToken().subscribe({
          next: (response) => {
            this.saveAccessToken(response.accessToken);
          },
          error: (err) => {
            console.error('Token refresh failed:', err);
            this.clearAccessToken();
          }
        });
      }, refreshTime);
    }
  }

  /**
   * Clear the refresh timer
   */
  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }
}
