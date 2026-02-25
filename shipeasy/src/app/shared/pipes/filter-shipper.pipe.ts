import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterShipper',
  pure : false
})
export class FilterShipperPipe implements PipeTransform {
  transform(shipperList: any[], selectedShipper: any): any[] {
    if (!shipperList || !selectedShipper) {
      return shipperList;
    }
    return shipperList.filter(shipper => shipper.partymasterId !== selectedShipper);
  }
}

@Pipe({
  name: 'filterLCLShipper',
  pure : false
})
export class FilterLCLShipperPipe implements PipeTransform {
  transform(shipperList: any[], selectedShipper: any): any[] {
    if (selectedShipper.length === 0) {
      return [];
    }
    return shipperList.filter(shipper => selectedShipper.includes(shipper.partymasterId));
  }
}
