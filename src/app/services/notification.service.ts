import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject<Notification[]>(this.notifications);

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  addNotification(message: string): void {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      timestamp: Date.now()
    };
    this.notifications.push(newNotification);
    this.notificationsSubject.next(this.notifications);

    setTimeout(() => {
      this.removeNotification(newNotification.id);
    }, 5000);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(notify => notify.id !== id);
    this.notificationsSubject.next(this.notifications);
  }
}
