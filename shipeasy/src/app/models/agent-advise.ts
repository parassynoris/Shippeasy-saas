interface BasicDetails {
    uniqueRefNo: string;
    agentAdviceDate: string;
    stcReference: string;
    stcQutationNo: string;
    versionNo: string;
    moveNo: string;
    references: any[]; // 
    paymentTerm: string;
    moveTypeId: string;
    ShipmentTypeName:string;
    moveTypeName: string;
    noOfContainer: string;
    destinationId: string;
    enquiryValid: boolean;
    origin: string;
    shipppingtermId: string;
    shippping_term: string;
    tradeRoute: string;
    tankType:string;
    destinationName:string;
  }
  
  interface Container {
    containerId: string;
    containerNo: string;
    sealNo: string;
    netWeight: string;
    grossWeight: string;
    weightUOM: string;
    manufactureDate: string;
    containerStatus: string;
  }
  
  interface DetentionDetails {
    demurrageFreeDays: string;
    demurrageCurrencyId: string;
    demurrageAmount: string;
    demurrageChanged: boolean;
    demurrageName: string;
    truckingFreeHours: string;
    truckingCurrencyId: string;
    truckingCurrencyName: string;
    truckingPrice: string;
    truckingChanged: boolean;
    operatorName: string;
    operatorPhone: string;
    operatorMail: string;
  }
  
  interface PartyDetail {
    partyType: string;
    customerName: string;
    partyCode: string;
    addressLine1: string;
    addressLine2: string;
    addressLine3: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
  }
  
  interface ProductDetails {
    product: string;
    productName: string;
    properShippingName: string;
    imcoClass: string;
    unNo: string;
    packingGroup: string;
    flashPoint: string;
    marinePollutionId: string;
    emsCode: string;
    gravity: string;
    Haz: boolean;
  }
  
  interface RouteDetails {
    exitPortId: string;
    exitPortUN: string;
    exitPortDateEA: string;
    entryPortId: string;
    state: string;
    entryPortUN: string;
    entryPortDate: string;
    deliveryPlaceId: string;
    deliveryPlaceName: string;
    shippingLineId: string;
    shippingLineName: string;
    bol: string;
    plannedVesselName: string;
    plannedVoyageName: string;
  }
  
  export interface AgentAdvice {
    shipperDetails:ShipperDetails
    agentadviceId: string;
    agentAdviceType: string;
    agentadviceNo: string;
    basicDetails: BasicDetails;
    containers: Container[];
    createdBy: string;
    createdOn: string;
    detentionDetails: DetentionDetails;
    module: string;
    orgId: string;
    partyDetails: PartyDetail[];
    productDetails: ProductDetails;
    remarks: string;
    routeDetails: RouteDetails;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    updatedByUID: string;
  }
  interface ShipperDetails {
    shipperId: string;
    shipperName:string;
    consigneeName:string;
    notifyPartyName:string;
    vendorName:string;
    shipperAddress: string;
    consigneeId: string;
    consigneeAddress: string;
    notifyParty1: string;
    address1: string;
    notifyParty2: string;
    address2: string;
    notifyParty3: string;
    address3: string;
    notifyParty4: string;
    address4: string;
    vendorId: string;
  }
  export interface ContainerInfo {
    containermasterId: string;
    baffles: boolean;
    cargoNo: string;
    cargoTypeName: string;
    containerHeight: string;
    containerNo: string;
    containerOperator: string;
    containerSize: string;
    containerStatus: string;
    containerStatusId: boolean;
    containerType: string;
    containerTypeId: string;
    createdBy: string;
    createdOn: string;
    dateOfManufacture: string;
    dropLocation: string;
    exitOffHireDate: string;
    loadCapacity: string;
    maxGrossWeight: string;
    maxPayload: string;
    module: string;
    onHireDate: string;
    oneWay: boolean;
    orgId: string;
    pickLocation: string;
    remarks: string;
    soc: boolean;
    status: boolean;
    tankCapacity: string;
    tankStatus: string;
    tankStatusId: string;
    tankType: string;
    tarWeight: string;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    customerId: string;
    customerName: string;
    date: string;
    yardName: string;
    yardNameId: string;
    blno: string;
    bookingref: string;
    consignee: string;
    customCode: string;
    doDate: string;
    dono: string;
    principal: string;
    shipper: string;
    shippingBill: string;
    previousYardName: string;
    previousStatus: string;
    updatedByUID: string;
  }
  
  

  