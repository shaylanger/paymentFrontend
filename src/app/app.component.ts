import { Component, inject, ViewChild } from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {DatePipe, DecimalPipe} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { BehaviorSubject, combineLatest, debounceTime, map, startWith, switchMap, tap } from 'rxjs';
import { Payment, PaymentService } from './payment.service';
import {
  MatDialog,
} from '@angular/material/dialog';
import { EditPaymentComponent } from './edit-payment/edit-payment.component';

@Component({
  selector: 'app-root',
  imports: [MatPaginatorModule, MatTableModule, MatFormFieldModule, DatePipe, MatProgressSpinnerModule, MatInputModule, DecimalPipe,MatIconModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  displayedColumns: string[] = ['name','payee_payment_status','payee_added_date_utc','payee_due_date','payee_address_line_1','payee_address_line_2','payee_city','payee_country','payee_province_or_state','payee_postal_code','payee_phone_number','payee_email','currency','discount_percent','tax_percent','due_amount','total_due', 'edit', 'delete'];
  data: Payment[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  search$$ = new BehaviorSubject<string>('');

  readonly dialog = inject(MatDialog);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private readonly paymentService: PaymentService) {
    
  }

  ngAfterViewInit() {
    combineLatest([this.paginator.page.pipe(startWith({})), this.search$$.pipe(debounceTime(100))]).pipe(
        switchMap(([p, search]) => {
          this.isLoadingResults = true;
          let pageNumber = this.paginator.pageIndex +1
          return this.paymentService.getPayments(pageNumber, search, 30)
        }),
        map(data => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.total;
          return data.payments;
        }),
      )
      .subscribe(data => (this.data = data));
  }

   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.search$$.next(filterValue);
  }

  edit(payment: Payment) {
    console.log(payment)

     const dialogRef = this.dialog.open(EditPaymentComponent, {
      data: {payment: payment},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed with data', result);
      // todo upload file
      // payment.payee_due_date = due_date;
      // payment.due_amount = due_amount;
      // payment.payee_payment_status = status;
      // payment.file = file;

      // // todo update payment
      // this.paymentService.uploadEvidence(payment.id, file).pipe(
      //   switchMap(c => {
      //     return this.paymentService.updatePayment(payment.id, result);
      //   }),
      //   tap(p => {
      //     //force the app to get the payment data to reload after update.
      //     this.search$$.next('');
      //   })
      // )
    });
  }

  downloadEvidence(payment: Payment) {
    //todo
    // this.paymentService.downloadEvidence(payment);
  }

  removePayment(payment: Payment) {
    console.log(payment)
  }
}
