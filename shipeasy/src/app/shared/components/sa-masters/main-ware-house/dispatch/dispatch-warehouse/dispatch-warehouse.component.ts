import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-dispatch-warehouse',
  templateUrl: './dispatch-warehouse.component.html',
  styleUrls: ['./dispatch-warehouse.component.scss'],
})
export class DispatchWarehouseComponent implements OnInit {
  dispatchForm: FormGroup;
  submitted = false;
  submitted1 = false;
  weighthData: any = [];
  uomData: any;
  DispatchList: any = [];
  editIndex: string | null = null;
  warehouseDataEntryId: string | null = null;
  moduleId: string | null = null;
  urlParam: any;
  DispatchData: any;
  dataEntryList: any = [];
  type: any;
  batchDetails: any;
  ContainerTypeList: any = [];
  packageTypes: any = [];
  gateInEntries: any;

  // For non-bonded warehouse inward data
  warehouseInwardData: any[] = [];
  totalAvailablePackages: number = 0;
  totalAvailableGrossWeight: number = 0;
  totalPackagesUnit: string = '';
  totalGrossWeightUnit: string = '';

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
  }

  ngOnInit(): void {
    // Initialize form with all fields
    this.dispatchForm = this.fb.group({
      gateOutPassNo: [''],
      dispatchDate: ['', Validators.required],
      jobNo: [''],
      surveyorName: ['', Validators.required],
      qty: ['', Validators.required],
      packageType: ['', Validators.required],
      vehicleNo: ['', Validators.required],
      transporterLedger: [''],
      toLocation: ['', Validators.required],
      weightbridgeName: ['', Validators.required],
      weightmentSlip: ['', Validators.required],
      grossWeight: ['', Validators.required],
      tareWeight: ['', Validators.required],
      netWeight: [{ value: '', disabled: true }],
      labourDetails: this.fb.array([]), // Unified array for labour/vendor/machine
      containerNo: [''],
    });

    // Load container types first
    this.containerTypeList();

    // Set up gate pass number change subscription
    this.dispatchForm.get('gateOutPassNo')?.valueChanges.subscribe(value => {
      if (value) {
        this.onGatePassNumberChange(value);
      } else {
        this.onGatePassNumberChange('');
      }
    });

    // Load package types
    this.loadPackageTypes();

    // Add initial row
    this.addLabourRow();

    // Check for edit mode
    if (this.route.snapshot.paramMap.get('id')) {
      this.warehouseDataEntryId = this.route.snapshot.paramMap.get('id');
      this.getWarehouseDataEntryById(this.warehouseDataEntryId);
      // Load warehouse inward data for non-bonded
      this.loadWarehouseInwardData(this.route.snapshot.paramMap.get('id')!);
    }

    if (this.route.snapshot.paramMap.get('moduleId')) {
      this.moduleId = this.route.snapshot.paramMap.get('moduleId');
      console.log('moduleId', this.moduleId);
      this.editIndex = this.moduleId;
      this.getWarehouseDispatchById(this.moduleId);
    }
  }

  onGatePassNumberChange(gatePassNumber: string): void {
    if (!gatePassNumber) {
      // Clear auto-filled fields when gate pass number is cleared
      this.dispatchForm.patchValue({
        qty: '',
        packageType: '',
        containerNo: '',
        vehicleNo: this.type === 'Bonded' ? this.dispatchForm.get('vehicleNo')?.value : ''
      });
      return;
    }

    let payload = this.commonService.filterList();
    payload.query = {
      gatePassNumber: gatePassNumber,
      warehousedataentryId: this.warehouseDataEntryId
    };

    this.commonService.getSTList('warehousegateoutentry', payload)
      ?.subscribe(
        (data: any) => {
          console.log('Gate Pass Data:', data);

          if (data?.documents && data.documents.length > 0) {
            const gatePassData = data.documents[0];

            // Find the matching container in ContainerTypeList
            let selectedContainerValue = '';
            if (gatePassData.containerNumber) {
              const matchingContainer = this.ContainerTypeList.find(
                container => container.label === gatePassData.containerNumber
              );
              selectedContainerValue = matchingContainer ? matchingContainer.value : '';
            }

            // Auto-fill form fields
            this.dispatchForm.patchValue({
              qty: gatePassData.quantity || gatePassData.packages || '',
              packageType: gatePassData.packageType || '',
              containerNo: selectedContainerValue,
              vehicleNo: this.type === 'Bonded'
                ? (gatePassData.truckNumber || '')
                : this.dispatchForm.get('vehicleNo')?.value
            });
          } else {
            this.notification.create('warning', 'No data found for selected gate pass number', '');
            // Clear fields if no data found
            this.dispatchForm.patchValue({
              qty: '',
              packageType: '',
              containerNo: '',
              vehicleNo: this.type === 'Bonded' ? this.dispatchForm.get('vehicleNo')?.value : ''
            });
          }
        },
        (error) => {
          console.error('Error fetching gate pass data:', error);
          this.notification.create('error', 'Failed to fetch gate pass data',
            error?.error?.message || 'Please try again');
        }
      );
  }

  getWarehouseDataEntryById(id: string): void {
    let payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = {
        warehousedataentryId: id,
      };
    }

    this.commonService
      ?.getSTList('warehousedataentry', payload)
      .subscribe((data) => {
        this.dataEntryList = data?.documents[0];
        this.type = data?.documents[0]?.type;
        this.filterTabsByType();
        console.log('dataEntryList', this.dataEntryList);

        // Auto-fetch Job No based on the data entry
        if (this.dataEntryList?.jobNo) {
          this.dispatchForm.patchValue({
            jobNo: this.dataEntryList.jobNo
          });
        }

        // For Bonded type, auto-fetch vehicle number
        // if (this.type === 'Bonded') {
        //   this.getVehicleNumberForBonded(id);
        // }
      });
  }

  getVehicleNumberForBonded(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: id };

    this.commonService
      .getSTList('warehousegateinentry', payload)
      .subscribe((res: any) => {
        console.log('Gate In Entry Response:', res);
        this.batchDetails = res?.documents || [];

        // Auto-fetch truck number (vehicle number) for Bonded
        if (this.batchDetails.length > 0 && this.batchDetails[0]?.truckNumber) {
          this.dispatchForm.patchValue({
            vehicleNo: this.batchDetails[0].truckNumber
          });
          console.log('Auto-fetched Vehicle No:', this.batchDetails[0].truckNumber);
        }
      }, (error) => {
        console.error('Error fetching gate in entry:', error);
        this.notification.create('error', 'Failed to fetch vehicle details', '');
      });
  }

  getWarehouseDispatchById(id: string): void {
    let payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = {
        warehousedispatchId: id,
      };
    }

    this.commonService
      ?.getSTList('warehousedispatch', payload)
      .subscribe((data) => {
        console.log('Dispatch Data:', data);
        this.DispatchData = data?.documents[0];
        this.onEdit();

        // Patch form values
        this.dispatchForm.patchValue({
          gateOutPassNo: this.DispatchData?.gateOutPassNo,
          dispatchDate: this.DispatchData?.dispatchDate,
          jobNo: this.DispatchData?.jobNo,
          surveyorName: this.DispatchData?.surveyorName,
          qty: this.DispatchData?.qty,
          packageType: this.DispatchData?.packageType,
          vehicleNo: this.DispatchData?.vehicleNo,
          transporterLedger: this.DispatchData?.transporterLedger,
          toLocation: this.DispatchData?.toLocation,
          weightbridgeName: this.DispatchData?.weightbridgeName,
          weightmentSlip: this.DispatchData?.weightmentSlip,
          grossWeight: this.DispatchData?.grossWeight,
          tareWeight: this.DispatchData?.tareWeight,
          netWeight: this.DispatchData?.netWeight,
          containerNo: this.DispatchData?.containerNo,
        });
      });
  }

  calculateNetWeight(): void {
    const grossWeight = this.dispatchForm.get('grossWeight')?.value || 0;
    const tareWeight = this.dispatchForm.get('tareWeight')?.value || 0;
    const netWeight = grossWeight - tareWeight;

    this.dispatchForm.get('netWeight')?.setValue(netWeight >= 0 ? netWeight : 0);
  }

  filterTabsByType(): void {
    console.log('Filtering tabs for type:', this.type);
    // Implement your tab filtering logic here based on type
  }

  get f() {
    return this.dispatchForm.controls;
  }

  printData() {
    let reportpayload = { "parameters": { "warehousedispatchId": this.moduleId } };
    this.commonService.pushreports(reportpayload, 'dispatch_non').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        const pdfWindow = window.open(temp);
      }
    })
  }

  loadPackageTypes(): void {
    let payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };

    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.weighthData = data?.documents?.filter(
        lengthtype => lengthtype?.uomCategory === 'Weight'
      );

      // Load package types from UOM data
      const packageUomData = data?.documents?.filter(
        uomType => uomType?.uomCategory === 'Package' || uomType?.uomCategory === 'Packaging'
      );
      this.packageTypes = packageUomData?.map(item => ({
        label: item.uomName || item.name,
        value: item._id || item.id
      })) || [];

      console.log('Weight UOM Data:', this.weighthData);
      console.log('Package Types:', this.packageTypes);
    });
  }

  getUomList(): void {
    this.loadPackageTypes();
  }

  containerTypeList(): void {
    let payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };

    this.commonService.getSTList('warehousegateoutentry', payload)
      ?.subscribe((data: any) => {
        console.log('Container data from API:', data);

        this.gateInEntries = data?.documents || [];

        // Create container dropdown options with both label and value
        this.ContainerTypeList = data?.documents?.map(item => ({
          label: item.containerNumber || 'No Container Number',
          value: item._id || item.warehousegateoutentryId,
          containerNumber: item.containerNumber
        })) || [];

        console.log('ContainerTypeList:', this.ContainerTypeList);
      },
        (error) => {
          console.error('Error loading container types:', error);
          this.notification.create('error', 'Failed to load container data', '');
        });
  }

  loadWarehouseInwardData(warehouseDataEntryId: string): void {
    let payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: warehouseDataEntryId };

    this.commonService.getSTList('warehouseinward', payload)
      ?.subscribe((data: any) => {
        console.log('Warehouse Inward Data:', data);
        this.warehouseInwardData = data?.documents || [];

        if (this.warehouseInwardData.length > 0) {
          // Calculate total packages and gross weight from inward entries
          this.calculateRemainingPackages(warehouseDataEntryId);
        }
      },
        (error) => {
          console.error('Error loading warehouse inward data:', error);
          this.notification.create('error', 'Failed to load warehouse inward data', '');
        });
  }

  calculateRemainingPackages(warehouseDataEntryId: string): void {
    // Calculate total from inward entries
    let totalPackages = 0;
    let totalGrossWeight = 0;

    this.warehouseInwardData.forEach((inward: any) => {
      totalPackages += Number(inward.totalPackages) || 0;
      totalGrossWeight += Number(inward.grossWeight) || 0;

      // Get unit names from first entry
      if (!this.totalPackagesUnit && inward.totalUnitName) {
        this.totalPackagesUnit = inward.totalUnitName;
      }
      if (!this.totalGrossWeightUnit && inward.weightUnitName) {
        this.totalGrossWeightUnit = inward.weightUnitName;
      }
    });

    // Get total dispatched quantity
    let dispatchPayload = this.commonService.filterList();
    dispatchPayload.query = { warehousedataentryId: warehouseDataEntryId };

    this.commonService.getSTList('warehousedispatch', dispatchPayload)
      ?.subscribe((dispatchData: any) => {
        console.log('Warehouse Dispatch Data:', dispatchData);

        let totalDispatchedPackages = 0;
        let totalDispatchedGrossWeight = 0;

        if (dispatchData?.documents && dispatchData.documents.length > 0) {
          dispatchData.documents.forEach((dispatch: any) => {
            totalDispatchedPackages += Number(dispatch.qty) || 0;
            totalDispatchedGrossWeight += Number(dispatch.grossWeight) || 0;
          });
        }

        // Calculate remaining
        this.totalAvailablePackages = totalPackages - totalDispatchedPackages;
        this.totalAvailableGrossWeight = totalGrossWeight - totalDispatchedGrossWeight;

        console.log('Total Available Packages:', this.totalAvailablePackages);
        console.log('Total Available Gross Weight:', this.totalAvailableGrossWeight);
      },
        (error) => {
          console.error('Error loading dispatch data:', error);
          // If no dispatch data found, use total from inward
          this.totalAvailablePackages = totalPackages;
          this.totalAvailableGrossWeight = totalGrossWeight;
        });
  }

  get labourDetails(): FormArray {
    return this.dispatchForm.get('labourDetails') as FormArray;
  }

  createLabourDetailForm(data: any = null): FormGroup {
    return this.fb.group({
      type: [data?.type || '', Validators.required],
      name: [data?.name || '', Validators.required],
      remarks: [data?.remarks || '', Validators.required],
    });
  }

  addLabourRow(data: any = null): void {
    this.labourDetails.push(this.createLabourDetailForm(data));
  }

  removeLabourRow(index: number): void {
    if (this.labourDetails.length > 1) {
      this.labourDetails.removeAt(index);
    } else {
      this.notification.create('warning', 'At least one row is required', '');
    }
  }

  onTypeChange(index: number, value: string): void {
    // Optional: Reset name and remarks when type changes
    const control = this.labourDetails.at(index);
    if (control) {
      control.patchValue({
        name: '',
        remarks: ''
      });
    }
    console.log(`Type changed to ${value} at index ${index}`);
  }

  getTypeLabel(type: string): string {
    if (!type) return 'Item';
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getNamePlaceholder(type: string): string {
    if (!type) return 'Select Type First';
    return `Enter ${this.getTypeLabel(type)} Name`;
  }

  getLabourDetailControl(index: number, controlName: string) {
    return this.labourDetails.at(index)?.get(controlName);
  }

  addDispatch(): void {
    this.submitted = true;

    // Validate form
    if (!this.dispatchForm.valid) {
      this.dispatchForm.markAllAsTouched();
      console.log('Form validation errors:', this.dispatchForm.errors);

      // Log specific field errors for debugging
      Object.keys(this.dispatchForm.controls).forEach(key => {
        const control = this.dispatchForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });

      // Check labourDetails array validation
      this.labourDetails.controls.forEach((control, index) => {
        if (control.invalid) {
          console.log(`Labour Detail ${index} errors:`, control.errors);
          Object.keys((control as FormGroup).controls).forEach(fieldKey => {
            const fieldControl = control.get(fieldKey);
            if (fieldControl?.errors) {
              console.log(`  - ${fieldKey} errors:`, fieldControl.errors);
            }
          });
        }
      });

      this.notification.create('error', 'Please fill all required fields', '');
      return;
    }

    // Validate available stock for non-bonded type
    if (this.type !== 'Bonded') {
      const dispatchQty = Number(this.dispatchForm.value.qty) || 0;
      const dispatchGrossWeight = Number(this.dispatchForm.value.grossWeight) || 0;

      // Only check if not editing (allow updates to existing dispatches)
      if (!this.moduleId) {
        if (dispatchQty > this.totalAvailablePackages) {
          this.notification.create('error', 'Dispatch Quantity Exceeds Available Stock',
            `You are trying to dispatch ${dispatchQty} packages, but only ${this.totalAvailablePackages} ${this.totalPackagesUnit} are available.`);
          return;
        }

        if (dispatchGrossWeight > this.totalAvailableGrossWeight) {
          this.notification.create('error', 'Dispatch Gross Weight Exceeds Available Stock',
            `You are trying to dispatch ${dispatchGrossWeight} ${this.totalGrossWeightUnit}, but only ${this.totalAvailableGrossWeight} ${this.totalGrossWeightUnit} are available.`);
          return;
        }
      }
    }

    // Get raw form values (including disabled fields)
    const dataEntryForm = this.dispatchForm.getRawValue();
    console.log('Form Values:', dataEntryForm);

    // Prepare payload
    const selectedPackageType = this.weighthData.find(
      (item: any) => item.uomId === this.dispatchForm.value.packageType
    );
    const packageTypeName = selectedPackageType ? selectedPackageType.uomShort : '';

    let payload: any = {
      warehousedataentryId: this.warehouseDataEntryId,
      gateOutPassNo: this.dispatchForm.value.gateOutPassNo,
      dispatchDate: this.dispatchForm.value.dispatchDate,
      jobNo: this.dispatchForm.value.jobNo,
      surveyorName: this.dispatchForm.value.surveyorName,
      qty: this.dispatchForm.value.qty,
      packageType: this.dispatchForm.value.packageType,
      packageTypeName: packageTypeName,
      vehicleNo: this.dispatchForm.value.vehicleNo,
      transporterLedger: this.dispatchForm.value.transporterLedger,
      toLocation: this.dispatchForm.value.toLocation,
      labourDetails: this.dispatchForm.value.labourDetails, // Unified array
      containerNo: this.dispatchForm.value.containerNo,
      // Warehouse weightment details
      weightbridgeName: this.dispatchForm.value.weightbridgeName,
      weightmentSlip: this.dispatchForm.value.weightmentSlip,
      grossWeight: this.dispatchForm.value.grossWeight,
      tareWeight: this.dispatchForm.value.tareWeight,
      netWeight: this.dispatchForm.get('netWeight')?.value,
    };

    console.log('Payload:', payload);

    // Update existing record
    if (this.moduleId) {
      this.commonService
        .UpdateToST('warehousedispatch/' + this.moduleId, payload)
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Updated Successfully', '');
              // Recalculate remaining packages after update
              if (this.warehouseDataEntryId && this.type !== 'Bonded') {
                this.loadWarehouseInwardData(this.warehouseDataEntryId);
              }
              this.navigateToDetails();
            }
          },
          (error) => {
            console.error('Update error:', error);
            this.notification.create('error', error?.error?.error || 'Update failed', '');
          }
        );
    }
    // Create new record
    else {
      this.commonService.addToST('warehousedispatch', payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            // Recalculate remaining packages after addition
            if (this.warehouseDataEntryId && this.type !== 'Bonded') {
              this.loadWarehouseInwardData(this.warehouseDataEntryId);
            }
            this.navigateToDetails();
          }
        },
        (error) => {
          console.error('Add error:', error);
          this.notification.create('error', error?.error?.error || 'Add failed', '');
        }
      );
    }
  }

  navigateToDetails(): void {
    this.router.navigate([
      '/warehouse/main-ware-house/details/' +
      this.urlParam.id +
      '/' +
      this.urlParam.key,
    ]);
  }

  onEdit(): void {
    const labourDetails = this.DispatchData.labourDetails || [];

    // Clear existing rows
    (this.labourDetails as FormArray).clear();

    // Add rows based on saved data
    if (labourDetails.length > 0) {
      labourDetails.forEach((detail: any) => {
        this.addLabourRow(detail);
      });
    } else {
      // Add at least one empty row
      this.addLabourRow();
    }
  }


  onCancelEdit(): void {
    this.editIndex = null;
    this.submitted = false;
    this.dispatchForm.reset();

    // Clear labour details array
    (this.labourDetails as FormArray).clear();
    this.addLabourRow();

    this.navigateToDetails();
  }

  resetForm(): void {
    this.submitted = false;
    this.dispatchForm.reset();
    (this.labourDetails as FormArray).clear();
    this.addLabourRow();
  }
}