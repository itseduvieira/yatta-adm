import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TwitterService } from 'src/app/services/twitter.service';
import Chart from 'chart.js';

import {
  chartOptions,
  parseOptions,
  hourlyActivity
} from "../../variables/charts";

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

  constructor(
    private authService: AuthenticationService,
    private twitterService: TwitterService) { }

  ngOnInit() {
    this.authService.userData
      .subscribe(user => {
        if(user) {
          this.getMine();
        }
      });

      this.authService.isDemoAccountState
        .subscribe(isDemoAccount => {
          if(isDemoAccount) {
            this.getMine();
          }
        })
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
}
