
export interface Bl {
  _id: { $oid: string };
  __v: number;
  tenantId: string;
  batchId: string;
  Import_Export: string;
   blDraftStatus : string;
  blType: string;
  subBltype: string;
  blTypeName: string;
  blNumber: string;
  shipperId: string;
  shipperName: string;
  shipperAddress: string;
  consigneeId: string;
  consigneeName: string;
  consigneeAddress: string;
  voyageId: string;
  vessel: { $oid: string };
  vesselName: string;
  preCarrigeById: string;
  preCarrigeByName: string;
  notify_party1: string;
  notify_party1Name: string;
  address1: string;
  notify_party2: string;
  notify_party2Name: string;
  address2: string;
  notify_party3: string;
  address3: string;

  loadPlace: { $oid: string };
  loadPlaceName: string;

  entryPort: { $oid: string };
  entryPortId: string;
  onCarriageId: string;
  onCarriageName: string;
  placeOfDelivery: { $oid: string };
  placeOfDeliveryName: string;
  stoltAgentId: string;
  stoltAgentName: string;
  manifestRemarks: boolean;

  podUnLoc: string;

  polId: string;
  polName: string;

  placeofIssue: string;
  placeofReceipt: string;
  frieghtPaidBy: string;
  blINCOTerm: string;

  billToId: string;
  billToName: string;
  doInvoice: boolean;
  documentInvoice: boolean;
  handlingFees: string;
  pcin: string;
  csn: string;
  mcin: string;
  blStatus: boolean;
  additional: string;
  containers: {
    _id: string;
    createdOn: string;
    createdBy: string;
    createdByUID: string;
    sobDate: string;
    tenantId: string;
    containerId: string;
    batchId: string;
    batchNo: string;
    tankStatusName: string;
    tankStatusId: string;
    voyageNo: string;

    shippingLineId: string;
    shippingLineName: string;

    mastercontainerId: string;
    containerNumber: string;
    containerTypeId: string;
    containerDescription: string;
    containerTypeName: string;
    containerType: string;
    containerSize: string;
    containerHeight: string;

    imoType: string;
    imoTypeId: string;
    netWeight: string;
    grossWeight: string;

    isoContainerCode: string;
    tareWeight: string;
    sealNo: string;
    unit: string;
    rfidNo: string;
    cargoType: string;
    cargoTypeId: string;
    evgmNumber: string;
    blNumber: string;
    shippingBillNumber: string;
    sbNo: string;
    bondNumber: string;
    igmNumber: string;
    statusFlagId: string;
    status: boolean;

    depotOut: string;
    icdIn: string;
    icdInName: string;

    icdOut: string;
    icdOutName: string;

    factoryIn: string;
    factoryInName: string;

    factoryOut: string;
    factoryOutName: string;

    terminalIn: string;
    terminalInName: string;

    terminalOut: string;
    terminalOutName: string;

    mtyValidity: string;
    mtyReturn: string;

    cfsIn: string;
    cfsOut: string;

    railOut: string;

    reject: string;
    rejectName: string;

    override_orgId: string;
    override_tId: boolean;
    containerInUse: boolean;

    isExport: boolean;

    __v: number;
    blDate: string;
    evgmDate: string;
  }[];

  status: boolean;

  shippingLineId: string;

  mbl: string;

  IGM_Filed: string;

  blDate: string;

  shippingTerm: string;

  shippingTermId: string;

  isDPD: boolean;

  isHSS: boolean;

  grossWeight: string;

  nettWeight: string;

  markNumber: string;

  totalPackage: string;

  cargo_Desc: string;

  cargoType: string;

  cfsLocationId: string;

  cargoStatus: string;

  productName: string;

  productId: string;

  surveyor: string;

  emptyReturnDepot: string;

  VesselSellingDate: string;

  LumSumpDatefrom: string;

  LumSumpDateTo: string;

  LumSumpDaysinPeriod: string;

  amount: string;

  noofContainer: string;

  importPoo: string;

  importPol: string;

  importPod: string;

  importFpod: string;

  departureMode: string;

  blGeneralRemarks: string;

  documents: string[];

  containerType: string;

  itemNo: string;

  subLineNo: string;

  isExport: boolean;

  apiType: string;

  referenceId: string;

  createdOn: string;

  updatedOn: string;

  createdBy: string;

  createdByUID: string;

  updatedBy: string;

  updatedByUID: string;

  indexNo: number;

  blId: string;
}
