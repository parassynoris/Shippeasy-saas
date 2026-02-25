import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { SmartAgentDetail } from "src/app/admin/smartagent/smart-details/smartagent-detail";
import { environment } from "src/environments/environment";
import { ContactDetail } from "../components/contacts/contact-detail";

@Injectable({
  providedIn: "root",
})
export class SharedService {
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
  constructor(private httpClient: HttpClient) {
    
    this.httpClient = httpClient
  }

  contactTypeList(): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=contacttype`,
      this.body,
      this.HTTP_OPTIONS
    );
  }

  createContact(createBody): Observable<ContactDetail> {
    return this.httpClient.post<ContactDetail>(
      `${environment.baseUrlMaster}profile/contact`,
      createBody,
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

  taxtypeList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=taxtype`,
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

  portList(getBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}master/list?type=port`,
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
  filterAll(url, createBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+url,
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
  createBill(url, createBody): Observable<any> {
    return this.httpClient.post<any>(
      `${environment.baseUrlMaster}`+url,
      createBody,
      this.HTTP_OPTIONS
    );
  }
}
