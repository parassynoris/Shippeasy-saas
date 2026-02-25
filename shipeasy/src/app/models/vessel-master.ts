interface RefundBankAccounts {
    bankId: string;
    accountNo: string;
    bankName: string;
  }
  
  interface PortOfRegistry {
    portName: string;
    portId: string;
  }
  
  interface ShipManager {
    shipManagerName: string;
    shipManagerId: string;
  }
  
  interface SubType {
    vesselSubTypeName: string;
    vesselSubTypeId: string;
  }
  
  interface VesselCategory {
    vesselCategoryId: string;
    vesselCategoryName: string;
  }
  
  interface VesselType {
    vesselTypeName: string;
    vesselTypeId: string;
  }
  
  interface GeneralDetails {
    Ownership: string;
    mvmt: string;
    flag: {
      countryName: string;
      countryId: string;
    };
    mmsiNumber: number;
    built: string;
    integrationId: string;
    classificationSociety: string;
    refundBankAccounts: RefundBankAccounts;
    portOfRegistry: PortOfRegistry;
    callSign: string;
    IGS: string;
    lloydsIMONo: number;
    registrationNo: string;
    name: string;
    shipManager: ShipManager;
    subType: SubType;
    effectiveDate: string;
    vesselCategory: VesselCategory;
    pIClub: string;
    vesseltype: VesselType;
  }
  
  interface LegalEntity {
    legalEntityId: string;
    legalEntityName: string;
  }
  
  interface Principal {
    companyName: string;
    addressId: string;
  }
  
 export interface Vessel {
   voyage: any;
   mmsino: number;
    vesselCode: string;
   updatedDate:string ;
    vesselId: string;
    chartId: string;
    addressId: string;
    createdBy: string;
    createdOn: string;
    generalDetails: GeneralDetails;
    isNotificationEnabled: string;
    legalEntity: LegalEntity;
    legalEntityId: string;
    orgId: string;
    override_orgId: string;
    principal: Principal;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    vesselFlag: string;
    vesselIMO: number;
    vesselName: string;
    vesselRegistrationDate: null;
    vesselType: string;
    caseSystemId: string;
    pendingverificationId: string;
    verifyBy: string;
    verifyOn: string;
    imoNo: string;
    country:string;
    countryName:string;
    callSign:string;
  }
  
  