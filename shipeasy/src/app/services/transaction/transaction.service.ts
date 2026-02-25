import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CognitoService } from '../cognito.service';
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private httpClient: HttpClient,private commonFunction : CommonFunctions, private cognitoService: CognitoService) {
    // do nothing.
   }

  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: this.commonFunction.getAuthToken(),
    }),
  };

  /**Enquiry Charges APIs*/
  // historyContainer(addBody,id): Observable<any>{

  //   return this.httpClient.get<any>(

  //     `${environment.baseUrlMaster}`+ `audit-logs?collection=containermaster&id=${id}&eventType=update-event`,

  //     this.HTTP_OPTIONS

  //   );

  // }


  addEnquiryCharges(addBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.ENQUIRY_ITEM_ADD,
      addBody,
      this.HTTP_OPTIONS
    );
  }
  getEnquiryCharges(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.ENQUIRY_ITEM_LIST,
      data,
      this.HTTP_OPTIONS
    );
  }
  deleteEnauiryCharges(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.ENQUIRY_ITEM_DELETE,
      updateBody,
      this.HTTP_OPTIONS
    );
  }


  /**Enquiry Module APIs*/
  getEnauiryList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.ENQUIRY_LIST,
      data,
      this.HTTP_OPTIONS
    );
  }

  addEnauiry(addBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.ADD_ENQUIRY,
      addBody,
      this.HTTP_OPTIONS
    );
  }
  updateEnauiry(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.UPDATE_ENQUIRY,
      updateBody,
      this.HTTP_OPTIONS
    );
  }



  deleteEnauiryt(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.DELETE_ENQUIRY,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  addJob(addBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.ADD_JOB,
      addBody,
      this.HTTP_OPTIONS
    );
  }

  updateJob(addBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.UPDATE_JOB,
      addBody,
      this.HTTP_OPTIONS
    );
  }


  getJobList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+Constant.JOB_LIST,
      data,
      this.HTTP_OPTIONS
    );
  }

  batchInsertBL(data){
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/bl/batch-insert`,
      data,
      this.HTTP_OPTIONS
    );
  }
  getAgentAdviceList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=agentadvice`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getChargesItemList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=sacostitem`,
      data,
      this.HTTP_OPTIONS
    );
  }
  saveChargesItem(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/sacostitem`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  updateChargesItem(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/sacostitem/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  generatePDA(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/pda`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  generatDA(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/da`,
      data,
      this.HTTP_OPTIONS
    );
  }

  getContainerList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}transaction/list?type=containermaster`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  createContainer(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/containermaster`,  createBody, this.HTTP_OPTIONS);
  }
  updateContainer(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}transaction/containermaster/update`,  updateBody, this.HTTP_OPTIONS);
  }
  deleteContainer(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}transaction/containermaster/delete`,  deleteBody, this.HTTP_OPTIONS);
  }


  createTariffInput(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rate-master`,  createBody, this.HTTP_OPTIONS);
  }
  updateTariffInput(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rate-master/update`,  updateBody, this.HTTP_OPTIONS);
  }
  deletetariffInput(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rate-master/delete`,  deleteBody, this.HTTP_OPTIONS);
  }

  tariffInputList(getbody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rate-master/list`, getbody, this.HTTP_OPTIONS);
  }

  createTariffRule(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rule-master`,  createBody, this.HTTP_OPTIONS);
  }
  updateTariffRule(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rule-master/update`,  updateBody, this.HTTP_OPTIONS);
  }
  deletetariffRule(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rule-master/delete`,  deleteBody, this.HTTP_OPTIONS);
  }

  tariffRuleList(getbody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/rule-master/list`, getbody, this.HTTP_OPTIONS);
  }


  calculateTariffFromInput(getbody){
    return this.httpClient.post<any>(`${environment.baseUrlMaster}tariff/calculate`, getbody, this.HTTP_OPTIONS);
  }


  saveIgm(body){
    return this.httpClient.post<any>(`${environment.baseUrlMaster}/igm`,  body, this.HTTP_OPTIONS);
  }

  getIgm(body){
    return this.httpClient.post<any>(`${environment.baseUrlMaster}search/igm`,  body, this.HTTP_OPTIONS);
  }


  saveEgm(body){
    return this.httpClient.post<any>(`${environment.baseUrlMaster}/egm`,  body, this.HTTP_OPTIONS);
  }

  updateEgm(body){
    return this.httpClient.post<any>(`${environment.baseUrlMaster}transaction/egm/update`,  body, this.HTTP_OPTIONS);
  }


  getEgm(body){
    return this.httpClient.post<any>(`${environment.baseUrlMaster}transaction/list?type=egm`,  body, this.HTTP_OPTIONS);
  }
}
