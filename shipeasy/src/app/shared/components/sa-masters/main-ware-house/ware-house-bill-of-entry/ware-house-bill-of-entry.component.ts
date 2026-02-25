import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { NewWareHouseDoucmentComponent } from './new-ware-house-doucment/new-ware-house-doucment.component';
import { document } from 'src/app/models/document';

@Component({
  selector: 'app-ware-house-bill-of-entry',
  templateUrl: './ware-house-bill-of-entry.component.html',
  styleUrls: ['./ware-house-bill-of-entry.component.scss'],
})
export class WareHouseBillOfEntryComponent implements OnInit {
  billOfEntryForm: FormGroup;
  containerForm: FormGroup;
  submitted = false;
  submitted1 = false;
  weighthData: any = [];
  uomData: any;
  dataEntryList: any = [];
  id: any;
  documentData: document[] = [];
  containerTypeList: any = [];
  containerList = [];
  editbillOfEntry: any;
  editIndex: number | null = null;
  isShow = false;
  urlParam: any;

  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private notification: NzNotificationService
  ) {
    this.route.params.subscribe((params) => (this.urlParam = params));
    this.isShow = this.urlParam?.access == 'show' ? true : false;
    this.id = this.route.snapshot?.params['id'];
  }

  ngOnInit(): void {
    // Custom validator for positive numbers only
    const positiveNumberValidator = (control) => {
      if (control.value !== null && control.value !== undefined && control.value !== '') {
        const value = parseFloat(control.value);
        if (isNaN(value) || value < 0) {
          return { positiveNumber: true };
        }
      }
      return null;
    };

    this.billOfEntryForm = this.fb.group({
      assessableValue: ['', Validators.required],
      dutyAmount: ['', [Validators.required, positiveNumberValidator]],
      whBeNo: ['', Validators.required],
      date: [null, Validators.required],
      deliveryOrder: ['', Validators.required],
      dateOfDO: [null, Validators.required],
      permissionNo: ['', Validators.required],
      bondNo: ['', Validators.required],
      bondExpiry: [null, Validators.required],
      warehousingSection: ['', Validators.required],
      packages: [null, [Validators.required, positiveNumberValidator]],
      unit: [null, Validators.required],
      remarks: [''],
    });
    
    this.containerForm = this.fb.group({
      containerType: ['', Validators.required],
      containerNo: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{4}[0-9]{7}$/)]],
      unit: [null, Validators.required],
      packages: [null, [Validators.required, positiveNumberValidator]],
    });
    
    this.getUomList();
    this.getbillentry();
    this.getSystemTypeDropDowns();
  }

  get f() {
    return this.billOfEntryForm.controls;
  }
  
  get f2() {
    return this.containerForm.controls;
  }

  // UPDATED METHOD: Prevent invalid key input for numeric fields
  preventInvalidInput(event: KeyboardEvent): void {
    const invalidKeys = ['e', 'E', '+', '-'];
    if (invalidKeys.includes(event.key)) {
      event.preventDefault();
    }
  }

  // UPDATED METHOD: Comprehensive prevention of Enter key form submission
  preventEnterSubmit(event: KeyboardEvent): boolean {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
    return true;
  }

  // NEW METHOD: Handle date picker open/close events
  onDatePickerOpenChange(open: boolean): void {
    // This method can be used to track when date picker opens/closes
    // Useful for additional logic if needed
  }

  // UPDATED METHOD: Validate and sanitize numeric input on paste
  validateNumericPaste(event: ClipboardEvent, fieldName: string): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text');
    if (pastedData) {
      const sanitized = pastedData.replace(/[^0-9.]/g, '');
      const numValue = parseFloat(sanitized);
      
      if (!isNaN(numValue) && numValue >= 0) {
        if (fieldName === 'dutyAmount') {
          this.billOfEntryForm.patchValue({ dutyAmount: numValue });
        } else if (fieldName === 'packages') {
          this.billOfEntryForm.patchValue({ packages: numValue });
        } else if (fieldName === 'containerPackages') {
          this.containerForm.patchValue({ packages: numValue });
        }
      }
    }
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

  getbillentry() {
      let payload = this.commonService?.filterList();
      if (payload?.query)
        payload.query = {
          warehousedataentryId: this.route.snapshot.params['id'],
        };
      this.commonService
        ?.getSTList('warehousebillofentry', payload)
        ?.subscribe((res: any) => {
          this.editbillOfEntry = res?.documents?.[0];

          this.getWarehouseDataEntry(() => {
            if (this.editbillOfEntry) {
              this.billOfEntryForm.patchValue({
                year: this.editbillOfEntry?.year || '',
                assessableValue: this.editbillOfEntry?.assessableValue || '',
                dutyAmount: this.editbillOfEntry?.dutyAmount || '',
                jobNo: this.editbillOfEntry?.jobNo || '',
                spaceCertificationDate: this.editbillOfEntry?.spaceCertificationDate || null,
                spaceCertificationNo: this.editbillOfEntry?.spaceCertificationNo || '',
                whBeNo: this.editbillOfEntry?.whBeNo || '',
                date: this.editbillOfEntry?.date ? new Date(this.editbillOfEntry?.date) : null,
                deliveryOrder: this.editbillOfEntry?.deliveryOrder || '',
                dateOfDO: this.editbillOfEntry?.dateOfDO ? new Date(this.editbillOfEntry?.dateOfDO) : null,
                permissionNo: this.editbillOfEntry?.permissionNo || '',
                bondNo: this.editbillOfEntry?.bondNo || '',
                bondExpiry: this.editbillOfEntry?.bondExpiry ? new Date(this.editbillOfEntry?.bondExpiry) : null,
                warehousingSection: this.editbillOfEntry?.warehousingSection || '',
                packages: this.editbillOfEntry?.packages ?? null,
                unit: this.editbillOfEntry?.unit ?? null,
                remarks: this.editbillOfEntry?.remarks ?? '',
              });
            }
            this.getWareHouseContainerOld();
          });
        });
  }

  getWareHouseContainerOld() {
    let payload = this.commonService?.filterList();
    if (payload?.query)
      payload.query = {
        warehousedataentryId: this.route.snapshot.params['id'],
      };
    this.commonService
      ?.getSTList('warehousecontainer', payload)
      ?.subscribe((res: any) => {
        if (res?.documents && res.documents.length > 0) {
          this.containerList = res?.documents || [];
        } else {
          this.containerList = [];
        }
      });
  }

  getWarehouseDataEntry(callback?: () => void) {
      let payload = this.commonService?.filterList();
      if (payload?.query)
        payload.query = {
          warehousedataentryId: this.route.snapshot.params['id'],
        };
      this.commonService
        ?.getSTList('warehousedataentry', payload)
        ?.subscribe((res: any) => {
          this.dataEntryList = res?.documents[0];
          if (this.dataEntryList?.jobNo) {
            this.billOfEntryForm.patchValue({
              assessableValue: this.dataEntryList.accessibleValue,
              packages: this.dataEntryList.packagesUnit,
              unit: this.dataEntryList.unit,
            });
          }
          if (this.dataEntryList?.year) {
            this.billOfEntryForm.patchValue({
              year: this.dataEntryList.year,
            });
          }

          if (callback) {
            callback();
          }
        });
  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList();
    if (payload)
      payload.query = {
        status: true,
        typeCategory: {
          $in: ['containerType'],
        },
      };

    this.commonService
      .getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.containerTypeList = res?.documents?.filter(
          (x) => x.typeCategory === 'containerType'
        );
      });
  }

  addContainerRow(addContainer) {
    this.containerForm.reset();
    this.editIndex = null;
    this.submitted1 = false;
    this.modalService.open(addContainer, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  editContainer(index: number, template: TemplateRef<any>) {
    this.editIndex = index;
    const item = this.containerList[index];
    this.submitted1 = false;

    this.containerForm.reset();
    setTimeout(() => {
      this.containerForm.patchValue({
        containerType: item.containerType || '',
        containerNo: item.containerNo || '',
        unit: item.unit || null,
        packages: item.packages || null,
      });
    }, 0);

    this.modalService.open(template, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
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

  open(key, data, type) {
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

  closeModal() {
    this.modalService.dismissAll();
    this.editIndex = null;
    this.submitted1 = false;
  }

  ngOnSave() {
    this.submitted1 = true;
    this.containerForm.markAllAsTouched();
    
    if (this.containerForm.invalid) {
      if (this.f2.packages.errors?.positiveNumber) {
        this.notification.create('error', 'Packages must be a positive number', '');
      } else {
        this.notification.create('error', 'Please fill all required fields in container form', '');
      }
      return;
    }

    const formValue = this.containerForm.getRawValue();

    let unitName = "";
    if (formValue.unit) {
      const unitData = this.weighthData.find((x: any) => x.uomId === formValue.unit);
      unitName = unitData?.uomShort || "";
    }

    const containerTypeData = this.containerTypeList.find(
      (da) => da?.systemtypeId === formValue.containerType
    );
    const containerTypeName = containerTypeData?.typeName || "";

    const containerPayload = {
      warehousedataentryId: this.dataEntryList?.warehousedataentryId,
      containerType: formValue.containerType,
      containerNo: formValue.containerNo,
      unit: formValue.unit,
      unitName: unitName,
      packages: formValue.packages,
      containerTypeName: containerTypeName,
      gateInStatus: "",
      inwardStatus: "",
      inwardHandover: "",
      gateOut: "",
      finance: "",
      location: "",
      qtyAsPerBOE: "",
      actualQtyReceived: "",
      dispatchQty: "",
      balanceQty: "",
    };

    if (this.editIndex !== null) {
      const existingContainer = this.containerList[this.editIndex];
      const updatedContainer = {
        ...existingContainer,
        ...containerPayload,
        warehousecontainerId: existingContainer?.warehousecontainerId,
        gateInStatus: existingContainer?.gateInStatus || "",
        inwardStatus: existingContainer?.inwardStatus || "",
        inwardHandover: existingContainer?.inwardHandover || "",
        gateOut: existingContainer?.gateOut || "",
        finance: existingContainer?.finance || "",
        location: existingContainer?.location || "",
        qtyAsPerBOE: existingContainer?.qtyAsPerBOE || "",
        actualQtyReceived: existingContainer?.actualQtyReceived || "",
        dispatchQty: existingContainer?.dispatchQty || "",
        balanceQty: existingContainer?.balanceQty || "",
      };
      
      this.containerList[this.editIndex] = updatedContainer;
    } else {
      this.containerList.push(containerPayload);
    }

    const message = this.editIndex !== null ? 'Container Updated' : 'Container Added';
    this.notification.create('success', message, '');

    this.containerForm.reset();
    this.submitted1 = false;
    this.modalService.dismissAll();
    this.editIndex = null;
  }

  deleteContainer(index: number, item: any) {
    if (item?.warehousecontainerId) {
      this.commonService
        .deleteDocument('warehousecontainer', item.warehousecontainerId)
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.containerList.splice(index, 1);
              this.notification.create('success', 'Deleted Successfully', '');
            }
          },
          error: (error) => {
            this.notification.create('error', error?.error?.error || 'Delete failed', '');
          }
        });
    } else {
      this.containerList.splice(index, 1);
    }
  }

  onCancel() {
    this.router.navigate(['/warehouse/main-ware-house']);
  }

  onSubmit() {
    this.submitted = true;
    this.billOfEntryForm.markAllAsTouched();
    
    if (!this.billOfEntryForm.valid) {
      if (this.f.dutyAmount.errors?.positiveNumber) {
        this.notification.create('error', 'Duty Amount must be a positive number', '');
      } else if (this.f.packages.errors?.positiveNumber) {
        this.notification.create('error', 'Packages must be a positive number', '');
      } else {
        this.notification.create('error', 'Please fill all required fields', '');
      }
      return;
    }

    const billOfEntryForm = this.billOfEntryForm.getRawValue();
    let payload = {
      warehousedataentryId: this.dataEntryList?.warehousedataentryId,
      year: billOfEntryForm.year,
      assessableValue: billOfEntryForm.assessableValue,
      dutyAmount: billOfEntryForm.dutyAmount,
      jobNo: billOfEntryForm.jobNo,
      whBeNo: billOfEntryForm.whBeNo,
      date: billOfEntryForm.date,
      deliveryOrder: billOfEntryForm.deliveryOrder,
      dateOfDO: billOfEntryForm.dateOfDO,
      permissionNo: billOfEntryForm.permissionNo,
      bondNo: billOfEntryForm.bondNo,
      bondExpiry: billOfEntryForm.bondExpiry,
      warehousingSection: billOfEntryForm.warehousingSection,
      spaceCertificationDate: billOfEntryForm.spaceCertificationDate,
      packages: billOfEntryForm.packages,
      unit: billOfEntryForm.unit,
      unitName: this.weighthData.find(
        (x: any) => x.uomId === this.billOfEntryForm?.value?.unit
      )?.uomShort,
      remarks: billOfEntryForm.remarks,
    };

    const existingContainers = this.containerList.filter(item => item.warehousecontainerId);
    const newContainers = this.containerList.filter(item => !item.warehousecontainerId);

    const afterContainerSync = () => {
      this.notification.create('success', 
        this.editbillOfEntry ? 'Bill of Entry Updated Successfully' : 'Bill of Entry Added Successfully', 
        '');
      this.submitted = false;
      
      setTimeout(() => {
        const { id, key } = this.urlParam;
        const url = `/warehouse/main-ware-house/details/${id}/Container`;
        this.router.navigate([url]);
      }, 1000);
    };

    const handleContainerOperations = () => {
      newContainers.forEach(container => {
        container.warehousedataentryId = this.dataEntryList?.warehousedataentryId;
        if (container.warehousecontainerId === undefined) {
          delete container.warehousecontainerId;
        }
      });

      const operations = [];

      if (existingContainers.length > 0) {
        const updateOperation = this.commonService.batchUpdate(
          'warehousecontainer/batchupdate', 
          existingContainers
        );
        operations.push(updateOperation);
      }

      if (newContainers.length > 0) {
        const insertOperation = this.commonService.batchInsert(
          'warehousecontainer/batchinsert', 
          newContainers
        );
        operations.push(insertOperation);
      }

      if (operations.length === 0) {
        afterContainerSync();
        return;
      }

      let completed = 0;
      let hasError = false;

      operations.forEach(operation => {
        operation.subscribe({
          next: (res) => {
            completed++;
            if (completed === operations.length && !hasError) {
              afterContainerSync();
            }
          },
          error: (error) => {
            hasError = true;
            this.notification.create('error', 
              error?.error?.error || 'Container operation failed', 
              '');
            this.submitted = false;
          }
        });
      });
    };

    if (this.editbillOfEntry?.warehousebillofentryId) {
      this.commonService
        .UpdateToST('warehousebillofentry/' + this.editbillOfEntry?.warehousebillofentryId, payload)
        ?.subscribe({
          next: (res) => {
            if (res) {
              handleContainerOperations();
            }
          },
          error: (error) => {
            this.notification.create('error', 
              error?.error?.error || 'Update failed', 
              '');
            this.submitted = false;
          }
        });
    } else {
      this.commonService.addToST('warehousebillofentry', payload)?.subscribe({
        next: (res) => {
          if (res) {
            handleContainerOperations();
          }
        },
        error: (error) => {
          this.notification.create('error', 
            error?.error?.error || 'Save failed', 
            '');
          this.submitted = false;
        }
      });
    }
  }
}