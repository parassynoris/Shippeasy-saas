import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { NewWareHouseDoucmentComponent } from '../../ware-house-bill-of-entry/new-ware-house-doucment/new-ware-house-doucment.component';
import { document } from 'src/app/models/document';

@Component({
  selector: 'app-ex-bond-billentry-add',
  templateUrl: './ex-bond-billentry-add.component.html',
  styleUrls: ['./ex-bond-billentry-add.component.scss'],
})
export class ExBondBillentryComponentAdd implements OnInit {
  inwardContainerForm: FormGroup;
  submitted = false;
  submitted1 = false;
  uomData: any;
  weighthData: any;
  documentData: document[] = [];
  urlParam: any;
  editIndex: any = null;
  moduleId: any;
  selectedEntryType: string = '';
  isEditMode: boolean = false;
  
  // Store original edit data
  private originalEditData: any = null;

  billOfEntryList = [
    { id: 'BE001', name: 'BE Entry 001' },
    { id: 'BE002', name: 'BE Entry 002' },
    { id: 'BE003', name: 'BE Entry 003' },
  ];

  entryTypeOptions = [
    { value: 'EX-BOND', label: 'EX-BOND' },
    { value: 'RE-EXPORT', label: 'RE-EXPORT' },
    { value: 'BOND TO BOND TRANSFER', label: 'BOND TO BOND TRANSFER' },
    { value: 'DISPOSAL', label: 'DISPOSAL' }
  ];

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    this.route.params?.subscribe((params) => (this.urlParam = params));
  }

  ngOnInit(): void {
    this.initializeForm();
    
    this.selectedEntryType = this.inwardContainerForm.get('entryType')?.value || 'EX-BOND';
    
    this.getUomList();
    setTimeout(() => {
      this.getWarehouseDataEntryById(this.urlParam.id);
    }, 500);
  
    if (this.route.snapshot.paramMap.get('moduleId')) {
      this.moduleId = this.route.snapshot.paramMap.get('moduleId');
      this.editIndex = this.moduleId;
      this.isEditMode = true;
      this.getExBondBillEntry(this.moduleId);
    } else {
      this.setupCheckboxListener();
    }
  }

  setupCheckboxListener(): void {
    this.inwardContainerForm.get('toppleForAdvanceLicense')?.valueChanges.subscribe(value => {
      if (value) {
        // Disable and clear validators for challanDuty and dutyAmount
        this.inwardContainerForm.get('challanDuty')?.disable();
        this.inwardContainerForm.get('dutyAmount')?.disable();
        this.inwardContainerForm.get('challanDuty')?.clearValidators();
        this.inwardContainerForm.get('dutyAmount')?.clearValidators();
        
        // Clear values when checking
        this.inwardContainerForm.get('challanDuty')?.setValue('');
        this.inwardContainerForm.get('dutyAmount')?.setValue('');
        
        // Enable conditional fields
        this.inwardContainerForm.get('toppleFordutyNo')?.setValidators([Validators.required]);
        this.inwardContainerForm.get('conditionalDutyAmount')?.setValidators([Validators.required]);
      } else {
        // Enable and add validators for challanDuty and dutyAmount
        this.inwardContainerForm.get('challanDuty')?.enable();
        this.inwardContainerForm.get('dutyAmount')?.enable();
        this.inwardContainerForm.get('challanDuty')?.setValidators([Validators.required]);
        this.inwardContainerForm.get('dutyAmount')?.setValidators([Validators.required]);
        
        // Clear conditional fields when unchecking
        this.inwardContainerForm.get('toppleFordutyNo')?.setValue('');
        this.inwardContainerForm.get('conditionalDutyAmount')?.setValue('');
        this.inwardContainerForm.get('toppleFordutyNo')?.clearValidators();
        this.inwardContainerForm.get('conditionalDutyAmount')?.clearValidators();
      }
      
      this.inwardContainerForm.get('challanDuty')?.updateValueAndValidity();
      this.inwardContainerForm.get('dutyAmount')?.updateValueAndValidity();
      this.inwardContainerForm.get('toppleFordutyNo')?.updateValueAndValidity();
      this.inwardContainerForm.get('conditionalDutyAmount')?.updateValueAndValidity();
    });
  }

  initializeForm(): void {
    this.inwardContainerForm = this.fb.group({
      entryType: ['EX-BOND', Validators.required],
      billOfEntryNo: ['', Validators.required],
      exBeNo: ['', Validators.required],
      beNoDate: ['', Validators.required],
      stockDate: [''],
      chaLedger: ['', Validators.required],
      grossQty: ['', Validators.required],
      grossQtyUnit: ['', Validators.required],
      remarks: ['', Validators.required],
      challanDuty: ['', Validators.required],
      dutyAmount: [null , Validators.required],
  
      pkgs: [''],
      partyName: [''],
      toppleForAdvanceLicense: [false],
  
      toppleFordutyNo: [''],
      conditionalDutyAmount: [''],
  
      leoNo: [''],
      leoDate: [''],
      chaName: [''],
      grossWeight: [''],
  
      permissionNo: [''],
      newWarehouseName: [''],
      bondCode: [''],
  
      documentNo: [''],
      documentDate: ['']
    });
  
    this.selectedEntryType = 'EX-BOND';
  
    this.inwardContainerForm.get('entryType')?.valueChanges.subscribe(value => {
      this.selectedEntryType = value;
      this.updateValidators();
    });
  
    this.updateValidators();
  }

  updateConditionalValidators(isChecked: boolean): void {
    const dutyNoControl = this.inwardContainerForm.get('toppleFordutyNo');
    const conditionalDutyAmountControl = this.inwardContainerForm.get('conditionalDutyAmount');
    const challanDutyControl = this.inwardContainerForm.get('challanDuty');
    const dutyAmountControl = this.inwardContainerForm.get('dutyAmount');
    
    if (isChecked) {
      // When advance license is checked
      dutyNoControl?.setValidators([Validators.required]);
      conditionalDutyAmountControl?.setValidators([Validators.required]);
      challanDutyControl?.clearValidators();
      dutyAmountControl?.clearValidators();
      challanDutyControl?.disable();
      dutyAmountControl?.disable();
    } else {
      // When advance license is unchecked
      dutyNoControl?.clearValidators();
      conditionalDutyAmountControl?.clearValidators();
      challanDutyControl?.setValidators([Validators.required]);
      dutyAmountControl?.setValidators([Validators.required]);
      challanDutyControl?.enable();
      dutyAmountControl?.enable();
    }
    
    dutyNoControl?.updateValueAndValidity();
    conditionalDutyAmountControl?.updateValueAndValidity();
    challanDutyControl?.updateValueAndValidity();
    dutyAmountControl?.updateValueAndValidity();
  }

  updateValidators(): void {
    // Clear all conditional validators first
    this.clearConditionalValidators();

    // Add validators based on selected entry type
    switch (this.selectedEntryType) {
      case 'EX-BOND':
        this.setValidators(['pkgs', 'partyName']);
        const isAdvanceLicense = this.inwardContainerForm.get('toppleForAdvanceLicense')?.value;
        this.updateConditionalValidators(isAdvanceLicense);
        break;
        
      case 'RE-EXPORT':
        this.setValidators([
          'leoNo', 
          'leoDate', 
          'chaName', 
          'partyName', 
          'pkgs', 
          'grossWeight'
        ]);
        break;
        
      case 'BOND TO BOND TRANSFER':
        this.setValidators([
          'permissionNo', 
          'newWarehouseName', 
          'bondCode'
        ]);
        break;
        
      case 'DISPOSAL':
        this.setValidators([
          'documentNo', 
          'documentDate'
        ]);
        break;
    }

    this.inwardContainerForm.updateValueAndValidity();
  }

  clearConditionalValidators(): void {
    const fieldsToReset = [
      'pkgs', 'partyName',
      'leoNo', 'leoDate', 'chaName', 'grossWeight',
      'permissionNo', 'newWarehouseName', 'bondCode',
      'documentNo', 'documentDate'
    ];
  
    fieldsToReset.forEach(field => {
      const control = this.inwardContainerForm.get(field);
      if (control) {
        control.clearValidators();
        if (!this.isEditMode) {
          control.setValue('');
        }
        control.updateValueAndValidity();
      }
    });
  
    if (this.selectedEntryType !== 'EX-BOND' && !this.isEditMode) {
      this.inwardContainerForm.get('toppleForAdvanceLicense')?.setValue(false);
      this.inwardContainerForm.get('toppleFordutyNo')?.setValue('');
      this.inwardContainerForm.get('conditionalDutyAmount')?.setValue('');
    }
  }

  setValidators(fields: string[]): void {
    fields.forEach(field => {
      const control = this.inwardContainerForm.get(field);
      if (control) {
        control.setValidators([Validators.required]);
        control.updateValueAndValidity();
      }
    });
  }

  get f() {
    return this.inwardContainerForm.controls;
  }

  private checkboxSubscription: any = null;

  getExBondBillEntry(id: any) {
    let payload = this.commonService?.filterList();
    if (payload?.query)
      payload.query = {
        exbondbillentryId: id,
      };
    this.commonService
      ?.getSTList('exbondbillentry', payload)
      .subscribe((data) => {
        const ExbondBillEntryList = data?.documents[0];
        
        // CRITICAL FIX: Convert string "false"/"true" to actual boolean
        const isAdvanceLicense = ExbondBillEntryList.toppleForAdvanceLicense === true || 
                                  ExbondBillEntryList.toppleForAdvanceLicense === 'true';
        
        // Store original data with proper boolean conversion
        this.originalEditData = { 
          ...ExbondBillEntryList,
          toppleForAdvanceLicense: isAdvanceLicense 
        };
        
        this.selectedEntryType = ExbondBillEntryList.entryType || 'EX-BOND';
        
        // Unsubscribe from previous listener before patching
        if (this.checkboxSubscription) {
          this.checkboxSubscription.unsubscribe();
          this.checkboxSubscription = null;
        }
        
        // Patch form with proper boolean value
        this.inwardContainerForm.patchValue({
          entryType: ExbondBillEntryList.entryType || 'EX-BOND',
          billOfEntryNo: ExbondBillEntryList.billOfEntryNo || '',
          exBeNo: ExbondBillEntryList.exBeNo || '',
          beNoDate: ExbondBillEntryList.beNoDate || '',
          stockDate: ExbondBillEntryList.stockDate || '',
          chaLedger: ExbondBillEntryList.chaLedger || '',
          grossQty: ExbondBillEntryList.grossQty || '',
          grossQtyUnit: ExbondBillEntryList.grossQtyUnit || '',
          remarks: ExbondBillEntryList.remarks || '',
          challanDuty: ExbondBillEntryList.challanDuty || '',
          dutyAmount: ExbondBillEntryList.dutyAmount || null,
  
          pkgs: ExbondBillEntryList.pkgs || '',
          partyName: ExbondBillEntryList.partyName || '',
          // Convert to proper boolean
          toppleForAdvanceLicense: isAdvanceLicense,
          
          toppleFordutyNo: ExbondBillEntryList.toppleFordutyNo || '',
          conditionalDutyAmount: ExbondBillEntryList.conditionalDutyAmount || '',
  
          leoNo: ExbondBillEntryList.leoNo || '',
          leoDate: ExbondBillEntryList.leoDate || '',
          chaName: ExbondBillEntryList.chaName || '',
          grossWeight: ExbondBillEntryList.grossWeight || '',
          permissionNo: ExbondBillEntryList.permissionNo || '',
          newWarehouseName: ExbondBillEntryList.newWarehouseName || '',
          bondCode: ExbondBillEntryList.bondCode || '',
          documentNo: ExbondBillEntryList.documentNo || '',
          documentDate: ExbondBillEntryList.documentDate || ''
        }, { emitEvent: false });
        
        this.updateValidators();
        this.updateConditionalValidators(isAdvanceLicense);
        
        // Setup checkbox listener with fresh data
        setTimeout(() => {
          this.setupEditModeCheckboxListener();
        }, 100);
      });
  }

  setupEditModeCheckboxListener(): void {
    // Unsubscribe from previous subscription if exists
    if (this.checkboxSubscription) {
      this.checkboxSubscription.unsubscribe();
    }
    
    // Create new subscription and store it
    this.checkboxSubscription = this.inwardContainerForm.get('toppleForAdvanceLicense')?.valueChanges.subscribe(value => {
      if (value) {
        this.inwardContainerForm.get('challanDuty')?.disable();
        this.inwardContainerForm.get('dutyAmount')?.disable();
        this.inwardContainerForm.get('challanDuty')?.clearValidators();
        this.inwardContainerForm.get('dutyAmount')?.clearValidators();
        
        if (this.originalEditData?.toppleForAdvanceLicense) {
          this.inwardContainerForm.patchValue({
            toppleFordutyNo: this.originalEditData.toppleFordutyNo || '',
            conditionalDutyAmount: this.originalEditData.conditionalDutyAmount || ''
          }, { emitEvent: false });
        } else {
          this.inwardContainerForm.get('challanDuty')?.setValue('');
          this.inwardContainerForm.get('dutyAmount')?.setValue('');
        }
        
        this.inwardContainerForm.get('toppleFordutyNo')?.setValidators([Validators.required]);
        this.inwardContainerForm.get('conditionalDutyAmount')?.setValidators([Validators.required]);
      } else {
        this.inwardContainerForm.get('challanDuty')?.enable();
        this.inwardContainerForm.get('dutyAmount')?.enable();
        this.inwardContainerForm.get('challanDuty')?.setValidators([Validators.required]);
        this.inwardContainerForm.get('dutyAmount')?.setValidators([Validators.required]);
        
        if (!this.originalEditData?.toppleForAdvanceLicense) {
          this.inwardContainerForm.patchValue({
            challanDuty: this.originalEditData?.challanDuty || '',
            dutyAmount: this.originalEditData?.dutyAmount || 0
          }, { emitEvent: false });
        }
        
        this.inwardContainerForm.get('toppleFordutyNo')?.setValue('');
        this.inwardContainerForm.get('conditionalDutyAmount')?.setValue('');
        this.inwardContainerForm.get('toppleFordutyNo')?.clearValidators();
        this.inwardContainerForm.get('conditionalDutyAmount')?.clearValidators();
      }
      
      this.inwardContainerForm.get('challanDuty')?.updateValueAndValidity();
      this.inwardContainerForm.get('dutyAmount')?.updateValueAndValidity();
      this.inwardContainerForm.get('toppleFordutyNo')?.updateValueAndValidity();
      this.inwardContainerForm.get('conditionalDutyAmount')?.updateValueAndValidity();
    });
  }
  

  async getWarehouseDataEntryById(id: any) {
    let payload = this.commonService?.filterList();
    if (payload?.query)
      payload.query = {
        warehousedataentryId: id,
      };

    await this.commonService
      ?.getSTList('warehousedataentry', payload)
      .subscribe((data) => {
        const dataEntryList = data?.documents[0];

        this.inwardContainerForm.patchValue({
          chaLedger: dataEntryList?.chaLedgerName,
          billOfEntryNo: dataEntryList?.blofEN,
        });
      });
  }

  getUomList() {
    let payload = this.commonService.filterList();
    if (payload) payload.query = { status: true };
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      const result = data?.documents;
      this.weighthData = result
    });
  }

  open(key: any, data: any, type: any) {
    const modalRef = this.modalService.open(NewWareHouseDoucmentComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
        this.getData();
      }
    });
    modalRef.result.then((data) => {
      this.getData();
    });
    modalRef.componentInstance.refId = this.route.snapshot.params['id'];
    modalRef.componentInstance.component = 'wareHouse';
    modalRef.componentInstance.type = type;
  }

  getData() {
    let payload = this.commonService.filterList();
    if (payload?.query) {
      payload.query = {
        refId: this.route.snapshot.params['id'],
      };
    }
    this.commonService.getSTList('document', payload).subscribe((res: any) => {
      this.documentData = [];
    });
  }

  buildPayload(formValue: any): any {
    let payload: any = {
      warehousedataentryId: this.urlParam.id,
      entryType: formValue.entryType,
      billOfEntryNo: formValue.billOfEntryNo,
      exBeNo: formValue.exBeNo,
      beNoDate: formValue.beNoDate,
      stockDate: formValue.stockDate,
      chaLedger: formValue.chaLedger,
      grossQty: formValue.grossQty,
      grossQtyUnit: formValue.grossQtyUnit,
      remarks: formValue.remarks,
      challanDuty: formValue.challanDuty || '',
      dutyAmount: formValue.dutyAmount || 0,
    };
  
    switch (formValue.entryType) {
      case 'EX-BOND':
        payload = {
          ...payload,
          pkgs: formValue.pkgs,
          partyName: formValue.partyName,
          // CRITICAL: Ensure we send actual boolean, not string
          toppleForAdvanceLicense: !!formValue.toppleForAdvanceLicense
        };
        
        if (formValue.toppleForAdvanceLicense) {
          payload.toppleFordutyNo = formValue.toppleFordutyNo;
          payload.conditionalDutyAmount = formValue.conditionalDutyAmount;
        }
        break;
      case 'RE-EXPORT':
        payload = {
          ...payload,
          leoNo: formValue.leoNo,
          leoDate: formValue.leoDate,
          chaName: formValue.chaName,
          partyName: formValue.partyName,
          pkgs: formValue.pkgs,
          grossWeight: formValue.grossWeight
        };
        break;
      case 'BOND TO BOND TRANSFER':
        payload = {
          ...payload,
          permissionNo: formValue.permissionNo,
          newWarehouseName: formValue.newWarehouseName,
          bondCode: formValue.bondCode
        };
        break;
      case 'DISPOSAL':
        payload = {
          ...payload,
          documentNo: formValue.documentNo,
          documentDate: formValue.documentDate
        };
        break;
    }
  
    return payload;
  }
  
  ngOnDestroy(): void {
    if (this.checkboxSubscription) {
      this.checkboxSubscription.unsubscribe();
    }
  }

  onSubmit() {
    this.submitted = true;
    
    this.inwardContainerForm.markAllAsTouched();
    
    if (!this.inwardContainerForm.valid) {
      console.log('Form is invalid. Errors:', this.getFormValidationErrors());
      return;
    }

    const exbondbillentryForm = this.inwardContainerForm.getRawValue();
    const payload = this.buildPayload(exbondbillentryForm);

    if (this.editIndex !== null) {
      this.commonService
        .UpdateToST('exbondbillentry/' + this.moduleId, payload)
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Updated Successfully', '');
              this.submitted = false;
              this.onCancel();
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error, '');
          }
        );
    } else {
      this.commonService.addToST('exbondbillentry', payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.submitted = false;
            this.onCancel();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error, '');
        }
      );
    }
  }

  getFormValidationErrors() {
    let formErrors: any = {};
    Object.keys(this.inwardContainerForm.controls).forEach(key => {
      const controlErrors = this.inwardContainerForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  onCancel() {
    this.editIndex = null;
    this.isEditMode = false;
    this.originalEditData = null;
    this.inwardContainerForm.reset();
    this.inwardContainerForm.patchValue({
      entryType: 'EX-BOND',
      toppleForAdvanceLicense: false,
      dutyAmount: 0
    });
    this.selectedEntryType = 'EX-BOND';

    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}`;
    this.router.navigate([url]);

    this.router.navigate([url]);
  }
   blockInvalidInput(event: KeyboardEvent) {
  const invalidChars = ['e', 'E', '+', '-'];
  if (invalidChars.includes(event.key)) {
    event.preventDefault();
  }
}

}