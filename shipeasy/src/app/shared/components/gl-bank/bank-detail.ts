export class BankDetail {
  tenenatId: string = '';
  orgId: string = '';
  parentId: string = '';
  bankId: any;
  isBank: boolean;
  accountType: string = '';
  agent: Agent = new Agent();
  country: Country = new Country();
  state: State = new State();
  cityId: string = '';
  cityName: string = '';
  currency: string = '';
  bankName: string = '';
  accountNo: string = '';
  Opbalance: string = '';
  isDefaultBank: boolean = false;
  beneficiaryName: string = '';
  branchId : string = '';
  branchName: string = '';
  address: string = '';
  swiftCode: string = '';
  routingNo: string = '';
  ibanNo: string = '';
  ifscCode: string = '';
  firstCorrespondent: FirstCorrespondent = new FirstCorrespondent();
  secondCorrespondent: SecondCorrespondent = new SecondCorrespondent();
  remark: string = '';
  status: boolean = true;
  bankUpload: string = '';
  bankUploadUrl: string = '';
}

export class Country {
  countryId: string = '';
  countryName: string = '';
  countryISOCode: string = '';
}

export class State {
  stateId: string = '';
  stateName: string = '';
}

export class Agent {
  agentId: string = '';
  agentName: string = '';
}

export class FirstCorrespondent {
  bankName: string = '';
  routingNo: string = '';
  ibanNo: string = '';
}

export class SecondCorrespondent {
  bankName: string = '';
  routingNo: string = '';
  ibanNo: string = '';
}
