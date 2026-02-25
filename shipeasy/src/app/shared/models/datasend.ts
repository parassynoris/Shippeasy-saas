export class DataSend {
    dataSend: any = {
        size: 500,
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