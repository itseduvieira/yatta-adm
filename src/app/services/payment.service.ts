import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  options: Object = { };

  constructor(private http: HttpClient) { }

  createIntent(product: any) {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if(user) {
      this.options = {
        headers : new HttpHeaders({
          'X-Access-Token': user.accessToken,
          'X-Access-Token-Secret': user.accessTokenSecret,
          'Authorization': `Bearer ${user.token}`
        })
      };
    }

    return this.http.post<any>(`${environment.apiUrl}/payment/intent`, product, this.options);
  }

  createSubscription(info: any) {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if(user) {
      this.options = {
        headers : new HttpHeaders({
          'X-Access-Token': user.accessToken,
          'X-Access-Token-Secret': user.accessTokenSecret,
          'Authorization': `Bearer ${user.token}`
        })
      };
    }

    return this.http.post<any>(`${environment.apiUrl}/payment/subscription`, info, this.options);
  }

  getPortalUrl() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if(user) {
      this.options = {
        headers : new HttpHeaders({
          'X-Access-Token': user.accessToken,
          'X-Access-Token-Secret': user.accessTokenSecret,
          'Authorization': `Bearer ${user.token}`
        })
      };
    }

    return this.http.get<any>(`${environment.apiUrl}/payment/portal/${user.profile.subscription.customerId}`, this.options);
  }
}