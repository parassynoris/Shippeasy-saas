import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { REGEX } from '../services/common/constants/REGEX';
import { CONFIRMATION_MODAL_PARAMS, CONFIRMATION_MODAL_RESPONSE } from '../services/common/constants/GlobalConstants';
import { CommonService } from '../services/common/common.service';




@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.css']
})
export class ConfirmationModalComponent implements OnInit {
  confirmForm:FormGroup;
  regex = REGEX
  constructor(@Inject(MAT_DIALOG_DATA) public data: CONFIRMATION_MODAL_PARAMS,
  private fb : FormBuilder,
  private commonService : CommonService,
  private dialogRef : MatDialogRef<ConfirmationModalComponent>) {
    this.confirmForm = this.fb.group({
      // remarksEntered : new FormControl('',Validators.compose([Validators.required, Validators.pattern(`^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$`)]))
      remarksEntered : new FormControl('',Validators.compose([Validators.required]))
    })
  }

  ngOnInit(): void {    
  }
  getFormFieldErrorMessage(formGroup:string, formControlName:string){
    const fg : FormGroup = this[formGroup]
    return this.commonService.getFormFieldErrorMessage(fg, formControlName)
  }
  closeConfirmDialog(userChoice : boolean){
    if(this.data.statusUpdateModal && this.confirmForm.invalid && userChoice){
      this.confirmForm.controls['remarksEntered'].markAsTouched({ onlySelf: true })
      return
    }
    let returnObject:CONFIRMATION_MODAL_RESPONSE = {
      userChoice : userChoice,
      remarksEntered : this.confirmForm.controls['remarksEntered'].value || ''
    }
    this.dialogRef.close({...returnObject})
    this.confirmForm.reset()
  }
}
