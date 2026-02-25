import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiSharedService } from '../../api-service/api-shared.service';

@Component({
  selector: 'app-addclause',
  templateUrl: './addclause.component.html',
  styleUrls: ['./addclause.component.css']
})
export class AddclauseComponent implements OnInit , OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  model: NgbDateStruct;
  addClause: FormGroup;
  submitted: boolean;
  serverresponse: any;
  @Output() getList = new EventEmitter<any>()
  @Input() public fromParent;
  @Input() public parentId;
  title: any;
  currentPath: string;
  minDate = environment.validate.minDate
  editMode: boolean = false;
  constructor(private modalService: NgbModal, private route: ActivatedRoute, private formBuilder: FormBuilder,
    private sharedService: ApiSharedService,
    private notification: NzNotificationService,
    private router: Router
  ) {
    //nothing
  }


  ngOnInit(): void {
    this.currentPath = window.location.href.split('?')[0].split('/')[3]
    this.addClause = this.formBuilder.group(
      {
        clauseName: ['', Validators.required],
        EndDate: ['',],
        StartDate: ['',],
        remarks: ['',],
        clauseType: ['General Clause']
      },
    );
    if (this.fromParent !== undefined && this.fromParent !== "") {
      this.editMode = true;
      this.addClause = this.formBuilder.group({
        clauseId: [this.fromParent.clauseId],
        clauseName: [this.fromParent.clauseName],
        EndDate: [this.fromParent.EndDate],
        StartDate: [this.fromParent.StartDate],
        remarks: [this.fromParent.remarks],
        clauseType: ['General Clause']
      });
      this.title = 'Edit'
    } else {
      this.title = 'Add';
    }

  }
  get f() { return this.addClause.controls; }

  onSave() {
    this.modalService.dismissAll();
  }
  SaveClause() {
    this.submitted = true;
    if (this.addClause.valid) {
      let data = this.addClause.value
      let updateData = [{ ...data, parentId: this.parentId,status: true }]
      if (this.fromParent) {
        this.sharedService.updateRecord("master/clause/update", updateData).subscribe((result: any) => {
       
          this.serverresponse = result;
          this.notification.create(
            'success',
            'Update Successfully',
            ''
          );
          this.getList.emit(result);
          this.modalService.dismissAll();
        });
      }
      else {
        this.sharedService.create1("master/clause", updateData).subscribe((result: any) => {
    
          this.serverresponse = result;
          this.notification.create(
            'success',
            'Save Successfully',
            ''
          );

          this.getList.emit(result);
          this.modalService.dismissAll();
        });
      }
    }
    else {
      return false;
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
