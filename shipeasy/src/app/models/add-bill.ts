// Define the interface for the BuyEstimates object
interface BuyEstimates {
    currencyId: string;
    currency: string;
    exChangeRate: number;
    rate: number;
    amount: number;
    totalAmount: number;
    terms: string;
    supplier: string;
  }
  
  // Define the interface for the SelEstimates object
  interface SelEstimates {
    currencyId: string;
    currency: string;
    exChangeRate: number;
    rate: number;
    amount: number;
    totalAmount: number;
    terms: string;
    remarks: string;
  }
  
  // Define the interface for the Tax object
  interface Tax {
    taxAmount: number;
    taxRate: number | null;
  }
  
  // Define the main interface for the entire data structure
 export interface enquiryitem {
    _id: {
      $oid: string;
    };
    __v: number;
    tenantId: string;
    enquiryitemId: string;
    enquiryId: string;
    enquiryNumber: string;
    enqDate: string;
    collectPort: string;
    costitemGroup: string;
    stcQuotationNo: string;
    enqType: string;
    costItemId: string;
    accountBaseCode: string;
    costItemName: string;
    costHeadId: string;
    costHeadName: string;
    exchangeRate: string;
    currency: string;
    amount: string;
    baseAmount: string;
    basic: string;
    tenantMargin: string;
    buyEstimates: BuyEstimates;
    selEstimates: SelEstimates;
    tax: Tax[];
    quantity: number;
    rate: number;
    stcAmount: number;
    jmbAmount: number;
    payableAt: string;
    gst: number;
    totalAmount: number;
    chargeTerm: string;
    remarks: string;
    containerNumber: string[];
    shippingLine: string;
    taxApplicability: string;
    hsnCode: string;
    referenceId: string;
    createdOn: string;
    updatedOn: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    isEnquiryCharge: boolean;
    batchId: string;
    batchNo: string;
    agentadviceId: string;
  }
  