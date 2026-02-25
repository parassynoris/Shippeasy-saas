import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaMasterService {
  success: any;
  HTTP_OPTIONS = {
   headers: new HttpHeaders({
   'Content-Type': 'application/json',
   'Authorization': `Basic ${window.btoa('admin:admin')}`
   }),
   }
    body = {
      "size": 1000,
     "_source" : [],
     "query" : {
         "bool" : {
              "must" : [],
              "filter" : [],
              "should" : [],
              "must_not" : []
       }
     }
   }

  constructor(private httpClient:HttpClient) {
    // do nothing.
   }
  portList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=port`,dataSend,this.HTTP_OPTIONS);
  }
  createPort(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/port`,createBody,this.HTTP_OPTIONS);
  }
  updatePort(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/port/update`,updateBody,this.HTTP_OPTIONS);
  }
  deletePort(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/port/delete`,deleteBody,this.HTTP_OPTIONS);
  }
createTemplate(createBody):Observable<any>{
  return this.httpClient.post<any>(`${environment.baseUrlMaster}master/costtemplate`,createBody,this.HTTP_OPTIONS);
}
templateList(dataSend):Observable<any>{
  return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=costtemplate`,dataSend,this.HTTP_OPTIONS);
}
updateTemplate(updateBody):Observable<any>{
  return this.httpClient.post<any>(`${environment.baseUrlMaster}master/costtemplate/update`,updateBody,this.HTTP_OPTIONS);
}
deleteTemplate(deleteBody):Observable<any>{
  return this.httpClient.post<any>(`${environment.baseUrlMaster}master/costtemplate/delete`,deleteBody,this.HTTP_OPTIONS);
}
  clauseList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=clause`,dataSend,this.HTTP_OPTIONS);
  }
  createClause(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/clause`,createBody,this.HTTP_OPTIONS);
  }
  updateClause(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/clause/update`,updateBody,this.HTTP_OPTIONS);
  }
  deleteClause(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/clause/delete`,deleteBody,this.HTTP_OPTIONS);
  }

  countryList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=country`,dataSend,this.HTTP_OPTIONS);
  }
  createCountry(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/country`,createBody,this.HTTP_OPTIONS);
  }
  updateCountry(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/country/update`,updateBody,this.HTTP_OPTIONS);
  }
  deleteCountry(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/country/delete`,deleteBody,this.HTTP_OPTIONS);
  }

  stateList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=state`, dataSend, this.HTTP_OPTIONS);
  }
  createState(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/state`,createBody,this.HTTP_OPTIONS);
  }
  updateState(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/state/update`,updateBody,this.HTTP_OPTIONS);
  }
  deleteState(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/state/delete`,deleteBody,this.HTTP_OPTIONS);
  }

  cityList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=city`, dataSend, this.HTTP_OPTIONS);
  }
  createCity(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/city`,createBody,this.HTTP_OPTIONS);
  }
  updateCity(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/city/update`,updateBody,this.HTTP_OPTIONS);
  }
  deleteCity(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/city/delete`,deleteBody,this.HTTP_OPTIONS);
  }

  currencyList(dataSend):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=currency`,dataSend,this.HTTP_OPTIONS);
  }
  createCurrency(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/currency`,createBody,this.HTTP_OPTIONS);
  }
  updateCurrency(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/currency/update`,updateBody,this.HTTP_OPTIONS);
  }
  deleteCurrency(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/currency/delete`,deleteBody,this.HTTP_OPTIONS);
  }

  commodityList(body):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=commodity`,body,this.HTTP_OPTIONS);
  }
  createCommodity(createBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/commodity`,createBody,this.HTTP_OPTIONS);
  }
  updateCommodity(updateBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/commodity/update`,updateBody,this.HTTP_OPTIONS);
  }
  deleteCommodity(deleteBody):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/commodity/delete`,deleteBody,this.HTTP_OPTIONS);
  }

 
  
  systemTypeList(body):Observable<any>{
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=systemtype`,  body, this.HTTP_OPTIONS);
  }
}
