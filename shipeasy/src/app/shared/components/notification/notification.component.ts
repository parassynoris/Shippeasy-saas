import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/admin/principal/api.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import * as Constant from 'src/app/shared/common-constants';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { Department } from 'src/app/models/department';
interface ToCCPCList{
  name:string;
}

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notiData: any = [
    { notification_name: 'Portcall Submission ' },
    { notification_name: 'Appointment(Operator)' },
    { notification_name: 'Appointment(Agents)' },
    { notification_name: 'Appointment Acceptance by Agent' },
    { notification_name: 'Appointment / Request for PDA - Declined by Agent' },
    { notification_name: 'Request for PDA - Appt. rejected by Nominated Agent' },
    { notification_name: 'Request for PDA - Declined to Other Agent' },
    { notification_name: 'Final Appointment Letter to Operator(RFP)' },
  ]
  expandRow: any = null;
  baseBody: any;
  agentId: any;
  readChecked: Boolean = false;
  unreadChecked: Boolean = false;
  notificationData: any = {};
  notificationSettingId: any;
  departmentListForHeader: Department[] = [];
  departmentList: any = [];
  notificationMasterList: any = [];
  ToCCPCList: ToCCPCList[] = [];
  constructor(
    private _api: ApiService,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private commonService : CommonService
  ) {
    // do nothing.
  }

  ngOnInit(): void {
    this.agentId = this.route.snapshot?.params['id'];
    // do nothing.
    this.getDepartmentList();
  }

  getDepartmentList() { 
    let payload = this.commonService?.filterList()
   if (payload?.query)payload.query = {
      status: true,
    } 
    if (payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList(Constant.GET_DEPT,payload)?.subscribe((res: any) => {
      this.departmentListForHeader = res?.documents;
      res?.documents.forEach(element => {
          this.departmentList.push({
            //index: index,
            isToEmail: false,
            isCCEmail: false,
            isPCEmail: false,
            deptName: element.deptName,
            departmentId: element.departmentId
          });
          var name = "TO - CC - PC";
       
          this.ToCCPCList.push({
            name: name
          })
      });
      this.getNotificationMasterList();
    });
  }

  getNotificationMasterList() {
    let payload = this.commonService.filterList()
    payload.query = { status : true } 
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('notification',payload)?.subscribe((res: any) => {
      res?.documents.forEach(element => {
        this.notificationMasterList.push({
          notificationType: element.notificationType,
          notificationId: element.notificationId,
          tomail: '',
          ccmail: '',
          pcmail: '',
          departments: []
        })
      });
      this.notificationMasterList.forEach((element) => {
        let lists = [];
        this.departmentList.forEach((feature) => {
          lists.push({
            index: feature.index,
            isToEmail: false,
            isCCEmail: false,
            isPCEmail: false,
            deptName: feature.deptName,
            departmentId: feature.departmentId
          });
        });
        element.departments = lists;
      });
      this.getNotificationSettingDetails();

    });
  }

  getNotificationSettingDetails() { 
    let payload = this.commonService.filterList()
    payload.query = { agentId: this.agentId, } 
    payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService.getSTList('notificationsetting',payload)?.subscribe((res: any) => {
      if (res?.totalCount > 0) {

        for (let index = 0; index < this.notificationMasterList.length; index++) {
          this.notificationSettingId = res?.documents[res?.totalCount - 1].notificationsettingId;
          var isPresentPermission = res?.documents[res?.totalCount - 1].setting?.findIndex(
            (rank) => rank.notificationId === this.notificationMasterList[index].notificationId
          );
          if (isPresentPermission > -1) {
            this.notificationMasterList[index].tomail = res?.documents[res?.totalCount - 1].setting[isPresentPermission].tomail;
            this.notificationMasterList[index].ccmail = res?.documents[res?.totalCount - 1].setting[isPresentPermission].ccmail;
            this.notificationMasterList[index].pcmail = res?.documents[res?.totalCount - 1].setting[isPresentPermission].pcmail;

            this.notificationMasterList[index].departments.forEach((feature) => {
              var isPresentPermissionForDept = res?.documents[res?.totalCount - 1].setting[isPresentPermission]?.departments.findIndex(
                (rank) => rank.departmentId === feature.departmentId
              );
              if (isPresentPermissionForDept > -1) {
                feature.index = res?.documents[res?.totalCount - 1].setting[isPresentPermission].departments[isPresentPermissionForDept].index;
                feature.isToEmail = res?.documents[res?.totalCount - 1].setting[isPresentPermission].departments[isPresentPermissionForDept].isToEmail;
                feature.isCCEmail = res?.documents[res?.totalCount - 1].setting[isPresentPermission].departments[isPresentPermissionForDept].isCCEmail;
                feature.isPCEmail = res?.documents[res?.totalCount - 1].setting[isPresentPermission].departments[isPresentPermissionForDept].isPCEmail;
                feature.deptName = res?.documents[res?.totalCount - 1].setting[isPresentPermission].departments[isPresentPermissionForDept].deptName;
                feature.departmentId = res?.documents[res?.totalCount - 1].setting[isPresentPermission].departments[isPresentPermissionForDept].departmentId;
              }
            });
          }

        }
      }
    });
  }
  openWrrow(value) {
    if (value === this.expandRow) {
      this.expandRow = null;
    } else {
      this.expandRow = value;
    }

  }
  onCheckBoxChange(event, type) {
    if (type === 'read') {
      this.readChecked = event.target.checked;
    } else {
      this.unreadChecked = event.target.checked;
    }
    let tempData = [];
    if (this.readChecked && !this.unreadChecked) {
      tempData = this.notificationData.filter(
        (data: any) => data.isRead === true
      );
    } else if (!this.readChecked && this.unreadChecked) {
      tempData = this.notificationData.filter(
        (data: any) => data.isRead === false
      );
    } else if (!this.readChecked && !this.unreadChecked) {
      tempData = [...this.notificationData];
    }
    else if (this.readChecked && this.unreadChecked){
      tempData = [...this.notificationData]
    }

  }

 
  ngOnSave() {
    var lists = [];
    var notificationsettingId = "";
    let url;
    this.notificationMasterList.forEach(element => {
      if (element.tomail || element.ccmail || element.pcmail) {
        lists.push({
          notificationType: element.notificationType,
          notificationId: element.notificationId,
          tomail: element.tomail,
          ccmail: element.ccmail,
          pcmail: element.pcmail,
          departments: element.departments.filter(x => x.isCCEmail   || x.isPCEmail   || x.isToEmail  )
        })
      }
    });


   

    var notificationData = {
      notificationsettingId: notificationsettingId,
      notificationType: "One",
      agentId: this.agentId,
      setting: lists
    };
    var modelOfArray = [];
    modelOfArray.push(notificationData);

    if (this.notificationSettingId !== null && this.notificationSettingId !== undefined) {
      notificationsettingId = this.notificationSettingId;
      url = this.commonService?.UpdateToST(`notificationsetting/${this.notificationSettingId}`,modelOfArray[0])
    } else {
      url = this.commonService?.addToST(`notificationsetting`,modelOfArray[0])
    }
    url?.subscribe(
      (result: any) => {
        if (this.notificationSettingId !== null && this.notificationSettingId !== undefined) {
          this.notification.create('success', 'Updated Successfully', '');
        } else {
          this.notification.create('success', 'Saved Successfully', '');
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
}

