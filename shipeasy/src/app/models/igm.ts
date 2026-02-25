export interface IgmDetails {
    status: any;
    igm_no: string;
    portName: string;
    vesselName: string;
    job: string;
    port: string;
    vessel: string;
    voyage: string;
    lastPort: string;
    cha: string;
    light_dues: number;
    toc: string;
    vesselImo: string;
    vesselcallSign: string;
    custom_line_code: string;
    custom_agent_code: string;
    priorPort1: string;
    testorProduction: string;
    briefCargoForigm: string;
    priorPort2: string;
    captain: string;
    totalLines: string;
    sbc: boolean;
    ssd: boolean;
    cld: boolean;
    pld: boolean;
    ced: boolean;
    md: boolean;
    containerArray: any[]; // You may need to define a proper interface for containers
    igmName: string;
    module: string;
    bls: any[]; // You may need to define a proper interface for BLs
    referenceId: string;
    igmId: string;
    createdOn: Date;
    updatedOn: Date;
    tenantId: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    __v: number;
  }
  