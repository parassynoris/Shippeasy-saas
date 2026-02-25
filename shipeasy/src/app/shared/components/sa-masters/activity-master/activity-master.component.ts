import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import * as XLSX from "xlsx";
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CountryData } from 'src/app/models/city-master';
import { uom } from 'src/app/models/uom';
import { Vessel } from 'src/app/models/vessel-master';
import { CognitoService } from 'src/app/services/cognito.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { environment } from 'src/environments/environment';
import { ApiService } from 'src/app/admin/principal/api.service';

@Component({
  selector: 'app-activity-master',
  templateUrl: './activity-master.component.html',
  styleUrls: ['./activity-master.component.scss']
})
export class ActivityMasterComponent implements OnInit {
  _gc=GlobalConstants;
  modalReference: NgbModalRef;
  addVesselForm: FormGroup;
  vesseldata: Vessel[]  = [];
  vesselIdToUpdate: string;
  closeResult: string;
  submitted: any = false;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  minDate = environment.validate.minDate;
  vesselCode: any;
  ownershipeType: any = ['Text','Date','Number'];
  railCarrier:any;
  carrierCode:any;
  railCar:any;
  wagonNumber:any;
  Dimensions:any;
  Capacity:any;
  Cargo:any;
  TRAMP_VESSEL_ID: any;
  IN_ACTIVE_FLAG: any;
  countryList:CountryData [] = [];
  uomcategoryList: uom[]  = [];
  vesselTypeList: any = [];
  certificateData: any = [];
  certificateName: any;
  certificateValidFrom: any;
  certificateValidTo: any;
  certificateDoc: any;
  systemData: any;
  vesselCategories: any = [];
  vesselSubTypeList: any = [];
  vesselSubtypes: any = [];
  documentName: any;
  tenantId: any;
  yardcfs:any;
  activeButton: number = 1;
  email:any
  isEditing: boolean = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns =[
    '#', 
    'action',
    'vesselLineup',
    'status'
  ];

  constructor(
    public modalService: NgbModal,
    private masterservice: MastersService,
    private fb: FormBuilder, private cognito : CognitoService,
    private notification: NzNotificationService,private commonfunction: CommonFunctions,
    private saMasterService: SaMasterService,
    public commonService: CommonService,
    public datepipe: DatePipe,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
    private _api: ApiService

  ) {
    this.formBuild();
  }
  get fieldsArray() {
    return this.addVesselForm.get('fields') as FormArray;
  }
  formBuild() {
    this.addVesselForm = this.fb.group({
      vesselLineup:['',Validators.required],
      status: [true],
      fields: this.fb.array([])
    });
  }
  fieldGroup:FormGroup
  addField() {
    this.fieldGroup = this.fb.group({
      activity: ['', Validators.required],
      dataType: ['', Validators.required],
      status: [true],
    });

    this.fieldsArray.push(this.fieldGroup);
  }
  ngOnInit(): void {
    this.getData();
    this.getVesselType();
    this.getactivityType();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }

  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }


  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  // searchColumns() {
  //   this.filterKeys = {};
  //   this.filtersModel.forEach((each, ind) => {
  //     if (each)
  //       this.displayedColumns[ind] !== 'status' ?
  //     this.filterKeys[this.displayedColumns[ind]] = {
  //       "$regex":  each.toLowerCase(),
  //       "$options": "i"
  //     } : this.filterKeys[this.displayedColumns[ind]] = {
  //       "$eq":  (each.toLowerCase()  === 'active'? true : false) ,
  //     }

  //   });
  //   let payload = this.commonService.filterList()
  //   payload.query = this.filterKeys
  //   payload.sort = {
  //     "desc": ["updatedOn"]
  //   }
  //   this.commonService?.getSTList('lineupactivity', payload)?.subscribe((data) => {
  //     this.yardcfs = data.documents;
  //     this.dataSource = new MatTableDataSource(
  //       data?.documents?.map((s: any,index) => {
  //         return{
  //           ...s,
  //           id:index+1
  //         }
  //       })
  //     );
  //     this.dataSource.paginator = this.paginator;
  //     this.dataSource.sort = this.sort1;

  //   });


  // }
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each) {
        if (this.displayedColumns[ind] === 'status') {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": each.toLowerCase() === 'active' ? true : false
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          };
        }
      }
    });

    let payload = this.commonService.filterList();
    payload.query = this.filterKeys;
    payload.sort = {
      "desc": ["updatedOn"]
    };
    this.commonService.getSTList('lineupactivity', payload)?.subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          };
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
    });
  }

  // exportAsExcelFile() {
    
  //   const dataToExport = this.dataSource.data.map((item: any) => {
  //     return {
  //       "ID": item.id || '',
  //       "Vessel Lineup": item.vesselLineup || '',
  //       "Status": item.status ? 'Active' : 'Inactive',
  //     };
  //   });
  //   const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Vessel Lineup Data');


  //   XLSX.writeFile(workbook, 'VesselLineupData.xlsx');
  // }
  exportAsExcelFile() {
    // Filter out rows with invalid or empty 'vesselLineup'
    const filteredData = this.dataSource.data.filter((item: any) => item.vesselLineup?.trim());
  
    // Prepare the data for export (only include required fields)
    const dataToExport = filteredData.map((item: any) => ({
      "ID": item.id || '', // Only include necessary fields
      "Vessel Lineup": item.vesselLineup || '',
      "Status": item.status ? 'Active' : 'Inactive',
    }));
  
    // Check if there's valid data to export
    if (dataToExport.length === 0) {
      alert('No data to export.');
      return;
    }
  
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  
    // Adjust column widths to remove unnecessary blank spaces
    const wscols = [
      { wch: 5 },  // ID column width
      { wch: 20 }, // Vessel Lineup column width
      { wch: 10 }  // Status column width
    ];
    worksheet['!cols'] = wscols;
  
    // Create a workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vessel Lineup Data');
  
    // Write the workbook to a file
    XLSX.writeFile(workbook, 'VesselLineupData.xlsx');
  }
  
  

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getData()
  }

  get cranes() {
    return this.addVesselForm.get('cranes') as FormArray;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }

  get f() {
    return this.addVesselForm.controls;
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this. getData();
  }
  vesselLineup:any
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.size= this.pageSize,
    payload.from=this.from
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    this.vesselLineup = this.vesselLineup?.trim();

    if (this.vesselLineup) {
      mustArray['vesselLineup'] = {
        "$regex" : this.vesselLineup,
        "$options": "i"
    }
    }
    
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    payload.query = mustArray
    this.commonService.getSTList('lineupactivity', payload).subscribe((res: any) => {
      this.vesseldata = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          vesselLineup:s.vesselLineup,
          status:s.status
        }));
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
    },()=>{
      this.loaderService.hidecircle();
    });
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getData();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
    payload.query = { }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
    this.vesselLineup = this.vesselLineup?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.vesselLineup) {
      mustArray['vesselLineup'] = {
        "$regex" : this.vesselLineup,
        "$options": "i"
    }
    }
    
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }
    payload.query = mustArray
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('lineupactivity', payload).subscribe((data) => {
      this.vesseldata = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    this.vesselLineup = this.vesselLineup?.trim();
    this.IN_ACTIVE_FLAG = this.IN_ACTIVE_FLAG?.trim();
    if (this.vesselLineup) {
      mustArray['vesselLineup'] = {
        "$regex" : this.vesselLineup,
        "$options": "i"
    }
    }
    
    if (this.IN_ACTIVE_FLAG) {
      mustArray['status'] = this.IN_ACTIVE_FLAG === 'true' ? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize -1,
    this.commonService.getSTList('lineupactivity', payload).subscribe((data) => {
      this.vesseldata = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  removeField(index: number) {
    this.fieldsArray.removeAt(index);
  }
  shippinglineData:any = [];
  getVesselType() {
    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: 'vesselLineup',
      "status": true
    }
    this.commonService.getSTList('systemtype', payload).subscribe((res: any) => {
      this.shippinglineData = res?.documents?.filter(x => x.typeCategory === "vesselLineup");
    });
  }
  activityType: any= [];
  getactivityType() {
    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: 'Activity',
      "status": true
    }
    this.commonService.getSTList('systemtype', payload).subscribe((res: any) => {
      this.activityType = res?.documents?.filter(x => x.typeCategory === "Activity");
    });
  }
  clear() {
    this.wagonNumber = ""
    this.Capacity = ""
    this.railCarrier =""
    this.carrierCode = ""
    this.carrierCode = ""
    this.Cargo = ""
    this.Dimensions = ""
    this.getData();
  }
  show: string;
  isDisabled: boolean = false;
  open(content, vessel?: any, show?: string) {
    this.show = show; // Pass the show parameter to the template
  
    if (vessel) {
      this.vesselIdToUpdate = show === 'show' ? null : vessel.lineupactivityId;
      this.addVesselForm.patchValue({
        vesselLineup: vessel.vesselLineup,
        status: vessel.status,
      });

      if (vessel.certificates) {
        this.certificateData = vessel.certificates;
      }
      (vessel?.fields ?? []).forEach((rr) => {
        const data = this.fb.group({
          activity: ['', Validators.required],
          dataType: ['', Validators.required],
          status: [true],
        });
        data.patchValue(rr);
        this.fieldsArray.push(data);
      });

      // Disable form if in view mode
      this.isDisabled = show === 'show';
      show === 'show' ? this.addVesselForm.disable() : this.addVesselForm.enable();
    }
    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }

  refreshData() {
    var myInterval = setInterval(() => {
      this.getData();
      clearInterval(myInterval);
    }, 1000);
  }
  vesselMasters() {
    this.submitted = true;

    if (this.addVesselForm.invalid) {
      this.notification.create('error', 'Please fill required fields', '');
      return;
    }

    const fieldsArray = this.addVesselForm.get('fields') as FormArray;
    let activitySelected = false;

    for (let i = 0; i < fieldsArray.length; i++) {
      const fieldGroup = fieldsArray.at(i) as FormGroup;
      if (fieldGroup.get('activity').value) {
        activitySelected = true;
        break;
      }
    }

    if (!activitySelected) {
      this.notification.create('error', 'At least one activity field is required', '');
      return;
    }

    let newdata = this.addVesselForm.value;
    newdata.tenantId = this.tenantId;
    if (!this.vesselIdToUpdate) {
      this.commonService.addToST('lineupactivity', newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.refreshData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error || 'An error occurred', '');
        }
      );
    } else {
      newdata.lineupactivityId = this.vesselIdToUpdate;
      this.commonService.UpdateToST(`lineupactivity/${newdata.lineupactivityId}`, newdata).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.refreshData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error || 'An error occurred', '');
        }
      );
    }
  } 

  changeStatus(data, i) {
    this.commonService.UpdateToST(`lineupactivity/${data.lineupactivityId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.vesseldata[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.getData();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  onSave() {
    this.submitted = false;
    this.vesselIdToUpdate = null;
    this.formBuild();
    this.submitted = false;
    this.modalService.dismissAll();
    this.certificateData = [];
    return null;
  }

}
