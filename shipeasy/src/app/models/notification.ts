export interface Notification {
    departments: any[];

    notificationId: string;
    action: string;
    attachmentURLs: string[];
    createdBy: string;
    createdOn: string;
    description: string;
    emailTo: {
      CC: string;
      To: string;
    };
    module: string;
    notificationMode: string[];
    notificationType: string;
    orgId: string;
    params: {
      bankAccount: string;
      country: string;
      portcallId: string;
      timezone: string;
      isDST: string;
      agentName: string;
      daStatus: string;
      voyage: string;
      addressId: string;
      operatorUserid: string;
      vesselId: string;
      daType: string;
      port: string;
      daId: string;
      vessel: string;
      time: string;
      portcallNo: string;
    };
    sender: {
      senderName: string;
      senderEmail: string;
    };
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    userId: string;
  }
  