export class SmartAgentDetail{
    uploadLogo:string = "";
    isBranch:boolean=false;
    isPrincipal:boolean=false;
    agentId:string="";
    branchType:string="";
    agentName :string="";
    branchId:string="";
    branchName:string="";
    principalId:string="";
    principalName:string="";
    parentId:string="";
    addressInfo:AddressInfo=new AddressInfo();
    primaryNo: PrimaryNo=new PrimaryNo();
    secondaryNo: SecondaryNo=new SecondaryNo();
    allTimeAvailableNo: AllTimeAvailableNo=new AllTimeAvailableNo();
    faxNo: FaxNo=new FaxNo();
    url:string="";
    orgId  :string="";
    tenantId :string="";
    userType:string ="";
    primaryMailId:string="";
    secondaryMailId:string="";
    commRegNo:string="";
    dAndBNo:string="";
    taxType:string="";
    taxCode:string="";
    taxId:string="";
    panNo :string="";
    vatNo:string="";
    sezUnitAddress:string="";
    vendorType:string="";
    portName:string="";
    currency: Currency=new Currency();
    pic: Pic=new Pic();
    pda:boolean=false;
    iPda:boolean=false;
    fda:boolean=false;
    sda:boolean=false;
    branchActive:boolean=true;
    status: true;
    jobCode : string = ''
    jobCodeNB: string = ''
    warehouseCounterNB: string = ''
    batchCounter: Number = 0;
    invoiceCounter: Number = 0;
    warehouseCounter: Number = 0;
    exportBatchCounter: Number = 0;
    holidays:[];
}

export class AddressInfo{
    address:string="";
    countryId:number = 0;
    countryISOCode:string="";
    countryName:string="";
    stateId:string="";
    stateName:string="";
    stateCode :string="";
    cityId:string="";
    cityName:string="";
    postalCode:string="";
    timezone:string="";
    currentLocation:string="";
}

export class PrimaryNo{
    primaryCountryCode:string="";
    primaryAreaCode:string="";
    primaryNumber:string="";
}

export class SecondaryNo{
    secondaryCountryCode:string="";
    secondaryAreaCode:string="";
    secondaryNo:string="";
}

export class AllTimeAvailableNo{
    countryCode:string="";
    areaCode:string="";
    allTimeAvailableNumber: string="";
}

export class FaxNo{
    faxCountryCode:string="";
    faxAreaCode:string="";
    faxNo: string="";
}

export class Currency{
    countryId:string="";
    currencyId:string="";
    currencyCode:string="";
    currencyName:string="";
}

export class Pic{
    picType:string="";
    picName:string="";
    picName1:string="";
    picName2:string="";
    picMobileNo:string="";
    picMobileCountryCode:string="";
    picMobileAreaCode:string="";
    picMailId:string="";
}
