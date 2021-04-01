import { Component, OnInit, ElementRef } from '@angular/core';
import * as moment from 'moment-timezone';
import { TwitterService } from 'src/app/services/twitter.service';
import Chart from 'chart.js';

import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

import {
  chartOptions,
  parseOptions,
  hourlyActivity
} from "../../variables/charts";
import { first } from 'rxjs/operators';
import { PaymentService } from 'src/app/services/payment.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public bestTime;
  public timeInteractions;
  public tweetCount;
  public interactions;
  public term;
  public rts;
  public favs;
  public days;
  public tweetCountTotal;
  public info: any;
  public activityChart;

  public focus;
  public listTitles: any[] = [];
  public location: Location;
  public name: string;
  public username: string;
  public currentUser: any;
  public profile: any;
  public isLogged = false;
  public isDemo = false;
  public isLoaded = false;

  constructor(
    private twitterService: TwitterService,
    private authService: AuthenticationService, 
    private paymentService: PaymentService,
    location: Location,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

    this.location = location;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    const url = this.router.url;
    if((this.currentUser && this.currentUser.accessToken === 'demo') ||
        url.indexOf('/demo') > -1) {
      this.loginDemo();
    } else {
      this.authService.userData
        .pipe(first())
        .subscribe(user => {
          if(this.currentUser) {
            this.profile = this.currentUser.profile;

            this.isLogged = true;

            this.isLoaded = true;

            this.isDemo = false;

            this.getMine();
          } else {
            this.isLoaded = true;
          }
        });
    }
  }

  getMine() {
    this.twitterService.getMine()
      .pipe(first())
      .subscribe(tweets => {
        this.tweetCount = `Last ${tweets.count} tweets`;

        this.interactions = `${tweets.rts + tweets.favs} interactions`;
        this.rts = tweets.rts;
        this.favs = tweets.favs;
        
        this.tweetCountTotal = Math.trunc((tweets.count / this.currentUser.profile.statuses_count) * 100);

        this.tweetCountTotal = this.tweetCountTotal > 100 ? 100 : this.tweetCountTotal;

        const start = moment.tz(tweets.period.start, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC');
        const end = moment.tz(tweets.period.end, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC');
        let format = start.format('YYYY') === end.format('YYYY') ? 'MMM DD' : 'MMM YYYY';
        this.term = `${start.format(format)} to ${end.format(format)}`;
        this.days = (Math.trunc(moment.duration(end.diff(start)).asDays()) + 1);

        let bestTimeInt = parseInt(tweets.bestTime);
        let time = bestTimeInt > 12 ? bestTimeInt - 12 : bestTimeInt;
        let ampm = bestTimeInt > 12 ? 'PM' : 'AM';
        if(time === 0) {
          time = 12;
          ampm = 'AM';
        }
        this.bestTime = `Every ${time}${ampm}`;
        this.timeInteractions = tweets.frequency[tweets.bestTime];

        this.loadCharts(tweets.frequency);
    }, result => {
      if(result.status === 402) {
        this.logout();
      }
    })
  }

  loadCharts(frequency: any[]) {
    if(!frequency) return;

    let keys = [];
    let values = [];

    for(let i = 0; i < 24; i++) {
      let key = String(i).padStart(2, '0');

      values.push(frequency[key] ? frequency[key] : 0);
      keys.push(key);
    }

    keys = keys.map(key => {
      let newKey;

      if(parseInt(key) > 12) {
        newKey = String((parseInt(key) - 12)).padStart(2, '0') + 'PM';
      } else {
        if(key == '00') {
          newKey = '12AM';
        } else if(key == '12') {
          newKey = '12PM';
        } else {
          newKey = key + 'AM';
        }
      }

      return newKey.startsWith('0') ? newKey.substring(1) : newKey;
    });

    parseOptions(Chart, chartOptions());

    var chartActivity = document.getElementById('chart-activity');

    this.activityChart = new Chart(chartActivity, {
			type: 'bar',
			options: {
        tooltips: {
          cornerRadius: 4,
          caretSize: 4,
          xPadding: 16,
          yPadding: 10,
          titleFontStyle: 'normal',
          titleMarginBottom: 15
        }
      },
			data: {
        labels: keys,
        datasets: [{
          label: 'Interactions',
          data: values
        }]
      }
		});
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
    return '⏰ Yatta Dashboard';
  }
  
  loginDemo() {
    const user = {
      profile: {
        name: 'Jonas Marra',
        screen_name: 'marrajonas_',
        profile_image_url: '/assets/img/demo.jpg',
        statuses_count: 50
      },
      accessToken: 'demo',
      accessTokenSecret: 'demo',
      uid: 'demo'
    };

    localStorage.setItem('currentUser', JSON.stringify(user));

    this.currentUser = user;

    this.getMine();

    this.profile = user.profile;

    this.isLogged = true;
    
    this.isLoaded = true;

    this.isDemo = true;
  }

  async loginTT() {
    const user = await this.authService.loginWithTwitter();

    if(user.profile.subscription.status === 'active') {
      this.profile = user.profile;

      this.isLogged = true;

      this.isDemo = false;

      this.isLoaded = true;

      this.getMine();
    } else {
      this.router.navigate(['/payment']);
    }
  }

  logout() {
    this.authService.logout().then(result => {
      this.router.navigate(['/']).then(() =>{
        this.bestTime = null;
        this.tweetCount = null;
        this.interactions = null;
        this.term = null;
        this.rts = null;
        this.favs = null;
        this.days = null;
        this.timeInteractions = null;
        this.profile = null;
        this.isLoaded = false;
        if(this.activityChart) {
          this.activityChart.destroy();
        }
        this.activityChart = null;
        this.info = null;

        this.isLogged = false;
        this.isDemo = false;
      });
    });
  }

  async customerPortal() {
    this.paymentService.getPortalUrl()
      .pipe(first())
      .subscribe(result => {
        window.location.href = result.url;
      });
  }
}
