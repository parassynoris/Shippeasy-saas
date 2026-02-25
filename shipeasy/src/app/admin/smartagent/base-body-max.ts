export class BaseBody {
    baseBody: any = {
        size: 5000,
        sort:{createdOn : 'desc'},
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
