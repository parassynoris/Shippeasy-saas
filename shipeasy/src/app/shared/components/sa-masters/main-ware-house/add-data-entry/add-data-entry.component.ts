import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AddPartyComponent } from 'src/app/admin/party-master/add-party/add-party.component';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { OrderByPipe } from 'src/app/shared/util/sort';

@Component({
  selector: 'app-add-data-entry',
  templateUrl: './add-data-entry.component.html',
  styleUrls: ['./add-data-entry.component.scss']
})
export class AddDataEntryComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatDrawer;
  dataEntryForm!: FormGroup;
  submitted = false;
  vessels = ['Vessel A', 'Vessel B'];
  ports = ['Port A', 'Port B'];
  warehouses = ['Warehouse 1', 'Warehouse 2'];
  statuses = ['Active', 'Inactive','Planning',"Cancle"];
  Type = ['Bonded','Non Bonded'];
  countryList: any;
  WareHouseExporterList: any;
  WareHouseImporterList: any;
  WareHouseCHAList: any;
  partymasterList: any[];
  uomData: any = [];
  weighthData: any = [];
  portList :any= [];
  warehouseList:any=[]
  wareHouseDataEntryList: any;
  containerlist: any;
  productList: any;
  locationListOriginal: any;
  vesselList: any;
  hsnCode: any;
  customDuty:any;
  warehouseDataEntryId: string | null = null;
  SpaceCertificationNo:string | null = null;
  closeResult: string;
  newGeneratedJobNo:string;
  isExport: boolean = false;
  isImport: boolean = false;
  isTransport: boolean = false;
  bondCodeList: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private commonService:CommonService,
    private router : Router, 
    private notification: NzNotificationService,
    private route :ActivatedRoute,
    public sortPipe: OrderByPipe,
    private modalService: NgbModal,
    public _api: ApiService,
    private formBuilder: FormBuilder,
  ) {}

  @ViewChild(AddPartyComponent) partyMasterComponent!: AddPartyComponent;
  handleGetList(event) {
    this.getPartyMasterDropDowns()
    this.getShippingLineDropDowns();
    this.drawer.close();
    this.partyMasterComponent.loadData();
  }
    onDrawerClose() {
    this.partyMasterComponent.loadData();
  }

    titleParty = '';
    private modalRef: NgbModalRef;
    addPartyMaster(content, title) {
      this.titleParty = title
      this.getCountryList()
      this.getCustomerType()
      this.addressFormBuild()
      this.modalRef = this.modalService.open(AddPartyComponent, {
        ariaLabelledBy: 'modal-basic-title',
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: 'lg',
      });
      this.modalRef.componentInstance.isPopup = true;
      this.modalRef.componentInstance.getList.subscribe((res: any) => {
        if (res) {
          this.getShippingLineDropDowns();
          this.getPartyMasterDropDowns()
        }
      })
    }

    CustomerTypeList:any = [];
      getCustomerType() {

    let payload = this.commonService.filterList()
    payload.query = {
      typeCategory: 'ISF', status: true,
    }
    this.commonService.getSTList("systemtype", payload).subscribe((res: any) => {
      let customerTypeListHold = []
      this.CustomerTypeList = res.documents;
      this.CustomerTypeList.forEach(e => {
        customerTypeListHold.push({
          item_id: e.systemtypeId,
          item_text: e.typeName
        })

      })
      this.CustomerTypeList = customerTypeListHold

    });
  }

    shippingLineList:any = [];

  getShippingLineDropDowns() {
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      "status": true,
      "$and": [
        {
          "feeder": {
            "$ne": true,
          }
        }
      ]
    }


    this._api.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;
    });
  }

  Overview!: FormGroup;

    addressFormBuild() {
    this.Overview = this.formBuilder.group({
      name: ['', Validators.required],
      shortname: [''],
      annualTurnover: [''],
      annualTernover: [''],
      customerStatus: ['Resident'],
      country: ['', Validators.required],
      state: ['', Validators.required],
      city: ['', Validators.required],
      parentCompany: [false],
      groupCompany: [false],
      panNo: ['', Validators.required],
      address: ['', [Validators.required, this.forbiddenCharactersValidator()]],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      partyCurrency: ['', Validators.required],
      primaryEmailId: ['', [Validators.required, Validators.email]],
      customerType: [[]],
      ImportExport: ['', Validators.required],
      principle: [''],
      partyShortcode: [''],
      chequeAcceptance: [false],
      branch: [''],
      isSez: [false],
      isRegisterCompany: [false],
      isRegister: [false],
      isUser: [false],
      bankName: [''],
      notes: [],
      customerList: [''],
      overviewTable: [],
    });
  }

  ngOnInit(): void {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.getBranchList()
    this.initializeForm();
    this.getCountryList();
    this.getPartyMasterDropDowns();
    this.getSystemTypeDropDowns();
    this.getUomList();
    this.getproductDropDowns();
    this.getLocationDropDowns();
    this.getVesselListDropDown();
    this.getPortDropDowns();
    this.getContainerTypeDropDowns();
    this.getwarehouseData()

    if (this.route.snapshot.paramMap.get('id')) {
      this.warehouseDataEntryId = this.route.snapshot.paramMap.get('id');
      this.getWarehouseDataEntryById(this.warehouseDataEntryId);
    }
  }

    forbiddenCharactersValidator() {
    return (control) => {
      const forbiddenChars = /["\\]/; // Regular expression to match forbidden characters
      const value = control.value;
      const hasForbiddenChars = forbiddenChars.test(value);
      return hasForbiddenChars ? { forbiddenChars: true } : null;
    };
  }

  // NEW: Custom validator to check if Invoice No and BL No are the same
  invoiceBlNoMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) {
      return null;
    }
    const invoiceNo = control.parent.get('invoiceNo')?.value;
    const blNo = control.parent.get('blNo')?.value;
    
    if (invoiceNo && blNo && invoiceNo.trim() === blNo.trim()) {
      return { invoiceBlNoMatch: true };
    }
    return null;
  }

  // NEW: Custom validator to check if Invoice No and Bill of Entry No are the same
  invoiceBillOfEntryMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) {
      return null;
    }
    const invoiceNo = control.parent.get('invoiceNo')?.value;
    const blofEN = control.parent.get('blofEN')?.value;
    
    if (invoiceNo && blofEN && invoiceNo.trim() === blofEN.trim()) {
      return { invoiceBillOfEntryMatch: true };
    }
    return null;
  }

  get f() {
    return this.dataEntryForm.controls;
  }

  // Enhanced method to check if current type is Bonded
  isBondedType(): boolean {
    return this.dataEntryForm?.get('type')?.value === 'Bonded';
  }

  // Method to check if current type is Non Bonded
  isNonBondedType(): boolean {
    return this.dataEntryForm?.get('type')?.value === 'Non Bonded';
  }

  initializeForm() {
    this.dataEntryForm = this.fb.group({
      jobNo: [''],
      type: ['Bonded', Validators.required],
      jobDate: [null, Validators.required],
      originCountry: ['', Validators.required],
      invoiceLedger: ['', Validators.required],
      productDescription: [''],
      chaLedger: [''],
      vessel: [''],
      status: ['Active'],
      remarks: ['', Validators.maxLength(255)],
      packagesUnit: [''],
      packageUnit: [''],
      grossQtyUnit: [''],
      QtyUnit: [''],
      branch:['', Validators.required],

      jobType: [''],
      etaDate: [null],
      importerLedger: [''],
      blNo: ['', [Validators.maxLength(15), Validators.pattern(/^[a-zA-Z0-9]*$/)]],
      blDate: [null],
      invoiceNo: [''],
      invoiceDate: [null],
      customDuty: [''],
      hsnCode: [
        '',
        [
          Validators.pattern(/^\d{6,8}$/)
        ]
      ],
      exporterLedger: [''],
      spaceRequired: ['', Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)],
      spaceRequiredunit: [''],
      exporterCustomPort: [''],
      validity: [null],
      blofEN: [
        '',
        [
          Validators.pattern(/^[a-zA-Z0-9]*$/),
          Validators.maxLength(20)
        ]
      ],
      blofEDate: [null],
      accessibleValue: [
        '',
        [
          Validators.pattern(/^\d+(\.\d{1,2})?$/) 
        ]
      ],
      bondCode: [''],
      warehouseId: [''],
      poNo: [''],
      product: [''],
      location: [''],
      ContainerNumber: [''],
      ContainerType: [''],
      year: [''],
      licenceNo:[''],
    });

    this.dataEntryForm.get('type')?.valueChanges.subscribe(value => {
      this.updateValidatorsBasedOnType(value);
      this.clearHiddenFieldValues(value);
    });

    // NEW: Add cross-field validators
    this.dataEntryForm.get('invoiceNo')?.valueChanges.subscribe(() => {
      this.dataEntryForm.get('blNo')?.updateValueAndValidity({ emitEvent: false });
      this.dataEntryForm.get('blofEN')?.updateValueAndValidity({ emitEvent: false });
    });

    this.dataEntryForm.get('blNo')?.valueChanges.subscribe(() => {
      this.dataEntryForm.get('invoiceNo')?.updateValueAndValidity({ emitEvent: false });
    });

    this.dataEntryForm.get('blofEN')?.valueChanges.subscribe(() => {
      this.dataEntryForm.get('invoiceNo')?.updateValueAndValidity({ emitEvent: false });
    });

    this.updateValidatorsBasedOnType('Bonded');
  }

  onAccessibleValueBlur() {
    let value = this.dataEntryForm.get('accessibleValue')?.value;
    if (value !== null && value !== '' && !isNaN(value)) {
      this.dataEntryForm.get('accessibleValue')?.setValue(parseFloat(value).toFixed(2), { emitEvent: false });
    }
  }

  private updateValidatorsBasedOnType(type: string) {
    this.clearAllValidators();
    
    // Always required fields
    this.setValidators([
      'type',
      'jobDate',
      'branch',
      'originCountry',
      'invoiceLedger' 
    ], [Validators.required]);
  
    if (type === 'Bonded') {
      // All Bonded fields are now mandatory EXCEPT Exporter, HSN Code, and Vessel
      this.setValidators([
        'jobType',
        'etaDate',
        'importerLedger',
        'invoiceNo',
        'invoiceDate',
        'productDescription',
        'packagesUnit',
        'packageUnit',
        'grossQtyUnit',
        'QtyUnit',
        'customDuty',
        'chaLedger',
        'spaceRequired',
        'spaceRequiredunit',
        'exporterCustomPort',
        'validity',
        'blofEN',
        'blofEDate',
        'accessibleValue',
        'bondCode',
        'warehouseId',
        'licenceNo',
        'status',
      ], [Validators.required]);

      // NEW: Add cross-field validators for Bonded type
      this.dataEntryForm.get('blNo')?.setValidators([
        Validators.required,
        Validators.maxLength(15),
        Validators.pattern(/^[a-zA-Z0-9]*$/),
        this.invoiceBlNoMatchValidator.bind(this)
      ]);

      this.dataEntryForm.get('invoiceNo')?.setValidators([
        Validators.required,
        this.invoiceBillOfEntryMatchValidator.bind(this)
      ]);

      this.dataEntryForm.get('blofEN')?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]*$/),
        Validators.maxLength(20)
      ]);

      this.dataEntryForm.get('blDate')?.setValidators([Validators.required]);
    }
    
    this.dataEntryForm.updateValueAndValidity();
  }

  private clearHiddenFieldValues(type: string) {
    if (type === 'Non Bonded') {
      const bondedOnlyFields = [
        'jobType', 'etaDate', 'importerLedger', 'blNo', 'blDate',
        'invoiceNo', 'invoiceDate', 'hsnCode', 'exporterLedger','customDuty',
        'spaceRequired', 'spaceRequiredunit', 'exporterCustomPort',
        'validity', 'blofEN', 'blofEDate', 'accessibleValue',
        'bondCode', 'warehouseId', 'grossQtyUnit', 'QtyUnit','licenceNo',
        'productDescription', 'packagesUnit', 'packageUnit', 'chaLedger',
        'vessel','location'
      ];
  
      bondedOnlyFields.forEach(field => {
        this.dataEntryForm.get(field)?.setValue('');
        this.dataEntryForm.get(field)?.setValue(null);
      });
    }
  }

  private setValidators(controlNames: string[], validators: any[]) {
    controlNames.forEach(controlName => {
      const control = this.dataEntryForm.get(controlName);
      if (control) {
        control.setValidators(validators);
        control.updateValueAndValidity();
      }
    });
  }

  private clearAllValidators() {
    Object.keys(this.dataEntryForm.controls).forEach(key => {
      const control = this.dataEntryForm.get(key);
      if (control) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  isFieldVisible(fieldName: string): boolean {
    const bondedOnlyFields = [
      'jobType', 'etaDate', 'importerLedger', 'blNo', 'blDate',
      'invoiceNo', 'invoiceDate', 'hsnCode', 'exporterLedger','customDuty',
      'spaceRequired', 'spaceRequiredunit', 'exporterCustomPort',
      'validity', 'blofEN', 'blofEDate', 'accessibleValue',
      'bondCode', 'warehouseId', 'grossQtyUnit', 'QtyUnit'
    ];

    if (bondedOnlyFields.includes(fieldName)) {
      return this.isBondedType();
    }

    return true; // Always visible fields
  }

  onBondCodeBlur() {
    const bondCode = this.dataEntryForm.get('bondCode')?.value;
    if (bondCode) {
      this.getwarehouseData(bondCode);
    } else {
      this.warehouseList = [];
    }
  }

  onSubmit() {
    this.submitted = true;

    this.markVisibleFieldsAsTouched();

    if (!this.isFormValidForCurrentType()) {
      // NEW: Check for specific validation errors and show messages
      if (this.dataEntryForm.get('blNo')?.hasError('invoiceBlNoMatch')) {
        this.notification.create('error', 'Invoice No. and BL No. cannot be the same', '');
        return;
      }
      if (this.dataEntryForm.get('invoiceNo')?.hasError('invoiceBillOfEntryMatch')) {
        this.notification.create('error', 'Invoice No. and Bill of Entry No. cannot be the same', '');
        return;
      }
      return;
    }

    const dataEntryForm = this.dataEntryForm.getRawValue();
    let payload = this.buildPayload(dataEntryForm);

    if (this.warehouseDataEntryId) {
      this.updateWarehouseDataEntry(payload);
    } else {
      this.createWarehouseDataEntry(payload);
    }
  }

  private markVisibleFieldsAsTouched() {
    Object.keys(this.dataEntryForm.controls).forEach(key => {
      if (this.isFieldVisible(key)) {
        this.dataEntryForm.get(key)?.markAsTouched();
      }
    });
  }

  private isFormValidForCurrentType(): boolean {
    const currentType = this.dataEntryForm.get('type')?.value;
    const requiredFields = this.getRequiredFieldsForType(currentType);

    for (const field of requiredFields) {
      const control = this.dataEntryForm.get(field);
      if (control && control.invalid) {
        return false;
      }
    }

    return true;
  }

  private getRequiredFieldsForType(type: string): string[] {
    const alwaysRequired = [
      'type', 'jobDate', 'originCountry', 'invoiceLedger' ,'branch'
    ];
  
    if (type === 'Bonded') {
      return [
        ...alwaysRequired,
        'jobType',
        'etaDate',
        'importerLedger',
        'blNo',
        'blDate',
        'invoiceNo',
        'invoiceDate',
        'productDescription',
        'packagesUnit',
        'packageUnit',
        'grossQtyUnit',
        'QtyUnit',
        'customDuty',
        'chaLedger',
        'spaceRequired',
        'spaceRequiredunit',
        'exporterCustomPort',
        'validity',
        'blofEN',
        'blofEDate',
        'accessibleValue',
        'bondCode',
        'warehouseId',
        'licenceNo',
        'status',
        // Note: exporterLedger, hsnCode, vessel are NOT included (optional)
      ];
    }
  
    return alwaysRequired;
  }

  private buildPayload(dataEntryForm: any) {
    const selectedBranch = this.branchList?.find((branch) => branch.branchId === dataEntryForm.branch);
    console.log('Selected branch:', selectedBranch);
    return {
      "jobNo": dataEntryForm?.jobNo,
      "year": dataEntryForm.year,
      "originCountry": dataEntryForm.originCountry,
      "originCountryName": this.countryList?.find((x: any) => x.countryId === dataEntryForm?.originCountry)?.countryName,
      "jobDate": dataEntryForm.jobDate,
      "jobType": dataEntryForm.jobType,
      "jobTypeName": this.wareHouseDataEntryList?.find((x: any) => x.systemtypeId === dataEntryForm?.jobType)?.typeName,
      "etaDate": dataEntryForm.etaDate,
      "importerLedger": dataEntryForm.importerLedger,
      "importerLedgerName": this.WareHouseImporterList?.find((x: any) => x.partymasterId === dataEntryForm?.importerLedger)?.name,
      "blNo": dataEntryForm.blNo,
      "blDate": dataEntryForm.blDate,
      "invoiceLedger": dataEntryForm.invoiceLedger, // This is now Party Name
      "invoiceLedgerName": this.WareHouseImporterList?.find((x: any) => x.partymasterId === dataEntryForm?.invoiceLedger)?.name,
      "invoiceNo": dataEntryForm.invoiceNo,
      "invoiceDate": dataEntryForm.invoiceDate,
      "poNo": dataEntryForm.poNo,
      "product": dataEntryForm.product,
      "productName": this.productList?.find((x: any) => x.productId === dataEntryForm?.product)?.productName,
      "productDescription": dataEntryForm.productDescription,
      "location": dataEntryForm.location,
      "locationName": this.locationListOriginal?.find((x: any) => x.locationId === dataEntryForm?.location)?.locationDetails?.locationName,
      "hsnCode": this.hsnCode || dataEntryForm.hsnCode,
      "customDuty": this.customDuty || dataEntryForm.customDuty,
      "chaLedger": dataEntryForm.chaLedger,
      "chaLedgerName": this.WareHouseCHAList?.find((x: any) => x.partymasterId === dataEntryForm?.chaLedger)?.name,
      "vessel": dataEntryForm.vessel,
      "vesselName": this.vesselList?.find((x: any) => x.vesselId === dataEntryForm?.vessel)?.vesselName,
      "spaceRequiredunit": dataEntryForm.spaceRequiredunit,
      "spaceRequiredunitName": this.weighthData?.find((x:any)=>x.uomId===dataEntryForm?.spaceRequiredunit)?.uomShort,
      "exporterLedger": dataEntryForm.exporterLedger,
      "exporterLedgerName": this.WareHouseExporterList?.find((x: any) => x.partymasterId === dataEntryForm?.exporterLedger)?.name,
      "spaceRequired": dataEntryForm.spaceRequired,
      "exporterCustomPort": dataEntryForm.exporterCustomPort,
      // "exporterCustomPortName": this.portList?.find((x: any) => x.portId === dataEntryForm?.exporterCustomPort)?.portDetails?.portName,
      "warehouseId": dataEntryForm.warehouseId,
      "warehouseName": this.warehouseList?.find((x: any) => x.warehouseId === dataEntryForm?.warehouseId)?.wareHouseName,
      "remarks": dataEntryForm.remarks,
      "status": dataEntryForm.status,
      "type": dataEntryForm.type,
      "validity": dataEntryForm.validity,
      'blofEN': dataEntryForm.blofEN,
      "blofEDate": dataEntryForm.blofEDate,
      "accessibleValue": dataEntryForm.accessibleValue,
      "bondCode": dataEntryForm.bondCode,
      'ContainerNumber': dataEntryForm.ContainerNumber,
      "ContainerType": dataEntryForm.ContainerType,
      "spaceCertificationDate": this.generateSpaceCertificationDate(),
      "packagesUnit": dataEntryForm.packagesUnit,
      "packageUnit": dataEntryForm.packageUnit,
      "packageUnitName": this.weighthData?.find((x: any) => x.uomId === dataEntryForm?.packageUnit)?.uomShort,
      "grossQtyUnit": dataEntryForm.grossQtyUnit,
      "QtyUnit": dataEntryForm.QtyUnit,
      "QtyUnitName": this.weighthData?.find((x: any) => x.uomId === dataEntryForm?.QtyUnit)?.uomShort,
      "licenceNo":dataEntryForm.licenceNo,
      "branchId": dataEntryForm.branch, // This should get the branchId
      "branchName": selectedBranch?.branchName || '',
    };
  }

  private updateWarehouseDataEntry(payload: any) {
    this.commonService.UpdateToST("warehousedataentry/" + this.warehouseDataEntryId, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Updated Successfully', '');
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error, '');
      }
    );
  }

  private createWarehouseDataEntry(payload: any) {
    payload['spaceCertificationNo'] = this.SpaceCertificationNo;
    this.commonService.addToST("warehousedataentry", payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Added Successfully', '');
          this.onCancel();
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error, '');
      }
    );
  }

  getCurrentFinancialYear(): string { 
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 4 ? year : year - 1;
    const endYear = startYear + 1;
    return `${startYear}-${endYear}`;
  }

  generateSpaceCertificateNo(): void {
  }

  generateSpaceCertificationDate(): any {
    return new Date().toISOString();
  }

  openPOPUP(content2: any) {
    this.modalService
      .open(content2, {
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
            this.onSubmit();
          }
        }
      );
  }

  onCancel() {
    this.router.navigate(['/warehouse/main-ware-house']);
    this.submitted = false;
    this.dataEntryForm.reset();
    this.dataEntryForm.patchValue({
      type: 'Bonded',
      status: 'Active'
    });
  }

  productData() {
    if (!this.dataEntryForm.value.product) {
      return false;
    }
    this.hsnCode = this.productList.filter(x => x.productId === this.dataEntryForm.value.product)[0]?.hsCode;
    this.dataEntryForm.controls.hsnCode.setValue(this.hsnCode);
  }

  getCountryList() {
    let payload = this.commonService.filterList()
    payload.query = { status: true }
    this.commonService.getSTList('country', payload).subscribe((data) => {
      this.countryList = data.documents;
    });
  }

  branchList: any = []
  getBranchList() {
    let payload = this.commonService.filterList()
    payload.query = {
      status: true,
    }
    this.commonService.getSTList('branch', payload)
      .subscribe((data) => {
        this.branchList = data.documents;
        // this.getBatchList()
      });
  }

  printData() {
    let reportpayload = { "parameters": { "warehousedataentryId": this.warehouseDataEntryId } };
    this.commonService.pushreports(reportpayload, 'spaceCertificate').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
      }
    })
  }

  getPartyMasterDropDowns() {
    this.partymasterList = []
    this.WareHouseExporterList = []
    this.WareHouseImporterList = []
    this.WareHouseCHAList = []
    let payload = this.commonService.filterList()
    if (payload) payload.query = { "status": true }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents;
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'WareHouseExporter') { this.WareHouseExporterList.push(x) }
            else if (res?.item_text === 'WareHouseImporter') { this.WareHouseImporterList.push(x) }
            else if (res?.item_text === 'WareHouseCHA') { this.WareHouseCHAList.push(x) }
          })
        }
      });
    });
  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = {
      status: true,
      "typeCategory": { $in: ["wareHouseDataEntry"] }
    }
    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.wareHouseDataEntryList = res?.documents?.filter(x => x.typeCategory === "wareHouseDataEntry");
    });
  }

  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }

  getContainerTypeDropDowns() {
    let payload = this.commonService.filterList();
    if (payload) payload.query = {
      status: true,
      "typeCategory": { "$in": ["containerType"] }
    }
    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.containerlist = res?.documents?.filter(x => x.typeCategory === "containerType");
    });
  }

  getUomList() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = { 'status': true }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      // this filter is removed to show all uoms
      // ?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
      this.weighthData = data?.documents;
    });
  }

  getproductDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { "status": true }
    this.commonService.getSTList("product", payload)?.subscribe((res: any) => {
      this.productList = res?.documents;
    });
  }

  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { "status": true }
    this.commonService.getSTList("location", payload)?.subscribe((res: any) => {
      this.locationListOriginal = res?.documents;
    });
  }

  getVesselListDropDown() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = { status: true }
    this.commonService.getSTList('vessel', payload)?.subscribe((res: any) => {
      this.vesselList = res?.documents;
    });
  }

  getPortDropDowns() {
    let payload = this.commonService.filterList()
    if (payload) payload.query = { status: true }
    if (payload?.size) payload.size = 100
    if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];
    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.portList = res?.documents;
    });
  }

  getwarehouseData(bondCode?: string) {
    let payload = this.commonService.filterList();
    if (payload) {
      payload.query = { status: true };
      if (bondCode) {
        payload.query['bondCode'] = bondCode;
      }
    }
    if (payload?.size) payload.size = 1000;
    if (payload?.from) payload.from = 0;

    this.commonService.getSTList('warehouse', payload)?.subscribe((res: any) => {
      const docs = res?.documents || [];
      if (bondCode) {
        this.dataEntryForm.get('warehouseId')?.reset();
        this.warehouseList = docs;
      } else {
        this.bondCodeList = docs?.filter(f => f?.bondCode)?.reduce((acc, curr) => {
          if (!acc.some(item => item?.bondCode === curr?.bondCode)) {
            acc.push(curr);
          }
          return acc;
        }, []) || [];;
      }
    });
  }
  onWarehouseChange(selectedWarehouseId: string) {
    const selectedWarehouse = this.warehouseList.find(
      w => w.warehouseId === selectedWarehouseId
    );
    if (selectedWarehouse) {
      this.dataEntryForm.patchValue({
        licenceNo: selectedWarehouse.licenceNo || ''
      });
    } else {
      this.dataEntryForm.patchValue({
        licenceNo: ''
      });
    }
  }
  onBondCodeChange(bondCode: string) {
    if (!bondCode) this.dataEntryForm.get('warehouseId')?.reset();
    this.getwarehouseData(bondCode);
  }

  getWarehouseDataEntryById(id) {
    let payload = this.commonService?.filterList()
    if (payload?.query) payload.query = { "warehousedataentryId": id }
    this.commonService?.getSTList("warehousedataentry", payload).subscribe((data) => {
      const dataEntryList = data?.documents[0]

      // Store the warehouse ID before patching
      const savedWarehouseId = dataEntryList?.warehouseId;
      const bondCode = dataEntryList?.bondCode;

      this.dataEntryForm.patchValue({
        jobNo: dataEntryList?.jobNo,
        year: dataEntryList?.year,
        originCountry: dataEntryList?.originCountry,
        jobDate: dataEntryList?.jobDate,
        jobType: dataEntryList?.jobType,
        etaDate: dataEntryList?.etaDate,
        packagesUnit: dataEntryList?.packagesUnit,
        packageUnit: dataEntryList?.packageUnit,
        grossQtyUnit: dataEntryList?.grossQtyUnit,
        QtyUnit: dataEntryList?.QtyUnit,
        importerLedger: dataEntryList?.importerLedger,
        blNo: dataEntryList?.blNo,
        blDate: dataEntryList?.blDate,
        invoiceLedger: dataEntryList?.invoiceLedger,
        invoiceNo: dataEntryList?.invoiceNo,
        invoiceDate: dataEntryList?.invoiceDate,
        poNo: dataEntryList?.poNo,
        product: dataEntryList?.product,
        productDescription: dataEntryList?.productDescription,
        location: dataEntryList?.location,
        chaLedger: dataEntryList?.chaLedger,
        vessel: dataEntryList?.vessel,
        spaceRequiredunit: dataEntryList?.spaceRequiredunit,
        exporterLedger: dataEntryList?.exporterLedger,
        spaceRequired: dataEntryList?.spaceRequired,
        exporterCustomPort: dataEntryList?.exporterCustomPort,
        // Don't patch warehouseId here - we'll do it after loading warehouse list
        remarks: dataEntryList?.remarks,
        validity: dataEntryList?.validity,
        status: dataEntryList?.status,
        type: dataEntryList?.type,
        hsnCode: dataEntryList?.hsnCode,
        customDuty: dataEntryList?.customDuty,
        blofEN: dataEntryList?.blofEN || '',
        blofEDate: dataEntryList?.blofEDate || null,
        bondCode: bondCode || '',
        accessibleValue: dataEntryList?.accessibleValue || '',
        ContainerNumber: dataEntryList?.ContainerNumber || '',
        ContainerType: dataEntryList?.ContainerType || '',
        branch: dataEntryList?.branchId || '',
      });

      // Load warehouse data first, then patch the warehouse ID
      if (bondCode && bondCode.trim() !== '') {
        // Load warehouses for the bond code
        let warehousePayload = this.commonService.filterList();
        if (warehousePayload) {
          warehousePayload.query = { status: true, 'bondCode': bondCode };
        }
        if (warehousePayload?.size) warehousePayload.size = 1000;
        if (warehousePayload?.from) warehousePayload.from = 0;

        this.commonService.getSTList('warehouse', warehousePayload)?.subscribe((res: any) => {
          const docs = res?.documents || [];
          this.warehouseList = docs;

          // Now patch the warehouse ID after the list is loaded
          if (savedWarehouseId) {
            this.dataEntryForm.patchValue({
              warehouseId: savedWarehouseId
            });
            this.onWarehouseChange(savedWarehouseId); 
          }
        });
      }

      this.hsnCode = dataEntryList?.hsnCode;
      this.customDuty = dataEntryList?.customDuty;
    });
  }
  
  onNumberInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    let value = inputEl.value;
    if (/^\d+(\.\d{0,3})?$/.test(value)) {
      return;
    }
    value = value.replace(/(\.\d{3})\d+$/, '$1');
    inputEl.value = value;
  }
}