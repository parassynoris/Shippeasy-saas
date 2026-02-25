export interface banklist {
    bankId: string;
    bankShortName: string;
    bankAccountCode:string;
    lineID:string;
    FASLedgerCode:string;
    accountHolder: {
      companyName: string;
      addressId: string;
    };
    accountNo: string;
    accountType: string;
    address: string;
    bankName: string;
    beneficiaryName: string;
    branchName: string;
    city: string;
    country: {
      countryName: string;
      countryId: string;
    };
    createdBy: string;
    createdOn: string;
    currency: string;
    currencyName: string;
    document: {
      documentId: string;
      documentName: string;
    };
    firstCorrespondent: {
      routingNo: string;
      name: string;
      swiftCode: string;
    };
    holidays: any[]; 
    ibanNo: string;
    isAvailableAllTime: boolean;
    isMultiCurrency: boolean;
    isPrimary: boolean;
    multiCurrency: {
      currencyName: string;
      currencyCode: string;
    }[];
    orgId: string;
    remarks: string;
    routingNo: string;
    secondCorrespondent: {
      routingNo: string;
      name: string;
      swiftCode: string;
    };
    status: boolean;
    swiftCode: string;
    tenantId: string;
    termAndCondtion: any; 
    updatedBy: string;
    updatedOn: string;
    workingDays: any[]; 
    workingHrFrom: string;
    workingHrTo: string;
    caseSystemId: string;
    pendingverificationId: string;
    verifyBy: string;
    verifyOn: string;
      invoiceId: string;
      invoice_date: string;
      invoiceDate: string;
      invoiceDueDate: string;
      invoiceType: string;

      invoiceNo: string;
      billNo: string;
      invoiceFromId: string;
      invoiceFromName: string;
      invoiceTaxAmount: number;
      remittenceId: string;
      uploadDocuments: any[]; // Update the type accordingly based on actual data
      containerData: Container[];
      vendorCharges: VendorCharge[];
      invoiceAmount: number;
      module: string;
      isExport: boolean;
      tax: Tax[];
      vendorId: string;
      vendorName: string;
      batchNumber: string[];
  
      invoiceStatus: string;
      referenceId: string;
      createdByUID: string;
      updatedByUID: string;
      __v: number;
    }
    
    interface Container {
      batchNo: string;
      containerNumber: string;
      batchId: string;
      blNumber: string;
      containerId: string;
      containerType: string;
      containers: ContainerDetail[];
    }
    
    interface ContainerDetail {
      containerNo: string;
      containerId: string;
    }
    
    interface VendorCharge {
      billNo: string;
      vendorBillNo: VendorBill[];
      isChecked: boolean;
      isSGST: boolean;
      enquiryitemId: string;
      batchNo: string;
      batchId: string;
      containers: ContainerDetail[];
      moveNumber: string;
      vesselName: string;
      voyageName: string;
      container: string;
      vendorbillNo: string;
      vendorbillDate: string;
      gstNumber: string;
      vendorName: string;
      stateCode: string;
      sacCode: string;
      RCM: boolean;
      RCM_chargeble: boolean;
      chargeItem: string;
      chargeItemId: string;
      rate: number;
      currency: string;
      exchangeRate: string;
      chargableAMT: string;
      taxApplied: string;
      gst: string;
      documentUrl: string | null;
      document: string | null;
      sgstAMT: string;
      utgstAMT: string;
      cgstAMT: string;
      igstAMT: string;
      totalTAX: string;
      totalAMT: string;
      totalAMT_USD: string;
      remark: string;
    }
    
    interface VendorBill {
      vendorBill: string;
    }
    
    interface Tax {
      taxAmount: number;
      taxRate: number;
      taxName: string;
    }
    
  
  export interface result{
    ariaLabelledBy: string,
      backdrop: string,
      keyboard: boolean,
      centered: boolean,
      size: string,
  }