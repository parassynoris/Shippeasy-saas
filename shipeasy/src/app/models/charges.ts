export interface Quotation {
    branchStateCode: string;
    orgId: string;
    tenantId: string;
    module: string;
    quotationId: string;
    enquiryId: string;
    validFrom: string;
    validTo: string;
    enquiryNo: string;
    currency: string;
    currencyShortName: string;
    exRate: number;
    carrierId: string;
    carrierName: string;
    carrierReceiptId: string;
    carrierReceiptName: string;
    etd: string;
    loadPortId: string;
    loadPortName: string;
    dischargePortId: string;
    dischargePortName: string;
    eta: string;
    vesselId: string;
    vesselName: string;
    voyageNumber: string;
    carrierDeliveryId: string;
    carrierDeliveryName: string;
    destPortFreeDays: number;
    originFreeDays: number;
    destFreeDays: number;
    totalBuy: number;
    totalSell: number;
    remarks: string;
    branchId: string;
    branchName: string;
    jobCode: string;
    quoteStatus: string;
    status: boolean;
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    quotationNo: string;
  }
  

  export interface EnquiryDetails {
    _id: string;
    tenantId: string;
    module: string;
    orgId: string;
    enquiryId: string;
    cloneEnquiryNo: string;
    cloneEnquiryId: string;
    agentadviceId: string;
    basicDetails: {
      agentAdviceDate: string;
      enquiryDate: string;
      enquiryTypeId: string;
      enquiryTypeName: string;
      noOfContainer: string;
      stcQuotationNo: string;
      bookingPartyId: string;
      billingBranch: string;
      billingStateCode: string;
      bookingPartyName: string;
      invoicingPartyId: string;
      invoicingPartyName: string;
      forwarderId: string;
      forwarderName: string;
      consigneeId: string;
      consigneeName: string;
      opsCoordinatorId: string;
      salesPersonId: string;
      shipperId: string;
      shipperName: string;
      shippingTermId: string;
      shippingTermName: string;
      batchType: string;
      moveTypeId: string;
      tankTypeId: string;
      tankStatusId: string;
      incoTermId: string;
      incoTermName: string;
      agentAdviceFrom: string;
      agentAdviceTo: string;
      poDate: string;
      cargoTypeId: string;
      notifyPartyId: string;
      moveNo: string;
      enquiryValidFormDate: string;
      enquiryValidToDate: string;
      enquiryValid: boolean;
    };
    productDetails: {
      cargoReadyDate: string;
      targetDeliveryDate: string;
    };
    cargoDetail: {
      productId: string;
      productName: string;
      properShippingName: string;
      technicalName: string | null;
      commodityType: string;
      commodityTypeName: string;
      imcoClass: string;
      unNo: string;
      hsCode: string;
      msdsDoc: string;
      packingGroup: string;
      flashPoint: string;
      marinePollutionId: string;
      unit: string;
      unitName: string;
      grossWeight: string;
      cargoReadyDate: string | null;
      targetDeliveryDate: string | null;
      Density: string;
    }[];
    routeDetails: {
      shippinglineName : string,
      shippinglineId : string,
      voyageNumber: string;
      vesselName: string;
      loadPlace: string;
      loadPlaceName: string;
      state: string;
      preCarriageId: string;
      loadPortId: string;
      loadPortName: string;
      location: string;
      locationName: string;
      destPortId: string;
      destPortName: string;
      onCarriageId: string;
      fpodId: string;
      fpodName: string;
      haulageTypeId: string;
      wagonNo: string;
      vehicleNo: string;
      destHaulageId: string;
      freightTerms: string;
      freightTermsName: string;
      shippingLineId: string;
      shippingLineName: string;
      shippingLineValidFrom: string;
      shippingLineValidTo: string;
      shippingLineValid: boolean;
      tsPortId: string;
      lineVoyageNo: string;
      destinationCustomClearance: string;
      originCustomClearance: string;
    };
    detentionDetails: {
      polFreeDay: string;
      polDetentionAmount: string;
      polDetentionCurrencyId: string;
      polDetentionCurrencyName: string;
      podFreeDay: string;
      podDetentionAmount: string;
      podDetentionCurrencyId: string;
      podDetentionCurrencyName: string;
    };
    grossWeightContainer: string;
    backupShippingLine: string;
    backupShippingLineName: string;
    remarksList: any[]; // adjust type as per actual data structure
    remarks: string;
    enquiryStatus: string;
    status: boolean;
    containersDetails: {
      containerType: string;
      noOfContainer: number;
      grossWeightContainer: string;
    }[];
    looseCargoDetails : {
      grossWeight: String,
      grossVolume : String,
      cargos : []
    };
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    enquiryNo: string;
    __v: number;
    quotationCounter: number;
  }
  
  export interface QuotationDetails {
    _id: string;
    orgId: string;
    tenantId: string;
    module: string;
    quotationId: string;
    enquiryId: string;
    validFrom: string;
    validTo: string;
    enquiryNo: string;
    currency: string;
    currencyShortName: string;
    exRate: string;
    carrierId: string;
    carrierName: string;
    carrierReceiptId: string;
    carrierReceiptName: string;
    etd: string;
    loadPortId: string;
    loadPortName: string;
    dischargePortId: string;
    dischargePortName: string;
    eta: string;
    vesselId: string;
    vesselName: string;
    voyageNumber: string;
    carrierDeliveryId: string;
    carrierDeliveryName: string;
    destPortFreeDays: number;
    originFreeDays: number;
    destFreeDays: number;
    totalBuy: number;
    totalSell: number;
    remarks: string;
    branchId: string;
    branchName: string;
    jobCode: string;
    quoteStatus: string;
    status: boolean;
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    quotationNo: string;
    __v: number;
  }
  
  export interface Batch {
    quickJob: boolean;
    agentadviceId:string
    statusOfBatch:string
    loadPlaceName: string;
    shipperId: string;
    shippingLineId: string;
    shippingLineName: string;
    plannedVesselName: string;
    plannedVoyageId: string;
    shipperName: string;
    stcQuotationNo: string;
    basicDetails: any;
    uniqueRefNo: any;
    enquiryNo: any;
    moveNo: any;
    routeDetails: any;
    enquiryData: any;
    tenantId: string;
    batchId: string;
    isExport: boolean;
    batchDate: string;
    quotationId: string;
    quotationNo: string;
    enquiryId: string;
    branchId: string;
    branchName: string;
    jobCode: string;
    status: boolean;
    enquiryDetails: EnquiryDetails;
    quotationDetails: QuotationDetails;
    orgId: string;
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    batchNo: string;
    __v: number;
  }
  