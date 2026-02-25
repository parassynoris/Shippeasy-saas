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
import * as XLSX from 'xlsx';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";


@Component({
  selector: 'app-register-user',
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss']
})
export class RegisterUserComponent implements OnInit {
  useUnifiedCounter: boolean = false;
  reminderForm: FormGroup = new FormGroup({
    role: new FormControl('', Validators.required),
    userCount:new FormControl(0,[Validators.required,Validators.min(1)]),
    blFormat: new FormControl(''), 
    useUnifiedCounter: new FormControl(false)
  });
  blFormatList = [
    { label: 'Bill of Lading', value: 'billOfLad' },
    { label: 'HDL Bill of Lading', value: 'hdl_bill_of_lad' }
  ];
  toggleUnifiedCounter() {
    this.useUnifiedCounter = !this.useUnifiedCounter;
    this.reminderForm.get('useUnifiedCounter')?.setValue(this.useUnifiedCounter);
  }
  tabs = smartagent.masterTabs;
  urlParam: any;
  holdControl: any = 'details';
  smartAgentList: any = [];
  submitted: boolean;
  isProductList: boolean = true;
  isTemplateList: boolean = true;
  roleList: any = [];
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


  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#',
    'agentName',
    'primaryNo.primaryNumber', 
    'primaryMailId',
    'primaryNo.addressInfo.countryName',
    'updatedOn',
    'agentStatus',
    'action', 
  ];
  displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);

  masterTabs = [
    {  name: "Register Users", id: "details-tab", control: "details", status: 1, key: "details"},
    { name: "Trials / Requested Users", id: "branch-tab", control: "branch", status: 0, key: "branch" }]
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private profilesService: ProfilesService,
    public commonService: CommonService,
    public commonfunction: CommonFunctions,
    private notification: NzNotificationService,
    private modalService: NgbModal
  ) {
    // this.commonService.storeEditID = this.commonfunction.getUserDetails().orgId;
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
  }


  onTab(data) {
    this.router.navigate(["/register/" + data.key]);
    this.holdControl = data.key;
  }

  ngOnInit(): void {
    this.getRoleList();
    this.getSmartAgentList();
    this.tabs.forEach((item, index) => {
      this.translate.get("smartagent")?.subscribe((data: any) => {
        let langKey = data.smartAgent.tab;
        switch (item.key) {
          case "details":
            item.name = langKey.details;
            break;
          case "branch":
            item.name = langKey.branch;
            break;
          case "prot":
            item.name = langKey.prot;
            break;
          case "bank":
            item.name = langKey.bank;
            break;
          case "contacts":
            item.name = langKey.contacts;
            break;
          case "holiday":
            item.name = langKey.holiday;
            break;
        }
      });
    });
  }


  getSmartAgentList() {

    let payload = this.commonService.filterList()

    if(payload?.size)payload.size =Number(this.size);
    if(payload?.from)payload.from = this.page - 1;
    if(payload?.query)payload.query = { 
      "agentStatus": {
        "$in": [
          "Unregistered", 'registered' 
        ]
      },
      }
      if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('agent',payload).subscribe((data) => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;


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
        "$regex" : this.agentProfileName,
        "$options": "i"
    }
    }
    if (this.phoneNo) {
      mustArray['primaryNo.primaryNumber'] = {
        "$regex" : this.phoneNo,
        "$options": "i"
    }
    }
    if (this.emailAddress) {
      mustArray['primaryMailId'] = {
        "$regex" : this.emailAddress,
        "$options": "i"
    }
    }
    if (this.country) {
      mustArray['addressInfo.countryName'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = this.status
    }
    
  

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.page - 1;
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('agent',payload).subscribe((data) => {
      this.smartAgentList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length
      this.fromSize =1
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    let payload = this.commonService.filterList()

    payload.size =Number(this.size);
    payload.from = this.fromSize - 1;
    payload.query = {
      }
    payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('agent',payload).subscribe(data => {
      this.smartAgentList = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.documents.length : this.count + data.documents.length;
    })
  }

  onOpenNew() {
    // this.commonService.storeEditID = '';
    this.router.navigate(["/register/" + "details" + "/addsmart"]);
  }

  onOpenEdit(agentId) {
    // this.commonService.storeEditID = agentId;
    this.router.navigate([
      "/register/" + agentId + "/" + "details",
    ]);
  }

  onDelete(agentId: any) {
    let deleteBody = "agent"+ agentId
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
      tempObj.push(e.updatedOn);
      tempObj.push(e.status ? "Registered" : "Unregistered");
      prepare.push(tempObj);
    });
  
    // Create a worksheet
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['Agent Profile Name', 'Phone No.', 'Email Address', 'Country','Register Date','Status'],
      ...prepare
    ]);
  
    // Create a workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agent Profiles');
  
    // Save to file
    XLSX.writeFile(workbook, 'Register-Companies-List.xlsx');
  }
  
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};

  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

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
    "project": [ ],
    "query": { ...this.filterKeys,   "agentStatus": {
      "$in": [
        "Unregistered", 'registered' 
      ]
    }, },
    "sort" :{
        "desc" : ["createdOn"]
    },
    size: Number(10000),
    from: this.page - 1,
}
   
    this.commonService.getSTList('agent',parameter).subscribe((data) => {
      this.smartAgentList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.toalLength = data.totalCount;
      this.count = data.documents.length;


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
      this.getSORT()
    });
 
  }
  getSORT(){
    this.dataSource.sort = this.sort1;
    // Define custom sorting function for the column
    this.dataSource.sortingDataAccessor = (item:any, property) => {
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

  getUser(data, Unregistered = true) {
    this.submitted = true;
    this.reminderForm.markAllAsTouched();
    
    if (Unregistered) {
      if (this.reminderForm.get('role').invalid || this.reminderForm.get('userCount').invalid) {
        return;
      }
    }
  
    let registered = data?.agentStatus == 'registered' ? false : true;
    
    if (this.regiserData?.manageUser) {
      registered = true;
      if (this.reminderForm.get('userCount').invalid) {
        return;
      }
    }
  
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = { orgId: data?.agentId };
    
    this.commonService.getSTList('user', payload)?.subscribe(res => {
      if (res?.documents?.length > 0) {
        let payload = res?.documents?.map((x: any) => ({
          ...x,
          roles: this.reminderForm.controls.role.value ? [{
            "roleName": this.roleList?.find((x) => x?.roleId == this.reminderForm.controls.role.value)?.roleName || '',
            "roleId": this.reminderForm.controls.role.value || '',
          }] : x?.roles,
          userStatus: registered,
          // Add these new fields to the user payload
          blFormat: this.reminderForm.controls.blFormat.value || '',
          useUnifiedCounter: this.reminderForm.controls.useUnifiedCounter.value || false
        })) || [];
        
        this.commonService.batchUpdate('user/batchupdate', payload)?.subscribe(result => {
          // Success handling
        }, error => {
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
      }
  
      // Notification array logic remains the same
      let notificationArray: any = [];
      res?.documents?.filter((x: any) => {
        notificationArray.push({
          "createdOn": x?.createdOn,
          "email": x?.userEmail,
          "inappnotificationId": "",
          "notificationName": registered ? "User Registered" : "User Un-Registered",
          "notificationType": "temp",
          "description": registered ? 'Now you have access for SHIPEASY' : 'Your account has Un-Registered',
          "notificationURL": "",
          "read": false,
          "tenantId": x?.tenantId,
          "userId": x?.userId,
          "createdBy": x?.createdBy,
          "orgId": x?.orgId,
          "userLogin": x?.userLogin,
        });
      });
      
      if (notificationArray?.length > 0) {
        this.commonService.batchInsert('inappnotification/batchInsert', notificationArray)?.subscribe();
      }
      
      // Update agent payload with new fields
      let agentPayload = {
        ...data,
        agentStatus: registered ? 'registered' : 'Unregistered',
        blFormat: this.reminderForm.controls.blFormat.value || '',
        useUnifiedCounter: this.reminderForm.controls.useUnifiedCounter.value // This will be true or false
      };
      
      if (registered) {
        agentPayload["userCount"] = this.reminderForm.controls.userCount.value || 0;
      }
      
      this.commonService.UpdateToST(`agent/${data?.agentId}`, agentPayload)?.subscribe(() => {
        this.notification.create(
          'success',
          registered ? 'Registered Successfully...!' : 'Unregistered Successfully...!',
          ''
        );
        
        this.getSmartAgentList();
        this.cancel();
      });
    });
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
  regiserData:any
  async openDialog(reminder?, data?, isManage = false) {
    this.submitted = false;
    this.regiserData = { ...data, "manageUser": isManage };
    
    // Reset form first
    this.reminderForm.patchValue({
      role: '',
      userCount: 0,
      blFormat: '',
      useUnifiedCounter: false
    });
    this.useUnifiedCounter = false;
    
    if (isManage || data?.userCount) {
      let payload = this.commonService.filterList();
      if (payload?.query) payload.query = { orgId: data?.agentId };
      payload['size'] = 1;
      
      const userdata = await this.commonService.getSTList('user', payload)?.toPromise();
      
      if (userdata?.documents?.length) {
        const user = userdata?.documents?.[0];
        const roleId = user?.roles?.find(rl => rl)?.roleId ?? '';
        
        // Patch all form values including blFormat and useUnifiedCounter
        this.reminderForm.patchValue({
          role: roleId,
          userCount: data?.userCount || 0,
          blFormat: user?.blFormat || data?.blFormat || '',
          useUnifiedCounter: user?.useUnifiedCounter ?? data?.useUnifiedCounter ?? false
        });
        
        // Update the component property for the toggle
        this.useUnifiedCounter = user?.useUnifiedCounter ?? data?.useUnifiedCounter ?? false;
      } else {
        // If no user data, patch from agent data
        this.reminderForm.patchValue({
          userCount: data?.userCount || 0,
          blFormat: data?.blFormat || '',
          useUnifiedCounter: data?.useUnifiedCounter ?? false
        });
        this.useUnifiedCounter = data?.useUnifiedCounter ?? false;
      }
    }
    
    this.modalService.open(reminder, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  cancel() {
    this.regiserData = null;
    this.modalService.dismissAll();
    this.useUnifiedCounter = false;
    this.reminderForm.patchValue({
      role: '',
      userCount: 0,
      blFormat: '',
      useUnifiedCounter: false
    });
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
