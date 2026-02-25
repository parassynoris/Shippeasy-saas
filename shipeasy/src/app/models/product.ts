interface AddressInfo {
    address: string;
    countryId: string;
    countryISOCode: string;
    countryName: string;
    stateId: string;
    stateName: string;
    cityId: string;
    cityName: string;
    postalCode: number;
    timezone: string;
  }
  
  interface PrimaryNo {
    primaryCountryCode: string;
    primaryAreaCode: string;
    primaryNumber: number | string;
  }
  
  interface SecondaryNo {
    secondaryCountryCode: string;
    secondaryAreaCode: string;
    secondaryNo: string;
  }
  
  interface AllTimeAvailableNo {
    countryCode: string;
    areaCode: string;
    allTimeAvailableNumber: string;
  }
  
  interface FaxNo {
    faxCountryCode: string;
    faxAreaCode: string;
    faxNo: string;
  }
  
  interface Currency {
    countryId: string;
    currencyId: string;
    currencyCode: string;
    currencyName: string;
  }
  
  interface Pic {
    picType: string;
    picName: string;
    picName1: string;
    picMobileCountryCode: string;
    picMailId: string;
    picMobileNo: string;
    picMobileAreaCode: string;
  }
  
 export interface Product {
    hsCode: any;
    _source: any;
    _id: {
      $oid: string;
    };
    module: string;
    productName:string;
    productType:string;
    customerName:string
    orgId: string;
    tenantId: string;
    agentId: string;
    userId: string;
    agentName: string;
    uploadLogo: string;
    addressInfo: AddressInfo;
    primaryNo: PrimaryNo;
    secondaryNo: SecondaryNo;
    allTimeAvailableNo: AllTimeAvailableNo;
    faxNo: FaxNo;
    url: string;
    primaryMailId: string;
    secondaryMailId: string;
    taxType: string;
    taxCode: string;
    taxId: string;
    vendorType: string;
    portName: string;
    parentId: string;
    currency: Currency;
    commRegNo: string;
    dAndBNo: string;
    sezUnitAddress: string;
    pic: Pic;
    status: boolean;
    userType: string;
    vatNo: string;
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;

  }
  