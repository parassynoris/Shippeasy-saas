import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CognitoService } from '../cognito.service';
import { CostItems, Location, Product, Roles, Services, Uom, User } from './masters';
import * as Constant from 'src/app/shared/common-constants';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Injectable({
  providedIn: 'root'
})
export class MastersService {


  body = {
    "size": 500,
    "_source": [],
    "query": {
      "bool": {
        "must": [],
        "filter": [],
        "should": [],
        "must_not": []
      }
    }
  }
  constructor(private httpClient: HttpClient,private commonFunction : CommonFunctions, private cognitoService: CognitoService) {
    // do nothing.
   }

  success: any;
  HTTP_OPTIONS = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.commonFunction.getAuthToken()
    }),
  }



  locationList(dataSend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=location`, dataSend, this.HTTP_OPTIONS);
  }
  CreateLocation(createBody): Observable<Location> {
    return this.httpClient.post<Location>(`${environment.baseUrlMaster}master/location`, createBody, this.HTTP_OPTIONS);
  }
  updateLocation(updateBody) {
    return this.httpClient.post<CostItems>(`${environment.baseUrlMaster}master/location/update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteLocation(deletebody): Observable<Location> {
    return this.httpClient.post<Location>(`${environment.baseUrlMaster}master/location/delete`, deletebody, this.HTTP_OPTIONS)
  }
  productList(dataSend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=product`, dataSend, this.HTTP_OPTIONS)
  }
  createProduct(createBody): Observable<Product> {
    return this.httpClient.post<Product>(`${environment.baseUrlMaster}master/product`, createBody, this.HTTP_OPTIONS);

  }
  updateProduct(updateBody): Observable<Product> {
    return this.httpClient.post<Product>(`${environment.baseUrlMaster}master/product/update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteProduct(deletebody): Observable<Product> {
    return this.httpClient.post<Product>(`${environment.baseUrlMaster}master/product/delete`, deletebody, this.HTTP_OPTIONS);
  }
  costItemsList(datasend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=costitem`, datasend, this.HTTP_OPTIONS);
  }
  createCostItems(createBody): Observable<CostItems> {
    return this.httpClient.post<CostItems>(`${environment.baseUrlMaster}master/costitem`, createBody, this.HTTP_OPTIONS);
  }
  updateCostItems(updateBody): Observable<CostItems> {
    return this.httpClient.post<CostItems>(`${environment.baseUrlMaster}master/costitem/update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteCostItem(deletebody): Observable<CostItems> {
    return this.httpClient.post<CostItems>(`${environment.baseUrlMaster}master/costitem/delete`, deletebody, this.HTTP_OPTIONS)
  }
  uomList(datasend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=uom`, datasend, this.HTTP_OPTIONS);
  }
  createUom(createBody): Observable<Uom> {
    return this.httpClient.post<Uom>(`${environment.baseUrlMaster}master/uom`, createBody, this.HTTP_OPTIONS);
  }
  updateUom(updateBody): Observable<Uom> {
    return this.httpClient.post<Uom>(`${environment.baseUrlMaster}master/uom/update`, updateBody, this.HTTP_OPTIONS)
  }
  deleteUom(deleteBody): Observable<Uom> {
    return this.httpClient.post<Uom>(`${environment.baseUrlMaster}master/uom/delete`, deleteBody, this.HTTP_OPTIONS)
  }

  systemtypeList(body): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=systemtype`, body, this.HTTP_OPTIONS);
  }
  createSystemType(createBody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/systemtype`, createBody, this.HTTP_OPTIONS);
  }
  updateSystemType(updateBody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/systemtype/update`, updateBody, this.HTTP_OPTIONS)
  }
  deleteSystemType(deletebody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/systemtype/delete`, deletebody, this.HTTP_OPTIONS)
  }
 
  createUser(createBody): Observable<User> {
    return this.httpClient.post<User>(`${environment.baseUrlMaster}/contract/users`, createBody, this.HTTP_OPTIONS);
  }
  updateUser(updateBody): Observable<User> {
    return this.httpClient.post<User>(`${environment.baseUrlMaster}/contract/users`, updateBody, this.HTTP_OPTIONS);

  }
  roleList(datasend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}profile/list?type=role`, datasend, this.HTTP_OPTIONS)
  }
  updateRole(updateBody, id: string): Observable<Roles> {
    return this.httpClient.post<Roles>(`${environment.baseUrlMaster}contract/roles`, updateBody, this.HTTP_OPTIONS);

  }
  currList(datasend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=currrate`, datasend, this.HTTP_OPTIONS)
  }
  createCuurRate(createBody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/currrate`, createBody, this.HTTP_OPTIONS)
  }
  updateCuurRate(updateBody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/currrate/update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteCurrRate(deletebody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/currrate/delete`, deletebody, this.HTTP_OPTIONS)
  }
  shippingLineList(datasend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=shippingline`, datasend, this.HTTP_OPTIONS)
  }
  createshippingLine(createBody): Observable<Roles> {
    return this.httpClient.post<Roles>(`${environment.baseUrlMaster}master/shippingline`, createBody, this.HTTP_OPTIONS)
  }
  updateshippingLine(updateBody): Observable<Roles> {
    return this.httpClient.post<Roles>(`${environment.baseUrlMaster}master/shippingline/update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteshippingLine(deletebody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/shippingline/delete`, deletebody, this.HTTP_OPTIONS)
  }
  pdatemplateList(dataSend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}contract/list?type=pdatemplate`, dataSend, this.HTTP_OPTIONS)
  }
  createpdatemplate(createBody): Observable<Roles> {
    return this.httpClient.post<Roles>(`${environment.baseUrlMaster}contract/pdatemplate`, createBody, this.HTTP_OPTIONS)
  }
  updatepdatemplate(updateBody): Observable<Roles> {
    return this.httpClient.post<Roles>(`${environment.baseUrlMaster}contract/pdatemplate`, updateBody, this.HTTP_OPTIONS);

  }
  vesselList(dataSend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=vessel`, dataSend, this.HTTP_OPTIONS)
  }
  createVessel(createBody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/vessel`, createBody, this.HTTP_OPTIONS)
  }
  updateVessel(updateBody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/vessel/update`, updateBody, this.HTTP_OPTIONS);

  }
  deleteVessel(deletebody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/vessel/delete`, deletebody, this.HTTP_OPTIONS);

  }

  voyageList(): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}contract/list?type=voyages`, this.body, this.HTTP_OPTIONS)
  }
  createVoyage(createBody): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}contract/voyage`, createBody, this.HTTP_OPTIONS);
  }
  updateVoyage(updateBody): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}contract/voyage`, updateBody, this.HTTP_OPTIONS);

  }
  servicesList(dataSend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/list?type=service`, dataSend, this.HTTP_OPTIONS)
  }
  createServices(createBody): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}master/service`, createBody, this.HTTP_OPTIONS);
  }
  updateServices(updateBody): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}master/service/update`, updateBody, this.HTTP_OPTIONS);
  }
  deleteService(deletebody): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}master/service/delete`, deletebody, this.HTTP_OPTIONS)
  }

  getFeatureList(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(environment.baseUrlMaster + url, dataSend, this.HTTP_OPTIONS);
  }
  createRole(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS);
  }
  deleteRole(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS);
  }
  creatOrUpdateUser(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS);
  }
  userList(url, dataSend): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS)
  }
  deleteUser(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS);
  }
 getBillList(dataSend): Observable<Services> {
  return this.httpClient.post<Services>(environment.baseUrlMaster + Constant.GET_BILL, dataSend, this.HTTP_OPTIONS);
}
  getActivityList(dataSend): Observable<Services> {
    return this.httpClient.post<Services>(environment.baseUrlMaster + Constant.GET_ACTIVITY, dataSend, this.HTTP_OPTIONS);
  }
  creatOrUpdateActivity(url, dataSend): Observable<Services> {
    return this.httpClient.post<Services>(`${environment.baseUrlMaster}` + url, dataSend, this.HTTP_OPTIONS);
  }

  deleteActivity(dataSend): Observable<Services> {
    return this.httpClient.post<Services>(environment.baseUrlMaster + Constant.DELETE_ACTIVITY, dataSend, this.HTTP_OPTIONS);
  }

}
