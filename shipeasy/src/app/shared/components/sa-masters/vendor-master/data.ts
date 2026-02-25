export class partymasterDetail {
    instafinancial:any;
    partymasterId: string = "";
    tenantId : string = "";
    name: string = "";
    shortName: string = "";
    companyCIN: string = "";
    notes=[];
    overviewTable=[];
    addressInfo: AddressInfo = new AddressInfo();
    primaryMailId: string = "";
    url: string = "";
    groupCompany : boolean;
    parentCompany: boolean;
    paidStatus:boolean;
    partyShortcode:string = ""
    tanNo = '';
    kycPan='';
    kycGst='';
    documentId='';
    orgId:string = '';
    documentName='';
    CompanydocumentId = '';
    CompanydocumentName = '';
    TaxdocumentId = '';
    TaxdocumentName = '';
    completeKYC:boolean = false;
    primaryNo: PrimaryNo = new PrimaryNo();
    faxNo: FaxNo = new FaxNo();
    exportTeun: string = "";
    importTeun: string = "";
    annualTurnover: string = "";
    accountCode: string = "";
    chequeAcceptance: boolean = false;
    principle : string = "";
    salePrinciple : string = "";
    currency: Currency = new Currency();
     partyCurrency: Currency = new Currency();
    customerName: string = "null";
    parenetcustomerId="";
    parenetcustomerName="";
    refundAccCode: string = "";
    brokerageAccCode: string = "";
    rateCheckBooking: boolean;
    rateCheckRO: boolean;
    rateCheckDraftBL: boolean;
    rateCheckBL: Boolean;
    proformaRequiredImp: Boolean;
    proformaRequiredExp: Boolean;
    location: string = "";
    locationId: string = "";
    panNo: string = "";
    bankName: string = "";
    adCode: string = "";
    chaId: string = "";
    customerType = [];
    ImportExport: string = '';
    customerStatus: string = '';
    customerAccNo: Number;

    customerAccNumber : string = '';
    tosite: string = "";
    discountedBlFees: Number;
    customerAcCode: number;
    customerAccCode: string = '';
    remarks: string = "";
    expScCode: string = "";
    impScCode: string = "";
    brokeragePayable: boolean;
    creditCustomer: boolean;
    residentStatus: boolean;
    activeflag: boolean;
    deactivationReason: string = "";
    deactivationDate: Date;
    impFlag: Boolean;
    expFlag: Boolean;

    isSupplier:boolean = true;
    companyCin:string =""
    serviceTax: string = "";
    serviceTaxNo: number = 0;
    serviceTaxExmp: string = "";
    serviceTaxExmpNo: number = 0;
    serviceTaxLastModify: Date;
    serviceTaxLastDate: Date;
    flatRateDetention: string = "";
    tdsCertificateValid: Date;
    tdsPercent: string = "";
    TDS_utilised: string = "";
    TDS_limit: string = "";
    TDSNature: string = "";
    gstNo: string = "";
    tdsFlag: boolean;
    tdsCertificate: boolean;
    tdsGSTApplicable: Boolean;
    kycFlag: boolean;
    checkAcceptStatus: boolean;


    createdBy: string = "";
    modifiedBy: string = "";
    status: Boolean=true;

    saleFrom: string = "";
    salemoblino:string='';
    saleLocation: string = "";
    saleCode: string = "";
    saleName: string = "";
    deactiveCust: '';
    opsFrom: string = "";
    opsLocation: string = "";
    opsCode: string = "";
    opsName: string = "";
    isSez: boolean = false;
    isRegister: boolean = false;
    isUser : boolean = false;
    reg_UN_UIN: string = "";

    fasCode: string = "";
    sacCode: string = "";
    operationUser: string = ""
    mloId: string = "";
    creditDays: string = "";
    isShippingLine: boolean = false;
    isTDSExempt: boolean = false;
    branch: any;
    customer:any
    tdsDetails:any ;
    gstDetails : any;

    lumsumDateFrom:string;
    lumsumDateTo:string;
    daysinPeriod:number;
    amount:number;
  saleemail: any;

  portName: any;
  defaultSurveyor: any;
  remark: any;
  survey: any;

}

export class AddressInfo {
    address: string = "";
    countryId: string = "";
    countryISOCode: string = "";
    countryName: string = "";
    stateId: string = "";
    stateName: string = "";
    stateCode :string = "";
    cityId: string = "";
    cityName: string = "";
    postalCode: number = 0;
}

export class PrimaryNo {
    primaryCountryCode: string = "";
    primaryAreaCode: string = "";
    primaryNo:  string = "";
}

export class SecondaryNo {
    secondaryCountryCode: string = "";
    secondaryAreaCode: string = "";
    secondaryNo: string = "";
}

export class AllTimeAvailableNo {
    countryCode: string = "";
    areaCode: string = "";
    number: string = "";
}

export class FaxNo {
    faxCountryCode: string = "";
    faxAreaCode: string = "";
    faxNo: string = "";
}

export class Currency {
    currencyId: string = "";
    currencyCode: string = "";
    currencyName: string = "";
}

