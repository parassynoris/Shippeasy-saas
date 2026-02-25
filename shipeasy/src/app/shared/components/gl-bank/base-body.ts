export class BaseBody {
    baseBody: any = {
        size: 1000,
        sort : {
            "createdOn": "desc"
          },
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