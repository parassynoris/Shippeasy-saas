export interface Invoice {
  flightNo: string;
  carrierName: string;
  finalPostingAmount: number;
  billPosting: any;
  batchNumber: any;
  vendorId: string | null;
      documentName: string;
    invoiceDate: string | number | Date;
    billNo: string;
    receivedAmt: number;
    consigneeName: string;
    chargeNames: any;
    isSelected: boolean;
    short_amount: number;
    outstanding_amount: string;
    cheque: string;
    tds_amount: number;
    stolt_invoice_amount: string;
    collected_amount: number;
    credit_amount: number;
    fullAmount: boolean;
    entry_date: string;
    from_date: string;
    to_date: string;
    tds_year: string;
    tds_percentage: string;
    blName: string;
    moveNo: string;
    batchId: string;
    batchNo: string;
    statusOfinvoice: string;
    invoiceToName: string;
    invoiceTypeStatus: string;
    invoiceId: string;
    bankId: string;
    invoiceStatus:string
    bankName: string;
    bankType: string;
    createdBy: string;
    createdOn: string;
    invoiceAmount: string;
    invoiceFromId: string;
    invoiceFromName: string;
    invoiceNo: string;
    invoiceNumber: string;
    invoiceDueDate: string;
    costItems: CostItem[];
    invoiceTaxAmount: string;
    invoiceType: string;
    invoice_date: string;
    isExport: boolean;
    jobId: string;
    jobNumber: string;
    orgId: string;
    paidAmount: number;
    paymentMode: string;
    paymentStatus: string;
    paymentTerms: string;
    remarks: string;
    serviceDateTill: string;
    serviceDatefrom: string;
    status: boolean;
    tax: Tax[];
    taxNumber: string;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    vesselId: string;
    vesselName: string;
    voyageNumber: string;
    billDueDate: string;
  }
  
  interface CostItem {
    exRateShippingLine: number;
    quantity: any;
    rate: any;
    costItemHead: string;
    costItems: CostItemDetail[];
    costItemHeadId: string;
    invoiceCreated: boolean;
  }
   interface CostItemDetail {
    agent: {
      unitPrice: number;
      currency: string;
      baseROE: string;
    };
    chargeTerm: string;
    document: Document[];
    costItemName: string;
    vendorId: string | null;
    exclusion: boolean;
    remark: string;
    costItemId: string;
    costItemDescription: string;
    optionalCharge: boolean;
    customerTax: number;
    operator: {
      unitPrice: number;
      currency: string;
      baseROE: string;
    };
    vendorUnit: string;
    uom: {
      id: number;
    };
    isChargeble: boolean;
    isModified: any;
    rate: number;
    agreementId: string;
    poRemark: any;
    currency: string;
    costSaving: {
      type: string;
      amount: number;
    };
    hoRemark: any;
    HSNCODEType: string;
    approvalStatus: string;
    accountCode: string;
    amount: number;
    branchRemark: any;
    quantity: number;
    costItemVMSCode: string;
    customerAMTFc: number;
    tax: Tax[];
    terminal: string;
    inQuery: boolean;
    documentUrls: string[];
    vesselUnitValue: string;
    customerAMTLocal: number;
    totalAmount: number;
    dainvoice: any;
    system: {
      unitPrice: number;
      currency: string;
      baseROE: number;
    };
    daType: string;
    isTemp: boolean;
    invoice: any;
    remarks: string;
  }
  
  interface Tax {
    taxAmount: number;
    taxRate: number;
    taxName: string;
  }
  
  interface Document {
    name: string;
  }
  