// Define the interface for MetaData
interface MetaData {
    value: string;
    key: string;
  }
  
  // Define the interface for Principal
  interface Principal {
    addressName: string;
    addressId: string;
  }
  
  // Define the main interface for the entire data structure
  export interface document {
    _id: {
      $oid: string;
    };
    documentId: string;
    collection: string;
    createdBy: string;
    createdOn: string;
    documentName: string;
    documentType: string;
    documentURL: string;
    isOld: boolean;
    metaData: MetaData[];
    orgId: string;
    principal: Principal;
    refType: string;
    s3Bucket: string;
    tags: string[];
    tenantId: string;
    updatedBy: string;
    updatedOn: string;
    userType: string;
    siAttachmentName:string;
    filedAttachmentName:string;
    finalAttachmentName:string;
    firstPrintAttachmentName:string;
    dgAttachmentName:string;
  }
  