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
      forwarderName: string;
     tankTypeName: string;
      moveTypeName: string;
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
    productDetails: any; // Define the type accordingly
    cargoDetail: CargoDetail[];
    routeDetails: RouteDetails;
    detentionDetails: DetentionDetails;
    grossWeightContainer: string;
    backupShippingLine: string;
    backupShippingLineName: string;
    remarksList: any[]; // Define the type accordingly
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
    __v: number;
    batches: Batch[];
  }
  interface Tax {
    taxAmount: number;
    taxRate: number;
  }
  
 export interface EnquiryItem {
    statusOfinvoice: any;
    isPrincipleCreated: string;
    isInvoiceCreated: string;
    isEnquiryCharge: string;
    chargeItemId: string;
    batchId: string;
    taxAmount: number;
    isFreight: unknown;
    costitemGroup: string;
    exRateShippingLine: number;
    moveNumber: number;
    invoiceStatus : string;
    currencyShippingLine: any;
    isSelected: boolean;
    rate: number;
    sort: any;
    exemp: boolean;
    quantity: any;
    orgId: string;
    enquiryitemId: string;
    enquiryId: string;
    stcQuotationNo: string;
    costItemId: string;
    costItemName: string;
    costHeadId: string;
    costHeadName: string;
    currency: string;
    amount: any;
    baseAmount: string;
    tenantMargin: string;
    tax: Tax[];
    stcAmount: number;
    jmbAmount: number;
    payableAt: string;
    gst: number;
    totalAmount: string;
    chargeTerm: string;
    remarks: string;
    containerNumber: any[]; // Define the type accordingly
    createdBy: string;
    createdOn: string;
    tenantId: string;
    selEstimates : {
      statusOfinvoice: any;
      invoiceNo: any;
      taxableAmount: number;
      igst: number;
      totalAmount: Number,
      sellerInvoice: boolean
    },
    buyEstimates : {
      statusOfinvoice: any;
      invoiceNo: any;
      totalAmount: Number,
      buyerInvoice: boolean
    },
  }
  interface Reply {
    commentsBy: string;
    commentText: string;
    commentString: string;
    _id: {
      $oid: string;
    };
  }
  
 export interface Remark {
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    updatedOn: string;
    updatedBy: string;
    updatedByUID: string;
    tenantId: string;
    prospectId: string;
    commentsby: string;
    commentText: string;
    instructionsFrom: string;
    instructionsToId: string;
    instructionsTo: string;
    instructionsToEmail: string;
    instructionsDescription: string;
    commentString: string;
    contractId: string;
    commentId: string;
    clauseId: string;
    batchId: string;
    enquiryId: string;
    processPoint: string;
    processPointName: string;
    departmentId: string;
    departmentName: string;
    branchHead: string;
    reply: Reply[];
    remarkStatusId: string;
    remarkStatusName: string;
    status: boolean;
    orgId: string;
    __v: number;
  }
  