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

  isChecked: boolean = false;

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

  check(event) {
    this.isChecked = event.srcElement.checked;
  }

  openModal(content) {
    of(loadStripe(environment.stripeKey, { locale: 'en' }))
      .pipe(first())
      .subscribe(async result => {
        this.stripe = await result;

        this.modalService.open(content, { size: 'lg', backdrop: 'static' });

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
      });
  }
  async checkTwitter() {
    await this.authService.loginWithTwitter();

    this.router.navigate(['/dash']);
  }

  async payWithCard() {
    this.paymentService.createIntent({ billing: this.isChecked ? 'year' : 'month' })
      .pipe(first())
      .subscribe(async data => {
        this.data = data;

        const result = await this.stripe.confirmCardPayment(this.data.clientSecret, {
          payment_method: {
            card: this.card
          }
        });
        
        if (result.error) {
          console.log(result.error.message);
        } else {
          console.log('https://dashboard.stripe.com/test/payments/' + result.paymentIntent.id);
        }
      });
  };
}
