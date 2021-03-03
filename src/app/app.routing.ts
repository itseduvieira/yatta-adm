import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { SiteLayoutComponent } from './layouts/site-layout/site-layout.component';

import { AuthGuard } from './guards/auth-guard.service';

const routes: Routes =[
  // {
  //   path: '',
  //   redirectTo: 'dashboard',
  //   pathMatch: 'full',
  // }, 
  
  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
      }
    ],
    // canActivate: [AuthGuard]
  }, {
    path: 'home',
    component: SiteLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './layouts/site-layout/site-layout.module#SiteLayoutModule'
      }
    ],
    // canActivate: [AuthGuard]
  }, {
    path: '**',
      redirectTo: 'home'
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes,{
      useHash: true
    })
  ],
  exports: [
  ],
})
export class AppRoutingModule { }
