import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import * as Constant from 'src/app/shared/common-constants';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MatDrawer } from '@angular/material/sidenav';
import { AddPartyComponent } from 'src/app/admin/party-master/add-party/add-party.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-lorry-receipt-add',
  templateUrl: './lorry-receipt-add.component.html',
  styleUrls: ['./lorry-receipt-add.component.scss']
})
export class LorryReceiptAddComponent implements OnInit {
  bookingForm!: FormGroup;
  bookingType: string = '';
  pageTitle: string = '';
  submitted: boolean = false;
  isEditMode: boolean = false;
  
  showLRFields: boolean = false;
  showFreshFields: boolean = false;
  showJobNo: boolean = false;

  // Document upload
  uploadFile: File | null = null;
  uploadedDocs: any[] = [];
  invoiceFile: File | null = null;
  ewayBillFile: File | null = null;
  podFile: File | null = null;
  rcLicenseFile: File | null = null;
  signedLRFile: File | null = null;
  uomData: any[] = [];
  weighthData: any[] = [];
  batchList: any[] = [];
  batchDetails: any;
  selectedBatchData: any;
  lrNumber: string = '';

  // Party Master Lists
  consigneeList: any[] = [];
  partyMasterNameList: any[] = [];
  isAddMode: any[] = [];
  shipperList: any[] = [];
  bookingpartyList: any[] = [];
  invoicingpartyList: any[] = [];
  forwarderChaList: any[] = [];
  ops_coordinator: any[] = [];

  // Container Type List
  containerTypeList: any[] = [];

  // Dropdown options
  bookingTypeOptions = [
    { label: 'Paid', value: 'paid' },
    { label: 'To Pay', value: 'toPay' },
    { label: 'TBB (To Be Billed)', value: 'tbb' }
  ];

  statusOptions = [
    { label: 'Created', value: 'created' },
    { label: 'In Transit', value: 'in_transit' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Closed', value: 'closed' },
    { label: 'Cancelled', value: 'cancelled' }
  ];

  vehicleTypeOptions = [
    { label: 'Truck', value: 'truck' },
    { label: 'Trailer', value: 'trailer' },
    { label: 'Container Truck', value: 'containerTruck' },
    { label: 'Tempo', value: 'tempo' }
  ];

  materialTypeOptions = [
    { label: 'General', value: 'general' },
    { label: 'Fragile', value: 'fragile' },
    { label: 'Perishable', value: 'perishable' },
    { label: 'Hazardous', value: 'hazardous' }
  ];

  uomOptions = [
    { label: 'KG', value: 'kg' },
    { label: 'MT', value: 'mt' },
    { label: 'CBM', value: 'cbm' },
    { label: 'Pieces', value: 'pieces' }
  ];

  paymentTypeOptions = [
    { label: 'Cash', value: 'cash' },
    { label: 'Credit', value: 'credit' },
    { label: 'To Pay', value: 'toPay' },
    { label: 'Paid', value: 'paid' }
  ];

  trackingStatusOptions = [
    { label: 'At Warehouse', value: 'atWarehouse' },
    { label: 'On Route', value: 'onRoute' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Returned', value: 'returned' }
  ];

  containerSizeOptions = [
    { label: '20 FT', value: '20FT' },
    { label: '40 FT', value: '40FT' },
    { label: '40 HC', value: '40HC' },
    { label: '45 FT', value: '45FT' }
  ];

  containerConditionOptions = [
    { label: 'Good', value: 'good' },
    { label: 'Damaged', value: 'damaged' },
    { label: 'Needs Repair', value: 'needsRepair' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private _api: ApiService,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.initializeEmptyForm();
    this.getUOMDropDowns();
    this.getPartyMasterDropDowns();
    this.getSystemTypeDropDowns(); // Load container types

    this.route.data.subscribe(data => {
      this.bookingType = data['bookingType'] || 'lrBooking';
      this.setupFormByType();
    });

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.loadExistingLR(params['id']);
      } else {
        this.generateLRNumber();
      }
    });
  }

  @ViewChild('drawer') drawer!: MatDrawer;
  handleGetList(event) {
    this.getPartyMasterDropDowns()
    this.drawer.close(); 
  }

  onDrawerClose() {
    // this.getPartyMasterDropDowns()
  }

  addPartyMaster() {  
    let modalRef = this.modalService.open(AddPartyComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
      modalRef.componentInstance.isPopup = true; 
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {  
        this.getPartyMasterDropDowns()  
      }
    })
  }
  
  getSystemTypeDropDowns(): void {
    let payload = this.commonService.filterList();
    if (payload) {
      payload.query = {
        status: true,
        typeCategory: {
          $in: ['containerType'],
        },
      };
    }

    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter(
        (x) => x.typeCategory === 'containerType'
      ) || [];
      console.log('Container types loaded:', this.containerTypeList.length);
    });
  }

  initializeEmptyForm(): void {
    this.bookingForm = this.fb.group({
      jobNo: [''],
      
      // LR Details
      lrNumber: [{ value: '', disabled: true }],
      lrDate: [new Date().toISOString().split('T')[0], Validators.required],
      branch: ['', Validators.required],
      bookingType: [''],
      status: ['created', Validators.required],
      referenceNo: [''],
      bookingId: [''],

      // Transporter Details
      transporterName: ['', Validators.required],
      transporterAddress: [''],
      transporterGSTIN: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)],

      // Vehicle Details
      vehicleNumber: ['', Validators.required],
      driverName: ['', Validators.required],
      driverMobile: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      driverLicense: [''],
      vehicleType: ['', Validators.required],
      truckCapacity: [''],
      gpsDeviceId: [''],

      // Consignor Details (Shipper)
      consignor: ['', Validators.required],
      consignorAddress: ['', Validators.required],
      consignorGSTIN: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)],
      consignorContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],

      // Consignee Details
      cosignee: ['', Validators.required],
      consigneeAddress: ['', Validators.required],
      consigneeGSTIN: ['', Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)],
      consigneeContact: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      deliveryLocation: ['', Validators.required],

      // Origin & Destination
      origin: ['', Validators.required],
      destination: ['', Validators.required],

      // Container Details
      containers: this.fb.array([]),

      // Route Details
      routeLegs: this.fb.array([]),

      // Goods Details
      numberOfPackages: ['', [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(0)]],
      goodsDescription: ['', Validators.required],
      materialType: ['', Validators.required],
      uom: ['kg', Validators.required],
      invoiceNo: [''],
      invoiceValue: [''],

      // E-Way Bill
      ewayBillNumber: [''],
      ewayBillDate: [''],
      ewayBillValidUpto: [''],
      ewayBillStatus: ['pending'],
      isEwayBillRequired: [true],
      ewayBillExemptionReason: [''],

      // Freight & Payment
      freightAmount: ['', [Validators.required, Validators.min(0)]],
      loadingCharge: [0],
      unloadingCharge: [0],
      otherCharges: [0],
      handlingCharges: [0],
      gstAmount: [0],
      totalAmount: [{ value: 0, disabled: true }],
      paymentType: ['', Validators.required],
      paymentRemarks: [''],
      currency: ['INR'],

      // Tracking Details
      currentStatus: ['created'],
      currentLocation: [''],
      eta: [''],
      deliveryDate: [''],
      actualDeliveryDate: [''],

      // Document References
      invoiceDoc: [''],
      ewayBillDoc: [''],
      podDoc: [''],
      rcLicenseDoc: [''],
      signedLRDoc: [''],

      // Linked Invoices
      linkedInvoices: this.fb.array([]),

      // Audit Trail
      createdBy: [''],
      createdOn: [''],
      modifiedBy: [''],
      modifiedOn: [''],
      
      // Signatures
      consignorSignature: [''],
      transporterSignature: [''],
      consigneeSignature: [''],

      // General Remarks
      remarks: ['']
    });

    this.setupAutoCalculation();
  }

  
  getPartyMasterDropDowns() {
    let payload = this.commonService.filterList();
    if (payload) payload.query = { "status": true };
    
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partyMasterNameList = res?.documents || [];
      
      // Clear existing lists
      this.shipperList = [];
      this.bookingpartyList = [];
      this.invoicingpartyList = [];
      this.forwarderChaList = [];
      this.consigneeList = [];
      this.ops_coordinator = [];
      
      res?.documents?.forEach((party: any) => {
        if (party.customerType && Array.isArray(party.customerType)) {
          party.customerType.forEach((type: any) => {
            if (type?.item_text === 'Shipper') {
              this.shipperList.push(party);
            } else if (type?.item_text === 'Booking Party') {
              this.bookingpartyList.push(party);
            } else if (type?.item_text === 'Invoicing Party') {
              this.invoicingpartyList.push(party);
            } else if (type?.item_text === 'Forwarder') {
              this.forwarderChaList.push(party);
            } else if (type?.item_text === 'Consignee') {
              this.consigneeList.push(party);
            }
          });
        }
        if (party?.opsName) {
          this.ops_coordinator.push(party);
        }
      });

      console.log('Party Master Lists Loaded:', {
        shippers: this.shipperList.length,
        consignees: this.consigneeList.length
      });
    });
  }


  getUOMDropDowns(): void {
    const payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };
  
    this.commonService.getSTList('uom', payload)?.subscribe((data: any) => {
      this.uomData = data.documents || [];
      
      this.weighthData = data?.documents?.filter(
        (item: any) => item?.uomCategory?.toLowerCase() === 'weight' || 
                       item?.uomCategory?.toLowerCase() === 'wight'
      ) || [];
      
      this.uomOptions = this.weighthData.map((uom: any) => ({
        label: uom.uomName || uom.name || uom.label,
        value: uom.uomId || uom.id || uom.value
      }));
      
      console.log('UOM options loaded:', this.uomOptions.length);
    }, (error) => {
      console.error('Error loading UOM:', error);
    });
  }
  
  getConsigneeList() {
    const selectedConsignor = this.bookingForm?.get('consignor')?.value;
    return (this.consigneeList ?? []).filter(
      record => record?.partymasterId !== selectedConsignor
    );
  }

  getShipperList() {
    const selectedConsignee = this.bookingForm?.get('cosignee')?.value;
    return (this.shipperList ?? []).filter(
      record => record?.partymasterId !== selectedConsignee
    );
  }

  
  onConsignorChange(partymasterId: any) {
    if (!partymasterId) {
      this.clearConsignorFields();
      return;
    }

    const selectedParty = this.shipperList.find(
      (shipper) => shipper.partymasterId === partymasterId
    );

    if (selectedParty) {
      this.populateConsignorDetails(selectedParty);
    }
  }

  populateConsignorDetails(partyData: any) {
    let address = '';
    if (partyData.addressInfo && partyData.addressInfo.address) {
      address = partyData.addressInfo.address;
    } else if (partyData.branch && partyData.branch.length > 0) {
      address = partyData.branch[0].branch_address || '';
    } else if (partyData.address) {
      address = partyData.address;
    }

    let phoneNo = '';
    if (partyData.primaryNo && partyData.primaryNo.primaryNo) {
      phoneNo = partyData.primaryNo.primaryNo;
    } else if (partyData.customer && partyData.customer.length > 0 && partyData.customer[0].phoneNo) {
      phoneNo = partyData.customer[0].phoneNo;
    } else if (partyData.phoneNo) {
      phoneNo = partyData.phoneNo;
    } else if (partyData.contact) {
      phoneNo = partyData.contact;
    } else if (partyData.mobileNumber) {
      phoneNo = partyData.mobileNumber;
    }

    phoneNo = this.cleanPhoneNumber(phoneNo);

    let gstNo = '';
    if (partyData.kycGst) {
      gstNo = partyData.kycGst;
    } else if (partyData.gstNo) {
      gstNo = partyData.gstNo;
    } else if (partyData.branch && partyData.branch.length > 0) {
      gstNo = partyData.branch[0].kycGst || partyData.branch[0].tax_number || '';
    }

    this.bookingForm.patchValue({
      consignorAddress: address,
      consignorGSTIN: gstNo,
      consignorContact: phoneNo
    });
  }

  
  onConsigneeChange(partymasterId: any) {
    if (!partymasterId) {
      this.clearConsigneeFields();
      return;
    }

    const selectedParty = this.consigneeList.find(
      (consignee) => consignee.partymasterId === partymasterId
    );

    if (selectedParty) {
      this.populateConsigneeDetails(selectedParty);
    }
  }

  populateConsigneeDetails(partyData: any) {
    let address = '';
    if (partyData.addressInfo && partyData.addressInfo.address) {
      address = partyData.addressInfo.address;
    } else if (partyData.branch && partyData.branch.length > 0) {
      address = partyData.branch[0].branch_address || '';
    } else if (partyData.customer && partyData.customer.length > 0 && partyData.customer[0].address) {
      address = partyData.customer[0].address;
    } else if (partyData.address) {
      address = partyData.address;
    }

    let phoneNo = '';
    if (partyData.primaryNo && partyData.primaryNo.primaryNo) {
      phoneNo = partyData.primaryNo.primaryNo;
    } else if (partyData.customer && partyData.customer.length > 0 && partyData.customer[0].phoneNo) {
      phoneNo = partyData.customer[0].phoneNo;
    } else if (partyData.phoneNo) {
      phoneNo = partyData.phoneNo;
    } else if (partyData.contact) {
      phoneNo = partyData.contact;
    } else if (partyData.mobileNumber) {
      phoneNo = partyData.mobileNumber;
    }

    phoneNo = this.cleanPhoneNumber(phoneNo);

    let gstNo = '';
    if (partyData.kycGst) {
      gstNo = partyData.kycGst;
    } else if (partyData.gstNo) {
      gstNo = partyData.gstNo;
    } else if (partyData.branch && partyData.branch.length > 0) {
      gstNo = partyData.branch[0].kycGst || partyData.branch[0].tax_number || '';
    }

    this.bookingForm.patchValue({
      consigneeAddress: address,
      consigneeGSTIN: gstNo,
      consigneeContact: phoneNo
    });
  }

  
  private cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    phone = phone.toString().replace(/\D/g, '');
    if (phone.length > 10) {
      phone = phone.slice(-10);
    }
    return phone;
  }

  clearConsignorFields() {
    this.bookingForm.patchValue({
      consignorAddress: '',
      consignorGSTIN: '',
      consignorContact: ''
    });
  }

  clearConsigneeFields() {
    this.bookingForm.patchValue({
      consigneeAddress: '',
      consigneeGSTIN: '',
      consigneeContact: ''
    });
  }

  
  get containers(): FormArray {
    return this.bookingForm.get('containers') as FormArray;
  }

  createContainerGroup(): FormGroup {
    return this.fb.group({
      containerNumber: ['', Validators.required],
      containerSize: ['', Validators.required],
      containerType: ['', Validators.required],
      sealNumber: [''],
      containerCondition: ['good'],
      cargoDescription: [''],
      cargoWeight: [''],
      
      // Additional fields from API
      containerId: [''],
      containerTypeId: [''],
      containerTypeName: [''], // Add this line
      grossWeight: [''],
      netWeight: [''],
      cbm: [''],
      packageCount: [''],
      packageType: [''],
      tareWeight: [''],
      unit: ['KG']
    });
  }

getContainerTypeNameForDisplay(index: number): string {
  const containerGroup = this.getContainerFormGroup(index);
  const containerTypeName = containerGroup.get('containerTypeName')?.value;
  return containerTypeName || '';
}

  addContainer(): void {
    const newContainer = this.createContainerGroup();
    const index = this.containers.length;
    this.containers.push(newContainer);
    this.setupContainerWeightCalculation(index); // Add calculation listener
  }
  removeContainer(index: number): void {
    if (this.containers.length > 0) {
      this.containers.removeAt(index);
    }
  }

  // ==================== LOAD CONTAINERS FROM BATCH ====================
  
  loadContainersForBatch(batchId: string): void {
    if (!batchId) {
      return;
    }
  
    let payload = this.commonService.filterList();
    
    payload.query = {
      $or: [{
        "batchId": {
          "$in": [batchId]
        }
      }, {
        "batchwiseGrouping.batchId": {
          "$in": [batchId]
        }
      }]
    };
    
    payload.size = 1000;
    payload.from = 0;
  
  
    this._api.getSTList(Constant.CONTAINER_LIST, payload)?.subscribe(
      (data: any) => {
        
        if (data?.documents && data.documents.length > 0) {
          // Clear existing containers first
          this.clearAllContainers();
          data.documents.forEach((container: any, index: number) => {
            this.addContainerFromAPI(container);
          });
          
        } else {
          console.log('No containers found for this batch');
        }
      },
      (error) => {
        console.error('Error loading containers for batch:', error);
      }
    );
  }

  clearAllContainers(): void {
    while (this.containers.length > 0) {
      this.containers.removeAt(0);
    }
    console.log('All containers cleared');
  }

  addContainerFromAPI(containerData: any): void {
    const containerGroup = this.fb.group({
      containerNumber: [containerData.containerNumber || '', Validators.required],
      containerSize: [this.mapContainerSize(containerData.containerType), Validators.required],
      containerType: ['', Validators.required], // Empty - user must select
      sealNumber: [containerData.sealNo || ''],
      containerCondition: ['good'],
      cargoDescription: [containerData.containerDescription || containerData.containerType || ''],
      cargoWeight: [containerData.netWeight || ''],
      
      // Store API data for reference
      containerId: [containerData.containerId || ''],
      containerTypeId: [containerData.containerTypeId || ''],
      containerTypeName: [containerData.containerTypeName || ''], // Add this line
      grossWeight: [containerData.grossWeight || ''],
      netWeight: [containerData.netWeight || ''],
      cbm: [containerData.cbm || ''],
      packageCount: [containerData.package || ''],
      packageType: [containerData.packageType || ''],
      tareWeight: [containerData.tareWeight || ''],
      unit: [containerData.unit || 'KG']
    });
    
    const index = this.containers.length;
    this.containers.push(containerGroup);
    this.setupContainerWeightCalculation(index);
  }

  // Add this method in your component class
setupContainerWeightCalculation(index: number): void {
  const containerGroup = this.getContainerFormGroup(index);
  
  // Listen to changes in grossWeight and netWeight
  const grossWeight$ = containerGroup.get('grossWeight')?.valueChanges;
  const netWeight$ = containerGroup.get('netWeight')?.valueChanges;
  
  if (grossWeight$ && netWeight$) {
    // Subscribe to both fields
    grossWeight$.subscribe(() => this.calculateTareWeight(index));
    netWeight$.subscribe(() => this.calculateTareWeight(index));
  }
}

calculateTareWeight(index: number): void {
  const containerGroup = this.getContainerFormGroup(index);
  const grossWeight = Number(containerGroup.get('grossWeight')?.value) || 0;
  const netWeight = Number(containerGroup.get('netWeight')?.value) || 0;
  
  const tareWeight = grossWeight - netWeight;
  containerGroup.get('tareWeight')?.setValue(tareWeight >= 0 ? tareWeight : 0, { emitEvent: false });
}

  mapContainerSize(containerType: string): string {
    if (!containerType) return '';
    
    const typeUpper = containerType.toUpperCase();
    
    if (typeUpper.includes('20') && typeUpper.includes('HC')) return '20FT';
    if (typeUpper.includes('20')) return '20FT';
    if (typeUpper.includes('40') && (typeUpper.includes('HC') || typeUpper.includes('HIGH'))) return '40HC';
    if (typeUpper.includes('40')) return '40FT';
    if (typeUpper.includes('45')) return '45FT';
    
    return '';
  }


  
  get routeLegs(): FormArray {
    return this.bookingForm.get('routeLegs') as FormArray;
  }

  createRouteLegGroup(): FormGroup {
    return this.fb.group({
      legNumber: [''],
      fromLocation: [''],
      toLocation: [''],
      distance: [''],
      estimatedTime: [''],
      status: ['pending']
    });
  }

  addRouteLeg(): void {
    const legNumber = this.routeLegs.length + 1;
    const legGroup = this.createRouteLegGroup();
    legGroup.patchValue({ legNumber });
    this.routeLegs.push(legGroup);
  }

  removeRouteLeg(index: number): void {
    this.routeLegs.removeAt(index);
  }

  
  get linkedInvoices(): FormArray {
    return this.bookingForm.get('linkedInvoices') as FormArray;
  }

  createInvoiceGroup(): FormGroup {
    return this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [''],
      invoiceAmount: [''],
      invoiceStatus: ['pending']
    });
  }

  addLinkedInvoice(): void {
    this.linkedInvoices.push(this.createInvoiceGroup());
  }

  removeLinkedInvoice(index: number): void {
    this.linkedInvoices.removeAt(index);
  }


  
  generateLRNumber(): void {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const seq = String(Date.now()).slice(-4);
    this.lrNumber = `LR-${yearMonth}-${seq}`;
    this.bookingForm.patchValue({ lrNumber: this.lrNumber });
  }

  setupFormByType(): void {
    this.clearAllValidators();

    switch(this.bookingType) {
      case 'lrBooking':
        this.pageTitle = 'LR Booking';
        this.showLRFields = true;
        this.showFreshFields = false;
        this.showJobNo = true;
        this.setLRBookingValidators();
        this.getBatchList();
        break;

      case 'freshBooking':
        this.pageTitle = 'Fresh Booking';
        this.showLRFields = true;
        this.showFreshFields = false;
        this.showJobNo = false;
        this.setLRBookingValidators();
        break;

      default:
        this.pageTitle = 'General Booking';
        this.showLRFields = false;
        this.showFreshFields = false;
        this.showJobNo = false;
    }
  }

  clearAllValidators(): void {
    Object.keys(this.bookingForm.controls).forEach(key => {
      this.bookingForm.get(key)?.clearValidators();
      this.bookingForm.get(key)?.updateValueAndValidity();
    });
  }

  setLRBookingValidators(): void {
    const requiredFields = [
      'lrDate', 'branch', 'status',
      'transporterName', 'vehicleNumber', 'driverName', 'driverMobile',
      'consignor', 'consignorAddress', 'consignorContact',
      'cosignee', 'consigneeAddress', 'consigneeContact',
      'origin', 'destination', 'deliveryLocation',
      'numberOfPackages', 'weight', 'goodsDescription', 'materialType', 'uom',
      'freightAmount', 'paymentType'
    ];

    requiredFields.forEach(field => {
      this.bookingForm.get(field)?.setValidators([Validators.required]);
      this.bookingForm.get(field)?.updateValueAndValidity();
    });

    this.bookingForm.get('driverMobile')?.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]);
    this.bookingForm.get('consignorContact')?.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]);
    this.bookingForm.get('consigneeContact')?.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]{10}$/)
    ]);
  }

  setupAutoCalculation(): void {
    ['freightAmount', 'loadingCharge', 'unloadingCharge', 'otherCharges', 'handlingCharges', 'gstAmount']
      .forEach(field => {
        this.bookingForm.get(field)?.valueChanges.subscribe(() => {
          this.calculateTotalAmount();
        });
      });
  }

  calculateTotalAmount(): void {
    const freight = Number(this.bookingForm.get('freightAmount')?.value) || 0;
    const loading = Number(this.bookingForm.get('loadingCharge')?.value) || 0;
    const unloading = Number(this.bookingForm.get('unloadingCharge')?.value) || 0;
    const other = Number(this.bookingForm.get('otherCharges')?.value) || 0;
    const handling = Number(this.bookingForm.get('handlingCharges')?.value) || 0;
    const gst = Number(this.bookingForm.get('gstAmount')?.value) || 0;
    
    const total = freight + loading + unloading + other + handling + gst;
    this.bookingForm.get('totalAmount')?.setValue(total, { emitEvent: false });
  }

  // ==================== BATCH METHODS ====================
  
  getBatchList(): void {
    const parameter = {
      query: {
        isExport: true,
        // "enquiryDetails.basicDetails.loadType": { $in: ['LCL', 'Loose'] }
      },
      sort: { desc: ["createdOn"] },
      size: 10000,
      from: 0
    };

    this._api.getSTList(Constant.BATCH, parameter).subscribe(
      (data: any) => {
        this.batchList = data.documents.map((batch: any) => ({
          ...batch,
          palletDetails: batch?.enquiryDetails?.looseCargoDetails?.cargos
        }));
      },
      (error) => console.error('Error loading batch list:', error)
    );
  }

  setselect(batchId: any): void {
    if (!batchId) {
      this.clearBatchData();
      return;
    }
  
    this.batchDetails = this.batchList.find((x) => x.batchId === batchId);
    if (this.batchDetails) {
      this.patchBatchDataToForm(this.batchDetails);
      // Add small delay to ensure form is ready
      setTimeout(() => {
        this.loadContainersForBatch(batchId);
      }, 200);
    }
  }

  patchBatchDataToForm(batchData: any): void {
    const enquiryDetails = batchData.enquiryDetails;
    const basicDetails = enquiryDetails?.basicDetails;
    const routeDetails = enquiryDetails?.routeDetails;
    const looseCargoDetails = enquiryDetails?.looseCargoDetails;
    const consignorDetails = enquiryDetails?.consignorDetails;
    const consigneeDetails = enquiryDetails?.consigneeDetails;

    let consignorId = null;
    if (consignorDetails?.partymasterId) {
      consignorId = consignorDetails.partymasterId;
    } else if (basicDetails?.shipperName) {
      const foundShipper = this.shipperList.find(s => 
        s.name === basicDetails.shipperName || 
        s.partyShortcode === basicDetails.shipperName
      );
      if (foundShipper) {
        consignorId = foundShipper.partymasterId;
      }
    }

    let consigneeId = null;
    if (consigneeDetails?.partymasterId) {
      consigneeId = consigneeDetails.partymasterId;
    } else if (basicDetails?.consigneeName) {
      const foundConsignee = this.consigneeList.find(c => 
        c.name === basicDetails.consigneeName || 
        c.partyShortcode === basicDetails.consigneeName
      );if (foundConsignee) {
        consigneeId = foundConsignee.partymasterId;
      }
    }

    this.bookingForm.patchValue({
      bookingId: batchData.batchId,
      consignor: consignorId,
      cosignee: consigneeId,
      origin: routeDetails?.loadPortName || routeDetails?.origin || '',
      destination: routeDetails?.destPortName || routeDetails?.destination || '',
      deliveryLocation: routeDetails?.destPortName || '',
      goodsDescription: looseCargoDetails?.cargos?.[0]?.pkgname || '',
      numberOfPackages: looseCargoDetails?.cargos?.[0]?.units || '',
      weight: looseCargoDetails?.cargos?.[0]?.Weightselected || '',
      branch: basicDetails?.branch || '',
      referenceNo: batchData.batchNo || ''
    });

    setTimeout(() => {
      if (consignorId) {
        this.onConsignorChange(consignorId);
      }
      if (consigneeId) {
        this.onConsigneeChange(consigneeId);
      }
    }, 100);
  }

  clearBatchData(): void {
    const currentJobNo = this.bookingForm.get('jobNo')?.value;
    
    // Clear form fields
    this.bookingForm.patchValue({
      consignor: null,
      consignorAddress: '',
      consignorGSTIN: '',
      consignorContact: '',
      cosignee: null,
      consigneeAddress: '',
      consigneeGSTIN: '',
      consigneeContact: '',
      origin: '',
      destination: '',
      deliveryLocation: '',
      goodsDescription: '',
      numberOfPackages: '',
      weight: '',
      branch: '',
      referenceNo: '',
      bookingId: ''
    });
    
    // Clear all containers
    this.clearAllContainers();
    
    this.batchDetails = null;
    
    // Restore job no if it was just cleared
    if (!currentJobNo) {
      this.bookingForm.get('jobNo')?.setValue(null);
    }
    
    console.log('Batch data cleared');
  }

  getContainerFormGroup(index: number): FormGroup {
    return this.containers.at(index) as FormGroup;
  }

  
  selectFile(event: any, docType: string): void {
    const file = event.target.files[0];
    if (!file) return;

    const filename = file.name;
    
    switch(docType) {
      case 'invoice':
        this.invoiceFile = file;
        this.bookingForm.patchValue({ invoiceDoc: filename });
        break;
      case 'ewayBill':
        this.ewayBillFile = file;
        this.bookingForm.patchValue({ ewayBillDoc: filename });
        break;
      case 'pod':
        this.podFile = file;
        this.bookingForm.patchValue({ podDoc: filename });
        break;
      case 'rcLicense':
        this.rcLicenseFile = file;
        this.bookingForm.patchValue({ rcLicenseDoc: filename });
        break;
      case 'signedLR':
        this.signedLRFile = file;
        this.bookingForm.patchValue({ signedLRDoc: filename });
        break;
    }
  }

  uploadDocument(file: File, docType: string, refId: string): void {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('name', file.name);

    this.commonService.uploadDocuments('uploadfile', formData).subscribe(
      (uploadRes) => {
        const payload = {
          documentName: file.name,
          documentType: docType,
          tags: [],
          Doc: file.name,
          remarks: `${docType} for LR`,
          documentURL: file.name,
          refType: "LR",
          tenantId: "1",
          documentId: "",
          documentStatusId: "",
          refId: refId,
          isActive: true,
          orgId: this.batchDetails?.orgId || '',
          addressId: "",
          documentStatus: true,
          isEmailDocument: true
        };

        this.commonService.addToST('document', payload).subscribe(
          (res) => {
            console.log(`${docType} uploaded successfully`);
            this.uploadedDocs.push(res);
          },
          (error) => console.error(`Failed to upload ${docType}`, error)
        );
      },
      (error) => console.error('File upload error:', error)
    );
  }

  documentPreview(docName: string): void {
    if (!docName) {
      this.notification.warning('Warning', 'No document available to preview');
      return;
    }
  
    this.commonService.downloadDocuments('downloadfile', docName).subscribe(
      (res: Blob) => {
        if (!res || res.size === 0) {
          this.notification.error('Error', 'Document not found or empty');
          return;
        }
  
        const fileType = docName.split('.').pop()?.toLowerCase() || '';
        let mimeType = 'application/octet-stream';
  
        // Set proper MIME types
        if (fileType === 'pdf') {
          mimeType = 'application/pdf';
        } else if (['jpg', 'jpeg'].includes(fileType)) {
          mimeType = 'image/jpeg';
        } else if (fileType === 'png') {
          mimeType = 'image/png';
        } else if (fileType === 'gif') {
          mimeType = 'image/gif';
        }
  
        const blob = new Blob([res], { type: mimeType });
        const url = URL.createObjectURL(blob);
  
        if (fileType === 'pdf') {
          window.open(url, '_blank');
        } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)) {
          const imgWindow = window.open('', '_blank');
          if (imgWindow) {
            imgWindow.document.write(`
              <html>
                <head>
                  <title>${docName}</title>
                  <style>
                    body { margin: 0; display: flex; justify-content: center; align-items: center; background: #000; }
                    img { max-width: 100%; max-height: 100vh; }
                  </style>
                </head>
                <body>
                  <img src="${url}" alt="${docName}" />
                </body>
              </html>
            `);
          }
        } else {
          // Download other file types
          const link = document.createElement('a');
          link.href = url;
          link.download = docName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
      (error) => {
        console.error('Document preview error:', error);
        this.notification.error('Error', 'Failed to load document. Please try again.');
      }
    );
  }
  

  
  get f() {
    return this.bookingForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
  
    if (this.bookingForm.invalid) {
      Object.keys(this.bookingForm.controls).forEach(key => {
        const control = this.bookingForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
          console.log(`Invalid field: ${key}`, control.errors);
        }
      });
      this.notification.error('Validation Error', 'Please fill all required fields correctly');
      return;
    }
  
    const rawFormData = this.bookingForm.getRawValue();
    
    // Get consignor name and details
    const consignorId = rawFormData.consignor;
    const consignorData = this.shipperList.find(s => s.partymasterId === consignorId);
    const consignorName = consignorData?.name || '';
    const consignorShortcode = consignorData?.partyShortcode || '';
    
    // Get consignee name and details
    const consigneeId = rawFormData.cosignee;
    const consigneeData = this.consigneeList.find(c => c.partymasterId === consigneeId);
    const consigneeName = consigneeData?.name || '';
    const consigneeShortcode = consigneeData?.partyShortcode || '';
    
    // Get UOM details
    const uomId = rawFormData.uom;
    const uomData = this.weighthData.find(u => u.uomId === uomId);
    const uomName = uomData?.uomName || uomData?.uomShort || '';
    
    // Process containers to include type names and unit names
    const processedContainers = rawFormData.containers?.map((container: any) => {
      const containerTypeData = this.containerTypeList.find(
        ct => ct.systemtypeId === container.containerType
      );
      
      const containerUnitData = this.weighthData.find(
        u => u.uomId === container.unit
      );
      
      // Get container size label
      const containerSizeLabel = this.containerSizeOptions.find(
        opt => opt.value === container.containerSize
      )?.label || container.containerSize || '';
      
      // Get container condition label
      const containerConditionLabel = this.containerConditionOptions.find(
        opt => opt.value === container.containerCondition
      )?.label || container.containerCondition || '';
      
      return {
        ...container,
        // Add all name fields
        containerTypeName: containerTypeData?.typeName || '',
        containerSizeLabel: containerSizeLabel,
        containerConditionLabel: containerConditionLabel,
        unitName: containerUnitData?.uomShort || containerUnitData?.uomName || 'KG',
        
        // Keep IDs as well
        containerTypeId: container.containerType,
        containerSizeValue: container.containerSize,
        containerConditionValue: container.containerCondition,
        unitId: container.unit
      };
    }) || [];
  
    const formData = {
      ...rawFormData,
      bookingType: this.bookingType,
      
      // Add consignor details
      consignor: consignorId,
      consignorName: consignorName,
      consignorShortcode: consignorShortcode,
      
      // Add consignee details
      cosignee: consigneeId,
      consigneeName: consigneeName,
      consigneeShortcode: consigneeShortcode,
      
      // Add UOM details
      uom: uomId,
      uomName: uomName,
      unit: uomName, // Some APIs expect 'unit' field
      
      // Replace containers with processed ones
      containers: processedContainers,
      
      // Only include batch details if they exist
      ...(this.batchDetails?.batchId && { batchId: this.batchDetails.batchId }),
      ...(this.batchDetails?.batchNo && { batchNo: this.batchDetails.batchNo }),
    };
    
    console.log('Form Data to Submit:', formData); // Debug log
    
    if (this.isEditMode) {
      this.updateLR(formData);
    } else {
      this.saveLR(formData);
    }
  }

  updateLR(formData: any): void {
  const lorryreceiptId = this.route.snapshot.params['id']; // Get ID from route
  
  this.commonService.UpdateToST(`lorryreceipt/${lorryreceiptId}`, formData)?.subscribe(
    (res: any) => {
      console.log('LR updated successfully:', res);
      
      const lrId = res.lrId || res.id || res._id || lorryreceiptId;
      
      // Upload any new documents
      if (this.invoiceFile) this.uploadDocument(this.invoiceFile, 'Invoice', lrId);
      if (this.ewayBillFile) this.uploadDocument(this.ewayBillFile, 'E-Way Bill', lrId);
      if (this.podFile) this.uploadDocument(this.podFile, 'POD', lrId);
      if (this.rcLicenseFile) this.uploadDocument(this.rcLicenseFile, 'RC/License', lrId);
      if (this.signedLRFile) this.uploadDocument(this.signedLRFile, 'Signed LR', lrId);
      
      this.notification.success('Success', 'Lorry Receipt updated successfully');
      
      setTimeout(() => {
        this.router.navigate(['/lr/booking']);
      }, 1000);
    },
    (error) => {
      console.error('Error updating LR:', error);
      this.notification.error('Error', error?.error?.message || 'Failed to update Lorry Receipt');
    }
  );
}

  saveLR(formData: any): void {

    
    this.commonService.addToST("lorryreceipt", formData).subscribe(
      (res: any) => {
        console.log('LR saved successfully:', res);
        
        const lrId = res.lrId || res.id || res._id;
        
        if (this.invoiceFile) this.uploadDocument(this.invoiceFile, 'Invoice', lrId);
        if (this.ewayBillFile) this.uploadDocument(this.ewayBillFile, 'E-Way Bill', lrId);
        if (this.podFile) this.uploadDocument(this.podFile, 'POD', lrId);
        if (this.rcLicenseFile) this.uploadDocument(this.rcLicenseFile, 'RC/License', lrId);
        if (this.signedLRFile) this.uploadDocument(this.signedLRFile, 'Signed LR', lrId);
        
        this.sendNotifications(lrId, formData);
        
        this.router.navigate(['/lr/booking']);
      },
      (error) => console.error('Error saving LR:', error)
    );
  }

  sendNotifications(lrId: string, lrData: any): void {
    const notificationPayload = {
      lrId: lrId,
      lrNumber: lrData.lrNumber,
      consigneeName: lrData.consigneeName,
      consigneeContact: lrData.consigneeContact,
      driverMobile: lrData.driverMobile,
      status: lrData.status
    };
  }

  loadExistingLR(id: string): void {
    const payload = {
      query: { lorryreceiptId: id }
    };
  
    this.commonService.getSTList('lorryreceipt', payload)?.subscribe({
      next: (data: any) => {
        if (data?.documents && data.documents.length > 0) {
          const lrData = data.documents[0];
          
          // Store and setup booking type FIRST
          this.bookingType = lrData.bookingType || 'lrBooking';
          this.setupFormByType();
          
          // Patch all form values
          this.bookingForm.patchValue({
            jobNo: lrData.jobNo || lrData.bookingId,
            lrNumber: lrData.lrNumber,
            lrDate: lrData.lrDate ? lrData.lrDate.split('T')[0] : '',
            branch: lrData.branch,
            bookingType: lrData.bookingType, // This was missing!
            status: lrData.status,
            referenceNo: lrData.referenceNo,
            bookingId: lrData.bookingId,
            
            transporterName: lrData.transporterName,
            transporterAddress: lrData.transporterAddress,
            transporterGSTIN: lrData.transporterGSTIN,
            
            vehicleNumber: lrData.vehicleNumber,
            driverName: lrData.driverName,
            driverMobile: lrData.driverMobile,
            driverLicense: lrData.driverLicense,
            vehicleType: lrData.vehicleType,
            truckCapacity: lrData.truckCapacity,
            gpsDeviceId: lrData.gpsDeviceId,
            
            consignor: lrData.consignor,
            consignorAddress: lrData.consignorAddress,
            consignorGSTIN: lrData.consignorGSTIN,
            consignorContact: lrData.consignorContact,
            
            cosignee: lrData.cosignee,
            consigneeAddress: lrData.consigneeAddress,
            consigneeGSTIN: lrData.consigneeGSTIN,
            consigneeContact: lrData.consigneeContact,
            deliveryLocation: lrData.deliveryLocation,
            
            origin: lrData.origin,
            destination: lrData.destination,
            
            numberOfPackages: lrData.numberOfPackages,
            weight: lrData.weight,
            goodsDescription: lrData.goodsDescription,
            materialType: lrData.materialType,
            uom: lrData.uom || lrData.unit,
            invoiceNo: lrData.invoiceNo,
            invoiceValue: lrData.invoiceValue,
            
            ewayBillNumber: lrData.ewayBillNumber,
            ewayBillDate: lrData.ewayBillDate ? lrData.ewayBillDate.split('T')[0] : '',
            ewayBillValidUpto: lrData.ewayBillValidUpto ? lrData.ewayBillValidUpto.split('T')[0] : '',
            ewayBillStatus: lrData.ewayBillStatus || 'pending',
            isEwayBillRequired: lrData.isEwayBillRequired !== false,
            ewayBillExemptionReason: lrData.ewayBillExemptionReason,
            
            freightAmount: lrData.freightAmount,
            loadingCharge: lrData.loadingCharge || 0,
            unloadingCharge: lrData.unloadingCharge || 0,
            otherCharges: lrData.otherCharges || 0,
            handlingCharges: lrData.handlingCharges || 0,
            gstAmount: lrData.gstAmount || 0,
            totalAmount: lrData.totalAmount || 0,
            paymentType: lrData.paymentType,
            paymentRemarks: lrData.paymentRemarks,
            currency: lrData.currency || 'INR',
            
            currentStatus: lrData.currentStatus || lrData.status,
            currentLocation: lrData.currentLocation,
            eta: lrData.eta,
            deliveryDate: lrData.deliveryDate ? lrData.deliveryDate.split('T')[0] : '',
            actualDeliveryDate: lrData.actualDeliveryDate ? lrData.actualDeliveryDate.split('T')[0] : '',
            
            invoiceDoc: lrData.invoiceDoc || '',
            ewayBillDoc: lrData.ewayBillDoc || '',
            podDoc: lrData.podDoc || '',
            rcLicenseDoc: lrData.rcLicenseDoc || '',
            signedLRDoc: lrData.signedLRDoc || '',
            
            consignorSignature: lrData.consignorSignature,
            transporterSignature: lrData.transporterSignature,
            consigneeSignature: lrData.consigneeSignature,
            
            remarks: lrData.remarks
          });
          
          this.lrNumber = lrData.lrNumber;
          
          // Load containers
          if (lrData.containers && Array.isArray(lrData.containers)) {
            this.clearAllContainers();
            lrData.containers.forEach((container: any, index: number) => {
              this.addContainerFromExistingData(container, index);
            });
          }
          
          // Load route legs
          if (lrData.routeLegs && Array.isArray(lrData.routeLegs)) {
            while (this.routeLegs.length > 0) {
              this.routeLegs.removeAt(0);
            }
            lrData.routeLegs.forEach((leg: any) => {
              const legGroup = this.createRouteLegGroup();
              legGroup.patchValue(leg);
              this.routeLegs.push(legGroup);
            });
          }
          
          // Load linked invoices
          if (lrData.linkedInvoices && Array.isArray(lrData.linkedInvoices)) {
            while (this.linkedInvoices.length > 0) {
              this.linkedInvoices.removeAt(0);
            }
            lrData.linkedInvoices.forEach((invoice: any) => {
              const invoiceGroup = this.createInvoiceGroup();
              invoiceGroup.patchValue(invoice);
              this.linkedInvoices.push(invoiceGroup);
            });
          }
          
          this.calculateTotalAmount();
          
          this.notification.success('Success', 'Lorry Receipt loaded successfully');
        } else {
          this.notification.error('Error', 'Lorry Receipt not found');
          this.router.navigate(['/lr/booking']);
        }
      },
      error: (error) => {
        console.error('Error loading LR:', error);
        this.notification.error('Error', 'Failed to load Lorry Receipt');
        this.router.navigate(['/lr/booking']);
      }
    });
  }

  addContainerFromExistingData(container: any, index: number): void {
    const containerGroup = this.fb.group({
      containerNumber: [container.containerNumber || '', Validators.required],
      containerSize: [container.containerSize || '', Validators.required],
      containerType: [container.containerType || '', Validators.required],
      sealNumber: [container.sealNumber || ''],
      containerCondition: [container.containerCondition || 'good'],
      cargoDescription: [container.cargoDescription || ''],
      cargoWeight: [container.cargoWeight || ''],
      containerId: [container.containerId || ''],
      containerTypeId: [container.containerTypeId || ''],
      containerTypeName: [container.containerTypeName || ''],
      grossWeight: [container.grossWeight || ''],
      netWeight: [container.netWeight || ''],
      cbm: [container.cbm || ''],
      packageCount: [container.packageCount || ''],
      packageType: [container.packageType || ''],
      tareWeight: [container.tareWeight || ''],
      unit: [container.unit || 'KG']
    });
    
    this.containers.push(containerGroup);
    this.setupContainerWeightCalculation(this.containers.length - 1);
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (!field || !field.errors) return '';
    
    if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (field.errors['pattern']) {
      if (fieldName.includes('GSTIN')) return 'Invalid GSTIN format (15 characters)';
      if (fieldName.includes('Mobile') || fieldName.includes('Contact')) return 'Invalid mobile number (10 digits)';
    }
    if (field.errors['min']) return 'Value must be greater than or equal to minimum';
    
    return 'Invalid value';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'transporterName': 'Transporter Name',
      'vehicleNumber': 'Vehicle Number',
      'driverName': 'Driver Name',
      'driverMobile': 'Driver Mobile',
      'transporterGSTIN': 'Transporter GSTIN',
      'consignor': 'Consignor',
      'consignorAddress': 'Consignor Address',
      'consignorContact': 'Consignor Contact',
      'consignorGSTIN': 'Consignor GSTIN',
      // Add more as needed
    };
    return labels[fieldName] || fieldName;
  }

  onCancel(): void {
    this.router.navigate(['/lr/booking']);
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field?.hasError(errorType) && (field?.touched || this.submitted));
  }

  resetForm(): void {
    this.submitted = false;
    this.bookingForm.reset();
    this.batchDetails = null;
    this.invoiceFile = null;
    this.ewayBillFile = null;
    this.podFile = null;
    this.rcLicenseFile = null;
    this.signedLRFile = null;
    
    while (this.containers.length > 0) {
      this.containers.removeAt(0);
    }
    
    this.bookingForm.patchValue({
      lrDate: new Date().toISOString().split('T')[0],
      status: 'created',
      currentStatus: 'created',
      uom: 'kg',
      loadingCharge: 0,
      unloadingCharge: 0,
      otherCharges: 0,
      handlingCharges: 0,
      gstAmount: 0,
      currency: 'INR',
      ewayBillStatus: 'pending',
      isEwayBillRequired: true
    });

    this.generateLRNumber();
  }

  // Helper method to get container type name by ID
  getContainerTypeName(containerTypeId: string): string {
    const containerType = this.containerTypeList.find(ct => ct.systemtypeId === containerTypeId);
    return containerType?.typeName || '';
  }
}