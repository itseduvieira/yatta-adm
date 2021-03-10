import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TwitterService {
  options: Object = { };

  constructor(private http: HttpClient) { }

  getMine() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if(user) {
      this.options = {
        headers : new HttpHeaders({
          'X-Access-Token': user.accessToken,
          'X-Access-Token-Secret': user.accessTokenSecret,
          'Authorization': `Bearer ${user.token}`
        }),
        params: new HttpParams().set("offset", new Date().getTimezoneOffset().toString())
      };
    }

    return this.http.get<any>(`${environment.apiUrl}/tt/stats`, this.options);
  }
  
  me(uid, accessToken, accessTokenSecret, token) {
    this.options = {
      headers : new HttpHeaders({
        'X-Access-Token': accessToken,
        'X-Access-Token-Secret': accessTokenSecret,
        'X-Auth-Uid': uid,
        'Authorization': `Bearer ${token}`
      })
    };

    return this.http.get<any[]>(`${environment.apiUrl}/tt/me`, this.options);
  }

}