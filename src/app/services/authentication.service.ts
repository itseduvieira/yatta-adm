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
  subject = new Subject<any>();

  public isDemoAccount: boolean = false;
  private messageSource = new  BehaviorSubject(this.isDemoAccount);
  
  isDemoAccountState = this.messageSource.asObservable();

  constructor(
    private angularFireAuth: AngularFireAuth,
    private twitterService: TwitterService) {
    this.userData = angularFireAuth.authState;
  }
  
  loginDemoAccount() {
    const user = {
      profile: {
        data: {
          name: 'Demo',
          screen_name: 'efvi_',
          profile_image_url: 'http://pbs.twimg.com/profile_images/1364345989872640007/N_KimaFU_normal.jpg'
        }
      },
      accessToken: 'demo',
      accessTokenSecret: 'demo'
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    
    this.messageSource.next(true)
  }

  loginWithTwitter() {
    return this.login(new firebase.auth.TwitterAuthProvider());
  }

  async login(provider) {
    const result = await this.angularFireAuth.auth.signInWithPopup(provider);

    const credential = result.credential as firebase.auth.OAuthCredential;

    const me = await this.twitterService.me(credential.accessToken, credential.secret).toPromise();

    const user = {
      profile: me,
      accessToken: credential.accessToken,
      accessTokenSecret: credential.secret
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