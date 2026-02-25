import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { shared } from '../../data';
import { ApiSharedService } from '../api-service/api-shared.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonFunctions } from '../../functions/common.function';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { OrderByPipe } from '../../util/sort';
import { CognitoService } from 'src/app/services/cognito.service';
import { SystemType } from 'src/app/models/system-type';
import { Branch } from 'src/app/models/yard-cfs-master';
import { User } from 'src/app/models/userprofile';
import { Department } from 'src/app/models/department';
import { Organization, Remark } from 'src/app/models/discussion';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.scss']
})
export class DiscussionComponent implements OnInit {
  _gc=GlobalConstants
  @ViewChild(MatPaginator) paginator: MatPaginator;
  discussionDate = shared.discussionRow;
  dataSource = new MatTableDataSource();
  isNew: boolean = false;
  filterBody = this.apiService.body;
  shipStatusList:SystemType[] = [];
  commentData:Remark[] = [];
  commentForm: FormGroup;
  userData: any;
  EnquiryId: Branch;
  batchDetail: any;
  baseBody: any
  instructionData: any = [];
  userList: User[];
  milestoneType: any = [];
  departmentList: Department[];
  submitted: boolean = false;
  D = new Date();
  currentDate: any =
    this.D.getDate() + '/' + this.D.getMonth() + '/' + this.D.getFullYear();
  closeResult: string;
  isExport: boolean = false;
  AgentId: Organization;
  branchList: Branch[] =[];
  urlParam: any;
  pagenation = [5, 10, 20];
  isShow: boolean = false;
  constructor(public apiService: ApiSharedService,
    public router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private commonFunction: CommonFunctions,
    public commonService: CommonService,
    public modalService: NgbModal,
    public notification: NzNotificationService,
    public cognito : CognitoService,
    private sortPipe: OrderByPipe,
    public loaderService: LoaderService,) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;;
    // this.userData = this.commonFunction.getUserDetails();
    this.formBuild();
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  formBuild() {
    this.commentForm = this.fb.group({
      processPointValue: "",
      fromUser: [this.userData?.createdBy],
      toUser: [''],
      emailSend: [true],
      department: [''],
      branchHead: [],
      comment: ['']
  
    });
  }
  onAddComment(content) {
    this.isNew = !this.isNew;
    this.submitted = false;
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  ngOnInit(): void {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
    this.id = this.route.snapshot.params['id'];
      this.getBatchById();
      this.getUsersForDropDown();
      this.getShipStatusList();
      this.getSmartAgentList();
      this.getInstructionList();
      // this.getmilestoneDropdown();
      this.getMilestone();
  }
  getSmartAgentList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      'status': true
    }
    this.commonService.getSTList("agent",payload)?.subscribe((data:any) => {
      let agentId = data.documents[0]?.agentId
      this.getBranchList(agentId)
      this.getDepartmentList(agentId)
    });
  }
  getBranchList(id) {

    let payload = this.commonService.filterList()
    payload.query = {
      parentId: id,
    }

    this.commonService
      .getSTList("branch",payload)
      ?.subscribe((data:any) => {
        this.branchList = data?.documents;
      });
  }

milestoneList: any = [];
id: string = '';

getMilestone() {  
  let payload: any = this.commonService.filterList()
  if(payload?.query)payload.query = {
    "entityId": this.id
  };
  if(payload?.sort)payload.sort = {
    "asc": ['eventSeq'],
  };
  this.commonService.getSTList('event', payload)?.subscribe((data: any) => {
    this.milestoneList = data.documents; 
  } );

}
  getBatchById() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "batchId": this.route.snapshot.params['id']
    }
    this.commonService.getSTList("batch", payload)?.subscribe((res: any) => {
      this.batchDetail = res?.documents[0];
      if(this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch =='Job Closed'){
        this.commentForm.disable();
        this.isShow=true
      }
      this.EnquiryId = res?.documents[0]?.enquiryId;
      this.AgentId = res?.documents[0]?.agentadviceId;
this.getCommentsList()
    })
  }
  get f() {
    return this.commentForm.controls;
  }
  getUsersForDropDown() {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {
      'status': true
    }
    this.commonService.getSTList("user", payload)?.subscribe((res: any) => {
      this.userList = res?.documents;
    });
  }
  getShipStatusList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory: 'processPoint',
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.shipStatusList = res.documents;
    });
  }

  getCommentsList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
   payload.query = {
      "batchId": this.route.snapshot.params['id']
    }
    setTimeout(() => {
      this.commonService.getSTList('comment', payload)?.subscribe((res: any) => {
        this.commentData = []
        this.commentData = res.documents;
        this.getCommentsList1() 
        this.loaderService.hidecircle();
      }, () => {
        this.loaderService.hidecircle();
      });
    }, 800);
  
  }
  getCommentsList1() {
    let payload = this.commonService.filterList()
   
    if(this.isExport){
      if(payload?.query)  payload.query = {
        "enquiryId": this.EnquiryId
      }
    }else{
      payload.query = {
        "agentadviceId": this.AgentId
      }
    }
    this.commonService.getSTList('comment',payload)?.subscribe((res: any) => {
      res.documents?.filter((x) => {
        this.commentData?.push(x)
      
      })
    });
  }

  getInstructionList() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      'batchId': this.urlParam?.id,
    };
  
    this.commonService.getSTList('instruction', payload)?.subscribe((res: any) => {
      if (res?.documents?.length > 0) {
        
        this.instructionData = res.documents.map((doc: any) => {
          let remarks = [];
  
          if (doc?.dg?.remark) {
            remarks.push({
              remarkType: 'Dangerous Good Declaration',
              remark: doc.dg.remark,
              createdBy: doc.createdBy
            });
          }
  
          if (doc?.mblDraft?.firstPrintRemark) {
            remarks.push({
              remarkType: 'Master BL Draft Received',
              remark: doc.mblDraft.firstPrintRemark,
              createdBy: doc.createdBy
            });
          }
  
          if (doc?.mblOriginal?.finalPrintRemark) {
            remarks.push({
              remarkType: 'Master BL Original Received',
              remark: doc.mblOriginal.finalPrintRemark,
              createdBy: doc.createdBy
            });
          }
  
          if (doc?.si?.filedRemark) {
            remarks.push({
              remarkType: 'SI From Customer',
              remark: doc.si.filedRemark,
              createdBy: doc.createdBy
            });
          }
  
          if (doc?.si?.siRemark) {
            remarks.push({
              remarkType: 'Booking',
              remark: doc.si.siRemark,
              createdBy: doc.createdBy
            });
          }
  
          if (doc?.vgm?.length > 0) {
            doc.vgm.forEach((vgmItem: any) => {
              if (vgmItem?.vgmRemark) {
                remarks.push({
                  remarkType: 'Verified Gross Mass (VGM)',
                  remark: vgmItem.vgmRemark,
                  createdBy: doc.createdBy
                });
              }
            });
          }
  
          return remarks;
        }).flat().filter(item => item.remark);
        this.dataSource = new MatTableDataSource(
          this.instructionData?.map((s: any,index) => {
            return{
              ...s,
              id:index+1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
      }
    });
  }
  
  getDepartmentList(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      parentId: id,
    }
    this.commonService.getSTList('department',payload)?.subscribe((data) => {
      this.departmentList = data.documents;
    });
  }
  

  // sendEmailToIntru() {
  //   let emaildata = `
  //   ${'Process Point Name'} : ${this.milestoneType.filter(x => x.milestonemasterId === this.commentForm.controls.processPointValue.value)[0]?.mileStoneName}
  //   ${'Department'} : ${this.departmentList.filter(x => x.departmentId === this.commentForm.controls.department.value)[0]?.deptName}
  //   ${'comments'} : ${this.commentForm.controls.comment.value}
  //  `
  //   let payload = {
  //     sender: {
  //       name: this.userData?.roleName,
  //       email: this.userData?.createdBy,
  //     },
  //     to: [{
  //       email: this.userList.filter(x => x.userId === this.commentForm.controls.toUser.value)[0]?.userEmail,
  //       name: this.userList.filter(x => x.userId === this.commentForm.controls.toUser.value)[0]?.name,
  //     }],
  //     textContent: `${emaildata}`,
  //     subject: "Discussion",
  //     batchId :   this.route.snapshot.params['id'],
  //   }
    
  //   this.apiService.sendEmail(payload)?.subscribe(
  //     (res) => {
  //       if (res.status == "success") {
  //         this.notification.create('success', 'Email Send Successfully', '');
  //       }
  //       else {
  //         this.notification.create('error', 'Email not Send', '');
  //       }
  //     }
  //   );

  // }

  // getContractCommentsSave() {
  //   this.submitted = true;
  //   if (this.commentForm.invalid) {
  //     return;
  //   }
  //   else{ 
  //     const commentdata = {
        
  //       "tenantId": this.userData.tenantId,
  //       "prospectId": "",
  //       "commentsby": this.userData?.roleName,
  //       "commentText": this.commentForm.controls.comment.value,
  //       "instructionsFrom": this.userData?.createdBy,
  //       "instructionsTo": this.userList.filter(x => x.userId === this.commentForm.controls.toUser.value)[0]?.userEmail,
  //       "instructionsDescription": this.commentForm.controls.comment.value,
  //       "commentDate": this.currentDate,
  //       "contractId": "",
  //       "commentId": "",
  //       "clauseId": "",
  //       "batchId": this.route.snapshot.params['id'],
  //       "processPoint": this.commentForm.controls.processPointValue.value,
  //       "processPointName": this.milestoneType.find(x => x.milestonemasterId === this.commentForm.controls.processPointValue.value)?.mileStoneName || '', 
  //       "departmentId": this.commentForm.controls.department.value,
  //       "departmentName": this.departmentList.filter(x => x.departmentId === this.commentForm.controls.department.value)[0]?.deptName,
  //       "branchHead": this.branchList.filter(x => x.branchId === this.commentForm.controls.branchHead.value)[0]?.branchName, 
  //       "branchHeadId": this.commentForm.controls.branchHead.value,
  //       "reply:": [
  //         {
  //           "commentsBy": "",
  //           "commentText": "",
  //           "commentDate": "",
  //         }
  //       ],
  //       "status": "true"
  //     }
     
     
  //     this.commonService.addToST('comment',commentdata)?.subscribe((res: any) => {
  //       if (res) {
  //         if (this.commentForm.controls.emailSend.value) {
  //           this.sendEmailToIntru();
  //         } 
  //           this.notification.create(
  //             'success',
  //             'Added Successfully',
  //             ''
  //           );
  //           this.getCommentsList()
  //           this.formBuild();
  //           this.submitted = false;
  //           this.modalService.dismissAll();
          
  //       }
  //     }, error => {
  //       this.notification.create(
  //         'error',
  //         error?.error?.error?.message,
  //         ''
  //       );
  //     });
  //   }
    
  // }

  getContractCommentsSave() {
    this.submitted = true;
    if (this.commentForm.invalid) {
      return;
    } else { 
      const commentdata = {
        "tenantId": this.userData.tenantId,
        "prospectId": "",
        "commentsby": this.userData?.roleName,
        "commentText": this.commentForm.controls.comment.value,
        "instructionsFrom": this.userData?.createdBy,
        "instructionsTo": this.userList.filter(x => x.userId === this.commentForm.controls.toUser.value)[0]?.userEmail,
        "instructionsDescription": this.commentForm.controls.comment.value,
        "commentDate": this.currentDate,
        "contractId": "",
        "commentId": "",
        "clauseId": "",
        "batchId": this.route.snapshot.params['id'],
        "processPoint": this.commentForm.controls.processPointValue.value,
        "processPointName": this.milestoneList.find(x => x.eventId === this.commentForm.controls.processPointValue.value)?.eventName || '', 
        "departmentId": this.commentForm.controls.department.value,
        "departmentName": this.departmentList.filter(x => x.departmentId === this.commentForm.controls.department.value)[0]?.deptName,
        "branchHead": this.branchList.filter(x => x.branchId === this.commentForm.controls.branchHead.value)[0]?.branchName, 
        "branchHeadId": this.commentForm.controls.branchHead.value,
        "reply": [
          {
            "commentsBy": "",
            "commentText": "",
            "commentDate": "",
          }
        ],
        "status": "true"
      }
  
      this.commonService.addToST('comment', commentdata)?.subscribe((res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          this.getCommentsList();
          this.formBuild();
          this.submitted = false;
          this.modalService.dismissAll();
        }
      }, error => {
        this.notification.create(
          'error',
          error?.error?.error?.message,
          ''
        );
      });
    }
  }
  onClose() {
    this.router.navigate(['/batch/list']);
  }
  close() {
    this.modalService.dismissAll();
    this.formBuild();
  }
  delete(deleteagentAdvice, id) {
    this.modalService
      .open(deleteagentAdvice, {
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
            let data = 'comment/'+id
            this.commonService.deleteST(data)?.subscribe((res: any) => {
              this.getCommentsList()
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  addNewlines(str) {
    if (str) {
      var result = '';
      var newStr = str?.replace(/(.{200})/g, "prefix- $1 -postfix\n")
      while (str?.length > 0) {
        result += str.substring(0, 200) + '\n';
        str = str.substring(200);
      }
      return newStr;
    }
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

  principalOptions = [];

  onPrincipalInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.principalOptions = [];
    if (this.userList.length > 0) {
      this.userList.map(principal => {
        if (value && (principal.userEmail || principal.userEmail.toLowerCase()) && principal.userEmail.toLowerCase().includes(value.toLowerCase())) {
          this.principalOptions.push({ label: principal.userEmail, value: principal })
        }
      })
    }

  }



}
