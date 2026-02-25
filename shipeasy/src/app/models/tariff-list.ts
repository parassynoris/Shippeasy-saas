interface CargoDetail {
    productId: string;
    productName: string;
    properShippingName: string;
    technicalName: string;
    commodityType: string;
    commodityTypeName: string;
    imcoClass: string;
    unNo: string;
    hsCode: string;
    packingGroup: string;
    flashPoint: string;
    marinePollutionId: string;
    grossWeight: string;
    cargoReadyDate: string;
    targetDeliveryDate: string;
    Density: string;
  }
  
  interface RouteDetails {
    loadPlace: string;
    loadPlaceName: string;
    state: string;
    loadPortId: string;
    loadPortName: string;
    location: string;
    locationName: string;
    destPortId: string;
    destPortName: string;
    wagonNo: string;
    vehicleNo: string;
    freightTerms: string;
    freightTermsName: string;
    shippingLineId: string;
    shippingLineName: string;
    shippingLineValidFrom: string;
    shippingLineValidTo: string;
    shippingLineValid: boolean;
  }
  
  interface DetentionDetails {
    polFreeDay: number;
    polDetentionAmount: number;
    polDetentionCurrencyId: string;
    polDetentionCurrencyName: string;
    podFreeDay: number;
    podDetentionAmount: number;
    podDetentionCurrencyId: string;
    podDetentionCurrencyName: string;
  }
  
  interface ContainerDetails {
    containerType: string;
    noOfContainer: number;
    grossWeightContainer: string;
  }
  
  interface Batch {
    batchNo: string;
    batchId: string;
  }
  
 export interface Enquiry {
    tenantId: string;
    module: string;
    enquiryId: string;
    cloneEnquiryNo: string;
    cloneEnquiryId: string;
    agentadviceId: string;
    basicDetails: {
      agentAdviceDate: string;
      enquiryDate: string;
      enquiryTypeId: string;
      enquiryTypeName: string;
      stcQuotationNo: number;
      bookingPartyId: string;
      bookingPartyName: string;
      invoicingPartyId: string;
      invoicingPartyName: string;
      forwarderId: string;
      consigneeId: string;
      consigneeName: string;
      opsCoordinatorId: string;
      salesPersonId: string;
      shipperId: string;
      shipperName: string;
      shippingTermId: string;
      batchType: string;
      moveTypeId: string;
      tankTypeId: string;
      tankStatusId: string;
      incoTermId: string;
      incoTermName: string;
      enquiryValidFormDate: string;
      enquiryValidToDate: string;
      enquiryValid: boolean;
    };
    productDetails: any; // Define this type if needed
    cargoDetail: CargoDetail[];
    routeDetails: RouteDetails;
    detentionDetails: DetentionDetails;
    grossWeightContainer: string;
    backupShippingLine: string;
    backupShippingLineName: string;
    remarksList: any[]; // Define this type if needed
    remarks: string;
    enquiryStatus: string;
    status: boolean;
    containersDetails: ContainerDetails[];
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    enquiryNo: string;
    batches: Batch[];
  }

  interface Terminal {
    item_id: string;
    item_text: string;
  }
  
  interface Berth {
    item_id: string;
    item_text: string;
  }
  
  interface VesselType {
    item_id: string;
    item_text: string;
  }
  
  interface CostItem {
    // Define the structure of the CostItem if it's available in your application
  }


  
 export interface ratemaster {
    generalInputsDetails: {
        cargo:string,
        movement:string
    };
    principalDetails: {
        purposeOfCall:string
    };
    outerAnchorageHours: string;
    country: string;
    tariffRuleName:string
    port: string;
    terminal: Terminal[];
    berth: Berth[];
    vesselType: VesselType[];
    docRefNo: string;
    countryName: string;
    portName: string;
    module: string;
    costItems: CostItem[];
    referenceId: string;
    ratemasterId: string;
    createdOn: string;
    updatedOn: string;
    tenantId: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    orgId: string;
    updatedByUID: string;
    berthName:Berth[];
    terminalName:Terminal[];
    inputLength:number
  }
  interface Country {
    countryId: string;
    countryName: string;
  }
  
  interface PortDetails {
    isIcd: boolean;
    isSez: boolean;
    financeSECname: string;
    portName: string;
    description: string;
    CustEDICode: string;
    Sectorname: string;
    Subsectorname: string;
    company: string;
    canalDirection: string;
    agentBranchId: string;
    agentBranch: string;
  }
  
 export interface Port {
    location: any;
    portName: string;
    terminal: any;
    egmCode: any;
    tenantId: string;
    isPort: boolean;
    module: string;
    shortName :any;
    country: Country;
    portDetails: PortDetails;
    terminals: any[]; // Define the structure of Terminal if available
    status: boolean;
    referenceId: string;
    portId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;

  }
  
  
  