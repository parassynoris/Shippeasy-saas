export  interface LocationData {
    state: string;
    ICD: any;
    locationName: string;
    locationId: string;
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    updatedOn: string;
    updatedBy: string;
    stateId: string;
    cityName: string;
    status: boolean;
    stateName: string;
    module: string;
    tenantId: string;
    cityId:string
  }

  export interface StateData {
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
  }

  export  interface CountryData {
    countryId: string;
    callingCode: string;
    countryCurrency: CountryCurrency[];
    countryFlag: string;
    countryISOCode: string;
    countryName: string;
    createdBy: string;
    createdOn: string;
    gmtOffset: any[]; // Not sure about the structure, replace 'any' with appropriate type
    isDst: boolean;
    isSanction: boolean;
    isVerified: boolean;
    isVerify: boolean;
    orgId: string;
    Acd: boolean;
    countryCode: string;
    countryPhoneCode:string;
    countryShortName:string;
    longShortHaul: string; 
    module: string;

    sector: string;

    subSectorName: string;

    timeDiffSign: string;
    timeDiffValue: string;
 
    region: {
      regionId: string;
    };
    remarks: string;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    utcOffset: UtcOffset[];
  }
  
  interface CountryCurrency {
    currencyId: string;
    currencyCode: string;
    currencyName: string;
    currencySymbol: string;
  }
  
  interface UtcOffset {
    utc: string;
    timezone: string;
    time: string;
  }
    

    