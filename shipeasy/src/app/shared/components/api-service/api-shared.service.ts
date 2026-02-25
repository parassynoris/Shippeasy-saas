import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import * as Constant from 'src/app/shared/common-constants';
import { CognitoService } from 'src/app/services/cognito.service';
import { BankDetail } from '../gl-bank/bank-detail';
import { SmartAgentDetail } from 'src/app/admin/smartagent/smart-details/smartagent-detail';
import { HolidayDetail } from '../holidays/holiday';
import { CostHeadDetail } from '../cost-head/costhead';
import { Services } from 'src/app/services/Masters/masters';
import { CommonFunctions } from '../../functions/common.function';

@Injectable({
  providedIn: 'root',
})
export class ApiSharedService {
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.commonFunction.getAuthToken(),
    }),
  };
  body = {
    size: 10000,
    sort : {
      "createdOn": "desc"
    },
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
  bodyNew = {
    size: 10000,
    from : 0,
    sort : {
      "createdOn": "desc"
    },
    _source: [],
    query: {
      bool: {
        must: [],
        filter: [],
        should: [],
        must_not: [],
      },
    }
  };
  ipdaKey = false;
  constructor(
    private httpClient: HttpClient, private commonFunction : CommonFunctions,
    private cognitoService: CognitoService
  ) {
  
  }

  deleteUserBOLD(serverUrl: string, token) {
    return this.httpClient.delete(serverUrl, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token }) });
  }

  GetUsersBOLD(serverUrl: string, token) {
    return this.httpClient.get(serverUrl, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token }) });
  }
  getAsyncToken(serverUrl: string, userName: string, password: string) {
    return this.httpClient.post(serverUrl + '/get-user-key', { userid: userName, password: password });
  }
  addUserBOLD(serverUrl: string, payload: any, token) {
    return this.httpClient.post(serverUrl, payload, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token }) });
  }
  putUserBOLD(serverUrl: string, payload: any, token) {
    return this.httpClient.put(serverUrl, payload, { headers: new HttpHeaders({ 'Content-Type': 'application/json', 'Authorization': token }) });
  }
  getMasterList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }

  masterSave(type, body): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/${type}`,
      body,
      this.HTTP_OPTIONS
    );
  }

  masterDelete(type, body): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/${type}/delete`,
      body,
      this.HTTP_OPTIONS
    );
  }


  updateMasterList(type, body): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/${type}/update`,
      body,
      this.HTTP_OPTIONS
    );
  }
 
  getFinanceList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }

  FinanceSave(type, body): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}finance/${type}`,
      body,
      this.HTTP_OPTIONS
    );
  }

  FinanceDelete(type, body): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}finance/${type}/delete`,
      body,
      this.HTTP_OPTIONS
    );
  }


  updateFinance(type, body): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}finance/${type}/update`,
      body,
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
 
  deleteProfile(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/${type}/delete`,
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

 
  fdaGenerate(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/${type}/fda`,
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


  getDAListing(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}query/list?type=da`,
      data,
      this.HTTP_OPTIONS
    );
  }
  deleteDaData(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}query/da/delete`,
      data,
      this.HTTP_OPTIONS
    );
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
  private refresh = new Subject<void>();
  get refreshreq() {
    return this.refresh;
  }

  getList(type: string, parameter: any): Observable<object> {
    return this.httpClient
      .post<any>(
        environment.baseUrlMaster + 'profile/list?type=' + type,
        parameter
      )
      .pipe(catchError(this.errorHandler));
  }
  getList1(type: string, parameter: any): Observable<object> {
    return this.httpClient
      .post<any>(
        environment.baseUrlMaster + 'master/list?type=' + type,
        parameter
      )
      .pipe(catchError(this.errorHandler));
  }
  delete1(type: string, data): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${window.btoa('admin:admin')}`,
      }),
    };
    return this.httpClient
      .post<any>(environment.baseUrlMaster + `${type}`, data, httpOptions)
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }

  updateRecord(type: string, parameter: any) {
    const headers = new HttpHeaders().set('x-api-key', '12345');
    return this.httpClient
      .post<any>(environment.baseUrlMaster + type, parameter, { headers })
      .pipe(
        tap(() => {
          this.refreshreq.next();
        }),
        catchError(this.errorHandler)
      );
  }
  create1(type: string, data): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Basic ${window.btoa('admin:admin')}`,
      }),
    };
    return this.httpClient.post<any>(
      environment.baseUrlMaster + `${type}`,
      data,
      httpOptions
    );
  }

  getBankList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=bank`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  deleteBank(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/bank/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }
  getBankById(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=bank`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  updateBank(updateBody): Observable<BankDetail> {
    return this.httpClient.post<BankDetail>(
      `${environment.baseUrlMaster}master/bank/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  createBank(createBody): Observable<BankDetail> {
    return this.httpClient.post<BankDetail>(
      `${environment.baseUrlMaster}master/bank`,
      createBody,
      this.HTTP_OPTIONS
    );
  }

  getBranchList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=branch`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  deleteBranch(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/branch/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }
  getBranchById(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=branch`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  createBranch(createBody): Observable<SmartAgentDetail> {
    return this.httpClient.post<SmartAgentDetail>(
      `${environment.baseUrlMaster}profile/branch`,
      createBody,
      this.HTTP_OPTIONS
    );
  }
  updateBranch(updateBody): Observable<SmartAgentDetail> {
    return this.httpClient.post<SmartAgentDetail>(
      `${environment.baseUrlMaster}profile/branch/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  
  listAgreement(type: any, data: any) {
    return this.httpClient
      .post<any>(
        environment.baseUrlMaster + 'transaction/list?type=' + type,
        data,
        this.HTTP_OPTIONS
      )
      .pipe(catchError(this.errorHandler));
  }
  deleteAgreement(type: any, data: any) {
    return this.httpClient.post<any>(
      environment.baseUrlMaster + `${type}` + `/delete`,
      data,
      this.HTTP_OPTIONS
    );
  }
  getagreementById(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=agreement`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  createAgreement(type: any, data: any) {
    return this.httpClient.post<any>(
      environment.baseUrlMaster + `${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  updateAgreement(type: any, data: any) {
    return this.httpClient.post<any>(
      environment.baseUrlMaster + `${type}` + `/update`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getHolidayList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=holiday`,
      getBody,
      this.HTTP_OPTIONS
    );
  }
  updateHoliday(updateBody): Observable<HolidayDetail> {
    return this.httpClient.post<HolidayDetail>(
      `${environment.baseUrlMaster}transaction/holiday/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  createHoliday(createBody): Observable<HolidayDetail> {
    return this.httpClient.post<HolidayDetail>(
      `${environment.baseUrlMaster}transaction/holiday`,
      createBody,
      this.HTTP_OPTIONS
    );
  }

  addEnquiryCharges(addBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}` + Constant.ENQUIRY_ITEM_ADD,
      addBody,
      this.HTTP_OPTIONS
    );
  }
  updateEnquiryCharges(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}` + Constant.ENQUIRY_ITEM_UPDATE,
      updateBody,
      this.HTTP_OPTIONS
    );
  }


  deletePort(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/port/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }
  createPort(createBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/port`,
      createBody,
      this.HTTP_OPTIONS
    );
  }
  updatePort(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/port/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  deleteCostHead(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costhead/delete`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  createCostHead(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costhead`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  updateCostHead(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costhead/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
 
  deleteCostItem(deletebody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/costitem/delete`,
      deletebody,
      this.HTTP_OPTIONS
    );
  }
  updateCostItem(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costitem/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  createCostItem(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costitem`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  deleteActivity(dataSend): Observable<Services> {
    return this.httpClient.post<Services>(
      environment.baseUrlMaster + Constant.DELETE_ACTIVITY,
      dataSend,
      this.HTTP_OPTIONS
    );
  }
  updateActivity(dataSend): Observable<Services> {
    return this.httpClient.post<Services>(
      environment.baseUrlMaster + Constant.UPDATE_ACTIVITY,
      dataSend,
      this.HTTP_OPTIONS
    );
  }
  creatOrUpdateActivity(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(
      `${environment.baseUrlMaster}` + url,
      dataSend,
      this.HTTP_OPTIONS
    );
  }

  updateDepartmentList(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/department/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  addDepartmentList(addBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/department`,
      addBody,
      this.HTTP_OPTIONS
    );
  }

  getCommentList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}contract/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getContractCommentSave(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}contract/comment`,
      data,
      this.HTTP_OPTIONS
    );
  }
  commentBatchUpdate(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}contract/comment/batch-update`,
      data,
      this.HTTP_OPTIONS
    );
  }
  commentBatchSave(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}contract/comment/batch-insert`,
      data,
      this.HTTP_OPTIONS
    );
  }
  deleteComment(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}contract/comment/delete`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getContainerList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=container`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  sendEmail(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}email/send`,
      data,
      this.HTTP_OPTIONS
    );
  }


  getListByUrl(url, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}${url}`,
      data,
      this.HTTP_OPTIONS
    );
  }

  savePortDaCharges(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/portda`,
      data,
      this.HTTP_OPTIONS
    );
  }
}
