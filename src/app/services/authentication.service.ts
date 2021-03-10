import { Injectable } from '@angular/core';
import { AngularFireAuth } from "@angular/fire/auth";
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { TwitterService } from 'src/app/services/twitter.service';
import * as firebase from 'firebase/app';
import 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userData: Observable<any>;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private twitterService: TwitterService) {
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
      const me = await this.twitterService.me(uid, credential.accessToken, credential.secret, token).toPromise();

      const user = {
        profile: me,
        accessToken: credential.accessToken,
        accessTokenSecret: credential.secret,
        token: token
      };

      localStorage.setItem('currentUser', JSON.stringify(user));

      return Promise.resolve(user);
  }

  logout(): Promise<void> {
    localStorage.clear();

    return this.angularFireAuth
      .auth
      .signOut();
  }  

}