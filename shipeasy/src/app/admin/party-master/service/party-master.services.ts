import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { CognitoService } from "src/app/services/cognito.service";
import { environment } from "src/environments/environment";
import { Injectable } from '@angular/core';
import { partymasterDetail } from 'src/app/admin/party-master/add-party/partyMaster-detail';
import { CommonFunctions } from "src/app/shared/functions/common.function";

@Injectable({
    providedIn: 'root',
})
export class partyMasterService {
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
    getPartyMasterById(getBody): Observable<any> {
        return this.httpClient.post<any>(
            `${environment.baseUrlMaster}master/list?type=partymaster`,
            getBody,
            this.HTTP_OPTIONS
        );
    }
    createPartyMaster(createBody): Observable<partymasterDetail> {
        return this.httpClient.post<partymasterDetail>(
            `${environment.baseUrlMaster}master/partymaster`,
            createBody,
            this.HTTP_OPTIONS
        );
    }
    updatePartyMaster(updateBody): Observable<partymasterDetail> {
        return this.httpClient.post<partymasterDetail>(
            `${environment.baseUrlMaster}master/partymaster/update`,
            updateBody,
            this.HTTP_OPTIONS
        );
    }
    deletePartyMaster(deleteBody): Observable<any> {
        return this.httpClient.post<any>(
            `${environment.baseUrlMaster}master/partymaster/delete`,
            deleteBody,
            this.HTTP_OPTIONS
        );
    }
}