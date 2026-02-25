import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {
  baseurlMaster = environment.baseUrlMaster;
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Basic ${window.btoa('admin:admin')}`,
    }),
  };

  constructor(private http: HttpClient) { }
  private refresh = new Subject<void>();
  get refreshreq() {
    return this.refresh;
  }

  errorHandler(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  deleteEnquiry(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.DELETE_ENQUIRY, body, this.HTTP_OPTIONS);
  }
  
}
