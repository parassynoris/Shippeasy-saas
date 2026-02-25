import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BankDetail } from 'src/app/admin/smartagent/bank/bank-detail';
import { SmartAgentDetail } from 'src/app/admin/smartagent/smart-details/smartagent-detail';
import { HolidayDetail } from 'src/app/shared/components/holidays/holiday';
import { environment } from 'src/environments/environment';
import * as CryptoJS from 'crypto-js';
import * as Constant from 'src/app/shared/common-constants';
import { CostHeadDetail } from 'src/app/shared/components/cost-head/costhead';
import { CognitoService } from '../cognito.service'; 
import { partymasterDetail } from 'src/app/admin/party-master/add-party/partyMaster-detail';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Injectable({
  providedIn: 'root',
})
export class ProfilesService {
  body = {
    size: 1000,
    _source: [],
    query: {
      bool: {
        must: [{"match": {"status": true}}],
        filter: [],
        should: [],
        must_not: [],
      },
    },
  };
  constructor(
    private httpClient: HttpClient,private commonFunction : CommonFunctions,
    private cognitoService: CognitoService
  ) {
    // do nothing.
  }
  success: any;
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + this.commonFunction.getAuthToken(),
    }),
  };

  getSmartAgentList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=agent`,
      data,
      this.HTTP_OPTIONS
    );
  }

  deleteSmartAgent(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/agent/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }

  countryList(): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=country`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  stateList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=state`,
      getBody,
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
  portList() {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=port`,
      this.body,
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

  cargoList() {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=cargo`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  principalList(body) {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/address`,
      body,
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

  picTypeList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=systemtype`,
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

  timeZoneList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=timezone`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  createSmartAgent(createBody): Observable<SmartAgentDetail> {
    return this.httpClient.post<SmartAgentDetail>(
      `${environment.baseUrlMaster}profile/agent`,
      createBody,
      this.HTTP_OPTIONS
    );
  }

  getSmartAgentById(getBody): Observable<any> {

    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/agent`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  updateSmartAgent(updateBody): Observable<SmartAgentDetail> {
    return this.httpClient.post<SmartAgentDetail>(
      `${environment.baseUrlMaster}profile/agent/update`,
      updateBody,
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
  getcurrencyList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=currency`,
      data,
      this.HTTP_OPTIONS
    );
  }
  departmentList(): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=department`,
      this.body,
      this.HTTP_OPTIONS
    );
  }
  bankList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=bank`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  createBank(createBody): Observable<BankDetail> {
    return this.httpClient.post<BankDetail>(
      `${environment.baseUrlMaster}profile/bank`,
      createBody,
      this.HTTP_OPTIONS
    );
  }

  getSubAgentList(url, dataSend): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}` + url,
      dataSend,
      this.HTTP_OPTIONS
    );
  }


  getSubAgentById(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/address`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  getBankList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/bank`,
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
      `${environment.baseUrlMaster}search/bank`,
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



  updateSubAgent(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/address/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  createSubAgent(createBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/address`,
      createBody,
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

  createPrincipal(createBody): Observable<SmartAgentDetail> {
    return this.httpClient.post<SmartAgentDetail>(
      `${environment.baseUrlMaster}profile/principal`,
      createBody,
      this.HTTP_OPTIONS
    );
  }

  getPrincipalById(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/principal`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  updatePrincipal(updateBody): Observable<SmartAgentDetail> {
    return this.httpClient.post<SmartAgentDetail>(
      `${environment.baseUrlMaster}profile/principal/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  getPrincipalList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/address`,
      getBody,
      this.HTTP_OPTIONS
    );
  }

  deletePrinipal(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/principal/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }

  /**Holiday */
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

  /**Cost Head */
  getCostHeadList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=costhead`,
      data,
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

  deleteCostHead(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costhead/delete`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }
  /**Cost Item */
  getCostItemList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=costitem`,
      data,
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
  createCostItems(createBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/costitem`,
      createBody,
      this.HTTP_OPTIONS
    );
  }
  updateCostItems(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/costitem/update`,
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
  createCostItem(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/costitem`,
      updateBody,
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

  /**product */
  getDepartmentList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=department`,
      data,
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
  updateDepartmentList(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/department/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  deleteDepartmentList(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/department/delete`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  getVesselVoyageList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=voyage`,
      data,
      this.HTTP_OPTIONS
    );
  }
  addVesselVoyageList(addBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/voyage`,
      addBody,
      this.HTTP_OPTIONS
    );
  }
  updateVesselVoyageList(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/voyage/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  deleteVoyageList(updateBody): Observable<CostHeadDetail> {
    return this.httpClient.post<CostHeadDetail>(
      `${environment.baseUrlMaster}master/voyage/delete`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  getTenantList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=tenant`,
      data,
      this.HTTP_OPTIONS
    );
  }

  createTenant(createBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/tenant`,
      createBody,
      this.HTTP_OPTIONS
    );
  }
  updateTenant(updateBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/tenant/update`,
      updateBody,
      this.HTTP_OPTIONS
    );
  }

  deleteTenant(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/tenant/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }
  getNotification(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/notification`,
      data,
      this.HTTP_OPTIONS
    );
  }

  deleteNotification(deleteBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/notification/delete`,
      deleteBody,
      this.HTTP_OPTIONS
    );
  }
 
 
  /**Save Local Data */
  getCurrentAgentDetails() {
 
    // return JSON.parse(this.get(localStorage.getItem(Constant.UserDetails)));
    let userdetails ;
     this.cognitoService.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        userdetails = resp
      }
    })
    return userdetails
  }

  GetChargeGroupList(data){
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=charge-group`,
      data,
      this.HTTP_OPTIONS
    );
  }

  set(value) {
    var key = CryptoJS.enc.Utf8.parse(Constant.EncryptionKey);
    var iv = CryptoJS.enc.Utf8.parse(Constant.EncryptionKey);
    var encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value?.toString()),
      key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    return encrypted.toString();
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
  menuList(body) {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}search/menu`,
      body,
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
   getMasterList(type, data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=${type}`,
      data,
      this.HTTP_OPTIONS
    );
  }
  updateMasterList(type, body): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/${type}/update`, body, this.HTTP_OPTIONS);
  }
}
