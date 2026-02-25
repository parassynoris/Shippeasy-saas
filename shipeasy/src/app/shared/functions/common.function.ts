import { Injectable, EventEmitter } from "@angular/core";
import * as CryptoJS from "crypto-js";
import * as Constant from "../common-constants";
import { PlatformLocation } from '@angular/common';
import { BehaviorSubject, Observable } from "rxjs";
import { NavigationEnd, Router } from "@angular/router"; 
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Injectable({
  providedIn: "root",
})
export class CommonFunctions {

  isBaseUrl: any;
  invoiceDisabled: boolean = false;
  currenturl=''
  pageNo : number = 0
  getAccessLavelEventEmmiter = new EventEmitter(); 
  constructor( platformLocation: PlatformLocation, private router: Router,   private notification: NzNotificationService,) {
    this.router = router; 
    this.notification = notification;

    this.isBaseUrl = (platformLocation as any).location.origin;
    this.authTokenSubject = new BehaviorSubject<string | null>(null);
    this.authToken$ = this.authTokenSubject.asObservable();
    this.router.events?.subscribe((event: NavigationEnd) => {
      if(event.url)
      this.currenturl = event.url;
    });
  } 

 private authTokenSubject: BehaviorSubject<string | null>;
  public authToken$: Observable<string | null>;

   setAuthToken(token: string | null) {
    this.authTokenSubject.next(token);
  }

  getAuthToken(): string | null {
    // return this.authTokenSubject.value;
    return JSON.parse(this.get(localStorage.getItem('token')));
  }
  isAuthenticated(): boolean {
    if(this.getAuthToken()){
      return true
    }else{
      return false
    } 
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
    if (value !== null && value !== undefined && value !== "") {
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

  getTenantId(){
    return JSON.parse(this.get(localStorage.getItem(Constant.UserDetails)))?.tenantId
    // let userdetails ;
    //  this.cognito.getUserDatails()?.subscribe((resp) => {
    //   if (resp != null) {
    //     userdetails = resp
    //   }
    // })
    // return userdetails.tenantId
  }
 getUserType(){ 
  if(JSON.parse(this.get(localStorage.getItem('LoginType'))) == 'customer'){
    return true
  }else{
    return false
  } 
 }

  getwarehouseType(){ 
  if(JSON.parse(this.get(localStorage.getItem('LoginType'))) == 'warehouse'){
    return true
  }else{
    return false
  } 
 }
 getUserType1(){  
    return JSON.parse(this.get(localStorage.getItem('LoginType'))) || ''
 }
isAdmin(){
  if(JSON.parse(this.get(localStorage.getItem('LoginType'))) == 'superAdmin' || JSON.parse(this.get(localStorage.getItem('LoginType'))) == 'customer'){
    return false
  }else{
    return true
  }
}
 isSuperAdmin(){
  if(JSON.parse(this.get(localStorage.getItem('LoginType'))) == 'superAdmin'){
    return true
  }else{
    return false
  }
 }

 getCustomerDetails(){
  return JSON.parse(this.get(localStorage.getItem('customerDetails')));
}
customerCurrency(){
  return JSON.parse(this.get(localStorage.getItem('customerDetails')))?.currency?.currencyCode || 'INR';
}
 getExRate(){
  return JSON.parse(this.get(localStorage.getItem('exRate'))) || 0
 }

 getAgentCur(){
  return JSON.parse(this.get(localStorage.getItem('agentCurrency'))) || 'INR';
 }
 customerAgent(){
  return JSON.parse(this.get(localStorage.getItem('customerAgent')))  ;
 }
  getAgentDetails() {
    return JSON.parse(this.get(localStorage.getItem(Constant.AgentDetails)));
  }
  getActiveAgent(){
    return JSON.parse(this.get(localStorage.getItem('ActiveAgent')));
  }
  GetUserRolesAccess() {
    return JSON.parse(this.get(localStorage.getItem(Constant.UserRoleAccess)));
  }
  getSelectedModule() {
    return this.get(localStorage.getItem(Constant.CurrentModule));
  }

  setSelectedModule(module) {
    localStorage.setItem(Constant.CurrentModule, this.set(module));
  }



  getCognitoUserDetail() {
    return JSON.parse(this.get(localStorage.getItem(Constant.UserDetails)));
  }
  getModule() {
   
    let user: any
    // this.cognito.getUserModule()?.subscribe((resp) => {
    //   if (resp != null) {
    //     user = resp
    //   }
    // }) 
    return user;
  }
  Logout(ErrorStatus,isredirect?) {
    if (ErrorStatus === 401) {
      sessionStorage.clear();
      // window.location.assign(this.isBaseUrl + "/login");
      const url = this.currenturl;
      if(isredirect){
        window.location.href = `login?redirect=${url}`;
      }else{
          this.router.navigate(['login'])
      }
      // localStorage.clear();
      const keys = Object.keys(localStorage);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
                if (key !== 'rememberedUsername' && key !== 'rememberedPassword' && key !=='rememberedMe') {
          localStorage.removeItem(key);
        }
      }
      
    }
  }

  exportToExcel(
    tableColumns: any[],
    tableData: any[],
    columnsToHide: string[],
    downloadFileName: string,
    newColumLabels?: string[],
    actualColumns?: string[]
  ) { 
    if (
      tableColumns?.length === 0 ||
      tableData?.length === 0 ||
      downloadFileName === '' ||
      downloadFileName === null ||
      downloadFileName === undefined ||
      !actualColumns ||
      !newColumLabels
    ) {
      
      this.notification.create('warn', 'Unable to Export to Excel', '');
      return;
    }
    if (actualColumns.length !== newColumLabels.length) {
     
      this.notification.create('warn', 'column length issue, Unable to Export', '');
      return;
    }

    let toBeHiddenColumns: string[] = [];
    columnsToHide.forEach((rec) => {
      const columnInTableColumn = tableColumns.find(col => col === rec);
      if (columnInTableColumn) {
        toBeHiddenColumns.push(rec);
      }
    });
    columnsToHide = [...toBeHiddenColumns];

    let newColumns: any = [];
    if (newColumLabels && newColumLabels.length > 0) {
      newColumns = actualColumns.map((col, index) => {
        return {
          columnId: col,
          columnLabel: newColumLabels[index],
        };
      });
    } else {
      newColumns = actualColumns.map((col) => {
        return {
          columnId: col,
          columnLabel: col,
        };
      });
    }

    let filteredColumns = tableColumns.map(col => {
      return newColumns.find((rec: any) => rec.columnId === col);
    });
    let exportedColumns = [...filteredColumns];
    let columnCsvString = '';
    let tableDataCsvString = '';

    for (let i = columnsToHide?.length - 1; i >= 0; i--) {
      let index = exportedColumns.findIndex(
        val => val.columnId === columnsToHide[i]
      );
      exportedColumns.splice(index, 1);
    }

    let columnLabels = exportedColumns.map(col => {
      return col.columnLabel;
    });
    columnCsvString = columnLabels.join(',');
    columnCsvString += `\n`;
    let tableDataRow: any = [];
    tableData.forEach(rec => {
      let recArr: any = [];
      exportedColumns.forEach(col => {
        let splitData = col.columnId.toString().split('.')
        if(splitData.length == 2){
          recArr.push(this.getColumnValue(rec[splitData[0]]?.[splitData[1]]));
        }else if(splitData.length == 3){
          recArr.push(this.getColumnValue(rec[splitData[0]]?.[splitData[1]]?.[splitData[2]]));
        }else if(splitData.length == 4){
          recArr.push(this.getColumnValue(rec[splitData[0]][splitData[1]]?.[splitData[2]]?.[splitData[3]]));
        }
        else{
          recArr.push(this.getColumnValue(rec[col.columnId]));
        }
       
      });
      tableDataRow.push(recArr.join(','));
    });
    tableDataCsvString = tableDataRow.join('\n');
    const finalCsvString = columnCsvString + tableDataCsvString;
    let exportElement = window.document.createElement('A');
    const blob = new Blob([finalCsvString], { type: 'text/csv' });
    // const blob = new Blob([finalCsvString], { type: 'text' });
    exportElement.setAttribute('href', window.URL.createObjectURL(blob));
    exportElement.setAttribute('download', `${downloadFileName}.csv`);
    // exportElement.setAttribute("download", `${downloadFileName}.xml`);
    document.body.appendChild(exportElement);
    exportElement.click();
    document.body.removeChild(exportElement);
    setTimeout(() => { 
      this.notification.create('info', 'Exported successfully', '');
    }, 500);
  }
  async signout() {
    // await Auth.signOut();
    // this.authenticationSubject.next(false);
    localStorage.removeItem('isUserLoggedIn');

    return true;
  }
  getColumnValue(value: any) {
    if (value === null || value === undefined) return '-';
    else {
      if (value === 'Y' || value === true) return 'Active';
      else if (value === 'N' || value === false) return 'Inactive';
      else return '"' + value + '"';
    }
  }

  copyToClipboard(text: string, label: string = 'Text') {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      this.notification.create('success', 'Copied!', `${label} copied to clipboard`);
    }).catch(() => {
      this.notification.create('error', 'Copy Failed', `Unable to copy ${label}`);
    });
  }
}
