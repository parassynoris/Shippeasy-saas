export class Role{
    tenantId:string;
    orgId:string;
    module:string;
    status:string;
    roleName:string;
    roleDescription:string;
    roleId:string;
    createdDate:string;
    accesslevel:any=[];
    isActive:boolean;
    menu:any=[]
}
export class AccessLevels{
    menuAccess:any=[];
    featureName:string;
    featureCode:string;
    module:string;
    feature:string;
    accesslevel:any=[];
    stage:any=[];
    menu:any=[]
}
