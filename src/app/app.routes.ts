import { Routes } from '@angular/router';
import { LoginSignupComponent } from './components/login-signup/login-signup.component';
import { TaskDashboardComponent } from './components/task-dashboard/task-dashboard.component';
import { AnalyticsDashboardComponent } from './components/analytics-dashboard/analytics-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginSignupComponent },
  { path: 'tasks', component: TaskDashboardComponent, canActivate: [AuthGuard] },
  { path: 'analytics', component: AnalyticsDashboardComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
