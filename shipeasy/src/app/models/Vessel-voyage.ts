interface VoyageDetails {
    $oid: string;
  }
  
  interface VoyageInfo {
    shipping_line: string;
    voyage_number: string;
    exchageRate: string;
    currency: string;
    _id: VoyageDetails;
  }
  
 export interface MyData {
    _id: VoyageDetails;
    voyageId: string;
    ata: string;
    atd: string;
    createdBy: string;
    createdOn: string;
    isActive: boolean;
    module: string;
    orgId: string;
    pc_date: string;
    portId: string;
    portName: string;
    siCutOffDate: string;
    status: boolean;
    tenantId: string;
    terminal_name: string;
    updatedBy: string;
    updatedOn: string;
    vesselId: string;
    vesselName: string;
    voyage: VoyageInfo[];
    voyageEndDate: string;
    voyageNumber: string;
    voyageStartDate: string;
    updatedByUID: string;
    egmDate: string;
    egmNo: string;
    igmDate: string;
    igmNo: string;
    isVoyageImport: boolean;
    rotation: string;
    viaNo: string;
    pc_number:number;
  }
  
  