import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { environment } from 'src/environments/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Branch } from 'src/app/models/yard-cfs-master';
import { SystemType } from 'src/app/models/cost-items';
import { Roles } from 'src/app/models/user-master';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-adduser',
  templateUrl: './adduser.component.html',
  styleUrls: ['./adduser.component.scss']
})

export class AdduserComponent implements OnInit {
  @Output() userForm: FormGroup;
  userConfirmForm: FormGroup;
  UserIdToUpdate: string = '';

  @Input() user: any;
  @Input() isType: any;
  @Output() setRefreshUserList = new EventEmitter<void>()
  submitted: boolean = false;
  submittedForConfirm: boolean = false;
  roleUserListData: Roles[] = [];
  roleList: any = [];
  showUserRoleMultiSelect: boolean = false;
  selectedRoles = [];
  IsSendCode: boolean = false;
  userData: any;
  departmentData:  SystemType[]= []
  agentId:string;
  tenantId:string;
  activeAgent: any;
  constructor(private fb: FormBuilder, private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonFunctions: CommonFunctions,
    private route: ActivatedRoute,private cognito : CognitoService,
    private commonService : CommonService,private commonFunction : CommonFunctions) {
   this.fb = fb;
   this.modalService = modalService;
   this.notification = notification;
   this.route = route;
   this.commonService = commonService;
   this.cognito = cognito
   this.agentId  = this.route.snapshot?.params['id'];
   this.getActiveAgent()
    this.getDepartmentList()
    this.getBranchDetails()
   
  }
  userloginType : any = null;
  userloginTypes : any = null;
  getActiveAgent(){
    let agentPayload = this.commonService.filterList()
    if(agentPayload?.query)agentPayload.query = {
      "agentId":  this.route.snapshot?.params['id']
    }
    this.commonService.getSTList("agent", agentPayload)?.subscribe((res)=>{ 
      this.activeAgent = res?.documents[0]
      this.userloginTypes = res?.documents[0]?.userloginType
      console.log(this.userloginType,"user");
    })
  }
  userList: any = [];
  getuserAgent() {
    let agentPayload = this.commonService.filterList()
    this.commonService.getSTList("user", agentPayload)?.subscribe((res) => {
      this.userList = res?.documents
    })
  }
  ngOnInit(): void {
    this.userloginType = localStorage.getItem('userloginType') || ''
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      shortName: [''],
      email: ['', [Validators.required, Validators.pattern(environment.validate.email)]],
      password: ['' ],
      phoneNo: ['', [Validators.required, Validators.pattern(environment.validate.phone), Validators.maxLength(10)]],
      branch: ['' ],
      userRole: [0, [Validators.required]],
      userName: ['', Validators.required],
      department: ['', Validators.required],
      agent: ['' ],
      principle: ['SHIPEASY Tank Container'],
      defaultPrinciple: [''],
      agentBranch: ['',Validators.required],
      defaultModule:[''],
      status: [false],
      superUser: [false],
      jmbFAS: [true],
      exportBackDate: [false],
      importBackDate: [false],
      agencyInvoice: [false],
      exRateEditable: [false],
      isMobile : [false],
      isEmail: [false],
      isPassword :  [false]
    });
    // this.activeAgent =  this.commonFunction.getActiveAgent()
 
    this.userConfirmForm = this.fb.group({
      verificationCode: ['', Validators.required]
    });
    this.isType === 'show' ? this.userForm.disable() : this.userForm.enable();
    if (this.user) {
      this.userForm.controls['userName'].disable();
      this.UserIdToUpdate = this.user?.userId || '';
      this.userForm.patchValue({
        status: this.user?.userStatus,
        userName: this.user?.userName,
        firstName: this.user?.name,
        shortName: this.user?.shortName,
        lastName: this.user?.userLastname,
        email: this.user?.userEmail,
        password: this.user?.password || '',
        phoneNo: this.user?.phoneNo,
        branch: this.user?.officeLocation,
        userRole: this.user?.roles ? this.user?.roles[0].roleId : 0,
        department: this.user?.department?.[0]?.['item_id'],
        agent: this.user?.agent,
        agentBranch: this.user?.agentBranch,
        defaultModule: this.user?.defaultModule,
        principle: this.user?.principle,
        defaultPrinciple: this.user?.defaultPrinciple,
        superUser: this.user?.superUser,
        jmbFAS: this.user?.jmbFAS,
        exportBackDate: this.user?.exportBackDate,
        importBackDate: this.user?.importBackDate,
        agencyInvoice: this.user?.agencyInvoice,
        exRateEditable: this.user?.exRateEditable,
      })
    }
    this.getRoleList();
    this.getuserAgent();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  branchData:Branch[]=[]
  getBranchDetails(){
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {'parentId': this.agentId}
    this.commonService.getSTList('branch', payload)?.subscribe((data) => {
      this.branchData = data.documents;
       
    });
  }
  getSystemData() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {"status": true ,"typeCategory": "department"}
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.departmentData = res.documents
    })

  }
  getDepartmentList() {
    let payload = this.commonService.filterList() 
    if(payload?.query)payload.query = {
    }
    if(this.agentId){
      if(payload?.query)payload.query['parentId'] = this.agentId
    } 
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('department',payload)?.subscribe((data) => {
      this.departmentData = data.documents; 
    });
  }
  getRoleList() {
    let payload = this.commonService.filterList()
   

      if(this.commonFunction.isSuperAdmin()){ 
        if(payload?.query)payload.query = {"status": true ,
          "orgId": {
            "$in": [
              this.commonFunction.getAgentDetails()?.orgId , this.agentId
            ]
          }
        }
      }else{
        if(payload?.query)payload.query = {"status": true ,
          orgId: this.commonFunction.getAgentDetails().orgId}
      }


    this.commonService.getSTList('role', payload)?.subscribe(data => {
      this.roleUserListData = data.documents;
      this.roleList = [];
      data.documents?.forEach((element) => {
        this.roleList.push({
          roleName: element?.roleName,
          roleId: element?.roleId,
        });
      });
    })

  }
  UserMasters() {
    this.submitted = true;
    if (this.userForm.invalid || this.userForm.controls.userRole.value === "0") {
      return;
    }
    let roles = this.roleList.filter(x => x.roleId === this.userForm.controls.userRole.value);
    let tenantId = "1"
    switch (roles[0].roleName) {
      case "Stolt":
        tenantId = "3"
        break;
      case "SHIPEASY":
        tenantId = "2"
        break;
      default:
        tenantId = "1"
        break;
    }
    this.userData = {
      "tenantId": this.tenantId,
      "orgId": this.agentId,
      "agentId" :this.agentId,
      "name": this.userForm.controls.firstName.value,
      "userType":this.userList[0]?.userType || 'warehouse',
      "userName": this.userForm.controls.userName.value.toLowerCase(),
      "userLastname": this.userForm.controls.lastName.value,
      "shortName": this.userForm.controls.shortName.value,
      "officeLocation": this.userForm.controls.branch.value,
      "userEmail": this.userForm.controls.email.value,
      "userloginType": this.userloginType || this.userloginTypes,
      // "password": this.userForm.controls.password.value,
      "phoneNo": this.userForm.controls.phoneNo.value,
      "userLogin": this.userForm.controls.userName.value.toLowerCase(),
      "department": [{ "item_id": this.userForm.controls.department.value, "item_text": this.departmentData?.filter(dep => dep?.departmentId === this.userForm.controls.department.value)?.[0]?.['deptName'] }],
      "agent": this.userForm.controls.agent.value,
      "principle": this.userForm.controls.principle.value,
      "defaultPrinciple": this.userForm.controls.defaultPrinciple.value,
      "agentBranch": this.userForm.controls.agentBranch.value,
      "agentBranchName": this.branchData.filter(x=> x.branchId === this.userForm.controls.agentBranch.value )[0]?.branchName,
      "superUser": this.userForm.controls.superUser.value,
      "defaultModule": this.userForm.controls.defaultModule.value,
      "jmbFAS": this.userForm.controls.jmbFAS.value,
      "exportBackDate": this.userForm.controls.exportBackDate.value,
      "importBackDate": this.userForm.controls.importBackDate.value,
      "agencyInvoice": this.userForm.controls.agencyInvoice.value,
      "exRateEditable": this.userForm.controls.exRateEditable.value,

      "roles": [{
        "roleName": roles[0].roleName,
        "roleId": roles[0].roleId,
      }],
      "userStatus": this.userForm.controls.status.value,
      "status": this.userForm.controls.status.value,
      isEmail:  this.userForm.controls.isEmail.value, 
      isMobile :  this.userForm.controls.isMobile.value,
      isPassword :  this.userForm.controls.isPassword.value,
      "userId": "",
      "createdDate": new Date(),
      "updatedDate": new Date(),
      "isTrial": this.activeAgent?.isTrial || false,
      'trialValidTill' : this.activeAgent?.isTrial ? this.activeAgent?.trialValidTill : ''
    };
     
    this.ngOnSaveUser()
    // if (this.UserIdToUpdate !== '') {
    //   this.ngOnSaveUser()
    // }
    // else { 
    //   let data = [];
    //   var url = Constant.SAVE_USER; 
    //   const params = {
    //     username: this.userData.userName.toLowerCase(),
    //     password: this.userData.password,
    //     attributes: {
    //       name: this.userData.userName.toLowerCase(),
    //       email: this.userData.userEmail,
    //       phone_number: "+91" + this.userData.phoneNo
    //     }
    //   };
    //   this.cognitoService.signup(params)
    //     .then(res => {
    //       this.ngOnSaveUser(res)
    //     }).catch(err => {
    //       this.userForm.controls['userName'].setErrors({ notUnique: true })
    //       this.notification.create('error', err.message, '');
    //     })
    // }
  }


  ngOnSaveUser() {
    let data = [];
    var url ;
    if (this.UserIdToUpdate !== '') {
      this.userData.createdDate = this.user?.createdDate;
      this.userData.orgId = this.agentId;
      this.userData.tenantId = this.user?.tenantId;
      this.userData.userId = this.UserIdToUpdate || '';
      this.userData.updatedDate = new Date();
      data = [this.userData];
      url = this.commonService.UpdateToST(`user/${data[0].userId}`, data[0])
    } else {
      // this.userData['userAWSProfile'] = cognitoRes?.userSub ? cognitoRes?.userSub : this.user?.userAWSProfile
      this.userData.createdDate = new Date();
      data = [this.userData];
      url = this.commonService.addToST(`user`, data[0])
    }
    url?.subscribe(res => {
      if (res) {
        if (this.UserIdToUpdate == '') {
          this.notification.create(
            'success',
            'User Created Successfully',
            ''
          );
        }
        if (this.UserIdToUpdate !== '') {
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );
        }
        window.location.reload()
        this.onSave();
      }
    }, error => {
      this.onSave();
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });
  }

  onSave() {
    this.modalService.dismissAll();
    this.UserIdToUpdate = '';
    this.submitted = false
    this.userForm.reset();
    return null;
  }

  async ngOnConfirm() {
    this.submittedForConfirm = true;
    if (this.userConfirmForm.invalid) {
      return;
    }

    this.ngOnSaveUser();
  }

}


