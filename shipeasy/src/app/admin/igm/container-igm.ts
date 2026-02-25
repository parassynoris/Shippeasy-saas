export class igmContainer{
    msgType:string;
    cha_code:string;
    imo:string;
    vessel_code:string;
    voyage_number:string;
    igm_no:number;
    igm_date:Date;
    line_number:number;
    sub_line:number;
    container_no:string;
    eseal:string;
    agent_code:string;
    status:string;
    no_pck:number;
    weight:number;
    iso:string;
    soc:string;
}


export class fieldLength{
    msgType:1;
    cha_code:6;
    imo:10;
    vessel_code:10;
    voyage_number:10;
    igm_no:7;
    igm_date:Date;
    line_number:4;
    sub_line:4;
    container_no:11;
    eseal:15;
    agent_code:16;
    status:3;
    no_pck:8;
    weight:14;
    iso:4;
    soc:1;
}