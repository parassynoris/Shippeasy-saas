export interface City {
    _id: { $oid: string };
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    updatedOn: string;
    updatedBy: string;
    stateId: string;
    cityName: string;
    status: boolean;
    stateName: string;
    module: string;
    tenantId: string;
    cityId: string;
    __v: number;
    _source:any;
  }
  