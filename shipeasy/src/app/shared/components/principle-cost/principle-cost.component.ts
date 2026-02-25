import { Component, Input, OnInit } from '@angular/core';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddcostitemComponent } from './addcostitem/addcostitem.component';

@Component({
  selector: 'app-principle-cost',
  templateUrl: './principle-cost.component.html',
  styleUrls: ['./principle-cost.component.scss']
})
export class PrincipleCostComponent implements OnInit {

  toalLength: any =100;
  count = 0;
  size = 10;
  page = 1;
  fromSize: number = 1;
  costItemList : any = [];
  costHead : any;
  costItemName : any;
  costItemMapName : any;
  costHeadMapName : any;
  status : any;
  @Input() prentPath: any;
  constructor(private profilesService:ProfilesService,private modalService: NgbModal) {
    // do nothing.
   }

  ngOnInit(): void {
    this.getCostItemList();
  }
  getCostItemList() {
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    let must = [{
      "match": {
        "orgId": agentId
      }
    }];
    var parameter = {
      "size": Number(this.size),
      "from": this.page - 1,
      "query": {
        "bool": {
          "must":must,            
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.profilesService.getCostItemList(parameter).subscribe((data) => {
      this.costItemList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  
  clear() {
    this.costHead = ''
    this.costItemName = ''
    this.costItemMapName = ''
    this.costHeadMapName = '';
    this.status = '';
    this.getCostItemList()
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next')
    }
  }

  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev')
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getCostItemList()
  }

  search() {
    let mustArray = [];
    if (this.costHead) {
      mustArray.push({
        "match": {
          "costHead": this.costHead,
        }
      })
    }
    if (this.costItemName) {
      mustArray.push({
        "match": {
          "costItemName": this.costItemName,
        }
      })
    }
    if (this.costItemMapName) {
      mustArray.push({
        "match": {
          "costItemMapName": this.costItemMapName,
        }
      })
    }
    if (this.costHeadMapName) {
      mustArray.push({
        "match": {
          "costHeadMapName": this.costHeadMapName,
        }
      })
    }
    if (this.status) {
      mustArray.push({
        "match": {
          "status": this.status,
        }
      })
    }
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    mustArray.push({
      "match": {
        "orgId": agentId
      }
    })
    var parameter = {
      "size": Number(this.size),
      "from": 0,
      "query": {
        "bool": {
          "must": mustArray
        }
      }
    }
    this.profilesService.getCostItemList(parameter).subscribe((data) => {
      this.costItemList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var agentId = this.profilesService.getCurrentAgentDetails()?.agentId;
    let must = [{
      "match": {
        "orgId": agentId
      }
    }];
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
      "query": {
        "bool": {
          "must": must,
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.profilesService.getCostItemList(parameter).subscribe(data => {
      this.costItemList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? data.hits.hits.length : this.count - data.hits.hits.length : this.count + data.hits.hits.length
    })
  }

  open(content: any = null, guid: any = null) {
    const modalRef = this.modalService?.open(AddcostitemComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
    modalRef.componentInstance.fromParent = guid;
    modalRef.componentInstance.prentPath = this.prentPath;
    modalRef.componentInstance.isAddModeData = content;
  }
  onEdit(content, guid: any) {
    this.open(content, guid);
  }

}
