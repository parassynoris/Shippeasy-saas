import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { SystemType } from 'src/app/models/system-type';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-addsystemtype',
  templateUrl: './addsystemtype.component.html',
  styleUrls: ['./addsystemtype.component.scss'],
})
export class AddsystemtypeComponent implements OnInit {
  @Output() addSystemTypeForm: FormGroup;
  @Output() event = new EventEmitter();
  systemIdToUpdate: string;
  submitted: boolean = false;
  @Input() user: any;
  @Input() isPopup: any;
  @Output() getList = new EventEmitter<any>()
  updatedData: any;
  categoryData: any = ['ShipmentTypeLand','blStatus','Activity','igmcfsType','sendingType','cfsstatus','igmType','DOType','igmThrougeType','ULDcontainerType','vesselLineup','vehicleType','truckType','wagonType','bookingStatus','imcoClass','customClearance','freightType','notificationsettings','blSubType','movementTYpe','destuffingType','loadType','chargeType','taxType','hsnType','status','paymentMode','processType','gstRate','customerType','cargoStatus','documentType','agentBranch','custAccType','freightChargeTerm', 'containerOperator','packingGroup', 'haulageType', 'chargeHeader', 'batchType', 'incoTerm', 'contract', 'customer', 'clauseType', 'vesselType', 'vesselCategory', 'cargoType', 'enquiryType', 'vesselCall', 'vesselPurpose', 'processPoint', 'shippingTerm', 'uomType','portType',
  "ISF", 'tankType', 'moveType', 'tankStatus', 'chargeTerm','ch,argeUnit', 'preCarriage', 'bookingType', 'containerType', 'imoType', 'checklist', 'vesselSubtype', 'invoiceType', 'shipStatus','onCarriage', 'picType', 'blType', 'paymentTerms', 'tdsRemark','financeSector',
  'itemType','departureMode','department','ruleType','containerStatus','taxApplicability','gstInvoiceType','gstr','vesselDimension','chargeBasis','reportType','IGMTestorProduction','EGMTestorProduction','fillingType','entryType','transit','packageType','dimensionUnit','shipmentType','palletType', 'pipeline','pipeline','carrierType',
  'ImportShipmentType','ImportShipmentTypeAir','ExportShipmentType','ExportShipmentTypeAir','wareHouse','wareHouseDataEntry'];
  processPointList: SystemType[];
  tenantId: string;
  constructor(
    private commonService : CommonService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private cognito : CognitoService,
    private notification: NzNotificationService,
    private commonfunction: CommonFunctions
  ) {
    this.commonService = commonService;
    this.fb = fb;
    this.modalService = modalService;
    this.cognito = cognito;
    this.notification = notification
    this.categoryData = this.categoryData.sort(function (a, b) {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    })
  }

  ngOnInit(): void {
    this.getCategoryData();
    this.addSystemTypeForm = this.fb.group({
      typeName: ['', [Validators.required]],
      typeCategory: [this.isPopup ? 'documentType': '', [Validators.required]],
      typeDescription: [''],
      typeActive: [true],
      typeRef: [''],
      typeRefId: [''],
      typeParentType: [''],
      status: [true],
    });
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    if (this.user) {
      this.systemIdToUpdate = this.user?.systemtypeId;

      this.addSystemTypeForm.patchValue({
        typeName: this.user?.typeName,
        typeCategory: this.user?.typeCategory,
        typeDescription: this.user?.typeDescription,
        typeActive: this.user?.typeActive,
        typeParentType: this.user?.typeParentType,
        typeRefId: this.user?.typeRefId,
        typeRef: this.user?.typeRef,
        module: this.user?.module,
        status: this.user?.status || false,
      });
    }
  }
  get f() {
    return this.addSystemTypeForm.controls;
  }

  getCategoryData() {


    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      "typeCategory": "processType"
    }
    
    this.commonService.getSTList('systemtype',payload)?.subscribe((res: any) => {

      this.processPointList = res.documents

    })

  }
  systemType() {
    this.submitted = true;
    if (this.addSystemTypeForm.invalid) {
      return;
    }
    let newsystemType = {
      tenantId: this.tenantId,
      typeName: this.addSystemTypeForm.value.typeName,
      typeDescription: this.addSystemTypeForm.value.typeDescription,
      typeActive: this.addSystemTypeForm.value.typeActive,
      typeCategory: this.addSystemTypeForm.value.typeCategory,
      typeParentType: this.addSystemTypeForm.value.typeParentType,
      typeRefId: this.addSystemTypeForm.value.typeRefId,
      typeRef: this.addSystemTypeForm.value.typeRef,
      // processType : this.processPointList.filter((x)=>x?.systemtypeId === this.addSystemTypeForm.value.typeRef)[0]?.typeName?.toLowerCase() ,
      status: this.addSystemTypeForm.value.status || false,
      "orgId" : this.commonfunction.isSuperAdmin() ? '1' : this.commonfunction.getAgentDetails()?.orgId,
    };

    if (!this.systemIdToUpdate) {
      this.commonService.addToST('systemtype',newsystemType).subscribe((res: any) => {
        if (res) {
          this.notification.create(
            'success',
            'Added Successfully',
            ''
          );
          if(this.isPopup){
            this.getList.emit(res); 
          }else{
            setTimeout(() => {
              this.event.emit(res);
              this.onSave();
            }, 1000);
          }
         
       
        }
      }, error => {
        console.log(error)
        this.onSave();
        this.notification.create('error', error?.error?.error?.message , '');
      });
    } else {
      const dataWithUpdateId = {
        ...newsystemType,
        systemtypeId: this.systemIdToUpdate,
      };
      this.commonService.UpdateToST(`systemtype/${dataWithUpdateId.systemtypeId}`,dataWithUpdateId).subscribe((result: any) => {
        if (result) {
          this.notification.create(
            'success',
            'Updated Successfully',
            ''
          );
          setTimeout(() => {
            this.event.emit(result);
            this.onSave();
          }, 1000);
        }
      }, error => {
        this.onSave();
        this.notification.create('error', error?.error?.error?.message , '');
      });
    }
  }
 
  onSave() {
    this.systemIdToUpdate = null;
    this.addSystemTypeForm.reset();
    this.addSystemTypeForm.controls['typeActive'].setValue(true);
    this.addSystemTypeForm.controls['status'].setValue(true);
    this.submitted = false
    if(this.isPopup){
      this.getList.emit(); 
    }else{
      this.modalService.dismissAll();
    } 
    return null;
  }

}


