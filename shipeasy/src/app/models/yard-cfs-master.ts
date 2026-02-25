interface DetentionDetails {
    demurrageFreeDays: string;
    demurrageCurrencyId: string;
    demurrageAmount: string;
    demurrageChanged: boolean;
    demurrageName: string;
    truckingFreeHours: string;
    truckingCurrencyId: string;
    truckingCurrencyName: string;
    truckingPrice: string;
    truckingChanged: boolean;
    operatorName: string;
    operatorPhone: string;
    operatorMail: string;
  }
  
  interface BasicDetails {
    uniqueRefNo: string;
    agentAdviceDate: string;
    stcReference: string;
    stcQutationNo: string;
    versionNo: string;
    moveNo: string;
    references: any[]; // You might want to replace this with a more specific type
    paymentTerm: string;
    moveTypeId: string;
    moveTypeName: string;
    noOfContainer: string;
    destinationId: string;
    enquiryValid: boolean;
    origin: string;
    shipppingtermId: string;
    shippping_term: string;
    tradeRoute: string;
  }
  
  interface Container {
    containerId: string;
    containerNo: string;
    sealNo: string;
    netWeight: string;
    grossWeight: string;
    weightUOM: string;
    manufactureDate: string;
    containerStatus: string;
  }
  
  interface PartyDetail {
    partyType: string;
    customerName: string;
    partyCode: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
  }
  
  interface ProductDetails {
    product: string;
    productName: string;
    properShippingName: string;
    imcoClass: string;
    unNo: string;
    packingGroup: string;
    flashPoint: string;
    marinePollutionId: string;
    emsCode: string;
    gravity: string;
    Haz: boolean;
  }
  
  interface RouteDetails {
    exitPortId: string;
    exitPortUN: string;
    exitPortDateEA: string;
    entryPortId: string;
    state: string;
    entryPortUN: string;
    entryPortDate: string;
    deliveryPlaceId: string;
    deliveryPlaceName: string;
    shippingLineId: string;
    shippingLineName: string;
    bol: string;
    plannedVesselName: string;
    plannedVoyageName: string;
  }
  
 export interface MyInterface {
    _id: {
      $oid: string;
    };
    agentadviceId: string;
    agentId: string;
    agentAdviceType: string;
    agentadviceNo: string;
    basicDetails: BasicDetails;
    containers: Container[];
    createdBy: string;
    createdOn: string;
    detentionDetails: DetentionDetails;
    module: string;
    orgId: string;
    partyDetails: PartyDetail[];
    productDetails: ProductDetails;
    remarks: string;
    routeDetails: RouteDetails;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    updatedByUID: string;
  }
  interface AddressInfo {
    stateCode: string;
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
  
  interface PhoneNumber {
    countryCode: string;
    areaCode: string;
    number: string;
  }
  
 export interface Branch {
    _id: {
      $oid: string;
    };
    uploadLogo: string;
    isBranch: boolean;
    isPrincipal: boolean;
    agentId: string;
    branchType: string;
    agentName: string;
    branchId: string;
    branchName: string;
    principalId: string;
    principalName: string;
    parentId: string;
    addressInfo: AddressInfo;
    primaryNo: PhoneNumber;
    secondaryNo: PhoneNumber;
    allTimeAvailableNo: PhoneNumber;
    faxNo: PhoneNumber;
    url: string;
    orgId: string;
    tenantId: string;
    userType: string;
    primaryMailId: string;
    secondaryMailId: string;
    commRegNo: string;
    dAndBNo: string;
    taxType: string;
    taxCode: string;
    taxId: string;
    vatNo: string;
    sezUnitAddress: string;
    vendorType: string;
    portName: string;
    jobCode:string;
    currency: {
      countryId: string;
    };
    pic: {
      picType: string;
      picName: string;
      picName1: string;
      picName2: string;
      picMobileNo: number;
      picMobileCountryCode: string;
      picMobileAreaCode: number;
      picMailId: string;
    };
    pda: boolean;
    iPda: boolean;
    fda: boolean;
    sda: boolean;
    branchActive: boolean;
    status: boolean;
    module: string;
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    __v: number;
  }
  
  interface Currency {
  currencyId: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
}

interface GmtOffset {
  gmt: string;
  timezone: string;
  time: string;
}

interface UtcOffset {
  utc: string;
  timezone: string;
  time: string;
}

interface Region {
  regionId: string;
  regionName: string;
}

export interface Country {
  _id: {
    $oid: string;
  };
  countryISOCode: string;
  countryName: string;
  status: boolean;
  createdOn: string;
  createdBy: string;
  updatedOn: string;
  updatedBy: string;
  countryCurrency: Currency[];
  gmtOffset: GmtOffset[];
  callingCode: string;
  countryFlag: string;
  dstFrom: string;
  dstTo: string;
  isDst: boolean;
  isSanction: boolean;
  isVerified: boolean;
  isVerify: boolean;
  orgId: string;
  remarks: string;
  tenantId: string;
  utcOffset: UtcOffset[];
  region: Region;
  countryId: string;
  pendingverificationId: string;
  verifyBy: string;
  countryPhoneCode:string;
  verifyOn: string;
  _source: any
  
}


export interface State {
    stateId: string;
    GSTNCode: string;
    countryCode: string;
    countryId: string;
    countryName: string;
    createdBy: string;
    createdOn: string;
    isUnion: boolean;
    module: string;
    orgId: string;
    stateCode: string;
    stateName: string;
    stateShortName: string;
    status: boolean;
    tenantId: string;
    typeDescription: string;
    updatedBy: string;
    updatedOn: string;
    _source:any;
  }
  
  export interface Location {
    locationName: string;
    portType: string;
    country: string;
    state: string;
    masterType: string;
    agentBranch: string;
    CFS: boolean;
    ICD: boolean;
    Yard: boolean;
    name: string;
    code: string;
    portName: string;
    terminal: string;
    EDICode: string;
    DOaddress: string;
    address: string;
    contactPerson: string;
    email: string;
    primaryCountryCode: string;
    primaryNo: string;
    DOCode: string;
    bondNo: string;
    creditDays: string;
    lineReference: boolean;
    countryISOCode: string;
    stateId: string;
    portId: string;
    status: boolean;
    module: string;
    tenantId: string;
    agentBranchId: string;
    referenceId: string;
    locationId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    __v: number;
  }
  
  export interface PortDetails {
    portTypeName: string;
    portName: string;
    portAuthority: string;
    status:boolean
    address: string;
    phone: string;
    phnAreaCode: string;
    phnCountryCode: string;
    faxAreaCode: string;
    faxCountryCode: string;
    faxNumber: string;
    tollFreeNumber: string;
    emailId: string;
    latitude: number;
    longitude: number;
    unLocode: string;
    timezoneId: string;
    timezone: string;
    maxDraft: number;
    portType: string;
    portSize: number;
    berths: string;
    terminals: [{name:string}];
    canalDirection: string;
    isEsiRebateApplicable: string;
    terminal: [{name:string}];
    portId:string;
    portDetails:{
      portId: any;
      description:string
        igmCode:string;
        shortName: string;
        portName:string,
        terminalCode:string
        agentBranch:string
    }
    location:{
      locationName:string
    }
    country:{
      countryName:string
    } 
  }