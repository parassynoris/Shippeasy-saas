 export interface User {
    userId: string;
    createdBy: string;
    createdOn: string;
    isChatUser: boolean;
    isLocked: boolean;
    isQCMandatory: boolean;
    name: string;
    orgId: string;
    override_orgId: boolean;
    password: string;
    phoneNo: string;
    roles: Role[];
    status: boolean;
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    userAWSProfile: string;
    userEmail: string;
    userKey: string;
    userLastname: string;
    userLogin: string;
    userName: string;
    userStatus: boolean;
    userType: string;
    fcmToken: null;
    userProfile:string;
    createdDate:string;
  }
  
  interface Role {
    roleName: string;
    roleId: string;
    module: string;
  }
  