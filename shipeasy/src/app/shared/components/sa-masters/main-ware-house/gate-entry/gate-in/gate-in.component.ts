import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-gate-in',
  templateUrl: './gate-in.component.html',
  styleUrls: ['./gate-in.component.scss']
})
export class GateInComponent implements OnInit {
  gateInForm: FormGroup;
  submitted = false;
  id: any;
  entryId: any; // For edit mode
  isEditMode = false;
  dataEntryList: any;
  currentEntryData: any; // Store the entry being edited

  jobList: any[] = [];
  billOfEntryList: any[] = [];
  containerList: any[] = [];
  weighthData: any[] = [];
  warehouseId: string | null = null;
  routeKey: string | null = null;
  action: string | null = null;
  moduleId: string | null = null;
  SpaceCertificationNo: string = '';
  weighbridgeList = [
    { id: 1, name: 'Weighbridge A' },
    { id: 2, name: 'Weighbridge B' }
  ];
  editbillOfEntry: any;
  containerNoList: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    // Get route parameters
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.entryId = params['warehousegateinentryId'];
      this.isEditMode = !!this.entryId;
    });
    
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadDropdownData();
    this.getWarehouseDataEntry();
    this.getUomList();

       this.route.params.subscribe(params => {
      this.warehouseId = params['id'];
      this.routeKey = params['key'];
      this.moduleId = params['moduleId'];
      this.action = this.router.url.includes('/edit') ? 'edit' : 'add';


      this.isEditMode = this.action === 'edit';

      // Load existing data if in edit mode
      if (this.isEditMode && this.moduleId) {
        this.loadExistingData(this.moduleId);
      }
    });

    if (this.isEditMode) {
      this.loadExistingData(this.moduleId);
    } else {
      this.generateGatePassNumber();
      this.setCurrentDateTime();
    }
  }

  // Getter for easy access to form controls
  get f() { return this.gateInForm.controls; }

  private initializeForm() {
    this.gateInForm = this.fb.group({
      gatePassNumber: [''],
      jobNumber: [''],
      importer: [''],
      purchaser: ['', Validators.required],
      warehouseNumber: ['', Validators.required],
      productDescription: ['', Validators.required],
      vessel: [''],
      chaName: ['', Validators.required],
      whBeNumber: ['', Validators.required],
      exBeNumber: ['', Validators.required],
      truckNumber: ['', Validators.required],
      containerNumber: ['', Validators.required],
      transporter: ['', Validators.required],
      lrNumber: ['', Validators.required],
      packages: ['', Validators.required],
      unit: ['', Validators.required],
      remarks: [''],
      grossWeight: ['', [Validators.required, Validators.min(0)]],
      tareWeight: ['', [Validators.required, Validators.min(0)]],
      netWeight: ['', Validators.required],
      doNumber: ['', Validators.required],
      doValidity: ['', Validators.required],
      warehousingUnderSection: ['', Validators.required],
      bondExpiry: ['', Validators.required],
      entryDateTime: ['', Validators.required],

      cfsPortWeighment: this.fb.group({
        cfsSlipNo: ['', Validators.required],
        cfsGross: ['', [Validators.required, Validators.min(0)]],
        cfsTare: ['', [Validators.required, Validators.min(0)]],
        cfsNet: ['', [Validators.required, Validators.min(0)]]
      }),

      warehouseWeighment: this.fb.group({
        weighbridgeName: ['', Validators.required],
        warehouseSlipNo: ['', Validators.required],
        warehouseGross: ['', [Validators.required, Validators.min(0)]],
        warehouseTare: ['', [Validators.required, Validators.min(0)]],
        warehouseNet: ['', [Validators.required, Validators.min(0)]]
      })
    });

    // Subscribe to weight changes for auto calculation
    this.gateInForm.get('grossWeight')?.valueChanges.subscribe(() => this.calculateNetWeight());
    this.gateInForm.get('tareWeight')?.valueChanges.subscribe(() => this.calculateNetWeight());
  }

  uomData: any = [];

  getUomList() {
    let payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
    });
  }

  private loadDropdownData() {
    this.jobList = [
      { id: 1, jobNumber: 'JOB001/2024-25' },
      { id: 2, jobNumber: 'JOB002/2024-25' }
    ];

    this.billOfEntryList = [
      { id: 1, name: 'BE001/2024', number: 'BE001/2024' },
      { id: 2, name: 'BE002/2024', number: 'BE002/2024' }
    ];

    this.containerList = [
      { id: 1, number: 'MSKU1234567', type: '20FT' },
      { id: 2, number: 'TCLU7654321', type: '40FT' }
    ];
  }

  isLoading = false;
    currentId: string | null = null;
    originalData: any = {};
    selectedConsignee: string | null = null;

    loadExistingData(id: string): void {
    this.isLoading = true;

    const payload = this.commonService.filterList();
    payload.query = { warehousegateinentryId: id };

    this.commonService.getSTList("warehousegateinentry", payload)?.subscribe(
      (res: any) => {
        this.isLoading = false;

        if (res?.documents?.length > 0) {
          const data = res.documents[0];
          console.log('Loaded data for edit:', data);

          this.currentId = data.warehousegateinentryId;
          this.originalData = { ...data };

          // Format dates properly
          const formatDate = (dateValue: any): string | null => {
            if (!dateValue) return null;
            const date = new Date(dateValue);
            return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for input[type="date"]
          };

          // Patch form with existing data
          this.gateInForm.patchValue({
            gatePassNumber: data.gatePassNumber || '',
            jobNumber: data.jobNumber || '',
            importer: data.importer || '',
            warehouseNumber: data.warehouseNumber || '',
            productDescription: data.productDescription || '',
            vessel: data.vessel || '',
            chaName: data.chaName || '',
            remarks: data.remarks || '',
            whBeNumber: data.whBeNumber || '',
            exBeNumber: data.exBeNumber || '',
            truckNumber: data.truckNumber || '',
            containerNumber: data.containerNumber || '',
            transporter: data.transporter || '',
            lrNumber: data.lrNumber || '',
            packages: data.packages || '',
            grossWeight: data.grossWeight || '',
            tareWeight: data.tareWeight || '',
            netWeight: data.netWeight || '',
            doNumber: data.doNumber || '',
            doValidity: formatDate(data.doValidity),
            gateOutDate: formatDate(data.gateOutDate) || formatDate(new Date()),
            warehousingUnderSection: data.warehousingUnderSection || '',
            bondExpiry: formatDate(data.bondExpiry)
          });

          // Handle nested form groups
          if (data.cfsPortWeighmentDetails) {
            this.gateInForm.get('cfsPortWeighment')?.patchValue({
              cfsSlipNo: data.cfsPortWeighmentDetails.cfsSlipNo || '',
              cfsGross: data.cfsPortWeighmentDetails.cfsGross || '',
              cfsTare: data.cfsPortWeighmentDetails.cfsTare || '',
              cfsNet: data.cfsPortWeighmentDetails.cfsNet || ''
            });
          }

          if (data.warehouseWeighmentDetails) {
            this.gateInForm.get('warehouseWeighment')?.patchValue({
              weighbridgeName: data.warehouseWeighmentDetails.weighbridgeName || '',
              warehouseSlipNo: data.warehouseWeighmentDetails.warehouseSlipNo || '',
              warehouseGross: data.warehouseWeighmentDetails.warehouseGross || '',
              warehouseTare: data.warehouseWeighmentDetails.warehouseTare || '',
              warehouseNet: data.warehouseWeighmentDetails.warehouseNet || ''
            });
          }

          // Set selected purchaser
          if (data.purchaserId) {
            this.selectedConsignee = data.purchaserId;
            this.gateInForm.patchValue({
              purchaserId: data.purchaserId,
              purchaserName: data.purchaserName || ''
            });
          }
        } else {
          this.notification.create('error', 'No data found for this ID', '');
          this.navigateBack();
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Load data error:', error);
        this.notification.create('error', 'Failed to load data', '');
        this.navigateBack();
      }
    );
  }

    private navigateBack(): void {
    if (this.warehouseId && this.routeKey) {
      const navigationPath = `/warehouse/main-ware-house/details/${this.warehouseId}/${this.routeKey}`;
      console.log('Navigating back to:', navigationPath);
      this.router.navigate(['/warehouse/main-ware-house/details', this.warehouseId, this.routeKey]);
    } else {
      console.log('Fallback navigation to /gate-out');
      this.router.navigate(['/gate-out']);
    }
  }



  private generateGatePassNumber() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const financialYear = currentDate.getMonth() >= 3 ?
      `${currentYear}-${(currentYear + 1).toString().substr(2)}` :
      `${currentYear - 1}-${currentYear.toString().substr(2)}`;
    const sequenceNumber = Math.floor(Math.random() * 9999) + 1;
    const gatePassNumber = `GPI${sequenceNumber.toString().padStart(4, '0')}/${financialYear}`;
    this.gateInForm.patchValue({ gatePassNumber });
  }

  private setCurrentDateTime() {
    const currentDateTime = new Date().toLocaleString('en-IN', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false
    });
    this.gateInForm.patchValue({ entryDateTime: currentDateTime });
  }

  private calculateNetWeight() {
    const gross = parseFloat(this.gateInForm.get('grossWeight')?.value) || 0;
    const tare = parseFloat(this.gateInForm.get('tareWeight')?.value) || 0;
    const net = gross - tare;
    this.gateInForm.patchValue({ netWeight: net >= 0 ? net.toFixed(2) : '0' }, { emitEvent: false });
  }

  onSubmit() {
    this.submitted = true;
    
    // Mark all fields as touched to show validation errors
    this.markFormGroupTouched(this.gateInForm);
    
    if (this.gateInForm.invalid) {
      this.notification.create('error', 'Please fill all required fields', '');
      return;
    }

    if (this.isEditMode) {
      this.updateEntry();
    } else {
      this.createEntry();
    }
  }

  private createEntry() {
    const utcDateTime = new Date().toISOString();

    const gateInData = {
      ...this.gateInForm.value,
      entryDateTime: utcDateTime,
      warehousedataentryId: this.id,
    };

    this.commonService.addToST('warehousegateinentry', gateInData)?.subscribe(
      res => {
        this.notification.create('success', 'Entry saved successfully!', '');
        this.submitted = false;
        this.goBack();
      },
      error => {
        console.error('Create entry error:', error);
        this.notification.create('error', 'Failed to save entry', '');
      }
    );
  }

  private updateEntry() {
    if (!this.currentEntryData?._id) {
      this.notification.create('error', 'Entry ID not found', '');
      return;
    }

    const payload = { 
      ...this.gateInForm.value,
    };

    // Use the correct ID field from currentEntryData
    const updateEndpoint = `warehousegateinentry/${this.currentEntryData._id}`;
    
    this.commonService.UpdateToST(updateEndpoint, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', 'Updated Successfully', '');
          this.submitted = false;
          this.goBack();
        }
      },
      error => {
        console.error('Update error:', error);
        this.notification.create('error', 'Failed to update entry', '');
      }
    );
  }

  resetForm() {
    this.submitted = false;
    this.gateInForm.reset();
    if (!this.isEditMode) {
      this.generateGatePassNumber();
      this.setCurrentDateTime();
      this.patchWarehouseData();
    }
  }

  goBack() {
    this.router.navigate([
      `/warehouse/main-ware-house/details/${this.id}/${this.route.snapshot.params['key']}`
    ]);
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  onJobNumberChange(event: any) {
    const selected = this.dataEntryList.find(j => j.id === event);
    if (selected) {
      this.gateInForm.patchValue({
        importer: selected.importer || '',
        productDescription: selected.productDescription || '',
        vessel: selected.vessel || '',
        chaName: selected.chaName || '',
        whBeNumber: selected.whBeNumber || '',
        packages: selected.packages || ''
      });
    }
  }

  getWarehouseDataEntry() {
    let payload = this.commonService?.filterList();
    if (payload?.query) payload.query = { warehousedataentryId: this.id };
    this.commonService?.getSTList('warehousedataentry', payload)?.subscribe((res: any) => {
      console.log('Warehouse Data Entry Response:', res);
      this.dataEntryList = res?.documents?.[0];
      if (!this.isEditMode) {
        this.patchWarehouseData();
      }
      
      // Handle different possible field names from API
      if (this.dataEntryList?.jobNo || this.dataEntryList?.jobNumber) {
        this.gateInForm.patchValue({
          jobNumber: this.dataEntryList.jobNo || this.dataEntryList.jobNumber
        });
      }
      if (this.dataEntryList?.year) {
        this.gateInForm.patchValue({
          year: this.dataEntryList.year
        });
      }
      // if (this.dataEntryList?.importerLedgerName) {
      //   this.gateInForm.patchValue({
      //     importer: this.dataEntryList.importerLedgerName || ''
      //   });
      // }
      this.patchWarehouseData();
    });
  }

  patchWarehouseData() {
    const d = this.dataEntryList;
    if (!d) return;

    console.log('Patching warehouse data:', d);

    const patch = {
      jobNumber: d.jobNo || d.jobNumber || '',
      importer: d.importerLedger || d.importer || '',
      productDescription: d.productDescription || '',
      packages: d.packagesUnit || d.packages || '',
      vessel: d.vesselName || d.vessel || '',
      chaName: d.chaLedger || d.chaName || '',
      whBeNumber: d.whBeNo || d.whBeNumber || '',
      year: d.year || '',
      unit: d.unit || '',
      remarks: d.remarks || '',
      assessableValue: d.assessableValue || '',
      dutyAmount: d.dutyAmount || '',
      grossWeight: d.grossQty || d.grossWeight || ''
    };
    
    console.log('Patch object:', patch);
    this.gateInForm.patchValue(patch);
  }

  // Helper methods for validation checking
  isFieldInvalid(fieldName: string): boolean {
    const field = this.gateInForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  isNestedFieldInvalid(groupName: string, fieldName: string): boolean {
    const field = this.gateInForm.get(`${groupName}.${fieldName}`);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.gateInForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
    }
    return '';
  }

  onPreview() {
    console.log('Preview/Print functionality to be implemented');
  }
  getbillentry() {
    let payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = {
        warehousedataentryId: this.route.snapshot.params['id']
      };
    }
    this.commonService?.getSTList("warehousebillofentry", payload)?.subscribe((res: any) => {
      this.editbillOfEntry = res?.documents?.[0];
      if (this.editbillOfEntry?.whBeNo) {
        this.gateInForm.patchValue({
          whBeNumber: this.editbillOfEntry.whBeNo
        });
      }
      if (this.editbillOfEntry?.date) {
        this.gateInForm.patchValue({
          beDate: this.editbillOfEntry.date
        });
      }

      this.containerNoList = this.editbillOfEntry?.containers || [];
    });
  }
}