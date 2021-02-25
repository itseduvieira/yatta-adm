import { Component, OnInit } from '@angular/core';
import * as moment from 'moment-timezone';
import { getMaxListeners } from 'process';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { TwitterService } from 'src/app/services/twitter.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public bestTime;
  public tweetCount;
  public interactions;
  public period;

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
          this.getMine();
        })
  }

  getMine() {
    this.twitterService.getMine()
      .subscribe(tweets => {
        console.log(tweets);

        this.tweetCount = tweets.count;
        this.interactions = tweets.interactions;
        const start = moment.tz(tweets.period.start, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC').format('MMM DD');
        const end = moment.tz(tweets.period.end, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC').format('MMM DD');
        this.period = `${start} to ${end}`;
        const time = tweets.bestTime > 12 ? tweets.bestTime - 12 : tweets.bestTime;
        const ampm = tweets.bestTime > 12 ? 'PM' : 'AM';
        this.bestTime = `Every ${time}${ampm} (${tweets.frequency[tweets.bestTime]})`
    })
  }
}
