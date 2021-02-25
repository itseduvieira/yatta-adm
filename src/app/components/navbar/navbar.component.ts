import { Component, OnInit, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public focus;
  public listTitles: any[] = [];
  public location: Location;
  public name: string;
  public username: string;
  public currentUser: any;
  public profile: any;

  constructor(
    private authService: AuthenticationService, 
    location: Location,  
    private element: ElementRef, 
    private router: Router) {

    this.location = location;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.profile = this.currentUser ? this.currentUser.profile.data : null;
  }

  ngOnInit() {
    
  }

  getTitle() {
    var titlee = this.location.prepareExternalUrl(this.location.path());
    if(titlee.charAt(0) === '#'){
        titlee = titlee.slice( 1 );
    }

    for(var item = 0; item < this.listTitles.length; item++){
        if(this.listTitles[item].path === titlee){
            return this.listTitles[item].title;
        }
    }
    return '⏰ My Dashboard';
  }

  isLogged() {
    return localStorage.getItem('currentUser');
  }
  
  loginDemo() {
    this.authService.loginDemoAccount();
  }

  loginTT() {
    this.authService.loginWithTwitter().then(result => {
      console.log(result);

      this.authService.userData.subscribe(user => {
        this.isLogged();
      });
    });
  }

  logout() {
    this.authService.logout();
  }

}
