import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiService } from '../../principal/api.service';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import * as Constant from 'src/app/shared/common-constants';
import { OrderByPipe } from 'src/app/shared/util/sort';
@Component({
  selector: 'app-add-carrier-booking',
  templateUrl: './add-carrier-booking.component.html',
  styleUrls: ['./add-carrier-booking.component.scss']
})
export class AddCarrierBookingComponent implements OnInit {
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  todayDate = new Date();
  id: any;
  totalallocated=0;
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10, 20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns = [
    '#',
    'batchNo',
    'enquiryDetails.enquiryNo',
    'enquiryDetails.basicDetails.shipperName'
  ];
  basicDetailsform: FormGroup;
  submitted: boolean = false;
  empForm: FormGroup;
  empIndex: number;
  @Input() mockedDataFromParent: any[] = [];
  docForm: FormGroup;
  preCareerForm: FormGroup;
  carriageForm: FormGroup;
  doc: File;
  documentUrl="";
  fileUploadCustomId: string = '';
  fileTypeNotMatched: boolean;
  documentTableData: any = Array<any>();
  userTable: FormGroup;
  ConfirmationDetailsform: FormGroup;
  control: FormArray;
  vesselForm: FormGroup;
  subscription: Subscription[] = [];
  index: number;
  extension: any;
  customeDocument: any;
  base64Output: string;
  otherDetailsForm: FormGroup;
  carrierbookingId: string = "";
  carrierbookingDetails: any;
  bookedContainer=[]
  shippinglineData=[];
  productList: any;
  vesselMaster: any;
  voyageList: any;
  locationList: any;
  uomData: any;
  WeightData:any = [];
  containerTypeList= [];
  transitList=[]
  portListData=[];
  saveButtonDisabled: boolean = false;
  agentList=[];
  packageList: any;
  dimensionUnitList: any;
  batchList=[];
  isExport: boolean;
  constructor(private route: ActivatedRoute,private _api: ApiService, public formBuilder: FormBuilder, public commonService: CommonService, public notification: NzNotificationService, public router: Router,private sortPipe: OrderByPipe,) {
    this.carrierbookingId = this.route?.snapshot?.paramMap?.get('id');
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true;
  }

  ngOnInit(): void {
    this.basicDetailsform = this.formBuilder.group({
      Carrier: ['', Validators.required],
      BookingNumber: [''],
      BookingParty: ['', Validators.required],
      BookingDate: ['', Validators.required],
      OrderBy: ['', Validators.required],
      RAnumber: [''],
      // LoadType:['',Validators.required]
    })

    this.userTable = this.formBuilder.group({
      ischeckbox: [false],
      tableRows: this.formBuilder.array([]),
      ContainerRows: this.formBuilder.array([])
    });

    this.ConfirmationDetailsform = this.formBuilder.group({
      checkboxa: [false],
      Validitydate: [''],
      PickupLocation: [''],
      OpenCutoff: [''],
      CloseCutoff: [''],
      SIcutoff: [''],
      Handovercutoff: [''],
      DetentionFreeDays: [''],
      DemurrageFreeDays: [''],
      DestinationFreeDay: [''],
      DestinationDemurrageFreeDays: [''],
    })
    this.otherDetailsForm = this.formBuilder.group({
      Remarks: ['']

    });
    this.docForm = this.formBuilder.group({
      Doc: ['']
    });
    this.updateValidators(false);

    this.vesselForm = this.formBuilder.group({
      // vessels: this.formBuilder.group({
        Origin: ['', Validators.required],
        Terminal: [''],
        ETD: ['', Validators.required],
        ETA: [''],
        Vessel: ['', Validators.required],
        Voyagenumber: ['', Validators.required],
        Destination: ['', Validators.required],
        Terminals: [''],
        details: this.formBuilder.array([])
      // })
    });
    this.preCareerForm = this.formBuilder.group({
      addingPreCareer:[false],
      preCareers: this.formBuilder.array([])
    });
    this.carriageForm = this.formBuilder.group({
      addingOnCarriages:[false],
      carriages: this.formBuilder.array([])
    });
    if (this.carrierbookingId) {
      this.empForm = this.formBuilder.group({
        cargo: this.formBuilder.array([])
      });
      this.getBookingDetais();
    } else {
      this.addRow();
      this.empForm = this.formBuilder.group({
        cargo: this.formBuilder.array([this.cargoDetails()])
      });
    }
    this.getShiipingLine()
    this.getproductDropDowns()
    this.getVesselMaster()
    this.getVoyageListDropDown()
    this.getLocationDropDowns()
    this.getUomList()
    this.getSystemTypeDropDowns()
    this.getPortData()
    this.getSmartAgentList()
   
  }
  fetchbatch(){ this.getBatchList();
    this.totalallocated=this.isallowed();
  };
  getBookingDetais() {
    let payload = this.commonService.filterList()
    payload.query = {
      carrierbookingId: this.carrierbookingId,
    }
    this.commonService.getSTList('carrierbooking', payload).subscribe((data: any) => {
        this.carrierbookingDetails = data?.documents?.[0];
        //patch Form
        this.basicDetailsform.patchValue({ ...this.carrierbookingDetails?.basicDetails });
        this.empForm.patchValue({ ...this.carrierbookingDetails?.cargoDetaiks });
        const cargoArray = this.empForm.get('cargo') as FormArray;
        cargoArray.clear();
        (this.carrierbookingDetails?.cargoDetaiks?.cargo ?? []).forEach((cargo, index) => {
          const cargoArray = this.empForm.get('cargo') as FormArray;
          const skillsFormArray = this.empForm?.get('cargo')['controls'][index]?.get('skills') as FormArray;
          const cargoFormGroup = this.cargoDetails();
          cargoFormGroup.patchValue(cargo);
          cargoArray.push(cargoFormGroup);
          cargo?.skills?.forEach((skill) => {
            const skillFormGroup = this.demensions(skill);
            skillsFormArray?.push(skillFormGroup);
          });
        });
        this.userTable.patchValue({ ...this.carrierbookingDetails?.containerDetails });
        const control = this.userTable.get('tableRows') as FormArray;
        control.clear();
        (this.carrierbookingDetails?.containerDetails?.tableRows ?? []).forEach((res_table) => {
          const control = this.userTable.get('tableRows') as FormArray;
          const TableFormGroup = this.initiateForm();
          TableFormGroup.patchValue(res_table);
          control.push(TableFormGroup);
        });
        this.preCareerForm.patchValue({ ...this.carrierbookingDetails?.preCareer });
        const precarriage = this.preCareerForm.get('preCareers') as FormArray;
        precarriage.clear();
        (this.carrierbookingDetails?.preCareer?.preCareers ?? []).forEach((preCareers, index) => {
          const precarriage = this.preCareerForm.get('preCareers') as FormArray;
          const preCareerFormGroup = this.newPreCareer();
          preCareerFormGroup.patchValue(preCareers);
          precarriage.push(preCareerFormGroup);
          const preCareerFormArray = this.preCareerForm?.get('preCareers')['controls'][index]?.get('customSkills') as FormArray;
          preCareers?.customSkills?.forEach((customSkills) => {
            const customskillsFormGroup = this.newCustomSkill(customSkills);
            preCareerFormArray?.push(customskillsFormGroup);
          });
        });
        this.vesselForm.patchValue({ ...this.carrierbookingDetails?.vesselDetails });
        if(this.carrierbookingDetails?.vesselDetails?.ETD){
          this.saveButtonDisabled=this.isVoyageDatePassed(this.carrierbookingDetails?.vesselDetails?.ETD);
        } 
        (this.carrierbookingDetails?.vesselDetails?.details ?? []).forEach((details) => {
          const detailsFormArray = this.vesselForm?.get('details') as FormArray;
          // vessels?.details?.forEach((details) => {
            const detailsFormGroup = this.newDetail(details);
            detailsFormArray?.push(detailsFormGroup);
          // });
        });
        this.carriageForm.patchValue({ ...this.carrierbookingDetails?.carriageForm });
        const oncarriage = this.carriageForm.get('carriages') as FormArray;
        oncarriage.clear();
        (this.carrierbookingDetails?.carriageForm?.carriages ?? []).forEach((carriages, index) => {
          const oncarriage = this.carriageForm.get('carriages') as FormArray;
          const onCareerFormGroup = this.newCarriage();
          onCareerFormGroup.patchValue(carriages);
          oncarriage.push(onCareerFormGroup);
          const OnCareerFormArray = this.carriageForm?.get('carriages')['controls'][index]?.get('carriageProperties') as FormArray;
          carriages?.carriageProperties?.forEach((carriageProperties) => {
            const carriagePropertiesFormGroup = this.newProperty(carriageProperties);
            OnCareerFormArray?.push(carriagePropertiesFormGroup);
          });
        });
        this.ConfirmationDetailsform.patchValue({ ...this.carrierbookingDetails?.confirmationDetailsform })
        this.otherDetailsForm.patchValue({ ...this.carrierbookingDetails?.otherDetailsForm });
       this.carrierbookingDetails['bookedContainer']=this.carrierbookingDetails?.bookedContainer??[];
       this.bookedContainer=[...data?.documents?.[0]?.['bookedContainer']]
      });
  }
  get f2() {
    return this.ConfirmationDetailsform.controls;
  }
  get otherDetailsFormError() {
    return this.otherDetailsForm.controls;
  }
  // Function to update validators based on checkbox state
  updateValidators(checked: boolean) {
    if (checked) {
      this.submitted = true
      this.ConfirmationDetailsform.get('Validitydate').setValidators([Validators.required]);
      this.ConfirmationDetailsform.get('PickupLocation').setValidators([Validators.required]);
      this.ConfirmationDetailsform.get('OpenCutoff').setValidators([Validators.required]);
      this.ConfirmationDetailsform.get('CloseCutoff').setValidators([Validators.required]);
      this.ConfirmationDetailsform.get('SIcutoff').setValidators([Validators.required]);
      this.ConfirmationDetailsform.get('Handovercutoff').setValidators([Validators.required]);
      this.ConfirmationDetailsform.markAllAsTouched();
    } else {
      this.ConfirmationDetailsform.get('Validitydate').removeValidators([Validators.required]);
      this.ConfirmationDetailsform.get('PickupLocation').removeValidators([Validators.required]);
      this.ConfirmationDetailsform.get('OpenCutoff').removeValidators([Validators.required]);
      this.ConfirmationDetailsform.get('CloseCutoff').removeValidators([Validators.required]);
      this.ConfirmationDetailsform.get('SIcutoff').removeValidators([Validators.required]);
      this.ConfirmationDetailsform.get('Handovercutoff').removeValidators([Validators.required]);
    }
    this.ConfirmationDetailsform.get('Validitydate').updateValueAndValidity()
    this.ConfirmationDetailsform.get('PickupLocation').updateValueAndValidity()
    this.ConfirmationDetailsform.get('OpenCutoff').updateValueAndValidity()
    this.ConfirmationDetailsform.get('CloseCutoff').updateValueAndValidity()
    this.ConfirmationDetailsform.get('SIcutoff').updateValueAndValidity()
    this.ConfirmationDetailsform.get('Handovercutoff').updateValueAndValidity()
  }

  // Function to handle checkbox change
  onCheckboxChange(event: any) {
    this.updateValidators(event.target.checked);
  }
  get f1() {
    return this.basicDetailsform.controls;
  }
  get f3() {
    return this.empForm.controls;
  }
  get f4() {
    return this.userTable.controls;
  }
  get f5() {
    return this.vesselForm.controls;
  }
  get f6() {
    return this.preCareerForm.controls;
  }
  get f7() {
    return this.carriageForm.controls;
  }
  cargo(): FormArray {
    return this.empForm.get('cargo') as FormArray;
  }
  get cargoControls(): FormArray {
    return this.empForm.get('cargo') as FormArray;
  }
  cargoDetails(): FormGroup {
    return this.formBuilder.group({
      checkbox: [false],
      RAnumbers: [''],
      Commodity: ['', Validators.required],
      CargoDescription: ['', Validators.required],
      Packages: [''],
      PackageType: [''],
      GrossWeight: [''],
      Unit: [''],
      skills: this.formBuilder.array([])
    });
  }

  Addcargo() {
    this.cargo().push(this.cargoDetails());
  }

  removeEmployee(empIndex: number) {
    this.cargo().removeAt(empIndex);
  }

  dimension(empIndex: number): FormArray {
    return this.cargo()
      .at(empIndex)
      .get('skills') as FormArray;
  }

  demensions(skillData?): FormGroup {
    return this.formBuilder.group({
      checkbox1: [false],
      PackageType1: [skillData?.PackageType1 ?? '', Validators.required],
      pieces: [skillData?.pieces ?? '', Validators.required],
      Length: [skillData?.Length ?? '', Validators.required],
      Width: [skillData?.Width ?? '', Validators.required],
      height: [skillData?.height ?? '', Validators.required],
      DimensionUnit: [skillData?.DimensionUnit ?? ''],
      PerpieceWt: [skillData?.PerpieceWt ?? '', Validators.required],
      Unit1: [skillData?.Unit1 ?? '']
    });
  }


  Adddimension(empIndex: number) {
    this.dimension(empIndex).push(this.demensions());
  }

  delete() {
    const employeeFormArray = this.empForm?.get('cargo') as FormArray;
    for (let i = employeeFormArray.length - 1; i >= 0; i--) {
      const checkboxValue = employeeFormArray.at(i)?.get('checkbox').value;
      if (checkboxValue === true) {
        employeeFormArray.removeAt(i);
      }
    }
    this.empIndex = 0;
  }
  isDisableds() {
    const employeeFormArray = this.empForm?.get('cargo') as FormArray;
    for (let i = employeeFormArray.length - 1; i >= 0; i--) {
      const checkboxValue = employeeFormArray.at(i)?.get('checkbox').value;
      if (checkboxValue === true) {
        return true;
      }
    }
    return false
  }
  deleted(empIndex: number,) {
    const skillFormArray = this.dimension(empIndex);
    for (let i = skillFormArray.length - 1; i >= 0; i--) {
      const checkboxValue = skillFormArray.at(i)?.get('checkbox1')?.value;
      if (checkboxValue === true) {
        skillFormArray.removeAt(i);
      }
    }
    this.empIndex = 0;
  }
  isDisabled(empIndex: number) {
    const skillFormArray = this.dimension(empIndex);
    for (let i = skillFormArray.length - 1; i >= 0; i--) {
      const checkboxValue = skillFormArray.at(i)?.get('checkbox1')?.value;
      if (checkboxValue === true) {
        return true;
      }
    }
    return false
  }

  addRow() {
    const control = this.userTable.get('tableRows') as FormArray;
    control.push(this.initiateForm());
    this.addValueChanges(this.getIndexControl());
  }

  getIndexControl(): number {
    return (this.userTable.get('tableRows') as FormArray).length - 1
  }

  initiateForm(): FormGroup {
    return this.formBuilder.group({
      ContainerType: ['', Validators.required],
      checkboxs: [false],
      Quantity: ['',Validators.required],
      gwcontainer: [''],
      Weightunit:['KGS'],
      ShipperOwned: [false]
    });
  }

  populateTableWithData(data: any[]) {
    let control = this.userTable.controls.tableRows as FormArray;
    data.forEach(elem => {
      control.push(this.formBuilder.group(elem));
      this.addValueChanges(this.getIndexControl());
    });
  }

  addValueChanges(indexOfControl: number) {

  }
  isAnyCheckboxChecked(): boolean {
    const control = this.userTable.get('tableRows') as FormArray;
    for (let i = 0; i < control.length; i++) {
      const checkbox = control.at(i).get('checkboxs');
      if (checkbox.value === true) {
        return true;
      }
    }
    return false;
  }


  deleteRows() {
    const control = this.userTable.get('tableRows') as FormArray;
    for (let i = control.length - 1; i >= 0; i--) {
      const checkbox = control.at(i).get('checkboxs');
      if (checkbox.value === true) {
        control.removeAt(i);
      }
    }
  }

  findRowIndex(element: HTMLElement): number {
    while (element && element.nodeName !== 'TR') {
      element = element.parentElement as HTMLElement;
    }

    if (!element) {
      return -1;
    }

    const tableRow = element as HTMLTableRowElement;
    const tableBody = tableRow.parentElement as HTMLTableSectionElement;
    const rowIndex = Array.prototype.indexOf.call(tableBody.children, tableRow);
    return rowIndex;
  }

  get getFormControls() {
    const control = this.userTable.get('tableRows') as FormArray;
    return control;
  }

  get getNestedFormControls() {
    const control = this.userTable.get('ContainerRows') as FormArray;
    return control;
  }
  geterror(e) {
    console.log(e);
  }
  opendocuupload(carrierbookings) {
    this.fileUploadCustomId = carrierbookings?.carrierbookingId;
    this.fetDocument(this.fileUploadCustomId);
  }
  fetDocument(carrierbookingId) {
    let payload = this.commonService.filterList()
    payload.query = {
      carrierbookingId: carrierbookingId,
    }
    this.commonService.getSTList("document", payload)?.subscribe((res: any) => {
      this.customeDocument = res?.documents?.filter(doc => doc?.documentURL);
    }
    )
  }

  onFileSelected(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.docForm?.get('documentName')?.setValue(filename);
    this.extension = filename.substr(filename.lastIndexOf('.'));
    if (
      this.extension.toLowerCase() === '.xls' ||
      this.extension.toLowerCase() === '.xlsx' ||
      this.extension.toLowerCase() === '.pdf' ||
      this.extension.toLowerCase() === '.doc' ||
      this.extension.toLowerCase() === '.docx'
    ) {
      this.fileTypeNotMatched = false;
      this.doc = event.target.files[0];
    } else {
      this.fileTypeNotMatched = true;
      this.base64Output = '';
      this.docForm?.get('documentURL')?.setValue('');
      this.docForm?.get('Doc')?.setValue('');
    }
  }
  checkDocUploaded() {
    if (this.documentTableData.filter((x) => x.documentStatus).length > 0) {
      return false
    } else { return true }
  }

    downloadFile(doc) {
      this.commonService.downloadDocuments('downloadfile', doc).subscribe(
        (fileData: Blob) => {
          this.commonService.downloadDocumentsFile(fileData, doc);
        },
        (error) => {
          console.error(error);
        }
      );
    }
    async uploadDocument() {
      if (!this.doc) return;
      const formData = new FormData();
      formData.append('file', this.doc, `${this.doc.name}`);
      formData.append('name', `${this.doc.name}`);

      let file = await this.commonService.uploadDocuments('uploadfile', formData).subscribe();
      if (file) {
        this.notification.create(
          'success',
          'Uploaded Successfully',
          ''
        );
        if (this.carrierbookingId) {
          this.commonService.UpdateToST(`carrierbooking/${this.carrierbookingId}`, {documentName:this.doc?.name}).subscribe((res: any) => {
            setTimeout(() => {
              if (res) {
                this.doc = null;
                this.getBookingDetais();
                this.notification.create(
                  'success',
                  'Updated Successfully',
                  ''
                );
              }
            }, 500);
          },
            error => {
              this.notification.create(
                'error',
                error?.error?.error?.message,
                ''
              );
            });
        }else{
          this.documentUrl=this.doc?.name;
        }
      }


    }
    deleteFile(doc) {
      let data = `document/${doc.documentId}`
      this.commonService.deleteST(data).subscribe((res: any) => {
        if (res) {
          this.notification.create('success', 'Deleted successfully', '');
          setTimeout(() => {
            this.fetDocument(this.fileUploadCustomId);
          }, 1000);

        }
      });
    }
    documentPreview(doc) {
      this.commonService.downloadDocuments('downloadfile', doc)?.subscribe(
        (res: Blob) => {
          const blob = new Blob([res], { type: 'application/pdf' });
          let temp = URL.createObjectURL(blob);
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        },
        (error) => {
          console.error(error);
        }
      );
    }
  
    isVoyageDatePassed(ETD: Date): boolean {
      const currentDate = new Date();
      return currentDate > new Date(ETD);
    }

    onSubmit() {
      this.submitted = true;
      let isreturn = false
      if (this.empForm.invalid) {
        this.empForm.markAllAsTouched();
        isreturn = true;
      }
      if (this.basicDetailsform.invalid) {
        this.basicDetailsform.markAllAsTouched();
        isreturn = true;
      }
      if (this.userTable.invalid) {
        this.userTable.markAllAsTouched();
        isreturn = true;
      } if (this.preCareerForm.invalid) {
        this.preCareerForm.markAllAsTouched();
        isreturn = true;
      }
      if (this.vesselForm.invalid) {
        this.vesselForm.markAllAsTouched();
        isreturn = true;
      }
      if (this.carriageForm.invalid) {
        this.carriageForm.markAllAsTouched();
        isreturn = true;
      }
      if (this.ConfirmationDetailsform.invalid) {
        this.ConfirmationDetailsform.markAllAsTouched();
        isreturn = true;
      }
      if (this.otherDetailsForm.invalid) {
        this.otherDetailsForm.markAllAsTouched();
        isreturn = true;
      }
      if (isreturn) {
        this.notification.create('error', 'Please fill required fields.', '');
        return;
      }
      let payload = {
        basicDetails: this.basicDetailsform?.value,
        cargoDetaiks: this.empForm.value,
        containerDetails: this.userTable.value,
        preCareer: this.preCareerForm.value,
        vesselDetails: this.vesselForm.value,
        carriageForm: this.carriageForm.value,
        confirmationDetailsform: this.ConfirmationDetailsform.value,
        otherDetailsForm: this.otherDetailsForm.value,
        docForm: this.docForm.value,
      }
      if(!this.carrierbookingId){
        payload['status']="Confirmed";
      }
      payload.basicDetails['carrierName']=this.shippinglineData?.find(shipping=>shipping?.shippinglineId===this.basicDetailsform?.value?.Carrier)?.name??"";
      payload.basicDetails['bookingpartyName']=this.agentList?.find(agent=>agent?.agentId===this.basicDetailsform?.value?.BookingParty)?.agentName??"";
      payload.confirmationDetailsform['locationName']=this.locationList?.find(locaton=>locaton?.locationId===this.ConfirmationDetailsform?.value?.PickupLocation)?.locationName??"";
      if(payload?.cargoDetaiks?.cargo?.length){
        payload?.cargoDetaiks?.cargo?.forEach((cargo)=>{
          if(cargo?.Commodity){
            cargo['commodityName']=this.productList?.find(product=>product?.productId===cargo?.Commodity)?.productName??"";
          }
          if(cargo?.Unit){
            cargo['unitName']=this.uomData?.find(uom=>uom?.uomId===cargo?.Unit)?.uomShort??"";
          }
          if(cargo?.PackageType){
            cargo['packageName']=this.packageList?.find(product=>product?.systemtypeId===cargo?.PackageType)?.typeName??"";
          }
          if(cargo?.skills?.length){
            cargo?.skills?.forEach((skills)=>{
              if(skills?.Unit1){
                skills['unitName']=this.uomData?.find(uom=>uom?.uomId===skills?.Unit1)?.uomShort??"";
              }
              if(skills?.PackageType1){
                skills['packageName']=this.packageList?.find(product=>product?.systemtypeId===skills?.PackageType1)?.typeName??"";
              }
              if(skills?.DimensionUnit){
                skills['DimensionUnitName']=this.dimensionUnitList?.find(DimensionUnit=>DimensionUnit?.systemtypeId===skills?.DimensionUnit)?.typeName??"";
              }
            })
          }
        })
      }
      if(payload?.containerDetails?.tableRows?.length){
        payload?.containerDetails?.tableRows?.forEach((tableRows)=>{
          if(tableRows?.ContainerType){
            tableRows['ContainerName']=this.containerTypeList?.find(systemtype=>systemtype?.systemtypeId===tableRows?.ContainerType)?.typeName??"";
          }
        })
      }
      if(payload?.preCareer?.preCareers?.length){
        payload?.preCareer?.preCareers?.forEach((preCareers)=>{
          if(preCareers?.PreOrigin){
            preCareers['portName']=this.portListData?.find(port=>port?.portId===preCareers?.PreOrigin)?.portDetails?.portName??"";
          }
          if(preCareers?.PreDestination){
            preCareers['destinationPortName']=this.portListData?.find(port=>port?.portId===preCareers?.PreDestination)?.portDetails?.portName??"";
          }
          if(preCareers?.ModeofTransit){
            preCareers['ModeofTransitName']=this.transitList?.find(systemtype=>systemtype?.systemtypeId===preCareers?.ModeofTransit)?.typeName??"";
          }
          if(preCareers?.PreVoyagenumber){
            preCareers['voyageNumber']=this.voyageList?.find(voyage=>voyage?.voyageId===preCareers?.PreVoyagenumber)?.voyageNumber??"";
          }
          if(preCareers?.customSkills?.length){
            preCareers?.customSkills?.forEach((customSkills)=>{
              if(customSkills?.PreTranshipmentHop){
                customSkills['portName']=this.portListData?.find(port=>port?.portId===customSkills?.PreTranshipmentHop)?.portDetails?.portName??"";
              }
              if(customSkills?.PreModeofTransit){
                customSkills['transitName']=this.transitList?.find(PreTransit=>PreTransit?.systemtypeId===customSkills?.PreModeofTransit)?.typeName??"";
              }
              if(customSkills?.isPreVoyagenumber){
                customSkills['voyageNumber']=this.voyageList?.find(voyage=>voyage?.voyageId===customSkills?.isPreVoyagenumber)?.voyageNumber??"";
              }
            })
          }
        })
      }
      // if(payload?.vesselDetails?.vessels?.length){
      //   payload?.vesselDetails?.vessels?.forEach((vessels)=>{
          if(payload?.vesselDetails?.Origin){
            payload.vesselDetails['portName']=this.portListData?.find(port=>port?.portId===payload?.vesselDetails?.Origin)?.portDetails?.portName??"";
          }
          if(payload?.vesselDetails?.Destination){
            payload.vesselDetails['destinationPortName']=this.portListData?.find(port=>port?.portId===payload?.vesselDetails?.Destination)?.portDetails?.portName??"";
          }
          if(payload?.vesselDetails?.Vessel){
            payload.vesselDetails['vesselName']=this.vesselMaster?.find(vessel=>vessel?.vesselId===payload?.vesselDetails?.Vessel)?.vesselName??"";
          }
          if(payload?.vesselDetails?.Voyagenumber){
            payload.vesselDetails['voyageNumber']=this.voyageList?.find(voyage=>voyage?.voyageId===payload?.vesselDetails?.Voyagenumber)?.voyageNumber??"";
          }
          if(payload?.vesselDetails?.details?.length){
            payload?.vesselDetails?.details?.forEach((details)=>{
              if(details?.TranshipmentHop){
                details['portName1']=this.portListData?.find(port=>port?.portId===details?.TranshipmentHop)?.portDetails?.portName??"";
              }
              if(details?.isVessel){
                details['vesselName']=this.vesselMaster?.find(vessel=>vessel?.vesselId===details?.isVessel)?.vesselName??"";
              }
              if(details?.isVoyagenumber){
                details['voyageNumber']=this.voyageList?.find(voyage=>voyage?.voyageId===details?.isVoyagenumber)?.voyageNumber??"";
              }
            })
          }
      //   })
      // }
      if(payload?.carriageForm?.carriages?.length){
        payload?.carriageForm?.carriages?.forEach((carriages)=>{
          if(carriages?.OnOrigin){
            carriages['portName']=this.portListData?.find(port=>port?.portId===carriages?.OnOrigin)?.portDetails?.portName??"";
          }
          if(carriages?.OnDestination){
            carriages['destinationPortName']=this.portListData?.find(port=>port?.portId===carriages?.OnDestination)?.portDetails?.portName??"";
          }
          if(carriages?.ONModeofTransit){
            carriages['ModeofTransitName']=this.transitList?.find(systemtype=>systemtype?.systemtypeId===carriages?.ONModeofTransit)?.typeName??"";
          }
          if(carriages?.OnVoyagenumber){
            carriages['voyageNumber']=this.voyageList?.find(voyage=>voyage?.voyageId===carriages?.OnVoyagenumber)?.voyageNumber??"";
          }
          if(carriages?.carriageProperties?.length){
            carriages?.carriageProperties?.forEach((carriageProperties)=>{
              if(carriageProperties?.OnTranshipmentHop){
                carriageProperties['portName']=this.portListData?.find(port=>port?.portId===carriageProperties?.OnTranshipmentHop)?.portDetails?.portName??"";
              }
              if(carriageProperties?.OnIsModeofTransit){
                carriageProperties['transitName']=this.transitList?.find(PreTransit=>PreTransit?.systemtypeId===carriageProperties?.OnIsModeofTransit)?.typeName??"";
              }
              if(carriageProperties?.OnIsVoyagenumber){
                carriageProperties['voyageNumber']=this.voyageList?.find(voyage=>voyage?.voyageId===carriageProperties?.OnIsVoyagenumber)?.voyageNumber??"";
              }
            })
          }
        })
      }
      if (this.carrierbookingId) {
        this.commonService.UpdateToST(`carrierbooking/${this.carrierbookingId}`, payload).subscribe((res: any) => {
          setTimeout(() => {
            if (res) {
              this.notification.create(
                'success',
                'Updated Successfully',
                ''
              );
              this.router.navigate(['/carrier-bookings/list'])
            }
          }, 500);
        },
          error => {
            this.notification.create(
              'error',
              error?.error?.error?.message,
              ''
            );
          });
      }
      else {
        if(this.documentUrl){
          payload['documentName']=this.documentUrl;
        }
        this.commonService.addToST("carrierbooking", payload)?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Added Successfully', '');
              this.onSave();
              setTimeout(() => {
                this.router.navigate(['/carrier-bookings/list'])
              }, 1000);
            }
          },
          (error) => {
            this.onSave();
            this.notification.create('error', error?.error?.error, '');
          }
        );
      }

    }
    onSave() {
      this.submitted = false;
      this.basicDetailsform.reset();
      this.empForm.reset();
      this.userTable.reset();
      this.preCareerForm.reset();
      this.vesselForm.reset();
      this.carriageForm.reset();
      this.ConfirmationDetailsform.reset();
      this.otherDetailsForm.reset();
      this.docForm.reset();
      return null;
    }

  // get vessels(): FormArray {
  //   return this.vesselForm.get('vessels') as FormArray;
  // }

  newVessel(): FormGroup {
    return this.formBuilder.group({
      Origin: ['', Validators.required],
      Terminal: [''],
      ETD: ['', Validators.required],
      ETA: [''],
      Vessel: ['', Validators.required],
      Voyagenumber: ['', Validators.required],
      Destination: ['', Validators.required],
      Terminals: [''],
      details: this.formBuilder.array([

      ])
    });
  }
  getTerminal(id,formName?){
    if(id) return this.portListData?.find(port=>port?.portId===id)?.terminals??[];
  }
  vesselDetails(): FormArray {
    return this.vesselForm.get('details') as FormArray;
  }

  newDetail(data?): FormGroup {
    return this.formBuilder.group({
      TranshipmentHop: [data?.TranshipmentHop ?? '', Validators.required],
      TransTerminal: [data?.TransTerminal ?? ''],
      TransETA: [data?.TransETA ?? ''],
      TransETD: [data?.TransETD ?? ''],
      isVessel: [data?.isVessel ?? ''],
      isVoyagenumber: [data?.isVoyagenumber ?? ''],
    });
  }

  removeVesselDetail(detailIndex: number) {
    this.vesselDetails().removeAt(detailIndex);
  }

  AddTranshipmentHop() {
    // const detailsArray = this.vesselDetails();
    this.vesselDetails().push(this.newDetail());
  }
  get preCareers(): FormArray {
    return this.preCareerForm.get('preCareers') as FormArray;
  }

  newPreCareer(): FormGroup {
    return this.formBuilder.group({
      PreOrigin: ['', Validators.required],
      PreETD: [''],
      ModeofTransit: [''],
      PreVoyagenumber: [''],
      PreDestination: ['', Validators.required],
      PreETA: [''],
      customSkills: this.formBuilder.array([])
    });
  }

  addPreCareer() {
    this.preCareers.push(this.newPreCareer());
  }

  removePreCareer(preCareerIndex: number) {
    this.preCareers.removeAt(preCareerIndex);
  }

  addingPreCareer: boolean = false;

  toggleAddRemovePreCareer() {
    if (this.addingPreCareer) {
      this.removePreCareer(this.preCareers.length - 1);
    } else {
      this.addPreCareer();
    }
    this.addingPreCareer = !this.addingPreCareer;
  }


  addCustomSkill(preCareerIndex: number) {
    const preCareer = this.preCareers.at(preCareerIndex) as FormGroup;
    const customSkills = preCareer.get('customSkills') as FormArray;
    customSkills.push(this.newCustomSkill());
  }

  removeCustomSkill(preCareerIndex: number, skillIndexs: number) {
    const preCareer = this.preCareers.at(preCareerIndex) as FormGroup;
    const customSkills = preCareer.get('customSkills') as FormArray;
    customSkills.removeAt(skillIndexs);
  }

  newCustomSkill(items?): FormGroup {
    return this.formBuilder.group({
      PreTranshipmentHop: [items?.PreTranshipmentHop ?? '', Validators.required],
      PreTransETA: [items?.PreTransETA ?? ''],
      PreTransETD: [items?.PreTransETD ?? ''],
      PreModeofTransit: [items?.PreModeofTransit ?? ''],
      isPreVoyagenumber: [items?.isPreVoyagenumber ?? '']
    });
  }
  

  carriages(): FormArray {
    return this.carriageForm.get('carriages') as FormArray;
  }

  newCarriage(): FormGroup {
    return this.formBuilder.group({
      OnOrigin: ['', Validators.required],
      OnETD: [''],
      OnModeofTransit: [''],
      OnVoyagenumber: [''],
      OnDestination: ['', Validators.required],
      OnETA: [''],
      carriageProperties: this.formBuilder.array([])
    });
  }

  addCarriage() {
    this.carriages().push(this.newCarriage());
  }

  removeCarriage(carriageIndex: number) {
    this.carriages().removeAt(carriageIndex);
  }
  // Update function name and references accordingly
  addingOnCarriages: boolean = false;

  toggleAddRemoveOnCarriage() {
    if (this.addingOnCarriages) {
      this.removeCarriage(this.carriages.length - 1);
    } else {
      this.addCarriage();
    }
    this.addingOnCarriages = !this.addingOnCarriages;
  }

  carriageProperties(carriageIndex: number): FormArray {
    return this.carriages()
      .at(carriageIndex)
      .get('carriageProperties') as FormArray;
  }

  newProperty(ondata?): FormGroup {
    return this.formBuilder.group({
      OnTranshipmentHop: [ondata?.OnTranshipmentHop ?? '', Validators.required],
      OnTransETA: [ondata?.OnTransETA ?? ''],
      OnTransETD: [ondata?.OnTransETA ?? ''],
      OnIsModeofTransit: [ondata?.OnIsModeofTransit ?? ''],
      OnIsVoyagenumber: [ondata?.OnIsVoyagenumber ?? '']
    });
  }

  addCarriageProperty(carriageIndex: number) {
    this.carriageProperties(carriageIndex).push(this.newProperty());
  }

  removeCarriageProperty(carriageIndex: number, propertyIndex: number) {
    this.carriageProperties(carriageIndex).removeAt(propertyIndex);
  }
  cancel(){
    this.router.navigate(['/carrier-bookings/list'])
  }
  getShiipingLine() {
    let payload = this.commonService?.filterList() 
    if(payload?.query)  payload.query = {
        "status": true,
        "$and": [
          {
            "feeder": {
              "$ne": true,
            }
          }
        ]
      }
    
    
    
    this.commonService?.getSTList('shippingline',payload).subscribe((data) => {
      this.shippinglineData = data.documents;
    });
    
  }
  getproductDropDowns() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true
    }
    this.commonService?.getSTList('product', payload).subscribe((res: any) => {
      this.productList = res?.documents;
    });
  }
  getVesselMaster() {

    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true
    }
    
    this.commonService?.getSTList('vessel',payload).subscribe((res: any) => {
      this.vesselMaster = res.documents;

    });

  }
  getVoyageListDropDown() {
    let payload = this.commonService?.filterList()
    if(payload?.query)  payload.query = { }
    this._api?.getSTList('voyage', payload)
      .subscribe((res: any) => {
        this.voyageList = res?.documents;
      });
  }
  getLocationDropDowns() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
      "status": true
    }
    if(payload?.sort) payload.sort = {
      "desc" : ["updatedOn"]
    }, 
    this.commonService?.getSTList('location', payload).subscribe((res: any) => {

      this.locationList = res?.documents;
    });
  }
  getUomList() {
    let payload = this.commonService?.filterList()
    if (payload) payload.query = { 'status': true }
    this.commonService?.getSTList('uom', payload)?.subscribe((data) => {
      this.uomData = data.documents;
      this.WeightData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
    });
  }
  getSystemTypeDropDowns() {
   
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      typeCategory:   {
        "$in": ['containerType','transit','packageType','dimensionUnit']
      },
      "status": true
    }
    this._api?.getSTList("systemtype", payload).subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.transitList = res?.documents?.filter(x => x.typeCategory === "transit");
      this.packageList = res?.documents?.filter(x => x.typeCategory === "packageType");
      this.dimensionUnitList = res?.documents?.filter(x => x.typeCategory === "dimensionUnit");
    });
  }
 getPortData() {
    let payload = this.commonService?.filterList()
    if(payload?.query) payload.query = {
      "status": true
    }
    if(payload?.size)payload.size = 15000
    if(payload?.project)payload.project = ["portDetails.portName", "portId"];
    this.commonService?.getSTList('port',payload)
      .subscribe((res: any) => {
        this.portListData = res?.documents
      });
  }
  getSmartAgentList() {
    let payload = this.commonService?.filterList()
    if(payload?.query)  payload.query = {
      "status": true,
    }
    this.commonService?.getSTList('agent', payload).subscribe((data) => {
      this.agentList = data?.documents;
    });
  }
  // table functionality

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
  }
  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;


    var parameter = {
      "project": [ ],
      "query": {
          "isExport": this.isExport,
          "quotationDetails.loadPortId": this.carrierbookingDetails?.vesselDetails?.Origin,
          "quotationDetails.dischargePortId": this.carrierbookingDetails?.vesselDetails?.Destination
      },
      "sort" :{
          "desc" : ["createdOn"]
      },
      size: Number(this.size),
      from: this.fromSize - 1,
  }
  
    this._api?.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents;
        this.toalLength = data.totalCount;
        this.page = type === 'prev' ? this.page - 1 : this.page + 1;
        this.count =
          type === 'prev'
            ? this.toalLength === this.count
              ? this.count - (this.toalLength % Number(this.size))
              : this.count - data.documents.length
            : this.count + data.documents.length;
      });
  }
  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if(each){

      if (this.displayedColumns[ind] == 'createdOn') {
        this.filterKeys['createdOn'] = {
          "$gt": each.substring(0, 10) + 'T00:00:00.000Z',
          "$lt": each.substring(0, 10) + 'T23:59:00.000Z'
        };
      } else {
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each.toLowerCase(),
          "$options": "i"
        }
      }  
    } 
  });
  
  this.filterKeys['isExport']= this.isExport
  this.page = 1;
  this.fromSize = 1;
  var parameter = {
    "project": [ ],
    "query": { ...this.filterKeys  },
    "sort" :{
        "desc" : ["createdOn"]
    },
    size: Number(10000),
    from: this.page - 1,
}
  
  
  this._api?.getSTList(Constant.BATCH, parameter)
    .subscribe((data: any) => {
      this.batchList = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;

      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;

    });
 
  }


  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();


    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
  }

  navigateToNewTab(element) {
    let url = element.agentadviceId + '/edit'
    window.open(window.location.href + '/' + url);
  }
  

  getBatchList() {
    this.page = 1;
    this.fromSize = 1;
    var parameter = {
      "project": [ 'batchNo','batchId','enquiryDetails'],
      "query": {
          "isExport": this.isExport,
          "quotationDetails.loadPortId": this.carrierbookingDetails?.vesselDetails?.Origin,
          "quotationDetails.dischargePortId": this.carrierbookingDetails?.vesselDetails?.Destination
      },
      "sort" :{
          "desc" : ["createdOn"]
      },
      size: Number(10000),
      from: this.page - 1,
  }
    this._api.getSTList(Constant.BATCH, parameter)
      .subscribe((data: any) => {
        this.batchList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
          const batchMap = {};
          this.batchList?.forEach(batch => {
              batchMap[batch.batchNo] = batch;
          });
          this.bookedContainer?.forEach(container => {
              const batch = batchMap[container.batchNo];
              if (batch) {
                  batch[container.ContainerName] = container.allocated;
              }
          });
         const result = Object.values(batchMap);
         this.dataSource = new MatTableDataSource(result);
        this.displayedColumns = [
          '#',
          'batchNo',
          'enquiryDetails.enquiryNo',
          'enquiryDetails.basicDetails.shipperName'
        ];
        (this.carrierbookingDetails?.containerDetails?.tableRows??[])?.forEach((carrier=>{
          this.displayedColumns.push(carrier?.ContainerName)
        }))
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
      });


  }
  isDisabledContainer(columnDef, element) {
    let count = 0;
    const max = columnDef?.Quantity ?? 0; // Maximum allowed quantity
    (this.bookedContainer ?? []).forEach((ct) => {
      if (ct?.ContainerName === columnDef?.ContainerName) {
        count += ct?.allocated;
      }
    });
    return count >= max;
  }
  totalAllocation() {
    let count = 0;
    this.carrierbookingDetails?.containerDetails?.tableRows.forEach((ContainerName)=>{
      // count += ContainerName?.Quantity ?? 0; // Maximum allowed quantity
      (this.bookedContainer ?? []).forEach((ct) => {
        if (ct?.ContainerName === ContainerName?.ContainerName) {
          count += ct?.allocated;
        }
      });
    })
    return count
  }
  deallocate(index){
    const Containerbooking= this.carrierbookingDetails?.bookedContainer?.filter((_, i) => i !== index);
    if (this.carrierbookingId) {
      const payload={
        "bookedContainer":Containerbooking??[]
      }
      this.commonService?.UpdateToST(`carrierbooking/${this.carrierbookingId}`, payload).subscribe((res: any) => {
        if(Containerbooking?.length){
          let payloadBatch=[];
          const batchIds:any = Array.from(this.batchList?.reduce((m, t) => m.set(t?.batchId, t), new Map()).values());
         const Batchpayload=batchIds?.forEach((t)=>{
          payloadBatch.push({"batchId":t?.batchId,"bookingConfirmedWithLine":Containerbooking?.filter(tt=>tt?.batchId===t?.batchId)>0,containerBooked:Containerbooking?.filter(tt=>tt?.batchId===t?.batchId)})
         })
          this.commonService?.batchUpdate('batch/batchupdate',Batchpayload)?.subscribe(
            (res: any) => {
              if (res) {
    
              }
            },
            (error) => {
              this.notification.create('error', error?.error?.error?.message, '');
            }
          );
        }
        setTimeout(() => {
          if (res) {
            this.notification.create(
              'success',
              'Container De-Allocated Successfully',
              ''
            );
            this.getBookingDetais()
          }
        }, 500);
      },
        error => {
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
    }
  }
  onAnyFieldChange(columnDef,element){
      if(columnDef?.ContainerName && element?.[columnDef?.ContainerName]){
        if(columnDef?.Quantity >=element?.[columnDef?.ContainerName]){
         
        }else{
          element[columnDef.ContainerName]=columnDef?.Quantity
        }
        let count = 0;
        const max = columnDef?.Quantity ?? 0;
        (this.bookedContainer ?? []).forEach((ct) => {
          if ((ct?.ContainerName === columnDef?.ContainerName)&&(ct?.batchNo !=element?.batchNo)) {
            count += ct?.allocated;
          }
        });
        if((count+element?.[columnDef?.ContainerName]) >= max && count>0){
          if((count+element?.[columnDef?.ContainerName])>max){
            element[columnDef.ContainerName]=max-count
          }
        }
        let booked=this.bookedContainer??[];
        const isBooked=(booked ?? [])?.findIndex(rm=>rm?.ContainerName===columnDef?.ContainerName && rm?.batchNo ===element?.batchNo);
        if(isBooked!==-1){
          booked[isBooked]={
            "batchNo": element?.batchNo,
            "batchId": element?.batchId,
            "ContainerName": columnDef?.ContainerName,
            "total":columnDef?.Quantity,
            "allocated":element[columnDef.ContainerName]
          }
          booked=booked
        }else{
          booked = [
            ...(booked || []),
            {
              "batchNo": element?.batchNo,
              "batchId": element?.batchId,
              "ContainerName": columnDef?.ContainerName,
              "total":columnDef?.Quantity,
              "allocated":element[columnDef.ContainerName]
            }
          ]
        }
        this.bookedContainer=booked;
      }
  }
  saveBookingcontainer(){
    
    const booking=this.bookedContainer??[];
    if(this.totalAllocation() <1){
      this.notification.create('error', "Please Enter the Container Allocation Quantity", '');
      return;
    }
    if(this.totalallocated<1){
      this.notification.create('error', " Container Allocation Limit Exceeded", '');
      return;
    }
    if (this.carrierbookingId && this.dataSource.data?.length) {
      const payload={
        "bookedContainer":booking??[]
      }
      this.commonService?.UpdateToST(`carrierbooking/${this.carrierbookingId}`, payload).subscribe((res: any) => {
        if(booking?.length){
          const batchIds:any = Array.from(booking?.reduce((m, t) => m.set(t?.batchId, t), new Map()).values());
         const Batchpayload=batchIds?.map(t=>{return{"batchId":t?.batchId,"bookingConfirmedWithLine":true,containerBooked:booking?.filter(tt=>tt?.batchId===t?.batchId)}})
          this.commonService?.batchUpdate('batch/batchupdate',Batchpayload)?.subscribe(
            (res: any) => {
              if (res) {
    
              }
            },
            (error) => {
              this.notification.create('error', error?.error?.error?.message, '');
            }
          );
        }
        setTimeout(() => {
          document.getElementById("closebooking").click();
          if (res) {
            this.notification.create(
              'success',
              'Container Allocated Successfully',
              ''
            );
            this.getBookingDetais()
          }
        }, 500);
      },
        error => {
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
    }
  }
  getunallocated(ContainerName){
    if(!this.bookedContainer?.length){
      return ContainerName?.Quantity
    }else{
      if(ContainerName?.ContainerName){
        let count = 0;
        (this.bookedContainer ?? []).forEach((ct) => {
          if (ct?.ContainerName === ContainerName?.ContainerName) {
            count += ct?.allocated;
          }
        });
        return ContainerName?.Quantity-count;
      }
    }
  }
  isallowed(){
    let count1 = 0;
    this.carrierbookingDetails?.containerDetails?.tableRows.forEach((ContainerName)=>{
      if(!this.bookedContainer?.length){
        count1+= ContainerName?.Quantity
      }else{
        if(ContainerName?.ContainerName){
          let count = 0;
          (this.bookedContainer ?? []).forEach((ct) => {
            if (ct?.ContainerName === ContainerName?.ContainerName) {
              count += ct?.allocated;
            }
          });
          count1+= ContainerName?.Quantity-count;
        }
      }
    })
    return count1
  }
}