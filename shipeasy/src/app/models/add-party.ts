export interface AgentBankAccount {
    _id: {
      $oid: string;
    };
    tenenatId: string;
    orgId: string;
    parentId: string;
    accountType: string;
    agent: {
      agentId: string;
      agentName: string;
    };
    country: {
      countryId: string;
      countryName: string;
    };
    state: {
      stateId: string;
      stateName: string;
    };
    cityId: string;
    bankAccountCode:string;
    cityName: string;
    currency: string;
    bankName: string;
    accountNo: string;
    beneficiaryName: string;
    branchName: string;
    address: string;
    swiftCode: string;
    routingNo: string;
    ibanNo: string;
    firstCorrespondent: {
      bankName: string;
      routingNo: string;
      ibanNo: string;
    };
    secondCorrespondent: {
      bankName: string;
      routingNo: string;
      ibanNo: string;
    };
    remark: string;
    status: boolean;
    bankUpload: string;
    bankUploadUrl: string;
    isBank: boolean;
    documents: any[]; // Define the structure of documents if available
    referenceId: string;
    bankId: string;
    createdOn: string;
    updatedOn: string;
    tenantId: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    __v: number;
    branchId: string;
  }
  