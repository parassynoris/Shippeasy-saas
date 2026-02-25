interface Tax {
    taxType: string;
    status: boolean;
  }
  
 export interface Taxation {
  status:string
   hsnType: string;
    description: string;
   hsnCode: string;
    taxtypeId: string;
    countryId: string;
    countryName: string;
    createdBy: string;
    createdOn: string;
    orgId: string;
    taxRate: string;
    taxes: Tax[];
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    pendingverificationId: string;
    verifyBy: string;
    verifyOn: string;
  }

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
  }
  
  