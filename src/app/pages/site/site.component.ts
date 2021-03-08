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
export class SiteComponent implements OnInit {

  stripe: any;
  data: any;
  card: any;

  textCheckout = '$3/MONTH';
  montly = '$3';
  annually = '$36';

  constructor(
    private modalService: NgbModal,
    private authService: AuthenticationService, 
    private paymentService: PaymentService,
    private router: Router
  ) {
    
  }

  ngOnInit() {

  }

  changeBilling(checked: boolean) {
    this.textCheckout = checked ? '$24/YEAR' : '$3/MONTH';
    this.montly = checked ? '$2' : '$3';
    this.annually = checked ? '$24' : '$36';
  }

  openModal(content) {
    of(loadStripe(environment.stripeKey, { locale: 'en' }))
      .pipe(first())
      .subscribe(async result => {

        const stripe = await result;
        
        this.stripe = stripe;

        console.log(stripe);

        this.paymentService.createIntent({id: 'xl-thirt'})
          .pipe(first())
          .subscribe(data => {
            this.data = data;

            this.modalService.open(content, { size: 'lg', backdrop: 'static' });

            var elements = stripe.elements();
            this.card = elements.create('card', { 
              // iconStyle: 'solid',
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
      });
  }

  pay() {
    this.payWithCard(this.stripe, this.card, this.data.clientSecret);
  }

  async checkTwitter() {
    await this.authService.loginWithTwitter();

    this.router.navigate(['/dash']);
  }

  payWithCard(stripe, card, clientSecret) {
    this.loading(true);
    stripe
      .confirmCardPayment(clientSecret, {
        payment_method: {
          card: card
        }
      })
      .then(function(result) {
        if (result.error) {
          this.showError(result.error.message);
        } else {
          this.orderComplete(result.paymentIntent.id);
        }
      });
  };

  orderComplete(paymentIntentId) {
    this.loading(false);
    document
      .querySelector('.result-message a')
      .setAttribute(
        'href',
        'https://dashboard.stripe.com/test/payments/' + paymentIntentId
      );
    // document.querySelector('.result-message').classList.remove('hidden');
    // document.querySelector('button').disabled = true;
  };

  showError(errorMsgText) {
    this.loading(false);
    var errorMsg = document.querySelector('#card-error');
    errorMsg.textContent = errorMsgText;
    setTimeout(function() {
      errorMsg.textContent = '';
    }, 4000);
  };

  loading(isLoading) {
    if (isLoading) {
      // document.querySelector('button').disabled = true;
      // document.querySelector('#spinner').classList.remove('hidden');
      // document.querySelector('#button-text').classList.add('hidden');
    } else {
      // document.querySelector('button').disabled = false;
      // document.querySelector('#spinner').classList.add('hidden');
      // document.querySelector('#button-text').classList.remove('hidden');
    }
  };

}
