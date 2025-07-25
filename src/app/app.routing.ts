import { NgModule } from '@angular/core';
import { CommonModule, } from '@angular/common';
import { BrowserModule  } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { SiteLayoutComponent } from './layouts/site-layout/site-layout.component';

const routes: Routes =[
  {
    path: '',
    component: SiteLayoutComponent,
    pathMatch: 'full',
    children: [
      {
        path: '',
        loadChildren: './layouts/site-layout/site-layout.module#SiteLayoutModule'
      },
    ],
  },
  {
    path: 'payment',
    component: SiteLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './layouts/site-layout/site-layout.module#SiteLayoutModule'
      },
    ],
  },
  {
    path: 'coupon/:coupon',
    component: SiteLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './layouts/site-layout/site-layout.module#SiteLayoutModule'
      },
    ],
  },
  {
    path: 'dash',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: './layouts/admin-layout/admin-layout.module#AdminLayoutModule'
      }
    ],
  }, {
    path: '**',
      redirectTo: ''
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
