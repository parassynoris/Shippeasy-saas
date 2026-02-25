import { Component, Output, OnInit, EventEmitter, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { Location } from '@angular/common';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from '../../../../services/common/common.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import { environment } from 'src/environments/environment';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
@Component({
  selector: 'app-add-customer-gst',
  templateUrl: './add-customer-gst.component.html',
  styleUrls: ['./add-customer-gst.component.css'],
})
export class AddCustomerGstComponent implements OnInit {
  customerGSTForm: FormGroup;
  submitted = false;
  productIdToUpdate: string;
  portData: any = [];
  @Output() CloseAction = new EventEmitter();
  @Input() isType: any;
  portDetails: any;
  filterBody: any;
  baseBody: any;
  productList: any;
  currencyData: any = [];
  partyMasterNameList: any = [];
  productID: any = '';
  isEditMode: boolean = false;
  producteditList: any = [];
  documents: any = [];
  documentPayload: any;
  isHaz: boolean = false
  currentUrl: string;
  stateList: any = [];
  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    // private router: Router,
    private _api: ApiService,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private mastersService: MastersService,
    private location: Location,
    private commonService1: CommonService,
    private profileService: ProfilesService,
    private saMasterService: SaMasterService,
    private apiService: ApiSharedService
  ) {
    this.customerGSTForm = this.formBuilder.group({
      gstCustomerName: ['', Validators.required],
      panNo: ['', Validators.required],
      groupCustomer: [false],
      mappingCustomerId: [''],
      gstNo: ['', Validators.required],
      state: ['', Validators.required],
      pinCode : ['', Validators.required],
      placeAddress : ['', Validators.required],
      plantName : ['', Validators.required],
      status: [true],
      isSez:['']
    });
  }

  get stateDetails() {
    return this.customerGSTForm.get('stateDetails') as FormArray;
  }

  addStateDetail(data) {
    this.stateDetails.push(this.newStateDetail(data))
  }

  newStateDetail(data) {
    if (data) {
      return this.formBuilder.group({
        "stateCode": [data.stateCode, Validators.required],
        "regUnReg": [data.regUnReg, Validators.required],
        "gstnNo": [data.gstnNo, Validators.required],
        "pinCode": [data.pinCode, Validators.required],
        "address": [data.address, Validators.required],
        "cityName": [data.cityName],
        "plantName": [data.plantName],
        "email": [data.email],
        "contact": [data.contact],
        "docName": [data.docName],
        "docUrl": [data.docUrl],
        "isSezFlag": [data.isSezFlag]

      })
    }
    else {
      return this.formBuilder.group({
        "stateCode": ["", Validators.required],
        "regUnReg": ["", Validators.required],
        "gstnNo": ["", Validators.required],
        "pinCode": ["", Validators.required],
        "address": ["", Validators.required],
        "cityName": [""],
        "plantName": [""],
        "email": [""],
        "contact": [""],
        "docName": [""],
        "docUrl": [""],
        "isSezFlag": [""]
      })
    }
  }

  removeStateDetail(i: number) {
    this.stateDetails.removeAt(i);
  }

  // uploadDoc(event) {
  //   let files = [];
  //   this.documentPayload = [];
  //   files = event.target.files;

  //   for (let i = 0; i < files.length; i++) {
  //     this.commonService.uploadFile(files[i], files[i].name, 'bill');
  //     this.documentPayload.push(event.target.files[i]);
  //   }
  // }

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
    this.location.back();
  }
  get f() {
    return this.customerGSTForm.controls;
  }



  onSave() {
    this.submitted = true;
    this.location.back();
  }
  msdsfileupload(e) {
    this.customerGSTForm.controls['msdsFile'].setValue(e.target.files[0].name);
  }



  public findInvalidControls() {
    const invalid = [];
    const controls = this.customerGSTForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }

  // productMasters() {
  //   this.submitted = true;

  //   if (this.customerGSTForm.invalid) {
  //     return false;
  //   }

  //   var documentsUpload = [];

  //    if (this.documentPayload) {
  //      this.documentPayload.filter(x => {
  //        this.commonService.uploadFile(x, x.name, "product")
  //        documentsUpload.push({ docname: x.name, docurl: `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/product/${x.name}` })
  //  })
  //    }

  productMasters() {
    this.submitted = true;
    if (this.customerGSTForm.invalid) {
      return false;
    }
    let documentsUpload = [];
    if (this.documentPayload && this.documentPayload.length > 0) {

      for (const x of this.documentPayload) {
        const extension = x.name.substr(x.name.lastIndexOf('.'));
        const filename = x.name + extension
        const formData = new FormData();
        formData.append('file', x, x.name);
        formData.append('name', `${x.name}`);
        this.commonService.uploadDocuments("product", formData).subscribe({
          next: (response) => {
            documentsUpload.push({ documentName: filename, docurl: response.docUrl });
          },
          error: (err) => {
            console.error('Document upload failed:', err);
          }
        });
      }
    }

    let newProducts = this.customerGSTForm.value;
    newProducts = {
      ...newProducts,
      isApproved: newProducts.isApproved ? 'yes' : 'no',
      partyMasterId: this.customerGSTForm.value.mappingCustomerMaster,
      saleName: this.partyMasterNameList.filter((x) => x._source.partymasterId === this.customerGSTForm.value.mappingCustomerMaster
      )[0]?._source?.saleName,
      packingGroupName: this.productList.filter((x) => x._source?.systemtypeId === this.customerGSTForm.value.packingGroup)[0]?._source?.typeName,

      documents: documentsUpload
    }

    if (this.isEditMode) {
      const data = [{ ...newProducts, productId: this.productID }];
      this.mastersService.updateProduct(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.submitted = true;
            this.location.back();
          }
        },
        (error) => {
          this.submitted = true;
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      const data = [{ ...newProducts, status: true }];

      this.mastersService.createProduct(data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.submitted = true;
            this.location.back();
          }
        },
        (error) => {
          this.submitted = true;
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }

  }


  getPartyMaster() {
    let mustArray = [];
      mustArray.push({
        "match": { "status": true }
      });
 
    if(this.baseBody?.baseBody.query.bool.must)this.baseBody.baseBody.query.bool.must = mustArray;
    this._api.getListByURL("master/list?type=partymaster", this.baseBody?.baseBody)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.hits?.hits
    });
  }

  ngOnInit(): void {
    this.productID = this.route.snapshot.params['id']
    if (this.productID) {
      this.isEditMode = true
    }
    if (this.isType === 'show') {
      this.customerGSTForm.disable();
    }

    this.getPartyMaster()
    if (this.isEditMode) {
      this.getProductById();
    }
  }
  getProductById() {
    let mustArray = [];
    mustArray.push({
      "match": { "productId": this.productID }
    });
    this.baseBody.baseBody.query.bool.must = mustArray;
    this._api.getListByURL("master/list?type=product", this.baseBody.baseBody).subscribe((res: any) => {
      this.producteditList = res?.hits?.hits[0]?._source;
      this.patchValue()
    });
  }

  deleteFile(doc) {
    let index = this.documentPayload.findIndex(
      item => item.docname === doc.docname
    )
    this.documentPayload.splice(index, 1)
  }
  patchValue() {
    this.documentPayload = this.producteditList?.documents ? this.producteditList?.documents : [];
    this.customerGSTForm.patchValue({
      productName: this.producteditList?.productName || '',

    })
  }
}
