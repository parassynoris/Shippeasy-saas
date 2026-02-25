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
  name: "orderBy"
})
export class OrderByPipe implements PipeTransform {
  // for use future

  // transform(array: any, field: string): any[] {
  //   if (array) {


  //     let arrayField = field.split('.')

  //     if (arrayField.length === 2) {
  //       array.sort((a: any, b: any) => {
  //         if (a._source[arrayField[1]] < b._source[arrayField[1]]) {
  //           return -1;
  //         } else if (a._source[arrayField[1]] > b._source[arrayField[1]]) {
  //           return 1;
  //         } else {
  //           return 0;
  //         }
  //       });
  //     }
  //     else if (arrayField.length === 3) {
  //       array.sort((a: any, b: any) => {
  //         if (a._source[arrayField[1]][arrayField[2]] < b._source[arrayField[1]][arrayField[2]]) {
  //           return -1;
  //         } else if (a._source[arrayField[1]][arrayField[2]] > b._source[arrayField[1]][arrayField[2]]) {
  //           return 1;
  //         } else {
  //           return 0;
  //         }
  //       });
  //     } else {
  //       array.sort((a: any, b: any) => {
  //         if (a[field] < b[field]) {
  //           return -1;
  //         } else if (a[field] > b[field]) {
  //           return 1;
  //         } else {
  //           return 0;
  //         }
  //       });
  //     }

  //     return array;
  //   }else{
  //     return []
  //   }
  // }
  transform(array: any, field: string): any[] {
    if (array) {
        return (array??[])?.sort((a: any, b: any) => {
            const valueA = this.getProperty(a, field);
            const valueB = this.getProperty(b, field);

            // Handle cases where either value is undefined
            if (valueA === undefined && valueB === undefined) {
                return 0;
            } else if (valueA === undefined) {
                return -1;
            } else if (valueB === undefined) {
                return 1;
            }

            // Compare the values
            return valueA.localeCompare(valueB);
        });
    } else {
        return [];
    }
}

getProperty(object: any, key: string): any {
    return key.split('.').reduce((o, k) => (o || {})[k], object);
}

}