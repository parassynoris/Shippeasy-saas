const schema = {
    "type": "object",
    "properties": {
        "invoiceId": { 
            "type": "string",
            "description": "The unique id for this invoice, e.g. 53cebc31-50cd-11ef-9774-9b75802ff33d"
        },
        "invoice_date": { 
            "type": "string", 
            "format": "date-time",
            "description" : "Date-Time of invoice creation, e.g. 2024-08-02T18:29:00.000Z"
        },
        "invoiceDueDate": { 
            "type": "string", 
            "format": "date-time",
            "description" : "Date-Time of invoice due, e.g. 2024-08-02T18:29:00.000Z"
        },
        "invoiceType": { 
            "type": "string" ,
            "enum": [
                'Additional Invoice',
                'B2B',
                'Detention Invoice',
                'Freight Invoice',
                'Ground Rent Invoice',
                'Local',
                'Lum Sum Invoice',
                'Lumpsum Invoice',
                'Payment Invoice',
                'Performa Invoice',
                'Periodic Invoice',
                'Proforma Invoice',
                'bills',
                'creditNote',
                'debitNote'
            ]
        },
        "remarks": { "type": "string" },
        "invoiceNo": { "type": "string" },
        "invoiceToGst": { 
            "type": "string",
            "description" : "GST No of party for whom invoice is created"
        },
        "invoiceToName": { 
            "type": "string",
            "description" : "Name of party for whom invoice is created"
        },
        "invoiceFromName": { 
            "type": "string",
            "description" : "Name of party from where invoice is created"
        },
        "invoiceAmount": { 
            "type": "string"
        },
        "invoiceTaxAmount": { 
            "type": "string"
        },
        "tax": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "taxAmount": { "type": "number" },
                    "taxRate": { "type": "number" },
                    "taxName": { "type": "string" }
                },
                "required": ["taxAmount", "taxRate", "taxName"]
            }
        },
        "shipperName": { "type": "string" },
        "consigneeName": { "type": "string" },
        "paymentStatus": { 
            "type": "string" ,
            "enum": [
                'Overdue', 'Paid', 'Partially Paid', 'Unpaid'
            ]
        },
        "paidAmount": { "type": "number" },
        "jobNumber": { "type": "string" },
        "paymentTerms": { "type": "number" },
        "bankId": { "type": "string" },
        "bankName": { "type": "string" },
        "bankType": { "type": "string" },
        "voyageNumber": { "type": "string" },
        "vesselName": { "type": "string" },
        "currencyId": { "type": "string" },
        "currency": { "type": "string" },
        "grossAmount": { "type": "number" },
        "baseAmount": { "type": "number" },
        "amount": { "type": "number" },
        "actualInvoiceAmount": { "type": "number" },
        "payableAmount": { "type": "number" },
        "invoiceBalance": { "type": "number" },
        "amountPaid": { "type": "number" },
        "amountPending": { "type": "number" },
        "amountDeducted": { "type": "number" },
        "taxableAmount": { "type": "number" },
        "totalTax": { "type": "number" },
        "totalAmount": { "type": "number" },
        "sgst": { "type": "number" },
        "cgst": { "type": "number" },
        "igst": { "type": "number" },
        "ces": { "type": "number" },
        "taxAmount": { "type": "number" },
        "costItems": {
            "description" : "it is a table of items for this invoice is being made, so extract table",
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "currency": { "type": "string" },
                    "containerType": { "type": "string" },                    
                    "description": { "type": "string" },
                    "tenantId": { "type": "string" },
                    "enquiryitemId": { "type": "string" },
                    "quotationId": { "type": "string" },
                    "enqDate": { "type": "string", "format": "date-time" },
                    "collectPort": { "type": "string" },
                    "costitemGroup": { "type": "string" },
                    "stcQuotationNo": { "type": "string" },
                    "enqType": { "type": "string" },
                    "costItemId": { "type": "string" },
                    "accountBaseCode": { "type": "string" },
                    "costItemName": { "type": "string" },
                    "costHeadId": { "type": "string" },
                    "costHeadName": { "type": "string" },
                    "exchangeRate": { "type": "string" },
                    "currency": { "type": "string" },
                    "amount": { "type": "string" },
                    "baseAmount": { "type": "string" },
                    "basic": { "type": "string" },
                    "basicId": { "type": "string" },
                    "tenantMargin": { "type": "number" },
                    "buyEstimates": {
                        "type": "object",
                        "properties": {
                            "currencyId": { "type": "string" },
                            "currency": { "type": "string" },
                            "exChangeRate": { "type": "string" },
                            "rate": { "type": "number" },
                            "amount": { "type": "number" },
                            "taxableAmount": { "type": "number" },
                            "totalAmount": { "type": "number" },
                            "terms": { "type": "string" },
                            "supplier": { "type": "string" },
                            "igst": { "type": "number" },
                            "cgst": { "type": "number" },
                            "sgst": { "type": "number" },
                            "buyerInvoice": { "type": "boolean" }
                        }
                    },
                    "selEstimates": {
                        "type": "object",
                        "properties": {
                            "currencyId": { "type": "string" },
                            "currency": { "type": "string" },
                            "exChangeRate": { "type": "string" },
                            "rate": { "type": "number" },
                            "amount": { "type": "number" },
                            "taxableAmount": { "type": "number" },
                            "totalAmount": { "type": "number" },
                            "terms": { "type": "string" },
                            "remarks": { "type": "string" },
                            "igst": { "type": "number" },
                            "cgst": { "type": "number" },
                            "sgst": { "type": "number" },
                            "sellerInvoice": { "type": "boolean" }
                        }
                    },
                    "tax": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "taxAmount": { "type": "number" },
                                "taxRate": { "type": "number" }
                            }
                        }
                    },
                    "quantity": { "type": "number" },
                    "rate": { "type": "number" },
                    "stcAmount": { "type": "number" },
                    "jmbAmount": { "type": "number" },
                    "payableAt": { "type": "string" },
                    "gst": { "type": "number" },
                    "gstType": { "type": "string" },
                    "totalAmount": { "type": "number" },
                    "chargeTerm": { "type": "string" },
                    "remarks": { "type": "string" },
                    "containerNumber": {
                        "type": "array",
                        "items": { "type": "string" }
                    },
                    "shippingLine": { "type": "string" },
                    "taxApplicability": { "type": "string" },
                    "hsnCode": { "type": "string" },
                    "isEnquiryCharge": { "type": "boolean" },
                    "moveNumber": { "type": "number" }
                }
            }
        },
    }
}


module.exports = schema;