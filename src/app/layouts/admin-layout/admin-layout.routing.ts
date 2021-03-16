import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';

export const AdminLayoutRoutes: Routes = [
    { path: '',           component: DashboardComponent },
    { path: 'demo',       component: DashboardComponent },
    { path: 'session',       component: DashboardComponent },
];
