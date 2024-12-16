import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';


export interface PaymentAPIData {
  payments: Payment[],
  total: number
}

export interface Payment {
    id: string,
    payee_first_name: string,
    payee_last_name: string,
    payee_payment_status: string,
    payee_added_date_utc: string,
    payee_due_date: string,
    payee_address_line_1: string,
    payee_address_line_2: string,
    payee_city: string,
    payee_country: string,
    payee_province_or_state: string,
    payee_postal_code: string,
    payee_phone_number: string,
    payee_email: string,
    currency: string,
    discount_percent: number,
    tax_percent: number,
    due_amount: number,
    total_due: number

}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    private readonly http: HttpClient
  ) { }


  getPayments(page: number = 1, search: string = '', pageSize: number =30): Observable<PaymentAPIData> {
    let params = new HttpParams().set('page_number', page,).set('page_size', pageSize).set('search', search);
    return this.http.get<PaymentAPIData>('http://3.137.192.231:8000/payments', {params}).pipe(
      catchError(err => {
        return throwError(err)
      })
    )
  }
}
