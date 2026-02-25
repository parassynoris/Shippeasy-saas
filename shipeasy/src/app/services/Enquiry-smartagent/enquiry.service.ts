import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import {enquiry} from './Enquiry';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EnquiryService {

  constructor(private httpClient:HttpClient) { 
    // do nothing.
  }
  
 
  CreateEnquiry(createBody): Observable<enquiry>{
    let httpHeaders=new HttpHeaders();
    httpHeaders.append('content-type','application.json',); 
    httpHeaders.append('x-api-key', `12345`);

    httpHeaders=httpHeaders.set('x-api-key', `12345`);
    return this.httpClient.post<enquiry>('https://diabos-masters.centralus.azurecontainer.io:8253/enquiry', createBody,{headers:httpHeaders});
     
  }
}
