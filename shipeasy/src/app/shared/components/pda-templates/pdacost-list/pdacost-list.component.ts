import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';

@Component({
  selector: 'app-pdacost-list',
  templateUrl: './pdacost-list.component.html',
  styleUrls: ['./pdacost-list.component.scss']
})
export class PdacostListComponent implements OnInit {

  currentUrl: any;
  urlParam: any;
  pdacostData:any=[];
  @Input() pdacostItemForm;
  getUser: any;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize:number = 1;

  constructor(private modalService: NgbModal,private mastersService:MastersService) {
    // do nothing.
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
    this.mastersService.pdatemplateList(parameter)?.subscribe(data =>{
      this.pdacostData=data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
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
    this.fromSize = 1;
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
    this.mastersService.pdatemplateList(parameter).subscribe(data => {
      this.pdacostData=data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? data.hits.hits.length :  this.count - data.hits.hits.length : this.count + data.hits.hits.length
    })
  }

  open(content, pdacost?:any) {
    this.getUser= pdacost;

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

    this.modalService.dismissAll();
  }

}
