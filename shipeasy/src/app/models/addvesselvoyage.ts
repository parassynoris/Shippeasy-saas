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
    stateCode: string;
  }
  
  interface Branch {
    branch_name: string;
    branch_address: string;
    barnch_country: string;
    branch_countryName: string;
    branch_state: string;
    branch_stateName: string;
    branch_cityId: string;
    branch_city: string;
    pinCode: string;
    stateCodeBranch: string;
    placeofSupply: string;
    partyCode: string;
    bankName: string;
    cust_acc_no: number;
    remarks: string;
    pic: string;
    pic_phone: number;
    pic_email: string;
    tax_name: string;
    tax_number: string;
    BROKERAGE_PAYABLE: boolean;
    creadirCustomer: boolean;
    active_flag: boolean;
    kyc_flag: boolean;
    TDS_GST_APPLICABLE: boolean;
    documents: null;
  }
  
  interface PrimaryNo {
    primaryCountryCode: string;
    primaryAreaCode: string;
    primaryNo: string;
  }
  
  interface FaxNo {
    faxCountryCode: string;
    faxAreaCode: string;
    faxNo: string;
  }
  
  interface CustomerType {
    item_id: string;
    item_text: string;
  }
  
  interface Customer {
    // Add any specific properties if needed
  }
  
export  interface partymaster {
    _id: { $oid: string };
    partymasterId: string;
    ImportExport: string;
    TDSNature: string;
    TDS_limit: string;
    TDS_utilised: string;
    accountCode: string | null;
    activeflag: boolean;
    adCode: string;
    addressInfo: AddressInfo;
    annualTurnover: string;
    bankName: string;
    branch: Branch[];
    brokerageAccCode: string;
    brokeragePayable: boolean;
    chaId: string;
    checkAcceptStatus: boolean;
    chequeAcceptance: string;
    createdBy: string | null;
    createdOn: string;
    creditCustomer: boolean;
    creditDays: string;
    currency: any; // Replace 'any' with specific type if known
    customerAccCode: string;
    customerAccNumber: string;
    customerName: string;
    customerStatus: string;
    customerType: CustomerType[];
    deactivationDate: string;
    deactivationReason: string;
    discountedBlFees: number;
    expFlag: boolean;
    expScCode: string;
    exportTeun: string;
    fasCode: string;
    faxNo: FaxNo;
    flatRateDetention: string;
    groupCompany: string;
    gstNo: string;
    impFlag: boolean;
    impScCode: string;
    importTeun: string;
    isSez: string;
    isShippingLine: boolean;
    isTDSExempt: boolean;
    kycFlag: boolean;
    location: string;
    locationId: string;
    mloId: string;
    modifiedBy: string | null;
    module: string;
    name: string;
    operationUser: string;
    opsCode: string;
    opsFrom: string;
    opsLocation: string;
    opsName: string;
    orgId: string;
    panNo: string;
    primaryMailId: string;
    primaryNo: PrimaryNo;
    principle: string;
    proformaRequiredExp: boolean;
    proformaRequiredImp: boolean;
    rateCheckBL: boolean;
    rateCheckBooking: boolean;
    rateCheckDraftBL: boolean;
    rateCheckRO: boolean;
    refundAccCode: string;
    reg_UN_UIN: string;
    remarks: string;
    residentStatus: true;
    sacCode: string;
    saleCode: string;
    saleFrom: string;
    saleLocation: string;
    saleName: string;
    salePrinciple: string;
    serviceTax: string;
    serviceTaxExmp: string;
    serviceTaxExmpNo: 0;
    serviceTaxLastDate: string;
    serviceTaxLastModify: string;
    serviceTaxNo: 0;
    shortName: string;
    status: true;
    tanNo: string;
    tdsCertificate: true;
    tdsCertificateValid: string;
    tdsFlag: true;
    tdsGSTApplicable: true;
    tdsPercent: 0;
    tenantId: string;
    tosite: string;
    updatedBy: string;
    updatedOn: string;
    url: string;
    amount: 0;
    customer: Customer[];
    lumsumDateFrom: string;
    lumsumDateTo: string;
    isRegister: true;
    daysinPeriod: 0;
    updatedByUID: string;
  }
  