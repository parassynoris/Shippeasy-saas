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

  }

  export interface Country {
    countryId: string;
    callingCode: string;
    countryCurrency: {
      currencyId: string;
      currencyCode: string;
      currencyName: string;
      currencySymbol: string;
    }[];
    countryFlag: string;
    countryISOCode: string;
    countryName: string;
    countryCode: string;
    createdBy: string;
    createdOn: string;
    gmtOffset: any[]; // Update the type according to the data structure
    isDst: boolean;
    isSanction: boolean;
    isVerified: boolean;
    isVerify: boolean;
    orgId: string;
    region: {
      regionId: string;
    };
    remarks: string;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    utcOffset: {
      utc: string;
      timezone: string;
      time: string;
    }[];
  }
  
  