import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CountryData, LocationData, StateData } from 'src/app/models/city-master';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-city-master',
  templateUrl: './city-master.component.html',
  styleUrls: ['./city-master.component.scss'],
})
export class CityMasterComponent implements OnInit {
  _gc=GlobalConstants;
  addCityForm: FormGroup;
  baseBody: BaseBody = new BaseBody();
  cityData:LocationData[]  = [];
  stateList: StateData[] = [];
  countryList: CountryData[] = [];
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
  selectedCountry: object;
  selectedState: object;
  search_city: string;
  search_state: string;
  search_country: string;
  search_status: string;
  show: string;
  tenantId:number;
  yardcfs:any
  email:any
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns =[
    '#', 
    'action',
    'cityName',
    'stateName',
    'status',
  ];
  constructor(
    private modalService: NgbModal,
    private saMasterService: SaMasterService,
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private profilesService: ProfilesService,
    private commonfunction: CommonFunctions,
    private sortPipelist: MastersSortPipe,
    private sortPipe: OrderByPipe,private cognito : CognitoService,
    private commonService : CommonService,
    public loaderService: LoaderService,
  ) {
    this.addCityForm = this.fb.group({
      stateId: new FormControl('', Validators.required),
      cityName: new FormControl('', Validators.required),
      status: new FormControl(true)
    });
  }
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }
   sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  ngOnInit(): void {
    // this.vvoye();
    this.getData();
    this.getStates();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 

      

  }
  get f() {
    return this.addCityForm.controls;
  }

  vvoye() {
    let payload = this.commonService.filterList()
    let mustArray = {};
    payload.query = mustArray
   payload.from =this.fromSize - 1,
    this.commonService.getSTList('city', payload).subscribe((res:any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          cityName: s.cityName,
          stateName: s.stateName,
          status: s.status
          
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
      this.notification.create('error', error?.error?.error?.message , '');
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'cityName' : row?.element?.cityName,
        'stateName' : row?.element?.stateName,
        'status' : row?.element?.status
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
    this.commonService.getSTList('city', payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1+this.from
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
    this.vvoye();
    this.getData();
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
    let mustArray = {};
    this.search_city = this.search_city?.trim();
    this.search_state = this.search_state?.trim();
    this.search_country = this.search_country?.trim();
    this.search_status = this.search_status?.trim();
    if (this.search_city) {
      mustArray['cityName'] = {
        "$regex" : this.search_city,
        "$options": "i"
    }
    }
    if (this.search_state) {
      mustArray['stateName'] = {
        "$regex" : this.search_state,
        "$options": "i"
    }
    }
    if (this.search_country) {
      mustArray['country.countryName'] = {
        "$regex" : this.search_country,
        "$options": "i"
    }
    }
    if (this.search_status) {
      mustArray['status'] = this.search_status === 'true' ? true : false
    }
 
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  payload.size = Number(this.size)
  //  payload.from = 0,
    this.commonService.getSTList('city', payload).subscribe((res: any) => {
      this.cityData = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          cityName: s.cityName,
          stateName: s.stateName,
          status: s.status
          
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

  getCountryList() {
    let payload = this.commonService.filterList()
    payload.query = { "status": true }
    this.commonService.getSTList('country', payload).subscribe((data) => {
      this.countryList = data.documents;
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
    let mustArray = {};
    this.search_city = this.search_city?.trim();
    this.search_state = this.search_state?.trim();
    this.search_country = this.search_country?.trim();
    this.search_status = this.search_status?.trim();
    if (this.search_city) {
      mustArray['cityName'] = {
        "$regex" : this.search_city,
        "$options": "i"
    }
    }
    if (this.search_state) {
      mustArray['stateName'] = {
        "$regex" : this.search_state,
        "$options": "i"
    }
    }
    if (this.search_country) {
      mustArray['country.countryName'] = {
        "$regex" : this.search_country,
        "$options": "i"
    }
    }
    if (this.search_status) {
      mustArray['status'] = this.search_status === 'true' ? true : false
    }
 
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.query = mustArray
   payload.size = Number(this.size)
   payload.from =this.fromSize - 1,
  
    this.commonService.getSTList('city', payload).subscribe((data) => {
      this.cityData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size))) : this.count - data.documents.length : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
    this.search_city = this.search_city?.trim();
    this.search_state = this.search_state?.trim();
    this.search_country = this.search_country?.trim();
    this.search_status = this.search_status?.trim();
    if (this.search_city) {
      mustArray['cityName'] = {
        "$regex" : this.search_city,
        "$options": "i"
    }
    }
    if (this.search_state) {
      mustArray['stateName'] = {
        "$regex" : this.search_state,
        "$options": "i"
    }
    }
    if (this.search_country) {
      mustArray['country.countryName'] = {
        "$regex" : this.search_country,
        "$options": "i"
    }
    }
    if (this.search_status) {
      mustArray['status'] = this.search_status === 'true' ? true : false
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from =this.page - 1,

    this.commonService.getSTList('city', payload).subscribe((res: any) => {
      this.cityData = res.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1+this.from
        }
      });
      this.toalLength = res.totalCount;
      this.count = res.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.search_city = '';
    this.search_state = '';
    this.search_country = '';
    this.search_status = '';
    this.getData();
  }

  open(content, city?: any,show?) {
    
   
    if (city) {
      this.idToUpdate = city.cityId;
      this.selectedCountry = this.countryList.find(country => country.countryId === city.country.countryId)
      this.addCityForm.patchValue({
        stateId: city.stateId,
        cityName: city.cityName,
        status: city.status
      });
    
    }
    this.show = show
    show === 'show'?this.addCityForm.disable():this.addCityForm.enable()
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });


  }

  getStates() {

    let payload = this.commonService.filterList()
    payload.query = {"status": true }
    this.commonService.getSTList('state', payload).subscribe((data) => {
      this.stateList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1+this.from
        }
      });

    });
  }

  stateSelect(data) {
    this.selectedState = this.stateList.find(
      (state) => state.stateId === data.target.value
    );
  }

  onSave() {
    this.modalService.dismissAll();
    this.submitted = false;
    this.idToUpdate = null;
    this.addCityForm.reset();
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
            let data =  'city' + id.cityId

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

  cityMasters() {
    this.submitted = true;
    if (this.addCityForm.invalid) {
      return;
    }
    const dataupdate = this.addCityForm.value
    dataupdate.stateName = this.stateList.filter((x)=> x?.stateId== this.addCityForm.value.stateId)[0]?.typeDescription || 'MH'
    dataupdate.tenantId= this.tenantId,
    dataupdate.status = true

    if (!this.idToUpdate) {
      dataupdate.cityId = this.idToUpdate
      this.commonService.addToST('city',dataupdate).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
          this.onSave();
        }
      );
    } else {
      let newCountry = { ...dataupdate, cityId: this.idToUpdate };
      this.commonService.UpdateToST(`city/${newCountry.cityId}`,newCountry).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              this.onSave();
              this.getData();
            }, 1000);
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }

  changeStatus(data) {
    this.commonService.UpdateToST(`city/${data.cityId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
            this.onSave();
            this.getData();
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
    this.cityData.map((row: any) => {
      storeEnquiryData.push({
        'City': row.cityName,
        'State': row.stateName,
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

    const fileName = 'city-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.cityData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.cityName);
      tempObj.push(e.stateName);
      tempObj.push(e.status ? "Active" : "Inactive");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['City','State','Status']],
        body: prepare,
        didDrawCell: (data) => {
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
         }
    });
    doc.save('city-master' + '.pdf');
  }
}
