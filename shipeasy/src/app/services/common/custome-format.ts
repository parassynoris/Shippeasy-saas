import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CommonService } from '../common/common.service';
import { CognitoService } from '../cognito.service';

@Pipe({
    name: 'custom_date'
})

export class customFormat implements PipeTransform {
    userDetail: any // eslint-disable-line
    dateFormatList: string[] = ['MM/dd/yy', 'dd/MM/yy', 'yy/MM/dd', 'M/d/yy', 'd/M/yy', 'dd/MM/yyyy',]

    constructor(private datePipe: DatePipe, private commonservice: CommonService, private cognito: CognitoService) {

    }
    transform(value: any, timezoneId?: any): any {// eslint-disable-line
        let dateFormat;
        this.userDetail = sessionStorage?.getItem('userDetails')// eslint-disable-line
        let userSetting = JSON.parse(this.userDetail);
        
        this.cognito.getUserDatails()?.subscribe((resp) => { if (resp != null) { userSetting = resp; } })
        if (this.isValidDate(value)) {
            if (value && value?.length && userSetting?.setting && userSetting?.setting?.dateFormat && this.dateFormatList.includes(userSetting?.setting?.dateFormat)) {
                userSetting?.setting?.isAllTimeChecked ? (dateFormat = `${userSetting?.setting?.dateFormat} HH:mm`) : (dateFormat = `${userSetting?.setting?.dateFormat} hh:mm a`);
                if (timezoneId) {
                    const zone = this.commonservice.getgmttime(timezoneId, value);
                    return this.datePipe.transform(value, dateFormat, zone);
                }
                else
                    return this.datePipe.transform(value, dateFormat);
            } else {
                if (timezoneId) {
                    const zone = this.commonservice.getgmttime(timezoneId, value);
                    return this.datePipe.transform(value, 'dd/MM/yyyy, h:mm a', zone);
                }
                else
                    return this.datePipe.transform(value, 'dd/MM/yyyy, h:mm a');
            }
        }
    }
    isValidDate(value: any) { // eslint-disable-line
        const dateWrapper = new Date(value);
        return !isNaN(dateWrapper.getDate());
    }
}