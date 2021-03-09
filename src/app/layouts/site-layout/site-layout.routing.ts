import { Routes } from '@angular/router';

import { SiteComponent } from '../../pages/site/site.component';

export const SiteLayoutRoutes: Routes = [
    { path: '',           component: SiteComponent },
    { path: 'payment',           component: SiteComponent },
];
