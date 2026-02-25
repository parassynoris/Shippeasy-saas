import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import * as Constant from 'src/app/shared/common-constants';
import * as XLSX from 'xlsx';
import { AnonymousCredential, BlobServiceClient } from '@azure/storage-blob';
import { LoaderService } from '../loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { GlobalConstants } from './constants/GlobalConstants';
import { REGEX } from './constants/REGEX';

declare var Razorpay: any;
@Injectable({
  providedIn: 'root'
})

export class CommonService {
  // [x: string]: any;
  baseurlMaster = environment.baseUrlMaster;
  dashboardKey = ''
  dashboardJobKey = ''
  agentAdviseData = []
  _gc = GlobalConstants;
  regex = REGEX;
  private accountName = environment.storageAccountName;
  private accountKey = environment.storageAccountKey;
  private containerName = environment.containerName;

  private blobServiceClient: BlobServiceClient;

  constructor(
    private httpClient: HttpClient,  private commonFunction: CommonFunctions,
    private loaderService: LoaderService
  ) {

    // const { BlobServiceClient } = require('@azure/storage-blob');
    // const connectionString = 'DefaultEndpointsProtocol=https;AccountName=shipeasy;AccountKey=[REMOVED];EndpointSuffix=core.windows.net';
    // const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

    // this.blobServiceClient = blobServiceClient
    const sharedKeyCredential = new AnonymousCredential();
    this.blobServiceClient = new BlobServiceClient(`https://${this.accountName}.blob.core.windows.net`, sharedKeyCredential);
  }
  private refresh = new Subject<void>();
  get refreshreq() {
    return this.refresh;
  }

  signPdf(filedata: FormData) {
    return this.httpClient.post(`https://websocket-api.diabosapp.biz/api/signCertificate`, filedata, { responseType: 'blob' });
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

  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.commonFunction.getAuthToken()
    })
  }
  HTTP_OPTIONS1 = {
    headers: new HttpHeaders({
      'Authorization': 'Bearer ' + this.commonFunction.getAuthToken()
    })
  }
  body = {
    size: 1000,
    _source: [],
    query: {
      bool: {
        must: [{ "match": { "status": true } }],
        filter: [],
        should: [],
        must_not: [],
      },
    },
  };
  gettimezone(id: any) { // eslint-disable-line
    if (id)
      return this.timezonelist.value?.find((i: { timezoneId: any; }) => i?.timezoneId === id) // eslint-disable-line
  }
  timezonelist: any;
  getWeekdayInMonth(month: any, day: any, occurrence: any, year: any) {// eslint-disable-line


    if (occurrence > 0) {
      const date = new Date(year, month, 1);
      const daysToAdd = (day - date.getDay() + 7) % 7 + (occurrence - 1) * 7;
      date.setDate(1 + daysToAdd);

      if (date.getMonth() === month) {
        return date;
      }
    } else if (occurrence == 0) {
      const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
      const date = new Date(year, month, lastDayOfMonth);
      const daysToSubtract = (date.getDay() - day + 7) % 7;
      date.setDate(lastDayOfMonth - daysToSubtract);

      return date;
    }
    return '';


  }
  getgmttime(id: Number, date?: any) { // eslint-disable-line
    const timezone = this.gettimezone(id);
    if (timezone) {
      if (timezone?.isDST) {
        const dstFrom = timezone?.dstFromstring.split(' ');
        const dstTo = timezone?.dstTostring.split(' ');
        const fromoccurrence = this._gc.occurrence.findIndex(i => i === dstFrom[0]);
        const fromweeks = this._gc.WEEKDAYS.findIndex(i => i === dstFrom[1]);
        const frommonth = this._gc.MONTHS.findIndex(i => i === dstFrom[3]);
        const tooccurrence = this._gc.occurrence.findIndex(i => i === dstTo[0]);
        const toweeks = this._gc.WEEKDAYS.findIndex(i => i === dstTo[1]);
        const tomonth = this._gc.MONTHS.findIndex(i => i === dstTo[3]);
        const checkdate = date ? new Date(date) : new Date();
        const fromdate = this.getWeekdayInMonth(frommonth, fromweeks, fromoccurrence, checkdate.getFullYear());
        const todate = this.getWeekdayInMonth(tomonth, toweeks, tooccurrence, checkdate.getFullYear());
        if (checkdate >= fromdate && checkdate <= todate) {
          return `GMT${timezone?.DSTtime}`;
        } else {
          return `GMT${timezone?.time}`;
        }
      } else
        return `GMT${timezone?.time}`;
    } else {
      return ''
    }

  }
  filterList() {
    let paramsObj = {
      "project": [],
      "query": {},
      "sort": {
        "desc": ["updatedOn"],
      },
      size: Number(1000),
      from: 0,
    };
    return paramsObj;
  }


  pushreports(data: Object, repoName: string): Observable<any> {
    this.loaderService.showcircle();
    let reportpath = "demoReports"
    return this.httpClient.post(`${environment.baseUrlMaster}pdf/download?reportPath=${reportpath}&reportName=${repoName}&format=pdf`, data, { responseType: 'blob' }).pipe( finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  pushreportsWhatsapp(data: Object, repoName: string): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post(`${environment.baseUrlMaster}/upload-public-file/${repoName}`, data, {}).pipe( finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  downloadpdf(filedata: any, filename: any) {


    const source = filedata;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${filename}`;

    link.click();
  }
  DocumentPreview(filedata: any, filename: any) {
    const source = filedata;
    const link = document.createElement("a");
    link.href = source;
    link.download = `${filename}`;
    let pdfWindow = window.open('');
    pdfWindow.document.write(
      "<iframe width='100%' height='100%' src='" + filedata +
      "'></iframe>"
    );
  }

  countryList(): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=country`,
      this.body,
      this.HTTP_OPTIONS
    );
  }
  downloadPackageSlip(payload): Observable<any> {
    return this.httpClient.post(
      `${environment.baseUrlMaster}downloadQr`,
      payload,
      { responseType: 'blob' } // Ensure the response is treated as a Blob
    ).pipe(
      catchError(this.handleError) // Handle any errors in the request
    );
  }
  stateList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=state`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  GlobalSearchComponent(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  cityList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=city`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  taxtypeList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=taxtype`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  timeZoneList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=timezone`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  currencyList(): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=currency`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  getPartyList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=partymaster`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  picNameList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=systemtype`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  portList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=port`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  cargoList() {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=cargo`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  principalList(body) {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=address`,
      body,
      this.HTTP_OPTIONS
    );
  }

  vesselList() {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=vessel`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  costItemsList(datasend): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=costitem`,
      datasend,
      this.HTTP_OPTIONS
    );
  }

  clauseList() {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=clause`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  getPrincipalList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=principal`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  getListByURL(url: string, parameter: any): Observable<object> {
    return this.httpClient
      .post(this.baseurlMaster + url, parameter)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  SaveOrUpdate(url: string, inputdata: any) {
    const headers = new HttpHeaders().set('x-api-key', '12345');
    return this.httpClient
      .post(this.baseurlMaster + url, inputdata, this.HTTP_OPTIONS)
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }

  getCurrentAgentDetails() {

    // return JSON.parse(this.get(localStorage.getItem(Constant.UserDetails)));

    let userdetails = JSON.parse(this.commonFunction.get(localStorage.getItem(Constant.UserDetails)));
    // this.cognito.getUserDatails().subscribe((resp) => {
    //   if (resp != null) {
    //     userdetails = resp
    //   }
    // })
    return userdetails
  }
  get(value) {
    if (value !== null && value !== undefined && value !== '') {
      var key = CryptoJS.enc.Utf8.parse(Constant.EncryptionKey);
      var iv = CryptoJS.enc.Utf8.parse(Constant.EncryptionKey);
      var decrypted = CryptoJS.AES.decrypt(value, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
    return null;
  }

  systemtypeList(body): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=systemtype`, body, this.HTTP_OPTIONS);
  }

  getCostHeadList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=costhead`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getCostItemList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=costitem`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getActivityList(dataSend): Observable<any> {
    return this.httpClient.post<any>(
      environment.baseUrlMaster + Constant.GET_PROFILE_ACTIVITY,
      dataSend,
      this.HTTP_OPTIONS
    );
  }

  getDepartmentList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=department`,
      data,
      this.HTTP_OPTIONS
    );
  }

  // userList(url, dataSend): Observable<any> {
  //   return this.httpClient.post<any>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS1)
  // }

  userList(url, data: FormData): Observable<any> {

    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}${url}`,
      data,
      this.HTTP_OPTIONS1
    );
  }

  updateMasterList(type, body): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/${type}/update`, body, this.HTTP_OPTIONS);
  }
  sendEmail(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}email/send`,
      data,
      this.HTTP_OPTIONS
    );
  }




  blobToFile(blob: Blob, filename: string): File {
    const parts = [blob];
    const file = new File(parts, filename);
    return file;
  }


  async convertExcelToJson(file: File): Promise<any[]> {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        resolve(jsonData);
      };
      reader.readAsArrayBuffer(file);
    });
  }



  private saveFile(data: any): void {
    const blob = new Blob([data], { type: data.type });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.download = 'file_from_aws.txt';
    anchor.href = url;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }

  deleteFile(data) {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/document/delete`,
      data,
      this.HTTP_OPTIONS
    );
  }





  async uploadDocument(file: File, fileName: string): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    await blockBlobClient.uploadBrowserData(file, {
      blobHTTPHeaders: { blobContentType: file.type },
    });
  }

  async downloadDocument(fileName: string): Promise<ArrayBuffer> {
    const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    const response = await blockBlobClient.download(0);

    return await (await response.blobBody).arrayBuffer();
  }



  getNotify(collectionName: string, payload: object): Observable<any> {
    // this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      // this.loaderService.hidecircle();
    })
    );
  }


  getSTList(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  getCibilRequest(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }
  getGeneretINR(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.get<any>(
      `${environment.baseUrlMaster}${collectionName}`,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }
  bookingConfirm(collectionName: string ): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.get<any>(
      `${environment.baseUrlMaster}${collectionName}`,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }
  getSTList1(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  createGroup(payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}groupchat`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  getcontainer(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }


  getExchangeRate(collection: any, payload: any) {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}${collection}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  getDashboardReport(collection: any, payload: any) {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}/${collection}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  getReports(report: any, payload: any) {
    this.loaderService.showcircle();
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}report/${report}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  addPayment(data: any) {
    return this.httpClient.post(`${environment.baseUrlMaster}/Payment`, data);
  }
  postCredableBulkInitiate(body) {
    return this.httpClient.post(`${environment.baseUrlMaster}/Creable/CredableBulkInitiate`, body);
  }

  addToST(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  UpdateToST(collectionName: string, payload: Object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.put(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  clearNotification(apiName: string, payload: Object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post(
      `${environment.baseUrlMaster}${apiName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  deleteST(
    collectionName: string,
  ):
    Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.delete(
      `${environment.baseUrlMaster}${collectionName}`,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  deleteDocument(
    collectionName: string,
    documentId: string,
  ):
    Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.delete(
      `${environment.baseUrlMaster}${collectionName}/${documentId}`,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  batchInsert(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }
  batchUpdate(collectionName: string, payload: Object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.put(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  uploadDocuments(collectionName: string, payload: object): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS1
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    );
  }

  uploadDocumentsBL(collectionName: string, payload: FormData): Observable<any> {
    this.loaderService.showcircle();
    return this.httpClient.post(
      `${environment.baseUrlMaster}${collectionName}`,
      payload,
      this.HTTP_OPTIONS1
    ).pipe(finalize(() => {
      this.loaderService.hidecircle();
    })
    ); 
  }
  
  downloadDocuments(collection, fileName: string): Observable<any> {
    return this.httpClient.post(
      `${environment.baseUrlMaster}${collection}/${fileName}`, '', { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('An error occurred:', error.error);
    return throwError('Error downloading file. Please try again later.');
  }
  downloadDocumentsFile(data: Blob, fileName: string) {

    // const blob = new Blob([data], { type: 'application/pdf' });
    // let temp = URL.createObjectURL(blob);
    // // this.Documentpdf = temp;
    // const pdfWindow = window.open(temp);
    // pdfWindow.print();

    const blob = new Blob([data], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  formatDateForExcelPdf(date) {
    let dt = new Date(date)
    let year = dt.getFullYear();
    let month = (dt.getMonth() + 1).toString().padStart(2, "0");
    let day = dt.getDate().toString().padStart(2, "0");
    return day + '-' + month + '-' + year;
  }

  base64toBlob(base64: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    return new Blob([byteArray], { type: 'application/pdf' });
  }

  getFormFieldErrorMessage(formGroup?: any, formControlName?: any): string {
    let errorMsg = '';
    if (
      formControlName === undefined ||
      formGroup?.controls[formControlName] === undefined ||
      formGroup?.controls[formControlName] === null
    ) {
      return '';
    }
    if (formGroup.controls[formControlName].hasError('required')) {
      errorMsg = 'Field is required';
    }
    if (formGroup.controls[formControlName].hasError('duplicate')) {
      errorMsg = 'This value is already in use.';
    }
    if (formGroup.controls[formControlName].hasError('pattern')) {
      const pattern =
        formGroup.controls[formControlName].errors['pattern'].requiredPattern;
      const regexObject = this.regex.ALL_REGEXP.find(
        (regExp: any) => String(regExp.REG_EXP) === String(pattern)
      );
      errorMsg = `Invalid - ${regexObject?.ERROR_MSG}`;
    }
    if (formGroup.controls[formControlName].hasError('email')) {
      errorMsg = 'Email is Invalid';
    }
    if (formGroup.controls[formControlName].hasError('maxlength')) {
      const requiredLength =
        formGroup.controls[formControlName].errors['maxlength'].requiredLength;
      errorMsg = `Max length (${requiredLength}) exceeded.`;
    }
    if (formGroup.controls[formControlName].hasError('minlength')) {
      const requiredLength =
        formGroup.controls[formControlName].errors['minlength'].requiredLength;
      errorMsg = `Minimum length is (${requiredLength}).`;
    }
    if (formGroup.controls[formControlName].hasError('max')) {
      const requiredLength =
        formGroup.controls[formControlName].errors['max'].max;
      errorMsg = `Max (${requiredLength}) value exceeded.`;
    }
    if (formGroup.controls[formControlName].hasError('min')) {
      const requiredLength =
        formGroup.controls[formControlName].errors['min'].min;
      errorMsg = `Minimum value is (${requiredLength}).`;
    }
    if (formGroup.controls[formControlName].hasError('invalidHours')) {
      errorMsg = `Please enter valid time ex; time between 09:00 - 5:00 !`;
    }
    if (formGroup.controls[formControlName].hasError('matDatepickerMin')) {
      const requiredLength =
        formGroup.controls[formControlName].errors['matDatepickerMin'].min;
      errorMsg = `Minmum from date is(${requiredLength})`;
    }
    return errorMsg;
  }

  downloadEDI(fileName: string, payload): Observable<any> {
    return this.httpClient.post(
      `${environment.baseUrlMaster}/${fileName}`, payload, { responseType: 'blob' }
    ).pipe(
      catchError(this.handleError)
    );
  }
  getConfirmationModalConfig(dialogDataParams) {
    if (dialogDataParams.statusUpdateModal) {
      return this._gc.CONFIRMATION_MODAL_CONFIG_WITH_REMARKS
    } else {
      return this._gc.CONFIRMATION_MODAL_CONFIG
    }
  }

  getUpdateInvoice(data) {
    this.UpdateToST(`invoice/${data?.invoiceId}`, { ...data, paymentStatus: 'Paid' }).subscribe();
  }
  createOrder(amount: number): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}createOrder`, { amount });
  }


  initiatePayment(  amount: number, currency: string, name: string, description: string, imageUrl: string, email: string, contact: string, address: string, onSuccess: (response: any) => void, onFailure: (error: any) => void)  {

    if (typeof Razorpay === 'undefined') {
      console.error('Razorpay SDK not available');
      return;
    }

    const options = {
      key: 'rzp_test_IvoJOLo8EL77sl',
      amount: amount * 100,
      currency: currency,
      name: name,
      description: description,
      image: imageUrl,
      // order_id: orderId,
      handler: function (response: any) {
        onSuccess(response);
      },
      prefill: {
        email: email,
        contact: contact
      },
      notes: {
        address: address
      },
      theme: {
        color: '#007BFF'
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      onFailure(response.error);
    });
    rzp.open();
  }
  private reminders: any = [];
  addReminder(reminder) {
    this.reminders.push(reminder);
  }

  getReminders() {
    return this.reminders;
  }

  clearReminders() {
    this.reminders = [];
  }

}

