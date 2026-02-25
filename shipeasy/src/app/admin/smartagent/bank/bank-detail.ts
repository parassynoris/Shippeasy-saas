export class BankDetail{
    tenenatId:string="";
    orgId:string="";
    parentId:string="";
    isBank:boolean;
    accountType:string="";
    agent:Agent = new Agent();
    country:Country=new Country();
    state:State=new State();
    cityId:string="";
    cityName:string="";
    currency:string="";
    localCurrency:string="";
    bankName:string="";
    accountNo:string="";
    beneficiaryName:string="";
    branchName:string="";
    address:string="";
    swiftCode:string="";
    routingNo:string="";
    ibanNo:string="";
    firstCorrespondent:FirstCorrespondent = new FirstCorrespondent();
    secondCorrespondent:SecondCorrespondent=new SecondCorrespondent();
    remark:string="";
    status:boolean=true;
    documents:any=[];
    bankNameId: string = '';
}

export class Country{
    countryId:string="";
    countryName:string="";
    countryISOCode:string="";
}

export class State{
    stateId:string="";
    stateName:string="";
}

export class Agent{
    agentId:string="";
    agentName:string="";
}

export class FirstCorrespondent{
    bankName:string="";
    routingNo:string="";
    ibanNo:string="";
}

export class SecondCorrespondent{
    bankName:string="";
    routingNo:string="";
    ibanNo:string="";
}
