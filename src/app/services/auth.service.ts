import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  login(email: string, password: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }

  signup(email: string, password: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 1000);
    });
  }
  
  logout(): Promise<void> {
    return new Promise((resolve) => {
      localStorage.removeItem('currentUser');
      setTimeout(() => resolve(), 500);
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }
}
