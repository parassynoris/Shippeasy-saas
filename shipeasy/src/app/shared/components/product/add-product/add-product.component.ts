import { Component, Output, OnInit, EventEmitter, Input } from '@angular/core';
import { FormBuilder,FormGroup,Validators,} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { Location } from '@angular/common';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from '../../../../services/common/common.service';
import { BaseBody } from '../../gl-bank/base-body';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { Currency, SystemType } from 'src/app/models/cost-items';
import { partymaster } from 'src/app/models/addvesselvoyage';
import { Product } from 'src/app/models/addproduct';
import { PartyMasterData } from 'src/app/models/party-master';
@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss'],
})
export class AddProductComponent implements OnInit {
  addProduct: FormGroup;
  submitted = false;
  productIdToUpdate: string;
  portData: PortDetails[] = [];
  @Input() isType: any = 'add';
  @Output() CloseAction = new EventEmitter();
  portDetails: any;
  filterBody: any;
  baseBody: any;
  productList: SystemType []=[];
  currencyData: Currency[] = [];
  partyMasterNameList: partymaster[] = [];
  productID: string = '';
  isEditMode: boolean = false;
  producteditList: Product[] = [];
  documents: PartyMasterData[] = [];
  documentPayload: any;
  tankTypeList: []=[];
  isHaz: boolean = true
  imcoList : SystemType []=[];
  isExport: boolean = false;
  tenantId: any;

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private _api: ApiService,
    private formBuilder: FormBuilder,
    private commonfunction: CommonFunctions,
    private notification: NzNotificationService,
    private mastersService: MastersService,
    private location: Location,private cognito : CognitoService,
    private commonService1: CommonService,
    private profileService: ProfilesService,
    private saMasterService: SaMasterService,
    private apiService: ApiSharedService
  ) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
    this.addProduct = this.formBuilder.group({
    
      productName: ['', Validators.required],
      productType: ['HAZ'],
      customerName: [''],
      imcoClass: [''],
      hazSubclass: [''],
      imdgPage: [''],
      unNumber: [''],
      densityGravity: [''],
      flashPoint: [''],
      psn: [''],
      technicalName: [''],
      packingGroup: [''],
      subRisk: [''],
      marinePollution: [false],
      emsNo: [''],
      emsCode: [''],
      mfagNo: [''],
      hsCode: [''],
      // tankType: [''],
      msdsFile: [''],
      isApproved: [true],
      lineRef: [false],
 

      shippingName: [''],
      imoNo: [''],
      UNDGType: [''],
      reportableQuantity: [''],
      flashpointCelsius: [''],
      flashpointFahrenheit: [''],
      toxinHazard: [false],
      hazardZone: ['ZONE B'],

    });


  }


  getAddressDropDowns() {
    let payload = this.commonService.filterList()
    payload.query = {status: true }
    this.commonService.getSTList('partymaster', payload)
      ?.subscribe((res: any) => {
        this.partyMasterNameList = res?.documents;

      });
  }
  onProductTypeChange(e) {
    if (e === 'HAZ') {
      this.isHaz = true 
      this.addProduct.controls.imcoClass.setValidators([])
      this.addProduct.get('imcoClass').updateValueAndValidity();
     
      this.addProduct.controls.unNumber.setValidators([])
      this.addProduct.get('unNumber').updateValueAndValidity();
    }
    else {
      this.isHaz = false
      this.addProduct.get('imcoClass').clearValidators();
      this.addProduct.get('imcoClass').updateValueAndValidity();
     
      this.addProduct.get('unNumber').clearValidators();
      this.addProduct.get('unNumber').updateValueAndValidity();
    
    }
  }

  uploadDoc(event) {
    let files = event.target.files;
    this.documentPayload = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i], files[i].name);
      formData.append('name', files[i].name);

      this.commonService.uploadDocuments('bill', formData).subscribe({
        next: (response) => {
          console.log('File uploaded successfully', response);
        },
        error: (err) => {
          console.error('Error uploading file', err);
        }
      });
    }
  }

  onClose(evt) {
    this.CloseAction.emit(evt);
    this.location?.back();
  }
  get f() {
    return this.addProduct.controls;
  }

  getPackingGroup() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      typeCategory:   {
        "$in": ['packingGroup','imcoClass','tankType',]
      },
      "status": true
    }
    this.commonService
      .getSTList('systemtype',payload)?.subscribe((res: any) => {
      this.productList = res.documents;
      this.productList = res?.documents?.filter(x => x.typeCategory === "packingGroup");
      this.tankTypeList = res?.documents?.filter(x => x.typeCategory === "tankType");
      this.imcoList = res?.documents?.filter(x => x.typeCategory === "imcoClass");
    });
  }

  onSave() {
    this.submitted = true;
    this.location?.back();
  }
  msdsfileupload(e) {
    this.addProduct.controls['msdsFile'].setValue(e.target.files[0].name);
  }

  getCurrencyData() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService
      .getSTList('currency',payload)?.subscribe((res: any) => {
      this.currencyData = res.documents;
    })
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.addProduct.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }

  productMasters() {
    this.onProductTypeChange(this.addProduct.value.productType)
    this.submitted = true;
    this.findInvalidControls()

    if (this.addProduct.invalid) {
      return false;
    }
   
    const formData = new FormData();
    var documentsUpload = [];
    if (this.documentPayload) {
      this.documentPayload.filter(x => {
        var extension = x.name.substr(
          x.name.lastIndexOf('.')
        );
        const filename = x.name + extension
        formData.append('file', x, `${x.name}`);
        formData.append('name', `${x.name}`);
        this.commonService.uploadDocuments("product",formData).subscribe();
        documentsUpload.push({ docname: filename, docurl: `${x.name}`})
      })
    }
    let newProducts = this.addProduct.value;
    newProducts = {
      ...newProducts,
      imcoClass: this.imcoList?.find((x) => x.systemtypeId === this.addProduct.value?.imcoClass)?.typeName || '',
      imcoClassId: this.addProduct.value?.imcoClass || '',
      customerNameId: this.addProduct.value?.customerName || '',
      customerName: this.partyMasterNameList?.find((x) => x.partymasterId === this.addProduct.value?.customerName)?.name || '',
      isApproved: newProducts?.isApproved ? 'yes' : 'no',
      partyMasterId: this.addProduct.value?.mappingCustomerMaster || '',
      saleName: this.partyMasterNameList?.find((x) => x.partymasterId === this.addProduct.value?.mappingCustomerMaster)?.saleName || '',
      packingGroupName: this.productList?.find((x) => x.systemtypeId === this.addProduct.value?.packingGroup)?.typeName || '',
      tenantId: this.tenantId || '',
      documents: documentsUpload || [],      
    }

    if (this.isEditMode) {
      const data = { ...newProducts, productId: this.productID };
      this.commonService.UpdateToST(`product/${data.productId}`,data)?.subscribe(
        (res: any) => {
          if (res) {

            setTimeout(() => {
              this.notification.create('success', 'Updated Successfully', '');
              this.submitted = true;
              this.location?.back();
            }, 1000)

          }
        },
        (error) => {
          this.submitted = true;
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      const data = { ...newProducts, status: true };

      this.commonService.addToST('product',data)?.subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Add Successfully', '');
              this.submitted = true;
              this.location?.back();
            }, 1000)
          }
        },
        (error) => {
          this.submitted = true;
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }

  }
  getportList() {
    this.profileService.portList()?.subscribe((res: any) => {
      this.portData = res.documents


    })
  
  }

  getPartyMaster() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService
      .getSTList('partymaster',payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents
    });
  }

  ngOnInit(): void {
    if (this.isType === 'show') {
      this.addProduct.disable();
    }
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    this.productID = this.route.snapshot?.params['id']
    if (this.productID) {
      this.isEditMode = true
    }
    this.getPartyMaster()
    this.getPackingGroup();
    this.getCurrencyData();
    if (this.isEditMode) {
      this.getProductById();
    }
  }
  getProductById() {
    let payload = this.commonService.filterList()
    if(payload?.query) payload.query = {
      "productId": this.productID
    }
    this.commonService
      .getSTList('product',payload)?.subscribe((res: any) => {
      this.producteditList = res?.documents[0];
      this.patchValue(this.producteditList)
    });
  }
  deleteFile(doc) {
    let index = this.documentPayload.findIndex(
      item => item.docname === doc.docname
    )
    this.documentPayload.splice(index, 1)
  }
  patchValue(producteditList) {
    this.documentPayload = producteditList?.documents ? producteditList?.documents : [];
    this.addProduct.patchValue({
      customerName: producteditList?.customerNameId || '',
      productName: producteditList?.productName || '',
      productType: producteditList?.productType || '',
      imdgPage: producteditList?.imdgPage || '',
      imcoClass: producteditList?.imcoClassId || '',
      subRisk: producteditList?.subRisk || '',
      hazSubclass: producteditList?.hazSubclass || '',
      unNumber: producteditList?.unNumber || '',
      densityGravity: producteditList?.densityGravity || '',
      flashPoint: producteditList?.flashPoint || '',
      psn: producteditList?.psn || '',
      technicalName: producteditList?.technicalName || '',
      packingGroup: producteditList?.packingGroup || '',
      msdsValidityDate: producteditList?.msdsValidityDate || '',
      isApproved: producteditList?.isApproved === 'yes' ? true : false ,
      marinePollution: producteditList?.marinePollution || false,
      emsNo: producteditList?.emsNo || '',
      emsCode: producteditList?.emsCode || '',
      mfagNo: producteditList?.mfagNo || '',
  
      hsCode: producteditList?.hsCode || '',
 
      mappingCustomerMaster: producteditList?.mappingCustomerMaster || '',
      productCategory: producteditList?.productCategory || '',
  
      msdsFile: producteditList?.msdsFile || '',
      // tankType: producteditList?.tankType || '',

      shippingName: producteditList?.shippingName || '',
      imoNo: producteditList?.imoNo || '',
      UNDGType: producteditList?.UNDGType || '',
      reportableQuantity: producteditList?.reportableQuantity || '',
      flashpointCelsius: producteditList?.flashpointCelsius || '',
      flashpointFahrenheit: producteditList?.flashpointFahrenheit || '',
      toxinHazard: producteditList?.toxinHazard || false,
      hazardZone: producteditList?.hazardZone || '',
    })
  }
}
