import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationModalComponent } from './confirmation-modal.component';

@Component({
  selector: 'app-logoutmessage',
  templateUrl: './logoutmessage.component.html',
  styleUrls: ['./logoutmessage.component.css']
})
export class LogoutmessageComponent {

  constructor( private dialogRef : MatDialogRef<ConfirmationModalComponent>,@Inject(MAT_DIALOG_DATA) public data) { }

  closeConfirmDialog(){
   
    this.dialogRef.close({userChoice:true})

  }
}
