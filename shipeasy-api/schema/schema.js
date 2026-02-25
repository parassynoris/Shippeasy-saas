const mongoose = require('mongoose');
const objecdiff = require('objecdiff');
const requestContext = require('../service/requestContext')

const schemas = {
    "quotation": {
        shipperId: {
            type: String
        },
        enquiryNo: {
            type: String
        },
        enquiryStatus: {
            type: String
        },
        estimate: {
            maxPrice: { type: Number },
            minPrice: { type: Number },
            quoteAmount: { type: Number }
        },
        branchStateCode: {
            type: String
        },
        isExport: {
            type: Boolean
        },
        flightId: {
            type: String
        },
        vehicleId: {
            type: String
        },
        flightNo: {
            type: String
        },
        vehicleNo: {
            type: String
        },
        agentadviceId: {
            type: String
        },
        agentadviceNo: {
            type: String
        },
        isRequotation: {
            type: Boolean
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        totalBuy: {
            type: Number
        },
        totalSell: {
            type: Number
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        quotationId: {
            type: String,
            required: true
        },
        branchId: {
            type: String,
        },
        jobCode: {
            type: String,
        },
        branchName: {
            type: String,
        },
        tenantId: {
            type: String,
        },
        validFrom: {
            type: String,
        },
        quotationNo: {
            type: String,
        },
        validTo: {
            type: String,
        },
        currency: {
            type: String,
        },
        currencyShortName: {
            type: String,
        },
        exRate: {
            type: Number,
        },
        carrierId: {
            type: String,
        },
        carrierName: {
            type: String,
        },
        carrierReceiptId: {
            type: String,
        },
        carrierReceiptName: {
            type: String,
        },
        etd: {
            type: String,
        },
        loadPortId: {
            type: String,
        },
        loadPortName: {
            type: String,
        },
        dischargePortId: {
            type: String,
        },
        dischargePortName: {
            type: String,
        },
        eta: {
            type: String,
        },
        vesselId: {
            type: String,
        },
        vesselName: {
            type: String,
        },
        voyageNumber: {
            type: String,
        },
        carrierDeliveryId: {
            type: String,
        },
        carrierDeliveryName: {
            type: String,
        },
        destPortFreeDays: {
            type: Number,
        },
        originFreeDays: {
            type: Number,
        },
        destFreeDays: {
            type: Number,
        },
        enquiryNo: {
            type: String,
        },
        enquiryTypeName: {
            type: String,
        },
        shipperName: {
            type: String,
        },
        totalBuyTax: {
            type: Number,
        },
        totalSellTax: {
            type: Number,
        },
        remarks: {
            type: String,
        },
        quoteStatus: {
            type: String,
        },
        status: {
            type: Boolean,
        },
        enquiryId: {
            type: String,
        },
        orgId: {
            type: String
        },
    },
    "comment": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        prospectId: { type: String },
        commentsby: { type: String },
        commentText: { type: String },
        instructionsFrom: { type: String },
        instructionsToId: { type: String },
        instructionsTo: { type: String },
        instructionsToEmail: { type: String },
        instructionsDescription: { type: String },
        commentString: { type: String },
        contractId: { type: String },
        commentId: { type: String },
        clauseId: { type: String },
        batchId: { type: String },
        enquiryId: { type: String },
        processPoint: { type: String },
        processPointName: { type: String },
        departmentId: { type: String },
        departmentName: { type: String },

        branchHead: { type: String },
        reply: [
            {
                commentsBy: { type: String },
                commentText: { type: String },
                commentString: { type: String },
            },
        ],
        remarkStatusId: { type: String },
        remarkStatusName: { type: String },
        status: { type: Boolean, required: true },
        orgId: { type: String, required: true },
        createdBy: { type: String, required: true },
        createdOn: { type: String, required: true },
        updatedBy: { type: String },
        updatedOn: { type: String },
    },
    "enquiryitem": {
        agentadviceId: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        enquiryitemId: { type: String },
        quotationId: { type: String },
        enqDate: { type: String },
        collectPort: { type: String },
        costitemGroup: { type: String },
        stcQuotationNo: { type: String },
        enqType: { type: String },
        costItemId: { type: String },
        accountBaseCode: { type: String },
        costItemName: { type: String },
        costHeadId: { type: String },
        costHeadName: { type: String },
        exchangeRate: { type: String },
        currency: { type: String },
        amount: { type: String },
        baseAmount: { type: String },
        basic: { type: String },
        basicId: { type: String },
        tenantMargin: { type: Number },
        moveNumber: { type: String },
        containerType: { type: String },
        enquiryId: { type: String },
        enquiryitemId: { type: String },
        isInvoiceCreated: { type: Boolean },
        isPrincipleCreated: { type: Boolean },
        isReceiptCreated: { type: Boolean },
        buyEstimates: {
            currencyId: { type: String },
            currency: { type: String },
            exChangeRate: { type: Number },
            isReceiptCreated: { type: Boolean },
            rate: { type: Number },
            amount: { type: Number },
            taxableAmount: { type: Number },
            totalAmount: { type: Number },
            terms: { type: String },
            supplier: { type: String },
            igst: { type: Number },
            cgst: { type: Number },
            sgst: { type: Number },
        },
        vesselName: { type: String },
        voyageName: { type: String },
        selEstimates: {
            currencyId: { type: String },
            currency: { type: String },
            exChangeRate: { type: Number },
            rate: { type: Number },
            amount: { type: Number },
            taxableAmount: { type: Number },
            totalAmount: { type: Number },
            currencySellName: { type: String },
            isReceiptCreated: { type: Boolean },
            terms: { type: String },
            remarks: { type: String },
            igst: { type: Number },
            cgst: { type: Number },
            sgst: { type: Number },
        },
        tax: [
            {
                taxAmount: { type: Number },
                taxRate: { type: Number },
            }
        ],
        quantity: { type: Number },
        rate: { type: Number },
        stcAmount: { type: Number },
        jmbAmount: { type: Number },
        payableAt: { type: String },
        gst: { type: Number },
        gstType: { type: String },
        totalAmount: { type: Number },
        chargeTerm: { type: String },
        remarks: { type: String },
        containerNumber: [],
        shippingLine: { type: String },
        taxApplicability: { type: String },
        hsnCode: { type: String },
        isEnquiryCharge: { type: Boolean },
        orgId: { type: String },
    },
    "enquiry": {
        stuffing_location: {
            stuffing_location_Type: { type: String },
            billingBranchStuffingId: { type: String },
            stuffingLocationId: { type: String },
            stuffingLocationIdName: { type: String },
            billingBranchStuffingName: { type: String },
            Stuffing_shipper_address: { type: String },
        },
        plannedVesselforHopId: { type: String },
        plannedVesselforHopName: { type: String },
        voyageNumberforHop: { type: String },
        transhipmentHops: [
            {
                load_port: { type: String },
                etd: { type: String },
                eta: { type: String },
                plannedVessel: { type: String },
                voyageNumber: { type: String },
                load_portName: { type: String },
                plannedVesselName: { type: String },
            }
        ],
        quotationCreateStatus: { type: Boolean },
        customerId: { type: String },
        userId: { type: String },
        customDetails: {
            customDestinationLocation: { type: String },
            customDestinationLocationName: { type: String },
            customOriginLocationName: { type: String },
            customOriginLocation: { type: String },
            customDestination: { type: Boolean },
            customOrigin: { type: Boolean },
            destinationDeliveryAddress: { type: String },
            destinationOption: { type: String },
            destinationfactory: { type: Boolean },
            originOption: { type: String },
            originPickupAddress: { type: String },
            originfactory: { type: Boolean },
            transportDestination: { type: Boolean },
            transportOrigin: { type: Boolean },
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        orgId: {
            type: String,
        },
        tenantId: { type: String, required: true },

        enquiryId: { type: String, required: true },
        enquiryNo: { type: String, required: true },
        cloneEnquiryNo: { type: String },
        cloneEnquiryId: { type: String },
        agentadviceId: { type: String },
        grossWeightContainer: { type: String },
        cargoDetail: [
            {
                productId: { type: String },
                productName: { type: String },
                properShippingName: { type: String },
                technicalName: { type: String },
                commodityType: { type: String },
                commodityTypeName: { type: String },
                imcoClass: { type: String },
                unNo: { type: String },
                hsCode: { type: String },
                packingGroup: { type: String },
                flashPoint: { type: String },
                marinePollutionId: { type: String },
                unit: { type: String },
                grossWeight: { type: String },
                cargoReadyDate: { type: String },
                targetDeliveryDate: { type: String },
                Density: { type: String },
            }
        ],
        basicDetails: {
            billingPartyId: { type: String },
            billingPartyName: { type: String },
            bookingPartyCurrency: { type: String },
            importShipmentTypeId: { type: String },
            importShipmentTypeName: { type: String },
            loadType: { type: String },
            loadTypeId: { type: String },
            agentAdviceDate: { type: String },
            enquiryDate: { type: String },
            agentAdviceString: { type: String },
            enquiryString: { type: String },
            enquiryTypeId: { type: String },
            enquiryTypeName: { type: String },
            billingBranch: { type: String },
            billingStateCode: { type: String },
            billingCountry: { type: String },
            stcQuotationNo: { type: Number },
            bookingPartyId: { type: String },
            bookingPartyName: { type: String },
            invoicingPartyId: { type: String },
            invoicingPartyName: { type: String },
            forwarderId: { type: String },
            forwarderName: { type: String },
            consigneeId: { type: String },
            consigneeName: { type: String },
            opsCoordinatorId: { type: String },
            salesPersonId: { type: String },
            shipperId: { type: String },
            shipperName: { type: String },
            shippingTermId: { type: String },
            shippingTermName: { type: String },
            ShipmentTypeId: { type: String },
            shipperCurrency: { type: String },
            ShipmentTypeName: { type: String },
            batchType: { type: String },
            moveTypeId: { type: String },
            moveTypeName: { type: String },
            tankTypeId: { type: String },
            tankTypeName: { type: String },
            tankStatusId: { type: String },
            tankStatusName: { type: String },
            incoTermId: { type: String },
            incoTermName: { type: String },
            agentAdviceFrom: { type: String },
            agentAdviceTo: { type: String },
            poString: { type: String },
            poDate: { type: String },
            cargoTypeId: { type: String },
            notifyPartyId: { type: String },
            moveNo: { type: String },
            notifyPartyName: { type: String },
            enquiryValidFormDate: { type: String },
            enquiryValidToDate: { type: String },
            enquiryValidFormString: { type: String },
            enquiryValidToString: { type: String },
            enquiryValid: { type: Boolean },
        },
        carrierBookingStatus: { type: String },
        productDetails: {
            biddingDueDate: { type: String },
            cargoReadyDate: { type: String },
            targetDeliveryDate: { type: String },
            productId: { type: String },
            productName: { type: String },
            properShippingName: { type: String, },
            technicalName: { type: String, },
            imcoClass: { type: String, },
            unNo: { type: String, },
            hsCode: { type: String, },
            msdsDoc: { type: String, },
            freightAt: { type: String, },
            contractName: { type: String },
            contract: { type: String },
            packingGroup: { type: String },
            flashPoint: { type: String },
            marinePollutionId: { type: String },
            Density: { type: String },
        },
        routeDetails: {
            freeDaysTime: { type: Array },
            deliveryOfPlaceId: { type: String, },
            deliveryOfPlace: { type: String, },
            loadPlaceName: { type: String, },
            etd: { type: String, },
            eta: { type: String, },
            transportPreCarriage: { type: String, },
            transportOnCarriage: { type: String, },
            loadPlace: { type: String, },
            preCarriageId: { type: String, },
            preCarriageName: { type: String, },
            loadPortId: { type: String, },
            loadPortName: { type: String, },
            location: { type: String, },
            locationName: { type: String, },
            destPortId: { type: String, },
            destPortName: { type: String, },
            onCarriageId: { type: String },
            onCarriageName: { type: String },
            fpodId: { type: String, },
            fpodName: { type: String, },
            haulageTypeId: { type: String, },
            wagonNo: { type: String },
            vehicleNo: { type: String },
            destHaulageId: { type: String },
            freightTerms: { type: String },
            freightTermsName: { type: String },
            shippingLineId: { type: String },
            shippingLineName: { type: String },
            shippingLineValidFrom: { type: String },
            shippingLineValidTo: { type: String },
            shippingLineValid: { type: Boolean },
            tsPortId: { type: String },
            lineVoyageNo: { type: String },
            destinationCustomClearance: { type: String },
            originCustomClearance: { type: String }
        },
        detentionDetails: {
            polFreeDay: { type: Number },
            polDetentionAmount: { type: Number },
            polDetentionCurrencyId: { type: String },
            polDetentionCurrencyName: { type: String },
            podFreeDay: { type: String },
            podDetentionAmount: { type: Number },
            podDetentionCurrencyId: { type: String },
            podDetentionCurrencyName: { type: String },
        },
        charges: [
            {
                conatiner: { type: String },
                rates: [
                    {
                        name: { type: String },
                        price: { type: Number },
                        qty: { type: Number },
                        id: { type: String }
                    }
                ]
            }
        ],
        looseCargoDetails: {
            grossWeight: { type: String },
            grossVolume: { type: String },
            cargos: [
                {
                    firstName: { type: String },
                    lastName: { type: String },
                    pkgname: { type: String },
                    units: { type: Number },
                    Pallettype: { type: String },
                    lengthp: { type: String },
                    lengthb: { type: Number },
                    Weightb: { type: Number },
                    heightb: { type: Number },
                    DimensionUnit: { type: String },
                    Weightbox: { type: Number },
                    Unit1: { type: String },
                    volumebs: { type: String },
                    volumeb: { type: Number },
                    Weightp: { type: String },
                    Weightp: { type: String },
                    DimensionUnitp: { type: String },
                    Weightps: { type: String },
                    weightpsCalculatedplt: { type: String },
                    weightpsCalculatedbox: { type: String },
                    weightpsCalculatedother: { type: String },
                    Unit1p: { type: String },
                    volumep: { type: Number },
                    volumeps: { type: String },
                    heightselected: { type: String },
                    selectedh: { type: String },
                    Weightselected: { type: String },
                    selectedw: { type: String },
                    volumeselect: { type: Number },
                    volumebselecteds: { type: String },
                }
            ]
        },
        containerType: { type: String },
        containerSize: { type: String },
        backupShippingLine: { type: String },
        backupShippingLineName: { type: String },
        remarksList: [],
        remarks: { type: String },
        enquiryStatus: { type: String, required: true },
        enquiryStatusCustomer: { type: String },
        status: { type: Boolean, required: true },
        estimate: {
            cost: { type: Number },
            minPrice: { type: Number },
            maxPrice: { type: Number },
            finalPrice: { type: Number },
            currency: { type: String }
        },
        containersDetails: [
            {
                typeOfWay: { type: String },
                truckType: { type: String },
                wagonType: { type: String },
                unitName: { type: String },
                uldcontainerType: { type: String },
                containerType: { type: String },
                grossWeightContainer: { type: Number },
                noOfContainer: { type: Number },
                unit: { type: String }
            }
        ],
        transportDetails: {
            preCarriage: { type: Boolean },
            onCarriage: { type: Boolean },
            origin: [
                {
                    transpoterType: { type: String },
                    locationType: { type: String },
                    location: { type: String },
                    locationName: { type: String },
                    etd: { type: String },
                    eta: { type: String },
                    address: { type: String },
                    addressText: { type: String },
                    addressId: { type: String },
                    branch: { type: String },
                    transit: { type: String },
                    carrier: { type: String },
                    carrierList: [
                        {
                            shippinglineId: { type: String },
                            name: { type: String },
                        }
                    ],
                    carrierName: { type: String },
                }
            ],
            destination: [
                {
                    locationType: { type: String },
                    location: { type: String },
                    locationName: { type: String },
                    etd: { type: String },
                    eta: { type: String },
                    address: { type: String },
                    addressText: { type: String },
                    addressId: { type: String },
                    branch: { type: String },
                    transit: { type: String },
                    carrier: { type: String },
                    carrierList: [
                        {
                            shippinglineId: { type: String },
                            name: { type: String },
                        }
                    ],
                    carrierName: { type: String },
                }
            ]
        },
        insurance: {
            cargo: { type: Boolean },
            emptyContainer: { type: Boolean },
            palletization: { type: Boolean },
            fumigation: { type: Boolean },
            warehousing: { type: Boolean },
        }
    },
    "transaction": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        transactionId: {
            type: String,
        },
        orgId: {
            type: String,
        },
        tenantId: { type: String, required: true },
        batchId: { type: String, required: true },
        isExport: { type: Boolean, required: true },
        batchType: { type: String, required: true },
        batchString: { type: String, required: true },
        shippingAgentId: { type: String, required: true },
        shippingAgentName: { type: String, required: true },
        podId: { type: String, required: true },
        podName: { type: String, required: true },
        fpodId: { type: String, required: true },
        eta: { type: String, required: true },
        ata: { type: String, required: true },
        igmString: { type: String, required: true },
        igmNo: { type: String, required: true },
        itemNo: { type: String, required: true },
        igmFillingStatus: { type: String, required: true },
        freightTerms: { type: String, required: true },
        batchNo: { type: String, required: true },
        container: { type: Array, required: true },
        uniqueRefNo: { type: String, required: true },
        enquiryId: { type: String, required: true },
        enquiryNo: { type: String, required: true },
        shipperId: { type: String, required: true },
        shipperName: { type: String, required: true },
        polFreeDay: { type: Number, required: true },
        polDetentionAmount: { type: String, required: true },
        cargoType: { type: String, required: true },
        freightTermId: { type: String, required: true },
        loadPlaceId: { type: String, required: true },
        loadPlaceName: { type: String, required: true },
        state: { type: String, required: true },
        polDetentionCurrencyId: { type: String, required: true },
        polDetentionCurrencyName: { type: String, required: true },
        podFreeDay: { type: Number, required: true },
        podDetentionAmount: { type: String, required: true },
        podDetentionCurrencyId: { type: String, required: true },
        podDetentionCurrencyName: { type: String, required: true },
        fpodFreeDay: { type: String, required: true },
        fpodDetentionAmount: { type: String, required: true },
        fpodDetentionCurrencyId: { type: String, required: true },
        fpodDetentionCurrencyName: { type: String, required: true },
        productId: { type: String, required: true },
        productName: { type: String, required: true },
        noaConsignee: { type: String, required: true },
        consigneeId: { type: String, required: true },
        consigneeName: { type: String, required: true },
        opsCoordinatorId: { type: String, required: true },
        opsCoordinatorName: { type: String, required: true },
        incoTermId: { type: String, required: true },
        incoTermName: { type: String, required: true },
        shippingTermId: { type: String, required: true },
        shippingTermName: { type: String, required: true },
        tankTypeId: { type: String, required: true },
        tankTypeName: { type: String, required: true },
        shippingLineId: { type: String, required: true },
        shippingLineName: { type: String, required: true },
        finalShippingLineId: { type: String, required: true },
        finalShippingLineName: { type: String, required: true },
        shippingLineId2: { type: String, required: true },
        shippingLineName2: { type: String, required: true },
        forwarderId: { type: String, required: true },
        forwarderName: { type: String, required: true },
        bookingString: { type: String, required: true },
        salesPersonId: { type: String, required: true },
        salesPersonName: { type: String, required: true },
        moveTypeId: { type: String, required: true },
        moveTypeName: { type: String, required: true },
        bookingPartyId: { type: String, required: true },
        bookingPartyName: { type: String, required: true },
        invoicingPartyId: { type: String, required: true },
        invoicingPartyName: { type: String, required: true },
        notifyPartyId: { type: String, required: true },
        notifyPartyName: { type: String, required: true },
        stcQuotationNo: { type: Number, required: true },
        poNo: { type: String, required: true },
        poString: { type: String, required: true },
        moveNo: { type: String, required: true },
        unNo: { type: String, required: true },
        plannedVesselId: { type: String, required: true },
        plannedVoyageName: { type: String, required: true },
        plannedVoyageId: { type: String, required: true },
        backupVesselId: { type: String, required: true },
        backupVesselName: { type: String, required: true },
        backupVoyageId: { type: String, required: true },
        backupVoyageName: { type: String, required: true },
        remarks: [
            {
                remarks: { type: String, required: true },
            },
        ],
        finalVesselId: { type: String, required: true },
        finalVoyageId: { type: String, required: true },
        finalVoyageName: { type: String, required: true },
        lineVoyageNo: { type: String, required: true },
        status: { type: Boolean, required: true },
        siUpload: { type: String, required: true },
        siUploadUrl: { type: String, required: true },
        bookingUpload: { type: String, required: true },
        bookingUploadUrl: { type: String, required: true },
        enquiryData: {
            shipperName: { type: String, required: true },
            container_type: { type: String, required: true },
            container_size: { type: String, required: true },
            preCarriageId: { type: String, required: true },
            loadPlace: { type: String, required: true },
            loadPlaceName: { type: String, required: true },
            state: { type: String, required: true },
            forwarderName: { type: String, required: true },
            forwarderId: { type: String, required: true },
            destPortId: { type: String, required: true },
            destPortName: { type: String, required: true },
            loadPortId: { type: String, required: true },
            loadPortName: { type: String, required: true },
            tsPortId: { type: String, required: true },
            onCarriageId: { type: String, required: true },
            shippingLineValidFrom: { type: String, required: true },
            shippingLineValidTo: { type: String, required: true },
            shippingLine: { type: String, required: true },
            shippingLineId: { type: String, required: true },
            fpodId: { type: String, required: true },
            fpodName: { type: String, required: true },
            tankStatusId: { type: String, required: true },
            tankStatusName: { type: String, required: true },
            tankTypeId: { type: String, required: true },
            tankTypeName: { type: String, required: true },
            imcoType: { type: String, required: true },
        },
        cfsLocation: { type: String, required: true },
        location: { type: String, required: true },
        containerType: { type: String, required: true },
        containerTypeId: { type: String, required: true },
        chaPartyName: { type: String, required: true },
        chaPartyId: { type: String, required: true },
        routeDetails: { type: Object, required: false }
    },
    "containermaster": {
        availableVolume: { type: String },
        isAssigned: { type: Boolean },
        isSelected: { type: Boolean },
        volume: { type: Number },
        date: { type: String },
        dateOfManufacture: { type: String },
        exitOffHireDate: { type: String },
        onHireDate: { type: String },
        yard: { type: String },
        yardNamId: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        containermasterId: { type: String },
        baffles: { type: Boolean },
        cargoNo: { type: String },
        cargoTypeName: { type: String },
        containerNo: { type: String, required: true },
        containerOperator: { type: String },
        containerSize: { type: String },
        containerType: { type: String, required: true },
        containerTypeId: { type: String },
        createdBy: { type: String },
        createdOn: { type: String },
        StringOfManufacture: { type: String },
        dropLocation: { type: String },
        exitOffHireString: { type: String },
        loadCapacity: { type: String },
        maxGrossWeight: { type: String },
        maxPayload: { type: String },

        onHireString: { type: String },
        oneWay: { type: Boolean },
        orgId: { type: String },
        pickLocation: { type: String },
        remarks: { type: String },
        soc: { type: Boolean },
        status: { type: Boolean },
        tankCapacity: { type: String },
        tankStatus: { type: String },
        tankStatusId: { type: String },
        tankType: { type: String },
        tarWeight: { type: String },
        tenantId: { type: String },
        updatedBy: { type: String },
        updatedOn: { type: String },
        containerStatus: { type: String },
        containerStatusId: { type: Boolean },
        customerId: { type: String },
        customerName: { type: String },
        String: { type: String },
        yardName: { type: String },
        yardNameId: { type: String },
        previousStatus: { type: String },
        previousYardName: { type: String },
        blno: { type: String },
        bookingref: { type: String },
        consignee: { type: String },
        customCode: { type: String },
        doString: { type: String },
        dono: { type: String },
        principal: { type: String },
        shipper: { type: String },
        shippingBill: { type: String },
    },
    "container": {
        doDate: { type: String },
        cfsInName: { type: String },
        customsCheck: { type: String },
        customsCheckLocation: { type: String },
        grossWeight: { type: String },
        statusFlag: { type: String },
        sbDate: { type: String },
        unitGross: { type: String },
        shipmentNumber: { type: String },
        package: { type: String },
        packageType: { type: String },
        packageTypeName: { type: String },
        arrivalDate: { type: String },
        dischargeDate: { type: String },
        evgmDate: { type: String },
        blDate: { type: String },
        deliveryDate: { type: String },
        depoIn: { type: String },
        depoInName: { type: String },
        depotDate: { type: String },
        depotDateName: { type: String },
        cbm: { type: String },
        transportId: { type: String },
        isSobEmail: { type: Boolean },
        isNewConatiner: { type: Boolean },
        orgId: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        sobDate: { type: String },
        tenantId: { type: String },
        containerId: { type: String },
        batchId: { type: String, required: true },
        batchNo: { type: String },
        tankStatusName: { type: String },
        tankStatusId: { type: String },
        voyageNo: { type: String },
        shippingLineId: { type: String },
        shippingLineName: { type: String },
        mastercontainerId: { type: String },
        containerNumber: { type: String },
        containerTypeId: { type: String },
        containerDescription: { type: String },
        containerTypeName: { type: String },
        containerType: { type: String },
        containerSize: { type: String },
        containerHeight: { type: String },
        imoType: { type: String },
        imoTypeId: { type: String },
        netWeight: { type: String },
        grossWeight: { type: Number },
        isoContainerCode: { type: String },
        tareWeight: { type: String },
        sealNo: { type: String },
        unit: { type: String },
        rfidNo: { type: String },
        cargoType: { type: String },
        cargoTypeId: { type: String },
        evgmNumber: { type: String },
        evgmString: { type: String },
        blNumber: { type: String },
        blString: { type: String },
        shippingBillNumber: { type: String },
        sbNo: { type: String },
        sbString: { type: String },
        bondNumber: { type: String },
        igmNumber: { type: String },
        statusFlagId: { type: String },
        status: { type: Boolean },
        depotOut: { type: String },
        depotString: { type: String },
        depotStringName: { type: String },
        icdIn: { type: String },
        icdInName: { type: String },
        icdOut: { type: String },
        icdOutName: { type: String },
        factoryIn: { type: String },
        factoryInName: { type: String },
        factoryOut: { type: String },
        factoryOutName: { type: String },
        terminalIn: { type: String },
        terminalInName: { type: String },
        terminalOut: { type: String },
        terminalOutName: { type: String },
        mtyValidity: { type: String },
        mtyReturn: { type: String },
        cfsIn: { type: String },
        cfsOut: { type: String },
        cfsOutName: { type: String },
        railOut: { type: String },
        dischargeString: { type: String },
        reject: { type: String },
        rejectName: { type: String },
        sobString: { type: String },
        arrivalString: { type: String },
        deliveryString: { type: String },
        override_orgId: { type: String },
        override_tId: { type: Boolean },
        containerInUse: { type: Boolean },
        isExport: { type: Boolean },
        consolidationBookingId: { type: String },
        consolidationbookingNo: { type: String },
        vesselName: { type: String },
        containerStatus: { type: String },
        batchwiseGrouping: [
            {
                batchId: { type: String },
                batchNo: { type: String }
            }
        ]
    },
    "containerevent": {
        orgId: { type: String },
        containerNumber: { type: String },
        batchId: { type: String },
        containereventId: { type: String },
        serialno: { type: Number },
        eventname: { type: String },
        currentlocation: { type: String },
        division: { type: String },
        timestamptimezone: { type: String },
        timezoneabvr: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        containernumber: { type: String },
        timeinms: { type: Number },
        transportmode: { type: String },
        type: { type: String },
        isempty: { type: String },
        createdOn: {
            type: String
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        }
    },
    "instruction": {
        backupVesselName: { type: String },
        flightId: { type: String },
        flightNo: { type: String },
        vehicleNo: { type: String },
        mblDraft: {
            approvedByCustomer: { type: Boolean },
            firstAttachment: { type: String },
            firstPrintAttachmentName: { type: String },
            firstPrintEmailId: { type: String },
            firstPrintReceived: { type: String },
            firstPrintRemark: { type: String },
            rejectByCustomer: { type: Boolean },
            updatedField: { type: String },
        },
        mblOriginal: {
            finalAttachment: { type: String },
            finalAttachmentName: { type: String },
            finalPrintEmailId: { type: String },
            finalPrintReceived: { type: String },
            finalPrintRemark: { type: String },
            updatedField: { type: String },
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        instructionId: {
            type: String
        },
        tenantId: { type: String },
        batchId: { type: String },
        instrcutionType: { type: String },
        instrcutions: { type: String },
        portId: { type: String },
        portcallId: { type: String },
        plannedVesselId: { type: String },
        backupVesselId: { type: String },
        finalVesselId: { type: String },
        finalVesselName: { type: String },
        siCutOffString: { type: String },
        siCutOffDate: { type: String, required: true },
        si: {
            bookingNumber: { type: String },
            updateField: { type: String },
            updateValue: { type: String },
            siCutOffDate: { type: String },
            gateCutOff: { type: String },
            docCutOff: { type: String },
            bookingNo: { type: String, required: true },
            cutOffString: { type: String },
            bookingConfirmed: { type: Boolean },
            siAttachment: { type: String },
            siAttachmentName: { type: String },
            siRemark: { type: String },
            siMail: { type: String },
            filedString: { type: String },
            filedAttachment: { type: String },
            filedAttachmentName: { type: String },
            filedRemark: { type: String },
            siRevised: { type: Array },
            bookingCancel: { type: Boolean },
            filedDate: { type: String },
            instruction: { type: String },
        },
        vgm: { type: Array, required: true },
        dg: {
            doDate: { type: String },
            receivedDate: { type: String },
            containerNo: { type: String },
            receivedString: { type: String },
            remark: { type: String },
            deliveryOrderNo: { type: String },
            doString: { type: String },
            emailId: { type: String },
            dgAttachment: { type: String },
            dgAttachmentName: { type: String },
        },
        masterbl: {
            firstPrintReceived: { type: String },
            firstPrintRemark: { type: String },
            firstPrintEmailId: { type: String },
            finalPrintReceived: { type: String },
            finalPrintRemark: { type: String },
            finalPrintEmailId: { type: String },
            firstAttachment: { type: String },
            finalAttachment: { type: String },
        },
        isApproved: { type: String },
        documents: { type: Array },
        status: { type: Boolean, required: true },
        remark: { type: String },
        bookingCancelArray: { type: Array },
    },
    "location": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        locationId: {
            type: String
        },
        locationName: { type: String, required: true },
        portType: { type: String },
        country: { type: String, required: true },
        state: { type: String, required: true },
        masterType: { type: String },
        agentBranch: { type: String },
        CFS: { type: Boolean },
        ICD: { type: Boolean },
        Yard: { type: Boolean },
        name: { type: String },
        code: { type: String },
        portName: { type: String },
        terminal: { type: String },
        EDICode: { type: String },
        DOaddress: { type: String },
        address: { type: String },
        contactPerson: { type: String },
        email: { type: String },
        primaryCountryCode: { type: String },
        primaryNo: { type: String },
        DOCode: { type: String },
        bondNo: { type: String },
        creditDays: { type: String },
        lineReference: { type: Boolean },
        countryISOCode: { type: String, required: true },
        stateId: { type: String, required: true },
        portId: { type: String },
        status: { type: Boolean, required: true },

        tenantId: { type: String, required: true },
        agentBranchId: { type: String },
    },
    "voyage": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        voyageId: { type: String },

        vesselId: { type: String, required: true },
        vesselName: { type: String, required: true },
        portId: { type: String, required: true },
        portName: { type: String, required: true },
        voyageNumber: { type: String },
        terminal_name: { type: String },
        voyageStartString: { type: String },
        voyageEndString: { type: String },
        ata: { type: String },
        atd: { type: String },
        pc_String: { type: String },
        siCutOffString: { type: String },
        rotation: { type: String },
        viaNo: { type: String },
        igmNo: { type: String },
        igmString: { type: String },
        egmNo: { type: String },
        egmString: { type: String },
        status: { type: Boolean, required: true },
        orgId: { type: String, required: true },
        tenantId: { type: String, required: true },
        isActive: { type: Boolean, required: true },
        isVoyageImport: { type: Boolean, required: true },
        voyage: [{
            shipping_line: { type: String, required: true },
            voyage_number: { type: String, required: true },
            exchageRate: { type: String },
            currency: { type: String },
        }],
    },
    "port": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        portId: { type: String },
        tenantId: { type: String, required: true },
        isPort: { type: Boolean, required: true },

        country: {
            countryId: { type: String, required: true },
            countryName: { type: String, required: true },
        },
        portDetails: {
            isIcd: { type: Boolean, required: true },
            isSez: { type: Boolean, required: true },
            financeSECname: { type: String },
            portName: { type: String, required: true },
            description: { type: String, required: true },
            CustEDICode: { type: String },
            Sectorname: { type: String },
            Subsectorname: { type: String },
            company: { type: String, required: true },
            canalDirection: { type: String, required: true },
            agentBranchId: { type: String },
            agentBranch: { type: String },
        },
        terminals: [{
            name: { type: String, required: true },
            code: { type: String, required: true },
            eidCode: { type: String, required: true },
            berths: [{
                name: { type: String, required: true },
                code: { type: String, required: true },
                eidCode: { type: String, required: true },
            }],
        }],
        status: { type: Boolean, required: true },
    },
    "product": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        productId: { type: String },
        productName: { type: String, required: true },
        productType: { type: String, required: true },
        imcoClass: { type: String, },
        hazSubclass: { type: String, },
        imdgPage: { type: String, },
        unNumber: { type: String, },
        densityGravity: { type: String, },
        flashPoint: { type: String, },
        psn: { type: String, },
        technicalName: { type: String, },
        packingGroup: { type: String, },
        subRisk: { type: String, },
        marinePollution: { type: Boolean, },
        emsNo: { type: String, },
        emsCode: { type: String, },
        mfagNo: { type: String, },
        hsCode: { type: String, },
        tankType: { type: String, },
        msdsFile: { type: String, },
        isApproved: { type: String, },
        lineRef: { type: Boolean, },
        shippingName: { type: String, },
        imoNo: { type: String, },
        UNDGType: { type: String, },
        reportableQuantity: { type: String, },
        flashpointCelsius: { type: String, },
        flashpointFahrenheit: { type: String, },
        toxinHazard: { type: Boolean, },
        hazardZone: { type: String, },
        packingGroupName: { type: String, },
        tenantId: { type: String, },
        documents: { type: Array, },
        status: { type: Boolean, required: true },
    },
    "uom": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        uomId: { type: String },
        tenantId: { type: String, required: true },
        uomCategory: { type: String, required: true },
        uomName: { type: String, required: true },
        uomShort: { type: String, required: true },
        uomCode: { type: String },
        measurement: { type: String },
        measure: { type: String },
        remark: { type: String },
        status: { type: Boolean, required: true },
    },
    "vessel": {
        chartId: { type: String },
        vesselBuildDate: { type: String },
        vesselModifiedDate: { type: String },
        countryName: {
            type: String,
        },
        countryId: {
            type: String,
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        vesselId: { type: String },
        vesselCode: { type: String, required: true },
        vesselName: { type: String, required: true },
        internalVesselCode: { type: String },
        deActivateVessel: { type: Boolean },
        vesselNationalityName: { type: String },
        vesselType: { type: String },
        vesselSubType: {
            vesselSubTypeName: { type: String },
            vesselSubTypeId: { type: String },
        },
        chartName: { type: String },
        portOfRegistryCode: { type: String },
        portOfRegistryName: { type: String },
        regNo: { type: String },
        grt: { type: String },
        nrt: { type: String },
        callSign: { type: String },
        classSocietyNo: { type: String },
        summerDeadWt: { type: String },
        preferredBerthSide: { type: String },
        tropicalMaxDraft: { type: String },
        tropicalDeadWt: { type: String },
        summerMaxWt: { type: String },
        reasonPrefBerth: { type: String },
        loa: { type: String },
        lbp: { type: String },
        beam: { type: String },
        gearedVessel: { type: Boolean },
        reducedGt: { type: String },
        whetherSBT: { type: Boolean },
        generalRemark: { type: String },
        imoNo: { type: String },
        vesselBuildString: { type: String },
        vesselBuildPlace: { type: String },
        vesselModifiedString: { type: String },
        vesselHeight: { type: Number },
        hatchCoverType: { type: String },
        noofHatchCover: { type: String },
        noofHatches: { type: String },
        noofHolds: { type: String },
        perBodyinBlst: { type: String },
        engineType: { type: String },
        noofEngine: { type: String },
        enginePower: { type: String },
        propulsionType: { type: String },
        noofPropellers: { type: String },
        maxSpeed: { type: String },
        cruisingSpeed: { type: String },
        thrustersUsed: { type: Boolean },
        noofBowThrusters: { type: String },
        bowThrustersPower: { type: String },
        cellularVessel: { type: Boolean },
        bulbousBow: { type: Boolean },
        bowAndManifoldDist: { type: String },
        noofSternThrusters: { type: String },
        sternThrusterPower: { type: String },
        totalTUECapacity: { type: String },
        totaltwentyFtCapacity: { type: String },
        totalfortyFtCapacity: { type: String },
        noofReferPlugPoint: { type: String },
        voltageOfReferPlugPoint: { type: String },
        typeofReferPlugPoint: { type: String },
        cranes: { type: Array },
        exVesselName: { type: String },
        exCallSign: { type: String },
        govtVessel: { type: Boolean },
        owner: { type: String },
        localVesselAgent: { type: String },
        containerPermission: { type: Boolean },
        localAgtContact: { type: String },
        hullAndMachineryIns: { type: String },
        PIClubName: { type: String },
        PIClubAddress: { type: String },
        PITelephoneNo: { type: String },
        PIFaxNo: { type: String },
        PIEmail: { type: String },
        localCorrespondantName: { type: String },
        localTelNo: { type: String },
        mmsino: { type: Number },
        localTelexNo: { type: String },
        localFaxNo: { type: String },
        localEmail: { type: String },
        satteliteId: { type: String },
        satcomId: { type: String },
        telephoneNo: { type: String },
        faxNo: { type: String },
        vesselCommEmail: { type: String },
        status: { type: Boolean, required: true },


        tenantId: { type: String, required: true },
    },
    "costtemplate": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String, required: true },
        orgId: { type: String, required: true },
        status: { type: Boolean, required: true },
        costtemplateId: { type: String, required: true },
        costTemplateName: { type: String, required: true },
        costTemplateDescription: { type: String, required: true },

        costItem: [{
            orgId: { type: String },
            enquiryitemId: { type: String },
            stcQuotationNo: { type: String },
            costItemId: { type: String, required: true },
            chargeType: { type: String, required: true },
            accountBaseCode: { type: Number, required: true },
            costItemName: { type: String, required: true },
            costHeadId: { type: String },
            currency: { type: String, required: true },
            exchangeRate: { type: String },
            amount: { type: String },
            baseAmount: { type: String },
            tenantMargin: { type: Number },
            tax: [{
                taxAmount: { type: String, required: true },
                taxRate: { type: Number, required: true },
            }],
            quantity: { type: String, required: true },
            rate: { type: String },
            stcAmount: { type: Number, required: true },
            jmbAmount: { type: Number, required: true },
            payableAt: { type: String },
            gst: { type: Number, required: true },
            totalAmount: { type: Number, required: true },
            chargeTerm: { type: String, required: true },
            remarks: { type: String },
            containerNumber: [{ type: String }],
            isFreight: { type: Boolean, required: true },
        }],
    },
    "city": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        cityId: { type: String },
        stateId: { type: String, required: true },
        cityName: { type: String, required: true },
        status: { type: Boolean, required: true },
        stateName: { type: String, required: true },

        tenantId: { type: String, required: true },
    },
    "country": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        countryId: { type: String },
        countryCode: { type: String, required: true },
        countryName: { type: String, required: true },
        sector: { type: String },
        countryShortName: { type: String },
        subSectorName: { type: String },
        status: { type: Boolean, required: true },
        callingCode: { type: String, required: true },
        countryPhoneCode: { type: String },
        orgId: { type: String, required: true },
        tenantId: { type: String, required: true },
    },
    "release-manager": {
        customerGroup: { type: String },
        releaseType: { type: String },
        notes: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
    },
    "partymaster": {
        parentCompany: {
            type: Boolean
        },
        openingBalance: { type: Number },
        isSupplier: {
            type: Boolean
        },
        companyCIN: {
            type: String,
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        partymasterId: { type: String },

        tenantId: { type: String, required: true },
        name: { type: String, required: true },
        shortName: { type: String },
        addressInfo: {
            address: { type: String },
            countryId: { type: String },
            countryISOCode: { type: String },
            countryName: { type: String },
            stateId: { type: String },
            stateName: { type: String },
            stateCode: { type: String },
            cityId: { type: String },
            cityName: { type: String },
            postalCode: { type: String },
        },
        primaryMailId: { type: String },
        url: { type: String },
        groupCompany: { type: Boolean },
        tanNo: { type: String },
        primaryNo: {
            primaryCountryCode: { type: String },
            primaryAreaCode: { type: Number, default: 0 },
            primaryNo: { type: String },
        },
        salesFromCity: { type: String },
        salesToCity: { type: String },
        salesLatitude: { type: String },
        salesLongitude: { type: String },
        salesLatitudeDelta: { type: String },
        salesLongitudeDelta: { type: String },
        salesLeadType: { type: String },
        salesCurrentLocation: { type: String },
        salesRequirementType: { type: String },
        salesTruckRequired: { type: String },
        salesDocumentName: { type: String },
        faxNo: {
            faxCountryCode: { type: String },
            faxAreaCode: { type: String },
            faxNo: { type: String },
        },
        exportTeun: { type: String },
        importTeun: { type: String },
        annualTurnover: { type: String },
        accountCode: { type: String, default: "null" },
        chequeAcceptance: { type: Boolean, default: true },
        principle: { type: String },
        salePrinciple: { type: String },
        currency: { type: Object },
        customerName: { type: String },
        refundAccCode: { type: String },
        brokerageAccCode: { type: String },
        location: { type: String },
        locationId: { type: String },
        panNo: { type: String },
        bankName: { type: String },
        adCode: { type: String },
        chaId: { type: String },
        customerType: { type: Array, default: [] },
        ImportExport: { type: String, default: "import" },
        customerStatus: { type: String, default: "Resident" },
        customerAccNumber: { type: String },
        tosite: { type: String },
        customerAccCode: { type: String },
        remarks: { type: String },
        expScCode: { type: String },
        impScCode: { type: String },
        deactivationReason: { type: String },
        serviceTax: { type: String },
        serviceTaxNo: { type: Number, default: 0 },
        serviceTaxExmp: { type: String },
        serviceTaxExmpNo: { type: Number, default: 0 },
        flatRateDetention: { type: String },
        tdsPercent: { type: Number, default: 0 },
        TDS_utilised: { type: String },
        TDS_limit: { type: String },
        TDSNature: { type: String },
        gstNo: { type: String },
        createdBy: { type: String, default: "null" },
        modifiedBy: { type: String, default: "null" },
        saleFrom: { type: String },
        saleLocation: { type: String },
        saleCode: { type: String },
        saleName: { type: String },
        opsFrom: { type: String },
        opsLocation: { type: String },
        opsCode: { type: String },
        opsName: { type: String },
        isSez: { type: Boolean, default: false },
        isRegister: { type: Boolean, default: false },
        reg_UN_UIN: { type: String },
        fasCode: { type: String },
        sacCode: { type: String },
        operationUser: { type: String },
        mloId: { type: String },
        creditDays: { type: String },
        isShippingLine: { type: Boolean, default: false },
        isTDSExempt: { type: Boolean, default: false },
        rateCheckBooking: { type: Boolean, default: true },
        rateCheckRO: { type: Boolean, default: true },
        rateCheckDraftBL: { type: Boolean, default: true },
        rateCheckBL: { type: Boolean, default: true },
        proformaRequiredImp: { type: Boolean, default: true },
        proformaRequiredExp: { type: Boolean, default: true },
        discountedBlFees: { type: Number, default: 0 },
        impFlag: { type: Boolean, default: true },
        expFlag: { type: Boolean, default: true },
        brokeragePayable: { type: Boolean, default: true },
        creditCustomer: { type: Boolean, default: true },
        residentStatus: { type: Boolean, default: true },
        activeflag: { type: Boolean, default: true },
        deactivationString: { type: String },
        serviceTaxLastModify: { type: String },
        serviceTaxLastString: { type: String },
        tdsCertificateValid: { type: String },
        tdsFlag: { type: Boolean, default: true },
        tdsCertificate: { type: Boolean, default: true },
        tdsGSTApplicable: { type: Boolean, default: true },
        kycFlag: { type: Boolean, default: true },
        kycPan: { type: String },
        kycGst: { type: String },
        checkAcceptStatus: { type: Boolean, default: true },
        status: { type: Boolean, default: true },
        lumsumStringFrom: { type: String },
        lumsumStringTo: { type: String },
        daysinPeriod: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
        branch: [
            {
                customerStatus: { type: String },
                bankNameText: { type: String },
                branch_name: { type: String },
                CompanydocumentId: { type: String },
                CompanydocumentName: { type: String },
                completeKYC: { type: String },
                branch_address: { type: String },
                customerStatus: { type: String },
                kycGst: { type: String },
                kycPan: { type: String },
                panNo: { type: String },
                pinCode: { type: Number },
                placeofSupplyName: { type: String },
                taxActive: { type: Boolean },
                TaxdocumentId: { type: String },
                TaxdocumentName: { type: String },
                barnch_country: { type: String },
                branch_countryName: { type: String },
                branch_state: { type: String },
                branch_stateName: { type: String },
                branch_cityId: { type: String },
                branch_city: { type: String },
                pinCode: { type: String },
                stateCodeBranch: { type: String },
                placeofSupply: { type: String },
                partyCode: { type: String },
                bankName: { type: String },
                cust_acc_no: { type: String },
                remarks: { type: String },
                pic: { type: String },
                pic_phone: { type: String },
                pic_email: { type: String },
                tax_name: { type: String, default: "GST" },
                tax_number: { type: String, default: "1234" },
                BROKERAGE_PAYABLE: { type: Boolean, default: true },
                creadirCustomer: { type: Boolean, default: true },
                active_flag: { type: Boolean, default: true },
                kyc_flag: { type: Boolean, default: false },
                TDS_GST_APPLICABLE: { type: Boolean, default: true },
                documents: { type: Array, default: [] },
            }
        ],
        companyCin: { type: String },
        CompanydocumentId: { type: String },
        CompanydocumentName: { type: String },
        completeKYC: { type: Boolean },
        partyShortcode: { type: String },
        parenetcustomerId: { type: String },
        partyCurrency: {
            currencyCode: { type: String },
            currencyId: { type: String },
            currencyName: { type: String },
        },
        TaxdocumentId: { type: String },
        TaxdocumentName: { type: String },
        customer: [
            {
                customerName: { type: String },
                address: { type: String },
                phoneNo: { type: String },
                email: { type: String },
            }
        ],
    },
    "feature": {
        accesslevel: [],
        featureCode: { type: String },
        featureName: { type: String },
        featureType: { type: String },
        menu: [
            {
                menuName: { type: String },
                menuId: { type: String },
            }
        ],
        module: { type: String },
        orgId: { type: String },
        stage: [],
        isExport: { type: Boolean },
        isImport: { type: Boolean },
        isTransport: { type: Boolean },
        tenantId: { type: String },
        referenceId: { type: String },
        featureId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "role": {
        orgId: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        accesslevel: [],
        menu: [],
        roleName: { type: String },
        roleDescription: { type: String },
        status: { type: Boolean },
        isActive: { type: Boolean },
        tenantId: { type: String },

        roleId: { type: String }
    },
    "state": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        stateCode: {
            type: String
        },
        typeDescription: {
            type: String
        },
        stateShortName: {
            type: String
        },
        GSTNCode: {
            type: String
        },
        countryCode: {
            type: String
        },
        isUnion: {
            type: Boolean
        },
        status: {
            type: Boolean
        },
        tenantId: {
            type: String
        },
        countryId: {
            type: String,
            required: true
        },
        countryName: {
            type: String,
            required: true
        },
        stateName: {
            type: String,
            required: true
        },
        stateId: {
            type: String
        }
    },
    "util": {
        gateInPassNumberCounter: { type: Number },
        gateOutPassNumberCounter: { type: Number },
        blCounter: { type: Number },
        utilType: { type: String },
        portcallCounter: { type: Number },
        invoiceCounter: { type: Number },
        batchCounter: { type: Number },
        enquiryCounter: { type: Number },
        jobCounter: { type: Number },
        paymentCounter: { type: Number },
        queryCounter: { type: Number },
        deliveryOrderCounter: { type: Number },
        creditNoteCounter: { type: Number },
        receiptConfCounter: { type: Number },
        receiptAckRefNo: { type: Number },
        pri_dpl_counter: { type: Number },
        pri_aut_counter: { type: Number },
        rateCounter: { type: Number },
        pri_ass_counter: { type: Number },
        pri_acm_counter: { type: Number },
        pri__counter: { type: Number },
        commentCounter: { type: Number },
        enquiryitemCounter: { type: Number },
        containerCounter: { type: Number },
        pri_tal_counter: { type: Number },
        pri_qat_counter: { type: Number },
        pri_ssc_counter: { type: Number },
        version: { type: Number },
        pri_sdc_counter: { type: Number },
        pri_vsc_counter: { type: Number },
        featureCounter: { type: Number },
        agentadviceCounter: { type: Number },
        consolidationbookingCounter: { type: Number },
        warehouseCounter: { type: Number },
        grnCounter: { type: Number },
        qrCounter: { type: Number },
        driverCounter: { type: Number },
        ticketCounter: { type: Number },
        inappnotificationCounter: { type: Number },
        shippingbillCounter: { type: Number },
        entrybillCounter: { type: Number },
        transportinquiryCounter: { type: Number },
        warehouseJobCounter: { type: Number }
    },
    "menu": {
        menuId: { type: String },
        createdBy: { type: String },
        createdOn: { type: String },
        featureId: { type: String },
        isMappedToAgentFeature: { type: Boolean },
        isMappedToFeature: { type: Boolean },
        isMappedToOperatorFeature: { type: Boolean },
        menuIcon: { type: String },
        menuLevel: { type: Number },
        menuLevelAgent: { type: Number },
        menuLevelOperator: { type: Number },
        menuName: { type: String },
        menuUrl: { type: String },
        module: { type: String },
        orgId: { type: String },
        parentMenuId: { type: String },
        parentMenuIdAgent: { type: String },
        parentMenuIdOperator: { type: String },
        sortOrder: { type: Number },
        status: { type: Boolean },
        tenantId: { type: String },
        updatedBy: { type: String },
        updatedOn: { type: String },
        export: { type: Boolean },
        import: { type: Boolean },
        updatedByUID: { type: String },
        isTransport: { type: Boolean }
    },
    "user": {
        tokenVersion: { type: Number },
        driverId: { type: String },
        driverName: { type: String },
        countryId: { type: String },
        countryName: { type: String },
        customerId: { type: String },
        customerName: { type: String },
        userType: { type: String },
        currency: { type: String },
        userProfile: { type: String },
        createdDate: { type: String },
        userLastname: { type: String },
        importBackDate: { type: Boolean },
        exportBackDate: { type: Boolean },
        defaultModule: { type: String },
        userSocketStatus: { type: Boolean },
        agentStatusExpired: { type: Boolean },
        isTrial: { type: Boolean },
        trialValidTill: { type: String },
        isMobile: { type: Boolean },
        isPassword: { type: Boolean },
        isEmail: { type: Boolean },
        createdOn: {
            type: String
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: {
            type: String,
            required: true
        },
        orgId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        userLastName: {
            type: String
        },
        userFirstName: {
            type: String
        },
        shortName: { type: String },
        officeLocation: { type: String },
        userEmail: {
            type: String,
            required: true
        },
        password: {
            type: String
        },
        phoneNo: {
            type: Number
        },
        userLogin: {
            type: String,
            required: true
        },
        department: [{
            item_id: { type: String },
            item_text: { type: String }
        }],
        agent: {
            type: String,
        },
        userId: {
            type: String,
            required: true
        },
        principle: { type: String },
        defaultPrinciple: { type: String },
        superUser: { type: Boolean },
        jmbFAS: { type: Boolean },
        exportBackString: { type: Boolean },
        importBackString: { type: Boolean },
        agencyInvoice: { type: Boolean },
        exRateEditable: { type: Boolean },
        roles: [{
            roleId: { type: String },

            roleName: { type: String }
        }],
        userStatus: { type: Boolean },
        status: { type: Boolean },
        userId: {
            type: String,
            required: true
        },
        agentBranchName: { type: String },
        agentBranch: { type: String },
        agentId: { type: String }
    },
    "bank": {
        isDefaultBank: { type: Boolean },
        partyId: { type: String },
        partyName: { type: String },
        address: { type: String },
        agent: {
            agentId: { type: String },
            agentName: { type: String },
        },
        bankUpload: { type: String },
        bankUploadUrl: { type: String },
        beneficiaryName: { type: String },
        branchId: { type: String },
        branchName: { type: String },
        cityId: { type: String },
        cityName: { type: String },
        country: {
            countryId: { type: String },
            countryISOCode: { type: String },
            countryName: { type: String },
        },
        currency: { type: String },
        documents: [],
        ibanNo: { type: String },
        Opbalance: { type: String },
        parentId: { type: String },
        remark: { type: String },
        routingNo: { type: String },
        state: {
            stateId: { type: String },
            stateName: { type: String },
        },
        firstCorrespondent: {
            bankName: { type: String },
            routingNo: { type: Number },
            ibanNo: { type: Number },
        },
        secondCorrespondent: {
            bankName: { type: String },
            routingNo: { type: Number },
            ibanNo: { type: Number },
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: {
            type: String,
            required: true
        },
        bankName: {
            type: String
        },
        bankShortName: {
            type: String
        },
        bankAccountCode: {
            type: String
        },
        lineID: { type: String },
        FASLedgerCode: { type: String },
        category: {
            type: String
        },
        accountNo: { type: String },
        accountType: { type: String },
        isBank: {
            type: Boolean
        },
        status: {
            type: Boolean
        },
        ifscCode: {
            type: String
        },
        branch: {
            type: String
        },
        swiftCode: {
            type: String
        },
        bankId: {
            type: String
        }
    },
    "costitem": {
        aiGenerated: { type: Boolean },
        gst: { type: String },
        taxRate: { type: String },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: {
            type: String,
            required: true
        },
        costitemName: {
            type: String,
            required: true
        },
        costitemGroup: {
            type: String
        },
        costitemGroupId: {
            type: String
        },
        chargeAmount: {
            type: Number
        },
        accountCode: { type: String },
        chargeApplicable: [],
        chargeType: {
            type: String
        },
        chargeTypeName: {
            type: String
        },
        creditToStolt: {
            type: Boolean
        },
        currencyId: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        exchangeRate: {
            type: String
        },
        chargeGroup: {
            type: String
        },
        costitemId: {
            type: String,
            required: true
        },
        hsnType: { type: String },
        shortCode: { type: String },
        hsnCode: { type: String },
        tax_applicability_charge: { type: String },
        status: {
            type: Boolean,
            required: true
        }
    },
    "clause": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        clauseType: {
            type: String,
            required: true
        },
        port_Id: {
            type: String,
            required: true
        },
        remarks: { type: String },
        portOption: { type: String },
        status: {
            type: Boolean,
            required: true
        },
        clauseName: {
            type: String,
            required: true
        },
        tenantId: {
            type: String,
            required: true
        },
        clauseId: {
            type: String,
            required: true
        }
    },
    "costhead": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: {
            type: String,
            required: true
        },
        status: {
            type: Boolean,
            required: true
        },
        costheadName: {
            type: String,
            required: true
        },
        costHeadCode: {
            type: Number,
            required: true
        },
        costheadId: {
            type: String,
            required: true
        }
    },
    "currency": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        countryName: {
            type: String
        },
        description: { type: String },
        currencyName: {
            type: String,
            required: true
        },
        currencyShortName: {
            type: String,
            required: true
        },
        currencySymbol: {
            type: String,
            required: true
        },
        currencyPair: {
            type: String
        },
        status: {
            type: Boolean,
            required: true
        },
        tenantId: {
            type: String,
            required: true
        },
        countryId: {
            type: String
        },
        currencyId: {
            type: String
        }
    },
    "currrate": {
        baseCurrency: {
            type: String,
        },
        baseCurrencyId: {
            type: String,
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        exchangeRate: {
            type: String,
            required: true
        },
        currency: {
            type: String,
            required: true
        },
        currencyId: {
            type: String,
            required: true
        },
        countryCode: {
            type: String,
            required: true
        },
        countryName: {
            type: String,
            required: true
        },
        countryId: {
            type: String,
            required: true
        },
        curr_String: {
            type: String,
            default: String.now
        },
        curr_date: { type: String },
        description: { type: String },
        status: {

            type: Boolean
        },
        tenantId: {
            type: String,
            required: true
        },
        currrateId: { type: String }
    },
    "taxtype": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        status: {
            type: Boolean,
            required: true
        },
        tenantId: {
            type: String,
            required: true
        },
        remarks: { type: String },
        hsnTypeId: {
            type: String,
            required: true
        },
        hsnType: {
            type: String,
            required: true
        },
        hsnCode: {
            type: String,
            required: true
        },
        description: { type: String },
        rates: [
            {
                rate: {
                    type: String,
                    required: true
                },
                isGSTExepm: { type: String },
                isVATExepm: { type: String },
                fromString: {
                    type: String,
                    default: String.now
                },
                toString: { type: String },
                countryId: { type: String },
                countryName: { type: String }
            }
        ],
        taxRate: {
            type: String,
            required: true
        },
        effectiveFrom: { type: String },
        taxtypeId: { type: String }
    },
    "shippingline": {
        fromPartyMaster: { type: Boolean },
        partymasterId: { type: String },
        countryISOCode: { type: String },
        entryPortId: { type: String },
        entryPortName: { type: String },
        fromDate: { type: String },
        loadPortId: { type: String },
        loadPortName: { type: String },
        onCarriageId: { type: String },
        onCarriageName: { type: String },
        preCarriageId: { type: String },
        preCarriageName: { type: String },
        productType: { type: String },
        serviceName: { type: String },
        toDate: { type: String },
        tsPortId: { type: String },
        tsPortName: { type: String },
        containerType: { type: String },
        containerTypeId: { type: String },
        contractType: { type: String },
        constItems: [
            {
                accountBaseCode: { type: String },
                amount: { type: String },
                baseAmount: { type: String },
                chargeTerm: { type: String },
                chargeType: { type: String },
                containerNumber: [],
                costHeadId: { type: String },
                costHeadName: { type: String },
                costitemGroup: { type: String },
                costItemId: { type: String },
                costItemName: { type: String },
                currency: { type: String },
                exchangeRate: { type: String },
                gst: { type: Number },
                hsnCode: { type: String },
                isFreight: { type: Boolean },
                jmbAmount: { type: Number },
                payableAt: { type: String },
                quantity: { type: String },
                rate: { type: Number },
                remarks: { type: String },
                shippingLine: { type: String },
                stcAmount: { type: Number },
                tax: [
                    {
                        taxAmount: { type: Number },
                        taxRate: { type: Number },
                    }
                ],
                tenantMargin: { type: String },
                totalAmount: { type: Number },
            }
        ],
        contactName: { type: String },
        ShipmentTypeName: { type: String },
        phoneNo: { type: String },
        branchId: { type: String },
        operatorCode: { type: String },
        typeCategory: {
            type: String,
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        name: {
            type: String,
            required: true
        },
        shortName: {
            type: String
        },
        shippingLine: {
            type: String
        },
        scacCode: {
            type: String
        },
        shippinglineId: { type: String },
        email: { type: String },
        status: {
            type: Boolean,
            required: true
        },
        feeder: {
            type: Boolean
        },
        country: {
            type: String,
            required: true
        },
        tenantId: {
            type: String,
            required: true
        },
        createUser: { type: Boolean },
        branchName: { type: String }

    },
    "systemtype": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: {
            type: String,
            required: true
        },
        typeName: {
            type: String,
            required: true
        },
        typeDescription: {
            type: String
        },
        typeActive: {
            type: Boolean,
            required: true
        },
        typeCategory: {
            type: String,
            required: true
        },
        typeParentType: { type: String },
        typeRefId: {
            type: String
        },
        typeRef: {
            type: String
        },
        processType: {
            type: String
        },
        status: {
            type: Boolean,
            required: true
        },
        systemtypeId: {
            type: String,
            required: true
        }
    },
    "agent": {
        isJobAutomationEnabled: { type: String },
        geminiModel: {
            blScanning: { type: String },
            invoiceScanning: { type: String }
        },
        decimalNumber: { type: Number },
        blCredit: {
            type: Number
        },
        orgType: {
            type: String
        },
        secondaryEmailConfig: {
            mailServer: {
                type: String
            },
            emailId: {
                type: String
            },
            mailServerPassword: {
                type: String
            },
        },
        batchAccessFeature: { type: Boolean },
        userCount: { type: Number },
        departmentCount: { type: Number },
        companyShortCode: { type: String },
        einvoiceData: {
            userName: { type: String },
            password: { type: String },
        },
        uploadSign: {
            type: String
        },
        secondaryemailId: {
            type: String
        },
        emailConfig: {
            mailServer: {
                type: String
            },
            emailId: {
                type: String
            },
            mailServerPassword: {
                type: String
            },
        },
        mtoReg: {
            type: String
        },
        uploadStamp: {
            type: String
        },
        fmcNo: {
            type: String
        },
        scacNo: {
            type: String
        },
        agentStatus: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        firstName: { type: String },
        lastName: { type: String },
        uploadLogo: { type: String },
        isBranch: { type: Boolean },
        isPrincipal: { type: Boolean },
        agentId: { type: String },
        branchType: { type: String },
        agentName: { type: String },
        branchId: { type: String },
        branchName: { type: String },
        principalId: { type: String },
        principalName: { type: String },
        parentId: { type: String },
        addressInfo: {
            address: { type: String },
            countryId: { type: String },
            countryISOCode: { type: String },
            countryName: { type: String },
            stateId: { type: String },
            stateName: { type: String },
            cityId: { type: String },
            cityName: { type: String },
            postalCode: { type: String },
            timezone: { type: String }
        },
        primaryNo: {
            primaryAreaCode: { type: String },
            primaryCountryCode: { type: String },
            primaryNumber: { type: String },
            countryAreaCode: { type: String },
            areaCode: { type: String },
            phoneNumber: { type: String }
        },
        secondaryNo: {
            secondaryAreaCode: { type: String },
            secondaryCountryCode: { type: String },
            secondaryNo: { type: String },
            countryAreaCode: { type: String },
            areaCode: { type: String },
            phoneNumber: { type: String }
        },
        userId: { type: String },
        allTimeAvailableNo: {
            countryAreaCode: { type: String },
            areaCode: { type: String },
            phoneNumber: { type: String },
            allTimeAvailableNumber: { type: String }
        },
        faxNo: {
            faxAreaCode: { type: String },
            faxCountryCode: { type: String },
            faxNo: { type: String },
            countryAreaCode: { type: String },
            areaCode: { type: String },
            phoneNumber: { type: String }
        },
        url: { type: String },
        orgId: { type: String },
        tenantId: { type: String },
        userType: { type: String },
        primaryMailId: { type: String },
        secondaryMailId: { type: String },
        commRegNo: { type: String },
        panNo: { type: String },
        dAndBNo: { type: String },
        taxType: { type: String },
        taxCode: { type: String },
        taxId: { type: String },
        vatNo: { type: String },
        sezUnitAddress: { type: String },
        vendorType: { type: String },
        portName: { type: String },
        currency: {
            currencyId: { type: String },
            currencyCode: { type: String },
            currencyName: { type: String },
            countryId: { type: String }
        },
        pic: {
            picType: { type: String },
            picName: { type: String },
            picName1: { type: String },
            picName2: { type: String },
            picMobileNo: { type: String },
            picMobileCountryCode: { type: String },
            picMobileAreaCode: { type: String },
            picMailId: { type: String }
        },
        pda: { type: Boolean },
        iPda: { type: Boolean },
        fda: { type: Boolean },
        sda: { type: Boolean },
        branchActive: { type: Boolean },
        status: { type: Boolean, required: true },
    },
    "branch": {
        jobCodeNB: {
            type: String
        },
        warehouseCounterNB: { type: Number },
        draftJobCode: { type: String },
        draftImportbatchCounter: { type: Number },
        invoiceCounter: { type: Number },
        warehouseCounter: { type: Number },
        exportBatchCounter: { type: Number },
        currency: { type: String },
        batchCounter: { type: Number },
        jobCode: {
            type: String
        },
        panNo: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        uploadLogo: { type: String },
        isBranch: { type: Boolean },
        isPrincipal: { type: Boolean },
        agentId: { type: String },
        panNo: { type: String },
        branchType: { type: String },
        agentName: { type: String },
        branchId: { type: String },
        branchName: { type: String },
        principalId: { type: String },
        principalName: { type: String },
        parentId: { type: String },
        addressInfo: {
            currentLocation: { type: String },
            address: { type: String },
            countryId: { type: String },
            countryISOCode: { type: String },
            countryName: { type: String },
            stateId: { type: String },
            stateName: { type: String },
            stateCode: { type: String },
            cityId: { type: String },
            cityName: { type: String },
            postalCode: { type: Number },
            timezone: { type: String }
        },
        primaryNo: {
            primaryCountryCode: { type: String },
            primaryAreaCode: { type: String },
            primaryNumber: { type: Number }
        },
        secondaryNo: {
            secondaryCountryCode: { type: String },
            secondaryAreaCode: { type: String },
            secondaryNo: { type: String }
        },
        allTimeAvailableNo: {
            countryCode: { type: String },
            areaCode: { type: String },
            allTimeAvailableNumber: { type: String }
        },
        faxNo: {
            faxCountryCode: { type: String },
            faxAreaCode: { type: String },
            faxNo: { type: String }
        },
        url: { type: String },
        orgId: { type: String },
        tenantId: { type: String },
        userType: { type: String },
        primaryMailId: { type: String },
        secondaryMailId: { type: String },
        currency: { type: String },
        commRegNo: { type: String },
        dAndBNo: { type: String },
        taxType: { type: String },
        taxCode: { type: String },
        taxId: { type: String },
        vatNo: { type: String },
        sezUnitAddress: { type: String },
        vendorType: { type: String },
        portName: { type: String },
        currency: {
            countryId: { type: String }
        },
        pic: {
            picType: { type: String },
            picName: { type: String },
            picName1: { type: String },
            picName2: { type: String },
            picMobileNo: { type: Number },
            picMobileCountryCode: { type: String },
            picMobileAreaCode: { type: String },
            picMailId: { type: String }
        },
        pda: { type: Boolean },
        iPda: { type: Boolean },
        fda: { type: Boolean },
        sda: { type: Boolean },
        branchActive: { type: Boolean },
        status: { type: Boolean },
        branchShortName: { type: String }
    },
    "contact": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        contactName: { type: String, required: true },
        contactEmail: { type: String, required: true },
        areaCode: { type: String, required: true },
        contactPhone: { type: String, required: true },
        contactCode: { type: Number, required: true },
        contactRemarks: { type: String, required: true },
        isActive: { type: Boolean, required: true },
        orgId: { type: String, required: true },
        tenantId: { type: String, required: true },
        isUser: { type: Boolean, required: true },
        contactType: { type: String, required: true },
        parentId: { type: String, required: true },
        contactId: { type: String, required: true },
    },
    "employee": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        status: { type: Boolean, required: true },
        dept_name: { type: String, required: true },
        deptId: { type: String, required: true },
        company_name: { type: String, required: true },
        branch: { type: String, required: true },
        employeeId: { type: String, required: true },
        emp_Id: { type: String, required: true },
        emp_name: { type: String, required: true },
        designation: { type: String, required: true },
        remark: { type: String, required: true },
        lob: { type: String, required: true }
    },
    "department": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String, required: true },
        orgId: { type: String, required: true },

        parentId: { type: String },
        isDeptType: { type: String },
        deptName: { type: String },
        deptManagerId: { type: String },
        deptManager: { type: String },
        deptEmail: { type: String },
        status: { type: Boolean },
        departmentId: { type: String },
    },
    "agentadvice": {
        aiGenerated: { type: Boolean },
        looseCargoDetails: {
            grossWeight: { type: String },
            grossVolume: { type: String },
            cargos: [
                {
                    firstName: { type: String },
                    lastName: { type: String },
                    pkgname: { type: String },
                    units: { type: Number },
                    Pallettype: { type: String },
                    lengthp: { type: String },
                    lengthb: { type: Number },
                    Weightb: { type: Number },
                    heightb: { type: Number },
                    DimensionUnit: { type: String },
                    Weightbox: { type: Number },
                    Unit1: { type: String },
                    volumebs: { type: String },
                    volumeb: { type: Number },
                    Weightp: { type: String },
                    Weightp: { type: String },
                    DimensionUnitp: { type: String },
                    Weightps: { type: String },
                    weightpsCalculatedplt: { type: String },
                    weightpsCalculatedbox: { type: String },
                    weightpsCalculatedother: { type: String },
                    Unit1p: { type: String },
                    volumep: { type: Number },
                    volumeps: { type: String },
                    heightselected: { type: String },
                    selectedh: { type: String },
                    Weightselected: { type: String },
                    selectedw: { type: String },
                    volumeselect: { type: Number },
                    volumebselecteds: { type: String },
                }
            ]
        },
        enquiryNo: { type: String },
        enquiryStatus: { type: String },
        estimate: {
            maxPrice: { type: Number },
            minPrice: { type: Number },
            quoteAmount: { type: Number },
        },
        enquiryStatusCustomer: { type: String },
        bookingNumber: { type: String },
        bookingDate: { type: String },
        bookingValidityDate: { type: String },
        shippingTermId: { type: String },
        shippingTermName: { type: String },
        customDetails: {
            clearanceDate: { type: String },
            clearanceDestination: { type: String },
            transportDestination: { type: String },
            IFSFiledById: { type: String },
            IFSFiledBy: { type: String },
            customDestinationLocation: { type: String },
            customDestinationLocationName: { type: String },
            customOriginLocationName: { type: String },
            customOriginLocation: { type: String },
            customDestination: { type: String },
            customOrigin: { type: String },
            destinationDeliveryAddress: { type: String },
            destinationOption: { type: String },
            destinationfactory: { type: String },
            originOption: { type: String },
            originPickupAddress: { type: String },
            originfactory: { type: String },
            transportDestination: { type: String },
            transportOrigin: { type: String },
        },
        insurance: {
            cargo: { type: Boolean },
            emptyContainer: { type: Boolean },
            palletization: { type: Boolean },
            fumigation: { type: Boolean },
            warehousing: { type: Boolean },
        },
        transportDetails: {
            origin: [
                {
                    locationType: { type: String },
                    location: { type: String },
                    locationName: { type: String },
                    etd: { type: String },
                    eta: { type: String },
                    address: { type: String },
                    addressText: { type: String },
                    addressId: { type: String },
                    transit: { type: String },
                    carrier: { type: String },
                    carrierName: { type: String },
                }
            ],
            destination: [
                {
                    locationType: { type: String },
                    location: { type: String },
                    locationName: { type: String },
                    etd: { type: String },
                    eta: { type: String },
                    address: { type: String },
                    addressText: { type: String },
                    addressId: { type: String },
                    transit: { type: String },
                    carrier: { type: String },
                    carrierName: { type: String },
                }
            ]
        },
        containersDetails: [
            {
                typeOfWay: { type: String },
                truckType: { type: String },
                wagonType: { type: String },
                containerType: { type: String },
                grossWeightContainer: { type: Number },
                noOfContainer: { type: Number },
                unit: { type: String }
            }
        ],
        orgId: {
            type: String,
        },
        cargoDetail: [
            {
                productId: { type: String },
                productName: { type: String },
                properShippingName: { type: String },
                technicalName: { type: String },
                commodityType: { type: String },
                commodityTypeName: { type: String },
                li: { type: String },
                Wi: { type: String },
                hi: { type: String },
                di: { type: String },
                Range: { type: String },
                To: { type: String },
                typeTemp: { type: String },
                unNo: { type: String },
                hsCode: { type: String },
                packingGroup: { type: String },
                flashPoint: { type: String },
                marinePollutionId: { type: String },
                unit: { type: String },
                unitName: { type: String },
                grossWeight: { type: Number },
                cargoReadyDate: { type: String },
                targetDeliveryDate: { type: String },
                Density: { type: String },
            }
        ],
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        agentadviceId: { type: String, required: true },
        agentadviceNo: { type: String, required: true },
        tenantId: { type: String, required: true },
        basicDetails: {
            enquiryTypeId: { type: String },
            enquiryTypeName: { type: String },
            loadTypeId: { type: String },
            loadType: { type: String },
            billingPartyId: { type: String },
            billingPartyName: { type: String },
            billingPartyAddress: { type: String },
            billingBranch: { type: String },
            billingStateCode: { type: String },
            billingCountry: { type: String },
            userBranch: { type: String },
            ShipmentTypeId: { type: String },
            ShipmentTypeName: { type: String },
            userBranchName: { type: String },
            userBranchStateCode: { type: String },
            userJobCode: { type: String },
            quotationRef: { type: String },
            salePerson: { type: String },
            incoTermId: { type: String },
            incoTermName: { type: String },
            shipperId: { type: String },
            shipperName: { type: String },
            shipperAddress: { type: String },
            consigneeId: { type: String },
            consigneeName: { type: String },
            consigneeAddress: { type: String },
            uniqueRefNo: { type: String },
            agentAdviceString: { type: String },
            stcReference: { type: String },
            stcQutationNo: { type: String },
            versionNo: { type: String },
            moveNo: { type: String },
            references: { type: String },
            paymentTerm: { type: String },
            moveTypeId: { type: String },
            moveTypeName: { type: String },
            noOfContainer: { type: String },
            destinationId: { type: String },
            enquiryValid: { type: Boolean },
            origin: { type: String },
            shipppingtermId: { type: String },
            shippping_term: { type: String },
            tradeRoute: { type: String },
        },
        productDetails: {
            product: { type: String },
            productName: { type: String },
            properShippingName: { type: String },
            imcoClass: { type: String },
            unNo: { type: String },
            packingGroup: { type: String },
            flashPoint: { type: String },
            marinePollutionId: { type: String },
            emsCode: { type: String },
            gravity: { type: String },
            Haz: { type: Boolean },
            commodityDescription: { type: String }
        },
        partyDetails: [
            {
                partyType: { type: String, required: true },
                customerName: { type: String, required: true },
                partyCode: { type: String, required: true },
                addressLine1: { type: String, required: true },
                addressLine2: { type: String, required: true },
                addressLine3: { type: String, required: true },
                city: { type: String, required: true },
                postalCode: { type: String, required: true },
                state: { type: String, required: true },
                country: { type: String, required: true },
            },
        ],
        routeDetails: {
            deliveryOfPlaceId: { type: String },
            deliveryOfPlace: { type: String },
            freeDaysTime: { type: Array },
            etd: { type: String },
            eta: { type: String },
            exitPortId: { type: String },
            exitPortName: { type: String },
            exitPortUN: { type: String },
            exitPortStringEA: { type: String },
            entryPortId: { type: String },
            state: { type: String },
            entryPortName: { type: String },
            entryPortUN: { type: String },
            entryPortString: { type: String },
            deliveryPlaceId: { type: String },
            deliveryPlaceName: { type: String },
            shippingLineId: { type: String },
            shippingLineName: { type: String },
            bol: { type: String },
            plannedVesselName: { type: String },
            plannedVoyageName: { type: String },
            loadPlace: { type: String },
            loadPlaceName: { type: String },
            location: { type: String },
            locationName: { type: String },
            loadPortId: { type: String },
            loadPortName: { type: String },
            destPortId: { type: String },
            destPortName: { type: String },
            loadPortETD: { type: String },
            destPortETA: { type: String },
            carrierReceiptId: { type: String },
            carrierDeliveryId: { type: String },
            shippinglineId: { type: String },
            shippinglineName: { type: String },
            backupShippingLine: { type: String },
            backupShippingLineName: { type: String },
            transhipmentHop1id: { type: String },
            transhipmentHop1ETA: { type: String },
            transhipmentHop1ETD: { type: String },
            transhipmentHop2id: { type: String },
            transhipmentHop2ETA: { type: String },
            transhipmentHop2ETD: { type: String },
            vesselId: { type: String },
            voyageNumber: { type: String },
            movementType: { type: String },
            movementLocationId: { type: String },
            destuffingType: { type: String },
            destuffingLocationId: { type: String },
        },
        invoicesDetails: [
            {
                invoiceNo: { type: String },
                invoiceDate: { type: String },
            }
        ],
        detentionDetails: {
            demurrageFreeDays: { type: String },
            demurrageCurrencyId: { type: String },
            demurrageCurrencyName: { type: String },
            demurrageAmount: { type: String },
            demurrageChanged: { type: Boolean },
            demurrageName: { type: String },
            truckingFreeHours: { type: String },
            truckingCurrencyId: { type: String },
            truckingPrice: { type: String },
            truckingChanged: { type: Boolean },
            operatorName: { type: String },
            operatorPhone: { type: String },
            operatorMail: { type: String },
            destinationCarrierFD: { type: String },
            destinationPortFD: { type: String },
            originCarrierFD: { type: String },
            lastFDDatePOD: { type: String },
            lastFDDatePOCD: { type: String },
            lastFDDateEmptyReturn: { type: String },
            lastFDDateCarrier: { type: String },
        },
        containers: [
            {
                containerId: { type: String, required: true },
                containerNo: { type: String, required: true },
                sealNo: { type: String, required: true },
                netWeight: { type: String, required: true },
                grossWeight: { type: String, required: true },
                weightUOM: { type: String, required: true },
                manufactureString: { type: String, required: true },
                containerStatus: { type: String, required: true },
            },
        ],
        remarks: { type: String },
        agentAdviceType: { type: String },
        status: { type: Boolean },
        agentAdviseStatus: { type: String },
    },
    "invoice": {
        invoiceApprovalEnabled: { type: Boolean, default: false },
        invoiceApprovalStatus: { type: String, default: "pending" },
        warehousedataentryId: { type: String },
        invoicescanningId: { type: String },
        invoiceRefNo: { type: String },
        ackNo: { type: String },
        irn: { type: String },
        qrData: { type: String },
        eInvoicePushedOn: { type: String },
        eInvoiceStatus: { type: String },
        eInvoiceCancelledOn: { type: String },

        multiBatch: { type: Boolean },
        batchArray: [
            {
                batchNo: { type: String },
                batchId: { type: String }
            }
        ],
        isCreditNoteCreated: { type: Boolean },
        orgId: { type: String },
        tenantId: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        invoiceId: { type: String },
        invoice_date: { type: String },
        invoiceDueDate: { type: String },
        invoiceTypeStatus: { type: String },
        type: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        category: { type: String },
        creditInvoiceNo: { type: String },
        creditInvoiceId: { type: String },
        invoiceType: { type: String },
        remarks: { type: String },
        invoiceNo: { type: String },
        invoiceToGst: { type: String },
        invoiceToId: { type: String },
        invoiceToName: { type: String },
        invoiceToBranch: { type: String },
        invoiceToBranchName: { type: String },
        invoiceToBranchAddress: { type: String },
        branchId: { type: String },
        branchName: { type: String },
        branchGst: { type: String },
        invoiceFromId: { type: String },
        invoiceFromName: { type: String },
        invoiceFromBranch: { type: String },
        invoiceFromBranchName: { type: String },
        invoiceFromBranchAddress: { type: String },
        billTo: { type: String },
        coName: { type: String },
        coAddress: { type: String },
        moveNo: { type: String },
        gstNo: { type: String },
        userStateCode: { type: String },
        userPinCode: { type: String },
        userLocation: { type: String },
        tax: [
            {
                taxAmount: { type: Number },
                taxRate: { type: Number },
                taxName: { type: String },
            }
        ],
        shipperAddress: {
            stateName: { type: String },
            stateCode: { type: String },
        },
        consigneeId: { type: String },
        consigneeName: { type: String },
        placeOfSupply: { type: String },
        placeOfSupplyId: { type: String },
        advancePayment: { type: Number },
        advancePercentage: { type: Number },
        costItems: [
            {
                tenantId: { type: String },
                enquiryitemId: { type: String },
                quotationId: { type: String },
                enqDate: { type: String },
                batchId: { type: String },
                enquiryId: { type: String },
                batchNo: { type: String },
                collectPort: { type: String },
                containerType: { type: String },
                vesselName: { type: String },
                agentadviceId: { type: String },
                voyageName: { type: String },
                moveNumber: { type: String },
                enquiryNumber: { type: String },
                stcQuotationNo: { type: String },
                costitemGroup: { type: String },
                enqType: { type: String },
                costItemId: { type: String },
                accountBaseCode: { type: String },
                costItemName: { type: String },
                costHeadId: { type: String },
                costHeadName: { type: String },
                exchangeRate: { type: String },
                currency: { type: String },
                amount: { type: String },
                baseAmount: { type: String },
                basic: { type: String },
                basicId: { type: String },
                isInvoiceCreated: { type: Boolean },
                tenantMargin: { type: Number },
                buyEstimates: {
                    currencyId: { type: String },
                    currency: { type: String },
                    exChangeRate: { type: Number },
                    rate: { type: Number },
                    amount: { type: Number },
                    taxableAmount: { type: Number },
                    totalAmount: { type: Number },
                    terms: { type: String },
                    supplier: { type: String },
                    igst: { type: Number },
                    cgst: { type: Number },
                    sgst: { type: Number },
                    invoiceNo: { type: String },
                    invoiceId: { type: String },
                    isInvoiceCreated: { type: Boolean },
                    buyerInvoice: { type: Boolean },
                    isReceiptCreated: { type: Boolean }
                },
                selEstimates: {
                    currencyId: { type: String },
                    currency: { type: String },
                    exChangeRate: { type: Number },
                    rate: { type: Number },
                    amount: { type: Number },
                    taxableAmount: { type: Number },
                    totalAmount: { type: Number },
                    terms: { type: String },
                    remarks: { type: String },
                    igst: { type: Number },
                    cgst: { type: Number },
                    sgst: { type: Number },
                    invoiceNo: { type: String },
                    invoiceId: { type: String },
                    isInvoiceCreated: { type: Boolean },
                    sellerInvoice: { type: Boolean },
                    isReceiptCreated: { type: Boolean },
                },
                tax: [
                    {
                        taxAmount: { type: Number },
                        taxRate: { type: Number },
                    }
                ],
                quantity: { type: Number },
                rate: { type: Number },
                stcAmount: { type: Number },
                jmbAmount: { type: Number },
                payableAt: { type: String },
                gst: { type: Number },
                gstType: { type: String },
                totalAmount: { type: Number },
                chargeTerm: { type: String },
                remarks: { type: String },
                containerNumber: [],
                shippingLine: { type: String },
                taxApplicability: { type: String },
                hsnCode: { type: String },
                isEnquiryCharge: { type: Boolean },
            }
        ],
        shipperId: { type: String },
        shipperName: { type: String },
        paymentStatus: { type: String },
        paidAmount: { type: String },
        jobNumber: { type: String },
        printBank: { type: Boolean },
        jobId: { type: String },
        paymentTerms: { type: Number },
        bankDetails: { type: String },
        withoutJob: { type: Boolean },
        supplier: { type: String },
        supplierName: { type: String },
        supplierAddress: { type: String },
        bankType: { type: String },
        voyageNumber: { type: String },
        vesselId: { type: String },
        isSez: { type: String },
        vesselName: { type: String },
        carrierName: { type: String },
        carrierShortName: { type: String },
        flightNo: { type: String },
        placeOfReceipt: { type: String },
        placeOfReceiptName: { type: String },
        paymentModeId: { type: String },
        paymentMode: { type: String },
        serviceDatefrom: { type: String },
        serviceDateTill: { type: String },
        taxNumber: { type: String },
        isExport: { type: Boolean },
        status: { type: Boolean },
        statusOfinvoice: { type: String },
        holdPosting: { type: Boolean },
        invoiceStatus: { type: String },
        principleBill: { type: Boolean },
        taxApplicability: { type: String },
        gst_invoice_type: { type: String },
        gstr: { type: String },
        gstType: { type: String },
        invoiceAmount: { type: String },
        invoiceAmountText: { type: String },
        invoiceTaxAmount: { type: String },
        pod: { type: String },
        pol: { type: String },
        placeOfDelivery: { type: String },
        bankName: { type: String },
        bankId: { type: String },
        banks: [
            {
                iscCode: { type: String },
                bankName: { type: String },
                accountNO: { type: String },
                bankId: { type: String },
            }
        ],
        isResident: { type: Boolean },
        discount: { type: Number },
        tds: { type: Number },
        tdsAmount: { type: String },
        taxAmount: { type: Number },
        balanceAmount: { type: Number },
        roundOff: { type: Boolean },
        paid: { type: Number },
        packagesNo: { type: Number },
        mbl: { type: String },
        mblName: { type: String },
        hbl: { type: String },
        hblName: { type: String },
        stateOfSupply: { type: String },
        stateOfSupplyName: { type: String },
        containers: { type: String },
        pdfUrl: { type: String },
        billNo: { type: String },
        paymentreference_no: { type: String },
        currencyId: { type: String },
        currency: { type: String },
        hsnList: [
            {
                hsnCode: { type: String },
                taxableAmount: { type: Number },
                taxRate: { type: Number },
                totalAmount: { type: Number },
                igst: { type: Number },
                cgst: { type: Number },
                sgst: { type: Number },
                gstType: { type: String },
            }
        ]
    },
    "document": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        documentName: { type: String, required: true },
        documentType: { type: String, required: true },
        tags: [],
        documentURL: { type: String },
        refType: { type: String },
        tenantId: { type: String },
        documentId: { type: String },
        documentStatusId: { type: String },
        refId: { type: String },
        isActive: { type: Boolean },
        isEmailDocument: { type: Boolean },
        orgId: { type: String },
        addressId: { type: String },
        documentStatus: { type: Boolean },
        documentData: { type: Object }
    },
    "deliveryorder": {
        clearingParty: { type: String },
        emptyreturn: { type: String },
        DOType: { type: String },
        releaseType: { type: String },
        emptyLocation: { type: String },
        hblDetails: { type: Object },
        mblDetails: { type: Object },
        orgId: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        igmDate: { type: String },
        igmNo: { type: String },
        tenantId: { type: String, required: true },
        allDepoName: { type: { type: String } },
        deliveryorderId: { type: String, required: true },
        batchId: { type: String },
        depoId: { type: String },
        depoName: { type: String, required: true },
        deliveryOrderNo: { type: String },
        deliveryString: { type: String },
        deliveryDate: { type: String },
        validTill: { type: String },
        extendedValidTill: { type: String },
        remarks: { type: String },
        containerNos: {
            type: [String]
        },
        containers: [
            {
                isDetentionTaken: { type: Boolean },
                detentionTakenDate: { type: String },
                validTill: { type: String },
                hblreleaseDate: { type: String },
                sbDate: { type: String },
                sobDate: { type: String },
                telexDate: { type: String },
                arrivalDate: { type: String },
                blDate: { type: String },
                containerSize: { type: String },
                deliveryDate: { type: String },
                depoIn: { type: String },
                depoInName: { type: String },
                depotDate: { type: String },
                depotDateName: { type: String },
                cbm: { type: String },
                dischargeDate: { type: String },
                evgmDate: { type: String },
                package: { type: String },
                packageType: { type: String },
                packageTypeName: { type: String },
                unitGross: { type: String },
                shipmentNumber: { type: String },
                tenantId: { type: String },
                containerId: { type: String },
                batchId: { type: String },
                batchNo: { type: String },
                tankStatusName: { type: String },
                tankStatusId: { type: String },
                voyageNo: { type: String },
                shippingLineId: { type: String },
                shippingLineName: { type: String },
                mastercontainerId: { type: String },
                containerNumber: { type: String },
                containerTypeId: { type: String },
                containerDescription: { type: String },
                containerTypeName: { type: String },
                containerType: { type: String },
                containerStatus: { type: String },
                imoType: { type: String },
                imoTypeId: { type: String },
                netWeight: { type: String },
                grossWeight: { type: String },
                isoContainerCode: { type: String },
                tareWeight: { type: String },
                sealNo: { type: String },
                unit: { type: String },
                rfidNo: { type: String },
                cargoType: { type: String },
                cargoTypeId: { type: String },
                evgmNumber: { type: String },
                evgmString: { type: String },
                blNumber: { type: String },
                blString: { type: String },
                shippingBillNumber: { type: String },
                sbNo: { type: String },
                sbString: { type: String },
                bondNumber: { type: String },
                igmNumber: { type: String },
                statusFlag: { type: String },
                statusFlagId: { type: String },
                status: { type: Boolean },
                depotOut: { type: String },
                depotString: { type: String },
                depotStringName: { type: String },
                icdIn: { type: String },
                icdInName: { type: String },
                icdOut: { type: String },
                icdOutName: { type: String },
                factoryIn: { type: String },
                factoryInName: { type: String },
                factoryOut: { type: String },
                factoryOutName: { type: String },
                terminalIn: { type: String },
                terminalInName: { type: String },
                terminalOut: { type: String },
                terminalOutName: { type: String },
                mtyValidity: { type: String },
                mtyReturn: { type: String },
                cfsIn: { type: String },
                cfsOut: { type: String },
                railOut: { type: String },
                dischargeString: { type: String },
                reject: { type: String },
                rejectName: { type: String },
                sobString: { type: String },
                arrivalString: { type: String },
                deliveryString: { type: String },
                override_orgId: { type: String },
                override_tId: { type: Boolean },
                containerInUse: { type: Boolean },
                isExport: { type: Boolean },
                size: { type: String },
                height: { type: String },
                containerHeight: { type: String },
                orgId: { type: String },
                createdBy: { type: String },
                createdOn: { type: String },
                vesselName: { type: String },
                doString: { type: String },
                isSelected: { type: Boolean },
                isAssigned: { type: Boolean },
            }
        ],
    },
    "tds": {
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tdsNature: { type: String, required: true },
        accountHead: { type: String, required: true },
        tdsPer: { type: String, required: true },
        surchargePer: { type: String, required: true },
        educationPer: { type: String, required: true },
        sectionCode: { type: String, required: true },
        effectiveFrom: { type: String, required: true },
        effectiveTo: { type: String, required: true },
        entityType: { type: String },
        thresholdLimit: { type: String, required: true },
        status: { type: Boolean, required: true },

        tenantId: { type: String, required: true },
        remarks: { type: String },
        type: { type: String },
        tdsId: { type: String, required: true },
    },
    "batch": {
        aiGenerated: { type: Boolean },
        isAccessAssigned: { type: Boolean },
        accessUser: [
            {
                userId: { type: String },
                userName: { type: String }
            }
        ],
        isScanned: { type: Boolean },
        isGRNRequired: { type: Boolean },
        isCustomsOnly: { type: Boolean },
        isCfsRequired: { type: Boolean },
        igmRequestDate: { type: String },
        lineNo: { type: String },
        cfsRequestDate: { type: String },
        recipientName: { type: String },
        addressNoc: { type: String },
        courierDate: { type: String },
        isFastTrack: { type: String },
        sentDate: { type: String },
        consolidateBatch: { type: Boolean },
        milestoneEstiDate: { type: String },
        shipmentColorCode: { type: String },
        bookingNo: { type: String },
        cutoffdate: { type: String },
        rejectRemarks: { type: String },
        igmDate: { type: String },
        igmNo: { type: String },
        nocDate: { type: String },
        containersName: { type: String },
        MBLStatus: { type: String },
        mblNumber: { type: String },
        HBLStatus: { type: String },
        freeDaysTime: [],
        hblNumbers: { type: String },
        hblNumber: { type: String },
        hblType: { type: String },
        amount: { type: String },
        quickJob: { type: Boolean },
        remarks: { type: String },
        customerId: { type: String },
        transportinquiryId: {
            type: String,
        },
        transportinquiryNo: {
            type: String,
        },
        orgId: {
            type: String,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        batchId: { type: String },
        isExport: { type: Boolean },
        batchDate: { type: String },
        quotationId: { type: String },
        quotationNo: { type: String },
        batchNo: { type: String },
        enquiryId: { type: String },
        agentadviceId: { type: String },
        branchId: { type: String },
        branchName: { type: String },
        jobCode: { type: String },
        status: { type: Boolean },
        poDate: { type: String },
        statusOfBatch: { type: String },
        enquiryDetails: {
            dgCargoDetails: { type: Object },
            transhipmentHops: { type: Array },
            stuffing_location: { type: Object },
            insurance: { type: Object },
            typeOfWay: { type: String },
            truckType: { type: String },
            wagonType: { type: String },
            containerType: { type: String },
            noOfContainer: { type: Number },
            containerNo: { type: String },
            grossWeightContainer: { type: String },
            unit: { type: String },
            unitName: { type: String },
            agentadviceNo: { type: String },
            agentAdviseStatus: { type: String },
            tenantId: { type: String },
            looseCargoDetails: {
                cargos: [
                    {
                        cbm: { type: String },
                        assignContainer: { type: Object },
                        isContainerAssigned: { type: Boolean },
                        assignedUnits: { type: Number },
                        lclShipperName: { type: String },
                        lclShipper: { type: String },
                        firstName: { type: String },
                        lastName: { type: String },
                        pkgname: { type: String },
                        units: { type: Number },
                        Pallettype: { type: String },
                        lengthp: { type: Number },
                        lengthb: { type: String },
                        Weightb: { type: String },
                        heightb: { type: String },
                        DimensionUnit: { type: String },
                        Weightbox: { type: String },
                        Unit1: { type: String },
                        volumebs: { type: String },
                        volumeb: { type: Number },
                        Weightp: { type: Number },
                        heightp: { type: Number },
                        DimensionUnitp: { type: String },
                        Weightps: { type: Number },
                        weightpsCalculatedplt: { type: String },
                        weightpsCalculatedbox: { type: String },
                        weightpsCalculatedother: { type: String },
                        Unit1p: { type: String },
                        volumep: { type: Number },
                        volumeps: { type: String },
                        heightselected: { type: String },
                        selectedh: { type: String },
                        Weightselected: { type: String },
                        selectedw: { type: String },
                        volumeselect: { type: Number },
                        volumebselecteds: { type: String },
                    }
                ],
                grossWeight: { type: String },
                grossVolume: { type: String }
            },
            charges: [
                {
                    conatiner: { type: String },
                    rates: [
                        {
                            name: { type: String },
                            price: { type: Number },
                            qty: { type: Number },
                            id: { type: String },
                        }
                    ]
                }
            ],
            estimate: {
                minPrice: { type: Number },
                maxPrice: { type: Number },
                finalPrice: { type: Number },
                currency: { type: String },
            },
            orgId: { type: String },
            enquiryId: { type: String },
            cloneEnquiryNo: { type: String },
            cloneEnquiryId: { type: String },
            agentadviceId: { type: String },
            basicDetails: {
                multiShipper: [
                    {
                        partymasterId: { type: String },
                        name: { type: String },
                        partyShortcode: { type: String },
                    }
                ],
                multiConsignee: [
                    {
                        partymasterId: { type: String },
                        name: { type: String },
                        partyShortcode: { type: String },
                    }
                ],
                agentShortName: { type: String },
                consigneeShortName: { type: String },
                shipperShortName: { type: String },
                userBranch: { type: String },
                userBranchName: { type: String },
                userBranchStateCode: { type: String },
                userJobCode: { type: String },
                importShipmentTypeId: { type: String },
                importShipmentTypeName: { type: String },
                billingPartyId: { type: String },
                billingPartyName: { type: String },
                mblNo: { type: String },
                hblNo: { type: String },
                mblStatus: { type: String },
                hblStatus: { type: String },
                bookingRef: { type: String },
                agentName: { type: String },
                agentId: { type: String },
                loadType: { type: String },
                loadTypeId: { type: String },
                ShipmentTypeName: { type: String },
                ShipmentTypeId: { type: String },
                billingPartyId: { type: String },
                billingPartyName: { type: String },
                agentAdviceDate: { type: String },
                enquiryDate: { type: String },
                enquiryTypeId: { type: String },
                enquiryTypeName: { type: String },
                stcQuotationNo: { type: String },
                bookingPartyId: { type: String },
                billingBranch: { type: String },
                billingStateCode: { type: String },
                billingCountry: { type: String },
                bookingPartyName: { type: String },
                invoicingPartyId: { type: String },
                invoicingPartyName: { type: String },
                forwarderId: { type: String },
                forwarderName: { type: String },
                chaId: { type: String },
                chaName: { type: String },
                consigneeId: { type: String },
                consigneeName: { type: String },
                opsCoordinatorId: { type: String },
                salesPersonId: { type: String },
                shipperId: { type: String },
                shipperName: { type: String },
                shippingTermId: { type: String },
                shippingTermName: { type: String },
                batchType: { type: String },
                moveTypeId: { type: String },
                tankTypeId: { type: String },
                tankStatusId: { type: String },
                incoTermId: { type: String },
                incoTermName: { type: String },
                agentAdviceFrom: { type: String },
                agentAdviceTo: { type: String },
                poDate: { type: String },
                cargoTypeId: { type: String },
                notifyPartyId: { type: String },
                notifyPartyName: { type: String },
                moveNo: { type: String },
                enquiryValidFormDate: { type: String },
                enquiryValidToDate: { type: String },
                enquiryValid: { type: Boolean }
            },
            productDetails: {
                biddingDueDate: { type: String },
                cargoReadyDate: { type: String },
                targetDeliveryDate: { type: String }
            },
            cargoDetail: [
                {
                    productId: { type: String },
                    productName: { type: String },
                    properShippingName: { type: String },
                    technicalName: { type: String },
                    commodityType: { type: String },
                    commodityTypeName: { type: String },
                    imcoClass: { type: String },
                    unNo: { type: String },
                    hsCode: { type: String },
                    msdsDoc: { type: String },
                    packingGroup: { type: String },
                    flashPoint: { type: String },
                    marinePollutionId: { type: String },
                    unit: { type: String },
                    unitName: { type: String },
                    grossWeight: { type: String },
                    cargoReadyDate: { type: String },
                    targetDeliveryDate: { type: String },
                    Density: { type: String }
                }
            ],
            routeDetails: {
                voyageNumberforHop: { type: String },
                plannedVesselforHopName: { type: String },
                plannedVesselforHopId: { type: String },
                addressValue: { type: String },
                currency: { type: String },
                des_ata: { type: String },
                destFreeDays: { type: String },
                destPortId: { type: String },
                destPortName: { type: String },
                detentionCurrency: { type: String },
                exchangeRate: { type: String },
                final_ATA: { type: String },
                final_ETA: { type: String },
                final_destinationId: { type: String },
                final_destinationtName: { type: String },
                finalShippingLineId: { type: String },
                finalShippingLineName: { type: String },
                finalVesselId: { type: String },
                finalVesselName: { type: String },
                finalVoyageId: { type: String },
                finalVoyageName: { type: String },
                first_ata: { type: String },
                flightNo: { type: String },
                icdCfsValueId: { type: String },
                icdCfsValueName: { type: String },
                icdOrAdress: { type: String },
                lineVoyageNo: { type: String },
                loadPlace: { type: String },
                loadPortId: { type: String },
                loadPortName: { type: String },
                originFreeDays: { type: String },
                podAta: { type: String },
                podCurrency: { type: String },
                polAtd: { type: String },
                portOfTranshipmentId: { type: String },
                portOfTranshipmentName: { type: String },
                preCarriageId: { type: String },
                rail: { type: Boolean },
                railName: { type: String },
                railNumber: { type: String },
                transhipmentATA: { type: String },
                transhipmentATD: { type: String },
                transhipmentVesselId: { type: String },
                transhipmentVesselName: { type: String },
                ts_port1: { type: String },
                ts_port2: { type: String },
                vehicleNo: { type: String },
                eta: { type: String },
                etd: { type: String },
                loadPlace: { type: String },
                loadPlaceName: { type: String },
                state: { type: String },
                preCarriageId: { type: String },
                preCarriageName: { type: String },
                loadPortId: { type: String },
                loadPortName: { type: String },
                location: { type: String },
                locationName: { type: String },
                destPortId: { type: String },
                destPortName: { type: String },
                onCarriageId: { type: String },
                onCarriageName: { type: String },
                fpodId: { type: String },
                fpodName: { type: String },
                haulageTypeId: { type: String },
                wagonNo: { type: String },
                vehicleNo: { type: String },
                destHaulageId: { type: String },
                freightTerms: { type: String },
                freightTermsName: { type: String },
                shippingLineId: { type: String },
                shippingLineName: { type: String },
                shippingLineValidFrom: { type: String },
                shippingLineValidTo: { type: String },
                shippingLineValid: { type: Boolean },
                tsPortId: { type: String },
                shippingLineShortName: { type: String },
                lineVoyageNo: { type: String },
                destinationCustomClearance: { type: String },
                originCustomClearance: { type: String }
            },
            customDetails: {
                customDestinationLocation: { type: String },
                customDestinationLocationName: { type: String },
                customOriginLocationName: { type: String },
                customOriginLocation: { type: String },
                transportOrigin: { type: String },
                transportDestination: { type: String },
                customOrigin: { type: String },
                customDestination: { type: String },
                originOption: { type: String },
                destinationOption: { type: String },
                originfactory: { type: String },
                destinationfactory: { type: String },
                originPickupAddress: { type: String },
                destinationDeliveryAddress: { type: String }
            },
            detentionDetails: {
                polFreeDay: { type: String },
                polDetentionAmount: { type: String },
                polDetentionCurrencyId: { type: String },
                polDetentionCurrencyName: { type: String },
                podFreeDay: { type: String },
                podDetentionAmount: { type: String },
                podDetentionCurrencyId: { type: String },
                podDetentionCurrencyName: { type: String }
            },
            grossWeightContainer: { type: String },
            backupShippingLine: { type: String },
            backupShippingLineName: { type: String },
            remarksList: [],
            remarks: { type: String },
            enquiryStatus: { type: String },
            status: { type: Boolean },
            containersDetails: [
                {
                    typeOfWay: { type: String },
                    truckType: { type: String },
                    wagonType: { type: String },
                    containerType: { type: String },
                    noOfContainer: { type: Number },
                    grossWeightContainer: { type: String },
                    unit: { type: String },
                    unitName: { type: String },
                }
            ],
            transportDetails: {
                preCarriage: { type: Boolean },
                onCarriage: { type: Boolean },
                origin: [
                    {
                        transpoterType: { type: String },
                        locationType: { type: String },
                        location: { type: String },
                        locationName: { type: String },
                        etd: { type: String },
                        eta: { type: String },
                        address: { type: String },
                        addressText: { type: String },
                        addressId: { type: String },
                        branch: { type: String },
                        transit: { type: String },
                        carrier: { type: String },
                        carrierList: [
                            {
                                shippinglineId: { type: String },
                                name: { type: String },
                            }
                        ],
                        carrierName: { type: String },
                    }
                ],
                destination: [
                    {
                        transpoterType: { type: String },
                        locationType: { type: String },
                        location: { type: String },
                        locationName: { type: String },
                        etd: { type: String },
                        eta: { type: String },
                        address: { type: String },
                        addressText: { type: String },
                        addressId: { type: String },
                        branch: { type: String },
                        transit: { type: String },
                        carrier: { type: String },
                        carrierList: [
                            {
                                shippinglineId: { type: String },
                                name: { type: String },
                            }
                        ],
                        carrierName: { type: String },
                    }
                ]
            },
            referenceId: { type: String },
            createdOn: { type: String },
            updatedOn: { type: String },
            createdBy: { type: String },
            createdByUID: { type: String },
            updatedBy: { type: String },
            updatedByUID: { type: String },
            enquiryNo: { type: String },
            quotationCounter: { type: Number },
        },
        quotationDetails: {
            shipperName: { type: String },
            flightId: { type: String },
            flightNo: { type: String },
            orgId: { type: String },
            tenantId: { type: String },
            carrierShortName: { type: String },
            quotationId: { type: String },
            enquiryId: { type: String },
            agentadviceId: { type: String },
            agentadviceNo: { type: String },
            validFrom: { type: String },
            validTo: { type: String },
            enquiryNo: { type: String },
            currency: { type: String },
            currencyShortName: { type: String },
            exRate: { type: Number },
            carrierId: { type: String },
            carrierName: { type: String },
            carrierReceiptId: { type: String },
            etd: { type: String },
            loadPortId: { type: String },
            loadPortName: { type: String },
            dischargePortId: { type: String },
            dischargePortName: { type: String },
            eta: { type: String },
            vesselId: { type: String },
            vesselName: { type: String },
            voyageNumber: { type: String },
            carrierDeliveryId: { type: String },
            destPortFreeDays: { type: Number },
            originFreeDays: { type: Number },
            destFreeDays: { type: Number },
            totalBuy: { type: Number },
            totalSell: { type: Number },
            remarks: { type: String },
            branchId: { type: String },
            branchName: { type: String },
            branchStateCode: { type: String },
            jobCode: { type: String },
            quoteStatus: { type: String },
            status: { type: Boolean },
            referenceId: { type: String },
            createdOn: { type: String },
            updatedOn: { type: String },
            createdBy: { type: String },
            createdByUID: { type: String },
            updatedBy: { type: String },
            updatedByUID: { type: String },
            quotationNo: { type: String }
        },
        routeDetails: {
            emailBeforeArrivalSent: { type: Boolean, default: false },
            samePOD: { type: Boolean },
            transhipmentVoyage: { type: String },
            railETD: { type: String },
            railATD: { type: String },
            addressValue: { type: String },
            currency: { type: String },
            des_ata: { type: String },
            destFreeDays: { type: String },
            destPortId: { type: String },
            destPortName: { type: String },
            detentionCurrency: { type: String },
            exchangeRate: { type: String },
            final_ATA: { type: String },
            final_ETA: { type: String },
            final_destinationId: { type: String },
            final_destinationtName: { type: String },
            finalShippingLineId: { type: String },
            finalShippingLineName: { type: String },
            finalVesselId: { type: String },
            finalVesselName: { type: String },
            finalVoyageId: { type: String },
            finalVoyageName: { type: String },
            first_ata: { type: String },
            flightNo: { type: String },
            transhipment: { type: Boolean },
            icdCfsValueId: { type: String },
            icdCfsValueName: { type: String },
            icdOrAdress: { type: String },
            lineVoyageNo: { type: String },
            loadPlace: { type: String },
            loadPortId: { type: String },
            loadPortName: { type: String },
            originFreeDays: { type: String },
            podAta: { type: String },
            polAtd: { type: String },
            podCurrency: { type: String },
            polAtd: { type: String },
            portOfTranshipmentId: { type: String },
            portOfTranshipmentName: { type: String },
            preCarriageId: { type: String },
            rail: { type: Boolean },
            railName: { type: String },
            railNumber: { type: String },
            railCurrentLocation: { type: String },
            transhipmentATA: { type: String },
            transhipmentATD: { type: String },
            transhipmentETA: { type: String },
            transhipmentETD: { type: String },
            transhipmentVesselId: { type: String },
            transhipmentVesselName: { type: String },
            ts_port1: { type: String },
            ts_port2: { type: String },
            vehicleNo: { type: String },
            etd: { type: String },
            eta: { type: String },
            atd: { type: String },
            ata: { type: String },
            portInDate: { type: String }
        },
        vehicleDetails: [
            {
                vehicleId: { type: String },
                vehicleNo: { type: String },
                vehicleType: { type: String },
                engineNumber: { type: String },
                driverId: { type: String },
                driverName: { type: String },
                driverContactNumber: { type: String },
                driverLicenseNumber: { type: String },
                driver1Id: { type: String },
                driver1Name: { type: String },
                driver1ContactNumber: { type: String },
                driver1LicenseNumber: { type: String },
            }
        ]
    },
    "auditlog": {
        orgId: {
            type: String
        },
        auditlogId: {
            type: String,
            required: true
        },
        auditLogType: {
            type: String,
            required: true
        },
        collection: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        timestamp: {
            type: String,
            required: true
        },
        azureBlobFile: {
            type: String,
            required: true
        },
    },
    "batchartifact": {
        orgId: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        batchartifactId: {
            type: String,
            required: true
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        batchId: {
            type: String
        },
        email: {
            type: String
        },
        type: {
            type: String
        }
    },
    "creditdebitnote": {
        orgId: {
            type: String
        },
        createdOn: {
            type: String,
            required: true,
        },
        creditdebitnoteId: {
            type: String,
            required: true
        },
        creditNoteNo: {
            type: String
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String, required: true },
        invoiceId: { type: String, required: true },
        creditDate: { type: Date, required: true },
        invoiceType: { type: String, required: true },
        remarks: { type: String, default: '' },
        invoiceNumber: { type: String, required: true },
        invoiceParty: { type: String, required: true },
        creditToId: { type: String, required: true },
        creditToName: { type: String, required: true },
        isCredit: { type: Boolean, required: true },
        amountReceived: { type: Number, required: true },
        invoiceAmount: { type: String, required: true },
        invoiceTaxAmount: { type: String, required: true },
        documents: [],
        paymentTerms: { type: String, default: '' },
        costItems: [
            {
                tenantId: { type: String, required: true },
                enquiryitemId: { type: String, required: true },
                enquiryId: { type: String, default: '' },
                enquiryNumber: { type: String, required: true },
                enqDate: { type: Date, required: true },
                collectPort: { type: String, required: true },
                containerType: { type: String, required: true },
                stcQuotationNo: { type: String, required: true },
                enqType: { type: String, required: true },
                costItemId: { type: String, required: true },
                accountBaseCode: { type: String, required: true },
                costItemName: { type: String, required: true },
                costHeadId: { type: String, default: '' },
                currency: { type: String, required: true },
                exchangeRate: { type: String, default: '' },
                amount: { type: Number, default: 0 },
                baseAmount: { type: String, default: '' },
                tenantMargin: { type: Number },
                tax: [
                    {
                        taxAmount: { type: Number, required: true },
                        taxRate: { type: Number, required: true },
                    }
                ],
                quantity: { type: Number, required: true },
                rate: { type: Number, required: true },
                stcAmount: { type: Number, required: true },
                jmbAmount: { type: Number, required: true },
                payableAt: { type: String, default: '' },
                gst: { type: Number, default: 0 },
                totalAmount: { type: Number, required: true },
                chargeTerm: { type: String, required: true },
                remarks: { type: String, default: '' },
                containerNumber: { type: String },
                shippingLine: { type: String, default: '' },
                taxApplicability: { type: String, required: true },
                hsnCode: { type: String, required: true },
                isFreight: { type: Boolean, required: true },
                referenceId: { type: String, required: true },
                createdOn: { type: Date, required: true },
                updatedOn: { type: Date, required: true },
                createdBy: { type: String, required: true },
                createdByUID: { type: String, required: true },
                updatedBy: { type: String, required: true },
                updatedByUID: { type: String, required: true },
                isEnquiryCharge: { type: Boolean, required: true },
                batchId: { type: String, required: true },
                moveNumber: { type: Number, default: 0 },
                batchNo: { type: String, required: true },
                agentadviceId: { type: String, default: '' },
                orgId: { type: String, required: true },
                vendorId: { type: String, default: '' },
                vendorName: { type: String, default: '' },
                exemp: { type: Boolean, default: false },
                isSelected: { type: Boolean, default: true },
                currencyShippingLine: { type: String, required: true },
                exRateShippingLine: { type: Number, default: 1 },
                taxAmount: { type: Number, default: 0 },
                gstType: { type: String, required: true },
                igst: { type: Number, default: 0 },
                cgst: { type: Number, default: 0 },
                sgst: { type: Number, default: 0 },
                refundAmount: { type: Number, required: true },
                isRefundSelected: { type: Boolean, default: true },
                jmb: { type: Boolean, default: true },
                isRefunds: { type: Boolean, default: true },
                refundPendingAmount: { type: Number, default: 0 },
            }
        ],
        refundBase: { type: Boolean, default: true },
        reasonId: { type: String, required: true },
        reason: { type: String, required: true },
        bankType: { type: String, default: '' },
        moveNo: { type: Number, default: null },
        batchId: { type: String, required: true },
        vesselName: { type: String, required: true },
        voyageNumber: { type: String, required: true },
        paymentMode: { type: String, required: true },
        payment_ref_no: { type: String, required: true },
        currency: { type: String, required: true },
        isExport: { type: Boolean, required: true },
        status: { type: Boolean, required: true },

        gstType: { type: String, required: true },
        creditdebitnoteId: { type: String, required: true },
    },
    "exchangerate": {
        date: { type: String },
        conversionRates: {}
    },
    "event": {
        transhipmentHopId: { type: String },
        referenceUpdatedFrom: { type: String },
        sentNotification: { type: Boolean, },
        eventData: {
            type: Object
        },
        orgId: {
            type: String
        },
        eventModule: {
            type: String,
        },

        eventType: {
            type: String,
        },

        eventTag: {
            type: String,
        },

        eventName: {
            type: String,
        },

        eventSeq: {
            type: Number,
        },

        batchRefNo: {
            type: String,
        },

        eventActualDate: {
            type: String,
        },

        eventEstimatedDate: {
            type: String,
        },

        locationTag: {
            type: String,
        },

        location: {

            locationId: {
                type: String,
            },

            locationName: {
                type: String,
            }

        },

        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        eventId: {
            type: String,
        },

        entityId: {
            type: String,
        },
        entitysubId: {
            type: String,
        },
        milestonemasterId: {
            type: String,
        },
        isUpdated: {
            type: Boolean
        },
        referenceType: {
            type: String,
        }
    },
    "milestone": {
        orgId: {
            type: String
        },
        eventModule: {
            type: String,
        },

        eventType: {
            type: String,
        },

        eventTag: {
            type: String,
        },

        eventName: {
            type: String,
        },

        eventSeq: {
            type: String,
        },

        batchRefNo: {
            type: String,
        },

        eventActualDate: {
            type: String,
        },

        eventEstimatedDate: {
            type: String,
        },

        locationTag: {
            type: String,
        },

        location: {

            locationId: {
                type: String,
            },

            locationName: {
                type: String,
            }

        },

        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String, required: true },
        eventId: {
            type: String,
        },
        milestoneId: {
            type: String,
        },
        entityId: {
            type: String,
        },
        entitysubId: { type: String },
        event_payload: {

        },
        referenceType: { type: String }
    },
    "custom": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        orgId: {
            type: String
        },
        customNo: { type: String },
        customDate: { type: String },
        countryId: { type: String },
        locationId: { type: String },
        locationName: { type: String },
        clearanceLocation: { type: String },
        currentQueue: { type: String },
        entryType: { type: String },
        currency: { type: String },
        exchangeRate: { type: String },
        fillingType: { type: String },
        cargoValue: { type: String },
        freightValue: { type: String },
        InsuranceValue: { type: String },
        GrossWeight: { type: String },
        NetWeight: { type: String },
        CargoVolume: { type: String },
        InvoiceValue: { type: String },
        FOBValue: { type: String },
        CIFValue: { type: String },
        PaymentBy: { type: String },
        DutyAmount: { type: String },
        DateToDuty: { type: String },
        Dutyfree: { type: String },
        AssessableValue: { type: String },
        StampDuty: { type: String },
        countryName: { type: String },
        currencyName: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        customId: { type: String }
    },
    "carrierbooking": {
        carrierbookingId: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        basicDetails: {
            Carrier: { type: String },
            BookingNumber: { type: String },
            BookingParty: { type: String },
            BookingDate: { type: String },
            BookingPartys: { type: String },
            OrderBy: { type: String },
            RAnumber: { type: String }
        },
        cargoDetaiks: {
            cargo: [
                {
                    checkbox: { type: Boolean },
                    RAnumbers: { type: String },
                    Commodity: { type: String },
                    CargoDescription: { type: String },
                    Packages: { type: String },
                    PackageType: { type: String },
                    GrossWeight: { type: String },
                    Unit: { type: String },
                    skills: [
                        {
                            checkbox1: { type: Boolean },
                            PackageType1: { type: String },
                            pieces: { type: String },
                            Length: { type: Number },
                            Width: { type: Number },
                            height: { type: Number },
                            DimensionUnit: { type: String },
                            PerpieceWt: { type: String },
                            Unit1: { type: String },
                        }
                    ]
                }
            ]
        },
        containerDetails: {
            tableRows: [
                {
                    ischeckbox: { type: Boolean },
                    ContainerType: { type: String },
                    checkboxs: { type: Boolean },
                    Quantity: { type: Number },
                    gwcontainer: { type: Number },
                    ShipperOwned: { type: Boolean },
                }
            ],
            company: { type: String },
            ContainerRows: []
        },
        preCareer: {
            preCareers: [
                {
                    PreOrigin: { type: String },
                    PreETD: { type: String },
                    ModeofTransit: { type: String },
                    PreVoyagenumber: { type: String },
                    PreDestination: { type: String },
                    PreETA: { type: String },
                    customSkills: [
                        {
                            PreTranshipmentHop: { type: String },
                            PreTransETA: { type: String },
                            PreTransETD: { type: String },
                            PreModeofTransit: { type: String },
                            isPreVoyagenumber: { type: String }
                        }
                    ]
                }
            ]
        },
        vesselDetails: {
            vessels: [
                {
                    Origin: { type: String },
                    Terminal: { type: String },
                    ETD: { type: String },
                    ETA: { type: String },
                    Vessel: { type: String },
                    Voyagenumber: { type: String },
                    Destination: { type: String },
                    Terminals: { type: String },
                    details: [
                        {
                            TranshipmentHop: { type: String },
                            TransTerminal: { type: String },
                            TransETA: { type: String },
                            TransETD: { type: String },
                            isVessel: { type: String },
                            isVoyagenumber: { type: String }
                        }
                    ]
                }
            ]
        },
        carriageForm: {
            carriages: [
                {
                    OnOrigin: { type: String },
                    OnETD: { type: String },
                    OnModeofTransit: { type: String },
                    OnVoyagenumber: { type: String },
                    OnDestination: { type: String },
                    OnETA: { type: String },
                    carriageProperties: [
                        {
                            OnTranshipmentHop: { type: String },
                            OnTransETA: { type: String },
                            OnTransETD: { type: String },
                            OnIsModeofTransit: { type: String },
                            OnIsVoyagenumber: { type: String }
                        }
                    ]
                }
            ]
        },
        confirmationDetailsform: {
            checkboxa: { type: String },
            Validitydate: { type: String },
            PickupLocation: { type: String },
            OpenCutoff: { type: String },
            CloseCutoff: { type: String },
            SIcutoff: { type: String },
            Handovercutoff: { type: String },
            DetentionFreeDays: { type: Number },
            DemurrageFreeDays: { type: Number },
            DestinationFreeDay: { type: Number },
            DestinationDemurrageFreeDays: { type: Number }
        },
        otherDetailsForm: {
            Remarks: { type: String },
        },
        docForm: {
            Doc: { type: String }
        }
    },
    "trigger": {
        inAppNotification: {},

        triggerId: { type: String },
        triggerParams: {

        },
    },
    "ratemaster": {
        costItems: [
            {
                costItemGroup: { type: String },
                name: { type: String },
                parameter: { type: String },
                cargo: [
                    {
                        item_id: { type: String },
                        item_text: { type: String },
                    }
                ],
                supplier: { type: String },
                vesselPurpose: [
                    {
                        item_id: { type: String },
                        item_text: { type: String },
                    }
                ],
                operationAt: [
                    {
                        item_id: { type: String },
                        item_text: { type: String },
                    }
                ],
                steps: [
                    {
                        seqNo: { type: Number },
                        flat: { type: Boolean },
                        break: { type: Boolean },
                        parameterMin: { type: String },
                        parameterMax: { type: String },
                        unitRate: { type: String },
                        rate: { type: String },
                        minRate: { type: String },
                        maxRate: { type: String },
                        discount: { type: String },
                        surcharge: { type: String },
                        surcharges: [
                            {
                                parameter: { type: String },
                                timeFrom: { type: String },
                                timeTo: { type: String },
                                dayFrom: { type: String },
                                dayTo: { type: String },
                                monthFrom: { type: String },
                                monthTo: { type: String },
                                value: { type: String },
                                surcharge: { type: String },
                                surchargeType: { type: String },
                            }
                        ]
                    }
                ],
                ruleSteps: [],
                unitType: { type: String },
                itemDocument: [],
                vesselUnitType: { type: String },
                area: { type: Boolean },
                shipStatus: [
                    {
                        item_id: { type: String },
                        item_text: { type: String },
                    }
                ],
                vesselCall: [
                    {
                        item_id: { type: String },
                        item_text: { type: String },
                    }
                ],
                tariffBasedOn: { type: String },
                direction: { type: String },
                remarks: { type: String },
                currency: { type: String },
                validFrom: { type: String },
                validTo: { type: String },
                seqNo: { type: Number },
                costitem: { type: String },
                currencyCode: { type: String },
            }
        ],
        berth: [
            {
                item_id: { type: String },
                item_text: { type: String },
            }
        ],
        terminal: [
            {
                item_id: { type: String },
                item_text: { type: String },
            }
        ],
        vesselType: [
            {
                item_id: { type: String },
                item_text: { type: String },
            }
        ],
        country: { type: String },
        countryName: { type: String },
        docRefNo: { type: String },
        port: { type: String },
        portName: { type: String },
        ShipmentTypeName: { type: String },
        ShipmentTypeId: { type: String },
        freightTermName: { type: String },
        freightTermId: { type: String },
        cargoTypeId: { type: String },
        cargoType: { type: String },
        currencyId: { type: String },
        ratemasterId: { type: String },
        fromLocationId: { type: String },
        fromLocationName: { type: String },
        toLocationId: { type: String },
        toLocationName: { type: String },
        containerSize: { type: String },
        containerTypeId: { type: String },
        shippinglineId: { type: String },
        shippinglinePort: { type: String },
        shippinglineCode: { type: String },
        shippinglineName: { type: String },
        isCustomOrigin: { type: String },
        isCustomDestination: { type: String },
        estimatedRate: { type: Number },
        charges: [
            {
                chargeName: { type: String },
                basis: { type: String },
                qty: { type: Number },
                price: { type: Number },
                checkboxs: { type: Boolean },
                costitemName: { type: String }
            }
        ],
        createdOn: {
            type: String,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        status: { type: String },
        currency: { type: String },
        exchange: { type: String },
        orgId: { type: String }
    },
    "email": {
        batchId: { type: String },
        emails: [
            {
                from: { type: String },
                to: [],
                cc: [],
                subject: { type: String },
                text: { type: String },
                html: { type: String },
                createdOn: { type: String },
                isReply: { type: Boolean },
                attachments: [
                    {
                        name: { type: String },
                        attchmentId: { type: String },
                        contentType: { type: String },
                        size: { type: Number },
                    }
                ]
            }
        ],
        emailId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
    },
    "emailtemplate": {
        referenceName: { type: String },
        emailtemplateId: { type: String, required: true },
        orgId: { type: String, required: true },
        tenantId: { type: String, required: true },
        subject: { type: String, required: true },
        header: { type: String },
        body: { type: String, required: true },
        footer: { type: String },
        emailName: { type: String },
        EmailName: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        }
    },
    "consolidationbooking": {
        portId: {
            portId: { type: String },
            portName: { type: String },
        },
        shipmentTypeId: { type: String },
        shipmentTypeName: { type: String },
        shippinglineId: { type: String },
        status: { type: Boolean },
        vehicleId: { type: String },
        flightId: { type: String },
        flightNo: { type: String },
        isExport: { type: Boolean },
        vehicleNo: { type: String },
        vesselId: { type: String },
        vesselName: { type: String },
        voyage: { type: String },
        carrierId: { type: String },
        carrierName: { type: String },
        containerList: [
            {
                isSelected: { type: Boolean },
                yard: { type: String },
                yardNamId: { type: String }
            }
        ],
        consolidationbookingNo: { type: String },
        consolidationbookingId: { type: String },
        containerTypeNumber: { type: String },
        yardName: { type: String },
        containerId: { type: String },
        yardId: { type: String },
        batchList: [
            {
                tenantId: { type: String },
                customerId: { type: String },
                orgId: { type: String },
                batchId: { type: String },
                isExport: { type: Boolean },
                batchDate: { type: String },
                quotationId: { type: String },
                quotationNo: { type: String },
                enquiryId: { type: String },
                amount: { type: Number },
                agentadviceId: { type: String },
                branchId: { type: String },
                branchName: { type: String },
                jobCode: { type: String },
                status: { type: Boolean },
                poDate: { type: String },
                statusOfBatch: { type: String },
                enquiryDetails: {
                    tenantId: { type: String },

                    orgId: { type: String },
                    customerId: { type: String },
                    enquiryId: { type: String },
                    cloneEnquiryNo: { type: String },
                    cloneEnquiryId: { type: String },
                    agentadviceId: { type: String },
                    basicDetails: {
                        agentAdviceDate: { type: String },
                        enquiryDate: { type: String },
                        enquiryTypeId: { type: String },
                        enquiryTypeName: { type: String },
                        stcQuotationNo: { type: String },
                        bookingPartyId: { type: String },
                        billingBranch: { type: String },
                        billingStateCode: { type: String },
                        billingCountry: { type: String },
                        bookingPartyName: { type: String },
                        bookingPartyCurrency: { type: String },
                        invoicingPartyId: { type: String },
                        invoicingPartyName: { type: String },
                        forwarderId: { type: String },
                        forwarderName: { type: String },
                        consigneeId: { type: String },
                        consigneeName: { type: String },
                        ShipmentTypeId: { type: String },
                        ShipmentTypeName: { type: String },
                        opsCoordinatorId: { type: String },
                        salesPersonId: { type: String },
                        shipperId: { type: String },
                        shipperName: { type: String },
                        shipperCurrency: { type: String },
                        shippingTermId: { type: String },
                        shippingTermName: { type: String },
                        batchType: { type: String },
                        moveTypeId: { type: String },
                        tankTypeId: { type: String },
                        tankStatusId: { type: String },
                        incoTermId: { type: String },
                        incoTermName: { type: String },
                        agentAdviceFrom: { type: String },
                        agentAdviceTo: { type: String },
                        poDate: { type: String },
                        cargoTypeId: { type: String },
                        notifyPartyId: { type: String },
                        notifyPartyName: { type: String },
                        moveNo: { type: String },
                        enquiryValidFormDate: { type: String },
                        enquiryValidToDate: { type: String },
                        enquiryValid: { type: Boolean },
                    },
                    productDetails: {
                        cargoReadyDate: { type: String },
                        targetDeliveryDate: { type: String },
                    },
                    cargoDetail: [
                        {
                            productId: { type: String },
                            productName: { type: String },
                            properShippingName: { type: String },
                            technicalName: { type: String },
                            commodityType: { type: String },
                            commodityTypeName: { type: String },
                            imcoClass: { type: String },
                            unNo: { type: String },
                            hsCode: { type: String },
                            packingGroup: { type: String },
                            flashPoint: { type: String },
                            marinePollutionId: { type: String },
                            unit: { type: String },
                            grossWeight: { type: String },
                            cargoReadyDate: { type: String },
                            targetDeliveryDate: { type: String },
                            Density: { type: String },
                        }
                    ],
                    routeDetails: {
                        loadPlace: { type: String },
                        preCarriageId: { type: String },
                        preCarriageName: { type: String },
                        loadPortId: { type: String },
                        loadPortName: { type: String },
                        location: { type: String },
                        locationName: { type: String },
                        destPortId: { type: String },
                        destPortName: { type: String },
                        onCarriageId: { type: String },
                        onCarriageName: { type: String },
                        fpodId: { type: String },
                        fpodName: { type: String },
                        haulageTypeId: { type: String },
                        wagonNo: { type: String },
                        vehicleNo: { type: String },
                        destHaulageId: { type: String },
                        freightTerms: { type: String },
                        freightTermsName: { type: String },
                        shippingLineId: { type: String },
                        shippingLineName: { type: String },
                        shippingLineValidFrom: { type: String },
                        shippingLineValidTo: { type: String },
                        shippingLineValid: { type: Boolean },
                        tsPortId: { type: String },
                        lineVoyageNo: { type: String },
                        destinationCustomClearance: { type: String },
                        originCustomClearance: { type: String },
                    },
                    customDetails: {
                        transportOrigin: { type: Boolean },
                        transportDestination: { type: Boolean },
                        customOrigin: { type: Boolean },
                        customDestination: { type: Boolean },
                        originOption: { type: String },
                        destinationOption: { type: String },
                        originfactory: { type: Boolean },
                        destinationfactory: { type: Boolean },
                        originPickupAddress: { type: String },
                        destinationDeliveryAddress: { type: String },
                    },
                    detentionDetails: {
                        polFreeDay: { type: String },
                        polDetentionAmount: { type: String },
                        polDetentionCurrencyId: { type: String },
                        polDetentionCurrencyName: { type: String },
                        podFreeDay: { type: String },
                        podDetentionAmount: { type: String },
                        podDetentionCurrencyId: { type: String },
                        podDetentionCurrencyName: { type: String },
                    },
                    grossWeightContainer: { type: String },
                    backupShippingLine: { type: String },
                    backupShippingLineName: { type: String },
                    remarksList: [],
                    remarks: { type: String },
                    enquiryStatusCustomer: { type: String },
                    enquiryStatus: { type: String },
                    status: { type: Boolean },
                    containersDetails: [],
                    looseCargoDetails: {
                        cargos: [
                            {
                                firstName: { type: String },
                                lastName: { type: String },
                                pkgname: { type: String },
                                units: { type: Number },
                                Pallettype: { type: String },
                                lengthp: { type: Number },
                                lengthb: { type: String },
                                Weightb: { type: String },
                                heightb: { type: String },
                                DimensionUnit: { type: String },
                                Weightbox: { type: String },
                                Unit1: { type: String },
                                volumebs: { type: String },
                                volumeb: { type: Number },
                                Weightp: { type: Number },
                                heightp: { type: Number },
                                DimensionUnitp: { type: String },
                                Weightps: { type: String },
                                weightpsCalculatedplt: { type: String },
                                weightpsCalculatedbox: { type: String },
                                weightpsCalculatedother: { type: String },
                                Unit1p: { type: String },
                                volumep: { type: Number },
                                volumeps: { type: String },
                                heightselected: { type: String },
                                selectedh: { type: String },
                                Weightselected: { type: String },
                                selectedw: { type: String },
                                volumeselect: { type: Number },
                                volumebselecteds: { type: String },
                            }
                        ]
                    },
                    referenceId: { type: String },
                    createdOn: { type: String },
                    updatedOn: { type: String },
                    createdBy: { type: String },
                    createdByUID: { type: String },
                    updatedBy: { type: String },
                    updatedByUID: { type: String },
                    enquiryNo: { type: String }
                },
                quotationDetails: {
                    orgId: { type: String },
                    tenantId: { type: String },

                    quotationId: { type: String },
                    enquiryId: { type: String },
                    agentadviceId: { type: String },
                    agentadviceNo: { type: String },
                    validFrom: { type: String },
                    validTo: { type: String },
                    enquiryNo: { type: String },
                    currency: { type: String },
                    currencyShortName: { type: String },
                    exRate: { type: Number },
                    carrierId: { type: String },
                    carrierName: { type: String },
                    carrierReceiptId: { type: String },
                    carrierReceiptName: { type: String },
                    etd: { type: String },
                    loadPortId: { type: String },
                    loadPortName: { type: String },
                    dischargePortId: { type: String },
                    dischargePortName: { type: String },
                    eta: { type: String },
                    vesselId: { type: String },
                    vesselName: { type: String },
                    voyageNumber: { type: String },
                    carrierDeliveryId: { type: String },
                    destPortFreeDays: { type: Number },
                    originFreeDays: { type: Number },
                    destFreeDays: { type: Number },
                    totalBuy: { type: Number },
                    totalBuyTax: { type: Number },
                    totalSell: { type: Number },
                    totalSellTax: { type: Number },
                    remarks: { type: String },
                    branchId: { type: String },
                    branchName: { type: String },
                    branchStateCode: { type: String },
                    jobCode: { type: String },
                    quoteStatus: { type: String },
                    status: { type: Boolean },
                    referenceId: { type: String },
                    createdOn: { type: String },
                    updatedOn: { type: String },
                    createdBy: { type: String },
                    createdByUID: { type: String },
                    updatedBy: { type: String },
                    updatedByUID: { type: String },
                    quotationNo: { type: String },
                },
                routeDetails: {
                    etd: { type: String },
                    eta: { type: String },
                    atd: { type: String },
                    ata: { type: String },
                },
                referenceId: { type: String },
                createdOn: { type: String },
                updatedOn: { type: String },
                createdBy: { type: String },
                createdByUID: { type: String },
                updatedBy: { type: String },
                updatedByUID: { type: String },
                batchNo: { type: String },
                assignContainer: {
                    containerNo: { type: String },
                    orgId: { type: String },
                    cargoNo: { type: String },
                    cargoTypeName: { type: String },
                    containerTypeId: { type: String },
                    containerType: { type: String },
                    containerSize: { type: String },
                    containerHeight: { type: String },
                    tankStatusId: { type: String },
                    tankStatus: { type: String },
                    tankType: { type: String },
                    tarWeight: { type: String },
                    tankCapacity: { type: String },
                    exitOffHireDate: { type: String },
                    onHireDate: { type: String },
                    dateOfManufacture: { type: String },
                    oneWay: { type: Boolean },
                    loadCapacity: { type: String },
                    containerOperator: { type: String },
                    pickLocation: { type: String },
                    dropLocation: { type: String },
                    yard: { type: String },
                    yardName: { type: String },
                    soc: { type: Boolean },
                    maxGrossWeight: { type: String },
                    maxPayload: { type: String },
                    baffles: { type: Boolean },
                    remarks: { type: String },
                    status: { type: Boolean },

                    containerStatus: { type: String },
                    containerStatusId: { type: Boolean },
                    referenceId: { type: String },
                    containermasterId: { type: String },
                    createdOn: { type: String },
                    updatedOn: { type: String },
                    tenantId: { type: String },
                    createdBy: { type: String },
                    createdByUID: { type: String },
                    updatedBy: { type: String },
                    updatedByUID: { type: String },
                    blno: { type: Number },
                    bookingref: { type: String },
                    customCode: { type: String },
                    doDate: { type: String },
                    principal: { type: String },
                    shippingBill: { type: String },
                    volume: { type: Number },
                    availableVolume: { type: Number },
                    isAssigned: { type: Boolean },
                },
                consolidateBookingCreated: { type: Boolean },
                consolidationBookingId: { type: String },
                consolidationbookingNo: { type: String },
                isContainerAssigned: { type: Boolean },
                palletDetails: [
                    {
                        firstName: { type: String },
                        lastName: { type: String },
                        pkgname: { type: String },
                        units: { type: Number },
                        Pallettype: { type: String },
                        lengthp: { type: Number },
                        lengthb: { type: String },
                        Weightb: { type: String },
                        heightb: { type: String },
                        DimensionUnit: { type: String },
                        Weightbox: { type: String },
                        Unit1: { type: String },
                        volumebs: { type: String },
                        volumeb: { type: Number },
                        Weightp: { type: Number },
                        heightp: { type: Number },
                        DimensionUnitp: { type: String },
                        Weightps: { type: Number },
                        weightpsCalculatedplt: { type: String },
                        weightpsCalculatedbox: { type: String },
                        weightpsCalculatedother: { type: String },
                        Unit1p: { type: String },
                        volumep: { type: Number },
                        volumeps: { type: String },
                        heightselected: { type: String },
                        selectedh: { type: String },
                        Weightselected: { type: String },
                        selectedw: { type: String },
                        volumeselect: { type: Number },
                        volumebselecteds: { type: String },
                    }
                ]
            }
        ],
        tenantId: { type: String, required: true },
        orgId: { type: String, required: true },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        items: [
            {
                isBlCreated: { type: Boolean },
                blNo: { type: String },
                blId: { type: String },
                lclShipper: { type: String },
                lclShipperName: { type: String },
                packageType: { type: String },
                length: { type: Number },
                width: { type: Number },
                height: { type: Number },
                unit: { type: String },
                quantity: { type: Number },
                weight: { type: String },
                volume: { type: String },
                ref: { type: String },
                description: { type: String },
                binSelection: { type: Number },
                consigneeId: { type: String },
                consigneeName: { type: String },
                shipperId: { type: String },
                shipperName: { type: String },
                uniqueRefNo: { type: String },
                qrId: { type: String },
                grnId: { type: String },
                assignContainer: {
                    tenantId: { type: String },
                    orgId: { type: String },
                    containerNo: { type: String },
                    cargoNo: { type: String },
                    cargoTypeName: { type: String },
                    containerTypeId: { type: String },
                    containerType: { type: String },
                    containerSize: { type: String },
                    tankStatusId: { type: String },
                    tankType: { type: String },
                    tarWeight: { type: String },
                    tankCapacity: { type: String },
                    exitOffHireDate: { type: String },
                    onHireDate: { type: String },
                    dateOfManufacture: { type: String },
                    oneWay: { type: Boolean },
                    loadCapacity: { type: String },
                    containerOperator: { type: String },
                    containerOperatorName: { type: String },
                    pickLocation: { type: String },
                    pickLocationName: { type: String },
                    dropLocation: { type: String },
                    dropLocationName: { type: String },
                    soc: { type: Boolean },
                    maxGrossWeight: { type: String },
                    maxPayload: { type: String },
                    baffles: { type: String },
                    remarks: { type: String },
                    containerHeight: { type: String },
                    status: { type: Boolean },

                    containerStatus: { type: String },
                    containerStatusId: { type: Boolean },
                    referenceId: { type: String },
                    containermasterId: { type: String },
                    createdOn: { type: String },
                    updatedOn: { type: String },
                    createdBy: { type: String },
                    createdByUID: { type: String },
                    updatedBy: { type: String },
                    updatedByUID: { type: String },
                    customerId: { type: String },
                    customerName: { type: String },
                    date: { type: String },
                    yardName: { type: String },
                    yardNameId: { type: String },
                    volume: { type: Number },
                    availableVolume: { type: Number },
                    isAssigned: { type: Boolean },
                },
                batchId: { type: String },
                batchNo: { type: String },
                isContainerAssigned: { type: Boolean },
                isSelected: { type: Boolean },
                orgId: { type: String },
                tenantId: { type: String },
                updatedBy: { type: String },
                updatedByUID: { type: String },
                updatedOn: { type: String },
            }
        ],
        containerList: [
            {
                tenantId: { type: String },
                orgId: { type: String },
                containerNo: { type: String },
                cargoNo: { type: String },
                cargoTypeName: { type: String },
                containerTypeId: { type: String },
                containerType: { type: String },
                containerSize: { type: String },
                tankStatusId: { type: String },
                tankType: { type: String },
                tarWeight: { type: String },
                tankCapacity: { type: String },
                exitOffHireDate: { type: String },
                onHireDate: { type: String },
                dateOfManufacture: { type: String },
                oneWay: { type: Boolean },
                loadCapacity: { type: String },
                containerOperator: { type: String },
                containerOperatorName: { type: String },
                pickLocation: { type: String },
                pickLocationName: { type: String },
                dropLocation: { type: String },
                dropLocationName: { type: String },
                soc: { type: Boolean },
                maxGrossWeight: { type: String },
                maxPayload: { type: String },
                baffles: { type: String },
                remarks: { type: String },
                containerHeight: { type: String },
                status: { type: Boolean },
                containerStatus: { type: String },
                containerStatusId: { type: Boolean },
                referenceId: { type: String },
                containermasterId: { type: String },
                createdOn: { type: String },
                updatedOn: { type: String },
                createdBy: { type: String },
                createdByUID: { type: String },
                updatedBy: { type: String },
                updatedByUID: { type: String },
                customerId: { type: String },
                customerName: { type: String },
                date: { type: String },
                yardName: { type: String },
                yardNameId: { type: String },
                volume: { type: Number },
                availableVolume: { type: Number },
                isAssigned: { type: Boolean },
            }
        ]
    },
    "commodity": {},
    "egm": {
        tenantId: { type: String, required: true },
        orgId: { type: String, required: true },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        egmId: { type: String },
        job: { type: String },
        port: { type: String },
        vessel: { type: String },
        voyage: { type: String },
        lastPort: { type: String },
        cha: { type: String },
        light_dues: { type: String },
        toc: { type: String },
        vesselImo: { type: String },
        vesselcallSign: { type: String },
        custom_line_code: { type: String },
        custom_agent_code: { type: String },
        priorPort1: { type: String },
        testorProduction: { type: String },
        briefCargoForegm: { type: String },
        priorPort2: { type: String },
        captain: { type: String },
        totalLines: { type: String },
        sbc: { type: Boolean },
        ssd: { type: Boolean },
        cld: { type: Boolean },
        pld: { type: Boolean },
        ced: { type: Boolean },
        md: { type: Boolean },
        containerArray: [],
        egmName: { type: String },
        egmcont: [
            {
                msgType: { type: String },
                vesselcallSign: { type: String },
                voyageNo: { type: String },
                lineNo: { type: Number },
                sublineNo: { type: Number },
                blNo: { type: String },
                blDate: { type: String },
                importer: { type: String },
                address1: { type: String },
                address2: { type: String },
                cargoMovement: { type: String },
                goodsDescription: { type: String },
                blId: { type: String },
                itemType: { type: String },
                itemNo: { type: Number },
                consigneeName: { type: String },
                consigneeId: { type: String },
                entryPort: { type: String },
                Status: { type: String },
            }
        ]
    },
    "reminder": {
        status: { type: Boolean },
        userList: [
            {
                item_id: { type: String },
                item_text: { type: String },
            }
        ],
        reminderId: {
            type: String,
        },
        reminderType: {
            type: String,
        },
        userId: {
            type: String,
        },
        batchId: {
            type: String,
        },
        batchNo: {
            type: String,
        },
        description: {
            type: String,
        },
        reminderTime: {
            type: String,
        },
        reminderStatus: {
            type: String,
        },
        isVisited: {
            type: Boolean,
            default: false
        },
        isRepeat: {
            type: Boolean,
        },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        orgId: { type: String },
        isSent: {
            type: Boolean,
            default: false
        },
        customDate: { type: String }
    },
    "warehouse": {
        licenceNo: {
            type: String,
        },
        bondCode: {
            type: String,
        },
        status: { type: Boolean },
        warehouseId: {
            type: String,
        },
        wareHouseName: {
            type: String,
        },
        wareHouseType: {
            type: String,
        },
        location: {
            type: String,
        },
        address: {
            type: String,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        country: {
            type: String,
        },
        warehouseCode: {
            type: String,
        },
        zip: {
            type: String,
        },
        contactName: {
            type: String,
        },
        contactPhone: {
            type: String,
        },
        contactEmail: {
            type: String,
        },
        totalCapacity: {
            type: Number,
        },
        availableCapacity: {
            type: Number,
        },
        noOfDockDoors: {
            type: Number,
        },
        storageType: {
            type: String,
        },
        temperatureControl: {
            type: Boolean,
        },
        hazardousMaterialHandling: {
            type: Boolean,
        },
        operations24x7: {
            type: Boolean,
        },
        securityFeatures: {
            type: String,
        },
        packagingService: {
            type: Boolean,
        },
        labelingService: {
            type: Boolean,
        },
        crossDocking: {
            type: Boolean,
        },
        freightConsolidation: {
            type: Boolean,
        },
        customsClearance: {
            type: Boolean,
        },
        ISOCertification: {
            type: String,
        },
        otherCertification: {
            type: String,
        },
        otherCertification: {
            type: String,
        },
        wms: {
            type: String,
        },
        its: {
            type: String,
        },
        barcodeScanning: {
            type: Boolean,
        },
        rfidEnabled: {
            type: Boolean,
        },
        yearOfEstablished: {
            type: Number,
        },
        operatingHours: {
            type: String,
        },
        notes: {
            type: String,
        },
        parentCompanyId: {
            type: String,
        },
        freightForwarderId: {
            type: String,
        },
        lastMaintenance: {
            type: String,
        },
        nextMaintenance: {
            type: String,
        },
        bins: [
            {
                binNumber: {
                    type: String,
                },
                binDescription: {
                    type: String,
                },
                status: { type: Boolean }
            }
        ],
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        orgId: { type: String },
    },
    "grn": {
        warehouseName: { type: String },
        warehouseId: { type: String },
        items: [
            {
                lclShipper: { type: String },
                lclShipperName: { type: String },
                packageType: { type: String },
                length: { type: Number },
                width: { type: Number },
                height: { type: Number },
                unit: { type: String },
                quantity: { type: Number },
                weight: { type: String },
                volume: { type: Number },
                ref: { type: String },
                description: { type: String },
                binSelection: { type: String },
                qrData: [
                    {
                        itemNo: { type: Number },
                        qrData: { type: String },
                        qrId: { type: String }
                    }
                ]
            }
        ],
        grnId: { type: String },
        grnNo: { type: String },
        batchId: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        tenantId: { type: String },
        orgId: { type: String },
    },
    "payment": {
        batchData: [
            {
                batchId: { type: String },
                batchNo: { type: String },
            }
        ],
        invoiceTaxAmount: { type: Number },
        orgId: { type: String },
        amountType: { type: String },
        tdsId: { type: String },
        createdOn: {
            type: String
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        paymentId: {
            type: String,
        },
        paymentNo: {
            type: String,
        },
        updatedByUID: { type: String },
        paymentTypeId: { type: String },
        paymentType: { type: String },
        billNo: { type: String },
        paymentRefNo: { type: String },
        paymentDate: { type: String },
        amount: { type: Number },
        remitance_bankId: { type: String },
        remitance_bank: { type: String },
        beneficiary_bankId: { type: String },
        beneficiary_bank: { type: String },
        invoiceToId: { type: String },
        invoiceToName: { type: String },
        invoiceFromId: { type: String },
        invoiceFromName: { type: String },
        invoiceFromBranch: { type: String },
        invoiceFromBranchName: { type: String },
        invoices: { type: String },
        batchNo: { type: String },
        batchId: { type: String },
        remarks: { type: String },
        currencyId: { type: String },
        currency: { type: String },
        isExport: { type: Boolean },
        document_name: { type: String },
        document_tag: { type: String },
        upload_document: { type: String },
        filename: { type: String },
        status: { type: Boolean },
        isDraft: { type: Boolean },
        tenantId: { type: String },
        bankId: { type: String },
        bankName: { type: String },
        invoiceData: [
            {
                invoiceId: { type: String },
                invoiceNo: { type: String },
            }
        ],
        paymentStatus: { type: String },
        chequeDate: { type: String },
        chequeStatus: { type: String },
        withdrawalDate: { type: String },
        chequeNo: { type: String },
        discount: { type: Number },
        tds: { type: Number },
        invoiceAmount: { type: Number },
        paidAmount: { type: Number },
        balanceAmount: { type: Number },
        transactionType: { type: String },
        stateOfSupply: { type: String },
        stateOfSupplyName: { type: String },
        costItems: [],
        type: { type: String },
        tdsApplicable: { type: Boolean },
        tdsAmount: { type: Number },
        tdsPer: { type: Number },
        netAmount: { type: Number },
    },
    "qr": {
        lclShipper: { type: String },
        lclShipperName: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        isContainerAssigned: { type: Boolean },
        isSelected: { type: Boolean },
        volume: { type: String },
        weight: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        qrId: { type: String },
        packageType: { type: String },
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
        unit: { type: String },
        quantity: { type: Number },
        weight: { type: Number },
        volume: { type: Number },
        ref: { type: String },
        description: { type: String },
        binSelection: { type: Number },
        consigneeId: { type: String },
        consigneeName: { type: String },
        shipperId: { type: String },
        shipperName: { type: String },
        uniqueRefNo: { type: String },
        grnId: { type: String },
        assignContainer: {
            tenantId: { type: String },
            orgId: { type: String },
            containerNo: { type: String },
            cargoNo: { type: String },
            cargoTypeName: { type: String },
            containerTypeId: { type: String },
            containerType: { type: String },
            containerSize: { type: String },
            tankStatusId: { type: String },
            tankType: { type: String },
            tarWeight: { type: String },
            tankCapacity: { type: String },
            exitOffHireDate: { type: String },
            onHireDate: { type: String },
            dateOfManufacture: { type: String },
            oneWay: { type: Boolean },
            loadCapacity: { type: String },
            containerOperator: { type: String },
            containerOperatorName: { type: String },
            pickLocation: { type: String },
            pickLocationName: { type: String },
            dropLocation: { type: String },
            dropLocationName: { type: String },
            soc: { type: Boolean },
            maxGrossWeight: { type: String },
            maxPayload: { type: String },
            baffles: { type: String },
            remarks: { type: String },
            containerHeight: { type: String },
            status: { type: Boolean },

            containerStatus: { type: String },
            containerStatusId: { type: Boolean },
            referenceId: { type: String },
            containermasterId: { type: String },
            createdOn: { type: String },
            updatedOn: { type: String },
            createdBy: { type: String },
            createdByUID: { type: String },
            updatedBy: { type: String },
            updatedByUID: { type: String },
            customerId: { type: String },
            customerName: { type: String },
            date: { type: String },
            yardName: { type: String },
            yardNameId: { type: String },
            volume: { type: Number },
            availableVolume: { type: Number },
            isAssigned: { type: Boolean },
        }
    },
    "faq": {
        faqId: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        orgId: {
            type: String,
        },
        title: {
            type: String,
        },
        question: {
            type: String,
        },
        answer: {
            type: String,
        }
    },
    "supportmsg": {
        attachment: { type: String },
        attachmentId: { type: String },
        supportmsgId: { type: String },
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        userName: {
            type: String,
        },
        userEmail: {
            type: String,
        },
        message: {
            type: String,
        },
        status: {
            type: String,
        },
        customerEmail: { type: String },
        customerName: { type: String },
        contactUsType: { type: String },
        reply: { type: String }
    },
    "message": {
        toUserId: { type: String },
        toUserLogin: { type: String },
        toGroupId: { type: String },
        isGroupMessage: { type: Boolean },
        messageText: { type: String },
        createdOn: { type: String },
        messageId: { type: String },
        fromUserId: { type: String },
        fromUserName: { type: String },
        fromUserLogin: { type: String },
        isRead: { type: Boolean },
        usersStatus: [
            {
                userId: { type: String },
                isRead: { type: Boolean }
            }
        ],
        orgId: { type: String },
        tenantId: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        updatedOn: { type: String },
    },
    "driver": {
        carrierId: { type: String },
        carrierName: { type: String },
        driverEmailId: { type: String },
        createUser: { type: String },
        driverSecondaryNumber: { type: String },
        driverName: { type: String },
        driverContactNumber: { type: String },
        driverLicenseNumber: { type: String },
        status: { type: Boolean },
        licenseDocumentName: { type: String },
        licenseDocumentId: { type: String },
        idProofDocumentName: { type: String },
        idProofDocumentId: { type: String },
        completeVerification: { type: Boolean },
        documentType: { type: String },
        driverId: { type: String },
        orgId: { type: String },
        referenceId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        tenantId: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "inappnotification": {
        inappnotificationId: { type: String },
        orgId: { type: String },
        email: { type: String },
        notificationName: { type: String },
        notificationType: { type: String },
        description: { type: String },
        notificationURL: { type: String },
        read: { type: Boolean },
        userId: { type: String },
        userLogin: { type: String },
        notificationData: {
            enquiryId: { type: String },
            quotationId: { type: String },
            enquiryNo: { type: String },
            quotationNo: { type: String },
        },
        createdOn: { type: String },
        updatedOn: { type: String },
        tenantId: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        createUser: { type: Boolean },
        driverSecondaryNumber: { type: String },
        driverEmailId: { type: String },
    },
    "holiday": {
        country: {
            countryId: { type: String },
            countryName: { type: String },
        },
        year: { type: String },
        dateOfHoliday: { type: String },
        holidayName: { type: String },
        holidayType: { type: String },
        remark: { type: String },
        status: { type: Boolean },
        parentId: { type: String },
        holidayId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "notificationmaster": {
        notificationmasterId: { type: String },
        module: { type: String },
        orgId: { type: String },
        trigger: [
            {
                triggerId: { type: String },
                value: {
                    type: Object,
                },
                referenceId: { type: String },
                createdOn: { type: String },
                updatedOn: { type: String },
                tenantId: { type: String },
                createdBy: { type: String },
                createdByUID: { type: String },
                updatedBy: { type: String },
                updatedByUID: { type: String },
                emailSettings: [
                    {
                        type: Object
                    }
                ]
            }
        ],
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "air": {
        flight: { type: String },
        airlineId: { type: String },
        airline: { type: String },
        airlineCode: { type: String },
        aircraftType: { type: String },
        cargo: { type: Number },
        volumey: { type: Number },
        status: { type: Boolean },
        airId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "rail": {
        wagonNumber: { type: Number },
        carrierCode: { type: String },
        railCar: { type: String },
        Cargo: { type: Number },
        Dimensions: { type: Number },
        Capacity: { type: Number },
        railCarrier: { type: String },
        railId: { type: String },
        tenantId: { type: String },
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "bl": {
        sblChecked: { type: Boolean, default: false },
        blscanningId: { type: String },
        isBlConsolidated: { type: Boolean },
        consolidatedJobs: [
            {
                batchId: { type: String },
                batchNo: { type: String },
            }
        ],
        igmcfsId: { type: String },
        isMovement: { type: Boolean },
        blDraftStatus: { type: String },
        MBLStatus: { type: String },
        HBLStatus: { type: String },
        freightTermName: { type: String },
        flightId: { type: String },
        flightNo: { type: String },
        grn: [
            {
                grnNo: { type: String },
                grnId: { type: String }
            }
        ],
        finalShippingLineId: { type: String },
        finalShippingLineName: { type: String },
        hblreleaseDate: { type: String },
        telexDate: { type: String },
        releaseType: { type: String },
        rfsDate: { type: String },
        releaseDate: { type: String },
        shippedDate: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        pdfUrl: { type: String },
        tenantId: { type: String },
        blId: { type: String },
        batchNo: { type: String },
        batchId: { type: String },
        Import_Export: { type: String },
        blType: { type: String },
        subBltype: { type: String },
        blTypeName: { type: String },
        blNumber: { type: String },
        shipperId: { type: String },
        shipperName: { type: String },
        shipperAddress: { type: String },
        consigneeId: { type: String },
        consigneeName: { type: String },
        consigneeAddress: { type: String },
        voyageId: { type: String },
        voyageNumber: { type: String },
        vessel: { type: String },
        vesselName: { type: String },
        preCarrigeById: { type: String },
        preCarrigeByName: { type: String },
        notify_party1: { type: String },
        notify_party1Name: { type: String },
        address1: { type: String },
        notify_party2: { type: String },
        notify_party2Name: { type: String },
        address2: { type: String },
        notify_party3: { type: String },
        notify_party3Name: { type: String },
        address3: { type: String },
        loadPlace: { type: String },
        loadPlaceName: { type: String },
        entryPort: { type: String },
        entryPortId: { type: String },
        onCarriageId: { type: String },
        onCarriageName: { type: String },
        placeOfDelivery: { type: String },
        placeOfDeliveryName: { type: String },
        stoltAgentId: { type: String },
        stoltAgentName: { type: String },
        manifestRemarks: { type: String },
        podUnLoc: { type: String },
        polId: { type: String },
        polName: { type: String },
        placeofIssue: { type: String },
        placeofReceipt: { type: String },
        frieghtPaidBy: { type: String },
        blINCOTerm: { type: String },
        billToId: { type: String },
        billToName: { type: String },
        doInvoice: { type: Boolean },
        documentInvoice: { type: Boolean },
        handlingFees: { type: String },
        pcin: { type: String },
        csn: { type: String },
        mcin: { type: String },
        blStatus: { type: Boolean },
        additional: { type: String },
        containers: [
            {
                telexDate: { type: String },
                telexDateshippingLineId: { type: String },
                cbm: { type: String },
                package: { type: String },
                packageType: { type: String },
                unitGross: { type: String },
                packageUnit: { type: String },
                packageTypeName: { type: String },
                hblreleaseDate: { type: String },
                tenantId: { type: String },
                isNewContainer: { type: Boolean },
                containerId: { type: String },
                batchId: { type: String },
                batchNo: { type: String },
                shippingLineName: { type: String },
                mastercontainerId: { type: String },
                containerNumber: { type: String },
                containerTypeId: { type: String },
                containerDescription: { type: String },
                containerTypeName: { type: String },
                containerType: { type: String },
                containerSize: { type: String },
                containerHeight: { type: String },
                imoType: { type: String },
                imoTypeId: { type: String },
                netWeight: { type: String },
                package: { type: String },
                grossWeight: { type: String },
                isoContainerCode: { type: String },
                tareWeight: { type: String },
                sealNo: { type: String },
                unit: { type: String },
                rfidNo: { type: String },
                shipmentNumber: { type: String },
                cargoTypeId: { type: String },
                evgmNumber: { type: String },
                evgmDate: { type: String },
                blNumber: { type: String },
                blDate: { type: String },
                shippingBillNumber: { type: String },
                sbNo: { type: String },
                sbDate: { type: String },
                isSobEmail: { type: Boolean },
                bondNumber: { type: String },
                igmNumber: { type: String },
                statusFlagId: { type: String },
                status: { type: Boolean },
                depoIn: { type: String },
                depotOut: { type: String },
                depotDate: { type: String },
                depotDateName: { type: String },
                depoInName: { type: String },
                icdIn: { type: String },
                icdInName: { type: String },
                icdOut: { type: String },
                icdOutName: { type: String },
                factoryIn: { type: String },
                factoryInName: { type: String },
                factoryOut: { type: String },
                factoryOutName: { type: String },
                terminalIn: { type: String },
                terminalInName: { type: String },
                terminalOut: { type: String },
                terminalOutName: { type: String },
                mtyValidity: { type: String },
                mtyReturn: { type: String },
                cfsIn: { type: String },
                cfsOut: { type: String },
                railOut: { type: String },
                dischargeDate: { type: String },
                reject: { type: String },
                rejectName: { type: String },
                sobDate: { type: String },
                arrivalDate: { type: String },
                deliveryDate: { type: String },
                override_orgId: { type: String },
                override_tId: { type: String },
                containerInUse: { type: Boolean },
                isExport: { type: Boolean },
                referenceId: { type: String },
                createdOn: { type: String },
                updatedOn: { type: String },
                createdBy: { type: String },
                createdByUID: { type: String },
                updatedBy: { type: String },
                updatedByUID: { type: String },
            }
        ],
        shipperBranch: { type: String },
        shipperBranchId: { type: String },
        consigneeBranch: { type: String },
        consigneeBranchId: { type: String },
        notifyParty1Branch: { type: String },
        notifyParty1BranchId: { type: String },
        notifyParty2Branch: { type: String },
        notifyParty2BranchId: { type: String },
        notifyParty3Branch: { type: String },
        notifyParty3BranchId: { type: String },
        status: { type: Boolean },
        chargeTerm: { type: String },
        freightTerm: { type: String },
        freightAmount: { type: String },
        freightCurrencyId: { type: String },
        shippingLineId: { type: String },
        mbl: { type: String },
        IGM_Filed: { type: Boolean },
        blDate: { type: String },
        shippingTermId: { type: String },
        isDPD: { type: Boolean },
        isHSS: { type: Boolean },
        grossWeight: { type: String },
        nettWeight: { type: String },
        markNumber: { type: String },
        totalPackage: { type: String },
        cargo_Desc: { type: String },
        cargoType: { type: String },
        cargoId: { type: String },
        cfsLocationId: { type: String },
        cargoStatus: { type: String },
        unNo: { type: String },
        imcoClass: { type: String },
        technicalName: { type: String },
        productId: { type: String },
        surveyor: { type: String },
        emptyReturnDepot: { type: String },
        VesselSellingDate: { type: String },
        LumSumpDatefrom: { type: String },
        LumSumpDateTo: { type: String },
        LumSumpDaysinPeriod: { type: String },
        amount: { type: String },
        noofContainer: { type: String },
        importPoo: { type: String },
        importPol: { type: String },
        importPod: { type: String },
        importFpod: { type: String },
        departureMode: { type: String },
        blGeneralRemarks: { type: String },
        goodsDescription: { type: String },
        documents: [],
        polRemarks: { type: String },
        containerType: { type: String },
        itemNo: { type: String },
        subLineNo: { type: String },
        isExport: { type: Boolean },
        apiType: { type: String },
    },
    "ticket": {
        companyName: { type: String },
        ticketDocumentId: { type: String },
        ticketDocumentName: { type: String },
        ticketDocumentNameAdmin: { type: String },
        ticketDocumentIdAdmin: { type: String },
        userEmail: { type: String },
        ticketStatus: { type: String },
        title: { type: String },
        description: { type: String },
        pipeline: { type: String },
        priority: { type: String },
        uploadsDoc: { type: String },
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        ticketId: { type: String },
        ticketNo: { type: String },
        comments: [
            {
                commentText: { type: String },
                commentBy: { type: String },
                commentedOn: { type: String },
                commentStatus: { type: String },
            }
        ]
    },
    "land": {
        ownershipeType: { type: String },
        typeCarrierId: { type: String },
        typeCarrier: { type: String },
        vehicleType: { type: String },
        vehicleLicence: { type: String },
        Make: { type: String },
        Model: { type: String },
        vehicleRegistration: { type: String },
        vehicleFuel: { type: String },
        maxWeight: { type: Number },
        engineNumber: { type: String },
        weightUnit: { type: String },
        landId: { type: String },
        tenantId: { type: String },
        status: { type: Boolean },
        mobileNo: { type: Number },
        person: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "sof": {
        vesselId: { type: String },
        vesselName: { type: String },
        portId: { type: String },
        portName: { type: String },
        typeId: { type: String },
        typeName: { type: String },
        voyageId: { type: String },
        voyageName: { type: String },
        activity: [
            {
                activity: { type: String },
                dataType: { type: String },
                value: { type: String },
                status: { type: Boolean },
            }
        ],
        sofId: { type: String },
        tenantId: { type: String },
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "lineupactivity": {
        lineupactivityId: { type: String },
        vesselLineup: { type: String },
        status: { type: Boolean },
        fields: [
            {
                activity: { type: String },
                dataType: { type: String },
                status: { type: Boolean },
            }
        ],
        tenantId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "igm": {
        igm_no: { type: String },
        igmDate: { type: String },
        portName: { type: String },
        shippinglineId: { type: String },
        vesselName: { type: String },
        igmId: { type: String },
        job: { type: String },
        port: { type: String },
        vessel: { type: String },
        voyage: { type: String },
        lastPort: { type: String },
        cha: { type: String },
        light_dues: { type: Number },
        toc: { type: String },
        vesselImo: { type: String },
        vesselcallSign: { type: String },
        custom_line_code: { type: String },
        custom_agent_code: { type: String },
        priorPort1: { type: String },
        testorProduction: { type: String },
        briefCargoForigm: { type: String },
        priorPort2: { type: String },
        captain: { type: String },
        totalLines: { type: String },
        sbc: { type: Boolean },
        ssd: { type: Boolean },
        cld: { type: Boolean },
        pld: { type: Boolean },
        ced: { type: Boolean },
        md: { type: Boolean },
        containerArray: [],
        igmName: { type: String },
        cargo: { type: String },
        tenantId: { type: String },
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "shippingbill": {
        shippingbillNo: { type: String },
        basicDetails: {
            CHA: { type: String },
            stn: { type: String },
            shipperId: { type: String },
            shipperName: { type: String },
            shipperAddress: { type: String },
            consigneeId: { type: String },
            consigneeName: { type: String },
            consigneeAddress: { type: String },
            adCode: { type: String },
            gstIN: { type: String },
            stateId: { type: String },
            stateName: { type: String },
            classType: { type: String },
            NFEI: { type: String },
            partyRef: { type: String },
            forexAccNo: { type: String },
            jobId: { type: String },
            jobNo: { type: String },
            SBNo: { type: String },
            invoice: { type: String },
            fOBValue: { type: String },
            PMVValue: { type: String },
            DBKAmt: { type: String },
            DBKAccNo: { type: String },
            Taxable: { type: String },
            IGSTAmt: { type: String },
            invoiceNo: { type: String },
            registrationNo: { type: String },
            AEORole: { type: String },
        },
        shipmentDetails: {
            portId: { type: String },
            portName: { type: String },
            country: { type: String },
            contryName: { type: String },
            grossWeight: { type: String },
            packages: { type: Number },
            noOfContainer: { type: String },
            masterBLNo: { type: String },
            houseBLNo: { type: String },
            netWeight: { type: String },
            rotationNo: { type: String },
            marksNos: { type: String },
            sealType: { type: String },
            factoryStuffed: { type: String },
            EOUBranchSno: { type: String },
            cargo: { type: String },
            factoryAddress: { type: String },
            EOUIEC: { type: String },
        },
        invoiceDetails: {
            aeoCodeId: { type: String },
            aeoCode: { type: String },
            PONo: { type: String },
            buyerDetails: { type: String },
            contractNo: { type: String },
            Payment: { type: String },
            unitPrice: { type: String },
            invoiceCharges: [
                {
                    chargeType: { type: String },
                    invoicRate: { type: String },
                    amount: { type: String },
                    currency: { type: String },
                    exchRate: { type: Number },
                }
            ]
        },
        product: [
            {
                invslNo: { type: String },
                itemSlNo: { type: String },
                quantity: { type: String },
                HSCD: { type: String },
                description: { type: String },
                UQC: { type: String },
                rate: { type: String },
                valueFC: { type: String },
                fOBINR: { type: String },
                PMV: { type: String },
                cessRT: { type: String },
                dutyAmt: { type: String },
                cesAmt: { type: String },
                dbkcLmd: { type: String },
                igstPayStatus: { type: String },
                igstAmount: { type: String },
                igstRate: { type: String },
                schCode: { type: String },
                schemeDescription: { type: String },
                sqcMSR: { type: String },
                sqcUQC: { type: String },
                stateOrigin: { type: String },
                district: { type: String },
                ptAbroad: { type: String },
                compCess: { type: String },
                endUse: { type: String },
                ftaBenefit: { type: String },
                reward: { type: String },
                thirdParty: { type: String },
            }
        ],
        containerItems: [
            {
                code: { type: String },
                description: { type: String },
            }
        ],
        supportingDocuments: [
            {
                documentType: { type: String },
                documentName: { type: String },
                uploadDate: { type: String },
                documentId: { type: String },
            }
        ],
        tenantId: { type: String },
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        shippingbillId: { type: String },
        batchId: { type: String }
    },
    "entrybill": {
        batchId: { type: String },
        entrybillNo: { type: String },
        tenantId: { type: String },
        status: { type: Boolean },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        entrybillId: { type: String },
        basicDetails: {
            jobNo: { type: String },
            jobDate: { type: String },
            fileNo: { type: String },
            portOfFilling: { type: String },
            proveFinal: { type: String },
            transportMode: { type: String },
            section46: { type: String },
            beType: { type: String },
            greenChannel: { type: String },
            govtPrivate: { type: String },
            priorBe: { type: String },
            firstCheck: { type: String },
            chaDetails: { type: String },
            chaAddress: { type: String },
            importerAddress: { type: String },
            importerDetails: { type: String },
            pan: { type: String },
            GSTIN: { type: String },
            ucrNo: { type: String },
            ucrType: { type: String },
            paymentMethodCode: { type: String },
        },
        IgmDetails: {
            igmNo: { type: String },
            gatewayIgm: { type: String },
            noOfContainer: { type: String },
            packages: { type: String },
            gatewayPort: { type: String },
            portOrigin: { type: String },
            portShipment: { type: String },
            countryOrigin: { type: String },
            countryConsignment: { type: String },
            mblMawb: { type: String },
            mblDate: { type: String },
            hblHawb: { type: String },
            hblDate: { type: String },
            noOfPackages: { type: String },
            grossWeight: { type: String },
            marksNo: { type: String },
        },
        invoiceDetails: {
            noOfInvoice: { type: String },
            invSiNo: { type: String },
            invNo: { type: String },
            invDate: { type: String },
            invValue: { type: String },
            invTerm: { type: String },
            freight: { type: String },
            insurance: { type: String },
            buyerSellerRated: { type: String },
            svbRefNo: { type: String },
            svbRefDate: { type: String },
            svbLoadAss: { type: String },
            customHouse: { type: String },
            svbLoadDty: { type: String },
            natureOfPayment: { type: String },
            miscCharge: { type: String },
            totalMsc: { type: String },
            hssRate: { type: String },
            discountRate: { type: String },
            hssAmount: { type: String },
            discountAmount: { type: String },
            loadingCharge: { type: String },
            exchangeRate: { type: String },
            supplierDetails: { type: String },
            address: { type: String },
        },
        productDetails: {
            qty: { type: String },
            slNo: { type: String },
            unit: { type: String },
            ritc: { type: String },
            unitPrice: { type: String },
            assValue: { type: String },
            description: { type: String },
            rsp: { type: String },
            coo: { type: String },
            cth: { type: String },
            ceth: { type: String },
            excNotn: { type: String },
            excDtyRt: { type: String },
            cusDtyRt: { type: String },
            cusNot: { type: String },
            cvdAmt: { type: String },
        },
        importDetails: {
            iecNo: { type: String },
            branchSrNo: { type: String },
            importerName: { type: String },
            imoporterAdd: { type: String },
            precedingLevel: { type: String },
        },
        containerItems: [
            {
                igm: { type: String },
                container: { type: String },
                sealNo: { type: String },
                type: { type: String },
                size: { type: String },
                truckNo: { type: String },
            }
        ],
        gstinItems: [
            {
                state: { type: String },
                commercialType: { type: String },
                regNo: { type: String },
                igstAss: { type: String },
                igstAmt: { type: String },
                gstCessAmt: { type: String },
            }
        ],
        singleWindow: [
            {
                itemSiNO: { type: String },
                infoType: { type: String },
                infoCode: { type: String },
                infoText: { type: String },
                msr: { type: String },
                uqc: { type: String },
                regnDate: { type: String },
                validity: { type: String },
            }
        ],
        singleWindowStatement: [
            {
                invSiNO: { type: String },
                itemSiNo: { type: String },
                stmtType: { type: String },
                stmtCode: { type: String },
                text: { type: String },
            }
        ],
    },
    "transportinquiry": {
        biddingDueDate: { type: String },
        loadType: { type: String },
        enquiryId: { type: String },
        enquiryNo: { type: String },
        shippinglineId: { type: String },
        name: { type: String },
        breakPoint: [
            {
                locationType: { type: String },
                location: { type: String },
                locationName: { type: String },
                etd: { type: String },
                eta: { type: String },
                address: { type: String },
                addressText: { type: String },
                addressId: { type: String },
                branch: { type: String },
                transit: { type: String },
                carrier: { type: String },
                carrierList: [
                    {
                        shippinglineId: { type: String },
                        name: { type: String },
                    }
                ]
            }
        ],
        origin: {
            transpoterType: { type: String },
            locationType: { type: String },
            location: { type: String },
            locationName: { type: String },
            etd: { type: String },
            eta: { type: String },
            address: { type: String },
            addressText: { type: String },
            addressId: { type: String },
            branch: { type: String },
            transit: { type: String },
            carrier: { type: String },
            carrierList: [
                {
                    shippinglineId: { type: String },
                    name: { type: String },
                }
            ]
        },
        destination: {
            transpoterType: { type: String },
            locationType: { type: String },
            location: { type: String },
            locationName: { type: String },
            etd: { type: String },
            eta: { type: String },
            address: { type: String },
            addressText: { type: String },
            addressId: { type: String },
            branch: { type: String },
            transit: { type: String },
            carrier: { type: String },
            carrierList: [
                {
                    shippinglineId: { type: String },
                    name: { type: String },
                }
            ]
        },
        remark: { type: String },
        rate: { type: String },
        status: { type: Boolean },
        carrierStatus: { type: String },
        adminStatus: { type: String },
        transportinquiryId: { type: String },
        transportinquiryNo: { type: String },
        tenantId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        currency: {
            currencyName: { type: String },
            currencyId: { type: String },
        }
    },
    "airportmaster": {
        airportmasterId: { type: String },
        airPortname: { type: String },
        airPortcode: { type: String },
        country: { type: String },
        CustEDICode: { type: String },
        financeSECname: { type: String },
        agentBranch: { type: String },
        isIcd: { type: Boolean },
        isSez: { type: Boolean },
        Sectorname: { type: String },
        Subsectorname: { type: String },
        status: { type: Boolean },
        tenantId: { type: String },
        tenantId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "transportmilestone": {
        transportmilestoneId: { type: String },
        batchId: { type: String },
        milestoneEvent: { type: String },
        milestoneDate: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "smartdocument": {
        totalGrWt: { type: Number },
        totalUnitQty: { type: Number },
        totalNetWt: { type: Number },
        totalGWt: { type: Number },
        totalMeasurement: { type: Number },
        signatoryCompany: { type: String },
        signatoryCompany1: { type: String },
        toName: { type: String },
        method1: { type: String },
        method2: { type: String },
        placeOfIssue1: { type: String },
        issueDate1: { type: String },
        declarationExporter: { type: String },
        periodOfDelivery: { type: Array },
        reference: { type: String },
        buyerReference: { type: String },
        buyer: { type: String },
        buyerName: { type: String },
        countryOG: { type: String },
        countryOGName: { type: String },
        countryFD: { type: String },
        countryFDName: { type: String },
        paymentMethod: { type: String },
        paymentMethodName: { type: String },
        placeOrigin: { type: String },
        placeOriginName: { type: String },
        dateofDeparture: { type: String },
        finalDestination: { type: String },
        finalDestinationName: { type: String },
        marinCoverPolicy: { type: String },
        letterCreditNo: { type: String },
        bankDetails: { type: String },
        shipperReference: { type: String },
        carrierReference: { type: String },
        consigneeRef: { type: String },
        carrier: { type: String },
        carrierName: { type: String },
        preCarriageBy: { type: String },
        placeOfReceipt: { type: String },
        placeOfReceiptName: { type: String },
        notifyParty: { type: String },
        notifyPartyName: { type: String },
        notifyParty1: { type: String },
        notifyPartyName1: { type: String },
        additionalInfoBL: { type: String },
        supplierReference: { type: String },
        containerNo: { type: String },
        containerTare: { type: Number },
        cargoWT: { type: Number },
        grossWt: { type: String },
        letterOfCreditNo: { type: String },
        packingInformation: { type: String },
        mtdNo: { type: String },
        placeOfReceipt: { type: String },
        placeOfReceiptName: { type: String },
        placeOfDelivery: { type: String },
        placeOfDeliveryName: { type: String },
        periodOfDelivery: { type: Array },
        placeOfTranshipment: { type: String },
        placeOfTranshipmentName: { type: String },
        sealNo: { type: String },
        deliveryAgent: { type: String },
        deliveryAgentName: { type: String },
        freightAmount: { type: Number },
        noOfOriginals: { type: Number },
        freightPaybleAt: { type: String },
        kindNoofPackage: { type: String },
        measurement: { type: String },
        blNumber: { type: String },
        voyageNo: { type: String },
        smartdocumentId: { type: String },
        documentType: { type: String },
        associatedWith: { type: String },
        documentName: { type: String },
        from: { type: String },
        to: { type: String },
        quoteNumber: { type: String },
        date: { type: String },
        portOfLoading: { type: String },
        portOfDischarge: { type: String },
        methodOfDispatch: { type: String },
        typeOfShipment: { type: String },
        products: [
            {
                noOfPackage: { type: Number },
                packageQty: { type: Number },
                netWt: { type: Number },
                grossWt: { type: Number },
                measurPackage: { type: Number },
                codeTariff: { type: String },
                chargeable: { type: String },
                measurement: { type: String },
                kindNoofPackage: { type: Number },
                sealNo: { type: String },
                currency: { type: String },
                exRate: { type: Number },
                currencyName: { type: String },
                chargeId: {
                    type: String,
                },
                chargeName: {
                    type: String,
                },
                code: { type: String },
                description: { type: String },
                unitQty: { type: Number },
                unitType: { type: String },
                unitTypeName: { type: String },
                price: { type: Number },
                amount: { type: Number },
            }
        ],
        additionalInfo: { type: String },
        placeOfIssue: { type: String },
        issueDate: { type: String },
        signatoryCompany: { type: String },
        authorizedSignatory: { type: String },
        documentKey: { type: String },
        portOfLoadingName: { type: String },
        portOfDischargeName: { type: String },
        placeOfIssueName: { type: String },
        methodOfDispatchName: { type: String },
        typeOfShipmentName: { type: String },
        totalAmount: { type: Number },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "instafindetail": {
        instafindetailId: { type: String },
        companyMasterSummary: {},
        directorSignatoryMasterSummary: {},
        ownershipDetails: {},
        statementOfProfitAndLoss: {},
        partymasterId: { type: String },
        orderId: { type: String },
        createdOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String }
    },
    "igmcfs": {
        chaId: { type: String },
        chaName: { type: String },
        emailReply: {
            type: Object
        },
        isAutoFilled: { type: Boolean },
        isEmail: { type: String },
        blId: { type: String },
        blNo: { type: String },
        blType: { type: String },
        blData: [
            {
                blId: { type: String },
                blNo: { type: String },
                blType: { type: String },
            }
        ],
        lineNo: { type: String },
        recipientName: { type: String },
        address: { type: String },
        courierDate: { type: String },
        isFastTrack: { type: String },
        cfsDate: { type: String },
        nocDate: { type: String },
        cfsRequestDate: { type: String },
        igmRequestDate: { type: String },
        agent: { type: String },
        documents: [
            {
                documentId: { type: String },
                documentName: { type: String },
                documentType: { type: String }
            }
        ],
        batchId: { type: String },
        cfsId: { type: String },
        cfsName: { type: String },
        igmAgentName: { type: String },
        igmNo: { type: String },
        igmThrouge: { type: String },
        remarks: { type: String },
        trackingNo: { type: String },
        type: { type: String },
        sentDate: { type: String },
        status: { type: String },
        batchNo: { type: String },
        message: { type: String },
        to: { type: String },
        cc: { type: String },
        subject: { type: String },
        bodyContent: { type: String },
        sendingMethod: { type: String },
        movementType: { type: String },
        igmcfsId: { type: String },
        documentName: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        igmType: { type: String },
        igmAgent: { type: String },
        igmDate: { type: String },
    },
    "milestonemaster": {
        color: { type: String },
        shipmentType: [
            {
                item_text: { type: String, required: true },
                item_id: { type: String, required: true },
            }
        ],
        customOrigin: { type: Boolean, default: false },
        customDestination: { type: Boolean, default: false },
        freightTypeName: { type: String },
        milestonemasterId: { type: String },
        tag: { type: String },
        locationId: { type: String },
        locationName: { type: String },
        referenceType: { type: String },
        status: { type: Boolean },
        mileStoneName: { type: String },
        loadType: { type: String },
        freightType: { type: String },
        locationType: { type: String },
        flowType: { type: String },
        seq: { type: Number },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "freightcertificate": {
        igmNo: { type: String },
        igmDate: { type: String },
        freightcertificateId: { type: String },
        hblNo: { type: String },
        mblNo: { type: String },
        container_no: { type: String },
        pol: { type: String },
        destination: { type: String },
        consignee: { type: String },
        batchId: { type: String },
        freight: { type: String },
        sellTotalINR: { type: Number },
        chargesName: { type: String },
        buyTotalINR: { type: Number },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "groupchat": {
        groupchatId: { type: String },
        groupchatName: { type: String },
        users: [
            {
                userId: { type: String },
                addedOn: { type: String }
            }
        ],
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "whatsappshareddocument": {
        whatsappshareddocumentId: { type: String },
        url: { type: String },
        name: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        status: { type: String }
    },
    "logaudit": {
        action: { type: String },
        resource: { type: String },
        resourceId: { type: String },
        updatedData: { type: Object },
        updatedByUID: { type: String },
        updatedBy: { type: String },
        updatedOn: { type: String },
        recordedOn: { type: String }
    },
    "schedulereport": {
        customer: { type: Array },
        lastSentOn: { type: String },
        schedulereportId: { type: String },
        type: { type: String },
        template: { type: String },
        subscriptionName: { type: String },
        linkTo: { type: String },
        reportType: { type: String },
        filterField: { type: String },
        summaryOn: { type: String },
        emailRecipients: { type: String },
        ccEmail: { type: Array },
        subject: { type: String },
        schedule: { type: String },
        timeofDay: { type: String },
        weekDay: { type: String },
        message: { type: String },
        toEmail: { type: Array },
        customerId: { type: String },
        customerName: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        status: { type: String }
    },
    "reportconfig": {
        reportName: { type: String },
        reportLabel: { type: String },
        columns: { type: Array }
    },
    "warehousedataentry": {
        branchId: { type: String },
        branchName: { type: String },
        licenceNo: { type: String },
        packageUnitName: { type: String },
        packageUnit: { type: String },
        spaceRequiredunitName: { type: String },
        validity: { type: String },
        spaceRequiredunit: { type: String },
        hsnCode: { type: String },
        accessibleValue: { type: String },
        blofEN: { type: String },
        blofEDate: { type: String },
        customDuty: { type: String },
        bondCode: { type: String },
        type: { type: String },
        spaceCertificationNo: { type: String },
        spaceCertificationDate: { type: String },
        billofEntry: { type: String },
        inDate: { type: String },
        inDutyAmt: { type: String },
        outDate: { type: String },
        outDutyAmt: { type: String },
        balance: { type: String },
        fullOutDuty: { type: String },
        iNPKGS: { type: String },
        outPKGS: { type: String },
        inWarehouse: { type: String },
        warehousedataentryId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        year: { type: String },
        originCountry: { type: String },
        originCountryName: { type: String },
        jobDate: { type: String },
        jobNo: { type: String },
        shippingLineLedger: { type: String },
        shippingLineLedgerName: { type: String },
        jobType: { type: String },
        jobTypeName: { type: String },
        etaDate: { type: String },
        packagesUnit: { type: String },
        unit: { type: String },
        unitName: { type: String },
        importerLedger: { type: String },
        importerLedgerName: { type: String },
        blNo: { type: String },
        blDate: { type: String },
        invoiceLedger: { type: String },
        invoiceLedgerName: { type: String },
        invoiceNo: { type: String },
        invoiceDate: { type: String },
        poNo: { type: String },
        product: { type: String },
        productName: { type: String },
        productDescription: { type: String },
        location: { type: String },
        locationName: { type: String },
        hsnCode: { type: String },
        chaLedger: { type: String },
        chaLedgerName: { type: String },
        vessel: { type: String },
        vesselName: { type: String },
        grossQtyUnit: { type: String },
        QtyUnit: { type: String },
        QtyUnitName: { type: String },
        exporterLedger: { type: String },
        exporterLedgerName: { type: String },
        spaceRequired: { type: Number },
        exporterCustomPort: { type: String },
        exporterCustomPortName: { type: String },
        warehouseId: { type: String },
        warehouseName: { type: String },
        remarks: { type: String },
        status: { type: String }
    },
    "warehousebillofentry": {
        bondNo: { type: String },
        deliveryOrder: { type: String },
        dateOfDO: { type: String },
        permissionNo: { type: String },
        bondExpiry: { type: String },
        warehousingSection: { type: String },
        warehousedataentryId: { type: String },
        warehousebillofentryId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        year: { type: String },
        assessableValue: { type: String },
        dutyAmount: { type: String },
        jobNo: { type: String },
        excessChalan: { type: Number },
        whBeNo: { type: Number },
        date: { type: String },
        spaceCertificateNo: { type: String },
        grossQty: { type: Number },
        spaceCertificateDate: { type: String },
        validity: { type: Number },
        packages: { type: Number },
        unit: { type: String },
        unitName: { type: String },
        beSpaceRequired: { type: Number },
        remarks: { type: String },
        dateofextension: { type: String },


        containers: [
            {
                containerType: { type: String },
                containerNo: { type: String },
                containerTypeName: { type: String },
            }
        ]
    },
    "warehousepacking": {
        warehouseName: { type: String },
        constainerNo: { type: String },
        billOfEntryNo: { type: String },
        chaName: { type: String },
        location: { type: String },
        partyName: { type: String },
        vesselName: { type: String },
        warehousepackingId: { type: String },
        packingType: { type: String },
        noOfEmptyBags: { type: Number },
        packingDate: { type: String },
        qtyPackedFromStock: { type: Number },
        vendorsLabours: { type: String },
        surveyors: { type: String },
        remarks: { type: String },
        warehousedispatchId: { type: String },
        warehousedataentryId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
    },
    "warehousedispatch": {
        packageTypeName: { type: String },
        gateOutPassNo: { type: String },
        labourDetails: { type: Array },
        vendors: { type: Array },
        machines: { type: Array },
        warehouseWeightmentgrossQty: { type: Number },
        containerNo: { type: String },
        qty: { type: Number },
        packageType: { type: String },
        weightbridgeName: { type: String },
        weightmentSlip: { type: String },
        warehousedispatchId: { type: String },
        warehousedataentryId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        dispatchDate: { type: String },
        surveyorName: { type: String },
        dispatchPackage: { type: String },
        dispatchPackageUnit: { type: String },
        importerLedger: { type: String },
        gatePassNo: { type: String },
        gatePassDateTime: { type: String },
        vehicleNo: { type: String },
        transporterLedger: { type: String },
        lrNo: { type: String },
        grossWeight: { type: String },
        grossweightUnit: { type: String },
        tareWeight: { type: String },
        netWeight: { type: String },
        surveyorLedger: { type: String },
        toLocation: { type: String },
        labours: [
            {
                labourName: { type: String },
                weight: { type: String },
                quantity: { type: String },
                pallets: { type: String },
                labourRemarks: { type: String },
            }
        ]
    },
    "warehousegateinentry": {
        containerWeight: { type: Number },
        isOpenContainer: { type: Boolean },
        isContainerChange: { type: Boolean },
        toppleContainerNo: { type: String },
        warehousecontainerId: { type: String },
        unitId: { type: String },
        unitName: { type: String },
        gatePassNumber: { type: String },
        jobNumber: { type: String },
        importer: { type: String },
        purchaser: { type: String },
        warehouseNumber: { type: String },
        productDescription: { type: String },
        vessel: { type: String },
        chaName: { type: String },
        whBeNumber: { type: String },
        exBeNumber: { type: String },
        truckNumber: { type: String },
        containerNumber: { type: String },
        transporter: { type: String },
        lrNumber: { type: String },
        packages: { type: String },
        remarks: { type: String },
        grossWeight: { type: String },
        tareWeight: { type: String },
        netWeight: { type: String },
        doNumber: { type: String },
        doValidity: { type: String },
        warehousingUnderSection: { type: String },
        bondExpiry: { type: String },
        entryDateTime: { type: String },
        cfsPortWeighment: {
            cfsName: { type: String },
            cfsSlipNo: { type: String },
            cfsGross: { type: String },
            cfsTare: { type: String },
            cfsNet: { type: String },
        },
        warehouseWeighment: {
            weighbridgeName: { type: String },
            warehouseSlipNo: { type: String },
            warehouseGross: { type: String },
            warehouseTare: { type: String },
            warehouseNet: { type: String },
        },
        warehousedataentryId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        warehousegateinentryId: { type: String },
    },
    "warehousegateoutentry": {
        cargoDescription: { type: String },
        quantity: { type: Number },
        packageType: { type: String },
        location: { type: String },
        chaName: { type: String },
        warehousecontainerId: { type: String },
        unit: { type: String },
        packages: { type: String },
        whBeNumber: { type: String },
        gatePassNumber: { type: String },
        purchaserId: { type: String },
        purchaserName: { type: String },
        warehouseNumber: { type: String },
        remarks: { type: String },
        exBeNumber: { type: String },
        truckNumber: { type: String },
        containerNumber: { type: String },
        transporter: { type: String },
        lrNumber: { type: String },
        grossWeight: { type: String },
        tareWeight: { type: String },
        netWeight: { type: String },
        doNumber: { type: String },
        doValidity: { type: String },
        warehousingUnderSection: { type: String },
        bondExpiry: { type: String },
        cfsPortWeighmentDetails: {
            cfsSlipNo: { type: String },
            cfsGross: { type: Number },
            cfsTare: { type: Number },
            cfsNet: { type: Number }
        },
        warehouseWeighmentDetails: {
            weighbridgeName: { type: String },
            warehouseSlipNo: { type: Number },
            warehouseGross: { type: Number },
            warehouseTare: { type: Number },
            warehouseNet: { type: String }
        },
        warehousedataentryId: { type: String },
        warehousegateoutentryId: { type: String },
        gateOutDate: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String }
    },
    "inwardcontainerhandover": {
        BillOfEntry: { type: String },
        truckNo: { type: String },
        remarks: { type: String },
        transporterName: { type: String },
        emptyLocation: { type: String },
        emptyGatePassNo: { type: String },
        emptyGatePassDateTime: { type: String },
        vehicleSize: { type: String },
        location: { type: String },
        warehousecontainerId: { type: String },
        warehousedataentryId: { type: String },
        emptyGatePassNo: { type: String },
        emptyGatePassDateTime: { type: String },
        emptyVehicleNo: { type: String },
        emptyTransportLedgerName: { type: String },
        gatePassNo: { type: String },
        gatePassDateTime: { type: String },
        BOE: { type: String },
        receiptDateTime: { type: String },
        jobBeContainerNo: { type: String },
        jobBeSealNo: { type: String },
        jobBeCfsSealNo: { type: String },
        sizeName: { type: String },
        containerNo: { type: String },
        cfsSealNo: { type: String },
        status: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        inwardcontainerhandoverId: { type: String }
    },
    "surveyor": {
        surveyorId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        surveyorName: { type: String },
        surveyorId: { type: String },
        SurveyorMoNo: { type: String },
        SurveyorBranch: { type: String },
        SurveyorBranchId: { type: String },
        SurveyorAddress: { type: String }
    },
    "exbondbillentry": {
        toppleFordutyNo: { type: String },
        conditionalDutyAmount: { type: String },
        entryType: { type: String },
        partyName: { type: String },
        pkgs: { type: String },
        toppleForAdvanceLicense: { type: String },
        leoDate: { type: String },
        leoNo: { type: String },
        chaName: { type: String },
        permissionNo: { type: String },
        newWarehouseName: { type: String },
        bondCode: { type: String },
        documentDate: { type: String },
        documentNo: { type: String },
        dutyAmount: { type: Number },
        challanDuty: { type: String },
        orgId: { type: String },
        warehousecontainerId: { type: String },
        containerNo: { type: String },
        containerTypeName: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        exbondbillentryId: { type: String },
        warehousedataentryId: { type: String },
        billOfEntryNo: { type: String },
        exBeNo: { type: String },
        beNoDate: { type: String },
        stockDate: { type: String },
        chaLedger: { type: String },
        grossQty: { type: String },
        grossQtyUnit: { type: String },
        remarks: { type: String },
    },
    "warehouseinward": {
        surveyorNameText: { type: String },
        locationName: { type: String },
        weightUnitName: { type: String },
        totalUnitShort: { type: String },
        warehouseWeightmentgrossQty: { type: Number },
        weightbridgeName: { type: String },
        weightmentSlip: { type: String },
        labourDetails: [
            {
                type: { type: String },
                name: { type: String },
                remarks: { type: String },
                hourlyRate: { type: String },
                workingHours: { type: String },
                serviceType: { type: String },
                contractAmount: { type: String }
            }
        ],
        directStuffContainerNo: { type: String },
        directStuffPackageType: { type: String },
        directStuffQty: { type: Number },
        directStuffVehicleNo: { type: String },
        weightUnit: { type: String },
        qtyUnit: { type: String },
        partyName: { type: String },
        vesselName: { type: String },
        grossWeight: { type: Number },
        tareWeight: { type: Number },
        netWeight: { type: Number },
        unitOrBulk: { type: String },
        inDate: { type: String },
        containerNoNonBonded: { type: String },
        warehousecontainerId: { type: String },
        damageTotalPackages: { type: Number },
        damageGrossQty: { type: Number },
        damageUnit: { type: String },
        damageUnitName: { type: String },
        damageGrossUnit: { type: String },
        damageGrossUnitName: { type: String },
        activityType: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        warehouseinwardId: { type: String },
        warehousedataentryId: { type: String },
        jobNo: { type: String },
        receiptDateTime: { type: String },
        gatePassNo: { type: String },
        date: { type: String },
        gatePassNoCfsPort: { type: String },
        vehicleNo: { type: String },
        transportName: { type: String },
        lrNo: { type: String },
        surveyorName: { type: String },
        packages: { type: Number },
        unit: { type: String },
        unitName: { type: String },
        remarks: { type: String },
        warehousing: { type: String },
        vehicleNo1: { type: String },
        warehouseId: { type: String },
        warehouseName: { type: String },
        bofeContainerNo: { type: String },
        containerType: { type: String },
        containerTypeName: { type: String },
        warehouseGodown: { type: String },
        location: { type: String },
        containerNo: { type: String },
        chaLedgerName: { type: String },
        inwardRemark: { type: String },
        sealNo: { type: String },
        importerLedgerName: { type: String },
        cfsSealNo: { type: String },
        inwardsblDate: { type: String },
        productDescription: { type: String },
        whBeNo: { type: Number },
        beDate: { type: String },
        blNo: { type: String },
        blDate: { type: String },
        totalPackages: { type: Number },
        totalUnit: { type: String },
        totalUnitName: { type: String },
        preparedBy: { type: String },
        shifting: { type: Boolean },
        directStuff: { type: Boolean },
        stuffing: { type: Boolean },
        BTT: { type: Boolean },
        deStuffing: { type: Boolean },
        impLoadingWarehouse: { type: Boolean },
        reworkingForCustomExam: { type: Boolean },
        damageProductDescription: { type: String },
        damageTotalPackages: { type: String },
        damageGrossQty: { type: String },
        shiftingFields: [
            {
                fromLocation: { type: String },
                toLocation: { type: String },
                quantity: { type: Number },
            }
        ]
    },
    "warehousecontainer": {
        unit: { type: String },
        unitName: { type: String },
        packages: { type: String },
        warehousedataentryId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        warehousecontainerId: { type: String },
        containerNo: { type: String },
        containerType: { type: String },
        containerTypeName: { type: String },
        gateInStatus: { type: String },
        inwardStatus: { type: String },
        inwardHandover: { type: String },
        gateOut: { type: String },
        finance: { type: String },
        location: { type: String },
        qtyAsPerBOE: { type: Number },
        actualQtyReceived: { type: Number },
        dispatchQty: { type: Number },
        balanceQty: { type: Number }
    },
    "igmmail": {
        extractedData: { type: Object },
        parsedTableData: { type: Array },
        isDataFilledWithThisEmail: { type: Boolean },
        igmcfsId: { type: String },
        allMail: { type: Boolean },
        igmmailId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        mailData: { type: Object },
    },
    "batchnotification": {
        batchnotificationId: { type: String },
        notificationType: { type: String },
        notificationText: { type: String },
        readUsers: [
            {
                userId: { type: String },
                userName: { type: String }
            }
        ],
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
    },
    "blscanning": {
        status: { type: Number },
        errors: { type: Array },
        blscanningId: { type: String },
        documentId: { type: String },
        extractedData: { type: Object },
        usageData: { type: Object },
        fileData: { type: Object },
        timeLine: { type: Object },
        modelUsage: { type: Object },
        notificationText: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        blObject: { type: Object },
    },
    "invoicescanning": {
        status: { type: Number },
        errors: { type: Array },
        invoicescanningId: { type: String },
        documentId: { type: String },
        extractedData: { type: Object },
        usageData: { type: Object },
        fileData: { type: Object },
        timeLine: { type: Object },
        modelUsage: { type: Object },
        notificationText: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        invoiceObject: { type: Object },
    },
    "jobemail": {
        jobemailId: { type: String },
        emailData: { type: Object },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String }
    },
    "jobautomation": {
        status: { type: Number },
        errors: { type: Array },
        jobautomationId: { type: String },
        documentId: { type: String },
        extractedData: { type: Object },
        usageData: { type: Object },
        fileData: { type: Object },
        timeLine: { type: Object },
        modelUsage: { type: Object },
        notificationText: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
        batchObject: { type: Object },
        agentadviceId: { type: String },
        agentadviceNo: { type: String },
        enquiryObject: { type: Object },
    },
    "tradefinance": {
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        tradefinanceId: { type: String },
        existingBankers: {
            accountNames: { type: String },
            mobileNumber: { type: String },
            bankBranch: { type: String },
            accountType: { type: String },
        },
        loanOutstanding: {
            type1Amount: { type: String },
            type1FacilityType: { type: String },
            type2Amount: { type: String },
            type2FacilityType: { type: String },
        },
        companyDetails: {
            fullCompanyName: { type: String },
            panNumber: { type: String },
            companyAddress: { type: String },
            iecCode: { type: String },
            gstNumber: { type: String },
            cinNumber: { type: String },
            incorporationDate: { type: String },
            businessNature: { type: String },
        },
        shareholders: [
            {
                fullName: { type: String },
                mobileNumber: { type: String },
                email: { type: String },
                shareholding: { type: String },
            }
        ],
        businessType: {
            type: { type: String },
            buyerName: { type: String },
            commodityExported: { type: String },
            destinationCountry: { type: String },
            lcTerms: { type: Boolean },
        },
        buyerCompanies: [
            {
                companyName: { type: String },
                country: { type: String },
                contactPerson: { type: String },
                contactEmail: { type: String },
            }
        ],
        financeDetails: {
            expectedF23Turnover: { type: String },
            sanctionRequirement: { type: String },
            remarks: { type: String },
            loanPurpose: { type: String },
            repaymentPeriod: { type: String },
        },
        agreeToTerms: { type: Boolean },
        documents: {
            bankStatement: { type: String },
            balanceSheet1: { type: String },
            balanceSheet2: { type: String },
            itr1: { type: String },
            itr2: { type: String },
        },
        fileNames: {
            bankStatement: { type: String },
            balanceSheet1: { type: String },
            balanceSheet2: { type: String },
            itr1: { type: String },
            itr2: { type: String },
        },
        submittedAt: { type: String },
    },
    "invoiceapproval": {
        invoiceapprovalId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        departmentSettings: [
            {
                department: { type: String },
                departmentId: { type: String },
                maskingName: { type: String },
                tierCount: { type: Number },
                position: { type: Number },
                tiers: [
                    {
                        tierName: { type: String },
                        selectedUsers: [
                            {
                                userId: { type: String },
                                userName: { type: String },
                            }
                        ],
                        valueBasedApprovals: { type: Boolean },
                        allApprovalRequired: { type: Boolean },
                        position: { type: Number },
                        valueBasedConfig: {
                            daTotal: {
                                minCommercial: { type: Number },
                                maxCommercial: { type: Number },
                                sequenceCommercial: { type: Number },
                                minNonCommercial: { type: Number },
                                maxNonCommercial: { type: Number },
                                sequenceNonCommercial: { type: Number },
                            },
                            departmentTotal: {
                                minCommercial: { type: Number },
                                maxCommercial: { type: Number },
                                sequenceCommercial: { type: Number },
                                minNonCommercial: { type: Number },
                                maxNonCommercial: { type: Number },
                                sequenceNonCommercial: { type: Number },
                            }
                        }
                    }
                ]
            }
        ],
    },
    "invoiceaction": {
        invoiceId: { type: String },
        departmentId: { type: String },
        invoiceactionId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        action: {
            type: String,
            enum: ["approve", "reject"], // validation at schema level
            required: true
        },
        remark: { type: String }
    },
    "lorryreceipt": {
        consigneeName: { type: String },
        uomName: { type: String },
        consignorName: { type: String },
        consignorShortcode: { type: String },
        consigneeShortcode: { type: String },
        lorryreceiptId: { type: String },
        orgId: { type: String },
        createdOn: { type: String },
        updatedOn: { type: String },
        createdBy: { type: String },
        createdByUID: { type: String },
        updatedBy: { type: String },
        updatedByUID: { type: String },
        jobNo: { type: String },
        lrNumber: { type: String },
        lrDate: { type: String },
        branch: { type: String },
        bookingType: { type: String },
        status: { type: String },
        referenceNo: { type: String },
        bookingId: { type: String },
        transporterName: { type: String },
        transporterAddress: { type: String },
        transporterGSTIN: { type: String },
        vehicleNumber: { type: String },
        driverName: { type: String },
        driverMobile: { type: String },
        driverLicense: { type: String },
        vehicleType: { type: String },
        truckCapacity: { type: Number },
        gpsDeviceId: { type: String },
        consignor: { type: String },
        consignorAddress: { type: String },
        consignorGSTIN: { type: String },
        consignorContact: { type: String },
        cosignee: { type: String },
        consigneeAddress: { type: String },
        consigneeGSTIN: { type: String },
        consigneeContact: { type: String },
        deliveryLocation: { type: String },
        origin: { type: String },
        destination: { type: String },
        containers: [
            {
                containerNumber: { type: String },
                containerSize: { type: String },
                containerType: { type: String },
                sealNumber: { type: String },
                containerCondition: { type: String },
                cargoDescription: { type: String },
                cargoWeight: { type: String },
                containerId: { type: String },
                containerTypeId: { type: String },
                containerTypeName: { type: String },
                grossWeight: { type: Number },
                netWeight: { type: String },
                cbm: { type: String },
                packageCount: { type: String },
                packageType: { type: String },
                tareWeight: { type: String },
                unit: { type: String },
            }
        ],
        routeLegs: [
            {
                legNumber: { type: Number },
                fromLocation: { type: String },
                toLocation: { type: String },
                distance: { type: Number },
                estimatedTime: { type: Number },
                status: { type: String },
            }
        ],
        numberOfPackages: { type: Number },
        weight: { type: Number },
        goodsDescription: { type: String },
        materialType: { type: String },
        uom: { type: String },
        invoiceNo: { type: String },
        invoiceValue: { type: Number },
        ewayBillNumber: { type: String },
        ewayBillDate: { type: String },
        ewayBillValidUpto: { type: String },
        ewayBillStatus: { type: String },
        isEwayBillRequired: { type: Boolean },
        ewayBillExemptionReason: { type: String },
        freightAmount: { type: Number },
        loadingCharge: { type: Number },
        unloadingCharge: { type: Number },
        otherCharges: { type: Number },
        handlingCharges: { type: Number },
        gstAmount: { type: Number },
        totalAmount: { type: Number },
        paymentType: { type: String },
        paymentRemarks: { type: String },
        currency: { type: String },
        currentStatus: { type: String },
        currentLocation: { type: String },
        eta: { type: String },
        deliveryDate: { type: String },
        actualDeliveryDate: { type: String },
        invoiceDoc: { type: String },
        ewayBillDoc: { type: String },
        podDoc: { type: String },
        rcLicenseDoc: { type: String },
        signedLRDoc: { type: String },
        linkedInvoices: [],
        modifiedBy: { type: String },
        modifiedOn: { type: String },
        consignorSignature: { type: String },
        transporterSignature: { type: String },
        consigneeSignature: { type: String },
        remarks: { type: String },
        batchId: { type: String },
        batchNo: { type: String },
    },
    "filelog": {
        createdOn: {
            type: String,
            required: true,
        },
        createdBy: {
            type: String
        },
        createdByUID: {
            type: String
        },
        updatedOn: {
            type: String,
        },
        updatedBy: {
            type: String,
        },
        updatedByUID: {
            type: String,
        },
        documentName: { type: String, required: true },
        documentType: { type: String, required: true },
        size: { type: String },
        filelog: { type: String },


        refType: { type: String },
        originalName: { type: String },
        extension: { type: String },
        baseName: { type: String },
        uniqueFileName: { type: String },
        downloadableFileName: { type: String }
    }
}
let newSchemaWithObject = {};
Object.keys(schemas).forEach((collectionName) => {
    const schema = new mongoose.Schema(schemas[collectionName]);

    if (!(["inappnotification", "logaudit"].includes(collectionName))) {
        schema.post('findOneAndUpdate', async function (doc) {
            const updatedData = this.getUpdate(); // New data after the update

            await createAuditLog(collectionName, 'UPDATE', doc ? doc[`${collectionName}Id`] : '', updatedData);
        });

        schema.post('findOneAndDelete', async function (doc) {
            const updatedData = this.getUpdate(); // New data after the update

            await createAuditLog(collectionName, 'UPDATE', doc[`${collectionName}Id`], updatedData);
        });

        schema.post('findOneAndDelete', async function (doc) {
            if (doc) {
                await createAuditLog(collectionName, 'DELETE', doc[`${collectionName}Id`], doc);
            }
        });

        schema.post('insertMany', async function (result) {
            for (let i = 0; i < result?.length; i++)
                await createAuditLog(collectionName, 'CREATE', result[i][`${collectionName}Id`], result[i]);
        });

        schema.post('updateMany', async function (result) {
            for (let i = 0; i < result?.length; i++)
                await createAuditLog(collectionName, 'UPDATE', result[i][`${collectionName}Id`], result[i]);
        });

        schema.post('save', async function (doc) {
            const updatedData = doc.toObject(); // New data after the save

            await createAuditLog(collectionName, 'CREATE', doc[`${collectionName}Id`], updatedData);
        });
    }

    newSchemaWithObject[collectionName] = schema;
});

async function createAuditLog(collectionName, action, resourceId, updatedData) {
    const traceId = requestContext.getTraceId()

    const auditlogModel = mongoose.models[`auditlogModel`] ||
        mongoose.model(`auditlogModel`, new mongoose.Schema({
            action: String,
            resource: String,
            resourceId: String,
            updatedData: Object,
            updatedByUID: String,
            updatedBy: String,
            updatedOn: String,
            recordedOn: Date,
            traceId: String
        }), `logaudits`);

    await auditlogModel({
        action: action,
        resource: collectionName,
        resourceId: resourceId,
        updatedByUID: updatedData?.updatedByUID || updatedData?.$set?.updatedByUID,
        updatedBy: updatedData?.updatedBy || updatedData?.$set?.updatedBy,
        updatedOn: updatedData?.updatedOn || updatedData?.$set?.updatedOn,
        updatedData: updatedData?.$set ? updatedData?.$set : updatedData,
        traceId: traceId,
        recordedOn: new Date().toISOString()
    }).save();
}


module.exports = newSchemaWithObject;