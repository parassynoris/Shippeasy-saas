interface Voyage {
    shipping_line: string;
    voyage_number: string;
    exchageRate: string;
    currency: string;
    _id: {
      $oid: string;
    };
  }

  export interface Voyage1 {
    _id: {
      $oid: string;
    };
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    updatedOn: string;
    updatedBy: string;
    module: string;
    vesselId: string;
    vesselName: string;
    portId: string;
    portName: string;
    voyageNumber: string;
    terminal_name: string;
    voyageStartString: string;
    voyageEndString: string;
    ata: string;
    atd: string;
    pc_String: string;
    siCutOffString: string;
    rotation: string;
    viaNo: string;
    igmNo: string;
    igmString: string;
    egmNo: string;
    egmString: string;
    status: boolean;
    orgId: string;
    tenantId: string;
    isActive: boolean;
    isVoyageImport: boolean;
    voyage: Voyage[];
    __v: number;
  }
  
  // Define the interface for the SI object
interface SI {
  bookingNo: number;
  cutOffDate: string;
  bookingConfirmed: boolean;
  siAttachment: string;
  siAttachmentName: string;
  siRemark: string;
  siMail: string;
  filedDate: string;
  filedAttachment: string;
  filedAttachmentName: string;
  filedRemark: string;
  siRevised: any[]; // You may want to create a specific interface for siRevised if needed
  bookingCancel: boolean;
}

// Define the interface for the VGM object
interface VGM {
  containerNo: string;
  vgmReceived: string;
  vgmAttachment: string;
  vgmAttachmentName: string;
  vgmRemark: string;
  vgmEmail: string;
}

// Define the interface for the DG object
interface DG {
  containerNo: string;
  receivedDate: string | null;
  remark: string;
  deliveryOrderNo: string | null;
  doDate: string | null;
  emailId: string;
  dgAttachment: string;
  dgAttachmentName: string;
}

// Define the interface for the MasterBL object
interface MasterBL {
  firstPrintReceived: string;
  firstPrintRemark: string;
  firstPrintEmailId: string;
  finalPrintReceived: string;
  finalPrintRemark: string;
  finalPrintEmailId: string;
  firstAttachment: string;
  finalAttachment: string;
}

// Define the interface for the BookingCancelArray object
interface BookingCancelArray {
  bookingCancelReson: string;
  bookingCancelRemarks: string;
  bookingCancelDate: string;
  bookingNumber: number;
  plannedVesselId: string;
  backupVesselId: string;
  finalVesselId: string;
  finalVesselName: string;
}

// Define the main interface for the entire data structure
interface YourDataStructure {
  _id: {
    $oid: string;
  };
  tenantId: string;
  batchId: string;
  instrcutionType: string;
  instrcutions: string;
  portId: string;
  portcallId: string;
  plannedVesselId: string;
  backupVesselId: string;
  finalVesselId: string;
  finalVesselName: string;
  siCutOffDate: string;
  si: SI;
  vgm: VGM[];
  dg: DG;
  masterbl: MasterBL;
  isApproved: string;
  documents: any[]; // You may want to create a specific interface for documents if needed
  status: boolean;
  remark: string;
  bookingCancelArray: BookingCancelArray[];
  referenceId: string;
  instructionId: string;
  createdOn: string;
  updatedOn: string;
  createdBy: string;
  createdByUID: string;
  updatedBy: string;
  __v: number;
  updatedByUID: string;
}

