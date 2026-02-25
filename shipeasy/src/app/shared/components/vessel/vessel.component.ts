import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';


@Component({
  selector: 'app-vessel',
  templateUrl: './vessel.component.html',
  styleUrls: ['./vessel.component.scss']
})
export class VesselComponent implements OnInit {
  currentUrl: any;
  urlParam: any;

  vesselData=[];
  vesselIdToUpdate:string;
  vesselForm:FormGroup;
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  closeResult:string
  fromSize:number = 1;
  submitted:any=false;
  vessel_id: any;
  vessel_name: any;
  vessel_type: any;
  vessel_flag: any;
  vessel_category: any;
  status: any;
  vessel_sub_type: any;

  constructor(private router: Router,private fb: FormBuilder, private modalService: NgbModal, private route: ActivatedRoute,private mastersService:MastersService,private notification: NzNotificationService,) {
    this.mastersService = mastersService;
    this.fb = fb;
    this.modalService = modalService;
    this.route = route;
    this.router = router
    this.notification = notification;

    this.route.params.subscribe(params =>
      this.urlParam = params
    );
  }
  onOpenVessel(){
    this.router.navigate(['/master/' + this.urlParam.key + '/add']);
  }

  onCloseNew(){
    this.router.navigate(['/master/' + this.urlParam.key]);
  }

  onEdit(id){
    this.router.navigate(['/master/' + this.urlParam.key +'/'+ id + '/edit']);
  }

  ngOnInit(): void {
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    setTimeout(() => {
      this.getVessel();
    }, 500);
    this.vesselForm = this.fb.group({
      vesselId: ['', [Validators.required]],
      vesselName:['', [Validators.required]],
      type: ['', [Validators.required]],
      vesselFlag: ['', [Validators.required]],
      category: ['', [Validators.required]],
      isActive: ['', [Validators.required]],
      subtype: ['', [Validators.required]],

    })
  }
  get f() { return this.vesselForm.controls; }

  getVessel(){
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
    this.mastersService.vesselList(parameter).subscribe(data =>{
      this.vesselData=data.hits.hits;
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
    this.getVessel()
  }

  getPaginationData(type: any) {
    this.fromSize =   type === 'prev' ? this.fromSize - Number(this.size) : this.count+1;
    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize -1,
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
    this.mastersService.vesselList(parameter).subscribe(data => {
      this.vesselData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? data.hits.hits.length :  this.count - data.hits.hits.length : this.count + data.hits.hits.length
    })
  }

  search() {
    let mustArray = [];
    if (this.vessel_id) {
      mustArray.push({
        "match": {
          "vesselId": this.vessel_id,
        }
      })
    }
    if (this.vessel_name) {
      mustArray.push({
        "match": {
          "vesselName": this.vessel_name,
        }
      })
    }
    if (this.vessel_type) {
      mustArray.push({
        "match": {
          "type": this.vessel_type,
        }
      })
    }
    if (this.vessel_flag) {
      mustArray.push({
        "match": {
          "vesselFlag": this.vessel_flag,
        }
      })
    }
    if (this.vessel_category) {
      mustArray.push({
        "match": {
          "category": this.vessel_category,
        }
      })
    }
    if (this.status) {
      mustArray.push({
        "match": {
          "isActive": this.status,
        }
      })
    }
    if (this.vessel_sub_type) {
      mustArray.push({
        "match": {
          "subtype": this.vessel_sub_type,
        }
      })
    }

    var parameter = {
      "size": Number(this.size),
      "from": 0,
      "query": {
        "bool": {
          "must": mustArray
        }
      }
    }
    this.mastersService.vesselList(parameter).subscribe((data) => {
      this.vesselData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length
    })
  }

  clear() {
    this.vessel_id = '';
    this.vessel_name = '';
    this.vessel_type = '';
    this.vessel_flag = '';
    this.vessel_category = '';
    this.status = '';
    this.vessel_sub_type = '';
    this.getVessel()
  }

  open(content, vessel?: any) {

    if(vessel) {
      this.vesselIdToUpdate = vessel?._source?.vesselId;
      this.vesselForm.patchValue({
        vesselName:vessel._source?.vesselName,
        type:vessel._source?.vesselType,
        vesselFlag:vessel._source?.vesselFlag,
        category:vessel._source?.generalDetails?.category,
        isActive:vessel._source?.status,
        subtype:vessel._source?.vesselSubType?.vesselSubTypeName,

      })
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    }
    )
  }

  vesselMasters(){

    this.submitted=true
    let newCostItems = this.vesselForm.value;

      const dataWithUpdateID = {...newCostItems, vesselId: this.vesselIdToUpdate  }
      const data = [dataWithUpdateID];
      this.mastersService.updateVessel(data).subscribe(() =>{
        this.getVessel();
        this.onSave();
      });

  }
  delete(deletevessel, id) {
    this.modalService.open(deletevessel, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
     size: '',

      ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {

        this.closeResult = `Closed with: ${result}`;
        if (result === 'yes') {
        let data = {
          vesselId: id._source.vesselId,
          searchKey: "vesselId"
        }
        const body = [data]

        this.mastersService.deleteVessel(body).subscribe((res:any)=>{
          if (res) {
            this.notification.create(
              'success',
              'Deleted Successfully',
              ''
            );
            this.getVessel();
          }
        })

        }
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });

  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  onSave() {
    this.vesselIdToUpdate = null;
    this.vesselForm.reset();
    this.submitted=false
    this.modalService.dismissAll();
    return null;
  }


}
