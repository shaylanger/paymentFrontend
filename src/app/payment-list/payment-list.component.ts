import { Component, inject, ViewChild } from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { BehaviorSubject, combineLatest, debounceTime, map, of, startWith, switchMap, take, tap } from 'rxjs';
import {
  MatDialog,
} from '@angular/material/dialog';
import { Payment, PaymentService } from '../payment.service';
import { EditPaymentComponent } from '../edit-payment/edit-payment.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-list',
  imports: [MatPaginatorModule, MatTableModule, MatFormFieldModule,CommonModule, DatePipe, MatProgressSpinnerModule, MatInputModule, DecimalPipe,MatIconModule, MatButtonModule],
 templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss'
})
export class PaymentListComponent {
  displayedColumns: string[] = ['name','payee_payment_status','payee_added_date_utc','payee_due_date','payee_address_line_1','payee_address_line_2','payee_city','payee_country','payee_province_or_state','payee_postal_code','payee_phone_number','payee_email','currency','discount_percent','tax_percent','due_amount','total_due', 'edit', 'download','delete'];
  data: Payment[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  search$$ = new BehaviorSubject<string>('');

  readonly dialog = inject(MatDialog);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private readonly paymentService: PaymentService, private readonly router: Router) {
    
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
     const dialogRef = this.dialog.open(EditPaymentComponent, {
      data: {payment: payment},
    });

    dialogRef.afterClosed().pipe(
      switchMap(result => {
        if (!result.file && result.due_date){
          return this.paymentService.updatePayment(payment.id, payment);
        } else if (!result.file && !result?.due_date) {
          return of(true)
        }
       
        payment.payee_due_date = result.due_date;
        payment.due_amount = result.due_amount;
        payment.payee_payment_status = result.status;
        return this.paymentService.uploadEvidence(payment.id, result.file).pipe(
          switchMap(c => {
            return this.paymentService.updatePayment(payment.id, payment);
          }),
        )
      }),
      tap(p => {
        //force the app to get the payment data to reload after update.
        this.search$$.next('');
      }),
  ).subscribe();
  }

  downloadEvidence(payment: Payment) {
    this.paymentService.downloadEvidence(payment.id).pipe(take(1)).subscribe((response: any) => {
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = '';
        let fileExtension = '';

        if (contentDisposition) {
          const matches = contentDisposition.match(/filename="?(.*?)"?$/);

          if (matches && matches[1]) {
            fileName = matches[1].split('.')[0];
            fileExtension = matches[1].split('.').pop();
          }
        }

        const blob = new Blob([response.body], { type: response.type });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.${fileExtension}`;

        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }

  removePayment(payment: Payment) {
    this.paymentService.removePayment(payment.id).pipe(take(1)).subscribe(_ => {
      //force the app to get the payment data to reload after update.
      this.search$$.next('')
    });
  }

  addPayment(): void {
    this.router.navigate(['/add-payment'])
  }
}