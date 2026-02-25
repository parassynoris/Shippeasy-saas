import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';

@Component({
  selector: 'app-add-pda-costitem',
  templateUrl: './add-pda-costitem.component.html',
  styleUrls: ['./add-pda-costitem.component.scss']
})
export class AddPdaCostitemComponent implements OnInit {

  @Output() pdacostItemForm:FormGroup;
  pdaCostItemIdToUpdate:string;

@Input() pdacost:any;
@Output() setRefreshUserList = new EventEmitter<void>()

  constructor(private fb:FormBuilder,private modalService: NgbModal,private mastersService:MastersService) { 
    // do nothing.
  }

  ngOnInit(): void {

    this.pdacostItemForm=this.fb.group({
      processType: ['', [Validators.required]],
      templateType: ['', [Validators.required]],
      chargeHead: ['', [Validators.required]],
      description: ['', [Validators.required]],
    });

    if(this.pdacost) {
      this.pdaCostItemIdToUpdate = this.pdacost?._source?.pdatemplateId;

    this.pdacostItemForm.patchValue({
      processType: this.pdacost?._source?.userFisrtname,
      templateType: this.pdacost?._source?.userLasttname,
      chargeHead: this.pdacost?._source?.userEmail,
      description: this.pdacost?._source?.userPhone,


   })
  }

  }
  pdaCostItemMasters(){

    if(this.pdacostItemForm.invalid) {
      return;
    }
    let newUser = this.pdacostItemForm.value;

    if(!this.pdaCostItemIdToUpdate) {
      const data = [newUser];
      this.mastersService.createpdatemplate(data).subscribe(res =>{
        this.onSave();
        this.setRefreshUserList.emit();
      });
    } else {
      const upDatedData = {...newUser, pdatemplateId: this.pdaCostItemIdToUpdate}
      const data = [upDatedData];
      this.mastersService.updatepdatemplate(data).subscribe(result =>{
        this.setRefreshUserList.emit();
        this.onSave();
      });
    }
   }

   onSave() {
    this.modalService.dismissAll();
    this.pdaCostItemIdToUpdate = null;
    this.pdacostItemForm.reset();
    return null;
   }

  }


