export interface UOM {
    uomId: string;
    createdBy: string;
    createdOn: string;
    measurement: string;
    measurementCode: string;
    orgId: string;
    principalMapping: any[]; // Define the structure of principalMapping if available
    remarks: string;
    status: boolean;
    tenantId: string;
    uomName: string;
    updatedBy: string;
    updatedOn: string;
  }
  