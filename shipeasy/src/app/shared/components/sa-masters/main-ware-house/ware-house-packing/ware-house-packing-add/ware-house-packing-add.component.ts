import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-ware-house-packing-add',
  templateUrl: './ware-house-packing-add.component.html',
  styleUrls: ['./ware-house-packing-add.component.scss']
})

export class WareHousePackingAddComponent implements OnInit {
  inwardContainerForm: FormGroup;
  submitted = false;
  submitted1 = false;
  id: any;
  statusList = ['Handover', 'Pending'];
  BOELIst = ['BOE1', 'BOE2'];
  urlParam: any;
  moduleId: any;
  isBondedFlow: boolean = true;
  editIndex: any = null;
  containerList: any[] = [];
  batchDetails: any;
  gateInEntries: any;

  // Existing properties for UOM data
  uomData: any[] = [];
  weighthData: any[] = [];

  // New properties for dropdown data
  dataEntryList: any[] = [];
  partymasterList: any[] = [];
  WareHouseImporterList: any[] = [];
  WareHouseCHAList: any[] = [];
  WareHouseExporterList: any[] = [];
  vesselList: any[] = [];
  surveyorList: any[] = [];
  inwardsForm: any;
  warehouseinwardDataId: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonFunction: CommonFunctions,
  ) {
    this.id = this.route.snapshot?.params['id'];
    this.route.params?.subscribe((params) => (this.urlParam = params));
  }

  warehouseDataEntryId: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.loadAllDropdownData().then(() => {
      const moduleIdFromRoute = this.route.snapshot.paramMap.get('moduleId') ||
        this.route.snapshot.params['moduleId'];
      if (moduleIdFromRoute) {
        this.moduleId = moduleIdFromRoute;
        this.editIndex = this.moduleId;
      }
      this.fetchGateInEntries();

      this.getWarehouseDispatchById(this.route.snapshot.params['id']);

      this.setupFormListeners();

      if (this.route.snapshot.paramMap.get('id')) {
        this.warehouseDataEntryId = this.route.snapshot.paramMap.get('id');
        this.getWarehouseDataEntryById(this.warehouseDataEntryId);
      }
    });
  }

  type: any;

  getWarehouseDataEntryById(id) {
    let payload = this.commonService?.filterList();
    if (payload?.query)
      payload.query = {
        warehousedataentryId: id,
      };

    this.commonService
      ?.getSTList('warehousedataentry', payload)
      .subscribe((data) => {
        this.dataEntryList = data?.documents[0];
        this.type = data?.documents[0]?.type;

        // Update validators after getting the type
        this.updateValidatorsBasedOnType();
      });
  }

  // Add this new method to update validators based on type
  updateValidatorsBasedOnType() {
    const warehouseNameControl = this.inwardContainerForm.get('warehouseName');
    const containerNoControl = this.inwardContainerForm.get('constainerNo');
    const billOfEntryControl = this.inwardContainerForm.get('billOfEntryNo');

    if (this.type === 'Bonded') {
      // Add required validators for Bonded type
      warehouseNameControl?.setValidators([Validators.required]);
      containerNoControl?.setValidators([Validators.required]);
      billOfEntryControl?.setValidators([Validators.required]);
    } else {
      // Remove required validators for non-Bonded type
      warehouseNameControl?.clearValidators();
      containerNoControl?.clearValidators();
      billOfEntryControl?.clearValidators();
    }

    // Update validity after changing validators
    warehouseNameControl?.updateValueAndValidity();
    containerNoControl?.updateValueAndValidity();
    billOfEntryControl?.updateValueAndValidity();
  }

  initializeForm() {
    this.inwardContainerForm = this.fb.group({
      // New required fields - all mandatory except vesselName and noOfEmptyBags
      partyName: ['', Validators.required],
      chaName: ['', Validators.required],
      vesselName: [''], // Optional field
      warehouseName: [''], // Remove required validator initially
      location: ['', Validators.required],
      constainerNo: [''], // Remove required validator initially
      billOfEntryNo: [''], // Remove required validator initially

      // Existing fields - all mandatory except noOfEmptyBags
      packingType: ['', Validators.required],
      noOfEmptyBags: [''], // Optional field
      packingDate: ['', Validators.required],
      qtyPackedFromStock: ['', Validators.required],
      vendorsLabours: ['', Validators.required],
      surveyors: [null, Validators.required], // Now mandatory
      status: [''],
      remarks: [''], // Now mandatory

      // Other existing fields
      emptyGatePassNo: [''],
      emptyGatePassDateTime: [''],
      emptyVehicleNo: [''],
      emptyTransportLedgerName: [''],
      gatePassNo: [''],
      gatePassDateTime: [''],
      BOE: [''],
      receiptDateTime: [''],
      jobBeContainerNo: [''],
      jobBeSealNo: [''],
      jobBeCfsSealNo: [''],
      sizeName: [''],
      warehousecontainerId: [''],
      cfsSealNo: [''],
      jobNo: ['']
    });
  }

  setupFormListeners() {
    // Set default status
    setTimeout(() => {
      this.statusList = ['Pending', 'HandOver'];
      this.inwardContainerForm.get('status')?.setValue('HandOver');
    });

    // Listen for gate pass changes
    this.inwardContainerForm.get('gatePassNo')?.valueChanges.subscribe((selectedGatePassNo) => {
      this.onGatePassNoChange(selectedGatePassNo);
    });
  }

  async loadAllDropdownData() {
    try {
      // Load all dropdown data in parallel
      await Promise.all([
        this.getUomList(),
        this.getWarehouseDataEntry(),
        this.getPartyMasterDropDowns(),
        this.getVesselListDropDown()
      ]);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      this.notification.error('Error', 'Failed to load dropdown data');
    }
  }

  // Method to get warehouse data entry for Job No dropdown
  async getWarehouseDataEntry() {
    try {
      const payload = this.commonService?.filterList();
      if (payload) {
        payload.query = {
          warehousedataentryId: this.route.snapshot.params['id'],
        };
      }

      const res: any = await this.commonService?.getSTList('warehousedataentry', payload)?.toPromise();

      if (res?.documents && res.documents.length > 0) {
        this.dataEntryList = res.documents;

        // Auto-populate warehouse data fields
        const firstEntry = this.dataEntryList[0];

        // Determine which field to use for party name based on type
        let partyNameValue = '';
        if (firstEntry?.type === 'Non Bonded') {
          // For Non Bonded, use invoiceLedgerName or invoiceLedger
          partyNameValue = firstEntry?.invoiceLedgerName || firstEntry?.invoiceLedger || '';
        } else {
          // For Bonded, use importerLedgerName or importerLedger
          partyNameValue = firstEntry?.importerLedgerName || firstEntry?.importerLedger || '';
        }

        // Find the corresponding party master IDs for auto-patching dropdowns
        const chaId = this.findPartyIdByName(firstEntry?.chaLedgerName, this.WareHouseCHAList);
        const partyId = this.findPartyIdByName(partyNameValue, this.WareHouseImporterList);

        this.inwardContainerForm.patchValue({
          location: firstEntry?.location || '',
          warehouseName: firstEntry?.warehouseName || '',
          billOfEntryNo: firstEntry?.blofEN || firstEntry?.billOfEntryNo || '',

          // Auto-patch CHA Name
          chaName: chaId || firstEntry?.chaLedger || '',

          // Auto-patch Party Name - handles both Bonded and Non Bonded
          partyName: partyId || (firstEntry?.type === 'Non Bonded'
            ? (firstEntry?.invoiceLedger || '')
            : (firstEntry?.importerLedger || '')),

          // Auto-patch Vessel Name
          vesselName: firstEntry?.vesselName || ''
        });

        console.log('Warehouse data loaded and form patched:', {
          type: firstEntry?.type,
          chaName: firstEntry?.chaLedgerName,
          partyName: partyNameValue,
          vesselName: firstEntry?.vesselName,
          chaId,
          partyId
        });
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

  // Method to get party master dropdowns
  async getPartyMasterDropDowns() {
    try {
      // Initialize arrays
      this.partymasterList = [];
      this.WareHouseExporterList = [];
      this.WareHouseImporterList = [];
      this.WareHouseCHAList = [];

      const payload = this.commonService.filterList();
      if (payload) payload.query = { "status": true };

      const res: any = await this.commonService.getSTList("partymaster", payload)?.toPromise();

      if (res?.documents && res.documents.length > 0) {
        this.partymasterList = res.documents;

        // Filter based on customer type
        res.documents.forEach((party: any) => {
          if (party.customerType && Array.isArray(party.customerType)) {
            party.customerType.forEach((customerType: any) => {
              switch (customerType?.item_text) {
                case 'WareHouseExporter':
                  this.WareHouseExporterList.push(party);
                  break;
                case 'WareHouseImporter':
                  this.WareHouseImporterList.push(party);
                  break;
                case 'WareHouseCHA':
                  this.WareHouseCHAList.push(party);
                  break;
              }
            });
          }
        });

        console.log('Party data loaded:', {
          importers: this.WareHouseImporterList.length,
          cha: this.WareHouseCHAList.length,
          exporters: this.WareHouseExporterList.length
        });
      } else {
        console.log('No party master data found');
      }
    } catch (error) {
      console.error('Error loading party master data:', error);
      this.notification.error('Error', 'Failed to load party data');
    }
  }

  // Method to get vessel list dropdown
  async getVesselListDropDown() {
    try {
      const payload = this.commonService.filterList();
      if (payload) payload.query = { status: true };

      const res: any = await this.commonService.getSTList('vessel', payload)?.toPromise();

      if (res?.documents && res.documents.length > 0) {
        this.vesselList = res.documents;
        console.log('Vessel data loaded:', this.vesselList.length);
      } else {
        console.log('No vessel data found');
        this.vesselList = [];
      }
    } catch (error) {
      console.error('Error loading vessel data:', error);
      this.notification.error('Error', 'Failed to load vessel data');
      this.vesselList = [];
    }
  }

  getUomList(): void {
    const payload = this.commonService.filterList();
    if (payload) payload.query = { 'status': true };

    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      // this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
      const result = data?.documents?.filter(
        item => item?.uomCategory?.toLowerCase() === 'weight' || item?.uomCategory?.toLowerCase() === 'wight'
      );
      this.weighthData = result
    });

    const userpayload = this.commonService.filterList();
    if (userpayload) {
      userpayload.query = { 'userType': 'warehouse' };
    }

    this.commonService.getSTList('user', userpayload)?.subscribe((data) => {
      this.surveyorList = data?.documents;

      // FIX 7: Only set default surveyor if not in edit mode and no existing value
      const id = this.commonFunction.getAgentDetails()?.userId;
      if (!this.warehouseinwardDataId && !this.inwardsForm?.get('surveyorName')?.value && this.surveyorList?.some(dd => dd?.userId === id)) {
        this.inwardsForm?.get('surveyorName')?.setValue(id);
      }
    });
  }

  onGatePassNoChange(selectedGatePassNo: string): void {
    if (selectedGatePassNo && this.gateInEntries?.length > 0) {
      const selectedEntry = this.gateInEntries.find(
        (entry: any) => entry.gatePassNumber === selectedGatePassNo
      );

      if (selectedEntry) {
        this.inwardContainerForm.patchValue({
          vehicleNo: selectedEntry.truckNumber || '',
          receiptDateTime: selectedEntry.entryDateTime || '',
          transportName: selectedEntry.transporter || '',
          lrNo: selectedEntry.lrNumber || '',
        });
      }
    }
  }

  fetchGateInEntries() {
    const payload = {
      query: {
        warehousedataentryId: this.id
      }
    };

    this.commonService.getSTList('warehousegateinentry', payload)?.subscribe({
      next: (res: any) => {
        if (res?.documents && res.documents.length > 0) {
          this.gateInEntries = res.documents;
        } else {
          this.gateInEntries = [];
        }
      },
      error: (error: any) => {
        console.error('Fetch error:', error);
        this.notification.error('Error', 'Failed to load entries');
        this.gateInEntries = [];
      }
    });
  }

  onContainerType(selectedContainerNo: string): void {
    console.log('Selected container:', selectedContainerNo);
    console.log('Available containers:', this.containerList);

    if (selectedContainerNo && this.containerList?.length > 0) {
      const selectedContainer = this.containerList.find(
        container => container.containerNo === selectedContainerNo // containerList has 'containerNo'
      );

      console.log('Found container:', selectedContainer);

      if (selectedContainer) {
        this.inwardContainerForm.patchValue({
          constainerNo: selectedContainer.containerNo || '', // Map containerNo to constainerNo
          warehousecontainerId: selectedContainer.warehousecontainerId || ''
        });
      } else {
        this.inwardContainerForm.patchValue({
          constainerNo: '',
          warehousecontainerId: ''
        });
      }
    } else {
      this.inwardContainerForm.patchValue({
        constainerNo: '',
        warehousecontainerId: ''
      });
    }
  }

  array: any[] = [];

  getWarehouseDispatchById(id: string): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };

    this.commonService.getSTList('warehousepacking', payload)?.subscribe(
      (inwardRes: any) => {
        this.array = inwardRes?.documents || [];
        const usedContainerNos = this.array
          .filter(item => this.editIndex ? item.warehousepackingId !== this.editIndex : true)
          .map(item => item.constainerNo) // Backend uses 'constainerNo'
          .filter(Boolean);

        console.log('Used container numbers:', usedContainerNos);

        this.commonService.getSTList('warehousecontainer', payload)?.subscribe(
          (res: any) => {
            if (res?.documents?.length > 0) {
              this.containerList = res.documents
                .filter(container => {
                  const isNotUsed = !usedContainerNos.includes(container.containerNo);
                  const hasCorrectStatus = container.gateInStatus === 'Done'
                  const isCurrentContainer = this.editIndex &&
                    (container.containerNo === this.getCurrentContainerNo());

                  return (isNotUsed || isCurrentContainer) && hasCorrectStatus;
                })
                .map((container, index) => ({
                  ...container,
                  id: index + 1
                }));

              console.log('Filtered container list:', this.containerList);
              // If in edit mode, patch the form after container list is loaded
            } else {
              console.log('No documents found in response');
              this.containerList = [];
            }
          },
          (error) => {
            console.error('Error loading warehouse container data:', error);
            this.containerList = [];
          }
        );
        if (this.editIndex) {
          setTimeout(() => {
            this.getInwardContainerHandover(this.moduleId);
          }, 100);
        }
      },
      (error) => {
        console.error('Error loading warehousepacking data:', error);
        this.array = [];
        this.containerList = [];
      }
    );
  }

  getCurrentContainerNo(): string {
    return this.inwardContainerForm.get('constainerNo')?.value || '';
  }

  getInwardContainerHandover(id: any) {
    console.log('Fetching data for ID:', id);
    const payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = {
        warehousepackingId: id,
      };
    }

    this.commonService?.getSTList('warehousepacking', payload)?.subscribe(
      (data) => {
        if (data?.documents && data.documents.length > 0) {
          const InwardHandOverList = data.documents[0];
          console.log('Edit data:', InwardHandOverList);

          // Backend saves as 'constainerNo'
          const containerNo = InwardHandOverList.constainerNo;

          // Ensure the container is available in the dropdown
          if (containerNo && !this.containerList.find(c => c.containerNo === containerNo)) {
            this.addCurrentContainerToList(containerNo, InwardHandOverList.warehousecontainerId);
          }

          this.inwardContainerForm.patchValue({
            // Backend field name is 'constainerNo'
            constainerNo: containerNo,
            partyName: InwardHandOverList.partyName,
            chaName: InwardHandOverList.chaName,
            vesselName: InwardHandOverList.vesselName,
            location: InwardHandOverList.location,
            warehouseName: InwardHandOverList.warehouseName,
            billOfEntryNo: InwardHandOverList.billOfEntryNo,

            // Existing fields
            jobNo: InwardHandOverList.jobNo,
            emptyGatePassNo: InwardHandOverList.emptyGatePassNo,
            emptyGatePassDateTime: InwardHandOverList.emptyGatePassDateTime,
            emptyVehicleNo: InwardHandOverList.emptyVehicleNo,
            emptyTransportLedgerName: InwardHandOverList.emptyTransportLedgerName,
            gatePassNo: InwardHandOverList.gatePassNo,
            gatePassDateTime: InwardHandOverList.gatePassDateTime,
            BOE: InwardHandOverList.BOE,
            receiptDateTime: InwardHandOverList.receiptDateTime,
            jobBeContainerNo: InwardHandOverList.jobBeContainerNo,
            jobBeSealNo: InwardHandOverList.jobBeSealNo,
            jobBeCfsSealNo: InwardHandOverList.jobBeCfsSealNo,
            sizeName: InwardHandOverList.sizeName,
            warehousecontainerId: InwardHandOverList.warehousecontainerId || '',
            cfsSealNo: InwardHandOverList.cfsSealNo,
            status: InwardHandOverList.status,
            packingType: InwardHandOverList.packingType,
            noOfEmptyBags: InwardHandOverList.noOfEmptyBags,
            packingDate: InwardHandOverList.packingDate,
            qtyPackedFromStock: InwardHandOverList.qtyPackedFromStock,
            vendorsLabours: InwardHandOverList.vendorsLabours,
            surveyors: InwardHandOverList.surveyors,
            remarks: InwardHandOverList.remarks
          });

          console.log('Form patched with:', this.inwardContainerForm.value);
        } else {
          console.error('No data found for ID:', id);
          this.notification.create('error', 'No data found for this ID', '');
          this.onCancel();
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.notification.create('error', 'Error loading data', '');
        this.onCancel();
      }
    );
  }

  addCurrentContainerToList(containerNo: string, warehousecontainerId?: string): void {
    if (containerNo && !this.containerList.find(c => c.containerNo === containerNo)) {
      // Add the current container to the list for edit mode
      this.containerList.unshift({
        containerNo: containerNo, // containerList uses 'containerNo'
        warehousecontainerId: warehousecontainerId || '',
        id: 0,
        // Add any other required fields with default values
        gateInStatus: 'Done',
        inWardStatus: 'Done'
      });
      console.log('Added current container to list:', containerNo);
    }
  }

  // Updated onSubmit to include new fields in payload
  onSubmit() {
    this.submitted = true;
    if (!this.inwardContainerForm.valid) {
      this.inwardContainerForm.markAllAsTouched();
      this.notification.error('Error', 'Please fill all required fields');
      return;
    }

    const inwardContainerHandOverForm = this.inwardContainerForm.getRawValue();
    const payload = {
      warehousedataentryId: this.urlParam.id,

      // New fields in payload
      partyName: inwardContainerHandOverForm.partyName,
      chaName: inwardContainerHandOverForm.chaName,
      vesselName: inwardContainerHandOverForm.vesselName,
      location: inwardContainerHandOverForm.location,
      warehouseName: inwardContainerHandOverForm.warehouseName,
      constainerNo: inwardContainerHandOverForm.constainerNo, // Fixed: was constainerNo
      billOfEntryNo: inwardContainerHandOverForm.billOfEntryNo,

      // Existing fields
      jobNo: inwardContainerHandOverForm.jobNo,
      emptyGatePassNo: inwardContainerHandOverForm.emptyGatePassNo,
      emptyGatePassDateTime: inwardContainerHandOverForm.emptyGatePassDateTime,
      emptyVehicleNo: inwardContainerHandOverForm.emptyVehicleNo,
      emptyTransportLedgerName: inwardContainerHandOverForm.emptyTransportLedgerName,
      gatePassNo: inwardContainerHandOverForm.gatePassNo,
      gatePassDateTime: inwardContainerHandOverForm.gatePassDateTime,
      BOE: inwardContainerHandOverForm.BOE,
      receiptDateTime: inwardContainerHandOverForm.receiptDateTime,
      jobBeContainerNo: inwardContainerHandOverForm.jobBeContainerNo,
      jobBeSealNo: inwardContainerHandOverForm.jobBeSealNo,
      jobBeCfsSealNo: inwardContainerHandOverForm.jobBeCfsSealNo,
      sizeName: inwardContainerHandOverForm.sizeName,
      warehousecontainerId: inwardContainerHandOverForm.warehousecontainerId,
      cfsSealNo: inwardContainerHandOverForm.cfsSealNo,
      status: inwardContainerHandOverForm.status,
      packingType: inwardContainerHandOverForm.packingType,
      noOfEmptyBags: inwardContainerHandOverForm.noOfEmptyBags,
      packingDate: inwardContainerHandOverForm.packingDate,
      qtyPackedFromStock: inwardContainerHandOverForm.qtyPackedFromStock,
      vendorsLabours: inwardContainerHandOverForm.vendorsLabours,
      surveyors: inwardContainerHandOverForm.surveyors,
      remarks: inwardContainerHandOverForm.remarks
    };

    console.log('Submitting payload:', payload);

    if (this.editIndex !== null) {
      this.commonService?.UpdateToST('warehousepacking/' + this.moduleId, payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            this.submitted = false;
            this.onCancel();
          }
        },
        (error) => {
          console.error('Update error:', error);
          this.notification.create('error', error?.error?.error || 'Update failed', '');
        }
      );
    } else {
      this.commonService.addToST('warehousepacking', payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.submitted = false;
            this.onCancel();
          }
        },
        (error) => {
          console.error('Add error:', error);
          this.notification.create('error', error?.error?.error || 'Add failed', '');
        }
      );
    }
  }

  onCancel() {
    this.editIndex = null;
    this.inwardContainerForm.reset();
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}`;
    this.router.navigate([url]);
  }

  get f() {
    return this.inwardContainerForm.controls;
  }
  blockInvalidInput(event: KeyboardEvent) {
    const invalidChars = ['e', 'E', '+', '-'];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }
}