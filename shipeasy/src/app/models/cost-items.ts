export interface CostItem {
   
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
    costitemGroup:string;
    chargeType:string;
    chargeGroup:string;
    currency:string;
  }
  
  export interface Currency {
   
    currencyId: string;
    createdBy: string;
    createdOn: string;
    currencyName: string;
    currencyShortName: string;
    currencySymbol: string;
    decimalName: string;
    description: string;
    isPopular: boolean;
    orgId: string;
    override_orgId: string;
    status: boolean;
    tenantId: string;
    typeCategory: string;
    typeCategoryName: string;
    updatedBy: string;
    updatedOn: string;
    countryId: string;
    countryName: string;
    currencyPair: string;
    updatedByUID: string;
  }
  
  export interface Tax {
    _id: {
      $oid: string;
    };
    taxtypeId: string;
    countryId: string;
    countryName: string;
    createdBy: string;
    createdOn: string;
    orgId: string;
    taxRate: string;
    taxes: {
      taxType: string;
      status: boolean;
    }[];
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    pendingverificationId: string;
    verifyBy: string;
    verifyOn: string;
    hsnCode:string;
  }
  
  interface CostItem1 {
    costitemId: string;
    costitemName: string;
    vmsCode: string;
    isPDA: boolean;
    legalentities: any[]; // Replace 'any' with the actual type if available
    ownervesselVMS: string;
    chartervesselVMS: string;
  }
  
  export interface CostHead {
    _id: {
      $oid: string;
    };
    tenantId: string;
    orgId: string;
    costheadId: string;
    costitems: CostItem1[];
    costheadName: string;
    status: boolean;
    costheadType: string;
    isParent: boolean;
    parentId: string;
    prentitemName: string;
    override_orgId: string;
    createdBy: string;
    createdOn: string;
    updatedBy: string;
    updatedOn: string;
    charterPdfGroup: number;
    chartererOutlay: number;
    isSupplierEntry: boolean;
    isTerminalRequired: boolean;
    ischarterPdf: boolean;
    iskeyword: boolean;
    ownerPdfGroup: number;
    ownersOutlay: number;
    recordRank: number;
    costHeadCode:string;
  }
  
  export interface SystemType {
    departmentId: string;
    _id: {
      $oid: string;
    };
    systemtypeId: string;
    createdBy: string;
    createdOn: string;
    module: string;
    orgId: string;
    status: boolean;
    tenantId: string;
    typeActive: boolean;
    typeCategory: string;
    typeDescription: string;
    typeName: string;
    typeParentType: string;
    typeRef: string;
    typeRefId: string;
    updatedBy: string;
    updatedOn: string;
  }
  
  export interface chargeTypetypeList{
    type: string;
  }
