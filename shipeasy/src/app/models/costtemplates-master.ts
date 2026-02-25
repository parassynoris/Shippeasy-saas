interface CostItem {
    tenantId: string;
    orgId: string;
    enquiryitemId: any;
    enquiryId: string;
    enquiryNumber: string;
    enqDate: string;
    stcQuotationNo: string;
    enqType: string;
    costItemId: string;
    chargeType: string;
    accountBaseCode: string;
    hsnCode: string;
    costItemName: string;
    costHeadId: string;
    currency: string;
    currencyId: string;
    amount: string;
    baseAmount: string;
    tenantMargin: string;
    tax: Tax[];
    quantity: string;
    rate: number;
    stcAmount: number;
    jmbAmount: number;
    payableAt: string;
    gst: number;
    totalAmount: number;
    chargeTerm: string;
    remarks: string;
    containerNumber: any[];
    isFreight: boolean;
  }
  
  interface Tax {
    taxAmount: number;
    taxRate: number;
  }
  
  export interface CostTemplate {
    tenantId: string;
    orgId: string;
    status: boolean;
    costtemplateId: string;
    costTemplateName: string;
    costTemplateDescription: string;
    module: string;
    costItem: CostItem[];
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
  }
  