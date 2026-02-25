import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { shared } from '../../../../data';


@Component({
  selector: 'app-addnewtemplate',
  templateUrl: './addnewtemplate.component.html',
  styleUrls: ['./addnewtemplate.component.scss']
})
export class AddnewtemplateComponent {
  @Output() CloseAction = new EventEmitter();
  addNewTemplate: FormGroup;  
  submitted = false;
  newpdatemplateDatas = shared.newpdatemplateData;

  constructor(private router: Router, private formBuilder: FormBuilder, private notification: NzNotificationService) {
    this.addNewTemplate = this.formBuilder.group({
      template_name: ['', Validators.required],
      process_type: ['', Validators.required],  
      Template_type: ['', Validators.required], 
      activity_type: ['', Validators.required], 
      activity_name: ['', Validators.required],          
    });   
  }

  onClose(evt){
    this.CloseAction.emit(evt);
  }
  get f() { return this.addNewTemplate.controls; } 
  onSave() {
    this.submitted = true; 
       
  }
  onSaves() {
    this.submitted = true;  
  }
  

}
