import { Pipe, PipeTransform } from '@angular/core';
import { PortDetails } from '../components/port/port';


@Pipe({
  name: 'fetchRecordById'
})
export class FetchRecordByIdPipe implements PipeTransform {
  transform(records: any[], id: any, idField: string = 'id'): any {
    if (!records || !id) {
      return records;
    }
    return records.filter(record => record?.partymasterId != id);
  }
}

@Pipe({
  name: 'filterByFlag',
  pure: false
})
export class FilterByFlagPipe implements PipeTransform {
  transform(items: any[], flag: boolean): any[] {
    if (!items) {
      return items;
    }
    if (flag) {
      return items.filter(item => {
        const portTypeName = item?.portTypeName ?? item?.portDetails?.portTypeName;
        return portTypeName && portTypeName.toLowerCase() === 'air';
      });
    } else {
      return items.filter(item => {
        const portTypeName = item?.portTypeName ?? item?.portDetails?.portTypeName;
        return portTypeName && portTypeName.toLowerCase() !== 'air';
      });
    }

  }
}

@Pipe({
  name: 'filterByType'
})
export class FilterByTypePipe implements PipeTransform {
  transform(items: any[], typeCategory, type: string): any[] {
    if (!items) {
      return items;
    }
    return items.filter(item => item?.[typeCategory]?.toLowerCase() == type?.toLowerCase());


  }
}