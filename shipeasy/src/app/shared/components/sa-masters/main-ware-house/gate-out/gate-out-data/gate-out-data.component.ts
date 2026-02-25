import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-gate-out-data',
  templateUrl: './gate-out-data.component.html',
  styleUrls: ['./gate-out-data.component.scss']
})
export class GateOutDataComponent implements OnInit {
  gateOutForm: FormGroup;
  isEditMode = false;
  currentId: string | null = null;
  submitted = false;
  isclone: boolean = false;
  originalData: any = {};

  // Route parameters
  warehouseId: string | null = null;
  routeKey: string | null = null;
  action: string | null = null;
  moduleId: string | null = null;

  // Lists
  containerList: any[] = [];
  consigneeList: any[] = [];
  packageTypeList: any[] = [];
  locationList: any[] = [];

  // Loading state
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private notification: NzNotificationService,
    private route: ActivatedRoute
  ) {
    const action = this.router.url.includes('/edit') ? 'edit' : 'add';
    this.isclone = this.router.url.includes('/clone') ? true : false;
    this.isEditMode = this.isclone ? false : this.action === 'edit';
    this.gateOutForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialize route parameters
    this.route.params.subscribe(params => {
      this.warehouseId = params['id'];
      this.routeKey = params['key'];
      this.moduleId = params['moduleId'];
      this.action = this.router.url.includes('/edit') ? 'edit' : 'add';
      this.isclone = this.router.url.includes('/clone') ? true : false;
      this.isEditMode = this.isclone ? false : this.action === 'edit';
    });

    // Initialize form
    this.initializeForm();

    // Load dropdown data first (CRITICAL: must load before patching form)
    this.loadDropdownData();

    // Load warehouse data entry
    this.getWarehouseDataEntry();

    // Load containers
    if (this.warehouseId) {
      this.getWarehouseDispatchById(this.warehouseId);
    }

    // Load existing data if in edit mode (after dropdowns are loaded)
    if (this.isEditMode && this.moduleId) {
      this.loadExistingData(this.moduleId);
    }

    // Auto-generate gate pass number for new entries
    if (!this.isEditMode) {
      this.autoGenerateGatePassNumber();
    }
  }

  createForm(): FormGroup {
    return this.formBuilder.group({
      gatePassNumber: ['', [Validators.required]],
      whBeNumber: ['', [Validators.required]],
      exBeNumber: [''], // No validation for Ex-Bill of Entry
      chaName: ['', [Validators.required]],
      partyName: ['', [Validators.required]],
      vehicleNumber: ['', [Validators.required]],
      containerNumber: ['', [Validators.required]],
      warehousecontainerId: [''],
      cargoDescription: ['', [Validators.required]],
      quantity: [0, [Validators.required, Validators.min(0.01)]], // Required and minimum value greater than 0
      unit: ['', [Validators.required]], // Required Package Type
      location: ['', [Validators.required]],

      // Hidden but necessary fields for backend
      warehousedataentryId: [''],
      gateOutDate: [new Date()]
    });
  }

  initializeForm(): void {
    if (!this.isEditMode) {
      this.gateOutForm.patchValue({
        gateOutDate: new Date()
      });
    }
  }

  loadDropdownData(): void {
    // Load Party/Customer list
    this.loadPartyList();

    // Load Package Types
    this.loadPackageTypes();

    // Load Locations
    this.loadLocations();
  }

  loadPartyList(): void {
    const payload = this.commonService.filterList();
    if (payload) {
      payload.query = { status: true };
    }

    this.commonService.getSTList("partymaster", payload)?.subscribe(
      (res: any) => {
        if (res?.documents?.length) {
          this.consigneeList = res.documents;
        }
      },
      (error) => {
        console.error('Error loading party list:', error);
      }
    );
  }

  uomData: any = [];
  weighthData: any = [];

  loadPackageTypes(): void {
    let payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
    });
  }

  loadLocations(): void {
    // Load warehouse locations or areas
    const payload = this.commonService.filterList();
    this.commonService.getSTList("warehouselocation", payload)?.subscribe(
      (res: any) => {
        if (res?.documents?.length) {
          this.locationList = res.documents;
        }
      },
      (error) => {
        console.error('Error loading locations:', error);
        // Fallback to static list if API fails
        this.locationList = [
          { id: 1, name: 'Area A' },
          { id: 2, name: 'Area B' },
          { id: 3, name: 'Area C' }
        ];
      }
    );
  }

  dataEntryList: any = []

  async getWarehouseDataEntry() {
    try {
      const payload = this.commonService?.filterList();
      if (payload) {
        payload.query = {
          warehousedataentryId: this.warehouseId, // Use warehouseId instead of route params
        };
      }

      const res: any = await this.commonService?.getSTList('warehousedataentry', payload)?.toPromise();

      if (res?.documents && res.documents.length > 0) {
        this.dataEntryList = res.documents;

        const firstEntry = this.dataEntryList[0];

        // Determine party name from invoice ledger or importer ledger (based on actual API structure)
        const partyName = firstEntry?.invoiceLedgerName || firstEntry?.importerLedgerName || '';

        // Patch the form with the correct field mapping
        this.gateOutForm.patchValue({
          whBeNumber: firstEntry?.blofEN || '', // Map blofEN to whBeNumber
          chaName: firstEntry?.chaLedgerName || '', // Also populate CHA name if available
          partyName: partyName, // Populate party name from warehouse data
          cargoDescription: firstEntry?.productDescription || '',
          warehousedataentryId: firstEntry?.warehousedataentryId || this.warehouseId
        });

        console.log('Warehouse data loaded and form patched:', firstEntry);
        console.log('Party name set to:', partyName);
      } else {
        console.log('No warehouse data found');
        this.dataEntryList = [];
      }
    } catch (error) {
      console.error('Error loading warehouse data:', error);
      this.notification.error('Error', 'Failed to load warehouse data');
      this.dataEntryList = [];
    }
  }

  private findPartyIdByName(name: string, partyList: any[]): string | null {
    if (!name || !partyList || partyList.length === 0) {
      return null;
    }

    const foundParty = partyList.find(party =>
      party.name?.toLowerCase() === name.toLowerCase()
    );

    return foundParty ? foundParty.partymasterId : null;
  }

  batchDetails: any;
  array: any[] = [];
  getWarehouseDispatchById(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };

    // 1️⃣ Fetch warehouse gate-out entries
    this.commonService.getSTList('warehousegateoutentry', payload)?.subscribe(
      (gateOutRes: any) => {
        this.array = gateOutRes?.documents || [];

        // Calculate total outward quantity per container
        const containerOutwardQty: { [key: string]: number } = {};
        this.array.forEach(entry => {
          const containerNo = entry.containerNumber;
          const qty = parseFloat(entry.quantity || entry.packages || 0);
          if (containerNo) {
            containerOutwardQty[containerNo] = (containerOutwardQty[containerNo] || 0) + qty;
          }
        });

        // 2️⃣ Fetch all warehouse containers
        this.commonService.getSTList('warehousecontainer', payload)?.subscribe(
          (containerRes: any) => {
            const containers = containerRes?.documents || [];

            // 3️⃣ Fetch warehouseinward to get actual inward quantities
            this.commonService.getSTList('warehouseinward', payload)?.subscribe(
              (inwardRes: any) => {
                const inwardDocs = inwardRes?.documents || [];

                // Calculate total inward quantity per container
                const containerInwardQty: { [key: string]: number } = {};
                inwardDocs.forEach(entry => {
                  // Find the container number from containers array using warehousecontainerId
                  const container = containers.find(c => c.warehousecontainerId === entry.warehousecontainerId);
                  if (container) {
                    const containerNo = container.containerNo;
                    const qty = parseFloat(entry.quantity || entry.packages || 0);
                    containerInwardQty[containerNo] = (containerInwardQty[containerNo] || 0) + qty;
                  }
                });

                // 4️⃣ Fetch warehouse gate-in entries to get toppleContainerNo
                this.commonService.getSTList('warehousegateinentry', payload)?.subscribe(
                  (gateInRes: any) => {
                    const gateInDocs = gateInRes?.documents || [];

                    // Map containers with toppleContainerNo and remaining quantity
                    let mappedContainers = containers.map((container, index) => {
                      const gateInMatch = gateInDocs.find(
                        g => g.warehousecontainerId === container.warehousecontainerId
                      );

                      const containerNo = container.containerNo;
                      const inwardQty = containerInwardQty[containerNo] || 0;
                      const outwardQty = containerOutwardQty[containerNo] || 0;
                      const remainingQty = inwardQty - outwardQty;

                      return {
                        ...container,
                        id: index + 1,
                        toppleContainerNo: gateInMatch?.toppleContainerNo || null,
                        inwardQty: inwardQty,
                        outwardQty: outwardQty,
                        remainingQty: remainingQty
                      };
                    });

                    // 5️⃣ Apply filtering logic
                    if (!this.isEditMode) {
                      // In add mode: filter out containers that are fully gated out
                      mappedContainers = mappedContainers.filter(
                        container => container.gateInStatus === 'Done' && container.remainingQty > 0
                      );
                    } else {
                      // In edit mode: include current container even if fully gated out
                      mappedContainers = mappedContainers.filter(
                        container => {
                          const isCurrentContainer = this.originalData?.containerNumber === container.containerNo;
                          return container.gateInStatus === 'Done' && (container.remainingQty > 0 || isCurrentContainer);
                        }
                      );
                    }

                    this.containerList = mappedContainers;

                    // 6️⃣ Patch form if edit mode
                    if (this.isEditMode && this.originalData) {
                      this.patchContainerField();
                    }

                    console.log('Container list with remaining quantities:', this.containerList);
                  },
                  (error) => {
                    console.error('Error fetching gate-in entries:', error);
                    this.containerList = [];
                  }
                );
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
        console.error('Error fetching gate-out entries:', error);
        this.array = [];
        this.containerList = [];
      }
    );
  }


  selectedContainerRemainingQty: number = 0;

  onContainerChange(selectedContainerNo: string): void {
    const selectedContainer = this.containerList.find(
      container => container.containerNo === selectedContainerNo
    );

    if (selectedContainer) {
      this.selectedContainerRemainingQty = selectedContainer.remainingQty || 0;

      this.gateOutForm.patchValue({
        containerNumber: selectedContainer.containerNo,
        warehousecontainerId: selectedContainer.warehousecontainerId || ''
      });

      // Update quantity validator to include max remaining quantity
      const quantityControl = this.gateOutForm.get('quantity');
      if (quantityControl) {
        quantityControl.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(this.selectedContainerRemainingQty)
        ]);
        quantityControl.updateValueAndValidity();
      }
    }
  }

  loadExistingData(id: string): void {
    this.isLoading = true;

    const payload = this.commonService.filterList();
    payload.query = { warehousegateoutentryId: id };

    this.commonService.getSTList("warehousegateoutentry", payload)?.subscribe(
      (res: any) => {
        this.isLoading = false;

        if (res?.documents?.length > 0) {
          const data = res.documents[0];
          this.currentId = data.warehousegateoutentryId;
          this.originalData = { ...data };

          // Wait for consigneeList to load before patching partyName
          if (this.consigneeList.length === 0) {
            // If consigneeList is not loaded yet, wait for it
            const checkInterval = setInterval(() => {
              if (this.consigneeList.length > 0) {
                clearInterval(checkInterval);
                this.patchFormData(data);
              }
            }, 100);

            // Timeout after 3 seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              if (this.consigneeList.length === 0) {
                console.warn('Party list not loaded, patching form anyway');
                this.patchFormData(data);
              }
            }, 3000);
          } else {
            this.patchFormData(data);
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

  private patchFormData(data: any): void {
    // Patch form with existing data
    this.gateOutForm.patchValue({
      gatePassNumber: data.gatePassNumber || '',
      whBeNumber: data.whBeNumber || '',
      exBeNumber: data.exBeNumber || '',
      chaName: data.chaName || '',
      partyName: data.partyName || data.purchaserName || '',
      vehicleNumber: data.vehicleNumber || data.truckNumber || '',
      containerNumber: data.containerNumber || '',
      warehousecontainerId: data.warehousecontainerId || '',
      cargoDescription: data.cargoDescription || data.productDescription || '',
      quantity: data.quantity || data.packages || 0, // Ensure it's a number
      unit: data.packageType || data.unit || '', // Map packageType to unit field
      location: data.location || data.warehouseLocation || '',
      warehousedataentryId: data.warehousedataentryId || this.warehouseId,
      gateOutDate: data.gateOutDate || new Date()
    });

    console.log('Form patched with partyName:', data.partyName || data.purchaserName);
  }

  private patchContainerField(): void {
    if (this.originalData && this.originalData.containerNumber) {
      const containerExists = this.containerList.find(
        container => container.containerNo === this.originalData.containerNumber
      );

      if (containerExists) {
        this.gateOutForm.patchValue({
          containerNumber: this.originalData.containerNumber,
          warehousecontainerId: this.originalData.warehousecontainerId || containerExists.warehousecontainerId
        });
      }
    }
  }

  autoGenerateGatePassNumber(): void {
    if (!this.isEditMode) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const month = currentDate.getMonth();

      let financialYearStart: number;
      let financialYearEnd: number;

      if (month >= 3) {
        financialYearStart = currentYear;
        financialYearEnd = currentYear + 1;
      } else {
        financialYearStart = currentYear - 1;
        financialYearEnd = currentYear;
      }

      const financialYear = `${financialYearStart}-${financialYearEnd.toString().substr(-2)}`;
      const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const gatePassNumber = `GP-OUT-${financialYear}-${sequence}`;

      this.gateOutForm.patchValue({ gatePassNumber });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.gateOutForm.valid) {
      const formValue = this.gateOutForm.value;

      // Prepare payload with correct field mappings
      const payload: any = {
        gatePassNumber: formValue.gatePassNumber,
        whBeNumber: formValue.whBeNumber,
        exBeNumber: formValue.exBeNumber,
        chaName: formValue.chaName,
        partyName: formValue.partyName,
        purchaserName: formValue.partyName,
        vehicleNumber: formValue.vehicleNumber,
        truckNumber: formValue.vehicleNumber,
        containerNumber: formValue.containerNumber,
        warehousecontainerId: formValue.warehousecontainerId,
        cargoDescription: formValue.cargoDescription,
        productDescription: formValue.cargoDescription,
        quantity: formValue.quantity ? parseFloat(formValue.quantity) : 0,
        packages: formValue.quantity ? parseFloat(formValue.quantity) : 0,
        packageType: formValue.unit || '',
        unit: formValue.unit || '',
        location: formValue.location,
        warehouseLocation: formValue.location,
        gateOutDate: formValue.gateOutDate,
        warehousedataentryId: formValue.warehousedataentryId || this.warehouseId
      };

      if (this.isEditMode && this.currentId && !this.isclone) {
        // Update existing record
        this.commonService.UpdateToST("warehousegateoutentry/" + this.currentId, payload)?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Gate Out Data Updated Successfully', '');
              setTimeout(() => {
                this.navigateBack();
              }, 1000);
            }
          },
          (error) => {
            console.error('Update error:', error);
            this.notification.create('error', error?.error?.message || 'Update failed', '');
          }
        );
      } else {
        // Create new record
        this.commonService.addToST("warehousegateoutentry", payload)?.subscribe(
          (res: any) => {
            if (res) {
              const message = this.isclone ?
                'Gate Out Data cloned successfully!' :
                'Gate Out Data Added Successfully';
              this.notification.create('success', message, '');
              setTimeout(() => {
                this.navigateBack();
              }, 1000);
            }
          },
          (error) => {
            console.error('Add error:', error);
            this.notification.create('error', error?.error?.message || 'Add failed', '');
          }
        );
      }
    } else {
      this.markFormGroupTouched();
      this.notification.create('warning', 'Please fill all required fields', '');
    }
  }

  onCancel(): void {
    this.navigateBack();
  }

  printData(): void {
    if (this.moduleId) {
      const reportPayload = {
        parameters: {
          warehousegateoutentryId: this.moduleId
        }
      };

      this.commonService.pushreports(reportPayload, 'gateOut').subscribe({
        next: (res: any) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);
          window.open(pdfUrl);
        },
        error: (error) => {
          console.error('Print error:', error);
          this.notification.create('error', 'Failed to generate print', '');
        }
      });
    }
  }

  private navigateBack(): void {
    if (this.warehouseId && this.routeKey) {
      this.router.navigate(['/warehouse/main-ware-house/details', this.warehouseId, this.routeKey]);
    } else {
      this.router.navigate(['/gate-out']);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.gateOutForm.controls).forEach(key => {
      const control = this.gateOutForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string): boolean {
    const field = this.gateOutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.gateOutForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} must be greater than ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${field.errors['max'].max} (remaining quantity)`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      'gatePassNumber': 'Gate Pass Number',
      'whBeNumber': 'In-Bill of Entry',
      'exBeNumber': 'Ex-Bill of Entry',
      'chaName': 'CHA Name',
      'partyName': 'Party Name',
      'vehicleNumber': 'Vehicle Number',
      'containerNumber': 'Container Number',
      'cargoDescription': 'Cargo Description',
      'quantity': 'Quantity',
      'unit': 'Package Type',
      'location': 'Location'
    };

    return fieldNames[fieldName] || fieldName;
  }
}