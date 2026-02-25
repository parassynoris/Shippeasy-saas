export interface voyage {
    _id: {
      $oid: string;
    };
    createdOn: string;
    createdBy: string;
    port:any;
    priorPort1:any;
    priorPort2: any;
    captainName:any;
    egmDate:any;
    voyageDate:any
    shippingLine:any;
    egmVesselType: any;
    briefCargoForegm: any;
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
    voyage: VoyageDetails[];
    __v: number;
    lastPortCall: any;
    voyageId:number
    callSign:any
  }
  
  export interface VoyageDetails {
    shipping_line: string;
    voyage_number: string;
    exchageRate: string;
    currency: string;
    _id: {
      $oid: string;
    };
  }
  