export interface enquiry{    
    Principal:string;
    GstInvoicing:string;
    GeneralEmailId:number;    
    PersonInCharge:string;
    PicEmail:string;    
    PicPhoneNumber:number;
    Department:string;
    Segment:string;
    AgencyType:string;
}

export interface enquiryList{
    num:number;
    vessel:string;
    voyage:number;
    portname:string;
    principal_name:string;
    agency_type:string;
    charterersName:string;
    agentSPOC:string;
    cargoDetails:string;
    segment:string;
    eta:string;
    status:string;
}