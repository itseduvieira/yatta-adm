import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { first } from 'rxjs/operators';
import { PaymentService } from 'src/app/services/payment.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { environment } from 'src/environments/environment';
import { of } from 'rxjs';
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

  openModal(content) {
    of(loadStripe(environment.stripeKey, { locale: 'en' }))
      .pipe(first())
      .subscribe(async result => {
        this.stripe = await result;

        this.modalService.open(content, { size: 'lg', backdrop: 'static' });

        this.isChecked = true;
        this.isLoading = false;

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
          console.log(event);
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

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const result = await this.stripe.createPaymentMethod({
      type: 'card',
      card: this.card,
      billing_details: {
        name: currentUser.profile.screen_name,
      },
    });

    if (result.error) {
      console.log(result);
    } else {
      this.paymentService.createSubscription({
        customerId: currentUser.profile.subscription.customerId,
        paymentMethodId: result.paymentMethod.id,
        priceId: this.isChecked ? environment.priceAnnual : environment.priceMonthly,
      })
        .pipe(first())
        .subscribe(result => {
          console.log(result);
        });
    }
  };
}
