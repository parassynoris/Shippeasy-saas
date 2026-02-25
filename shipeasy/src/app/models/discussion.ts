interface AddressInfo {
    address: string;
    countryId: string;
    countryISOCode: string;
    countryName: string;
    stateId: string;
    stateName: string;
    cityId: string;
    cityName: string;
    postalCode: string;
    timezone: string;
  }
  
  interface PhoneNumber {
    primaryCountryCode: string;
    primaryAreaCode: string;
    primaryNumber: string;
  }
  
 export interface Organization {
    _id: {
      $oid: string;
    };
    module: string;
    orgId: string;
    tenantId: string;
    agentId: string;
    userId: string;
    agentName: string;
    addressInfo: AddressInfo;
    primaryNo: PhoneNumber;
    secondaryNo: {
      secondaryCountryCode: string;
      secondaryAreaCode: string;
      secondaryNo: string;
    };
    allTimeAvailableNo: {
      countryCode: string;
      areaCode: string;
      allTimeAvailableNumber: string;
    };
    faxNo: {
      faxCountryCode: string;
      faxAreaCode: string;
      faxNo: string;
    };
    url: string;
    primaryMailId: string;
    secondaryMailId: string;
    taxType: string;
    taxCode: string;
    taxId: string;
    vendorType: string;
    portName: string;
    parentId: string;
    currency: {
      countryId: string;
      currencyId: string;
      currencyCode: string;
      currencyName: string;
    };
    commRegNo: string;
    dAndBNo: string;
    sezUnitAddress: string;
    pic: {
      picType: string;
      picName: string;
      picName1: string;
      picMobileCountryCode: string;
      picMailId: string;
      picMobileNo: string;
      picMobileAreaCode: string;
    };
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
    __v: number;
    uploadLogo: string;
  }
  interface Comment {
    commentsBy: string;
    commentText: string;
    commentString: string;
    _id: {
      $oid: string;
    };
  }
  
export  interface Remark {
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    updatedOn: string;
    updatedBy: string;
    updatedByUID: string;
    tenantId: string;
    prospectId: string;
    commentsby: string;
    commentText: string;
    instructionsFrom: string;
    instructionsToId: string;
    instructionsTo: string;
    instructionsToEmail: string;
    instructionsDescription: string;
    commentString: string;
    contractId: string;
    commentId: string;
    clauseId: string;
    batchId: string;
    enquiryId: string;
    processPoint: string;
    processPointName: string;
    departmentId: string;
    departmentName: string;
    branchHead: string;
    reply: Comment[];
    remarkStatusId: string;
    remarkStatusName: string;
    status: boolean;
    orgId: string;
    __v: number;
  }
  