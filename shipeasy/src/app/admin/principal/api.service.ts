import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  baseurlMaster = environment.baseUrlMaster;
  
  httpOptions = {
    headers: new HttpHeaders({
      'x-api-key': '12345',
    }),
  };
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.commonFunction?.getAuthToken()}`,'x-api-key':environment['x-api-key']
    }),
  };
 
  HTTP_OPTIONS1 = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  body = {
    size: 1000,
    _source: [],
    query: {
      bool: {
        must: [],
        filter: [],
        should: [],
        must_not: [],
      },
    },
  };
  filterList() {
    let paramsObj = {
      "project": [],
      "query": {},
      "sort" :{
        "desc" : ["updatedOn"]
     },
      size: Number(1000),
      from: 0,
  };
    return paramsObj;
  }
   
  constructor(private http: HttpClient, private loaderService : LoaderService,private commonFunction : CommonFunctions) {
     
  }
  private getHeaders(): HttpHeaders {
    const authToken = this.commonFunction.getAuthToken(); 
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,'x-api-key':environment['x-api-key']
    });
  }
  private refresh = new Subject<void>();
  get refreshreq() {
    return this.refresh;
  }
  getAll(): Observable<object> {
    return this.http
      .get(this.baseurlMaster)
      .pipe(catchError(this.errorHandler));
  }
  getListByURL(url: string, parameter: any): Observable<object> {

    return this.http
      .post(this.baseurlMaster + url, parameter)
      .pipe(
        catchError(this.errorHandler)
      );
  }
  getList(type: string, parameter: any): Observable<object> {

    return this.http
      .post(this.baseurlMaster + 'profile/list?type=' + type, parameter)
      .pipe(
        catchError(this.errorHandler)
      );
  }
  getMasterList(type, data): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getList1(type: string, parameter: any): Observable<object> {
    return this.http.post(this.baseurlMaster + "master/list?type=" + type, parameter).pipe
      (
        catchError(this.errorHandler)
      )
  }

  create1(type: string, data): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${window.btoa('admin:admin')}`,
      }),
    };
    return this.http.post(this.baseurlMaster + `${type}`, data, httpOptions);
  }

  create(type: string, inputdata: any, parameter: any) {
    const headers = new HttpHeaders().set('x-api-key', '12345');
    return this.http
      .post(this.baseurlMaster + type, parameter, { headers })
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }

  SaveOrUpdate(url: string, inputdata: any) {
    const headers = new HttpHeaders().set('x-api-key', '12345');
    return this.http
      .post(this.baseurlMaster + url, inputdata, this.HTTP_OPTIONS)
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }

  GetSingleRecord(
    type: string,
    inputdata: any,
    parameter: any
  ): Observable<object> {
    const headers = new HttpHeaders().set('x-api-key', '12345');
    return this.http
      .post<any>(this.baseurlMaster + 'profile/list?type=' + type, parameter, {
        headers,
      })
      .pipe(catchError(this.errorHandler));
  }
  GetSingleRecord1(type: string, data: any): Observable<object> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Basic ${window.btoa('admin:admin')}`
      }),
    };
    return this.http.post(this.baseurlMaster + `${type}`, data, httpOptions)
  }
  updateRecord(type: string, parameter: any) {
    const headers = new HttpHeaders().set('x-api-key', '12345');
    return this.http
      .post(this.baseurlMaster + type, parameter, { headers })
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }
  update(id: any): Observable<object> {
    return this.http
      .get(this.baseurlMaster + '/' + id)
      .pipe(catchError(this.errorHandler));
  }
  delete1(type: string, data): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${window.btoa('admin:admin')}`,
      }),
    };
    return this.http
      .post(this.baseurlMaster + `${type}`, data, httpOptions)
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }
  delete(type, id) {
    return this.http
      .delete(this.baseurlMaster + type + id)
      .pipe(catchError(this.errorHandler));
  }
  find(id): Observable<any> {
    return this.http
      .get<any>(this.baseurlMaster + '/' + id)
      .pipe(catchError(this.errorHandler));
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
  createAgreement(type: any, data: any) {
    return this.http.post(this.baseurlMaster + `${type}`, data, this.HTTP_OPTIONS);
  }
  listAgreement(type: any, data: any) {
    return this.http
      .post(this.baseurlMaster + 'transaction/list?type=' + type, data, this.HTTP_OPTIONS)
      .pipe(
        catchError(this.errorHandler)
      );
  }
  getagreementById(getBody): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=agreement`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  getAgentAdviceById(getBody): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/list?type=agentadvice`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
 
  updateAgreement(type: any, data: any) {
    return this.http.post(this.baseurlMaster + `${type}` + `/update`, data, this.HTTP_OPTIONS);
  }
  deleteAgreement(type: any, data: any) {
    return this.http.post(this.baseurlMaster + `${type}` + `/delete`, data, this.HTTP_OPTIONS);
  }
  getVesselById(getBody): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/list?type=vessel`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  createAgentAdvice(body): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/agentadvice`,
      body,
      this.HTTP_OPTIONS
    );
  }

  updateAgentAdvice(body): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/agentadvice/update`,
      body,
      this.HTTP_OPTIONS
    );
  }
  deleteAgentAdvice(body): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/agentadvice/delete`,
      body,
      this.HTTP_OPTIONS
    );
  }

  createVendor(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}profile/vendor`, body, this.HTTP_OPTIONS);
  }

  deleteVendor(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}profile/vendor/delete`, body, this.HTTP_OPTIONS);
  }

  updateVendor(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}profile/vendor/update`, body, this.HTTP_OPTIONS);
  }
  deleteRecord(url): Observable<any>{
    return this.http.delete<any>(`${environment.baseUrlMaster}` + url, this.HTTP_OPTIONS);

  }
  deleteEnquiry(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.DELETE_ENQUIRY, body, this.HTTP_OPTIONS);
  }
  deleteBatch(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.DELETE_BATCH, body, this.HTTP_OPTIONS);
  }
  deleteBL(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.DELETE_BL, body, this.HTTP_OPTIONS);
  }
  deleteContainer(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.DELETE_CONTAINER, body, this.HTTP_OPTIONS);
  }
  deleteDeliveryOrder(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.MASTER_DELETE_DELIVERY_ORDER, body, this.HTTP_OPTIONS);
  }
  createVendorBills(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}`+ Constant.ADD_VENDOR_BILL, body, this.HTTP_OPTIONS);
  }
  updateVendorBills(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}`+ Constant.UPDATE_VENDOR_BILL, body, this.HTTP_OPTIONS);
  }
  deleteVendorBills(body): Observable<any> {
    return this.http.post<any>(`${environment.baseUrlMaster}` + Constant.DELETE_CONTAINER, body, this.HTTP_OPTIONS);
  }

  sendEmail(data): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}email/send`,
      data,
      this.HTTP_OPTIONS
    );
  }

   getProfileList(type, data): Observable<any> {
    return this.http.post<any>(
      `${environment.baseUrlMaster}profile/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }

  sendArtifacts(data){
    return this.http.post<any>(
      `${environment.baseUrlMaster}master/batchArtifacts`,
      data,
      this.HTTP_OPTIONS
    );
  }
  login(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.http.post<any>(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS1
    ).pipe( finalize(() => {
      this.loaderService.hidecircle();
      })
    );
  }
  getExchangeRate(collection:any , payload:any){
    this.loaderService.showcircle();
    return this.http.post<any>(
      `${environment.baseUrlMaster}${collection}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe( finalize(() => {
      this.loaderService.hidecircle();
      })
    );
  }
 
  getEdi(ediName: string, documentId: object): Observable<any> {
    this.loaderService.showcircle();
    return this.http.post<any>(
      `${environment.baseUrlMaster}edi/${ediName}/${documentId}`,
      {},
      {
        headers: {
          Accept:"text/plain",
          'Authorization': `Bearer ${this.commonFunction.getAuthToken()}`,'x-api-key':environment['x-api-key']
        },
        responseType: 'text' as 'json'
      }
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }
  getSTList(collectionName: string, payload: object): Observable<any> {
    const headers = this.getHeaders();
    this.loaderService.showcircle();
    return this.http.post<any>(
      `${environment.baseUrlMaster}search/${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe( finalize(() => {
      this.loaderService.hidecircle();
      })
    );
  }

  getBatchList(collectionName: string, payload: object, showLoader: boolean = true): Observable<any> {
    const headers = this.getHeaders();
    
    return this.http.post<any>(
      `${environment.baseUrlMaster}search/${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(
      finalize(() => {
      })
    );
  }

  addToST(collectionName: string, payload: object): Observable<any> {

    


    this.loaderService.showcircle();
    return this.http.post(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe( finalize(() => {
      this.loaderService.hidecircle();
      })
    );
  }
  
  UpdateToST(collectionName: string, payload: Object): Observable<any> {
    this.loaderService.showcircle();
    return this.http.put(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe( finalize(() => {
      this.loaderService.hidecircle();
      })
    );
  }
  deleteST (
    collectionName: string, ):  Observable<any> {
    this.loaderService.showcircle();
    return this.http.delete(
      `${environment.baseUrlMaster}${collectionName}`,
      this.HTTP_OPTIONS
    ).pipe( finalize(() => {
      this.loaderService.hidecircle();
      })
    );
  }

}