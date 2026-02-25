import {
  Component,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { CommonFunctions } from '../../functions/common.function';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  _gc=GlobalConstants;
  userData: any = [];
  show = false;
  isShow: any;
  UserIdToUpdate: string;
  closeResult: string;
  @Input() userForm;
  getUser: string;
  toalLength: any;
  size = 1000;
  page = 1;
  count = 0;
  userFirstName:string;
  userLastName: string;
  userName: string;
  userEmail:string;
  userRole: any;
  userPhoneNo: string;
  userLocation: any;
  currentUser:any;
  fromSize: number = 1;
  toSize: number = this.size;
  parentID: any = null;

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
   'name',
  //  'userLastname',
   'userName',
   'userEmail',
   'roles',
   'phoneNo',
   'officeLocation', 
    'action', 
  ];
  constructor(
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonService : CommonService,
    private activateRoute: ActivatedRoute,
    private commonfunction:CommonFunctions,
    public loaderService: LoaderService,
  ) {
    this.modalService = modalService;
    this.notification = notification;
    this.commonService = commonService;
    this.activateRoute = activateRoute;
    this.commonfunction = commonfunction
    this.activateRoute.params?.subscribe((params) => {
      this.parentID = params.id;
    });
    this.currentUser = this.commonfunction.getActiveAgent()
  }

  onShowPermission(id) {
    this.isShow = id;
  }

  ngOnInit(): void {
      this.getUserList();    
  }
  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getUserList();
  }

  getUserList() {
    this.loaderService.showcircle();
    this.page = 1;
    let payload = this.commonService.filterList()
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
      if(payload?.sort)payload.sort = {
        "desc" : ["updatedOn"]
     }
    //  if(payload?.size)payload.size = Number(this.size)
    //  if(payload?.from)payload.from = this.page -1;
     if(this.parentID != null){
      payload.query['agentId'] = this.parentID
     }
      this.commonService.getSTList(Constant.GET_USER, payload)
      ?.subscribe((data) => {
        this.userData = data.documents;

        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any,index,number) => {
            return{
              ...s,
              id:index+1+this.from,
              
            }
          })
        );
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.loaderService.hidecircle();
      },()=>{
        this.loaderService.hidecircle();
      });
  }

  open(content, user?: any,show?) {
    if (this.currentUser && !user) {
      if (this.userData.length >= this.currentUser.userCount ) {
        this.notification.create('error', 'You’ve reached your usage limit. Contact the administrator for assistance', '');
        return;
      }
    }
    this.show = show
    this.getUser = user;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }


  DeleteUser(deleteuser, user) {
    this.modalService
      .open(deleteuser, {
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
            let deleteBody = 'user' + user?.userId 
            this.commonService
              .deleteST(deleteBody)
              ?.subscribe((data) => {
                if (data) {
                  this.notification.create(
                    'success',
                    'Deleted Successfully',
                    ''
                  );
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

  ngOnUserActiveInActive(event, user?: any) {
    let updateUser = [
    
    ];
    user.userStatus = event;
    user.updatedDate = new Date();
    updateUser.push(user);
   
    this.commonService.UpdateToST(`user/${updateUser[0].userId}`, updateUser[0])?.subscribe(() => {
      this.getUserList();
    });
  }

  clear() {
    this.userFirstName = '';
    this.userLastName = '';
    this.userName = '';
    this.userEmail = '';
    this.userRole = '';
    this.userLocation = '';
    this.userPhoneNo = '';
    this.getUserList();
  }
  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getUserList();
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }
  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev');
    }
  }
  search() {
    let mustArray = {};
    if (this.userFirstName) {
      mustArray['name'] = {
        "$regex" : this.userFirstName,
        "$options": "i"
    }
    }
    if (this.userLastName) {
      mustArray['userLastname'] = {
        "$regex" : this.userLastName,
        "$options": "i"
    }
    }
    if (this.userName) {
      mustArray['userName'] = {
        "$regex" : this.userName,
        "$options": "i"
    }
    }
    if (this.userEmail) {
      mustArray['userEmail'] = {
        "$regex" : this.userEmail,
        "$options": "i"
    }
    }
    if (this.userRole) {
      mustArray['userType'] = {
        "$regex" : this.userRole,
        "$options": "i"
    }
    }
    if (this.userLocation) {
      mustArray['officeLocation'] = {
        "$regex" : this.userLocation,
        "$options": "i"
    }
    }
    if (this.userPhoneNo) {
      mustArray['phoneNo'] = {
        "$regex" : this.userPhoneNo,
        "$options": "i"
    }
    }
   
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   if(payload?.size)payload.size = Number(this.size)
   payload.from = 0;
   if(this.parentID != null){
    payload.query['agentId'] = this.parentID
   }
    this.commonService.getSTList(Constant.GET_USER, payload)
      ?.subscribe((data) => {
        this.userData = data.documents?.map((s: any,index) => {
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

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.query = {}
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     if(payload?.size)payload.size = Number(this.size)
     payload.from = 0;
     if(this.parentID != null){
      payload.query['agentId'] = this.parentID
     }
      this.commonService.getSTList(Constant.GET_USER, payload)
      ?.subscribe((data) => {
        this.userData = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count =
          type === 'prev'
            ? this.toalLength === this.count
              ? this.count - (this.toalLength % Number(this.size))
              : this.count - data.documents.length
            : this.count + data.documents.length;
      });
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.userData.map((row: any) => {
      storeEnquiryData.push({
        'First Name': row.name,
        'Last Name': row.userLastname,
        'User Name': row.userName,
        'Email': row.userEmail,
        'Role': row.roles?.[0]?.roleName,
        'Phone No.': row.phoneNo,
        'Office Location': row.officeLocation,
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };

    const fileName = 'user.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    var prepare=[];
    this.userData.forEach(e=>{
      var tempObj =[];
      tempObj.push(e.name);
      tempObj.push(e.userLastname);
      tempObj.push(e.userName);
      tempObj.push(e.userEmail);
      tempObj.push(e.roles?.[0]?.roleName);
      tempObj.push(e.phoneNo);
      tempObj.push(e.officeLocation);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [397, 310]);
    autoTable(doc,{
        head: [['First Name','Last Name','User Name','Email','Role','Phone No.','Office Location']],
        body: prepare
    });
    doc.save('user' + '.pdf');
  }

  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = [ 'action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'USER',
      this.displayedColumns,
      actualColumns
    );
  }

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each)
      this.filterKeys[this.displayedColumns[ind] ] =  {
        "$regex" : each.toLowerCase(),
        "$options": "i"
    } 
  });

  if(this.parentID != null){
    this.filterKeys['agentId'] = this.parentID
   }
  let payload = this.commonService.filterList()
  payload.query = {...this.filterKeys }
  payload.sort = {
    "desc" : ["updatedOn"]
 }
 if(payload?.size)payload.size = Number(this.size)
 payload.from = this.page -1;

  this.commonService.getSTList(Constant.GET_USER, payload)
  ?.subscribe((data) => {
    this.userData = data.documents; 
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
  displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getUserList( );
  }
  toSentenceCase(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
