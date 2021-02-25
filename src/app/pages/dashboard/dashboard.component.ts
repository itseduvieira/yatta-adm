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
  public timeInteractions;
  public tweetCount;
  public interactions;
  public term;
  public rts;
  public favs;
  public days;

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

        this.interactions = tweets.rts + tweets.favs;
        this.rts = tweets.rts;
        this.favs = tweets.favs;

        const start = moment.tz(tweets.period.start, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC');
        const end = moment.tz(tweets.period.end, 'ddd MMM DD HH:mm:ss ZZ YYYY', 'UTC');
        this.term = `${start.format('MMM DD')} to ${end.format('MMM DD')}`;
        this.days = Math.trunc(moment.duration(end.diff(start)).asDays());

        const time = tweets.bestTime > 12 ? tweets.bestTime - 12 : tweets.bestTime;
        const ampm = tweets.bestTime > 12 ? 'PM' : 'AM';
        this.bestTime = `Every ${time}${ampm}`
        this.timeInteractions = tweets.frequency[tweets.bestTime]
    })
  }
}
