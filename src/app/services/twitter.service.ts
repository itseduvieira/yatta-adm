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
          'X-Auth-Uid': user.uid,
          'Authorization': `Bearer ${user.token}`
        }),
        params: new HttpParams().set("offset", new Date().getTimezoneOffset().toString())
      };
    }

    return this.http.get<any>(`${environment.apiUrl}/twitter/stats`, this.options);
  }

  getFollowers() {
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if(user) {
      this.options = {
        headers : new HttpHeaders({
          'X-Access-Token': user.accessToken,
          'X-Access-Token-Secret': user.accessTokenSecret,
          'X-Auth-Uid': user.uid,
          'Authorization': `Bearer ${user.token}`
        }),
        params: new HttpParams().set("offset", new Date().getTimezoneOffset().toString())
      };
    }

    return this.http.get<any>(`${environment.apiUrl}/twitter/followers`, this.options);
  }

}