import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonFunctions } from '../../functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { ActivatedRoute, Router } from '@angular/router';

import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { groupBy, mergeMap, toArray } from "rxjs/operators";
import { from } from 'rxjs';
import { REGEX } from 'src/app/services/common/constants/REGEX';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { OrderByPipe } from '../../util/sort';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  userData: any = {};
  defaultNoticationData: any = [];
  notificationFromSystemType: any = [];
  formData: FormGroup;
  // departmentList: any;
  ////////////

  isOperatorLogin = false;
  selection = new SelectionModel<any>(true, []);
  principalLegalFormGroup!: FormGroup;
  selectedOptions = "";
  legalEntityList: any = [];
  notificationId = "";
  notificationName = '';
  notifyGroup: any;
  principalList: any[] = [];
  principalId: any = "";
  departmentList: any[] = [];
  notificationList: any[] = [];
  dataSource: any = [];
  notificationData: any[] = [];
  legalEntitySelected: any = '';
  legalEntityName: any;
  notificationDummyData: any[] = [];
  displayedColumns: string[] = ['select', 'sendTo',  'to','cc'];
  tableForm: any;
  selectedTrigger: any;
  activeTab: string = '';
  defaultTrigger = [
    {
      type: "direct",
      label: "Default"
    }
  ];
  emailVesselData = [
    {
      type: "direct",
      label: "Default"
    },{
      type: "shipper",
      label: "shipper"
    },{
      type: "consignee",
      label: "consignee"
    },{
      type: "booking party",
      label: "booking party"
    }
  ];
  existingNotificationMasterDetails: any;

  defaultLabels: any = {
    "direct": "Default"
  };
  signatureDetails: any[] = [];
  sequencedGroupNames!: string[] | null;
  userSelectedNotificationType: any;
  selectedNotificationtrigger: any;
  regex = REGEX;
  departmentDataSource = new MatTableDataSource();
  MasterNotificationId = '';
  groupedTriggers: any = [];
  sequenceConfiguration: any = {};
  updatedTriggers: any = [];
  groupedSequence: any = {
    "PDA": 'PDA Approval Notifications',
    "IDA": 'IDA Approval Notifications',
    "FDA": 'FDA Approval Notifications',
    "SDA": 'SDA Approval Notifications',
    "VI": 'Vendor Invoice Approval Notifications',
    "APDA": 'APDA Approval Notifications'
  };
  selectedSequence = 0;
  sequence = false;
  selectedCategory = '';
  reportPathName = "";
  userDetails: any;
  activeLigalEntity = true;
  isSubmitted = false;
  triggerId: any;

  constructor(
    private _api: ApiService,
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private commonFunction: CommonFunctions,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    public router: Router, 
    private sortPipe: OrderByPipe,
  ) {
    this.tableForm = this.formBuilder.group({
      users: this.formBuilder.array([])
    });
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
 
  ngOnInit(): void {


    this.userDetails = this.commonFunction.getAgentDetails()
    this.groupGlobalNotifications();
    this.principalId = this.route.snapshot?.params['id'] ||  this.userDetails?.orgId; 
    this.sequencedGroupNames = Object.values(this.groupedSequence);

    this.principalLegalFormGroup = this.formBuilder.group({
      principal: new FormControl(),
      legalEntity: new FormControl(),
    });


  }


  get formArray() {
    return this.tableForm.get('users') as FormArray;
  }
  groupGlobalNotifications() {
    let payload2 = this.commonService.filterList()
    // payload2.query = {
    //   orgId: "1",
    //   'notificationType': "SE",
    //   isParent:false
    //   }

    this.commonService.getSTList('trigger', payload2)?.subscribe((res) => {

      this.notificationData = res?.documents;
      let triggers: any = res?.documents;
      // res?.documents?.forEach((data: { trigger: string | any[];  }) => {
      //   if (data?.trigger?.length) {
      //     triggers = [...triggers, ...data?.trigger];
      //   }
      // });
      const source = from(triggers);

      const observable = source.pipe(
        groupBy((data: any) => data?.groupby),
        mergeMap(group => group.pipe(toArray()))
      );
      this.groupedTriggers = [];
      observable.subscribe(val => {
        if (!this.selectedNotificationtrigger) {
          this.updateSelectedDetails(val?.[0]);
        }
        const GroupedCategory = val?.[0]?.groupby ? val?.[0]?.groupby : '';
        const outerOrder = val?.[0]?.outerOrder ?? 0;
        const sortedList = val.sort((a, b) => a.innerOrder - b.innerOrder);
        this.groupedTriggers = [...this.groupedTriggers, { GroupedCategory,outerOrder, list: sortedList }];
      });
      this.sequenceConfiguration = {};
      this.fetchSequenceDetails();
    });
  }
  updateSelectedDetails(subElement: any, category?: any) {
    this.triggerId = subElement?.triggerId
    this.userSelectedNotificationType = subElement?.emailname;
    this.selectedCategory = subElement?.groupby;
    const triggerDetails = this.notificationData?.find((item: any) => {
      // const matchedTrigger = item?.trigger?.find((data: any) => (data?.emailname == subElement?.emailname || (category && this.sequencedGroupNames?.includes(category))) && data?.groupby == subElement?.groupby);
      if (item?.triggerId == subElement?.triggerId) {
        return item;
      }
    });

    this.selectedNotificationtrigger = triggerDetails;
  }

  fetchSequenceDetails(legalEntity?: string | undefined) {
    if (legalEntity === 'default') {
      this.legalEntityName = 'default';
    }
    if (this.groupedTriggers?.length) {
      this.updatedTriggers = this.groupedTriggers;

      let payload = this.commonService.filterList()
      payload.query = {
        orgId: this.principalId,
        'status': true,
      }

 
      
        const sequencedGroups = Object.values(this.groupedSequence);
        this.updatedTriggers = this.groupedTriggers?.filter((data: any) => {
          if (sequencedGroups?.includes(data?.GroupedCategory)) {
            if (this.sequenceConfiguration[data?.GroupedCategory]) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        }).map((data: any) => {
          if (sequencedGroups?.includes(data?.GroupedCategory)) {
            const list = [{ ...data?.list?.[0], value: { ...data?.list?.[0]?.value, approvedSeq: 0 } }];
            for (let i = 2; i <= this.sequenceConfiguration[data?.GroupedCategory]; i++) {
              if (i >= 2) {
                let emailname = data?.list?.[1]?.emailname?.replace('$i', i);
                emailname = emailname.replace('$i-1', i - 1);
                const emailDetails = {
                  ...data?.list?.[1],
                  emailname: emailname
                };
                list.push(emailDetails);
              }
            }
            return { ...data, list };
          } else {
            return data;
          }
        });
    
        this.updatedTriggers.sort((a, b) => a.outerOrder - b.outerOrder);
  

    }
    this.principalChange();
  }

 
  clearInlineSelectedValue(formControlName: string) {
    this.principalLegalFormGroup.controls[formControlName].setValue('');

  }



  principalChange() {

    this.existingNotificationMasterDetails = null;
    this.MasterNotificationId = '';
    this.sequenceConfiguration = {};
    this.selection?.clear();
    const selected = this.updatedTriggers?.[0]; 
    this.selectedNotificationMaster(selected?.list?.[0], selected?.GroupedCategory, 0, selected?.list?.[0]);
    // this.principalId = this.principalLegalFormGroup.value.principal;

    let payload = this.commonService.filterList()
    payload.query = {
      // 'orgId':  this.principalId,
      "parentId": this.route.snapshot?.params['id']
    }

    // this.legalEntityName=this.legalEntityList[0]?.companyName;
    this.commonService.getSTList('department', payload).subscribe((res) => {
      this.departmentList = res.documents;

      // this.dataSource = res.documents;
      if(this.selectedCategory == 'Login Credentials Change'){
        this.dataSource = [ ...this.defaultTrigger, ...this.departmentList];
      }else{
        this.dataSource = [...this.emailVesselData, ...this.departmentList];
      }
    
      this.dataSource = this.dataSource.map((col) => {
        return {
          "departmentId": col?.departmentId,
          "departmentName": col?.deptName ? col?.deptName : col?.label,

          "toEmailId": "", //To , CC, PC
          "ccEmaillId": "", 
          "tomail": "",
          "ccmail": "", 
          
          "type": col?.type
        };
      });

      this.notificationMasterDetails();

      this.tableForm = this.formBuilder.group({
        users: this.formBuilder.array(this.dataSource.map((x: any) => this.setUsersFormArray(x)))
      });
    });
  }
  selectedNotificationMaster(subElement: any, category: string, i: number, trigger: any) {
    this.selectedTrigger = trigger;
    this.sequence = false;
    if (category && this.sequencedGroupNames?.includes(category)) {
      this.sequence = true;
      this.selectedSequence = i;
    }
    this.existingNotificationMasterDetails = null;
    this.MasterNotificationId = '';
    this.selection?.clear();
    this.updateSelectedDetails(subElement, category);
    this.selectedCategory = category;
    this.resetFormControls();
    this.notificationMasterDetails();

  }
  resetFormControls() {
    if(this.selectedCategory == 'Login Credentials Change'){
      this.dataSource = [ ...this.defaultTrigger, ...this.departmentList];
    }else{
      this.dataSource = [...this.emailVesselData, ...this.departmentList];
    }
  
    this.dataSource = this.dataSource.map((col) => {
      return {
        "departmentId": col?.departmentId,
        "departmentName": col?.deptName ? col?.deptName : col?.label,

        "toEmailId": "", //To , CC, PC
        "ccEmaillId": "", 
        "tomail": "",
        "ccmail": "", 
        
        "type": col?.type
      };
    });
    this.tableForm = this.formBuilder.group({
      users: this.formBuilder.array(this.dataSource.map((x: any) => this.setUsersFormArray(x)))
    });
  }

  getFormFieldError(formGroup: string | number | FormGroup, formControlName: string, action?: any) {
    let fg: FormGroup;
    if (action && formGroup) {
      fg = formGroup as FormGroup;
    } else {
      fg = Array.isArray(formGroup) ? formGroup[0] : formGroup as FormGroup;
    }

    const data = this.commonService.getFormFieldErrorMessage(fg, formControlName);
    return data;
  }

  changeNotify(notify, notifyGroup) {
    this.notificationId = notify.notificationID;
    this.notificationName = notify.notificationName;
    this.notifyGroup = notifyGroup?.settingName;
    this.selectedOptions = notify.notificationName;
  }
  notificationMasterDetails() {

    if (this.principalId) {

      let query = this.commonService.filterList()
      query.query = {
        'orgId': this.principalId,
        // "notificationType": this.selectedNotificationtrigger?.notificationType,
        'module': this.selectedNotificationtrigger?.module,
        // 'action': this.selectedNotificationtrigger?.action
        // 'triggerId': this.selectedNotificationtrigger?.triggerId
      }

      this.commonService.getSTList('notificationmaster', query).subscribe((res) => {
        const masterDetails = res?.documents[0];
        if (masterDetails) {
          this.existingNotificationMasterDetails = masterDetails; 
          this.formArray?.controls?.forEach(formGroup => {
            if (formGroup ) {
              const selectedConfiguration = formGroup?.value?.type ? formGroup?.value?.type : formGroup?.value?.departmentName;
              // let dept = masterDetails?.trigger?.[0]?.triggerParams?.emailSettings?.find(item => (item?.type===selectedConfiguration || item?.deptName==selectedConfiguration))
              const dept = masterDetails?.trigger?.find((item) => item?.triggerId === this.triggerId)?.emailSettings?.find((val) => (val?.type === selectedConfiguration || val?.deptName == selectedConfiguration));

              this.MasterNotificationId = masterDetails?.notificationmasterId;
              if (dept) {
                formGroup.patchValue({
                  ccmail: dept?.isEmailCC ? true : false,
                  departmentId: dept?.deptId ? dept?.deptId : '',
                  departmentName: dept?.deptName ? dept?.deptName : dept?.type,
                  
                  mailTo: dept?.emailTo, 
                  tomail: dept?.isEmailTo ? true : false,
                  toEmailId: dept?.emailTo ? dept?.emailTo : '',
                  ccEmaillId: dept?.emailCC ? dept?.emailCC : '',
                  notificationId: masterDetails?.notificationmasterId
                });
                this.selection.select(formGroup);
              }
            }
          });
        }else{
          this.existingNotificationMasterDetails = null
        } 
        this.departmentDataSource.data = this.formArray.controls; 

        
      });
    }
  }

  setUsersFormArray(x) {

    return this.formBuilder.group({
      ccmail: [x.ccmail, Validators.compose([Validators.email])],
      departmentId: [x.departmentId],
      departmentName: [x.departmentName,Validators.required], 
      mailTo: [x.mailTo],  
      tomail: [x.tomail, Validators.compose([Validators.email])],
      toEmailId: [x.toEmailId, [Validators.pattern(this.regex.MULTIPLE_EMAIL_WITH_COMMA_SEPARATED)]],
      ccEmaillId: [x.ccEmaillId, [Validators.pattern(this.regex.MULTIPLE_EMAIL_WITH_COMMA_SEPARATED)]],
      type: x.type,
      notificationId: new FormControl('')
    });
  }

 async save(action?: string | any[]) {
let departmentcheck = false
  
  if (this.selection.selected.length !== 0) {
    this.selection.selected?.filter(item => {
      if (item?.value?.departmentName !== 'direct') {
        departmentcheck = true
      }
    });
  }
  if(!departmentcheck){
    this.notification.create('info', 'Please select Department  ..', '');
    return
  }
    let data = false;
    let emailToCount = 0;
    let ccDepartmentNames: string[] = [];
    let ccDepartmentName = '';

    if (this.selection.selected.length !== 0) {
      this.selection.selected?.filter(item => {
        if (item?.value?.tomail === true || item?.value?.toEmailId) {
          emailToCount += 1;
        }
        if (item?.value?.departmentId || item?.value?.type !== 'direct') {
          if ((item?.value?.ccmail === false && item?.value?.tomail === false) || (item?.value?.ccmail === "" && item?.value?.tomail === "")) {
            data = true;
            ccDepartmentNames.push(item?.value?.departmentName);
          }
        }
        if (item?.value?.type == 'direct') {
          if (item?.value?.ccEmaillId === "" && item?.value?.toEmailId === "") {
            data = true;
            ccDepartmentNames.push(item?.value?.departmentName);
          }
        }
      });
      ccDepartmentName = ccDepartmentNames.join(', ');
      if (emailToCount === 0) {
        this.notification.create('info', 'Please select the Send To Department  ..', '');
        return;
      }
      if (data) {
        this.notification.create('info', `Please select the EmailTo or EmailCC or Department (${ccDepartmentName})...`, '');
        return;
      }
    }

    const user = this.userDetails;

    if (this.existingNotificationMasterDetails?.trigger?.find((item) => item?.triggerId === this.triggerId)?.emailSettings !== undefined || this.selection.selected.length !== 0) {
      const settings = this.selection.selected?.map(item => {
        let setting = {};
        if (item?.value?.type?.length) {
          setting = {
            "type": item?.value?.type
          };
        }
        else {
          setting = {
            "type": "departments",
            "deptId": item?.value?.departmentId,
            "deptName": item?.value?.departmentName, 
          };
        }
        if (item?.value?.type == 'direct') {
          setting = {
            ...setting,
            "emailTo": item?.value?.type == 'direct' ? item?.value?.toEmailId?.toString().replace(/\s/g, '') : '',
            "emailCC": item?.value?.type == 'direct' ? (item?.value?.ccEmaillId ? item?.value?.ccEmaillId.toString().replace(/\s/g, '') : '') : ''
          };
        } else if (item?.value?.tomail) {
          setting = { ...setting, "isEmailTo": true };
        } else if (item?.value?.ccmail) {
          setting = { ...setting, "isEmailCC": true };
        }
        return setting;
      });
      // settings.push({type: "diabosUser", isEmailCC: true});

 
      if (this.principalId) {

        // let query = this.commonService.filterList()
        // query.query = {
        //   'orgId': this.principalId,
        //   // "notificationType": this.selectedNotificationtrigger?.notificationType,
        //   'module': this.selectedNotificationtrigger?.module,
        //   // 'action': this.selectedNotificationtrigger?.action
        //   // 'triggerId': this.selectedNotificationtrigger?.triggerId
        // }


        // this.commonService.getSTList('notificationmaster', query).subscribe((res) => {

          let masterpayload: any;
          const existingTriggers = this.existingNotificationMasterDetails?.trigger;
        
          this.updatedTriggers.filter((x: any) => {
            if (x?.triggerId === this.triggerId) {
              x?.list.filter((t: any) => {
                // t.triggerParams.template[0].tenantId = user.TenantId;
                if (t?.triggerId === this.triggerId) {
                  masterpayload = t;
                }
                if (this.triggerId === "Sequence $i (On approval of sequence $i-1)") {
                  masterpayload = t;
                }
              });
            }
          });

       
         let  alradyExist = existingTriggers?.filter((x)=> x?.triggerId !=  this.triggerId) || []
         let  nowExist = existingTriggers?.filter((x)=> x?.triggerId ==  this.triggerId)|| []

           let triggers = await this.updatePayload(settings, masterpayload, nowExist);
         
           triggers =  [...alradyExist,...triggers]
           triggers.forEach(obj => {
            delete obj.inAppNotification ;  
            delete obj.template ;  
            delete obj.params ;   
            delete obj.emailname ;  
            delete obj.groupby ;  
            delete obj.module ;  
            delete obj._id;
          })



          // const notificationmasterId = this.existingNotificationMasterDetails?.find((item) => item?.emailname === this.userSelectedNotificationType && item?.groupby == this.selectedCategory)?.notificationmasterId;
          let payload: any;
          payload = {
            notificationmasterId: this.existingNotificationMasterDetails?.notificationmasterId ? this.existingNotificationMasterDetails?.notificationmasterId : '',
            module: this.selectedNotificationtrigger?.module,
            // notificationType: this.selectedNotificationtrigger?.notificationType,
            // "action": this.selectedNotificationtrigger?.action,
            "orgId": this.principalId,
            // 'triggerId': this.selectedNotificationtrigger?.triggerId,
            trigger: triggers
          };

       
          if (this.existingNotificationMasterDetails?.notificationmasterId) {
            this.commonService.UpdateToST(`notificationmaster/${payload?.notificationmasterId}`, payload).subscribe((res) => {
              if (res) {
                this.notification.create('success', 'Saved Successfully...', '');
              }
              else {
                this.notification.create('info', 'There is an error to procceed request, please try again later...', '');
              }
            },
              () => {
                this.notification.create('info', 'There is an error to procceed request, please try again later...', '');
              });
          } else {
            this.commonService.addToST('notificationmaster', payload).subscribe((res) => {
              if (res) {
                this.notification.create('success', 'Saved Successfully...', '');
              }
              else {
                this.notification.create('info', 'There is an error to procceed request, please try again later...', '');
              }
            },
              () => {
                this.notification.create('info', 'There is an error to procceed request, please try again later...', '');
              });
          }

        // });



      } else {
        this.notification.create('info', 'Please select the Principle or Legal Entity...', '');
      }

    } else {
      this.notification.create('info', 'Please select atleast one configuration to save...', '');
    }
  }
   updatePayload(settings: string | any[], masterpayload?: any, existingTriggers ?:any) {
    const user = this.userDetails; 
    let triggers: any[] = [ ];

    if(existingTriggers?.length > 0){
      triggers  = [{
        ...existingTriggers[0],
        "emailSettings": settings
      }];
    }else{
      triggers  = [{
        
        ...this.selectedNotificationtrigger,
        "emailSettings": settings
      }];
    }
   
    return triggers;
  }

  departmentRowCheck(event: { checked: any; }, element: FormGroup, idOne: any | any[], fieldId?: any) {
    if (event?.checked && idOne?.length) {
      element?.patchValue({ [idOne]: false });
    }
  }

  onCancel() {
    this.router.navigate(['/register/list/']);
  }
  masterToggle() {
    this.isEntirePageSelected() ?
      this.selection.clear() :
      this.selection.select(...this.formArray?.controls);
  }
  isAllSelected() {
    return this.formArray?.controls?.every((row) => this.selection.isSelected(row));
  }
  isEntirePageSelected() {
    return this.formArray?.controls.every((row) => this.selection.isSelected(row));
  }
  changeselct(ele: { value: { ccmail: boolean; tomail: boolean; toEmailId: string; ccEmaillId: string; }; }) {
    if (!this.selection.isSelected(ele)) {
      ele.value.ccmail = false;
      ele.value.tomail = false;
      ele.value.toEmailId = "";
      ele.value.ccEmaillId = "";
    }

  }
}

