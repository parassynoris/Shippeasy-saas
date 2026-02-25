import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CommonFunctions } from '../functions/common.function';
import { DecimalPipe } from '@angular/common';
 
@Pipe({ name: 'customCurrency' })
export class CustomCurrencyPipe implements PipeTransform {
    constructor(private currency: CurrencyPipe,private commonFunctions : CommonFunctions,
        private decimalPipe : DecimalPipe
    ) {
 
    }
    transform(
        value: string  ,
        currencyCode?: string,
        display?: 'code' | 'symbol' | 'symbol-narrow' | boolean,
        digitsInfo?: string,
        locale?: string
    ): string | null {
        let hasNegative = false;
        //const userSetting = JSON.parse(sessionStorage?.getItem('userDetails'));
        //const format = userSetting?.setting?.number || 'xx,xx,xx,xxx.xx';
       
        if(value?.toString()?.includes('-')){
            hasNegative = true;
            value = value.toString().replace('-','')
        }
    
        let val;
        const re = /,/gi;
        val = value?.replace(re, "");
        const re2 = /\./gi;
        val = val?.replace(re2,"");
        const newVal = this.currency.transform(val, currencyCode, display, digitsInfo, locale);
        //const str = newVal;
       // const result = str?.replace(/[^\d.,]/g, '');
        const match = newVal?.match(/[^0-9,.]/g);
        const resultSign = match ? match?.join('') : '';
        // if(currencyCode == 'USD'){ 
        //     value = (parseFloat(value?.replace(/,/g, ''))/83).toFixed(2)
        // }
     
        if(this.commonFunctions?.getAgentCur() !=  this.commonFunctions?.customerCurrency()){
             if(currencyCode == this.commonFunctions?.customerCurrency()){ 
               
            value = (parseFloat(value?.replace(/,/g, '')) *  this.commonFunctions?.getExRate()).toFixed(2)
            value = this.decimalPipe.transform(value, '1.2-2')
        }
        }
        return hasNegative ? `-${resultSign} ` + `${value}`:`${resultSign} ` + `${(value)}`;
    }
}
