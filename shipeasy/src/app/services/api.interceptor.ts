import * as CryptoJS from 'crypto-js';

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { LoaderService } from './loader.service';
import { catchError, finalize, tap, map } from 'rxjs/operators';
import { CommonFunctions } from '../shared/functions/common.function';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from './common/common.service';
import { LogoutmessageComponent } from '../auth/logoutmessage.component';
import { CONFIRMATION_MODAL_RESPONSE } from './common/constants/GlobalConstants';
import { ApmService } from '@elastic/apm-rum-angular';
import { MessagingService } from './messaging.service';
import { ActivatedRoute, Router } from '@angular/router';
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private isPopupOpen = false;
  constructor(private router: Router, private route: ActivatedRoute, private loader: LoaderService, private messagingService: MessagingService, private apmservice: ApmService, private commonFunction: CommonFunctions, private dialog: MatDialog, private commonService: CommonService) {


  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let url = request.url.split('/');

    if (request.method === "GET" || request.method === "POST" || request.method === "PUT") {
      if ( request.method === "PUT") {
        const url = this.router.url.split('/');  
        if (url[1] == 'batch') {
          this.messagingService?.sendMessage('data-change', {
            resourceId: url[4],
            updatedByUID: this.commonFunction.getAgentDetails().userId || '',
            updateByName: this.commonFunction.getAgentDetails().userName || ''
          });
        }

      }
      if (request.body) {


        if (Object.keys(request.body).includes('0') ||
          url[url.length - 1] == 'sendBookingMail' ||
          url[url.length - 1] == 'send' ||
          url[url.length - 1] == 'sendBatchEmail') {

          if (request.body && request.body?.[0]?.apiType !== 'status') {
            this.loader.showcircle();
          } else {
            this.loader.showcircle();
          }
        }

        if (!this.commonFunction.isSuperAdmin()) {

          if (
            // url[url.length - 1] === 'batchinsert'
            // || url[url.length - 1] == 'batchupdate'
            // || url[url.length - 1] == 'batch'
            // || url[url.length - 1] == 'enquiry'
            // || url[url.length - 1] == 'containermaster'
            // || url[url.length - 1] == 'invoice'
            // || url[url.length - 1] == 'container'
            // || url[url.length - 1] == 'payment'
            // || url[url.length - 1] == 'creditdebitnote'
            // || url[url.length - 1] == 'agentadvice'
            // || url[url.length - 1] == 'costitem'
            // || url[url.length - 1] == 'bank'
            // || url[url.length - 1] == 'partymaster'
            // // || url[url.length - 1] == 'clause'
            // || url[url.length - 1] == 'shippingline'
            // || url[url.length - 1] == 'currrate'
            // || url[url.length - 1] == 'costhead'
            // || url[url.length - 1] == 'ratemaster'
            // || url[url.length - 1] == 'role'
            // &&
            !(url[url.length - 1] == 'location'
              || url[url.length - 1] == 'uom'
              || url[url.length - 1] == 'sendIgmEmail'
              || url[url.length - 1] == 'sendBatchEmail'
              || url[url.length - 1] == 'currency'
              || url[url.length - 1] == 'country'
              || url[url.length - 1] == 'state'
              || url[url.length - 1] == 'city'
              || url[url.length - 1] == 'port'
              || url[url.length - 1] == 'systemtype'
              || url[url.length - 1] == 'login'
              || url[url.length - 1] == 'auth'
              || url[url.length - 1] == 'uploadfile'
              || url[url.length - 1] == 'scan-bl'
              || url[url.length - 1] == 'scan-p-invoice'
              || url[url.length - 1] == 'feature'
              || url[url.length - 1] == 'menu'
              || url[url.length - 1] == 'event'
              || url[url.length - 1] == 'agentOnBoarding'
              || url[url.length - 1] == 'reset'
              || url[url.length - 1] == 'message'
              || url[url.length - 1] == 'chatIntialization'
              || url[url.length - 1] == 'inappnotification'
              || url[url.length - 1] == 'containerTrack'
              || url[url.length - 1] == 'containerreport'
              || url[url.length - 1] == 'trigger'
              || url[url.length - 1] == 'instafindetail'
              || url[url.length - 2] == 'sent-to-einvoicing'
              || url[url.length - 2] == 'cancel-from-einvoicing'
              || url[url.length - 1] == 'exchangeRate'
              || url[url.length - 1] == 'uploadpublicreport'
              || url[url.length - 1] == 'transportMilestone'
              || url[url.length - 1] == 'ulipGST'
              || url[url.length - 1] == 'logaudit'

            )
          ) {


            if (this.commonFunction?.getAgentDetails()?.orgId) {
              if (request.body?.query) {
                request.body.query = {
                  ...request.body.query,
                  orgId: this.commonFunction.getAgentDetails().orgId
                };
              } else {
                if (Array.isArray(request.body)) {
                  if (url[url.length - 1] === 'batchinsert' || url[url.length - 1] == 'batchupdate') {
                    request = request.clone({
                      headers: request.headers,
                      body: request.body.map(i => {
                        return { ...i, orgId: this.commonFunction.getAgentDetails().orgId };
                      }),
                    });
                  }
                } else {

                  request = request.clone({
                    body: {
                      ...request.body,
                      orgId: this.commonFunction.getAgentDetails().orgId
                    }
                  });

                }
              }
            }
            if (url[url.length - 1] == 'supportmsg') {
              delete request.body.query?.orgId
            }
          }
        }
        // Hide loader while chat api
        if (url[url.length - 1] == 'chatInitialization' || url[url.length - 1] == 'message'
        ) {
          this.loader.hidecircle()
        }
      }
    }

    const excludedEndpoints = [
      '/api/pdf/download',
      '/api/uploadfile',
      '/api/scan-p-invoice',
       '/api/scan-bl',
      '/api/downloadfile'
    ]

    const es = new EncryptionService();


    const apm: any = this.apmservice.apm.getCurrentTransaction();
    const uuid = apm?.traceId ?? "";
    try {
      const urlPath = new URL(request.url).pathname;

      if (!(excludedEndpoints.includes(urlPath)) && request.url.includes("/api/") && typeof request.body === "object" && environment.isEncryption) {
        const encryptedBody = es.encrypt(JSON.stringify(request.body));
        request = request.clone({
          body: encryptedBody,
          responseType: 'text' as 'json',  // The response should be treated as text, not JSON
          setHeaders: { 'Content-Type': 'text/plain', 'frontend-trace-id': uuid, 'Accept': 'text/plain', Authorization: `${this.commonFunction.getAuthToken()}`, 'x-api-key': environment['x-api-key'] }
        })


      } else {
        request = request.clone({

          setHeaders: { Authorization: `${this.commonFunction.getAuthToken()}`, 'frontend-trace-id': uuid, 'x-api-key': environment['x-api-key'] }
        })
      }
    } catch (e) {
      request = request.clone({

        setHeaders: { Authorization: `${this.commonFunction.getAuthToken()}`, 'frontend-trace-id': uuid, 'x-api-key': environment['x-api-key'] }
      })
    }

    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        // Ensure the modified event is passed along the pipeline
        if (event instanceof HttpResponse) {


          try {
            const urlPath = new URL(event.url).pathname;
            if (!(excludedEndpoints.includes(urlPath)) && request.url.includes("/api/") && typeof event.body === 'string' && environment.isEncryption) {
              try {
                const decryptedBody = es.decrypt(event.body);
                event = event.clone({ ...event, body: JSON.parse(decryptedBody) });  // Replace the body with decrypted response
              } catch (error) {
                console.error(error);
              }
            }
          } catch (e) {

          }

          return event; // Return the modified response
        }
        return event; // Pass other events as is
      }),
      catchError((err: HttpErrorResponse) => {
        if (err?.status === 500 && err.error && typeof err.error === 'string' && environment.isEncryption) {
          try {
            // alert(es.decrypt(err.error))
            const decryptedError = es.decrypt(err.error); // Decrypt the error body
            err = new HttpErrorResponse({
              ...err,
              error: JSON.parse(decryptedError), // Replace the error body with decrypted content
            });
          } catch (error) {
            console.error("Error during decryption in catchError:", error);
          }
        }

        if (err?.status === 401 && !this.isPopupOpen && !['login', 'reset'].includes(request.url.split('/').pop())) {
          this.isPopupOpen = true;
          const dialogData = {
            message: "Your Session is expired. Please login again to continue",
          };
          const confirmationModal = this.dialog.open(LogoutmessageComponent, {
            data: { ...dialogData, type: "logout" },
            width: "550px",
            ...this.commonService.getConfirmationModalConfig(dialogData),
          });
          confirmationModal.afterClosed().subscribe((response: CONFIRMATION_MODAL_RESPONSE) => {
            this.isPopupOpen = false;
            if (response?.userChoice) {
              this.commonFunction.Logout(401, true);
              this.commonFunction.signout().then((res) => { });
            }
          });
        }

        this.loader.hidecircle();
        return throwError(err); // Pass the error along the pipeline
      }),

      finalize(() => {
        this.loader.hidecircle();
      }
      ));


  }
}

export class EncryptionService {
  private encryptionKey = environment.secretkey; // 32-character key

  encrypt(data: string): string {
    const iv = CryptoJS.lib.WordArray.random(16); // Generate random IV
    const encrypted = CryptoJS.AES.encrypt(data, CryptoJS.enc.Utf8.parse(this.encryptionKey), {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return `${CryptoJS.enc.Hex.stringify(iv)}:${encrypted.ciphertext.toString(CryptoJS.enc.Hex)}`;
  }

  decrypt(encryptedText: string): string {
    // const encryptionKey = 'BYUKXCRPHYRFOJINZHPSXZMQEULXFJOF'; // Same key as backend
    const IV_LENGTH = 16; // Must match backend's IV length

    // Split the encrypted text into IV and the encrypted payload
    const textParts = encryptedText.split(':');
    const iv = CryptoJS.enc.Hex.parse(textParts[0]); // Extract IV (hex format)
    const encryptedData = CryptoJS.enc.Hex.parse(textParts[1]); // Extract encrypted data (hex format)

    // Decrypt the encrypted data
    const key = CryptoJS.enc.Utf8.parse(this.encryptionKey);
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedData },
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );

    // Convert decrypted data to a readable string
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
