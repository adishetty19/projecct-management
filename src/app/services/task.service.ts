import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksKey = 'tasks';
  private tasksSubject: BehaviorSubject<Task[]>;

  constructor(){
    const tasks = this.getStoredTasks();
    this.tasksSubject = new BehaviorSubject<Task[]>(tasks);
  }

  private getStoredTasks(): Task[] {
    const data = localStorage.getItem(this.tasksKey);
    return data ? JSON.parse(data) : [];
  }

  private updateStorage(tasks: Task[]): void {
    localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  addTask(task: Task): void {
    const tasks = this.getStoredTasks();
    tasks.push(task);
    this.updateStorage(tasks);
    this.tasksSubject.next(tasks);
  }

  updateTask(updatedTask: Task): void {
    const tasks = this.getStoredTasks().map(t => t.id === updatedTask.id ? updatedTask : t);
    this.updateStorage(tasks);
    this.tasksSubject.next(tasks);
  }

  deleteTask(id: number): void {
    const tasks = this.getStoredTasks().filter(t => t.id !== id);
    this.updateStorage(tasks);
    this.tasksSubject.next(tasks);
  }
}
