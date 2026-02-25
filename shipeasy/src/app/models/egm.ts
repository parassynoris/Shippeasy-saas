export interface egm {
    _id: {
      $oid: string;
    };
    egmId: string;
    briefCargoForegm: string;
    captain: string;
    ced: boolean;
    cha: string;
    cld: boolean;
    containerArray: any[]; // Update the type based on your actual data structure
    createdBy: string;
    createdOn: string;
    custom_agent_code: string;
    custom_line_code: string;
    egmDate: string;
    egmName: string;
    egm_no: string;
    job: string;
    lastPort: string;
    light_dues: string;
    md: boolean;
    orgId: string;
    pld: boolean;
    port: string;
    priorPort1: string;
    priorPort2: string;
    sbc: boolean;
    ssd: boolean;
    tenantId: string;
    testorProduction: string;
    toc: string;
    totalLines: string;
    updatedBy: string;
    vesselName:string;
    portName:string;
    status:any
    updatedOn: string;
    vessel: string;
    vesselImo: number;
    vesselcallSign: string;
    voyage: string;
  }
  