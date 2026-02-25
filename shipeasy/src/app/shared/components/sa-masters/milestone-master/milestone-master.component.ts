import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import * as XLSX from "xlsx";

@Component({
  selector: 'app-milestone-master',
  templateUrl: './milestone-master.component.html',
  styleUrls: ['./milestone-master.component.scss']
})
export class MilestoneMasterComponent implements OnInit {
  _gc = GlobalConstants;
  pageSize: number;
  from: number;
  milestoneData: any;
  toggleFilters = true;
  addMileStoneForm: FormGroup;
  dataSource = new MatTableDataSource<any>();
  sort1: any;
  toalLength: any;
  count: any;
  submitted: boolean;
  idToUpdate: string;
  isViewMode: any;
  tenantId: any;
  loadTypeList: any = [];
  loadTypeListOriginal: any = [];
  pageNumber = 1;
  filtersModel = [];
  filterKeys = {};
  jobShipmentType:any = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,
    private notification: NzNotificationService,
    public loaderService: LoaderService,
    private commonFunction: CommonFunctions,
    private fb: FormBuilder, private cognito: CognitoService,
    private cdr: ChangeDetectorRef
  ) { }

  displayedColumns = [
    '#',
    'action',
    'flowType',
    'shipmentType',
    'loadType',
    'locationType',
    'freightTypeName',
    'mileStoneName',
    'seq',
    'color',
    'status',
  ];


  dropdownSettings:any ={
    singleSelection: false,
    idField: 'item_id',
    textField: 'item_text',
    enableCheckAll: false,
    allowSearchFilter: false,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };

  shipmentTypeData = [];

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  ngOnInit(): void {
    // this.getRoleList()
    this.getSystemTypeDropDowns()
    this.getData();
    this.formBuild()
    // this.getShippingLineDropDowns()

  }
  formBuild() {
    this.addMileStoneForm = this.fb.group({

      freightType: new FormControl('', Validators.required),
      loadType: new FormControl('', Validators.required),
      mileStoneName: new FormControl('', Validators.required),
      flowType: new FormControl('', Validators.required),
      shipmentType: new FormControl('', Validators.required),
      seq: new FormControl('', Validators.required),
      color:new FormControl('#007BFF',Validators.required),
      locationType: new FormControl('', Validators.required),
      status: new FormControl(true),
      customOrigin: [false],
      customDestination: [false],

    });
  }

  get f() {
    return this.addMileStoneForm.controls;
  }

  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getData();
  }
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if (payload?.size) payload.size = this.pageSize,
      payload.from = this.from
    // let mustArray = {};

    //  payload.size = Number(this.size)
    //  payload.from = 0,
    this.commonService.getSTList('milestonemaster', payload)?.subscribe((res: any) => {
      this.milestoneData = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          freightType: s.freightType,
          loadType: s.loadType,
          mileStoneName: s.mileStoneName,
          status: s.status

        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle();
      }
    }, () => {
      this.loaderService.hidecircle();
    });

  }
  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  mileStone: string
  open(content, mileStone?: any, show?: string) {
    this.isViewMode = show === 'show'; // Set view mode based on the 'show' parameter

    // Reset the form when opening for a new entry
    this.addMileStoneForm.reset();

    if (mileStone) { 
      const activeFright = this.shipmentTypes?.find(x => x.systemtypeId === mileStone.freightType)?.typeName?.toLowerCase();
      if (activeFright == 'air') {
        this.activeFrightAir = true
      } 
      this.flowTypeChange(mileStone?.flowType,mileStone?.freightTypeName)
      let options = mileStone.shipmentType?.map((i) => { return {item_text:i?.item_text,item_id:i?.item_id}}) || [];
      this.shipmentTypeData = options;

      if(mileStone?.flowType?.toLowerCase() === 'import'){ 
        if(this.activeFrightAir){
          this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ImportShipmentTypeAir')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
        }else{
          this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ImportShipmentType')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
        }
      }
      if(mileStone?.flowType?.toLowerCase() === 'export'){
        if(this.activeFrightAir){
          this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ExportShipmentType')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
        }else{
          this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ExportShipmentTypeAir')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
        }
       }
      this.cdr.detectChanges();

      // Edit mode: populate form with existing driver data
      this.idToUpdate = mileStone.milestonemasterId;
      this.addMileStoneForm.patchValue({
        flowType: mileStone?.flowType || '',
        freightType: mileStone.freightType || '',
        loadType: mileStone.loadType || '',
        mileStoneName: mileStone.mileStoneName || '',
        shipmentType: options || [],
        status: mileStone?.status || true,
        seq: mileStone?.seq || '',
        color: mileStone?.color || '',
        locationType: mileStone?.locationType || '',
        customOrigin: mileStone?.customOrigin || false,
        customDestination: mileStone?.customDestination || false,
        // milestonemasterId: mileStone?.milestonemasterId || ''
      });
      
     

      // Enable or disable the form based on view mode
      if (this.isViewMode) {
        this.addMileStoneForm.disable();
      } else {
        this.addMileStoneForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.addMileStoneForm.enable();
    }

    // Open the modal dialog
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  shipmentTypes: any = [];
  activeFrightAir:boolean = false;
  shipmentType(value) {
    const activeFright = this.shipmentTypes?.find(x => x.systemtypeId === this.addMileStoneForm.value.freightType)?.typeName?.toLowerCase();
    this.activeFrightAir = false
    if (activeFright == 'air') {
      this.activeFrightAir = true
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['Loose', 'ULD Container']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (activeFright == 'ocean') {
      this.activeFrightAir = false
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'LCL', 'Break Bulk']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()));

    } else if (activeFright == 'land') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FCL', 'FTL', 'PTL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else if (activeFright == 'rail') {
      this.loadTypeList = this.loadTypeListOriginal?.filter((x) => ['FWL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
    } else {
      this.loadTypeList = this.loadTypeListOriginal
    }
    if(value){
      const freightType = this.shipmentTypes?.find((i) => i?.systemtypeId == value)?.typeName;
      this.flowTypeChange(this.addMileStoneForm.value.flowType,freightType)
    }
    

    
  }


  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "carrierType", "shipmentType", "ImportShipmentType" ,"ExportShipmentType",'ImportShipmentTypeAir',"ExportShipmentTypeAir"
        ]
      }
    }
    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.loadTypeListOriginal = res?.documents ?? [];
      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType" && (x?.typeName?.toLowerCase() === "land" || x?.typeName?.toLowerCase() === "ocean" || x?.typeName?.toLowerCase() === "air")));
    });
  }

  isTransport: boolean = false;
  onSaveMileStoneMaster() {
    this.submitted = true;
    if (this.addMileStoneForm.invalid) {

      return;
    }

    let dataupdate = this.addMileStoneForm.value
    dataupdate.tenantId = this.tenantId
    dataupdate.status = true
    dataupdate = {
      ...dataupdate, freightTypeName: this.shipmentTypes.find(d => d?.systemtypeId === this.addMileStoneForm?.value?.freightType)?.typeName ?? '',
      shipmentTypeId: this.jobShipmentType.find((i) => i?.typeName === dataupdate?.shipmentType)?.systemtypeId || ''
    }
    if (!this.idToUpdate) {
      dataupdate.milestonemasterId = this.idToUpdate
      this.commonService.addToST('milestonemaster', dataupdate).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');
              this.close();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
          this.close();
        }
      );
    } else {
      let newMileStone = { ...dataupdate, milestonemasterId: this.idToUpdate };
      this.commonService.UpdateToST(`milestonemaster/${newMileStone.milestonemasterId}`, newMileStone).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              this.close();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.close();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  close() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.idToUpdate = null;
    this.addMileStoneForm.reset();
    this.submitted = false;
    return null;
  }

  changeStatus(data) {
    this.commonService.UpdateToST(`milestonemaster/${data.milestonemasterId}`, { ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.close();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.close();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.displayedColumns[ind] !== 'status' ?
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          } : this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": (each.toLowerCase() === 'active' ? true : false),
          }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }

    this.commonService.getSTList('milestonemaster', payload).subscribe((data) => {
      this.milestoneData = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }


  flowTypeChange(value:any, freightType){  
    if(value?.toLowerCase() === 'import'){
      if(this.activeFrightAir){
        this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ImportShipmentTypeAir')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
      }else{
        this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ImportShipmentType')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
      }
    }
    if(value?.toLowerCase() === 'export'){
      if(this.activeFrightAir){
      this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ExportShipmentTypeAir')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});
    }else{
      this.jobShipmentType = this.loadTypeListOriginal?.filter((x) => x.typeCategory === 'ExportShipmentType')?.map((i) => {return {item_text:i?.typeName, item_id:i?.systemtypeId}});

    }
    }
    console.log(this.jobShipmentType) 
    this.cdr.detectChanges();
    
  }

  returnString(element) {
    return element?.map((i) =>{ return i?.item_text})?.join(', ');
  }


  getFreightYpe(id) {
    return this.shipmentTypes?.find((i) => i?.systemtypeId == id)?.typeName || null
  }


  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getData();
  }

  openPDF() {
    const prepare = [];
    this.milestoneData.forEach(e => {
      let tempObj = [];

      tempObj.push(e.freightTypeName);
      tempObj.push(e.loadType);
      tempObj.push(e.mileStoneName);
      tempObj.push(e.locationType);
      tempObj.push(e.flowType);
      tempObj.push(e.seq);
      tempObj.push(e.color);
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Freight Type', 'Load Type', 'Milestone Name', 'Location Type', 'Flow Type', 'Sequence', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('Milestone' + '.pdf');
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.milestoneData.map((row: any) => {
      storeEnquiryData.push({
        'Freight Type': row.freightTypeName,
        'Load Type': row.loadType,
        'Milestone Name': row.mileStoneName,
        'Location Type': row.locationType,
        'Flow Type': row.flowType,
        'Sequence': row.seq,
        'color':row?.color,
        'Status': row.status ? "Active" : "Inactive",
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const fileName = 'Milestone.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
}
