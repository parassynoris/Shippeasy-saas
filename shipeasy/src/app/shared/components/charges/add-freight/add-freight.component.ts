import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-add-freight',
  templateUrl: './add-freight.component.html',
  styleUrls: ['./add-freight.component.scss']
})
export class AddFreightComponent  {

  @Input() isTypeForm: any = 'add';
  @Input() isshowDetails1: boolean = false;
  @Output() CloseNew = new EventEmitter<string>();
  @Input() isshowDetails: boolean = false;
  newenquiryForm: FormGroup;
  submitted = false;

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private notification: NzNotificationService) {
    this.newenquiryForm = this.formBuilder.group({
      charge_group: ['', Validators.required],
      charge_name: ['', Validators.required],
      charge_term: ['', Validators.required],
      currency: ['', Validators.required],
    });
  }
  get f() { return this.newenquiryForm.controls; }

  onSave() {
    this.submitted = true;
  }
  onClose(evt) {
    this.CloseNew.emit(evt);
  }


}
