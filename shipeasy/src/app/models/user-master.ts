interface AccessLevel {
    featureCode: string;
    stage: any[]; // Assuming stage is of any type
    featureName: string;
    accesslevel: string[];
    module: string;
    menu: any[]; // Assuming menu is of any type
  }
  
  interface Menu {
    menuName: string;
    menuId: string;
    menuUrl?: string;
    module?: string;
    featureId?: string;
    isMappedToAgentFeature?: boolean;
    isMappedToFeature?: boolean;
    isMappedToOperatorFeature?: boolean;
    menuIcon?: string;
    menuLevel?: number;
    menuLevelAgent?: number;
    menuLevelOperator?: number;
    parentMenuId?: string;
    parentMenuIdAgent?: string;
    parentMenuIdOperator?: string;
    sortOrder?: number;
    status?: boolean;
    tenantId?: string;
    createdBy?: string;
    updatedBy?: string;
    createdOn?: string;
    updatedOn?: string;
  }
  
export interface Roles {
    roleId: string;
    accesslevel: AccessLevel[];
    createdBy: string;
    createdOn: string;
    isActive: boolean;
    module: string;
    orgId: string;
    roleDescription: string;
    roleName: string;
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    menu: Menu[];
    updatedByUID: string;
    level:string,
  }
  interface Menu {
    menuId: string;
    menuName: string;
  }
  

  