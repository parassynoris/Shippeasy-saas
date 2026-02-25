export interface Clause {
    _id: {
      $oid: string;
    };
    clauseId: string;
    clauseName: string;
    clauseType: string;
    createdBy: string;
    createdOn: string;
    orgId: string;
    portOption: string;
    port_Id: string;
    remarks: string;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    updatedByUID: string;
    createdDate:string;
    updatedDate:string;
    slNo:string;
  }
  
  