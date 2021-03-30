import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    options: Object = {};

    constructor(private http: HttpClient) { }

    createIntent(product: any) {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (user) {
            this.options = {
                headers: new HttpHeaders({
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

        if (user) {
            this.options = {
                headers: new HttpHeaders({
                    'X-Access-Token': user.accessToken,
                    'X-Access-Token-Secret': user.accessTokenSecret,
                    'X-Auth-Uid': user.uid,
                    'Authorization': `Bearer ${user.token}`
                })
            };
        }

        return this.http.post<any>(`${environment.apiUrl}/payment/subscription`, info, this.options);
    }

    getPortalUrl() {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (user) {
            this.options = {
                headers: new HttpHeaders({
                    'X-Access-Token': user.accessToken,
                    'X-Access-Token-Secret': user.accessTokenSecret,
                    'Authorization': `Bearer ${user.token}`
                })
            };
        }

        return this.http.get<any>(`${environment.apiUrl}/payment/portal/${user.profile.subscription.customerId}`, this.options);
    }

    getCheckoutUrl(priceId: string) {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (user) {
            this.options = {
                headers: new HttpHeaders({
                    'X-Access-Token': user.accessToken,
                    'X-Access-Token-Secret': user.accessTokenSecret,
                    'Authorization': `Bearer ${user.token}`
                })
            };
        }

        return this.http.post<any>(`${environment.apiUrl}/payment/checkout`, {
            returnUrl: window.location.origin,
            priceId: priceId
        }, this.options);
    }

    updateCustomer(sessionId: string, uid: string, twitterId: string, screenName: string) {
        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (user) {
            this.options = {
                headers: new HttpHeaders({
                    'X-Access-Token': user.accessToken,
                    'X-Access-Token-Secret': user.accessTokenSecret,
                    'Authorization': `Bearer ${user.token}`
                })
            };
        }

        return this.http.put<any>(`${environment.apiUrl}/payment/customer`, {
            sessionId: sessionId,
            uid: uid,
            twitterId: twitterId,
            screenName: screenName
        }, this.options);
    }

    getCoupon(couponId: string) {
        return this.http.get<any>(`${environment.apiUrl}/payment/coupon/${couponId}`, this.options);
    }
}