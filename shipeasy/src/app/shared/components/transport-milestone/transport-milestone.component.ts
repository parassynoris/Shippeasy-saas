import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-transport-milestone',
  templateUrl: './transport-milestone.component.html',
  styleUrls: ['./transport-milestone.component.scss']
})
export class TransportMilestoneComponent implements OnInit {
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  addDriverForm: FormGroup;
  displayedColumns = [
    '#',
    'milestoneEvent',
    'milestoneDate',
    'updateBy',
  ];
  currentLogin: any;
  getCognitoUserDetail: any;
  show: any;
  modalReference: NgbModalRef;
  batchId: any;
  isTransport: boolean = false;
  constructor(private router: Router,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private commonfunction: CommonFunctions,
    private commonService: CommonService,
    private cognito: CognitoService) {
      this.batchId = this.route.snapshot.params['id'];
    this.formBuild()
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.currentLogin = this.commonfunction.getUserType1()
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData
      }
    })

  }

  formBuild() {
    this.addDriverForm = this.formBuilder.group({
      milestoneEvent: ['', Validators.required],
      milestoneDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getMilstone()
  }
  getMilstone(){ 
      let payload = this.commonService.filterList()
      if(payload)payload.query = {
        'batchId': this.batchId
      }
 
      this.commonService.getSTList('transportmilestone', payload)
        ?.subscribe((data: any) => { 
          this.dataSource = new MatTableDataSource(
            data?.documents?.map((s: any, index) => {
              return {
                ...s,
                id: index + 1
              }
            }));
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort1; 
        });
  }
  open(content, data?: any, show?) {
    // this.batchIdToUpdate = false;
    this.show = show
    if (data) {
      // this.batchIdToUpdate = true;
      this.addDriverForm.patchValue({
        milestoneEvent: data?.milestoneEvent,
        milestoneDate: data?.milestoneDate
      });
      this.show === 'show' ? this.addDriverForm.disable() : this.addDriverForm.enable()
    } else {
      // this.batchIdToUpdate = false
    }

    this.modalReference = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    });
  }
  get f1() {
    return this.addDriverForm.controls;
  }
  onCancel() {
    this.modalService.dismissAll();
    this.addDriverForm.reset()
    this.submitted = false
    this.getMilstone()
  }
  submitted: boolean = false;
  todayDate = new Date()
  disabledDate = (current: Date): boolean => {
    const yesterdayDate = new Date(this.todayDate);
    yesterdayDate.setDate(this.todayDate.getDate() - 1);
    return current && current < yesterdayDate;
  };

  onSave() {
    this.submitted = true
    if (this.addDriverForm.invalid) {
      this.notification.create(
        'error',
        'Form invalid..!',
        ''
      ); 
    }
    else {
      this.submitted = false
      
      let payload ={
        batchId: this.batchId,
        ...this.addDriverForm.value,
        orgId: this.commonfunction.getAgentDetails().orgId
      }

      this.commonService.addToST('transportmilestone', payload).subscribe((data: any) => { 
        if (data) { 
          this.notification.create('success', 'Saved Successfully', '');  
          this.onCancel()
        }
      }, (error) => { 
        this.onCancel()
        this.notification.create('error', error?.error?.error?.message, '');
      })
    }
  }
}
