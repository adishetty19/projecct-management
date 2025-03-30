import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users: User[] = [
    { id: 'anil-manager@example.com', name: 'Anil', email: 'anil-manager@example.com', role: 'Manager' },
    { id: 'aditya-member@example.com', name: 'Aditya', email: 'aditya-member@example.com', role: 'Member' }
  ];
  
  private usersSubject: BehaviorSubject<User[]> = new BehaviorSubject<User[]>(this.users);

  getUsers(): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  getUserByEmail(email: string): User | undefined {
    let user = this.users.find(u => u.email === email);
    if (!user) {
      if (email.includes('-manager@')) {
        const name = email.split('-manager@')[0];
        user = { id: email, name, email, role: 'Manager' };
      } else if (email.includes('-member@')) {
        const name = email.split('-member@')[0];
        user = { id: email, name, email, role: 'Member' };
      }
      if (user) {
        this.users.push(user);
        this.usersSubject.next(this.users);
      }
    }
    return user;
  }

  updateUser(user: User): void {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
    this.usersSubject.next(this.users);
  }
}
