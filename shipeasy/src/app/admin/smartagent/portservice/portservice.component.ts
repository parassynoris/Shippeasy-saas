import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../principal/api.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-portservice',
  templateUrl: './portservice.component.html',
  styleUrls: ['./portservice.component.css']
})
export class PortserviceComponent implements OnInit {
  AddNewService: FormGroup;
  submitted: boolean;
  portData: any = [];
  fromSize: number = 1;
  toalLength: any;
  size = 10;
  page = 0;
  count = 0;
  agentProfileName: any;
  countryList:any=[];
  baseBody:BaseBody=new BaseBody();
  portList:any;

  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private _apiService: ApiService,private profilesService: ProfilesService,private _sharedService: SharedService) { 
    // do nothing.
  }
  toggleShow(templateA?) {
    this.open(templateA);
  }
cancel(){
  this.modalService.dismissAll();
}
  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'

    })
  }
  ngOnInit(): void {
    this.AddNewService = this.formBuilder.group(
      {
        Country: ['', Validators.required],
        Port: ['', Validators.required],
        Services: ['', Validators.required],
        CargoType: ['', Validators.required],
      });
      this.getCountryList();
  }

  onSelect(){
    this.getPortList();
  }

  getCountryList(){
    this.profilesService.countryList()?.subscribe(data =>{
      this.countryList=data.hits.hits;
    })
  }

  getPortList(){
    this.baseBody=new BaseBody();
    let countryData=this.countryList.filter(x=>x._source.countryISOCode === this.AddNewService.get('Country').value);
    let must = [{
      "match":{
        "country.countryName":countryData[0]._source.countryName
      }
    }];
    this.baseBody.baseBody.query.bool.must=must;
    this._sharedService.portList(this.baseBody.baseBody).subscribe(data =>{
      this.portList=data.hits.hits;
    })
  }

  getPortListData() {
    var parameter = {
      "size": Number(this.size),
      "from": this.page - 1,
      "query": {
        "bool": {
          "must": [],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this._apiService.getList("transaction/portcall?type=portcall", parameter).subscribe((data: any) => {
      this.portData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length;
    });
  }

  get f() { return this.AddNewService.controls; }

  onSave() {
    this.submitted = true;
    this.modalService.dismissAll();
  }


  clear() {
    this.agentProfileName = ''
    this.getPortListData()
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
    this.getPortListData()
  }

  search() {
    let mustArray = [];

    var parameter = {
      "size": Number(this.size),
      "from": 0,
      "query": {
        "bool": {
          "must": mustArray
        }
      }
    }
    this._apiService.getList("transaction/portcall?type=portcall", parameter).subscribe((data: any) => {
      this.portData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.count = data.hits.hits.length
    })
  }

  getPaginationData(type: any) {
    this.fromSize = type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

    var parameter = {
      "size": Number(this.size),
      "from": this.fromSize - 1,
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
    this._apiService.getList("transaction/portcall?type=portcall", parameter).subscribe((data: any) => {
      this.portData = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count = type === 'prev' ? this.toalLength === this.count ? this.count - (this.toalLength % Number(this.size)) : this.count - data.hits.hits.length : this.count + data.hits.hits.length;
    })
  }

}
