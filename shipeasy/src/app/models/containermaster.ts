export interface containermaster {
    _id: {
      $oid: string;
    };
    containerNo: string;
    cargoNo: string;
    cargoTypeName: string;
    containerTypeId: string;
    containerType: string;
    containerSize: string;
    tankStatusId: string;
    tankStatus: string;
    tankType: string;
    tarWeight: string;
    tankCapacity: string;
    exitOffHireDate: string;
    onHireDate: string;
    dateOfManufacture: string;
    oneWay: boolean;
    loadCapacity: string;
    containerOperator: string;
    yard: string;
    yardName: string;
    pickLocation: string;
    dropLocation: string;
    soc: boolean;
    maxGrossWeight: string;
    maxPayload: string;
    baffles: boolean;
    remarks: string;
    status: boolean;
    module: string;
    referenceId: string;
    containermasterId: string;
    createdOn: string;
    updatedOn: string;
    tenantId: string;
    createdBy: string;
    createdByUID: string;
    updatedBy: string;
    updatedByUID: string;
    __v: number;
  }
  