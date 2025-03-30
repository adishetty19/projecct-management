import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-signup.component.html',
  styleUrls: ['./login-signup.component.css']
})
export class LoginSignupComponent {
  email: string = '';
  password: string = '';
  isLogin: boolean = true;
  message: string = '';
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  toggleMode(): void {
    this.isLogin = !this.isLogin;
  }

  onSubmit(): void {
    if (this.isLogin) {
      this.message = 'Logging in...';
      this.authService.login(this.email, this.password)
        .then(() => {
          const user = this.userService.getUserByEmail(this.email);
          if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.message = `Logged in as ${user.name} (${user.role})`;
          } else {
            this.message = 'User not found. Please sign up.';
          }
        })
        .catch(err => {
          this.message = 'Error during login.';
          console.error(err);
        });
    } else {
      this.message = 'Signing up...';
      this.authService.signup(this.email, this.password)
        .then(() => {
          const user = this.userService.getUserByEmail(this.email);
          if (user) {
            this.userService.updateUser(user);
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.message = `Signup successful. Welcome, ${user.name} (${user.role})!`;
          } else {
            this.message = 'There was an error creating the user.';
          }
        })
        .catch(err => {
          this.message = 'Error during signup.';
          console.error(err);
        });
    }
  }
}
