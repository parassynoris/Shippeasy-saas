import { Component, OnInit } from '@angular/core';
import { MastersService } from 'src/app/services/Masters/masters.service';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-pda-list',
  templateUrl: './pda-list.component.html',
  styleUrls: ['./pda-list.component.scss']
})
export class PdaListComponent implements OnInit {

  currentUrl: any;
  urlParam: any;
  Data: any
  pdaData: any
  pdaForm: FormGroup
  pdaId: any;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize:number = 1;

  constructor(private masterService: MastersService,private modalService: NgbModal, private fb: FormBuilder) {
this.pdaForm = this.fb.group({
  pdaTemplateName : new FormControl(),
  description: new FormControl(),
  port: new FormControl(),

})
   }

  ngOnInit(): void {
    this.getPdaList();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
  }

  getPdaList(){
    this.page = 1;
    var parameter = {
      "size": Number(this.size),
      "from": this.page-1,
      "query": {
        "bool": {
          "must": [],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.masterService.pdatemplateList(parameter).subscribe((res:any)=>{
      this.Data = res.hits.hits;
      this.toalLength = res.hits.total.value;
      this.count = res.hits.hits.length;
    })
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.getPdaList()
  }

  getPaginationData(type: any) {
    this.fromSize =   type === 'prev' ? this.fromSize - Number(this.size) : this.count+1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize-1,
      "query": {
        "bool": {
          "must": [
          ],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.masterService.pdatemplateList(parameter).subscribe(data => {
      this.Data = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? data.hits.hits.length :  this.count - data.hits.hits.length : this.count + data.hits.hits.length
    })
  }

  open(content,pda){
    this.pdaId = pda._id
    this.pdaForm.patchValue({
      pdaTemplateName: pda?._source?.pdaTemplateName,
      description: pda?._source?.description,
      port:pda?._source?.port
    })
    
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    }
    )
  }
  onSave() {
    this.pdaForm.reset();
    this.modalService.dismissAll();
    return null;
  }
}
