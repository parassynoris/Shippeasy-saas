import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ProfilesService } from "src/app/services/Profiles/profile.service";
import { CommonFunctions } from "src/app/shared/functions/common.function";

import { NzNotificationService } from 'ng-zorro-antd/notification';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from "src/app/services/common/common.service";
import { MatTableDataSource } from "@angular/material/table";
import { MatDrawer } from "@angular/material/sidenav";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { smartagent } from "../../data";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import * as XLSX from 'xlsx';
import { currentTime } from "src/app/shared/util/date-time";


@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent implements OnInit {
  reminderForm: FormGroup = new FormGroup({
    role: new FormControl('', Validators.required),
    userCount:new FormControl(0,[Validators.required,Validators.min(1)]),
    tillDate: new FormControl('', Validators.required),
    orgType:new FormControl('',Validators.required)

  });
  tabs = smartagent.masterTabs;
  urlParam: any;
  holdControl: any = 'details';
  smartAgentList: any = [];

  isProductList: boolean = true;
  isTemplateList: boolean = true;

  fromSize: number = 1;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  agentProfileName: any;
  phoneNo: any;
  emailAddress: any;
  country: any;
  status: any;

  todayDate = new Date()
  tomorrow = new Date()
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns = [
    '#',
    'agentName',
    'primaryNo.primaryNumber',
    'primaryMailId',
    'primaryNo.addressInfo.countryName',
    'createdOn',
    'trialValidTill',
    'agentStatus',
    'action',
  ];
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);

  masterTabs = [
    { name: "Register Users", id: "details-tab", control: "details", status: 1, key: "details" },
    { name: "Trials / Requested Users", id: "branch-tab", control: "branch", status: 0, key: "branch" }]
  roleList: any = [];
  submitted: boolean;
  orgTypeList:any=[{Name:'WareHouse',value:'warehouse'},{Name:'Freigth Forwarders',value:'freigthForwarders'},{Name:'CHA',value:'cha'},{Name:'Transport',value:'transport'},{Name:'All',value:'all'}]
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private profilesService: ProfilesService,
    public commonService: CommonService,
    public commonfunction: CommonFunctions,
    private notification: NzNotificationService,
    private modalService: NgbModal,
  ) {

    this.tomorrow = new Date(this.todayDate);
    this.tomorrow.setDate(this.todayDate.getDate() + 1);
    // this.commonService.storeEditID = this.commonfunction.getUserDetails().orgId;
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  }


  onTab(data) {
    this.router.navigate(["/register/" + data.key]);
    this.holdControl = data.key;
  }
  getRoleList() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { "status": true, orgId: this.commonfunction.getAgentDetails().orgId }
    this.commonService.getSTList('role', payload)?.subscribe(data => {
      this.roleList = [];
      data.documents?.forEach((element) => {
        if (element?.roleName?.toLowerCase() != 'superadmin') {
          this.roleList.push({
            roleName: element?.roleName,
            roleId: element?.roleId,
          });
        }

      });
    })

  }
  get f() {
    return this.reminderForm.controls;
  }
  ngOnInit(): void {
    this.getRoleList()
    this.getSmartAgentList();

  }

  getSmartAgentList() {

    let payload = this.commonService.filterList()

    if (payload?.size) payload.size = Number(this.size);
    if (payload?.from) payload.from = this.page - 1;
    if (payload?.query) payload.query = {
      "agentStatus": {
        "$in": [
          "requested", 'trial', 'expired'
        ]
      },
    }
    if (payload?.sort) payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('agent', payload).subscribe((data) => {
        this.smartAgentList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;


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

  clear() {
    this.agentProfileName = ''
    this.phoneNo = ''
    this.emailAddress = ''
    this.country = '';
    this.status = '';
    this.getSmartAgentList()
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getSmartAgentList()
  }

  search() {
    let mustArray = {};
    if (this.agentProfileName) {
      mustArray['agentName'] = {
        "$regex": this.agentProfileName,
        "$options": "i"
      }
    }
    if (this.phoneNo) {
      mustArray['primaryNo.primaryNumber'] = {
        "$regex": this.phoneNo,
        "$options": "i"
      }
    }
    if (this.emailAddress) {
      mustArray['primaryMailId'] = {
        "$regex": this.emailAddress,
        "$options": "i"
      }
    }
    if (this.country) {
      mustArray['addressInfo.countryName'] = {
        "$regex": this.country,
        "$options": "i"
      }
    }
    if (this.status) {
      mustArray['status'] = this.status
    }



    let payload = this.commonService.filterList()

    payload.size = Number(this.size);
    payload.from = this.page - 1;
    payload.query = mustArray
    payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('agent', payload).subscribe((data) => {
        this.smartAgentList = data.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          }
        });
        this.toalLength = data.totalCount;
        this.count = data.documents.length
        this.fromSize = 1
      })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()

    payload.size = Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
    }
    payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('agent', payload).subscribe(data => {
        this.smartAgentList = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length;
      })
  }

  onOpenNew() {
    // this.commonService.storeEditID = '';
    this.router.navigate(["/register/list/" + "details" + "/addsmart"]);
  }

  onOpenEdit(agentId) {
    // this.commonService.storeEditID = agentId;
    this.router.navigate([
      "/register/list/" + agentId + "/" + "details" + "/editsmart",
    ]);
  }

  onDelete(agentId: any) {
    let deleteBody = "agent" + agentId
    this.commonService.deleteST(deleteBody).subscribe((data: any) => {
      if (data) {
        this.getSmartAgentList();
      }
    });
  }
  printData() {
    var prepare = [];
    this.smartAgentList.forEach(e => {
      var tempObj = [];

      tempObj.push(e.agentName);
      tempObj.push(e.primaryNo?.primaryNumber);
      tempObj.push(e.primaryMailId);
      tempObj.push(e.addressInfo?.countryName);
      tempObj.push(e.status ? "Active" : "In Active");
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [497, 410]);
    autoTable(doc, {
      head: [['Agent Profile Name', 'Phone No.', 'Email Address', 'Country', 'Status']],
      body: prepare
    });
    doc.save('Company-Profile' + '.pdf');
  }
  changeStatus(data) {
    this.commonService.UpdateToST(`agent/${data.agentId}`, { ...data, status: !data?.status }).subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Status Updated Successfully',
          ''
        );
        this.search();
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
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
    const prepare = [];
    this.smartAgentList.forEach(e => {
      const tempObj = [];

      tempObj.push(e.agentName);
      tempObj.push(e.primaryNo?.primaryNumber);
      tempObj.push(e.primaryMailId);
      tempObj.push(e.addressInfo?.countryName);
      tempObj.push(e.createdOn);
      tempObj.push(e.trialValidTill);
      tempObj.push(e.agentStatus);
      prepare.push(tempObj);
    });

    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Agent Profile Name', 'Phone No.', 'Email Address', 'Country', 'Requested Date', 'Trial Valid Date', 'Status'],
      ...prepare
    ]);

    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agent Profiles');

    // Save to file
    XLSX.writeFile(workbook, 'Requested-Companies-List.xlsx');
  }

  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each) {

        if (this.displayedColumns[ind] == 'createdOn') {
          this.filterKeys['createdOn'] = {
            "$gt": each.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": each.substring(0, 10) + 'T23:59:00.000Z'
          };
        } else {
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          }
        }
      }
    });


    this.page = 1;
    this.fromSize = 1;
    var parameter = {
      "project": [],
      "query": {
        ...this.filterKeys, "agentStatus": {
          "$in": [
            "requested", 'trial'
          ]
        },
      },
      "sort": {
        "desc": ["createdOn"]
      },
      size: Number(10000),
      from: this.page - 1,
    }

    this.commonService.getSTList('agent', parameter).subscribe((data) => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;


      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any, index) => {
          return {
            ...s,
            id: index + 1
          }
        })
      )
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.getSORT()
    });

  }
  getSORT() {
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item: any, property) => {
      switch (property) {

        case 'agentName': return item?.enquiryDetails?.enquiryNo || '';
        case 'primaryNo.primaryNumber': return item?.primaryNo.primaryNumber || '';
        case 'primaryMailId': return item?.primaryNo.primaryMailId || '';
        case 'primaryNo.addressInfo.countryName': return item?.primaryNo.addressInfo.countryName || '';


        default: return item[property];
      }
    };
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getSmartAgentList();
  }
  editAgent: any;
  showRegestor: boolean = false
  openDialog(reminder?, data?, flag?) {
    this.showRegestor = flag
    this.editAgent = data;
    this.submitted =  false;
    this.modalService.open(reminder, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  cancel() {
    this.modalService.dismissAll();
    this.reminderForm.patchValue({
      role: '',
      userCount: 0,
      tillDate: '',
      orgType:''
    });
  }
  sendUser(flag, data?) {
    this.submitted = true;
    this.reminderForm.markAllAsTouched();
    if (data) {
      this.editAgent = data
    };
    if (this.showRegestor) {
      flag = false
        if (this.reminderForm.get('role')?.invalid) {
          this.notification.create('error', 'Please fill form', '');
          return false;
        }
      if(this.reminderForm.get('userCount').invalid){
        return false
      }   
      if(this.reminderForm.get('orgType').invalid){
        this.notification.create('error', 'Please select Orgenization Type', '');
        return false
      } 
    } else {
      if (flag) {
        if (this.reminderForm.get('role').invalid || this.reminderForm.get('tillDate').invalid) {
          this.notification.create(
            'error',
            'Please fill form',
            ''
          );
          return false
        }
        // if (this.reminderForm.invalid) {
        //   this.notification.create(
        //     'error',
        //     'Please fill form',
        //     ''
        //   );
        //   return false
        // }
      }
    }



    let payload = {
      "isTrial": flag,
      "trialValidTill": currentTime(this.reminderForm.controls.tillDate.value) || '',
      "tenantId": '1',
      "orgId": this.editAgent?.agentId,
      "agentId": this.editAgent?.agentId,
      "name": this.editAgent?.firstName,
      "userName": `${this.editAgent?.firstName}${this.editAgent?.lastName}`,
      "userLastname": this.editAgent?.lastName,
      "shortName": '',
      "officeLocation": '',
      "userEmail": this.editAgent?.primaryMailId,
      "phoneNo": this.editAgent?.primaryNo?.primaryNumber,
      "userLogin": `${this.editAgent?.firstName?.toLowerCase()}${this.editAgent?.lastName?.toLowerCase()}`,
      "agent": this.editAgent?.agentId || '',

      "agentBranch": '',
      "agentBranchName": '',
      "superUser": false,

      "roles": [{
        "roleName": this.roleList?.filter((x) => x?.roleId == this.reminderForm.controls.role.value)[0]?.roleName || '',
        "roleId": this.reminderForm.controls.role.value || '',
      }],
      "userStatus": true,
      "userType": "internal",
      "userloginType":this.reminderForm.controls.orgType.value ||'',
      "status": true,
      // isEmail:  true,  
      "userId": "",
      "createdDate": new Date(),
      "updatedDate": new Date()
    };

    this.commonService.addToST(`user`, payload)?.subscribe(res => {
      if (res) {
        if (flag) {
          this.notification.create(
            'success',
            'User Created Successfully...!',
            ''
          );
          setTimeout(() => {
            this.getSmartAgentList()
          }, 5000);

        } else {
          this.notification.create(
            'success',
            'User Created & Registered Successfully...!',
            ''
          ); setTimeout(() => {
            this.getSmartAgentList()
          }, 5000);
        }

       let notificationArray = {
          "createdOn": res?.createdOn,
          "email": res?.userEmail,
          "inappnotificationId": "",
          "notificationName": "Welcome to SHIPEASY",
          "notificationType": "temp",
          "description": "",
          "notificationURL": "",
          "read": false,
          "tenantId": res?.tenantId,
          "userId": res?.userId,
          "createdBy": res?.createdBy,
          "orgId": res?.orgId,
          "userLogin": res?.userLogin,
        }

        if (flag) {
          this.commonService.addToST('inappnotification', notificationArray)?.subscribe()
        }

        let agetPayload = {
          ...this.editAgent,
          agentStatus: flag ? 'trial' : 'registered',
          userId: res?.userId || '',
          "isTrial": flag,
          "trialValidTill": currentTime(this.reminderForm.controls.tillDate.value) || '',
          "userCount":this.reminderForm.controls.userCount.value ||'',
          "orgType":this.reminderForm.controls.orgType.value ||'',
          orgId: this.editAgent?.agentId
        }
        this.commonService.UpdateToST(`agent/${agetPayload?.agentId}`, agetPayload)?.subscribe()
        this.cancel();
        setTimeout(() => {
          this.getSmartAgentList()
        }, 5000);
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  getUser(data, flag) {
    this.submitted = true;
    this.reminderForm.markAllAsTouched();
    if (flag) {
      if (this.reminderForm.get('role').invalid || this.reminderForm.get('tillDate').invalid) {
        this.notification.create(
          'error',
          'Please fill form',
          ''
        );
        return false
      }
    } else {
      if(!this.reminderForm.value.role){
        this.notification.create(
          'error',
          'Please select Role',
          ''
        );
        return false
      }
      if(this.reminderForm.get('userCount').invalid){
        return false
      }
      if(this.reminderForm.get('orgType').invalid){
        this.notification.create('error', 'Please select Orgenization Type', '');
        return false
      }
    }

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { orgId: data?.agentId }
    this.commonService.getSTList('user', payload)?.subscribe(res => {

      if (res?.documents?.length > 0) {
        let payload = res?.documents?.map((x: any) => ({
          ...x,
          "roles": [{
            "roleName": this.roleList?.filter((x) => x?.roleId == this.reminderForm.controls.role.value)[0]?.roleName || '',
            "roleId": this.reminderForm.controls.role.value || '',
          }],
          isTrial: flag,
          trialValidTill: flag ? currentTime(this.reminderForm.controls.tillDate.value) || '' : '',
          isTrialExtend: flag,
          agentStatusExpired: flag ? false : null
        })) || [];

        let notificationArray: any = [];
        res?.documents?.filter((x: any) => {
          notificationArray.push({
            "createdOn": x?.createdOn,
            "email": x?.userEmail,
            "inappnotificationId": "",
            "notificationName": flag ? "Welcome back to SHIPEASY" : "User Registered",
            "notificationType": "temp",
            "description": flag ? `Your trial extended till ${currentTime(this.reminderForm.controls.tillDate.value)}` : 'Now you have access for SHIPEASY',
            "notificationURL": "",
            "read": false,
            "tenantId": x?.tenantId,
            "userId": x?.userId,
            "createdBy": x?.createdBy,
            "orgId": x?.orgId,
            "userLogin": x?.userLogin,
          })
        })
       if(notificationArray?.length > 0){ 
        this.commonService.batchInsert('inappnotification/batchInsert', notificationArray)?.subscribe() 
       }
        this.commonService.batchUpdate('user/batchupdate', payload)?.subscribe(result => {


        }, error => {
          this.notification.create(
            'error',
           error?.error?.error?.message,
            ''
          )
        });
      }
      const payloadAgent={
        ...data,
         agentStatus: flag ? 'trial' : 'registered',
        "isTrial": flag,
        "trialValidTill": flag ? currentTime(this.reminderForm.controls.tillDate.value) || '' : '',
      }
      if(!flag){
        payloadAgent["userCount"]=this.reminderForm.controls.userCount.value ||'';
        payloadAgent["orgType"]=this.reminderForm.controls.orgType.value ||'';
      }
      this.commonService.UpdateToST(`agent/${data?.agentId}`, payloadAgent)?.subscribe(() => {
        this.notification.create(
          'success',
          flag ? 'Exteneded validity..!' : 'Registered Successfully...!',
          ''
        );
        this.cancel();
        setTimeout(() => {
          this.getSmartAgentList()
        }, 5000);
      })
    })
  }
  increase() {
    let value = this.reminderForm.get('userCount')?.value || 0;
    this.reminderForm.get('userCount')?.setValue(value + 1);
  }
  
  decrease() {
    let value = this.reminderForm.get('userCount')?.value || 0;
    if (value) {
      value = value - 1;
    }
    this.reminderForm.get('userCount')?.setValue(value);
  }
  
  onInputChange(event: any) {
    const input = event.target.value;
    if (input === '') {
      this.reminderForm.get('userCount')?.setValue('');
      return;
    }
  
    if (/^\d+$/.test(input)) {
      this.reminderForm.get('userCount')?.setValue(parseInt(input, 10));
    } else {
      event.target.value = this.reminderForm.get('userCount')?.value;
    }
  }
}
