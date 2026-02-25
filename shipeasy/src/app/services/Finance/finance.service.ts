import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CognitoService } from '../cognito.service';
import { Invoice, Payment } from './finance';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Injectable({
  providedIn: 'root'
})
export class FinanceService {

  constructor(private httpClient: HttpClient,private commonFunction : CommonFunctions, private cognitoService: CognitoService) {
    // do nothing.
   }

  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+this.commonFunction.getAuthToken()
    })
  }

  body = {
    size: 100,
    _source: [],
    query: {
      bool: {
        must: [{
          "match":{
            "status": true
          }
        }],
        filter: [],
        should: [],
        must_not: [],
      },
    },
  };


  invoiceList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}finance/list?type=invoice`, dataSend, this.HTTP_OPTIONS);
  }
  // .pipe(
  //   catchError(this.handleError))
  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`
      );
    }
    return throwError('Something bad happened; please try again later.');

  }
  createInvoice(createBody):Observable<Invoice>{
    return this.httpClient.post<Invoice>(`${environment.baseUrlMaster}finance/invoice`, createBody, this.HTTP_OPTIONS);
  }
  updateInvoice(updateBody):Observable<Invoice>{
    return this.httpClient.post<Invoice>(`${environment.baseUrlMaster}finance/invoice/update`, updateBody, this.HTTP_OPTIONS);
  }

  updateInvoiceBatch(updateBody):Observable<Invoice>{
    return this.httpClient.post<Invoice>(`${environment.baseUrlMaster}finance/invoice/batch-update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteInvoice(deleteBody):Observable<Invoice>{
    return this.httpClient.post<Invoice>(`${environment.baseUrlMaster}finance/invoice/delete`, deleteBody, this.HTTP_OPTIONS);
  }

  paymentList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}finance/list?type=payment`, dataSend, this.HTTP_OPTIONS);
  }
  createPayment(createBody):Observable<Payment>{
    return this.httpClient.post<Payment>(`${environment.baseUrlMaster}finance/payment`, createBody, this.HTTP_OPTIONS);
  }
  updatePayment(updateBody):Observable<Payment>{
    return this.httpClient.post<Payment>(`${environment.baseUrlMaster}finance/payment/update`, updateBody, this.HTTP_OPTIONS);
  }
  deletePayment(deleteBody):Observable<Payment>{
    return this.httpClient.post<Payment>(`${environment.baseUrlMaster}finance/payment/delete`, deleteBody, this.HTTP_OPTIONS);
  }

  currencyList():Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=currency`,this.body,this.HTTP_OPTIONS);
  }

   getTransactionList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  updateTransactionList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/${type}/update`,
      data,
      this.HTTP_OPTIONS
    );
  }
}
