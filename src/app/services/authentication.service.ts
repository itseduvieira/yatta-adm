import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { environment } from '../../environments/environment';
import * as firebase from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userData: Observable<any>;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private http: HttpClient) {
    this.userData = angularFireAuth.authState;
  }

  loginWithTwitter(): any {
    return this.login(new firebase.auth.TwitterAuthProvider());
  }

  async login(provider) {
    
      const result = await this.angularFireAuth.auth.signInWithPopup(provider);

      const credential = result.credential as firebase.auth.OAuthCredential;

      // let token = await result.user.getIdToken(true)
      let token = 'demo';
      let uid = result.user.uid;
      const me = await this.me(uid, credential.accessToken, credential.secret, token).toPromise();

      const user = {
        uid: uid,
        profile: me,
        accessToken: credential.accessToken,
        accessTokenSecret: credential.secret,
        token: token
      };

      localStorage.setItem('currentUser', JSON.stringify(user));

      return Promise.resolve(user);
  }

  me(uid, accessToken, accessTokenSecret, token) {
    const options: Object = {
      headers : new HttpHeaders({
        'X-Access-Token': accessToken,
        'X-Access-Token-Secret': accessTokenSecret,
        'X-Auth-Uid': uid,
        'Authorization': `Bearer ${token}`
      })
    };

    return this.http.get<any[]>(`${environment.apiUrl}/profile/me`, options);
  }

  logout(): Promise<void> {
    localStorage.clear();

    return this.angularFireAuth
      .auth
      .signOut();
  }  

}