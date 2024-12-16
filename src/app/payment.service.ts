import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, throwError } from 'rxjs';


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

  base_url = 'http://3.137.192.231:8000'
  // base_url = 'http://localhost:8000'

  constructor(
    private readonly http: HttpClient
  ) { }


  getPayments(page: number = 1, search: string = '', pageSize: number =30): Observable<PaymentAPIData> {
    let params = new HttpParams().set('page_number', page,).set('page_size', pageSize).set('search', search);
    return this.http.get<PaymentAPIData>(`${this.base_url}/payments`, {params}).pipe(
      catchError(err => {
        return throwError(err)
      })
    )
  }

  createPayment(payment: any): Observable<any> {
      return this.http.post<any>(`${this.base_url}/payment`, payment, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      });
  }

  uploadEvidence(paymentId: string, file: File): Observable<any> {
    if (!file?.name) {
      return of(true)
    }
    const formData = new FormData();
    formData.append('file', file, file.name);

    const url = `${this.base_url}/payment/${paymentId}/evidence/`;
    return this.http.post<any>(url, formData);
  }

  downloadEvidence(paymentId: string): Observable<any> {
    const url = `${this.base_url}/payment/${paymentId}/evidence/`;
    return this.http.get(url, { responseType: 'blob', observe: 'response' });
  }

  updatePayment(paymentId: string, payment: any): Observable<any> {
    const url = `${this.base_url}/payment/${paymentId}`;

    return this.http.put<any>(url, payment, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  removePayment(paymentId: string): Observable<any> {
    const url = `${this.base_url}/payment/${paymentId}`;

    return this.http.delete<any>(url, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }
}
