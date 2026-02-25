import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BankDetail } from "src/app/admin/smartagent/bank/bank-detail";
import { SmartAgentDetail } from "src/app/admin/smartagent/smart-details/smartagent-detail"; 
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class VendorService {
  success: any;
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Basic ${window.btoa("admin:admin")}`,
    }),
  };
  body = {
    size: 100,
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
  storeVendoeId:any;
  constructor(private httpClient: HttpClient) {
    // do nothing.
   }

  getVendorList(data): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=vendor`,
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
      `${environment.baseUrlMaster}profile/list?type=agent`,
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


  getSubAgentList(): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}address?type=subagent`,
      this.body,
      this.HTTP_OPTIONS
    );
  }


  getSubAgentById(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}profile/list?type=subagent`,
      getBody,
      this.HTTP_OPTIONS
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
      `${environment.baseUrlMaster}profile/bank/delete`,
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
      `${environment.baseUrlMaster}profile/bank/update`,
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
      `${environment.baseUrlMaster}profile/list?type=principal`,
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
      `${environment.baseUrlMaster}profile/list?type=principal`,
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
}
