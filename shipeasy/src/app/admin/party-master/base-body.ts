export class BaseBody {
    baseBody: any = {
        size: 1000,
        query: {
            bool: {
                must: [],
                filter: [],
                should: [],
                must_not: [],
            },
        }
    }
}
export class CutomerType {
    data: any = [
        { "name": "Principal" },
        { "name": "Shipper" },
        { "name": "Consignee" },
        { "name": "Forwarder" },
        { "name": "CHA" },
        { "name": "Vendor" },
        { "name": "Broker" },
        { "name": "Transporter" },
        { "name": "Surveyor" },
        { "name": "Notify Party" },
        { "name": "Charterer" },
        { "name": "CFS" },
        { "name": "Terminal" },
        { "name": "Port" },
    ]
}











