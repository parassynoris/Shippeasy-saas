import { Component, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, FormArray, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-inwards',
  templateUrl: './inwards.component.html',
  styleUrls: ['./inwards.component.scss']
})
export class InwardsComponent implements OnInit {
  inwardsForm: FormGroup;
  submitted = false;
  submitted1 = false;
  editIndex: number | null = null;
  type: string = '';
  isBonded: boolean = true;
  isNonBonded: boolean = false;
  showShiftingFields: boolean = false;
  showDirectStuffFields: boolean = false;
  containersList: any[] = [];
  warehouseList: any[] = [];
  weighthData: any[] = [];
  surveyorList: any[] = [];
  containerNoList: any[] = [];
  filteredWarehouseList: any[] = [];
  containerList: any[] = [];
  billOfEntryList: any[] = [];
  transportList: any[] = [];
  weighbridgeList: any[] = [];
  warehouseGodown: string[] = [];
  activityOptions: any[] = [];
  array: any[] = [];
  editbillOfEntry: any = {};
  uomData: any;
  dataEntryList: any[] = [];
  warehouseinwardData: any;
  gateInEntries: any;
  batchDetails: any;
  id: any;
  warehouseinwardDataId: any;
  isEditMode: boolean = false;
  maxAvailableQty: number = 0;
  remainingQty: number = 0;
  isclone: boolean = false;
  locationList: any[] = [];
  damageContainerList: any[] = [];
  partymasterList: any;
  TransporterList: any;

  private nonBondedVisibleFields = [
    'location',
    'partyName',
    'vesselName',
    'grossQty',
    'weightbridgeName',
    'weightmentSlip',
    'warehouseWeightmentgrossQty',
    'packageType',
    'inDate',
    'surveyorName',
    'containerNoNonBonded',
    'transportName',
    'totalPackages',
    'totalUnit',
    'inwardRemark',
    'labourSection',
    'damageGoodsSection',
    'activitySection',
    'warehouseWeightmentSection',
    'vehicleNo',
    'jobNo',
    'directStuffContainerNo',
    'directStuffVehicleNo',
    'directStuffQty',
    'directStuffPackageType'
  ];

  private bondedOnlyFields = [
    'receiptDateTime',
    'gatePassNo',
    'date',
    'packages',
    'unit',
    'remarks',
    'bofeContainerNo',
    'warehouseGodown',
    'weightbridgeName',
    'weightmentSlip',
    'containerNo',
    'chaLedgerName',
    'sealNo',
    'importerLedgerName',
    'cfsSealNo',
    'inwardsblDate',
    'productDescription',
    'whBeNo',
    'beDate',
    'blNo',
    'blDate',
    'preparedBy',
    'activityType',
    'shiftingFields',
    'grossQty',
    'tareQty',
    'warehouseWeightmentgrossQty',
    'netQty',
    'qtyUnit'
  ];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private commonFunction: CommonFunctions,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    this.initializeStaticData();
    this.initializeRouteParams();
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
  }

  private initializeStaticData(): void {
    this.billOfEntryList = [
      { id: 'BE001', name: 'BE Entry 001' },
      { id: 'BE002', name: 'BE Entry 002' },
      { id: 'BE003', name: 'BE Entry 003' }
    ];

    this.activityOptions = [
      { value: 'shifting', label: 'Shifting' },
      { value: 'directStuff', label: 'Direct Stuff' },
      { value: 'deStuffing', label: 'De Stuffing' },
      { value: 'reworkingForCustomExam', label: 'Reworking For Custom Exam' }
    ];

    this.transportList = [{ id: 1, name: 'XYZ Transport' }];
    this.weighbridgeList = [
      { id: 1, name: 'Weighbridge A' },
      { id: 2, name: 'Weighbridge B' }
    ];
    this.warehouseGodown = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  }

  private initializeRouteParams(): void {
    this.id = this.route.snapshot?.params['id'];
    this.warehouseinwardDataId = this.route.snapshot?.params?.['moduleId'];
    const action = this.router.url.includes('/edit') ? 'edit' : 'add';
    this.isclone = this.router.url.includes('/clone') ? true : false;
    this.isEditMode = this.isclone ? true : action === 'edit';
  }

  private loadInitialData(): void {
    this.getWarehouseDispatchById(this.id);
    this.getUomList();
    this.getwarehouseData();
    this.getbillentry();
    this.fetchGateInEntries();
    this.loadLocationList();
    this.loadDamageContainerList();
    this.getPartyMasterDropDowns();

    this.getWarehouseDataEntry();

    if (this.warehouseinwardDataId) {
      setTimeout(() => {
        this.getinwardsData();
      }, 100);
    }
  }

  initializeForm(): void {
    this.inwardsForm = this.fb.group({
      receiptDateTime: [null],
      gatePassNo: [''],
      date: [null],
      vehicleNo: [''],
      transportName: [''],
      surveyorName: [''],
      location: [''],
      warehouseName: [{ value: '', disabled: true }],
      inwardRemark: [''],
      totalPackages: [''],
      totalUnit: [''],
      partyName: [''],
      vesselName: [''],
      grossQty: [''],
      weightbridgeName: [''],
      weightmentSlip: [''],
      type: [""],
      tareQty: [''],
      warehouseWeightmentgrossQty: [''],
      netQty: [''],
      qtyUnit: [''],
      packageType: [''],
      inDate: [null],
      truckNo: [''],
      containerNoNonBonded: [''],
      packages: [''],
      unit: [''],
      warehousecontainerId: [''],
      remarks: [''],
      vehicleNo1: [''],
      warehouseId: [''],
      activityType: [''],
      bofeContainerNo: [''],
      containerType: [{ value: '', disabled: true }],
      warehouseGodown: [''],
      containerNo: [''],
      chaLedgerName: [{ value: '', disabled: true }],
      sealNo: [''], // Not mandatory
      importerLedgerName: [{ value: '', disabled: true }],
      cfsSealNo: [''], // Not mandatory
      inwardsblDate: [''],
      productDescription: [''],
      whBeNo: [{ value: '', disabled: true }],
      beDate: [{ value: '', disabled: true }],
      blNo: [{ value: '', disabled: true }],
      blDate: [{ value: '', disabled: true }],
      preparedBy: [''],
      jobNo: [''],

      // Activity type checkboxes
      shifting: [false],
      directStuff: [false],
      stuffing: [false],
      BTT: [false],
      deStuffing: [false],
      impLoadingWarehouse: [false],
      reworkingForCustomExam: [false],

      // Direct Stuff specific fields
      directStuffContainerNo: [''],
      directStuffVehicleNo: [''],
      directStuffQty: [''],
      directStuffPackageType: [''],

      // Damage goods fields - None are mandatory
      damageProductDescription: [''],
      damageTotalPackages: [''],
      damageUnit: [''],
      damageGrossQty: [''],
      damageGrossUnit: [''],
      damageContainerNo: [''],

      // Form arrays
      shiftingFields: this.fb.array([]),
      labourDetails: this.fb.array([])
    });

    this.addShiftingField();
    this.addLabourRow();
    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions(): void {
    this.inwardsForm.get('shifting')?.valueChanges.subscribe(value => {
      this.showShiftingFields = value;
      this.updateShiftingValidation(value);
    });

    this.inwardsForm.get('activityType')?.valueChanges.subscribe(value => {
      this.showShiftingFields = value === 'shifting';
      this.showDirectStuffFields = value === 'directStuff';
      this.updateShiftingValidation(value === 'shifting');
    });

    this.inwardsForm.get('gatePassNo')?.valueChanges.subscribe((selectedGatePassNo) => {
      this.onGatePassNoChange(selectedGatePassNo);
    });

    this.inwardsForm.get('location')?.valueChanges.subscribe((selectedLocationId) => {
      this.onLocationChange(selectedLocationId);
    });

    this.inwardsForm.get('warehouseWeightmentgrossQty')?.valueChanges.subscribe(() => {
      this.calculateNetQty();
    });

    this.inwardsForm.get('tareQty')?.valueChanges.subscribe(() => {
      this.calculateNetQty();
    });
  }

  calculateNetQty(): void {
    const grossQty = parseFloat(this.inwardsForm.get('warehouseWeightmentgrossQty')?.value) || 0;
    const tareQty = parseFloat(this.inwardsForm.get('tareQty')?.value) || 0;

    if (grossQty > 0 && tareQty > 0) {
      const netQty = grossQty - tareQty;
      this.inwardsForm.get('netQty')?.setValue(netQty, { emitEvent: false });
    } else {
      this.inwardsForm.get('netQty')?.setValue('', { emitEvent: false });
    }
  }

  loadLocationList(): void {
    const payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = { status: true };
    }

    this.commonService?.getSTList("warehouse", payload)?.subscribe((res: any) => {
      this.locationList = res?.documents || [];
    });
  }


  printData() {
    let reportpayload = { "parameters": { "warehouseinwardId": this.warehouseinwardDataId } };
    this.commonService.pushreports(reportpayload, 'inward_slip').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
      }
    })
  }

  onLocationChanges(selectedWarehouseId: string): void {
    const selected = this.locationList.find(
      (item: any) => item.warehouseId === selectedWarehouseId
    );
    if (selected) {
      this.inwardsForm.get('warehouseName')?.setValue(selected.wareHouseName);
    } else {
      this.inwardsForm.get('warehouseName')?.reset();
    }
  }

  loadDamageContainerList(): void {
    const payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };
    }

    this.commonService?.getSTList("warehousecontainer", payload)?.subscribe((res: any) => {
      this.damageContainerList = res?.documents || [];
    });
  }

  onLocationChange(selectedLocationId: string): void {
    if (selectedLocationId) {
      const selectedLocation = this.locationList.find(
        location => location.locationId === selectedLocationId
      );

      if (selectedLocation?.warehouseId) {
        const selectedWarehouse = this.warehouseList.find(
          warehouse => warehouse.warehouseId === selectedLocation.warehouseId
        );

        if (selectedWarehouse) {
          this.inwardsForm.patchValue({
            warehouseName: selectedWarehouse.wareHouseName || selectedWarehouse.name,
            warehouseId: selectedWarehouse.warehouseId
          });
        }
      }
    } else {
      this.inwardsForm.patchValue({
        warehouseName: this.dataEntryList?.[0]?.warehouseName || '',
        warehouseId: ''
      });
    }
  }

  getWarehouseDataEntry(): void {
    const payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = { "warehousedataentryId": this.route.snapshot.params['id'] };
    }

    this.commonService?.getSTList("warehousedataentry", payload)?.subscribe((res: any) => {
      console.log('res?.documents', res?.documents);
      this.dataEntryList = res?.documents || [];

      if (this.dataEntryList.length > 0) {
        const dataEntry = this.dataEntryList[0];
        this.type = dataEntry?.type || 'Bonded';

        if (this.type === 'Non Bonded' && dataEntry?.jobNo) {
          this.inwardsForm.patchValue({
            jobNo: dataEntry.jobNo
          });
        }

        this.updateFormBasedOnType();
        this.setupFilteredWarehouses();
        this.patchCommonFormValues();
      }
    });
  }

  getwarehouseData(bondCode?: string): void {
    const payload = this.commonService.filterList();
    if (payload) {
      payload.query = { status: true };
      if (bondCode) {
        payload.query['bondCode'] = bondCode;
      }
    }

    if (payload?.size) payload.size = 1000;
    if (payload?.from) payload.from = 0;

    this.commonService.getSTList('warehouse', payload)?.subscribe((res: any) => {
      this.warehouseList = res?.documents || [];
      this.setupFilteredWarehouses();
    });
  }

  getUomList(): void {
    const payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };

    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      const result = data?.documents?.filter(
        item => item?.uomCategory?.toLowerCase() === 'weight' || item?.uomCategory?.toLowerCase() === 'wight'
      );
      this.weighthData = result
      // this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
    });

    const userpayload = this.commonService.filterList();
    if (userpayload) {
      userpayload.query = { 'userType': 'warehouse' };
    }

    this.commonService.getSTList('user', userpayload)?.subscribe((data) => {
      this.surveyorList = data?.documents;

      const id = this.commonFunction.getAgentDetails()?.userId;
      if (!this.warehouseinwardDataId && !this.inwardsForm.get('surveyorName')?.value && this.surveyorList?.some(dd => dd?.userId === id)) {
        this.inwardsForm.get('surveyorName')?.setValue(id);
      }
    });
  }

  fetchGateInEntries(): void {
    const payload = {
      query: { warehousedataentryId: this.id }
    };

    this.commonService.getSTList('warehousegateinentry', payload)?.subscribe({
      next: (res: any) => {
        this.gateInEntries = res?.documents?.length > 0 ? res.documents : [];
      },
      error: (error: any) => {
        console.error('Fetch error:', error);
        this.notification.error('Error', 'Failed to load entries');
        this.gateInEntries = [];
      }
    });
  }

  getbillentry(): void {
    const payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };
    }

    this.commonService?.getSTList("warehousebillofentry", payload)?.subscribe((res: any) => {
      this.editbillOfEntry = res?.documents?.[0];
      this.maxAvailableQty = this.editbillOfEntry?.grossQty || 0;

      if (this.editbillOfEntry?.whBeNo) {
        this.inwardsForm.patchValue({ whBeNo: this.editbillOfEntry.whBeNo });
      }
      if (this.editbillOfEntry?.date) {
        this.inwardsForm.patchValue({ beDate: this.editbillOfEntry?.date });
      }

      this.containerNoList = this.editbillOfEntry?.containers || [];
      this.updateShiftingFieldValidation();
    });
  }

  getWarehouseDispatchById(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };

    this.commonService.getSTList('warehouseinward', payload)?.subscribe(
      (inwardRes: any) => {
        this.array = inwardRes?.documents || [];
        const usedContainerNos = this.array.map(item => item.bofeContainerNo).filter(Boolean);

        this.commonService.getSTList('warehousecontainer', payload)?.subscribe(
          (containerRes: any) => {
            const containers = containerRes?.documents || [];

            this.commonService.getSTList('warehousegateinentry', payload)?.subscribe(
              (gateInRes: any) => {
                const gateInDocs = gateInRes?.documents || [];

                if (this.isEditMode && this.warehouseinwardDataId) {
                  this.containerList = containers.map((container, index) => {
                    const gateInMatch = gateInDocs.find(
                      g => g.warehousecontainerId === container.warehousecontainerId
                    );
                    return {
                      ...container,
                      id: index + 1,
                      toppleContainerNo: gateInMatch?.toppleContainerNo || null
                    };
                  });
                } else {
                  this.containerList = containers
                    .filter(container => !usedContainerNos.includes(container.containerNo) && container.gateInStatus === "Done")
                    .map((container, index) => {
                      const gateInMatch = gateInDocs.find(
                        g => g.warehousecontainerId === container.warehousecontainerId
                      );
                      return {
                        ...container,
                        id: index + 1,
                        toppleContainerNo: gateInMatch?.toppleContainerNo || null
                      };
                    });
                }
              },
              (error) => {
                console.error('Error fetching gate-in entries:', error);
                this.containerList = [];
              }
            );
          },
          (error) => {
            console.error('Error fetching container list:', error);
            this.containerList = [];
          }
        );
      },
      (error) => {
        console.error('Error fetching inward data:', error);
        this.array = [];
        this.containerList = [];
      }
    );
  }

  getinwardsData(): void {
    const payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        "$and": [
          { warehousedataentryId: this.route.snapshot.params['id'] },
          { warehouseinwardId: this.warehouseinwardDataId }
        ]
      };
    } else {
      payload.query = { warehousedataentryId: this.id };
    }

    this.commonService.getSTList('warehouseinward', payload)?.subscribe((res: any) => {
      this.warehouseinwardData = res?.documents?.[0] || [];
      if (res?.documents?.length > 0) {
        this.patchFormValues(res.documents[0]);
      } else {
        this.inwardsForm.reset();
        this.warehouseinwardDataId = null;
      }
    });
  }

  updateFormBasedOnType(): void {
    this.isBonded = this.type === 'Bonded';
    this.isNonBonded = this.type === 'Non Bonded';

    this.clearAllValidators();

    if (this.isNonBonded) {
      this.addValidatorsForNonBondedFields();
    } else {
      this.addValidatorsForBondedFields();
    }

    this.inwardsForm.updateValueAndValidity();
  }

  private clearAllValidators(): void {
    Object.keys(this.inwardsForm.controls).forEach(key => {
      const control = this.inwardsForm.get(key);
      if (control && !(control instanceof FormArray)) {
        control.clearValidators();
        control.updateValueAndValidity();
      }
    });
  }

  private addValidatorsForNonBondedFields(): void {
    const requiredFields = [
      'vehicleNo', 'transportName', 'surveyorName', 'location', 'partyName', 'vesselName',
      'grossQty', 'packageType', 'inDate', 'containerNoNonBonded',
      'totalPackages', 'totalUnit', 'inwardRemark', 'weightbridgeName', 'weightmentSlip',
      'warehouseWeightmentgrossQty'
    ];

    requiredFields.forEach(field => {
      const control = this.inwardsForm.get(field);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    });

    // Add validators for Direct Stuff fields when activity is directStuff
    this.inwardsForm.get('activityType')?.valueChanges.subscribe(value => {
      if (value === 'directStuff') {
        const directStuffFields = ['directStuffContainerNo', 'directStuffVehicleNo', 'directStuffQty', 'directStuffPackageType'];
        directStuffFields.forEach(field => {
          const control = this.inwardsForm.get(field);
          if (control) {
            control.setValidators([Validators.required]);
            control.updateValueAndValidity();
          }
        });
      }
    });

    // Add validators for labour details
    this.updateLabourValidators();
  }

  private addValidatorsForBondedFields(): void {
    const requiredFields = [
      'gatePassNo', 'receiptDateTime', 'date', 'vehicleNo', 'transportName', 'surveyorName',
      'location', 'packages', 'unit', 'bofeContainerNo', 'warehouseGodown',
      'productDescription', 'totalPackages', 'totalUnit', 'inwardRemark', 'weightbridgeName',
      'weightmentSlip', 'warehouseWeightmentgrossQty', 'tareQty', 'qtyUnit'
    ];

    requiredFields.forEach(field => {
      const control = this.inwardsForm.get(field);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    });

    this.updateShiftingValidation(this.inwardsForm.get('activityType')?.value === 'shifting');
    this.updateLabourValidators();
  }

  private updateLabourValidators(): void {
    const labourDetailsArray = this.labourDetails;
    labourDetailsArray.controls.forEach(control => {
      const typeControl = control.get('type');
      const nameControl = control.get('name');
      const remarksControl = control.get('remarks');

      if (typeControl) {
        typeControl.setValidators([Validators.required]);
        typeControl.updateValueAndValidity();
      }
      if (nameControl) {
        nameControl.setValidators([Validators.required]);
        nameControl.updateValueAndValidity();
      }
      if (remarksControl) {
        remarksControl.setValidators([Validators.required]);
        remarksControl.updateValueAndValidity();
      }
    });
  }

  isFieldVisible(fieldName: string): boolean {
    if (this.isNonBonded) {
      return this.nonBondedVisibleFields.includes(fieldName);
    }

    const nonBondedOnlyFields = [
      'partyName', 'vesselName', 'packageType', 'inDate',
      'truckNo', 'containerNoNonBonded', 'directStuffContainerNo',
      'directStuffVehicleNo', 'directStuffQty', 'directStuffPackageType'
    ];

    if (this.bondedOnlyFields.includes(fieldName)) {
      return this.isBonded;
    }

    return !nonBondedOnlyFields.includes(fieldName);
  }

  isSectionVisible(sectionName: string): boolean {
    if (this.isNonBonded) {
      const nonBondedVisibleSections = ['labourSection', 'damageGoodsSection', 'activitySection', 'warehouseWeightmentSection'];
      return nonBondedVisibleSections.includes(sectionName);
    }

    if (sectionName === 'warehouseWeightmentSection') {
      return true;
    }

    return true;
  }

  get shiftingFields(): FormArray {
    return this.inwardsForm.get('shiftingFields') as FormArray;
  }

  get labourDetails(): FormArray {
    return this.inwardsForm.get('labourDetails') as FormArray;
  }

  addShiftingField(): void {
    const shiftingGroup = this.fb.group({
      fromLocation: [this.dataEntryList?.[0]?.warehouseName || ''],
      toLocation: [''],
      quantity: ['']
    });

    // Add validators if bonded and shifting is active
    if (this.isBonded && this.showShiftingFields) {
      shiftingGroup.get('fromLocation')?.setValidators([Validators.required]);
      shiftingGroup.get('toLocation')?.setValidators([Validators.required]);
      shiftingGroup.get('quantity')?.setValidators([Validators.required, this.quantityValidator]);
    }

    this.shiftingFields.push(shiftingGroup);
  }

  removeShiftingField(index: number): void {
    this.shiftingFields.removeAt(index);
  }

  addLabourRow(): void {
    const labourGroup = this.createLabourFormGroup();
    this.labourDetails.push(labourGroup);
  }

  createLabourFormGroup(type: string = ''): FormGroup {
    const baseGroup: any = {
      type: [type, Validators.required],
      name: ['', Validators.required],
      remarks: ['', Validators.required]
    };

    switch (type) {
      case 'labour':
        baseGroup.hourlyRate = [''];
        baseGroup.workingHours = [''];
        break;
      case 'vendor':
        baseGroup.serviceType = [''];
        baseGroup.contractAmount = [''];
        break;
      case 'machine':
        baseGroup.machineModel = [''];
        baseGroup.rentalCost = [''];
        break;
    }

    return this.fb.group(baseGroup);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'labour':
        return 'Labour';
      case 'vendor':
        return 'Vendor';
      case 'machine':
        return 'Machine';
      default:
        return 'Name';
    }
  }

  getNamePlaceholder(type: string): string {
    switch (type) {
      case 'labour':
        return 'Enter Labour Name';
      case 'vendor':
        return 'Enter Vendor Name';
      case 'machine':
        return 'Enter Machine Name';
      default:
        return 'Enter Name';
    }
  }

  onTypeChange(index: number, selectedType: string): void {
    const currentFormGroup = this.labourDetails.at(index) as FormGroup;
    const currentValues = {
      type: selectedType,
      name: currentFormGroup.get('name')?.value || '',
      remarks: currentFormGroup.get('remarks')?.value || ''
    };

    this.labourDetails.removeAt(index);
    const newFormGroup = this.createLabourFormGroup(selectedType);

    newFormGroup.patchValue(currentValues);

    this.labourDetails.insert(index, newFormGroup);
  }

  removeLabourRow(index: number): void {
    this.labourDetails.removeAt(index);
  }

  get f() {
    return this.inwardsForm.controls;
  }

  getPartyMasterDropDowns() {
    this.partymasterList = []
    this.TransporterList = []
    let payload = this.commonService.filterList()
    if (payload) payload.query = { "status": true }
    this.commonService.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents;
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.map((res: any) => {
            if (res?.item_text === 'WareHouseTransporter') { this.TransporterList.push(x) }
          })
        }
      });
    });
  }

  onGatePassNoChange(selectedGatePassNo: string): void {
    if (selectedGatePassNo) {
      const selectedEntry = (this.gateInEntries ?? []).find(
        (entry: any) => entry.gatePassNumber === selectedGatePassNo
      );
      if (selectedEntry) {
        this.inwardsForm.patchValue({
          vehicleNo: selectedEntry.truckNumber || '',
          receiptDateTime: selectedEntry.entryDateTime || '',
          transportName: this.TransporterList?.find((x: any) => x?.partymasterId === selectedEntry?.transporter)?.name || '',
          packages: selectedEntry.packages || '',
          unit: selectedEntry.unit || selectedEntry.unitId || ''
        });
      }
    }
  }

  onContainerType(selectedContainerNo: string): void {
    const selectedContainer = this.containerList.find(
      container => container.containerNo === selectedContainerNo
    );

    if (selectedContainer) {
      this.inwardsForm.patchValue({
        containerType: selectedContainer.containerNo || '',
        containerNumber: selectedContainer.containerNo || '',
        warehousecontainerId: selectedContainer.warehousecontainerId || ''
      });
    } else {
      this.inwardsForm.patchValue({
        containerType: '',
        containerNumber: '',
        warehousecontainerId: ''
      });
    }
  }

  onWarehouseChange(selectedWarehouseId: string): void {
    const selectedWarehouse = this.warehouseList.find(
      (wh: any) => wh.warehouseId === selectedWarehouseId
    );
  }

  onActivityTypeChange(selectedActivity: string): void {
    this.showShiftingFields = selectedActivity === 'shifting';
    this.showDirectStuffFields = selectedActivity === 'directStuff';

    this.inwardsForm.patchValue({
      activityType: selectedActivity
    });

    this.activityOptions.forEach(option => {
      this.inwardsForm.get(option.value)?.setValue(false);
    });
    if (selectedActivity) {
      this.inwardsForm.get(selectedActivity)?.setValue(true);
    }

    if (this.isBonded) {
      this.updateShiftingValidation(selectedActivity === 'shifting');
    }

    // Update direct stuff validation for non-bonded
    if (this.isNonBonded && selectedActivity === 'directStuff') {
      const directStuffFields = ['directStuffContainerNo', 'directStuffVehicleNo', 'directStuffQty', 'directStuffPackageType'];
      directStuffFields.forEach(field => {
        const control = this.inwardsForm.get(field);
        if (control) {
          control.setValidators([Validators.required]);
          control.updateValueAndValidity();
        }
      });
    }
  }

  onShiftingChange(event: any, selectedType: string): void {
    this.showShiftingFields = selectedType === 'shifting';
    this.showDirectStuffFields = selectedType === 'directStuff';

    this.inwardsForm.patchValue({
      activityType: selectedType
    });

    const allOptions = this.activityOptions.map(c => c?.value);
    const deselect = allOptions.filter(d => d !== selectedType);

    this.inwardsForm.get(selectedType)?.setValue(true);
    deselect.forEach(option => {
      this.inwardsForm.get(option)?.setValue(false);
    });

    // Update validation based on selected type
    this.onActivityTypeChange(selectedType);
  }

  onQuantityChange(index: number): void {
    this.updateShiftingFieldValidation();
    this.calculateRemainingQuantity();
  }

  onEdit(index: number): void {
    this.inwardsForm.patchValue(this.containersList[index]);
    this.editIndex = index;
    this.showShiftingFields = this.inwardsForm.get('shifting')?.value || this.inwardsForm.get('activityType')?.value === 'shifting' || false;
    this.showDirectStuffFields = this.inwardsForm.get('activityType')?.value === 'directStuff' || false;
  }

  onDelete(index: number): void {
    this.containersList.splice(index, 1);
    if (this.editIndex === index) {
      this.inwardsForm.reset();
      this.editIndex = null;
      this.showShiftingFields = false;
      this.showDirectStuffFields = false;
    }
  }

  onCancelEdit(): void {
    this.router.navigate([
      `/warehouse/main-ware-house/details/${this.id}/${this.route.snapshot.params['key']}`
    ]);
  }

  setupFilteredWarehouses(): void {
    if (this.dataEntryList?.[0]?.warehouseName && this.warehouseList?.length > 0) {
      const currentWarehouseName = this.dataEntryList[0].warehouseName.toLowerCase();
      this.filteredWarehouseList = this.warehouseList.filter(warehouse =>
        warehouse.name?.toLowerCase() !== currentWarehouseName &&
        warehouse.wareHouseName?.toLowerCase() !== currentWarehouseName
      );
    } else {
      this.filteredWarehouseList = this.warehouseList || [];
    }
  }

  patchCommonFormValues(): void {
    const dataEntry = this.dataEntryList?.[0];
    if (!dataEntry) return;

    this.inwardsForm.patchValue({
      fromLocation: this.dataEntryList?.[0]?.warehouseName || '',
      jobNo: dataEntry.jobNo || ''
    });

    // **NEW CODE: Auto-patch party name for Non Bonded from invoiceLedgerName**
    if (this.isNonBonded && dataEntry.invoiceLedgerName) {
      this.inwardsForm.patchValue({
        partyName: dataEntry.invoiceLedgerName
      });
    }

    this.shiftingFields.controls.forEach(control => {
      control.patchValue({
        fromLocation: this.dataEntryList?.[0]?.warehouseName || ''
      });
    });

    const fieldsToPath = ['jobNo', 'productDescription', 'chaLedgerName', 'importerLedgerName', 'blNo', 'blDate'];
    fieldsToPath.forEach(field => {
      if (dataEntry[field]) {
        this.inwardsForm.patchValue({ [field]: dataEntry[field] });
      }
    });
  }

  updateShiftingValidation(isShifting: boolean): void {
    if (isShifting && this.isBonded) {
      this.shiftingFields.controls.forEach(control => {
        control.get('fromLocation')?.setValidators([Validators.required]);
        control.get('toLocation')?.setValidators([Validators.required]);
        control.get('quantity')?.setValidators([Validators.required, this.quantityValidator]);
        control.get('fromLocation')?.updateValueAndValidity();
        control.get('toLocation')?.updateValueAndValidity();
        control.get('quantity')?.updateValueAndValidity();
      });
    } else {
      this.shiftingFields.controls.forEach(control => {
        control.get('fromLocation')?.clearValidators();
        control.get('toLocation')?.clearValidators();
        control.get('quantity')?.clearValidators();
        control.get('fromLocation')?.updateValueAndValidity();
        control.get('toLocation')?.updateValueAndValidity();
        control.get('quantity')?.updateValueAndValidity();
      });

      this.inwardsForm.patchValue({
        fromLocation: this.dataEntryList?.[0]?.warehouseName || '',
        toLocation: '',
        quantity: ''
      });
    }
  }

  getWarehouseNameById(warehouseId: string): string {
    const warehouse = this.filteredWarehouseList.find(w => w.warehouseId === warehouseId);
    return warehouse?.wareHouseName || warehouse?.name || '';
  }

  getFilteredContainerList(): any[] {
    const selectedContainerNos = this.containersList.map((c, index) => {
      return index === this.editIndex ? null : c.bofeContainerNo;
    }).filter(Boolean);

    return this.containerNoList.filter(container => !selectedContainerNos.includes(container.containerNo));
  }

  toUppercase(controlName: string): void {
    const value = this.inwardsForm.get(controlName)?.value || '';
    this.inwardsForm.get(controlName)?.setValue(value.toUpperCase(), { emitEvent: false });
  }

  calculateRemainingQuantity(): number {
    let totalShiftingQty = 0;
    const shiftingFieldsArray = this.shiftingFields as FormArray;

    shiftingFieldsArray.controls.forEach(control => {
      const qty = control.get('quantity')?.value || 0;
      totalShiftingQty += Number(qty);
    });

    this.remainingQty = this.maxAvailableQty - totalShiftingQty;
    return this.remainingQty;
  }

  calculateTotalShiftingQuantity(): number {
    let total = 0;
    const shiftingFieldsArray = this.shiftingFields as FormArray;

    shiftingFieldsArray.controls.forEach(control => {
      const qty = control.get('quantity')?.value || 0;
      total += Number(qty);
    });

    return total;
  }

  updateShiftingFieldValidation(): void {
    const shiftingFieldsArray = this.shiftingFields as FormArray;
    shiftingFieldsArray.controls.forEach(control => {
      const quantityControl = control.get('quantity');
      if (quantityControl) {
        quantityControl.updateValueAndValidity();
      }
    });
  }

  quantityValidator = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return { required: true };
    }

    const quantity = Number(control.value);
    if (quantity <= 0) {
      return { min: true };
    }

    const totalShiftingQty = this.calculateTotalShiftingQuantity();
    const currentFieldQty = Number(control.value) || 0;
    const otherFieldsQty = totalShiftingQty - currentFieldQty;

    if (otherFieldsQty + currentFieldQty > this.maxAvailableQty) {
      return {
        exceedsAvailable: true,
        maxAvailable: this.maxAvailableQty,
        totalShifting: otherFieldsQty + currentFieldQty
      };
    }

    return null;
  };

  patchFormValues(data: any): void {
    this.inwardsForm.patchValue({
      billOfEntryNo: data.billOfEntryNo || null,
      jobNo: data.jobNo || '',
      receiptDateTime: data.receiptDateTime || null,
      gatePassNo: data.gatePassNo || '',
      date: data.date || null,
      vehicleNo: data.vehicleNo || '',
      transportName: data.transportName || '',
      activityType: data?.activityType ?? '',
      surveyorName: data.surveyorName || '',
      packages: data.packages || '',
      unit: data.unit || '',
      warehousecontainerId: data.warehousecontainerId || '',
      remarks: data.remarks || '',
      vehicleNo1: data.vehicleNo1 || '',
      warehouseId: data.warehouseId || '',
      location: data.location || '',
      warehouseName: data.warehouseName || '',
      bofeContainerNo: data.bofeContainerNo || '',
      containerType: data.containerType || data.bofeContainerNo || '',
      warehouseGodown: data.warehouseGodown || '',
      containerNo: data.containerNo || '',
      containerNumber: data.containerNumber || '',
      chaLedgerName: data.chaLedgerName || '',
      inwardRemark: data.inwardRemark || '',
      sealNo: data.sealNo || '',
      importerLedgerName: data.importerLedgerName || '',
      cfsSealNo: data.cfsSealNo || '',
      inwardsblDate: data.inwardsblDate || '',
      productDescription: data.productDescription || '',
      whBeNo: data.whBeNo || '',
      beDate: data.beDate || '',
      blNo: data.blNo || '',
      blDate: data.blDate || '',
      totalPackages: data.totalPackages || '',
      totalUnit: data.totalUnit || '',
      preparedBy: data.preparedBy || '',
      shifting: data.shifting || false,
      directStuff: data.directStuff || false,
      stuffing: data.stuffing || false,
      BTT: data.BTT || false,
      deStuffing: data.deStuffing || false,
      impLoadingWarehouse: data.impLoadingWarehouse || false,
      reworkingForCustomExam: data.reworkingForCustomExam || false,
      damageProductDescription: data.damageProductDescription || '',
      damageTotalPackages: data.damageTotalPackages || '',
      damageGrossQty: data.damageGrossQty || '',
      damageGrossUnit: data.damageGrossUnit || '',
      damageUnit: data.damageUnit || '',
      damageContainerNo: data.damageContainerNo || '',
      partyName: data.partyName || '',
      vesselName: data.vesselName || '',
      grossQty: data.grossWeight || data.grossQty || '',
      weightbridgeName: data.weightbridgeName || "",
      weightmentSlip: data.weightmentSlip || "",
      tareQty: data.tareWeight || data.tareQty || '',
      warehouseWeightmentgrossQty: data.warehouseWeightmentgrossQty || data.warehouseWeightmentgrossQty,
      netQty: data.netWeight || data.netQty || '',
      qtyUnit: data.weightUnit || data.qtyUnit || '',
      packageType: data.unitOrBulk || data.packageType || '',
      inDate: data.inDate || null,
      truckNo: data.truckNo || '',
      containerNoNonBonded: data.containerNoNonBonded || '',
      directStuffContainerNo: data.directStuffContainerNo || '',
      directStuffVehicleNo: data.directStuffVehicleNo || '',
      directStuffQty: data.directStuffQty || '',
      directStuffPackageType: data.directStuffPackageType || ''
    });

    this.patchShiftingFields(data);
    this.patchLabourDetails(data);

    if (data.bofeContainerNo) {
      setTimeout(() => {
        this.onContainerType(data.bofeContainerNo);
      }, 0);
    }

    if (data.location) {
      setTimeout(() => {
        this.onLocationChange(data.location);
      }, 0);
    }

    this.showShiftingFields = data.shifting || data.activityType === 'shifting' || false;
    this.showDirectStuffFields = data.directStuff || data.activityType === 'directStuff' || false;

    this.setupFilteredWarehouses();
  }

  private patchShiftingFields(data: any): void {
    if (data.shiftingFields && data.shiftingFields.length > 0) {
      this.shiftingFields.clear();
      data.shiftingFields.forEach((field: any) => {
        const shiftingGroup = this.fb.group({
          fromLocation: [field.fromLocation || this.dataEntryList?.[0]?.warehouseName || ''],
          toLocation: [field.toLocation || ''],
          quantity: [field.quantity || '']
        });
        this.shiftingFields.push(shiftingGroup);
      });
    } else {
      if (this.shiftingFields.length === 0) {
        this.addShiftingField();
      } else {
        this.shiftingFields.controls.forEach(control => {
          control.patchValue({
            fromLocation: this.dataEntryList?.[0]?.warehouseName || ''
          });
        });
      }
    }
  }

  private patchLabourDetails(data: any): void {
    if (data.labourDetails && data.labourDetails.length > 0) {
      this.labourDetails.clear();
      data.labourDetails.forEach((labour: any) => {
        const type = labour.type || '';
        const labourGroup = this.createLabourFormGroup(type);

        const labourData: any = {
          type: type,
          name: labour.name || labour.labourName || '',
          remarks: labour.remarks || labour.labourRemarks || ''
        };

        switch (type) {
          case 'labour':
            labourData.hourlyRate = labour.hourlyRate || '';
            labourData.workingHours = labour.workingHours || '';
            break;
          case 'vendor':
            labourData.serviceType = labour.serviceType || '';
            labourData.contractAmount = labour.contractAmount || '';
            break;
          case 'machine':
            labourData.machineModel = labour.machineModel || '';
            labourData.rentalCost = labour.rentalCost || '';
            break;
        }

        labourGroup.patchValue(labourData);
        this.labourDetails.push(labourGroup);
      });
    } else {
      if (this.labourDetails.length === 0) {
        this.addLabourRow();
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.inwardsForm.valid) {
      this.inwardsForm.markAllAsTouched();
      this.markFormGroupTouched();
      return;
    }

    const formData = this.inwardsForm.getRawValue();
    const payload = this.buildSubmissionPayload(formData);

    if (this.warehouseinwardData?.warehouseinwardId && !this.isclone) {
      this.updateRecord(payload);
    } else {
      this.createRecord(payload);
    }
  }

  private buildSubmissionPayload(formData: any): any {
    const selectedContainer = this.containerList.find(
      container => container.containerNo === formData?.bofeContainerNo
    );

    const basePayload = {
      "warehousedataentryId": this.id,
      "type": this.type,
      "surveyorName": formData?.surveyorName,
      "surveyorNameText": this.surveyorList?.find((surveyor: any) => surveyor.userId === formData?.surveyorName)?.name || '',
      "transportName": formData?.transportName,
      "location": formData?.location,
      "locationName": this.locationList?.find((loc: any) => loc.warehouseId === formData?.location)?.location || '',
      "warehouseName": formData?.warehouseName,
      "totalPackages": formData?.totalPackages,
      "totalUnit": formData?.totalUnit,
      "totalUnitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.totalUnit)?.uomName || '',
      "totalUnitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.totalUnit)?.uomShort || '',
      "inwardRemark": formData?.inwardRemark,
      "vehicleNo": formData?.vehicleNo,
      "jobNo": formData?.jobNo,
      "damageProductDescription": formData?.damageProductDescription,
      "damageTotalPackages": formData?.damageTotalPackages,
      "damageGrossQty": formData?.damageGrossQty,
      "damageUnit": formData?.damageUnit,
      "damageUnitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.damageUnit)?.uomName || '',
      "damageUnitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.damageUnit)?.uomShort || '',
      "damageGrossUnit": formData?.damageGrossUnit,
      "damageGrossUnitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.damageGrossUnit)?.uomName || '',
      "damageGrossUnitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.damageGrossUnit)?.uomShort || '',
      "damageContainerNo": formData?.damageContainerNo,
      "shifting": formData?.shifting,
      "directStuff": formData?.directStuff,
      "stuffing": formData?.stuffing,
      "BTT": formData?.BTT,
      "deStuffing": formData?.deStuffing,
      "impLoadingWarehouse": formData?.impLoadingWarehouse,
      "reworkingForCustomExam": formData?.reworkingForCustomExam,
      "activityType": formData?.activityType,
      "labourDetails": this.formatLabourDetailsForSubmission(formData?.labourDetails),
    };

    if (this.isBonded) {
      Object.assign(basePayload, {
        "receiptDateTime": formData?.receiptDateTime,
        "gatePassNo": formData?.gatePassNo,
        "date": formData?.date,
        "packages": formData?.packages,
        "unit": formData?.unit,
        "unitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.unit)?.uomName || '',
        "unitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.unit)?.uomShort || '',
        "warehousecontainerId": formData?.warehousecontainerId || selectedContainer?.warehousecontainerId || '',
        "remarks": formData?.remarks,
        "warehouseId": formData?.warehouseId,
        "bofeContainerNo": formData?.bofeContainerNo,
        "containerType": formData?.containerType || selectedContainer?.containerType || '',
        "containerTypeName": selectedContainer?.containerType || this.containerNoList.find((c: any) => c.containerNo === formData?.containerType)?.containerType || '',
        "warehouseGodown": formData?.warehouseGodown,
        "containerNo": formData?.containerNo,
        "containerNumber": formData?.containerNumber,
        "chaLedgerName": formData?.chaLedgerName,
        "sealNo": formData?.sealNo,
        "importerLedgerName": formData?.importerLedgerName,
        "cfsSealNo": formData?.cfsSealNo,
        "inwardsblDate": formData?.inwardsblDate,
        "productDescription": formData?.productDescription,
        "whBeNo": formData?.whBeNo,
        "beDate": formData?.beDate,
        "blNo": formData?.blNo,
        "blDate": formData?.blDate,
        "preparedBy": formData?.preparedBy,
        "shiftingFields": formData?.shiftingFields,
        "grossWeight": formData?.grossQty,
        'weightbridgeName': formData?.weightbridgeName,
        'weightmentSlip': formData?.weightmentSlip,
        "tareWeight": formData?.tareQty,
        "warehouseWeightmentgrossQty": formData?.warehouseWeightmentgrossQty,
        "netWeight": formData?.netQty,
        "weightUnit": formData?.qtyUnit,
        "weightUnitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.qtyUnit)?.uomName || '',
        "weightUnitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.qtyUnit)?.uomShort || ''
      });
    }

    if (this.isNonBonded) {
      Object.assign(basePayload, {
        "partyName": formData?.partyName,
        "vesselName": formData?.vesselName,
        "grossWeight": formData?.grossQty,
        'weightbridgeName': formData?.weightbridgeName,
        'weightmentSlip': formData?.weightmentSlip,
        "warehouseWeightmentgrossQty": formData?.warehouseWeightmentgrossQty,
        // DO NOT include tareWeight, netWeight, and weightUnit for Non Bonded
        "unitOrBulk": formData?.packageType,
        "inDate": formData?.inDate,
        "containerNoNonBonded": formData?.containerNoNonBonded,
        "directStuffContainerNo": formData?.directStuffContainerNo,
        "directStuffVehicleNo": formData?.directStuffVehicleNo,
        "directStuffQty": formData?.directStuffQty,
        "directStuffPackageType": formData?.directStuffPackageType
      });
    }

    if (this.isBonded) {
      Object.assign(basePayload, {
        "receiptDateTime": formData?.receiptDateTime,
        "gatePassNo": formData?.gatePassNo,
        "date": formData?.date,
        "packages": formData?.packages,
        "unit": formData?.unit,
        "unitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.unit)?.uomName || '',
        "unitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.unit)?.uomShort || '',
        "warehousecontainerId": formData?.warehousecontainerId || selectedContainer?.warehousecontainerId || '',
        "remarks": formData?.remarks,
        "warehouseId": formData?.warehouseId,
        "bofeContainerNo": formData?.bofeContainerNo,
        "containerType": formData?.containerType || selectedContainer?.containerType || '',
        "containerTypeName": selectedContainer?.containerType || this.containerNoList.find((c: any) => c.containerNo === formData?.containerType)?.containerType || '',
        "warehouseGodown": formData?.warehouseGodown,
        "containerNo": formData?.containerNo,
        "containerNumber": formData?.containerNumber,
        "chaLedgerName": formData?.chaLedgerName,
        "sealNo": formData?.sealNo,
        "importerLedgerName": formData?.importerLedgerName,
        "cfsSealNo": formData?.cfsSealNo,
        "inwardsblDate": formData?.inwardsblDate,
        "productDescription": formData?.productDescription,
        "whBeNo": formData?.whBeNo,
        "beDate": formData?.beDate,
        "blNo": formData?.blNo,
        "blDate": formData?.blDate,
        "preparedBy": formData?.preparedBy,
        "shiftingFields": formData?.shiftingFields,
        "grossWeight": formData?.grossQty,
        'weightbridgeName': formData?.weightbridgeName,
        'weightmentSlip': formData?.weightmentSlip,
        "tareWeight": formData?.tareQty,
        "warehouseWeightmentgrossQty": formData?.warehouseWeightmentgrossQty,
        "netWeight": formData?.netQty,
        "weightUnit": formData?.qtyUnit,
        "weightUnitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.qtyUnit)?.uomName || '',
        "weightUnitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.qtyUnit)?.uomShort || ''
      });
    }

    if (this.isNonBonded) {
      Object.assign(basePayload, {
        "partyName": formData?.partyName,
        "vesselName": formData?.vesselName,
        "grossWeight": formData?.grossQty,
        'weightbridgeName': formData?.weightbridgeName,
        'weightmentSlip': formData?.weightmentSlip,
        "tareWeight": formData?.tareQty,
        "warehouseWeightmentgrossQty": formData?.warehouseWeightmentgrossQty,
        "netWeight": formData?.netQty,
        "weightUnit": formData?.qtyUnit,
        "weightUnitName": this.weighthData?.find((uom: any) => uom.uomId === formData?.qtyUnit)?.uomName || '',
        "weightUnitShort": this.weighthData?.find((uom: any) => uom.uomId === formData?.qtyUnit)?.uomShort || '',
        "unitOrBulk": formData?.packageType,
        "inDate": formData?.inDate,
        "containerNoNonBonded": formData?.containerNoNonBonded,
        "directStuffContainerNo": formData?.directStuffContainerNo,
        "directStuffVehicleNo": formData?.directStuffVehicleNo,
        "directStuffQty": formData?.directStuffQty,
        "directStuffPackageType": formData?.directStuffPackageType
      });
    }

    return basePayload;
  }

  private formatLabourDetailsForSubmission(labourDetails: any[]): any[] {
    if (!labourDetails || !Array.isArray(labourDetails)) {
      return [];
    }

    return labourDetails.map(labour => {
      const baseData = {
        type: labour.type,
        name: labour.name,
        remarks: labour.remarks
      };

      switch (labour.type) {
        case 'labour':
          return {
            ...baseData,
            hourlyRate: labour.hourlyRate,
            workingHours: labour.workingHours
          };
        case 'vendor':
          return {
            ...baseData,
            serviceType: labour.serviceType,
            contractAmount: labour.contractAmount
          };
        case 'machine':
          return {
            ...baseData,
            machineModel: labour.machineModel,
            rentalCost: labour.rentalCost
          };
        default:
          return baseData;
      }
    });
  }

  private updateRecord(payload: any): void {
    this.commonService.UpdateToST("warehouseinward/" + this.warehouseinwardData?.warehouseinwardId, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Updated Successfully', '');
          this.onCancelEdit();
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error || 'Update failed', '');
      }
    );
  }

  private createRecord(payload: any): void {
    this.commonService.addToST("warehouseinward", payload)?.subscribe(
      (res: any) => {
        if (res) {
          if (this.isclone) {
            this.notification.create('success', 'Clone successfully!', '');
          } else {
            this.notification.create('success', 'Added Successfully', '');
          }
          this.onCancelEdit();
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error || 'Creation failed', '');
      }
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.inwardsForm.controls).forEach(key => {
      const control = this.inwardsForm.get(key);
      control?.markAsTouched();

      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(nestedKey => {
              arrayControl.get(nestedKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }
}