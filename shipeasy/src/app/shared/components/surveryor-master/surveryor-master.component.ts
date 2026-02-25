import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { CommonFunctions } from '../../functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersSortPipe } from '../../util/mastersort';
import * as XLSX from "xlsx";
import autoTable from 'jspdf-autotable'
import jsPDF from 'jspdf';

@Component({
  selector: 'app-surveryor-master',
  templateUrl: './surveryor-master.component.html',
  styleUrls: ['./surveryor-master.component.scss']
})
export class SurveryorMasterComponent implements OnInit {

  _gc=GlobalConstants;
  addStateForm: FormGroup;
  idToUpdate: string;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  country: string;
  iso_country: string;
  region: string;
  status: string;
  search_state: string;
  search_country: string;
  search_status: string;
  show: string;
  tenantId: string;
  yardcfs:any
  email:any
  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['#','action','stateCode','typeDescription','countryName','GSTNCode','status'];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  surveyorData: any;

  constructor(
    public modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private cognito : CognitoService,
    public commonService : CommonService,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) {
    this.addStateForm = this.fb.group({
      stateCode: new FormControl('', Validators.required),
      typeDescription: new FormControl('', Validators.required),
      stateShortName: new FormControl(''),
      GSTNCode: new FormControl(''),
      countryCode: new FormControl('', Validators.required),
      isUnion: new FormControl(true),
      status: new FormControl(true)
    });
  }

  ngOnInit(): void {
    this.getData();
    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }

  vprouduct() {
    let payload = this.commonService?.filterList();
    this.commonService.getSTList('state', payload).subscribe((res:any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          typeDescription: s.typeDescription,
          countryName: s.countryName,
          status:s.status
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'typeDescription' : row?.element?.typeDescription,
        'countryName' : row?.element?.countryName,
        'status':row?.element?.status
      });
    }
    );
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
  
    const fileName = '.xlsx';
    XLSX.writeFile(myworkbook, fileName);
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
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
    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
            return{
              ...s,
              id:index+1
            }
          })
        );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });


  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getData() ;
  }
  get f() {
    return this.addStateForm.controls;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
   pageNumber = 1;
   pageSize = 10;
   from = 0;
   totalCount = 0;
 
   onPageChange(event){
     this.pageNumber = event.pageIndex + 1;
     this.pageSize = event.pageSize;
     this.from = event.pageIndex*event.pageSize ;
     this.getData();
   }
  getData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.size= this.pageSize,
    payload.from=this.from
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   
   let mustArray = {};
   this.search_state =  this.search_state?.trim();
   this.search_country =  this.search_country?.trim();
   this.search_status = this.search_status?.trim();
     if (this.search_state) {
       mustArray['typeDescription'] = {
         "$regex" : this.search_state,
         "$options": "i"
     }
   }
 
     if (this.search_country) {
       mustArray['countryName'] = {
         "$regex" : this.search_country,
         "$options": "i"
     }
     }
     if (this.search_status) {
      mustArray['status'] = this.search_status=== 'true' ? true : false
    }

     payload.query = mustArray
  //  payload.size = Number(this.size);
  //  payload.from = 0,
    this.commonService.getSTList('state', payload).subscribe((res: any) => {
      this.surveyorData = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          typeDescription: s.typeDescription,
          countryName: s.countryName,
          status:s.status
          
        }));
        // this.dataSource.paginator = this.paginator;
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
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize - 1;
   let mustArray = {};
   this.search_state =  this.search_state?.trim();
   this.search_country =  this.search_country?.trim();
   this.search_status = this.search_status?.trim();
     if (this.search_state) {
       mustArray['typeDescription'] = {
         "$regex" : this.search_state,
         "$options": "i"
     }
   }
 
     if (this.search_country) {
       mustArray['countryName'] = {
         "$regex" : this.search_country,
         "$options": "i"
     }
     }
     if (this.search_status) {
      mustArray['status'] = this.search_status=== 'true' ? true : false
    }

     payload.query = mustArray
   
    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.surveyorData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};

   // Trim beginning spaces from search parameters
  this.search_state =  this.search_state?.trim();
  this.search_country =  this.search_country?.trim();
  this.search_status = this.search_status?.trim();
    if (this.search_state) {
      mustArray['typeDescription'] = {
        "$regex" : this.search_state,
        "$options": "i"
    }
  }

    if (this.search_country) {
      mustArray['countryName'] = {
        "$regex" : this.search_country,
        "$options": "i"
    }
    }
    if (this.search_status) {
      mustArray['status'] = this.search_status=== 'true' ? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('state', payload).subscribe((res: any) => {
      this.surveyorData = res.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.search_state = '';
    this.search_country = '';
    this.search_status = '';
    this.getData();
  }

  onSave() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.idToUpdate = null;
    this.addStateForm.reset();
    this.submitted = false;
    return null;
  }

  delete(deletestate, id) {
    this.modalService
      .open(deletestate, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data =  'state'+ id.stateId
            const body = [data];

            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
              }
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  open(content, state?: any, show?: string) {
    this.show = show;
  
    // Reset the form when opening for a new entry
    this.addStateForm.reset();
  
    if (state) {
      // Edit mode: populate the form with existing state data
      this.idToUpdate = state.stateId;
      this.addStateForm.patchValue({
        stateCode: state.stateCode,
        typeDescription: state.typeDescription,
        stateShortName: state.stateShortName,
        GSTNCode: state.GSTNCode,
        countryCode: state.countryId,
        isUnion: state.isUnion,
        status: state.status
      });
  
      // Enable or disable the form based on show parameter
      if (show === 'show') {
        this.addStateForm.disable();
      } else {
        this.addStateForm.enable();
      }
    } else {
      // New entry (add mode): ensure the form is enabled
      this.addStateForm.enable();
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

  stateMasters() {
    this.submitted = true;
    if (this.addStateForm.invalid) {
      return;
    }
    const dataupdate = this.addStateForm.value;
    dataupdate.tenantId =  this.tenantId,
    dataupdate.status = true
    dataupdate.stateId = this.idToUpdate
    dataupdate.countryId= this.addStateForm.get('countryCode').value
 
    if (!this.idToUpdate) {
      const data = {
        ...dataupdate,
        stateName: this.addStateForm.get('typeDescription').value,
       };

      this.commonService.addToST('state',data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.search();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
         this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      this.commonService.UpdateToST(`state/${dataupdate.stateId}`,dataupdate).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            var myInterval = setInterval(() => {
              this.search();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
         this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }

  changeStatus(data, i) {
    this.commonService.UpdateToST(`state/${data.stateId}`,{ ...data, status: !data?.status },
      )
      .subscribe(
        (res: any) => {
          if (res) {
            this.surveyorData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.onSave();
            var myInterval = setInterval(() => {
              this.search();
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

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.surveyorData.map((row: any) => {
      storeEnquiryData.push({
        'State': row.typeDescription,
        'Country Name': row.countryName,
        'GSTNCode':row.GSTNCode,
        'State Code':row.stateCode,
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

    const fileName = 'surveyor-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.surveyorData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.typeDescription);
      tempObj.push(e.GSTNCode);
      tempObj.push(e.stateCode);
      tempObj.push(e.countryName);
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['State','GSTNCode','stateCode','Country Name','Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('state-master' + '.pdf');
  }
}
