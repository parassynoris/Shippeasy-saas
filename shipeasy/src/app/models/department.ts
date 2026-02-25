 export interface Department {
    departmentId: string;
    chatAccessType: string | null;
    createdBy: string;
    createdOn: string;
    depType: string;
    deptDescription: string;
    deptName: string;
    maskingName: string;
    operationDepartment: boolean;
    orgId: string;
    remarks: string;
    sequence: string;
    status: boolean;
    tenantId: string;
    tier: string;
    updatedBy: string;
    updatedOn: string;
    override_orgId: string;
    pendingverificationId: string;
    departmentEmail: string;
    verifyBy: string;
    verifyOn: string;
    deptEmail:string;
    deptManager:string;
    agentadviceId:number;
    basicDetails?:bd;
  }
  
  export interface bd{
    uniqueRefNo:string
  }
  