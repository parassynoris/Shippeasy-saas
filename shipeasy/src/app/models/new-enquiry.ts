interface Role {
    roleName: string;
    roleId: string;
    module: string;
  }
  
export  interface User {

    _id: {
      $oid: string;
    };
    userId: string;
    createdBy: string;
    createdOn: string;
    isChatUser: boolean;
    isLocked: boolean;
    isQCMandatory: boolean;
    name: string;
    orgId: string;
    override_orgId: string;
    password: string;
    phoneNo: string;
    roles: Role[];
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    userAWSProfile: string;
    userEmail: string;
    userKey: string;
    userLastname: string;
    userLogin: string;
    userName: string;
    userStatus: boolean;
    userType: string;
    fcmToken: string | null;
    partymasterId:string;
  }
  export interface ChemicalProduct {
    productId: any;
    _id: {
      $oid: string;
    };
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    updatedOn: string;
    updatedBy: string;
    productName: string;
    productType: string;
    customerName: string;
    imcoClass: string;
    hazSubclass: string;
    imdgPage: string;
    unNumber: string;
    densityGravity: string;
    flashPoint: string;
    psn: string;
    technicalName: string;
    packingGroup: string;
    subRisk: string;
    marinePollution: boolean;
    emsNo: string;
    emsCode: string;
    mfagNo: string;
    hsCode: string;
    tankType: string;
    msdsFile: string;
    isApproved: string;
    lineRef: boolean;
    shippingName: string;
    imoNo: string;
    UNDGType: string;
    reportableQuantity: string;
    flashpointCelsius: string;
    flashpointFahrenheit: string;
    toxinHazard: boolean;
    hazardZone: string;
    customerNameId: string;
    module: string;
    packingGroupName: string;
    tenantId: string;
    documents: any[]; // Define the type accordingly
    status: boolean;
  }
  export interface Contact {
    _id: {
      $oid: string;
    };
    contactName: string;
    contactEmail: string;
    areaCode: string;
    contactPhone: string;
    contactCode: number;
    contactRemarks: string;
    isActive: boolean;
    orgId: string;
    tenantId: string;
    isUser: boolean;
    contactType: string;
    parentId: string;
    referenceId: string;
    contactId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    __v: number;
    updatedByUID: string;
  }
  interface Reply {
    commentsBy: string;
    commentText: string;
    commentString: string;
    _id: {
      $oid: string;
    };
  }
  
 export interface ProspectComment {
    commentDate: string;
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
    reply: Reply[];
    remarkStatusId: string;
    remarkStatusName: string;
    status: boolean;
    orgId: string;
    __v: number;
  }

 export interface Location {
    name: string;
    locationId: string;
    country: string;
    countryISOCode: string;
    createdBy: string;
    createdOn: string;
    locationName: string;
    orgId: string;
    portType: string;
    state: string;
    stateId: string;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    updatedDate: string;
  }

 export interface CostItem {
    chargeType: string;
    gst: number;
    chargeTypeName: any;
    _id: {
      $oid: string;
    };
    costitemId: string;
    costitemCode: string;
    costitemName: string;
    costitemType: string;
    createdBy: string;
    createdOn: string;
    isParent: boolean;
    orgId: string;
    override_orgId: string;
    parentId: string;
    prentitemName: string;
    remarks: string;
    status: boolean;
    tenantId: string;
    uom: string;
    updatedBy: string;
    updatedOn: string;
    vmscode: string;
    pendingverificationId: string;
    verifyBy: string;
    verifyOn: string;
  }
  
  
  