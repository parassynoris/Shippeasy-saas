import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { MastersSortPipe } from 'src/app/shared/util/mastersort';

@Component({
  selector: 'app-add-port-master',
  templateUrl: './add-port-master.component.html',
  styleUrls: ['./add-port-master.component.scss']
})
export class AddPortMasterComponent implements OnInit {

    locationForm: FormGroup;
  tenantId: any;
  locationData: any;
  portDataValue: any;
  financeSectorData: any;
  CarrierTypelist: any;
  countryData: any;
  submitted: boolean;
  closeResult: string;
  terminals: any = [];
  berths: any = [];
  editItem: any;
  constructor(
     public modalService: NgbModal, 
     private fb: FormBuilder, 
     private _api: ApiService,
     private notification: NzNotificationService, 
     private cognito : CognitoService,
     private commonfunction: CommonFunctions,
     public commonService : CommonService,
     private sortPipelist: MastersSortPipe,
     public loaderService: LoaderService,
     private router: Router,
     private route: ActivatedRoute,
     
   ) { 
    this.formBuild()
   }

formBuild(){
  this.locationForm = this.fb.group({
    portType:[''],
    portName: ['', [Validators.required]],
    description: ['',[Validators.required]],
    country: ['',[Validators.required]],
    CustEDICode: [],
    financeSECname: [''],
    agentBranch: [],
    isIcd: [true],
    isSez: [true],
    Sectorname: [''],
    Subsectorname: [''],
  });
}
  ngOnInit(): void { 
      this.getSmartAgentList()
      this.getcountryList();
      this.getSystemTypeDropDowns();
      this.getLocation();
      this.getAll() 
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  getLocation() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService
      .getSTList('location',payload)?.subscribe((data) => {
      this.locationData = data.documents;
    });
  }
  getSystemTypeDropDowns() {
    
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory:   {
        "$in": ['portType','financeSector',]
      },
      "status": true
    }
    this.commonService
      .getSTList('systemtype',payload)?.subscribe((res: any) => {

      this.portDataValue = res?.documents?.filter(x => x.typeCategory === "portType");
      this.financeSectorData = res?.documents?.filter(x => x.typeCategory === "financeSector");
      

    });
  }
  getAll() {
    this.loaderService.showcircle();

    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "typeCategory":"carrierType",
      "status": true,
      "typeName": {
        "$in": [
          "Air", "Ocean"
        ]
      }

    }
    if (payload?.size) payload.size = 1000,
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService.getSTList('systemtype', payload)?.subscribe((data) => {
      this.CarrierTypelist = data?.documents?.filter(x => x.typeCategory === "carrierType");

  });
  }
   get f() {
      return this.locationForm.controls;
    }
    getcountryList() {
      let payload = this.commonService.filterList()
      if(payload?.query)payload.query = {
      }
      
      this.commonService.getSTList('country',payload)?.subscribe((res: any) => {
  
        this.countryData = res.documents;
      });
    }
    agentList:any = []
    agentBranchList:any = []
  
    getSmartAgentList() {
      let payload = this.commonService.filterList()
      if(payload?.query)payload.query = {
        "status": true,
      }
      
      this.commonService.getSTList('agent',payload)?.subscribe((data:any) => {
        let agentId = data.documents[0]?.agentId
        this.agentList = data.documents;
        this.getBranchList(agentId)
      });
    }
  
    getBranchList(id) {
      let payload = this.commonService.filterList()
      payload.query = {
        orgId: id,
      }
      
      this.commonService.getSTList('branch',payload)
        .subscribe((data:any) => {
          this.agentBranchList = data.documents;
        });
    }
    

    locationsMasters() {
      this.submitted = true;
      if (this.locationForm.invalid) {
        return;
      }
      let countrylist = this.countryData.filter(x => x.countryId === this.locationForm.get('country').value);
      let terminalData = [];
      this.terminals.map(terminal => {
        let berthdata = [];
        this.berths.map(berth => {
          if (berth.terminalName === terminal.name) {
            berthdata.push({name:berth.name,code:berth.code,eidCode:berth.eidCode},);
          }
        })
        terminalData.push({ ...terminal, berths: berthdata })
      });
  
      let body = {
        "tenantId": this.tenantId,
        "isPort": true,
        "country": {
          "countryId": countrylist[0]?.countryId,
          "countryName": countrylist[0]?.countryName,
        },
      
        "portDetails": {
          "isIcd": this.locationForm.value.isIcd,
          "isSez": this.locationForm.value.isSez,
          "EDICode": this.locationForm.value.EDICode,
          "financeSECname": this.locationForm.value.financeSECname,
          "portCode": this.locationForm.value.portCode,
          "portName": this.locationForm.value.portName,
          "portType": this.locationForm.value.portType,
          "description": this.locationForm.value.description,
          "terminalId": this.locationForm.value.terminalId,
          "CustEDICode": this.locationForm.value.CustEDICode,
          "clauses": this.locationForm.value.clauses,
          "terminalCode": this.locationForm.value.terminalCode,
          "MumcustEDICode": this.locationForm.value.MumcustEDICode,
          "Sectorname": this.locationForm.value.Sectorname,
          "Subsectorname": this.locationForm.value.Subsectorname,
          "Companyname": this.locationForm.value.Companyname,
          "company":"SHIPEASY TANK CONTAINERS",
          "canalDirection": "test",
          "agentBranchId" : this.locationForm.get('agentBranch').value,
          "agentBranch" : this.agentBranchList.filter((x)=> x?.branchId === this.locationForm.get('agentBranch').value)[0]?.branchName,       
          "portTypeName": this.CarrierTypelist.find(systemtype => systemtype?.systemtypeId === this.locationForm?.value?.portType)?.typeName,
        },
        "terminals": terminalData,
        "status": true,
      }
      
        this.commonService.addToST('port',body).subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Added Successfully', '');
              this.getList.emit(res);
              this.modalService.dismissAll();
            }
          },
          (error) => {
            this.onSave();
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
     
    }
    @Output() getList = new EventEmitter<any>()
    onSave() { 
      this.getList.emit();
      this.formBuild()
      this.submitted = false;
      this.modalService.dismissAll();
      return null;
    }

    berthName: any;
    terminalName: string;
    isEdit : boolean =false
     openedSubModelReference: NgbModalRef;
    openTerminalModel(content, terminal?: any) {
      this.isEdit = false;
      if (terminal) {
        this.terminalName = terminal.name;
        this.terminalcode=terminal.code;
        this.terminalEIDCode=terminal.eidCode
        this.isEdit = true;
        this.editItem = terminal;
      }
      this.openedSubModelReference = this.modalService.open(content, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'md',
      })
    }
    terminalcode:any
    terminalEIDCode:any
    addTerminal() {
      if (this.terminalName !== '' && this.terminalName !== undefined) {
        if (this.isEdit) {
          let index = this.terminals.indexOf(this.editItem)
          if (index > -1) {
            this.terminals[index] = { ...this.editItem, name: this.terminalName,code: this.terminalcode, eidCode:this.terminalEIDCode };
          }
        } else {
          this.terminals.push({ name: this.terminalName,code: this.terminalcode, eidCode:this.terminalEIDCode, berths: [] });
        }
        this.openedSubModelReference.close()
      }
      this.terminalName = '';
    }
    removeTerminal(deleteTerminal, terminal) {
      this.modalService
        .open(deleteTerminal, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: '',
  
          ariaLabelledBy: 'modal-basic-title',
        })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
            if (result === 'yes') {
              this.terminals = this.terminals.filter(item => item !== terminal)
            }
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
    }
    isViewMode: boolean = false;
    private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
      } else {
        return `with: ${reason}`;
      }
    }
  
    openBerthModal(content, berth?: any) {
      this.isEdit = false;
      if (berth) {
        this.terminalName = berth.terminalName;
        this.berthName = berth.name;
        this.berthCode = berth.code
        this.berthEIDCode = berth.eidCode
        this.isEdit = true;
        this.editItem = berth;
      }
      this.openedSubModelReference = this.modalService.open(content, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'md',
      })
    }
    berthCode:any
    berthEIDCode:any
    addBerth() {
      if (this.berthName !== '' && this.berthName !== undefined && this.terminalName !== '' && this.terminalName !== undefined) {
        if (this.isEdit) {
          let index = this.berths.indexOf(this.editItem)
          if (index > -1) {
            this.berths[index] = { name: this.berthName, terminalName: this.terminalName, code: this.berthCode,eidCode:this.berthEIDCode };
          }
        } else {
          this.berths.push({ name: this.berthName, terminalName: this.terminalName, code: this.berthCode,eidCode:this.berthEIDCode });
        }
        this.openedSubModelReference.close()
      }
      this.terminalName = '';
      this.berthName = '';
    }
    removeBerth(deleteBerth, berth) {
  
      this.modalService
        .open(deleteBerth, {
          backdrop: 'static',
          keyboard: false,
          centered: true,
          size: '',
          ariaLabelledBy: 'modal-basic-title',
        })
        .result.then(
          (result) => {
            this.closeResult = `Closed with: ${result}`;
            if (result === 'yes') {
              this.berths = this.berths.filter(item => item !== berth)
            }
          },
          (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          }
        );
    }
}
