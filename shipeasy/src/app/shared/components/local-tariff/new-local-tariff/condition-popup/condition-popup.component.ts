import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-condition-popup',
  templateUrl: './condition-popup.component.html',
  styleUrls: ['./condition-popup.component.scss']
})
export class ConditionPopupComponent  {
  addRuleForm:FormGroup
  variableList:any=[
    {
      name:'--Select--',
      value:''
    },
    {
      name:'Principal',
      value:'principal'
    },
    {
      name:'FPD',
      value:'fpd'
    },
  ]

  condtionList:any=[
    {
      name:'--Select--',
      value:''
    },
    {
      name:'=',
      value:'='
    },
   
  ]

  constructor( private fb: FormBuilder,   private modalService: NgbModal,) { 
    this.addRuleForm = this.fb.group({
      variableDetails:new FormArray([]),
    })
  }

  get variable() {
    return this.addRuleForm.get('variableDetails') as FormArray
  }
  getVariablearray(){
    return (this.addRuleForm.get('variableDetails') as FormArray).controls
  }
  addNewVariable(){
    this.variable.push(this.addVAriable(''))
  }
  addVAriable(res?){
    return this.fb.group({
      variable:[res? res.variable:''],
      condition:[res? res.variable:''],
      value:[res? res.variable:'']
    })
  }
  onCancle(){
    this.modalService.dismissAll()
  }
  addRow(){
    
  }
}
