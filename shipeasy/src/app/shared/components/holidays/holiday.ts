export interface HolidayDetail {
  orgId: string;
  tenantId: string;
  country: {
    countryId: any;
    countryName: any;
  };
  holidayName: string;
  holidayId: string;
  holidayDate: any;
  status: true;
  createdBy: any;
  createdOn: any;
  updatedBy: any;
  updatedOn: any;
}

export interface Holiday {
  _id: { $oid: string };
  orgId: string;
  tenantId: string;
  country: {
    countryId: string;
    countryName: string;
  };
  year: string;
  dateOfHoliday: string;
  holidayName: string;
  holidayDate: string[];
  holidayType: string;
  remark: string;
  status: boolean;
  parentId: string;
  module: string;
  referenceId: string;
  holidayId: string;
  createdOn: string;
  updatedOn: string;
  createdBy: string;
  createdByUID: string;
  updatedBy: string;
  updatedByUID: string;
  __v: number;
}
