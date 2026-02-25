import { Component, EventEmitter, OnInit, Output,Input } from '@angular/core';

@Component({
  selector: 'app-common-dialog-box',
  templateUrl: './common-dialog-box.component.html',
  styleUrls: ['./common-dialog-box.component.css']
})
export class CommonDialogBoxComponent implements OnInit {
@Output() getList = new EventEmitter<any>()
@Input() data ;
  constructor() { }

  ngOnInit(): void {

  }
cancel(){
  this.getList.emit();
}
}
