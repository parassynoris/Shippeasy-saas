import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { CommonFunctions } from '../functions/common.function';

@Pipe({
  name: 'currencyCutomer'
})
export class currencyPipeCutomer implements PipeTransform {
  usd_rate: number = 1;
  constructor(private _rate: CommonFunctions) {

  }
  transform(
    value: number,
    currencyCode: string = 'INR',
    display:
      | 'code'
      | 'symbol'
      | 'symbol-narrow'
      | string
      | boolean = 'symbol',
    digitsInfo: string = '',
    locale: string = 'en-IN',
  ): string | null {
    if (value) {
      if (currencyCode == 'USD') {
        // value = value/this._rate.getusd_rate();
        value = value / 83;
      }
      if(currencyCode=='INR'){
      return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2});
      }
      return formatCurrency(
        value,
        locale,
        getCurrencySymbol(currencyCode, 'wide'),
        currencyCode,
        digitsInfo,
      );

    } else {
      return ''
    }

  }

}
