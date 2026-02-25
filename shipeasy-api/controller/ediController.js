
const invoiceData = {
  senderId: 'SENDERID',
  receiverId: 'RECEIVERID',
  date: '20210627',
  time: '1234',
  controlNumber: '000000001',
  invoiceNumber: 'INV123456',
  invoiceDate: '20210627',
  poNumber: 'PO123456',
  poDate: '20210620',
  shipTo: {
    name: 'SHIP TO NAME',
    id: '123456',
    address: 'SHIP TO ADDRESS',
    city: 'SHIP TO CITY',
    state: 'SHIP TO STATE',
    zip: 'SHIP TO ZIP',
    country: 'SHIP TO COUNTRY'
  },
  billTo: {
    name: 'BILL TO NAME',
    id: '654321',
    address: 'BILL TO ADDRESS',
    city: 'BILL TO CITY',
    state: 'BILL TO STATE',
    zip: 'BILL TO ZIP',
    country: 'BILL TO COUNTRY'
  },
  terms: {
    termsType: '01',
    discountDueDate: '20210727',
    discountDaysDue: '30',
    netDueDate: '20210727',
    discountAmount: '20210627',
    description: 'NET 30'
  },
  items: [
    {
      quantity: 10,
      unitOfMeasure: 'EA',
      unitPrice: 15.00,
      vendorItemNumber: 'PROD12345',
      buyerPartNumber: '987654321',
      description: 'PRODUCT DESCRIPTION'
    }
  ],
  totalAmount: 15000,
  carrier: 'CARRIER NAME'
};

function createSegment(segment, elements) {
  return segment + '*' + elements.join('*') + '<br>\n';
}

function generateISA(data) {
  return createSegment('ISA', [
    '00', '', '00', '', 'ZZ', data.invoiceFromId.padEnd(15), 'ZZ', data.invoiceToId.padEnd(15),
    data.updatedOn.split("T")[0], data.updatedOn.split("T")[1], 'U', '00401', data.invoiceNo, '0', 'T', '>'
  ]);
}

function generateGS(data) {
  return createSegment('GS', [
    'IN', data.invoiceFromId, data.invoiceToId, data.updatedOn.split("T")[0], data.updatedOn.split("T")[1], '1', 'X', '004010'
  ]);
}

function generateST() {
  return createSegment('ST', ['810', '0001']);
}

function generateBIG(data) {
  return createSegment('BIG', [data.updatedOn.split("T")[0], data.invoiceNo, data.invoice_date, data.invoiceNo]);
}

function generateN1(type, name, id) {
  return createSegment('N1', [type, name, '92', id]);
}

function generateN3(address) {
  return createSegment('N3', [address]);
}

function generateN4(city, state, zip, country) {
  return createSegment('N4', [city, state, zip, country]);
}

function generateITD(terms) {
  return createSegment('ITD', [
    terms.termsType, '3', '', terms.discountDueDate, '', terms.discountDaysDue,
    terms.netDueDate, terms.discountAmount, terms.description
  ]);
}

function generateDTM(date) {
  return createSegment('DTM', ['011', date]);
}

function generateFOB() {
  return createSegment('FOB', ['CC', 'ORIGIN']);
}

function generateIT(index, item) {
  return createSegment(`IT${index + 1}`, [
    '', item.quantity, "QTY", item.totalAmount.toFixed(2),
    '', 'VN', item.costItemId, 'BP', item.costItemId
  ]);
}

function generatePID(description) {
  return createSegment('PID', ['F', '', '', '', description]);
}

function generateTDS(totalAmount) {
  return createSegment('TDS', [totalAmount]);
}

function generateCAD(carrier) {
  return createSegment('CAD', ['', '', '', carrier]);
}

function generateCTT(numberOfItems) {
  return createSegment('CTT', [numberOfItems]);
}

function generateSE(numberOfSegments) {
  return createSegment('SE', [numberOfSegments, '0001']);
}

function generateGE() {
  return createSegment('GE', ['1', '1']);
}

function generateIEA(controlNumber) {
  return createSegment('IEA', ['1', controlNumber]);
}

exports.generateEDI810 = async (invoiceData, consigneeData, shipperData) => {
  let edi = '';
  

  edi += generateISA(invoiceData);
  edi += generateGS(invoiceData);
  edi += generateST();
  edi += generateBIG(invoiceData);
  edi += generateN1('ST', invoiceData.consigneeName, invoiceData.consigneeId);
  edi += generateN3(consigneeData.addressInfo.address);
  edi += generateN4(consigneeData.addressInfo.cityName, consigneeData.addressInfo.stateName, consigneeData.addressInfo.postalCode, consigneeData.addressInfo.countryName);
  edi += generateN1('BT', invoiceData.invoiceToName, invoiceData.invoiceToId);
  edi += generateN3(shipperData.addressInfo.address);
  edi += generateN4(shipperData.addressInfo.cityName, shipperData.addressInfo.stateName, shipperData.addressInfo.postalCode, shipperData.addressInfo.countryName);
  // edi += generateITD(invoiceData.terms);
  edi += generateDTM(invoiceData.invoice_date);
  edi += generateFOB();

  invoiceData.costItems.forEach((item, index) => {
    edi += generateIT(index, item);
    edi += generatePID(item.costItemName);
  });

  edi += generateTDS(invoiceData.invoiceAmount);
  edi += generateCAD(invoiceData.vesselName);
  edi += generateCTT(invoiceData.costItems.length);
  edi += generateSE(18);
  edi += generateGE();
  edi += generateIEA(invoiceData.batchNo);

  return edi;
}









// const fs = require('fs');

// Function to create each EDI segment
function createSegmentSI(segment, elements) {
  return segment + '*' + elements.join('*') + '<br>\n';
}

function generateISA(data) {
  return createSegmentSI('ISA', [
    '00', '', '00', '', 'ZZ', data.tenantId.padEnd(15), 'ZZ', data.orgId.padEnd(15),
    data.createdOn.split("T")[0].replace(/-/g, ''), data.createdOn.split("T")[1].split('.')[0].replace(/:/g, ''),
    'U', '00401', '000000001', '0', 'P', '>'
  ]);
}

function generateGS(data) {
  return createSegmentSI('GS', [
    'SI', data.tenantId, data.orgId,
    data.createdOn.split("T")[0].replace(/-/g, ''), data.createdOn.split("T")[1].split('.')[0].replace(/:/g, ''),
    '1', 'X', '004010'
  ]);
}

function generateST() {
  return createSegmentSI('ST', ['856', '0001']);
}

function generateBSN(data) {
  return createSegmentSI('BSN', [
    '00', data.si.bookingNo, data.siCutOffDate.split('T')[0].replace(/-/g, ''),
    data.siCutOffDate.split('T')[1].split('.')[0].replace(/:/g, '')
  ]);
}

function generateHLShipment() {
  return createSegmentSI('HL', ['1', '', 'S']);
}

function generateMEA(data) {
  return createSegmentSI('MEA', ['PD', 'G', data?.vgm[0]?.vgmReceived?.split('T')[0].replace(/-/g, ''), 'LB']);
}

function generateTD1(data) {
  return createSegmentSI('TD1', ['CTN25', data.vgm.length?.toString()]);
}

function generateTD5(data) {
  return createSegmentSI('TD5', ['B', '2', data.finalVesselName, 'M']);
}

function generateN1(type, name, id) {
  return createSegmentSI('N1', [type, name, '92', id]);
}

function generateN3(address) {
  return createSegmentSI('N3', [address]);
}

function generateN4(city, state, zip, country) {
  return createSegmentSI('N4', [city, state, zip, country]);
}

function generateHLOrder() {
  return createSegmentSI('HL', ['2', '1', 'O']);
}

function generatePRF(data) {
  return createSegmentSI('PRF', [data.si.bookingNo, data.siCutOffDate.split('T')[0].replace(/-/g, '')]);
}

function generateHLItem() {
  return createSegmentSI('HL', ['3', '2', 'I']);
}

function generateLIN(data) {
  return createSegmentSI('LIN', ['', 'VP', data.si.bookingNo, 'BP', data.finalVesselId]);
}

function generateSN1(data) {
  return createSegmentSI('SN1', ['', '10', 'EA']);
}

function generateCTT(data) {
  return createSegmentSI('CTT', [data?.vgm?.length?.toString() || "0"]);
}

function generateSE() {
  return createSegmentSI('SE', ['25', '0001']);
}

function generateGE() {
  return createSegmentSI('GE', ['1', '1']);
}

function generateIEA() {
  return createSegmentSI('IEA', ['1', '000000001']);
}

function generateEDIShippingInstruction(data) {
  let edi = '';

  edi += generateISA(data);
  edi += generateGS(data);
  edi += generateST();
  edi += generateBSN(data);
  edi += generateHLShipment();
  edi += generateMEA(data);
  edi += generateTD1(data);
  edi += generateTD5(data);
  edi += generateN1('SF', data.createdBy, data.createdByUID);
  edi += generateN3(data.portId);
  edi += generateN4(data.portcallId, '', '', '');
  edi += generateN1('ST', data.updatedBy, data.updatedByUID);
  edi += generateN3(data.plannedVesselId);
  edi += generateN4(data.finalVesselName, '', '', '');
  edi += generateHLOrder();
  edi += generatePRF(data);
  edi += generateHLItem();
  edi += generateLIN(data);
  edi += generateSN1(data);
  edi += generateCTT(data);
  edi += generateSE();
  edi += generateGE();
  edi += generateIEA();

  return edi;
}



exports.generateEDI856 = async (shippingData) => {
  return generateEDIShippingInstruction(shippingData);
}

// milstone edi started

// Function to pad strings with spaces
const pad = (str, length) => str.padEnd(length, ' ');

// Function to get current date in YYMMDD format
const getCurrentDate = () => {
  const date = new Date();
  return date.toISOString().slice(2, 10).replace(/-/g, '');
};

// Function to get current time in HHMM format
const getCurrentTime = () => {
  const date = new Date();
  return date.toISOString().slice(11, 16).replace(/:/g, '');
};

// Generate EDI 214 message
exports.generateEDI214 = async (batchData, milestoneData, blData, shipperData, consigneeData) => {
  // const { senderId, receiverId, shipmentId, refNumber, scac, billOfLading, shipper, consignee, milestones } = data;
  const senderId = batchData.enquiryDetails.basicDetails.shipperId
  const receiverId = batchData.enquiryDetails.basicDetails.consigneeId
  
  const shipmentId = batchData.batchId
  const refNumber = batchData.batchNo
  const scac = batchData.jobCode
  const billOfLading = blData?.blId
  const shipper = {
    name : shipperData.name,
    id : shipperData.partymasterId,
    address : shipperData.addressInfo.address,
    city : shipperData.addressInfo.cityName,
    state : shipperData.addressInfo.stateName,
    zip : shipperData.addressInfo.postalCode,
    country : shipperData.addressInfo.countryName,
  }
  const consignee = {
    name : consigneeData.name,
    id : consigneeData.partymasterId,
    address : consigneeData.addressInfo.address,
    city : consigneeData.addressInfo.cityName,
    state : consigneeData.addressInfo.stateName,
    zip : consigneeData.addressInfo.postalCode,
    country : consigneeData.addressInfo.countryName,
  }

  // Header segments
  let ediMessage = (
    `ISA*00*          *00*          *ZZ*${pad(senderId, 15)}*ZZ*${pad(receiverId, 15)}*${getCurrentDate()}*${getCurrentTime()}*^*00501*000000001*0*P*>~\n` +
    `GS*QM*${senderId}*${receiverId}*${getCurrentDate()}*${getCurrentTime()}*1*X*005010~\n` +
    `ST*214*0001~\n` +
    `B10*${shipmentId}*${refNumber}*${scac}*${billOfLading}~\n` +
    `N1*SH*${shipper.name}*1*${shipper.id}~\n` +
    `N3*${shipper.address}~\n` +
    `N4*${shipper.city}*${shipper.state}*${shipper.zip}*${shipper.country}~\n` +
    `N1*CN*${consignee.name}*1*${consignee.id}~\n` +
    `N3*${consignee.address}~\n` +
    `N4*${consignee.city}*${consignee.state}*${consignee.zip}*${consignee.country}~\n`
  );

  // Loop through milestones and add segments for each
  milestoneData.forEach((milestone, index) => {
    ediMessage += (
      `LX*${index + 1}~\n` +
      `AT7*${milestone?.eventTag}*${milestone?.eventTag}*${milestone?.createdOn?.split("T")[0]}*${milestone.createdOn?.split("T")[1]}*${"UTC"}~\n` +
      `MS1*${milestone.location.locationName}*${milestone.location.locationName}*${milestone.location.locationName}*${milestone.location.locationName}~\n` +
      `MS2*${milestone.createdByUID}*${milestone.eventSeq}~\n`
    );
  });

  // Trailer segments
  ediMessage += `SE*${milestoneData.length * 4 + 10}*0001~\n`;
  ediMessage += `GE*1*1~\n`;
  ediMessage += `IEA*1*000000001~`;

  return ediMessage;
};

function formatDate(date) {
  return new Date(date)?.toISOString().split('T')[0].replace(/-/g, '') || "";
}



exports.generateEDI099B = async (data, userData, shipperData, consigneeData) => {
  

  const segments = [];

  // UNB Segment
  segments.push(`UNB+UNOA:1+MAEU:ZZZ+PARTNER:ZZZ+150416:0814+3884'`);

  // UNH Segment
  segments.push(`UNH+${data.blNumber}+IFTMCS:D:93A:UN:2.0'`);

  // BGM Segment
  segments.push(`BGM+770+${data.blNumber}+6+AP'`);

  // FTX Segment
  segments.push(`FTX+AAI+++${data.blGeneralRemarks}'`);

  // RFF Segment
  segments.push(`RFF+BN:${data.blNumber}'`);

  // TDT Segment (20 - main_carriage_transport, )
  segments.push(`TDT+20+${data.blNumber}+1++MAEU:172:182+++9529255::11:${data.vessel}:SG'`);

  // LOC Segment
  segments.push(`LOC+11+${data.loadPlace}:139:6:${data.loadPlaceName}'`);

  // DTM Segment
  segments.push(`DTM+137:${formatDate(data.blDate)}:102'`);

  // NAD Segments
  segments.push(`NAD+CZ+${data.shipperId}:160:87++${shipperData.name}+ROAD:${shipperData.addressInfo.address}:${shipperData.addressInfopostalCode}+${shipperData.addressInfo.cityName}'`);
  segments.push(`NAD+BA+${data.consigneeId}:160:87++${consigneeData.name}+ROAD:${consigneeData.addressInfo.address}:${consigneeData.addressInfopostalCode}+${consigneeData.addressInfo.cityName}'`);


  // CTA Segment
  segments.push(`CTA+CW+${data.createdBy}'`);

  // COM Segment
  segments.push(`COM+EMAIL+${userData.userEmail}:EM'`);

  // GID Segment
  segments.push(`GID+${data.containers.length}+2:CT:67:6:CONTAINERS'`);

  // MEA Segment
  segments.push(`MEA+AAE+G+KGM:${data.grossWeight}'`);

  // DGS Segment
  segments.push(`DGS+IMD+6+1194+20.5:CEL+3'`);

  // CTA Segment
  segments.push(`CTA+CW+${data.createdBy}'`);

  // EQD Segment
  segments.push(`EQD+CN++45G1:102:5+2'`);    

  // TSR Segment (door to door static)
  segments.push(`TSR+27'`);

  // SEL Segment
  // segments.push(`SEL+${data.sealNumber}'`);

  // SGP Segment
  // segments.push(`SGP+1+${data.splitGoods}'`);

  // DOC Segment
  // segments.push(`DOC+740+RCVR:${data.documentReference}::2'`);

  
  // CNT Segment
  // segments.push(`CNT+16:${data.controlTotal}'`);

  // UNT Segment
  segments.push(`UNT+${segments.length}+${data.blNumber}'`);
  
  // UNZ Segment
  segments.push(`UNZ+1+${data.blNumber}'`);

  return segments.join('\n');
}

// Generate VERMAS D16A message
exports.generateVERMAS = async (instructionData, batchData) => {
  // const { senderId, receiverId, messageRefNumber, documentNumber, dateTime, } = data;

  const senderId = batchData.enquiryDetails.basicDetails.shipperId
  const receiverId = batchData.enquiryDetails.basicDetails.consigneeId
  const messageRefNumber = batchData.batchNo
  const documentNumber = batchData.enquiryDetails.basicDetails.shipperId
  const dateTime = batchData.createdOn
  // Header segments
  let ediMessage = (
    `UNB+UNOA:1+${senderId}+${receiverId}+${getCurrentDate()}:${getCurrentTime()}+${messageRefNumber}'\n` +
    `UNH+0001+VERMAS:D:16A:UN'\n` +
    `BGM+270+${documentNumber}+9'\n` +
    `DTM+137:${dateTime}:102'\n` +
    `TSR+20'\n` +
    `NAD+CA+${senderId}::160:ZZZ'\n`
  );

  // Loop through VGM entries and add segments for each
  instructionData.vgm.forEach((vgm, index) => {
    ediMessage += (
      `EQD+CN+${vgm?.containerNo}+22G1:102'\n` +
      `MEA+WT+AAL+${vgm?.weightUnit}:${vgm?.grossWeight}'\n`
    );
  });

  // Trailer segments
  ediMessage += `CNT+16:${instructionData.vgm.length}'\n`;
  ediMessage += `UNT+${6 + instructionData.vgm.length * 2}+0001'\n`;
  ediMessage += `UNZ+1+${messageRefNumber}'`;

  return ediMessage;
};

// booking confirmation
function createSegment(segment, elements) {
  return segment + '+' + elements.join('+') + "'\n";
}

// Function to generate UNB segment
function generateUNB(data) {
  return createSegment('UNB', [
    'UNOA:2',
    data.tenantId,
    data.orgId,
    data.createdOn.split("T")[0].replace(/-/g, ''),
    data.createdOn.split("T")[1].split('.')[0].replace(/:/g, ''),
    '000000001'
  ]);
}

// Function to generate UNH segment
function generateUNH(data) {
  return createSegment('UNH', [
    '1',
    'IFTMBC:D:99B:UN'
  ]);
}

// Function to generate BGM segment
function generateBGM(data) {
  return createSegment('BGM', [
    '335',
    data.instructionId,
    '9'
  ]);
}

// Function to generate DTM segment
function generateDTM(date, qualifier) {
  return createSegment('DTM', [
    qualifier,
    date.split('T')[0].replace(/-/g, ''),
    '102'
  ]);
}

// Function to generate FTX segment
function generateFTX(purpose, reference) {
  return createSegment('FTX', [
    purpose,
    '',
    '',
    '',
    reference
  ]);
}

// Function to generate RFF segment
function generateRFF(referenceType, referenceNumber) {
  return createSegment('RFF', [
    referenceType,
    referenceNumber
  ]);
}

// Function to generate TDT segment
function generateTDT(data) {
  return createSegment('TDT', [
    '20',
    data.finalVesselId,
    '',
    '',
    data.finalVesselName
  ]);
}

// Function to generate NAD segment
function generateNAD(type, id, name, address, city, state, zip, country) {
  return createSegment('NAD', [
    type,
    id,
    name,
    address,
    city,
    state,
    zip,
    country
  ]);
}

// Function to generate LOC segment
function generateLOC(qualifier, location) {
  return createSegment('LOC', [
    qualifier,
    location
  ]);
}

// Function to generate GID segment
function generateGID(data) {
  return createSegment('GID', [
    '',
    data.vgm.length.toString()
  ]);
}

// Function to generate MEA segment
function generateMEA(data) {
  return createSegment('MEA', [
    'AAE',
    'G',
    data?.vgm[0]?.vgmReceived?.split('T')[0]?.replace(/-/g, '')
  ]);
}

// Function to generate UNT segment
function generateUNT() {
  return createSegment('UNT', [
    '15', // Total number of segments
    '1'
  ]);
}

// Function to generate UNZ segment
function generateUNZ() {
  return createSegment('UNZ', [
    '1',
    '000000001'
  ]);
}

// Function to generate the complete EDI message for Booking Confirmation
exports.generateEDIBookingConfirmation = async (batchData, siData, shipperData, consigneeData) => {
  let edi = '';
  let segmentCount = 0;

  edi += `UNB+UNOA:1+${batchData.enquiryDetails.basicDetails.shipperId}+${batchData.enquiryDetails.basicDetails.consigneeId}+${batchData.createdOn.split("T")[0]}+${batchData.createdOn.split("T")[1].replace("Z", "")}+${batchData.batchNo}'\n`; segmentCount++;
  edi += `UNH+${batchData.batchId}+IFTMBC:D:99B:UN'\n`; segmentCount++;
  edi += `BGM+335+${siData?.batchNo}+9'\n`; segmentCount++;
  edi += `DTM+137:${siData?.si.siCutOffDate}:102'\n`; segmentCount++;
  edi += `DTM+132:${siData?.gateCutOff}:102'\n`; segmentCount++;
  edi += `FTX+AAI++${siData?.si.siRemark}'\n`; segmentCount++;
  edi += `RFF+BN:${siData?.si.bookingNo}'\n`; segmentCount++;
  edi += `TDT+20+${siData?.finalVesselId}+1++${siData?.finalVesselName}'\n`; segmentCount++;
  edi += `NAD+CZ+${consigneeData.partymasterId}::91++${consigneeData.name}+${consigneeData.addressInfo.address}+${consigneeData.addressInfo.cityName}+${consigneeData.addressInfo.stateName}+${consigneeData.addressInfo.postalCode}+${consigneeData.addressInfo.countryName}'\n`; segmentCount++;
  edi += `NAD+CZ+${shipperData.partymasterId}::91++${shipperData.name}+${shipperData.addressInfo.address}+${shipperData.addressInfo.cityName}+${shipperData.addressInfo.stateName}+${shipperData.addressInfo.postalCode}+${shipperData.addressInfo.countryName}'\n`; segmentCount++;
  edi += `LOC+9+${batchData.enquiryDetails.routeDetails.loadPortId}'\n`; segmentCount++;
  edi += `LOC+11+${batchData.enquiryDetails.routeDetails.destPortId}'\n`; segmentCount++;
  
  // siData.items.forEach((item, index) => {
  //   edi += `GID+${index + 1}++${item.description}'\n`; segmentCount++;
  //   edi += `MEA+AAE+G+KGM:${item.weight}'\n`; segmentCount++;
  // });

  edi += `UNT+${segmentCount}+${batchData.batchId}'\n`;
  edi += `UNZ+1+${batchData.batchNo}'\n`;

  return edi;
}


exports.generateEDIBookingRequest = async (batchData, siData, shipperData, consigneeData) => {
  let edi = '';
  let segmentCount = 0;

  edi += `UNB+UNOA:1+${batchData.enquiryDetails.basicDetails.shipperId}+${batchData.enquiryDetails.basicDetails.consigneeId}+${batchData.createdOn.split("T")[0]}+${batchData.createdOn.split("T")[1].replace("Z", "")}+${batchData.batchNo}'\n`; segmentCount++;
  edi += `UNH+${batchData.batchId}+IFTMBC:D:99B:UN'\n`; segmentCount++;
  edi += `BGM+335+${siData?.batchNo}+9'\n`; segmentCount++;
  edi += `DTM+137:${siData?.si.siCutOffDate}:102'\n`; segmentCount++;
  edi += `DTM+132:${siData?.gateCutOff}:102'\n`; segmentCount++;
  edi += `FTX+AAI++${siData?.si.siRemark}'\n`; segmentCount++;
  edi += `RFF+BN:${siData?.si.bookingNo}'\n`; segmentCount++;
  edi += `TDT+20+${siData?.finalVesselId}+1++${siData?.finalVesselName}'\n`; segmentCount++;
  edi += `NAD+CZ+${consigneeData.partymasterId}::91++${consigneeData.name}+${consigneeData.addressInfo.address}+${consigneeData.addressInfo.cityName}+${consigneeData.addressInfo.stateName}+${consigneeData.addressInfo.postalCode}+${consigneeData.addressInfo.countryName}'\n`; segmentCount++;
  edi += `NAD+CZ+${shipperData.partymasterId}::91++${shipperData.name}+${shipperData.addressInfo.address}+${shipperData.addressInfo.cityName}+${shipperData.addressInfo.stateName}+${shipperData.addressInfo.postalCode}+${shipperData.addressInfo.countryName}'\n`; segmentCount++;
  edi += `LOC+9+${batchData.enquiryDetails.routeDetails.loadPortId}'\n`; segmentCount++;
  edi += `LOC+11+${batchData.enquiryDetails.routeDetails.destPortId}'\n`; segmentCount++;
  
  // siData.items.forEach((item, index) => {
  //   edi += `GID+${index + 1}++${item.description}'\n`; segmentCount++;
  //   edi += `MEA+AAE+G+KGM:${item.weight}'\n`; segmentCount++;
  // });

  edi += `UNT+${segmentCount}+${batchData.batchId}'\n`;
  edi += `UNZ+1+${batchData.batchNo}'\n`;

  return edi;
}
// Generate EDI Shipping Bill dynamically
exports.generateEDIShippingBillConfirmation = async (billData) => {
  try {
    let edi = `HREC\tZZ\t${billData.basicDetails.shipperName}\tZZ\t${billData.basicDetails.consigneeName}\tP\n`;

    edi += `<TABLE>SB\nF\t${billData.shippingbillNo}\t${billData.createdOn}\n`;
    edi += `CHA\t${billData.basicDetails.CHA}\tSTN\t${billData.basicDetails.stn}\t${billData.basicDetails.adCode}\n`;

    edi += `<TABLE>ITEM\n`;
    edi += `Port:\t${billData.shipmentDetails.portName}\tCountry:\t${billData.shipmentDetails.contryName}\n`;
    edi += `Gross Weight:\t${billData.shipmentDetails.grossWeight}\tPackages:\t${billData.shipmentDetails.packages}\n`;

    billData.product.forEach((product, index) => {
      edi += `<TABLE>ITEM\n`;
      edi += `Item ${index + 1}\t${product.description}\tQuantity: ${product.quantity}\tRate: ${product.rate}\n`;
      edi += `HSCD: ${product.HSCD}\tFOB: ${product.fOBINR}\tPMV: ${product.PMV}\n`;
    });

    edi += `<TABLE>INVOICE\n`;
    edi += `Invoice No:\t${billData.basicDetails.invoiceNo}\tFOB Value:\t${billData.basicDetails.fOBValue}\n`;
    edi += `IGST Amount:\t${billData.basicDetails.IGSTAmt}\tDBK Amount:\t${billData.basicDetails.DBKAmt}\n`;

    billData.supportingDocuments.forEach((doc, index) => {
      edi += `<TABLE>Supportingdocs\n`;
      edi += `Document ${index + 1}\t${doc.documentName}\tID:\t${doc.documentId}\n`;
    });

    billData.containerItems.forEach((container, index) => {
      edi += `<TABLE>CONTAINER\n`;
      edi += `Container ${index + 1}\t${container.code}\tDescription:\t${container.description}\n`;
    });

    edi += `<END-SB>\nTREC\t${billData.shippingbillNo}\n`;
    
    return edi;
  } catch (error) {
    console.error('Error generating EDI:', error);
  }
}