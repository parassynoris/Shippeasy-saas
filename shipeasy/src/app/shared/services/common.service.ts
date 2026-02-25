import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { CommonFunctions } from '../functions/common.function';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  storeEditID:any;
  private allMessage = new BehaviorSubject('export');
  currentMessage = this.allMessage.asObservable();

  constructor(private http: HttpClient,private commonFunctions:CommonFunctions) {
   this.http = http;
   this.commonFunctions = commonFunctions
  }
  private _commonHeaders = {
    headers: new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': '12345'
    })
  }

  pushreports(data: Object, repoName: string): Observable<any> {
    let reportpath = "demoReports"
    return this.http.post(`${environment.baseUrlMaster}pdf/download?reportPath=${reportpath}&reportName=${repoName}&format=pdf`, data, { responseType: 'blob' })
  }

  pushPublicReports(data: Object, repoName: string): Observable<any> {
    let reportpath = "SAdev"
    return this.http.post(`${environment.baseUrlMaster}quotation/download?reportPath=${reportpath}&reportName=${repoName}&format=pdf`, data, { responseType: 'blob' })
  }

  updateMessage(message: string) {
    this.allMessage.next(message)
  }

  post(url: string, data?: any) {
    let userHeaders = this.setHeader();
    if (userHeaders)
      userHeaders = this.setHeader();
    else
      userHeaders = this._commonHeaders;
    return this.http.post<any>(environment.baseUrlMaster + url, data, userHeaders)
      .pipe(
        map((Data: HttpResponse<any>) => { return Data }),
        catchError((error: any) => {
          this.commonFunctions.Logout(error.status);
          return error;
        }));
  }


  setHeader() {
    if (localStorage.getItem(environment.token_name)) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem(environment.token_name),
          'x-api-key': '12345'
        })
      }
      return httpOptions;
    } else {
      return null;
    }
  }


  formatDateForExcelPdf(date){
    let dt = new Date(date)
      let year  = dt.getFullYear();
      let month = (dt.getMonth() + 1).toString().padStart(2, "0");
      let day   = dt.getDate().toString().padStart(2, "0");
      return day+'-'+month+'-'+year;
  }


}
