interface PrincipalMapping {
    // Define the properties for PrincipalMapping if available in the data
  }
  
  export interface uom {
    _id: {
      $oid: string;
    };
    uomId: string;
    createdBy: string;
    createdOn: string;
    measurement: string;
    measurementCode: string;
    orgId: string;
    principalMapping: PrincipalMapping[];
    remarks: string;
    status: boolean;
    tenantId: string;
    uomName: string;
    updatedBy: string;
    updatedOn: string;
    uomShort: string;
    uomCategory: string
  }