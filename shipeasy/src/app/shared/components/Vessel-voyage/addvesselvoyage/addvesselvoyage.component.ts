import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProfilesService } from "src/app/services/Profiles/profile.service";
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { Vessel } from 'src/app/models/vessel-master';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { partymaster } from 'src/app/models/addvesselvoyage';
import { Currency } from 'src/app/models/cost-items';

@Component({
  selector: 'app-addvesselvoyage',
  templateUrl: './addvesselvoyage.component.html',
  styleUrls: ['./addvesselvoyage.component.scss']
})
export class AddVesselVoyageComponent implements OnInit {
  @Input() public fromParent;
  @Input() public voyageType;
  @Input() isDeptType: any;
  @Input() isType: any;
  @Output() getList = new EventEmitter<any>()
  isData: any;
  addVesselVoyage: FormGroup;
  submitted: any = false;
  vesselMaster:Vessel [] = [];
  portData: PortDetails[] = [];
  partyMasterList: partymaster[] = [];
  currencyData: Currency [] = [];
  shippinglineData = [];
  size = 10;
  page = 1;
  tenantId: any;
  constructor(private modalService: NgbModal, private route: ActivatedRoute, private fb: FormBuilder, private notification: NzNotificationService, private profilesService: ProfilesService,
    private mastersService: MastersService,
    private saMasterService: SaMasterService,private cognito : CognitoService,
    public apiService: ApiSharedService,private commonfunction: CommonFunctions,
    private sortPipe: OrderByPipe,
    public CommonService : CommonService
  ) {
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  disabledStartDate = (startValue: Date): boolean => {
    if (!startValue || !this.addVesselVoyage.controls.etd.value) {
      return false;
    }
    let startTime = new Date(this.addVesselVoyage.controls.etd.value);
    let starttimeValue = new Date(startValue)
    return starttimeValue >= startTime;
  };

  disabledEndDate = (endValue: Date): boolean => {
    if (!endValue || !this.addVesselVoyage.controls.eta.value) {
      return false;
    }
    let endTime = new Date(this.addVesselVoyage.controls.eta.value);
    let endtimeValue = new Date(endValue)
    return endtimeValue <= endTime;
  };

  disabledStartDate1 = (startValue1: Date): boolean => {
    if (!startValue1 || !this.addVesselVoyage.controls.atd.value) {
      return false;
    }
    let startTime = new Date(this.addVesselVoyage.controls.atd.value);
    let starttimeValue = new Date(startValue1)
    return starttimeValue >= startTime;
  };
  disabledEndDate1 = (endValue1: Date): boolean => {
    if (!endValue1 || !this.addVesselVoyage.controls.ata.value) {
      return false;
    }
    let endTime = new Date(this.addVesselVoyage.controls.ata.value);
    let endtimeValue = new Date(endValue1)
    return endtimeValue <= endTime;
  };
  disabledSiCuttoff = (startValue: Date): boolean => {
    if (!startValue || !this.addVesselVoyage.controls.siCutOffDate.value) {
      return false;
    }
    let endSiCutt = new Date(this.addVesselVoyage.controls.siCutOffDate.value);
    let endSiCuttValue = new Date();
    return endSiCuttValue > endSiCutt;
  };

  setFormArray(data) {
    if (data) {
      this.addVesselVoyage = this.fb.group(
        {
          vesselId: data.vesselId || '',
          port: data.portId || '',
          voyageNumber: data.voyageNumber || '',
          terminal_name: data.terminal_name || '',
          eta: data.voyageStartDate || '' || '',
          etd: data.voyageEndDate || '',
          ata: data.ata || '',
          atd: data.atd || '',
          pc_number: data.pc_number,
          pc_date: data.pc_date || '',
          siCutOffDate: data.siCutOffDate || '',
          status: data.status || '',

          rotation: data.rotation || '',
          viaNo: data.viaNo || '',
          igmNo: data.igmNo || '',
          igmDate: data.igmDate || '',
          egmNo: data.egmNo || '',
          egmDate: data.egmDate || '',


          voyage: this.fb.array(data?.voyage?.map(res =>
            this.fb.group({
              shipping_line: [res.shipping_line,Validators.required],
              voyage_number: [res.voyage_number,Validators.required],
              exchageRate: [Number(res.exchageRate || res.exchage_rate)],
              currency: [res.currency],
            })
          ))
        },
      );
    }
  }

  addVoyage() {
    const voyageForm = this.fb.group({
      shipping_line: ['',Validators.required],
      voyage_number: ['',Validators.required],
      // exchage_rate: [''],
      exchageRate: [''],
      currency: [''],
    });
    this.voyage.push(voyageForm);
  }

  deleteVoyage(vIndex: number) {
    this.voyage.removeAt(vIndex);
  }

  get voyage() {
    return this.addVesselVoyage.controls["voyage"] as FormArray;
  }

  ngOnInit(): void {
    this.addVesselVoyage = this.fb.group(
      {
        vesselId: ['', [Validators.required]],
        voyageNumber: ['', [Validators.required]],
        port: [''],
        terminal_name: [''],
        eta: ['', [Validators.required]],
        etd: ['', [Validators.required]],
        ata: [''],
        atd: [''],
        pc_number: [],
        pc_date: [''],
        siCutOffDate: ['', [Validators.required]],
        status: [true],

        rotation:  [''],
        viaNo:  [''],
        igmNo:  [''],
        igmDate: [''],
        egmNo:  [''],
        egmDate:  [''],

        voyage: this.fb.array([])
      },
    );

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    this.getShiipingLine();
    this.getVesselMaster();
    this.getPortMaster();
    this.getPartyList();
    this.getCurrencyList();
    this.isData = this.fromParent;
    if (this.isData) {
      this.setFormArray(this.isData);
    } else {
      this.addVoyage()
    }
    if (this.isType === 'show') {
      this.addVesselVoyage.disable();
    }

  }
  get f() { return this.addVesselVoyage.controls; }
  changeDate(e) {
    if(!e){return false}
    var event = new Date(e);
    let date = JSON.stringify(event)
    date = date.slice(1, 11)
    return date
  }
  setVoyageNumber(e){
    this.voyage.at(0).patchValue({
      voyage_number:e.target.value
    })
  }
  saveVesselVoyage() {
    this.submitted = true
    if (this.addVesselVoyage.valid) {

      let newdata = {
        vesselId: this.addVesselVoyage.get('vesselId').value,
        vesselName: this.vesselMaster.filter(x => x.vesselId === this.addVesselVoyage.controls.vesselId.value)[0]?.vesselName,
        portId: this.addVesselVoyage.get('port').value ? this.addVesselVoyage.get('port').value : String,
        portName: this.portData.filter(x => x.portId === this.addVesselVoyage.get('port').value)[0]?.portDetails?.portName,
        voyageNumber: this.addVesselVoyage.get('voyageNumber').value ? this.addVesselVoyage.get('voyageNumber').value.toString() : String,
        terminal_name: this.addVesselVoyage.get('terminal_name').value,
        voyageStartDate: this.addVesselVoyage.get('eta').value,
        voyageEndDate: this.addVesselVoyage.get('etd').value,
        ata: this.addVesselVoyage.get('ata').value,
        atd: this.addVesselVoyage.get('atd').value,
        pcNumber:this.addVesselVoyage.get('pc_number').value?.toString(),
        pc_date: this.addVesselVoyage.get('pc_date').value,
        siCutOffDate: this.addVesselVoyage.get('siCutOffDate').value,
        rotation: this.addVesselVoyage.get('rotation').value,
        viaNo: this.addVesselVoyage.get('viaNo').value,
        igmNo: this.addVesselVoyage.get('igmNo').value,
        igmDate:this.changeDate(this.addVesselVoyage.get('igmDate').value) || new Date(),
        egmNo: this.addVesselVoyage.get('egmNo').value,
        egmDate: this.changeDate(this.addVesselVoyage.get('egmDate').value) || '',
        status: this.addVesselVoyage.get('status').value,
        orgId: "",
        "tenantId": this.tenantId,
        isActive: true,
        isVoyageImport : this.voyageType === 'import' ? true : false ,
        voyage: this.addVesselVoyage.get('voyage').value
      }
      let newVoyage = newdata;
    
      if (!this.isData) {
        const data = [newVoyage];
        this.CommonService.addToST('voyage',newVoyage).subscribe((result) => {
          if (result) {

            setTimeout(() => {
              this.notification.create(
                'success',
                'Saved Successfully',
                ''
              );
              this.modalService.dismissAll();
              this.getList.emit(result);
            }, 1000);

          }
        }, error => {
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
      } else {
        const dataWithUpdateId = { ...newVoyage, voyageId: this.isData.voyageId };
        const data = [dataWithUpdateId];
        this.CommonService.UpdateToST(`voyage/${dataWithUpdateId.voyageId}`,dataWithUpdateId).subscribe((res) => {
          if (res) {
            setTimeout(() => {
              this.notification.create(
                'success',
                'Updated Successfully',
                ''
              );
              this.modalService.dismissAll();
              this.getList.emit(res);
            }, 1000);
          }
        });
      }
    }
  }
  setExchange(e, i) {
    let exChangeRate = this.currencyData.filter((x) => x?.currencyId === e)[0]?.currencyPair
    // this.addVesselVoyage.controls.voyage['controls'][i].controls.exchage_rate.setValue(exChangeRate|| 0)
    this.addVesselVoyage.controls.voyage['controls'][i].controls.exchageRate.setValue(exChangeRate|| 0)
  }
  getVesselMaster() {

    let payload = this.CommonService?.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    
    this.CommonService?.getSTList('vessel',payload).subscribe((res: any) => {
      this.vesselMaster = res.documents;

    });

  }

  getPortMaster() {
    let payload = this.CommonService?.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    
    this.CommonService?.getSTList('port',payload).subscribe((res: any) => {
      this.portData = res.documents;

    });
  }
  getShiipingLine() {
    let payload = this.CommonService?.filterList() 
      if(payload?.query)payload.query = {
        "status": true,
        "$and": [
          {
            "feeder": {
              "$ne": true,
            }
          }
        ]
      }
    
    
    
    this.CommonService?.getSTList('shippingline',payload).subscribe((data) => {
      this.shippinglineData = data.documents;
    });
    
  }



  getPartyList() {
    let payload = this.CommonService?.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    
    this.CommonService?.getSTList('partymaster',payload).subscribe((data) => {
      this.partyMasterList = data.documents;
    });
  }

  getCurrencyList() {
    let payload = this.CommonService?.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    
    this.CommonService?.getSTList('currency',payload).subscribe((res: any) => {
      this.currencyData = res.documents;
    })
  }

  onClose() {
    this.modalService.dismissAll();
  }

}
