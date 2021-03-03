import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { SiteLayoutRoutes } from './site-layout.routing';
import { SiteComponent } from '../../pages/site/site.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// import { AuthGuard } from "../../guards/auth-guard.service";

import { QRCodeModule } from 'angularx-qrcode';
// import { ToastrModule } from 'ngx-toastr';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(SiteLayoutRoutes),
    FormsModule,
    HttpClientModule,
    NgbModule,
    ClipboardModule,
    QRCodeModule
  ],
  // providers: [AuthGuard],
  declarations: [
    SiteComponent
  ]
})

export class SiteLayoutModule {}
