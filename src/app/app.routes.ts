import { Routes } from '@angular/router';
import { AddPaymentComponent } from './add-payment/add-payment.component';
import { PaymentListComponent } from './payment-list/payment-list.component';

export const routes: Routes = [
    { path: '', component: PaymentListComponent },
    { path: 'add-payment', component: AddPaymentComponent },
];
