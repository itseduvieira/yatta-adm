import { Component, OnInit, ElementRef } from '@angular/core';
import * as moment from 'moment-timezone';
import { TwitterService } from 'src/app/services/twitter.service';
import Chart from 'chart.js';

import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';

import {
  chartOptions,
  parseOptions,
  hourlyActivity
} from "../../variables/charts";
import { first } from 'rxjs/operators';

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

  constructor(
    private twitterService: TwitterService,
    private authService: AuthenticationService, 
    location: Location,  
    private element: ElementRef, 
    private router: Router) {

    this.location = location;
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    }

  ngOnInit() {
    if(this.currentUser && this.currentUser.accessToken === 'demo') {
      this.getMine();

      this.profile = this.currentUser.profile.data;

      this.isLogged = true;
    } else {
      this.authService.userData
      .pipe(first())
        .subscribe(user => {
          if(this.currentUser) {
            this.profile = this.currentUser.profile.data;

            this.isLogged = true;

            this.getMine();
          }
        });
    }
  }

  getMine() {
    this.twitterService.getMine()
      .subscribe(tweets => {
        console.log(tweets);

        this.tweetCount = `Last ${tweets.count} tweets`;

        this.interactions = `${tweets.rts + tweets.favs} interactions`;
        this.rts = tweets.rts;
        this.favs = tweets.favs;

        const start = moment.tz(tweets.period.start, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC');
        const end = moment.tz(tweets.period.end, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC');
        this.term = `${start.format('MMM DD')} to ${end.format('MMM DD')}`;
        this.days = (Math.trunc(moment.duration(end.diff(start)).asDays()) + 1);

        tweets.bestTime = tweets.bestTime;
        const time = tweets.bestTime > 12 ? tweets.bestTime - 12 : tweets.bestTime;
        const ampm = tweets.bestTime > 12 ? 'PM' : 'AM';
        this.bestTime = `Every ${time}${ampm}`
        this.timeInteractions = tweets.frequency[tweets.bestTime]

        this.loadCharts(tweets.frequency);
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
    return '⏰ My Dashboard';
  }
  
  loginDemo() {
    const user = {
      profile: {
        data: {
          name: 'Jonas Marra (Demo)',
          screen_name: 'jmarra_',
          profile_image_url: '//bit.ly/3dPV66u'
        }
      },
      accessToken: 'demo',
      accessTokenSecret: 'demo'
    };

    localStorage.setItem('currentUser', JSON.stringify(user));

    this.getMine();

    this.profile = user.profile.data;

    this.isLogged = true;    
  }

  loginTT() {
    this.authService.loginWithTwitter().then(result => {
      console.log(result);

      this.profile = result.profile.data;

      this.isLogged = true;

      this.getMine();
    });
  }

  logout() {
    this.authService.logout().then(result => {
      this.bestTime = null;
      this.tweetCount = null;
      this.interactions = null;
      this.term = null;
      this.rts = null;
      this.favs = null;
      this.days = null;
      this.timeInteractions = null;
      this.profile = null;
      if(this.activityChart) {
        this.activityChart.destroy();
      }
      this.activityChart = null;
      this.info = null;
  
      this.isLogged = false;
    });
  }
}
