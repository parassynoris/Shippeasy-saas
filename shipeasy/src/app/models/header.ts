export interface Notification {
    inappnotificationId: string;
    userId: string;
    email: string;
    tenantId: string;
    orgId: string;
    userAWSProfile: string;
    userLogin: string;
    notificationMasterId: string;
    notificationName: string;
    notificationURL: string;
    module: string;
    createdOn: { $date: string };
    updatedOn: { $date: string };
    createdBy: string;
    read: boolean;
    notificationType: string;
  }