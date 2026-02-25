import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CognitoService } from '../cognito.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Injectable({
  providedIn: 'root'
})
export class BatchService {

  constructor(private httpClient: HttpClient,private commonFunction : CommonFunctions, private cognitoService: CognitoService) { }
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer' + this.commonFunction.getAuthToken()
    })
  }
  HTTP_OPTIONS1 = {
    headers: new HttpHeaders({ 
      'Authorization': 'Bearer' + this.commonFunction.getAuthToken()
    })
  }

  uploadDocument(data): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/document`, data, this.HTTP_OPTIONS);
  }

  getMasterList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  getProfileList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  saveProfile(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  updateProfile(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/${type}/update`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getTransactionList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  saveTransaction(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/${type}`,
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
  deleteTransactionList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/${type}/delete`,
      data,
      this.HTTP_OPTIONS
    );
  }

  sendEmail(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}email/send`,
      data,
      this.HTTP_OPTIONS1
    );
  }

}
