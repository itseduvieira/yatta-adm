import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { catchError, first } from 'rxjs/operators';
import { PaymentService } from 'src/app/services/payment.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { environment } from 'src/environments/environment';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-site',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss']
})
export class SiteComponent implements OnInit, AfterViewInit {

  stripe: any;
  data: any;
  card: any;

  isChecked: boolean;
  isComplete: boolean;
  isLoading: boolean;
  requestComplete: boolean;
  
  title = 'Your payment transaction succeeded, you are good to go';
  subtitle = 'Take full advantage of yatta! right away';
  imgFeedback = '/assets/img/success.png';

  nextActionUrl: string;

  @ViewChild('pricing', { static: false }) pricing: ElementRef;

  constructor(
    private modalService: NgbModal,
    private authService: AuthenticationService, 
    private paymentService: PaymentService,
    private router: Router
  ) {
    
  }
  ngAfterViewInit(): void {
    const url = this.router.url;
    if(url.indexOf('/payment') > -1) {
      this.pricing.nativeElement.click();
    }
  }

  ngOnInit() {
    
  }

  tryAgain() {
    this.isChecked = true;
    this.isLoading = false;
    this.isComplete = false;
    this.requestComplete = false;
    this.card.clear();
  }

  openModal(content) {
    of(loadStripe(environment.stripeKey, { locale: 'en' }))
      .pipe(first())
      .subscribe(async result => {
        this.stripe = await result;

        this.modalService.open(content, { size: 'lg', backdrop: 'static' });

        this.isChecked = true;
        this.isLoading = false;
        this.isComplete = false;
        this.requestComplete = false;

        var elements = this.stripe.elements();
        this.card = elements.create('card', {
          hidePostalCode: true,
          style: {
            base: {
              color: "#525f7f",
              fontFamily: 'Open Sans, sans-serif',
              fontSmoothing: "antialiased",
              fontSize: "1em",
              "::placeholder": {
                color: "#525f7f"
              }
            },
            invalid: {
              fontFamily: 'Open Sans, sans-serif',
              color: "#fa755a",
              iconColor: "#fa755a"
            }
          } 
        });

        this.card.mount('#card-info');
        this.card.on('change', event => {
          this.isComplete = event.complete;
        });
      });
  }

  async checkTwitter() {
    const user = await this.authService.loginWithTwitter();

    if(user.profile.subscription.status === 'active') {
      this.router.navigate(['/dash']);
    } else {
      this.router.navigate(['/payment']);
    }
  }

  async subscribe() {
    this.isLoading = true;

    let currentUser = await this.authService.loginWithTwitter();
    
    if(currentUser.profile.subscription && 
      currentUser.profile.subscription.status === 'active') {
        this.requestComplete = true;
        this.title = 'You already have an active subscription'
        this.subtitle = 'Don\'t worry, your card wasn\'t charged at all. Just take advantage of yatta! features';
        this.imgFeedback = '/assets/img/success.png';

        return Promise.resolve();
    }

    await this.createSubscription();
  }

  goToDash() {
    this.router.navigate(['/dash'])
      .then(() => {
        this.modalService.dismissAll();
      });
  }

  async confirmPayment() {  
    if(this.nextActionUrl) {
      window.location.href = this.nextActionUrl;

      this.nextActionUrl = null;
    } else {
      this.router.navigate(['/dash']);
    }
  }

  async createSubscription() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const result = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
      billing_details: {
        name: currentUser.profile.screen_name,
      },
    });

    if (result.error) {
      this.requestComplete = true;
      this.title = 'We have an issue processing your payment'
      this.subtitle = 'Please check if your card is valid, if it has enough funds or if it can be charged in US$';
      this.imgFeedback = '/assets/img/fail.png';

    } else {
      this.paymentService.createSubscription({
        customerId: currentUser.profile.subscription.customerId,
        paymentMethodId: result.paymentMethod.id,
        priceId: this.isChecked ? environment.priceAnnual : environment.priceMonthly,
      })
        .pipe(first())
        .pipe(catchError(error => {
          return throwError(error);
        }))
        .subscribe(async result => {

          const lastPaymentIntent = result.latest_invoice.payment_intent;

          if(lastPaymentIntent.status === 'requires_action') {
            
            const confirm = await this.stripe.confirmPaymentIntent(
              lastPaymentIntent.client_secret,
              {
                payment_method: lastPaymentIntent.payment_method,
                return_url: `${window.location.origin}/#/dash`
              }
            );

            this.title = 'Action required: confirm the payment';
            this.subtitle = 'Hit the button below to confirm the payment, then log in again to check you subscription status';
            this.imgFeedback = '/assets/img/confirm.png';

            this.nextActionUrl = confirm.paymentIntent.next_action.redirect_to_url.url;

            this.requestComplete = true;
          } else {
            this.title = 'Hooray! Your payment has succeeded, you are good to go';
            this.subtitle = 'Enjoy your subscription and take full advantage of yatta! right now';
            this.imgFeedback = '/assets/img/success.png';

            this.requestComplete = true;
          }
        }, result => {
          this.title = `We have an issue processing your payment: ${result.error.error.message}`;
          this.subtitle = 'Please check if your card is valid, if it has enough funds and it can be charged in US$';
          this.imgFeedback = '/assets/img/fail.png';

          this.requestComplete = true;
        })
    }
  }
}
