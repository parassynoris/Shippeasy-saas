import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';

@Component({
  selector: 'app-inward-container-handover-add',
  templateUrl: './inward-container-handover-add.component.html',
  styleUrls: ['./inward-container-handover-add.component.scss'],
})
export class InwardContainerHandoverAddComponent implements OnInit {
  inwardContainerForm: FormGroup;
  submitted = false;
  submitted1 = false;
  id: any;
  urlParam: any;
  moduleId: any;
  editIndex: any = null;
  containerList: any[] = [];
  editData: any = null;
  isCloneMode: boolean = false;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    this.id = this.route.snapshot?.params['id'];
    this.route.params?.subscribe((params) => (this.urlParam = params));
  }

  onTruckNoInput(event: any): void {
    const value = event.target.value;
    const truckNoControl = this.inwardContainerForm.get('truckNo');

    const hasSpecialCharacters = /[^a-zA-Z0-9]/.test(value);

    if (hasSpecialCharacters) {
      truckNoControl.setErrors({ 'pattern': true });
      truckNoControl.markAsTouched();
    } else {
      if (truckNoControl.errors) {
        delete truckNoControl.errors['pattern'];
        if (Object.keys(truckNoControl.errors).length === 0) {
          truckNoControl.setErrors(null);
        }
      }
    }
  }

  ngOnInit(): void {
    this.inwardContainerForm = this.fb.group({
      containerNo: ['', [Validators.required]],
      truckNo: ['', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]*$/)
      ]],
      emptyLocation: ['', [Validators.required]],
      emptyGatePassNo: ['', [Validators.required]],
      emptyGatePassDateTime: ['', [Validators.required]],
      transporterName: ['', [Validators.required]],
      vehicleSize: ['', [Validators.required]],
      remarks: [''],
      warehousecontainerId: [''],
      BillOfEntry: ['', [Validators.required]],
    });

    const queryParams = this.route.snapshot.queryParams;
    const moduleIdFromRoute = this.route.snapshot.paramMap.get('moduleId') || 
                             this.route.snapshot.params['moduleId'];

    
    this.isCloneMode= this.router.url.includes('/clone') ? true : false;
    
    if (moduleIdFromRoute) {
      this.moduleId = moduleIdFromRoute;
      
      if (this.isCloneMode) {
        this.isEditMode = false;
      } else {
        this.isEditMode = true;
        this.editIndex = this.moduleId;
      }
      
      this.getInwardContainerHandover(this.moduleId);
    } else {
      this.isCloneMode = false;
      this.isEditMode = false;
      this.getWarehouseDispatchById(this.route.snapshot.params['id'], false);
    }
    
    console.log('Final State:', {
      isCloneMode: this.isCloneMode,
      isEditMode: this.isEditMode,
      moduleId: this.moduleId
    });
  }

  array: any[] = [];

  getWarehouseDispatchById(id: string, isEditMode: boolean = false): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };
  
    this.commonService.getSTList('warehousedataentry', payload)?.subscribe(
      (data: any) => {
        if (data?.documents && data.documents.length > 0) {
          const doc = data.documents[0];
          
          this.inwardContainerForm.patchValue({
            BillOfEntry: doc.blofEN
          });
          
          this.loadContainers(isEditMode);
        } else {
          console.error('No warehousedataentry found for ID:', id);
          this.notification.create('error', 'No warehouse data found for this ID', '');
          this.onCancel();
        }
      },
      (error) => {
        console.error('Error fetching warehousedataentry data:', error);
        this.notification.create('error', 'Error loading warehouse data', '');
        this.onCancel();
      }
    );
  }

  loadContainers(isEditMode: boolean = false): void {
    const payload = this.commonService.filterList();
    payload.query = { warehousedataentryId: this.route.snapshot.params['id'] };

    this.commonService.getSTList('inwardcontainerhandover', payload)?.subscribe(
      (inwardRes: any) => {
        this.array = inwardRes?.documents || [];
        let usedContainerNos = this.array
          .map(item => item.containerNo)
          .filter(Boolean);
  
        if (this.isEditMode && !this.isCloneMode && this.editData?.containerNo) {
          usedContainerNos = usedContainerNos.filter(
            containerNo => containerNo !== this.editData.containerNo
          );
        }
  
        this.commonService.getSTList('warehousecontainer', payload)?.subscribe(
          (res: any) => {
            const containers = res?.documents || [];
  
            if (containers.length === 0) {
              this.containerList = [];
              return;
            }
  
            this.commonService.getSTList('warehousegateinentry', payload)?.subscribe(
              (gateInRes: any) => {
                const gateInDocs = gateInRes?.documents || [];
  
                this.containerList = containers
                  .filter(container => {
                    const hasValidStatus = container.gateInStatus === 'Done' && 
                                          container.inWardStatus === 'Done';
                    const isNotUsed = !usedContainerNos.includes(container.containerNo);
                    return hasValidStatus && isNotUsed;
                  })
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
  
                if ((this.isEditMode || this.isCloneMode) && this.editData) {
                  this.patchFormWithEditData();
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
        console.error('Error loading inwardcontainerhandover data:', error);
        this.array = [];
        this.containerList = [];
      }
    );
  }
  
  onContainerType(selectedContainerNo: string): void {
    const selectedContainer = this.containerList.find(
      container => container.containerNo === selectedContainerNo
    );

    if (selectedContainer) {
      this.inwardContainerForm.patchValue({
        containerNo: selectedContainer.containerNo || '',
        truckNo: selectedContainer.truckNumber || '',
        emptyLocation: selectedContainer.location || '',
        emptyGatePassNo: selectedContainer.gatePassNo || '',
        emptyGatePassDateTime: selectedContainer.gatePassDateTime || '',
        transporterName: selectedContainer.transporter || '',
        vehicleSize: selectedContainer.sizeName || '',
        remarks: selectedContainer.remarks || '',
        warehousecontainerId: selectedContainer.warehousecontainerId || '',
      });
    } else {
      this.inwardContainerForm.patchValue({
        containerNo: '',
        truckNo: '',
        emptyLocation: '',
        emptyGatePassNo: '',
        emptyGatePassDateTime: '',
        transporterName: '',
        vehicleSize: '',
        remarks: '',
        warehousecontainerId: ''
      });
    }
  }

  patchFormWithEditData(): void {
    if (!this.editData) return;
    
    console.log('📝 Patching form with data for:', this.isCloneMode ? 'CLONE' : 'EDIT');
    
    this.inwardContainerForm.patchValue({
      containerNo: this.editData.containerNo || '',
      truckNo: this.editData.truckNo || '',
      emptyLocation: this.editData.emptyLocation || '',
      emptyGatePassNo: this.editData.emptyGatePassNo || '',
      emptyGatePassDateTime: this.editData.emptyGatePassDateTime || '',
      transporterName: this.editData.transporterName || '',
      vehicleSize: this.editData.vehicleSize || '',
      remarks: this.editData.remarks || '',
      warehousecontainerId: this.editData.warehousecontainerId || '',
      BillOfEntry: this.editData.BillOfEntry || ''
    });
  }

  getInwardContainerHandover(id) {
    console.log('🔍 Fetching record ID:', id);
    
    let payload = this.commonService?.filterList();
    if (payload?.query) {
      payload.query = {
        inwardcontainerhandoverId: id,
      };
    }
    
    this.commonService
      ?.getSTList('inwardcontainerhandover', payload)
      .subscribe(
        (data) => {
          if (data?.documents && data.documents.length > 0) {
            this.editData = data.documents[0];
            console.log('📦 Record loaded successfully');
            
            this.getWarehouseDispatchById(
              this.route.snapshot.params['id'], 
              this.isEditMode && !this.isCloneMode
            );
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

  onSubmit() {
    this.submitted = true;
    
    this.inwardContainerForm.markAllAsTouched();
    
    if (!this.inwardContainerForm.valid) {
      Object.keys(this.inwardContainerForm.controls).forEach(key => {
        const control = this.inwardContainerForm.get(key);
        if (control && control.invalid) {
          control.markAsDirty();
        }
      });
      
      this.notification.create('error', 'Please fill all required fields', '');
      return;
    }
    
    const formValues = this.inwardContainerForm.getRawValue();
    
    let payload = {
      warehousedataentryId: this.urlParam.id,
      containerNo: formValues.containerNo,
      truckNo: formValues.truckNo,
      emptyLocation: formValues.emptyLocation,
      emptyGatePassNo: formValues.emptyGatePassNo,
      emptyGatePassDateTime: formValues.emptyGatePassDateTime,
      transporterName: formValues.transporterName,
      vehicleSize: formValues.vehicleSize,
      remarks: formValues.remarks,
      warehousecontainerId: formValues.warehousecontainerId,
      BillOfEntry: formValues.BillOfEntry
    };


    if (this.isEditMode === true && this.isCloneMode === false) {
      this.commonService
        .UpdateToST('inwardcontainerhandover/' + this.moduleId, payload)
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Updated Successfully', '');
              this.submitted = false;
              this.onCancel();
            }
          },
          (error) => {
            console.error('❌ UPDATE FAILED:', error);
            this.notification.create('error', error?.error?.error || 'Update failed', '');
            this.submitted = false;
          }
        );
    } else {
      this.commonService.addToST('inwardcontainerhandover', payload)?.subscribe(
        (res: any) => {
          if (res) {
            const successMsg = this.isCloneMode ? 'Cloned Successfully' : 'Added Successfully';
            this.notification.create('success', successMsg, '');
            this.submitted = false;
            this.onCancel();
          }
        },
        (error) => {
          console.error('❌ SAVE FAILED:', error);
          this.notification.create('error', error?.error?.error || 'Save failed', '');
          this.submitted = false;
        }
      );
    }
  }

  onCancel() {
    this.editIndex = null;
    this.editData = null;
    this.isCloneMode = false;
    this.isEditMode = false;
    this.inwardContainerForm.reset();
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}`;
    this.router.navigate([url]);
  }

  getSubmitButtonText(): string {
    if (this.isEditMode && !this.isCloneMode) {
      return 'Update';
    }
    return 'Save';
  }

  get f() {
    return this.inwardContainerForm.controls;
  }
}