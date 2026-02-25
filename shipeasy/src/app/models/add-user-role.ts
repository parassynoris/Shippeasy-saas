 export interface Feature {
    isExport:any;
    isImport:any;
    isTransport:any;
    isWarehouse:any;
    StageList: any[];
    PermissionList: any[];
    featureId: string;
    accesslevel: string[];
    featureCode: string;
    featureName: string;
    featureType: string;
    menu: FeatureMenu[];
    module: string;
    orgId: string;
    stage: any[]; // Define the structure of stage if available
    tenantId: string;
    IsChecked:boolean
  }
  interface FeatureMenu {
    menuId: string;
    menuName: string;
  }