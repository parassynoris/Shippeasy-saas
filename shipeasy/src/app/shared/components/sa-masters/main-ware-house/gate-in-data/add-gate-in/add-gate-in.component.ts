import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-add-gate-in',
  templateUrl: './add-gate-in.component.html',
  styleUrls: ['./add-gate-in.component.scss']
})

export class AddGateInComponent implements OnInit {
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
  isclone:boolean =false;
  action: string | null = null;
  moduleId: string | null = null;
  SpaceCertificationNo: string = '';
  partymasterList:any;
  TransporterList:any;

  // FIXED: Added selectedUnit to track unit selection
  selectedUnit: any = null;

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
  // Load basic data first
  this.loadDropdownData();
  this.getUomList();
  this.customerDropdown();
  this.importerDropdown();
  this.getPartyMasterDropDowns();
  // Get route parameters
  this.route.params.subscribe(params => {
    this.warehouseId = params['id'];
    this.routeKey = params['key'];
    this.moduleId = params['moduleId'];
    this.action = this.router.url.includes('/edit') ? 'edit' : 'add';
    this.isclone= this.router.url.includes('/clone') ? true : false;
    this.isEditMode = this.isclone ? true :this.action === 'edit';
  });

  // Load warehouse data
  this.getWarehouseDataEntry();
  this.getWarehouseData();
  if (this.isEditMode && this.moduleId) {
    // In edit mode, load existing data first, then load containers
    this.loadExistingData(this.moduleId);
    
    // Small delay to ensure currentEntryData is set before loading containers
    setTimeout(() => {
      this.getWarehouseDispatchBy(this.id);
    }, 100);
  } else {
    // In add mode, load containers and generate new data
    this.getWarehouseDispatchBy(this.id);
    this.generateGatePassNumber();
    this.setCurrentDateTime();
  }

  // Bind container change handler
  this.onContainerChange = this.onContainerChange.bind(this);
}

  // Getter for easy access to form controls
  get f() { return this.gateInForm.controls; }

  private initializeForm() {
    this.gateInForm = this.fb.group({
      gatePassNumber: ['', Validators.required], // MADE MANDATORY
      jobNumber: [''],
      importer: ['', Validators.required], // MADE MANDATORY
      importerId: [''], // FIXED: Added importerId
      purchaser: [''],
      purchaserId: [''],
      purchaserName: [''],
      containerWeight:[null],
      warehouseNumber: ['', Validators.required], // MADE MANDATORY
      productDescription: ['', Validators.required],
      vessel: [''], // KEPT OPTIONAL
      chaName: ['', Validators.required],
      whBeNumber: ['', Validators.required],
      exBeNumber: [''],
      truckNumber: ['', Validators.required],
      containerNumber: ['', Validators.required],
      toppleContainerNo: [''], // Conditional validation will be added separately
      warehousecontainerId: [''], // FIXED: Container type field - this will store warehousecontainerId ID
      transporter: ['', Validators.required],
      lrNumber: [''], // KEPT OPTIONAL
      packages: ['', Validators.required],
      unit: ['', Validators.required], // This will store unit ID
      unitName: [''], // FIXED: Added unitName field to store unit name
      unitId: [''], // FIXED: Added unitId field for clarity
      remarks: [''], // MADE MANDATORY
      entryDateTime: ['', Validators.required], // MADE MANDATORY
      isContainerChange:[false],
      isOpenContainer:[false],

      cfsPortWeighment: this.fb.group({
        cfsName: ['', Validators.required], // MADE MANDATORY
        cfsSlipNo: ['', Validators.required], // MADE MANDATORY
        cfsGross: ['', [Validators.required, Validators.min(0)]], // MADE MANDATORY with min validation
        cfsTare: ['', [Validators.required, Validators.min(0)]], // MADE MANDATORY with min validation
        cfsNet: [''] // Calculated field, not mandatory
      })
    });

    // Subscribe to CFS weight changes
    this.gateInForm.get('cfsPortWeighment.cfsGross')?.valueChanges.subscribe(() => this.CFScalculateNetWeight());
    this.gateInForm.get('cfsPortWeighment.cfsTare')?.valueChanges.subscribe(() => this.CFScalculateNetWeight());

    // Add conditional validator for toppleContainerNo
    this.gateInForm.get('isContainerChange')?.valueChanges.subscribe(isChecked => {
      const toppleContainerControl = this.gateInForm.get('toppleContainerNo');
      if (isChecked) {
        toppleContainerControl?.setValidators([Validators.required]);
      } else {
        toppleContainerControl?.clearValidators();
      }
      toppleContainerControl?.updateValueAndValidity();
    });
  }

  uomData: any = [];

  toUppercase(controlName: string) {
  const value = this.gateInForm.get(controlName)?.value || '';
  this.gateInForm.get(controlName)?.setValue(value.toUpperCase(), { emitEvent: false });
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
      console.log("this.TransporterList", this.TransporterList);
    });
  }
  
 

  // FIXED: Added unit change handler
  onUnitChange(selectedUnitId: string): void {
    const selectedUnitObj = this.weighthData.find(unit => unit.uomId === selectedUnitId);
    
    if (selectedUnitObj) {
      this.selectedUnit = selectedUnitObj;
      this.gateInForm.patchValue({
        unit: selectedUnitId, // Store the ID
        unitId: selectedUnitId, // Store the ID separately
        unitName: selectedUnitObj.uomName || selectedUnitObj.name // Store the name
      });
    }
  }

  // UPDATED: Enhanced container change handler with auto-population of packages and unit
onContainerChange(selectedContainerNo: string): void {
  console.log('Selected container number:', selectedContainerNo);
  
  // Find the selected container by containerNo
  const selectedContainer = this.containerList.find(
    container => container.containerNo === selectedContainerNo
  );

  if (selectedContainer) {
    console.log('Found container:', selectedContainer);

    // Update selected unit for proper display
    if (selectedContainer.unit) {
      this.selectedUnit = this.weighthData.find(u => u.uomId === selectedContainer.unit);
    }
    this.gateInForm.patchValue({
      containerNumber: selectedContainer.containerNo || '',
      warehousecontainerId: selectedContainer.warehousecontainerId || selectedContainer.warehouseContainerId || selectedContainer.id || '', // Try multiple field names
      packages: selectedContainer.packages || '',
      unit: selectedContainer.unit || '', // This will store unit ID
      unitId: selectedContainer.unit || '', // Store unit ID separately
      unitName: selectedContainer.unitName || '' // Store unit name
    });
  } else {
    this.gateInForm.patchValue({
      containerNumber: '',
      warehousecontainerId: '',
      packages: '',
      unit: '',
      unitId: '',
      unitName: ''
    });
    this.selectedUnit = null;
  }
}

  // FIXED: Properly handle purchaser selection
  onPurchaserChange(selectedId: string): void {
    const selectedPurchaser = this.consigneeList.find(
      x => x.partymasterId === selectedId
    );

    if (selectedPurchaser) {
      // Update both the form controls and selectedConsignee
      this.selectedConsignee = selectedId;
      this.gateInForm.patchValue({
        purchaserId: selectedPurchaser.partymasterId,
        purchaserName: selectedPurchaser.name,
        purchaser: selectedPurchaser.name
      });
    }
  }

  // FIXED: Handle importer selection
  onImporterChange(selectedId: string): void {
    const selectedImporter = this.importerList.find(
      x => x.partymasterId === selectedId
    );

    if (selectedImporter) {
      this.gateInForm.patchValue({
        importerId: selectedImporter.partymasterId,
        importer: selectedImporter.name
      });
    }
  }

  getUomList() {
    let payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      const result = data?.documents;
      this.weighthData = result
      
      console.log('Weight UOM Data:', this.weighthData); // Debug log
    });
  }

  batchDetails: any;
  
  getWarehouseDispatchBy(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: id };

    this.commonService
      .getSTList('warehousegateinentry', payload)
      .subscribe((res) => {
        this.batchDetails = res?.documents
          ? res.documents.map((item, index) => ({
            ...item,
            id: index + 1, 
          }))
          : [];
        
        // IMPORTANT: Add a small delay to ensure batchDetails is set before calling the next method
        setTimeout(() => {
          this.getWarehouseDispatchById(id);
        }, 100);
      });
  }

  consigneeList: any[];
  customerDropdown(): void {
    this.consigneeList = [];

    const payload: any = this.commonService.filterList();
    if (payload) {
      payload.query = {
        status: true,
        "customerType.item_text": { $in: ["Purchaser"] }
      };
    }

    this.commonService.getSTList("partymaster", payload)?.subscribe(
      (res: any) => {
        if (res?.documents?.length) {
          this.consigneeList = res.documents;
        }
      },
      (error) => {
        console.error('Error loading customer dropdown:', error);
      }
    );
  }

  // Add importer dropdown method
  importerList: any[] = [];
  
  importerDropdown(): void {
    this.importerList = [];

    const payload: any = this.commonService.filterList();
    if (payload) {
      payload.query = {
        status: true,
        "customerType.item_text": { $in: ["Importer"] }
      };
    }

    this.commonService.getSTList("partymaster", payload)?.subscribe(
      (res: any) => {
        if (res?.documents?.length) {
          this.importerList = res.documents;
        }
      },
      (error) => {
        console.error('Error loading importer dropdown:', error);
      }
    );
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
        this.currentEntryData = data;
        this.originalData = { ...data };

        // Format dates properly for date inputs
        const formatDate = (dateValue: any): string | null => {
          if (!dateValue) return null;
          const date = new Date(dateValue);
          return date.toISOString().split('T')[0];
        };

        // Format datetime for datetime-local inputs
        const formatDateTime = (dateValue: any): string | null => {
          if (!dateValue) return null;
          const date = new Date(dateValue);
          const isoString = date.toISOString();
          return isoString.slice(0, 16);
        };

        // FIXED: Handle unit data properly - prioritize unitId from API response
        let unitId = '';
        let unitName = '';
        
        if (data.unitId) {
          // Use unitId directly from API response
          unitId = data.unitId;
          unitName = data.unitName || '';
        } else if (data.unit) {
          // Fallback to unit field if unitId is not available
          if (typeof data.unit === 'object') {
            unitId = data.unit.uomId || data.unit.id || data.unit._id || '';
            unitName = data.unit.uomName || data.unit.name || '';
          } else {
            unitId = data.unit;
            // Find the unit name from weighthData
            const unitObj = this.weighthData.find(u => u.uomId === unitId);
            unitName = unitObj ? (unitObj.uomName || unitObj.name) : '';
          }
        }
        
        // Set selectedUnit for proper display
        if (unitId) {
          this.selectedUnit = this.weighthData.find(u => u.uomId === unitId);
        }

        console.log('Unit mapping - unitId:', unitId, 'unitName:', unitName, 'selectedUnit:', this.selectedUnit);

        // FIXED: Extract container and warehouse container data properly
        const containerNumber = data.containerNumber || '';
        const warehousecontainerId = data.warehousecontainerId || '';
        
        console.log('Container data from API:', {
          containerNumber,
          warehousecontainerId
        });

        // Patch the form with all data
        this.gateInForm.patchValue({
          gatePassNumber: data.gatePassNumber || '',
          jobNumber: data.jobNumber || '',
          importer: data.importer || data.importerName || '',
          importerId: data.importerId || '',
          purchaser: data.purchaser || data.purchaserName || '',
          purchaserId: data.purchaserId || '',
          purchaserName: data.purchaserName || '',
          warehouseNumber: data.warehouseNumber || '',
          productDescription: data.productDescription || '',
          vessel: data.vessel || '',
          chaName: data.chaName || '',
          remarks: data.remarks || '',
          whBeNumber: data.whBeNumber || '',
          exBeNumber: data.exBeNumber || '',
          containerWeight:data.containerWeight || null,
          truckNumber: data.truckNumber || '',
          containerNumber: containerNumber, // FIXED: Ensure container number is set correctly
          toppleContainerNo: data.toppleContainerNo || '', // NEW: Topple Container No field
          warehousecontainerId: warehousecontainerId, // FIXED: Ensure warehouse container ID is set
          transporter: data.transporter || '',
          lrNumber: data.lrNumber || '',
          packages: data.packages || '',
          unit: unitId, // FIXED: Map unitId to unit form control
          unitId: unitId, // FIXED: Set unit ID separately
          unitName: unitName, // FIXED: Set unit name
          entryDateTime: formatDateTime(data.entryDateTime),
          isContainerChange:data.isContainerChange||false,
          isOpenContainer:data.isOpenContainer||false
        });

        // Handle CFS Port Weighment Details with new CFS Name field
        if (data.cfsPortWeighment) {
          this.gateInForm.get('cfsPortWeighment')?.patchValue({
            cfsName: data.cfsPortWeighment.cfsName || '', // NEW: CFS Name
            cfsSlipNo: data.cfsPortWeighment.cfsSlipNo || '',
            cfsGross: data.cfsPortWeighment.cfsGross || '',
            cfsTare: data.cfsPortWeighment.cfsTare || '',
            cfsNet: data.cfsPortWeighment.cfsNet || ''
          });
        }

        // Set selected purchaser
        if (data.purchaserId) {
          this.selectedConsignee = data.purchaserId;
        }

        console.log('Form patched successfully');
        console.log('Current form unit value:', this.gateInForm.get('unit')?.value);
        console.log('Final form value after patch:', this.gateInForm.value);
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
    const currentDateTime = new Date().toISOString().slice(0, 16);
    this.gateInForm.patchValue({ entryDateTime: currentDateTime });
  }

  private CFScalculateNetWeight() {
    const gross = parseFloat(this.gateInForm.get('cfsPortWeighment.cfsGross')?.value) || 0;
    const tare = parseFloat(this.gateInForm.get('cfsPortWeighment.cfsTare')?.value) || 0;
    const net = gross - tare;
    
    this.gateInForm.get('cfsPortWeighment')?.patchValue({ 
      cfsNet: net >= 0 ? net.toFixed(2) : '0' 
    }, { emitEvent: false });
  }

onSubmit() {
  this.submitted = true;
  
  this.markFormGroupTouched(this.gateInForm);
  
  if (this.gateInForm.invalid) {
    this.notification.create('error', 'Please fill all required fields', '');
    this.scrollToFirstError();
    return;
  }

  // ADDITIONAL VALIDATION: Check if warehousecontainerId is set when containerNumber is selected
  const containerNumber = this.gateInForm.get('containerNumber')?.value;
  const warehousecontainerId = this.gateInForm.get('warehousecontainerId')?.value;
  
  if (containerNumber && !warehousecontainerId) {
    // Try to find and set the warehousecontainerId
    const selectedContainer = this.containerList.find(
      container => container.containerNo === containerNumber
    );
    
    if (selectedContainer) {
      const containerId = selectedContainer.warehousecontainerId || selectedContainer.warehouseContainerId || selectedContainer.id;
      this.gateInForm.patchValue({ warehousecontainerId: containerId });
      console.log('Auto-set warehousecontainerId before submission:', containerId);
    } else {
      this.notification.create('error', 'Container ID not found. Please reselect the container.', '');
      return;
    }
  }

  if (this.isEditMode && !this.isclone) {
    this.updateEntry();
  } else {
    this.createEntry();
  }
}

// Helper method to scroll to first error
private scrollToFirstError(): void {
  const firstErrorElement = document.querySelector('.is-invalid');
  if (firstErrorElement) {
    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

private createEntry() {
  const utcDateTime = new Date().toISOString();
  const formData = this.gateInForm.value;
  
  // FIXED: Create unit object with both ID and name
  const unitData = {
    uomId: formData.unit || formData.unitId,
    uomName: formData.unitName
  };
  
  // FIXED: Ensure warehousecontainerId is properly included
  const selectedContainer = this.containerList.find(
    container => container.containerNo === formData.containerNumber
  );
  
  const warehousecontainerId = formData.warehousecontainerId || 
                              (selectedContainer ? (selectedContainer.warehousecontainerId || selectedContainer.warehouseContainerId || selectedContainer.id) : '');
  
  const gateInData = {
    ...formData,
    entryDateTime: utcDateTime,
    warehousedataentryId: this.id,
    // Send both unit formats for compatibility
    unit: formData.unit || formData.unitId, // Keep original unit ID
    unitId: formData.unit || formData.unitId, // Separate unit ID
    unitName: formData.unitName, // Unit name
    unitData: unitData, // Complete unit object
    purchaser: formData.purchaser || formData.purchaserName || '',
    purchaserId: formData.purchaserId || '',
    purchaserName: formData.purchaserName || '',
    importer: formData.importer || '',
    importerId: formData.importerId || '',
    containerNumber: formData.containerNumber || '', // Container number
    toppleContainerNo: formData.toppleContainerNo || '', // NEW: Topple Container No
    warehousecontainerId: warehousecontainerId // FIXED: Ensure this is always set
  };

  this.commonService.addToST('warehousegateinentry', gateInData)?.subscribe(
    res => {
      if(this.isclone){
        this.notification.create('success', 'Entry cloned successfully!', '');
      }else{
        this.notification.create('success', 'Entry saved successfully!', '');
      }
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

  const formData = this.gateInForm.value;
  
  const unitData = {
    uomId: formData.unit || formData.unitId,
    uomName: formData.unitName
  };
  
  const selectedContainer = this.containerList.find(
    container => container.containerNo === formData.containerNumber
  );
  
  const warehousecontainerId = formData.warehousecontainerId || 
                              (selectedContainer ? (selectedContainer.warehousecontainerId || selectedContainer.warehouseContainerId || selectedContainer.id) : '') ||
                              this.currentEntryData.warehousecontainerId; // Fallback to existing value
  
  const payload = { 
    ...formData,
    // Send both unit formats for compatibility
    unit: formData.unit || formData.unitId, // Keep original unit ID
    unitId: formData.unit || formData.unitId, // Separate unit ID
    unitName: formData.unitName, // Unit name
    unitData: unitData, // Complete unit object
    purchaser: formData.purchaser || formData.purchaserName || '',
    purchaserId: formData.purchaserId || '',
    purchaserName: formData.purchaserName || '',
    importer: formData.importer || '',
    importerId: formData.importerId || '',
    containerNumber: formData.containerNumber || '', // Container number
    toppleContainerNo: formData.toppleContainerNo || '', // NEW: Topple Container No
    warehousecontainerId: warehousecontainerId // FIXED: Ensure this is always set
  };

  const updateEndpoint = `warehousegateinentry/${this.currentEntryData.warehousegateinentryId}`;
  
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

  array: any[] = [];
 
  getWarehouseDispatchById(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };
    this.commonService.getSTList('warehousegateinentry', payload)?.subscribe(
      (inwardRes: any) => {
        this.array = inwardRes?.documents || [];
        const usedContainerNos = this.array
          .map(item => item.containerNumber)
          .filter(Boolean);
        this.commonService.getSTList('warehousegateoutentry', payload)?.subscribe(
          (outwardRes: any) => {
            this.array = outwardRes?.documents || [];
            const outedContainerNos = this.array
              .map(item => item.containerNumber)
              .filter(Boolean);
            this.commonService.getSTList('warehousecontainer', payload)?.subscribe(
              (containerRes: any) => {
                const containers = containerRes?.documents || [];
                if (this.isEditMode && this.moduleId && this.originalData) {
                  const currentContainer = this.originalData.containerNumber;
                  if (outedContainerNos.includes(currentContainer)) {
                    this.containerList = containers
                      .filter(c => c.containerNo === currentContainer)
                      .map((c, index) => ({ ...c, id: index + 1 }));
                  } else {
                    this.containerList = containers
                      .filter(c => !outedContainerNos.includes(c.containerNo))
                      .map((c, index) => ({ ...c, id: index + 1 }));
                  }
                } else {
                  this.containerList = containers
                    .filter(c => !usedContainerNos.includes(c.containerNo))
                    .map((c, index) => ({ ...c, id: index + 1 }));
                }
                if (this.isEditMode && this.moduleId && this.originalData) {
                  this.patchContainerField();
                }

                console.log('Container list loaded:', this.containerList);
              },
              (error) => {
                console.error('Error fetching container list:', error);
                this.containerList = [];
              }
            );
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

  basecontentUrl: string;
  Documentpdf: any

  printData() {
    let reportpayload = { "parameters": { "warehousegateinentryId": this.moduleId } };
    this.commonService.pushreports(reportpayload, 'gateIn').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
        // pdfWindow.print();
      }
    })
  }

private patchContainerField(): void {
  if (this.originalData && this.originalData.containerNumber) {
    const containerExists = this.containerList.find(
      container => container.containerNo === this.originalData.containerNumber
    );
    
    if (containerExists) {
      this.gateInForm.patchValue({
        containerNumber: this.originalData.containerNumber,
        warehousecontainerId: this.originalData.warehousecontainerId || containerExists.warehousecontainerId
      });
      
      console.log('Container field patched:', {
        containerNumber: this.originalData.containerNumber,
        warehousecontainerId: this.originalData.warehousecontainerId || containerExists.warehousecontainerId
      });
    } else {
      console.warn('Container not found in list:', this.originalData.containerNumber);
    }
  }
}

  resetForm() {
    this.submitted = false;
    this.gateInForm.reset();
    this.selectedConsignee = null;
    this.selectedUnit = null; // FIXED: Reset selected unit
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
    const selected = this.jobList.find(j => j.id === event);
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
    });
  }

  getWarehouseData() {
    let payload = this.commonService?.filterList();
    if (payload?.query) payload.query = { warehousedataentryId: this.id };
    this.commonService?.getSTList('warehousebillofentry', payload)?.subscribe((res: any) => {
      console.log('Warehouse Data Entry Response:', res);
      this.dataEntryList = res?.documents?.[0];
      if (!this.isEditMode) {
        this.patchWarehouse();
      }
      
      if (this.dataEntryList?.jobNo || this.dataEntryList?.jobNumber) {
        this.gateInForm.patchValue({
          jobNumber: this.dataEntryList.jobNo || this.dataEntryList.jobNumber,
          whBeNumber: this.dataEntryList.whBeNo  || ""
        });
      }
      if (this.dataEntryList?.year) {
        this.gateInForm.patchValue({
          year: this.dataEntryList.year,
           whBeNumber: this.dataEntryList.whBeNo  || ""
        });
      }
    });
  }

  patchWarehouseData() {
    const d = this.dataEntryList;
    if (!d) return;

    console.log('Patching warehouse data:', d);

    // FIXED: Handle unit data from warehouse entry
    let unitId = '';
    let unitName = '';
    
    if (d.unit) {
      if (typeof d.unit === 'object') {
        unitId = d.unit.uomId || d.unit.id || d.unit._id || '';
        unitName = d.unit.uomName || d.unit.name || '';
      } else {
        unitId = d.unit;
        const unitObj = this.weighthData.find(u => u.uomId === unitId);
        unitName = unitObj ? (unitObj.uomName || unitObj.name) : '';
      }
    }

    if (unitId) {
      this.selectedUnit = this.weighthData.find(u => u.uomId === unitId);
    }

    const patch = {
      jobNumber: d.jobNo || d.jobNumber || '',
      importer: d.importerLedgerName || d.importer || d.importerName || '',
      importerId: d.importerId || '',
      purchaser: d.purchaserLedger || d.purchaser || d.purchaserName || '',
      purchaserId: d.purchaserId || '',
      warehouseName: d.warehouseName || d.warehouse || '',
      warehouseNumber: d.warehouseNumber || d.warehouseName || d.warehouse || '', // ADDED: Ensure warehouse number is populated
      truckNumber: d.truckNumber || '',
      containerNumber: d.containerNumber || '',
      toppleContainerNo: d.toppleContainerNo || '', // NEW: Include topple container field
      warehousecontainerId: d.warehousecontainerId || '', // FIXED: Include container type ID
      transporter: d.transporter || '',
      lrNumber: d.lrNumber || '',
      exBeNumber: d.exBeNumber || '',
      containerWeight:d.containerWeight || null,
      productDescription: d.productDescription || '',
      packages: d.packagesUnit || d.packages || '',
      vessel: d.vesselName || d.vessel || '',
      chaName: d.chaLedgerName || d.chaName || '',
      whBeNumber: d.whBeNo || d.whBeNumber || '',
      year: d.year || '',
      unit: unitId, // FIXED: Set unit ID
      unitId: unitId, // FIXED: Set unit ID separately
      unitName: unitName, // FIXED: Set unit name
      remarks: d.remarks || '',
      assessableValue: d.assessableValue || '',
      dutyAmount: d.dutyAmount || ''
      // REMOVED: grossWeight - no longer needed in Gate-In
    };
    
    console.log('Patch object with container data:', patch);
    this.gateInForm.patchValue(patch);
  }

  patchWarehouse() {
    const d = this.dataEntryList;
    if (!d) return;

    const patch = {
      whBeNumber: d.whBeNo || "",
    };
    
    console.log('Patch warehouse object:', patch);
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
}