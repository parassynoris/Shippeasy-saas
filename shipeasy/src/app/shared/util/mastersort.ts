export class Sort {
    private sortOrder = 1;
    private collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  
  
    public startSort(property, order, type = '') {
      if (order === 'desc') {
        this.sortOrder = -1;
      }
      return (a, b) => {
        if (type === 'date') {
          return this.sortData(new Date(a[property]), new Date(b[property]));
        } else {
          return this.collator.compare(a[property], b[property]) * this.sortOrder;
        }
      };
    }
  
    private sortData(a, b) {
      if (a < b) {
        return -1 * this.sortOrder;
      } else if (a > b) {
        return 1 * this.sortOrder;
      } else {
        return 0 * this.sortOrder;
      }
    }
  }
  import { Pipe, PipeTransform } from "@angular/core";
  
  @Pipe({
    name: "masterSort"
  })
  export class MastersSortPipe implements PipeTransform {
    private lastSortedField: string;
    private isAscending: boolean = true;
  
    transform(array: any[], field: string): any[] {
      if (array) {
        if (field === this.lastSortedField) {
          this.isAscending = !this.isAscending;
        } else {
          this.isAscending = true;
          this.lastSortedField = field;
        }
        return array.sort((a: any, b: any) => {
          const valueA = this.getProperty(a, field);
          const valueB = this.getProperty(b, field);
          if (valueA === undefined && valueB === undefined) {
            return 0;
          } else if (valueA === undefined) {
            return -1;
          } else if (valueB === undefined) {
            return 1;
          }
          const comparison =this.compareValues(valueA, valueB)
          return this.isAscending ? comparison : -comparison;
        });
      } else {
        return [];
      }
    }
    compareValues(valueA, valueB) {
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA?.localeCompare(valueB);
      } else {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
    }
    getProperty(object: any, key: string): any {
      return key.split('.').reduce((o, k) => (o || {})[k], object);
    }
  
  
  }


  import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
  export class NumberToWordsService {
    private ones: string[] = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    ];
    private teens: string[] = [
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
    ];
    private tens: string[] = [
      '', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
    ];
    private thousands: string[] = ['', 'Thousand', 'Million', 'Billion'];
  
    convertToWords(num: number): string {
      if (num === 0) return 'Zero';
  
      const integerPart = Math.floor(num);
      const decimalPart = Math.round((num - integerPart) * 100);
  
      const integerWords = this.convertIntegerToWords(integerPart);
      const decimalWords = decimalPart > 0 ? ` and ${this.convertIntegerToWords(decimalPart)} Cents` : '';
  
      return integerWords + decimalWords;
    }
  
    private convertIntegerToWords(num: number): string {
      if (num === 0) return '';
      let word = '';
      let i = 0;
  
      while (num > 0) {
        const chunk = num % 1000;
        if (chunk > 0) {
          word = `${this.convertChunk(chunk)} ${this.thousands[i]} ${word}`.trim();
        }
        num = Math.floor(num / 1000);
        i++;
      }
  
      return word.trim();
    }
  
    private convertChunk(num: number): string {
      let word = '';
  
      if (num > 99) {
        word += `${this.ones[Math.floor(num / 100)]} Hundred `;
        num %= 100;
      }
  
      if (num > 10 && num < 20) {
        word += `${this.teens[num - 11]} `;
      } else {
        word += `${this.tens[Math.floor(num / 10)]} `;
        word += `${this.ones[num % 10]} `;
      }
  
      return word.trim();
    }
  }