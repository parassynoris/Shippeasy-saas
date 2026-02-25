import { Component, OnInit, Output, EventEmitter, Input, Pipe, PipeTransform, ViewChild, HostListener } from '@angular/core';
import { shared } from '../../../data';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { differenceInCalendarDays } from 'date-fns';
import { CognitoService } from 'src/app/services/cognito.service';
import { SystemType } from 'src/app/models/system-type';
import { Container } from 'src/app/models/container-master';
import { Invoice } from 'src/app/models/invoice';
import { CargoData } from 'src/app/models/new-invoice';
import { LocationData } from 'src/app/models/city-master';
import { EnquiryItem } from 'src/app/models/enquiry';
import { PartyMaster } from 'src/app/models/vendor-master';
export interface ContainerNoItem {
  containerNo: string;
  containerId: string;
  label: string;
  value: string;
}
export interface BatchN {
  label1: string;
  label: string;
  value: number; // Assuming batchId is of type number, you can adjust it accordingly
}

@Pipe({
  name: "searchfilter"
})
export class SearchFilterPipe implements PipeTransform {
  transform(value: any, args?: any) {
    if (!value) return null;
    if (!args) return value
    args = args.toLowerCase()
    return value.filter(function (item) {
      return JSON.stringify(item).toLowerCase().includes(args)
    })
  }
}
@Component({
  selector: 'app-new-vendor-bill',
  templateUrl: './new-vendor-bill.component.html',
  styleUrls: ['./new-vendor-bill.component.scss'],
})

export class NewVendorBillComponent implements OnInit {
  @ViewChild("insideElement") insideElement;
  @ViewChild("insideElement1") insideElement1;
  @ViewChild("insideVendor") insideVendor;
  @ViewChild("insideVendor1") insideVendor1;
  isExport: boolean = false;
  GSTRateList: SystemType[] = [];
  containerList: Container[] = [];
  containerNoList: ContainerNoItem[] = [];
  addContainerData: any = [];
  selectedChargeItem: any = [];
  costItemLength: any = 0;
  containerData: any = [];
  rowSpanCount: any = 0;
  tenantId: any;
  todayDate=new Date()
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  @HostListener('document:click', ['$event.target'])
  public onClick(targetElement?) {
    if (this.insideElement || this.insideElement1) {
      const clickedInside = this.insideElement?.nativeElement?.contains(targetElement);
      const clickedInside1 = this.insideElement1?.nativeElement?.contains(targetElement);
      if (clickedInside) {
        this.showBatch = true
      }
      if (!clickedInside && !clickedInside1) {
        this.showBatch = false
      }
    }
    if (this.insideVendor || this.insideVendor1) {
      const insideVendor = this.insideVendor?.nativeElement?.contains(targetElement);
      const insideVendor1 = this.insideVendor1?.nativeElement?.contains(targetElement);
      if (insideVendor) {
        this.showTem = true
      }
      if (!insideVendor && !insideVendor1) {
        this.showTem = false
      }
    }
  }

  filterBody = this.apiService.body;
  newvendorForm: FormGroup;
  submitted: boolean;
  @Output() BillSection = new EventEmitter<string>();
  @Input() isType: any = 'add';
  allBillsData = shared.allBillsData;
  vendorList: any;
  currencyList: any;
  isEditable: boolean = false;
  urlParam: any;
  billsList: any;
  documents: any[];
  updateDoc: any;
  documentPayload: any = [];
  creditFromToArray: any = [];
  partyMasterList: any = [];

  batchNoList: BatchN[] = [];
  costItemList: any = [];
  totalAmount: number = 0;
  taxAmount: number = 0;
  billAmount: number = 0;
  activeSAModule: boolean = true;
  costCenterList: any;
  billToList: any = [];
  isPath: any;
  batchData: any;
  selectedCostItems: Container[] = [];
  allpartyMasterList: PartyMaster[] = [];
  addChargesForm: FormGroup;
  form: any;
  batchListData: CargoData[]  = [];
  isSGST: boolean;
  locationList: LocationData[] = [];
  disableForm: boolean = false;
  closeResult: string;
  todayBillList: Invoice[];
  uniqueBill: boolean = false;
  showTem: boolean = false;
  showBatch: boolean = false;
  searchText: any;
  searchBatch: any;
  displayCharge: boolean = false;
  chargeData: EnquiryItem[] = [];
  batchMultipleData : CargoData[] ;
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private route: ActivatedRoute,
    public apiService: ApiSharedService,
   
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    public notification: NzNotificationService,
    private cognito : CognitoService,
    private location: Location,
    private CommonFunctions : CommonFunctions,
  ) {
    this.modalService = modalService;
    this.router = router;
    this.route = route;
    this.apiService = apiService;
    this.commonService = commonService;
    this.formBuilder = formBuilder;
    this.notification = notification;
    this.cognito = cognito;
    this.location = location;
    this.isExport   = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
    this.getPartyMaster();
    this.getBatchList();
    this.formBuild();
    this.getLocationDropDowns()
    this.getContainerList()
    this.route.params.subscribe((params) => (this.urlParam = params));
  
    this.activeSAModule = false
    let stringToSplit = location.path();
    let x = stringToSplit.split('/');
    this.isPath = x[1];
    this.getSystemTypeDropDowns()
  }
  get f() {
    return this.newvendorForm.controls;
  }
  getContainerList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
    },
    this.commonService.getSTList('container', payload)
      ?.subscribe((data: any) => {
        this.containerList = data.documents;
        data.documents.forEach(element => {
          this.containerNoList.push({
            containerNo: element.containerNumber,
            containerId: element.containerId,
            label: element.batchNo,
            value: element.batchId,
          });
        });
      });
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      typeCategory: "gstRate",  
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.GSTRateList = res?.documents?.filter(x => x.typeCategory === "gstRate");
    });
  }

  formBuild() {
    this.newvendorForm = this.formBuilder.group({
      select_vendor: ['', [Validators.required]],
      currency: [''],
      bill_number: ['', [Validators.required]],
      bill_amount: [''],
      billTo: [''],
      bill_date: ['', [Validators.required]],
      billdue_date: [''],
      upload_document: [''],
      batchNo: [[], [Validators.required]],
      additional_comments: [''],
      CostCenterId: [''],
    });
  }
  ngOnInit(): void {
    this.currentAgent = this.CommonFunctions.getActiveAgent()
    this.addChargesForm = this.formBuilder.group(
      {
        charges: this.formBuilder.array([])
      },
    );

    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
    if (this.isPath === 'finance') {
      if (this.urlParam.id) {
        this.isEditable = true;
        this.getBillsList(this.urlParam.id);
      }
    } else {
      if (this.urlParam.moduleId) {
        this.isEditable = true;
        this.getBillsList(this.urlParam.moduleId);
      }
    }
  }
  getBillsList(id) {
    let payload = this.commonService.filterList()
    payload.query = {
      invoiceType: 'bills', invoiceId: id,
    }
    this.commonService.getSTList('invoice', payload)
      .subscribe((data) => {
        this.billsList = data.documents[0];
        this.documentPayload = this.billsList?.uploadDocuments ? this.billsList?.uploadDocuments : [];

        if (this.billsList?.billPosting?.billPosting) {
          this.disableForm = true;
          this.newvendorForm.disable();
        }
        this.newvendorForm.patchValue({
          select_vendor: this.billsList?.invoiceFromId,
          currency: this.billsList?.currencyId,
          bill_amount: this.billsList?.invoiceAmount,
          bill_date: this.billsList?.invoiceDate,
          billTo: this.billsList?.invoiceToId,
          billdue_date: this.billsList?.invoiceDueDate,
          batchNo: this.billsList?.batchNumber,
          bill_number: this.billsList?.billNo,
          additional_comments: this.billsList?.remarks,
          CostCenterId: this.billsList?.costCenterId,
        });
        this.chargeData = this.billsList?.vendorCharges
        this.containerData = this.billsList?.containerData


      });
  }
  getEnquiryCharges(res) {
    let payload = this.commonService.filterList()
    payload.query = {
      "chargeBillNo": this.billsList.billNo,  "enquiryitemId": res?.toString(),
    }
    this.commonService.getSTList('enquiryitem', payload)
      .subscribe(
        (result) => {
        
          this.chargeData = result?.documents;
         
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
  }
  deleteFile(doc) {
    let index = this.documentPayload.findIndex(
      item => item.documentName === doc.documentName
    )
    this.documentPayload.splice(index, 1)
  }
  getPartyMaster() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "customerType.item_text": 'Vendor',status: true 
    }
    this.commonService.getSTList('partymaster', payload)
      ?.subscribe((data) => {
        let dataParty = []
        data.documents.forEach(element => {
          element?.gstDetails?.map((x) => {

            dataParty.push({ ...element, ...x } )
          })
        });
        this.partyMasterList = dataParty;
        this.allpartyMasterList = dataParty;

      });
  }

  vendorFinal = []
  onSave(flag) {

    this.submitted = true;
    if (this.newvendorForm.invalid) {
      this.newvendorForm.markAllAsTouched()
      return false;
    }
    this.calculateTotal();
    this.vendorFinal = []
    this.charges?.value?.forEach(element => {
      if (!element?.isChecked)
        return false
      if (element?.document) { 
        const formData = new FormData();
        formData.append('file', element?.document, element?.document?.name);
        formData.append('name', element?.document?.name);
        this.commonService.uploadDocuments('uploadfile',formData).subscribe();

        // this.commonService.uploadFile(element?.document, element?.document?.name, "vendorCharge");
        let docUpload = {
          ...element,
          document: element?.document?.name ? element?.document?.name : element.document,
          documentUrl: element?.document?.name ? element?.document?.name : element.document,

        }
        this.vendorFinal.push(docUpload)
      } else {
        this.vendorFinal.push(element)
      }
    });


    let isCheck = this.vendorFinal?.filter((x) => x?.isChecked  )
    if (isCheck.length === 0) {
      this.notification.create('error', 'Please select at least one record', '');
      return false
    }


    this.documents?.filter((x) => {
      let data = {
        documentId: '',
        document: x.name,
        documentName: x.name,
      };
      this.documentPayload.push(data);
    });

    let payload = {
      invoiceId: '',
      orgId: this.CommonFunctions.getAgentDetails().orgId,
      "tenantId": this.tenantId,
      invoice_date: this.newvendorForm.get('bill_date').value,
      invoiceDate: this.newvendorForm.get('bill_date').value,
      invoiceDueDate: this.newvendorForm.get('billdue_date').value || undefined,
      invoiceType: 'bills', 
      remarks: this.newvendorForm.get('additional_comments').value,
      invoiceNo: '',
      billNo: this.newvendorForm.get('bill_number').value,
      invoiceFromId: this.newvendorForm.get('select_vendor').value,
      invoiceFromName: this.partyMasterList?.filter(
        (x) => x.gst === this.newvendorForm.get('select_vendor').value
      )[0]?.name,
      invoiceTaxAmount: this.taxAmount,
      remittenceId: '',
      uploadDocuments: this.documentPayload,
     
      containerData: this.addContainerArray(),
      vendorCharges: this.vendorFinal,
      invoiceAmount: this.totalAmount,
      isExport: (this.isExport || this.isTransport),
      tax: [
        {
          "taxAmount": 0,
          "taxRate": 0,
          "taxName": ""
        },
      ],
      vendorId: this.partyMasterList?.filter(
        (x) => x.gst === this.newvendorForm.get('select_vendor').value
      )[0]?.partymasterId,
      vendorName: this.partyMasterList?.filter(
        (x) => x.gst === this.newvendorForm.get('select_vendor').value
      )[0]?.name,
      batchNumber: this.newvendorForm.get('batchNo').value,
     
      status: true,
      invoiceStatus: flag,

    };
   
    if (this.isEditable) {
      let data = [
        {
          ...payload,
          invoiceId: this.billsList?.invoiceId,
          invoiceNo: this.billsList?.invoiceNo,
        },
      ];
      this.commonService.UpdateToST(`invoice/${data[0].invoiceId}`, data[0]).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Update Successfully', '');
              this.submitted = false;
             
              if (this.isPath === 'batch') {
                this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/vendor-bill']);
              }
              else
                this.router.navigate(['/finance/bills']);
            }, 500);

          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      let data = [payload];
      this.commonService.addToST('invoice', data[0]).subscribe(
        (res: any) => {
          if (res) {
            setTimeout(() => {
              this.notification.create('success', 'Save Successfully', '');
              this.submitted = false;
              // this.setCharges()
              if (this.isPath === 'batch') {
                this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/vendor-bill']);
              }
              else
                this.router.navigate(['/finance/bills']);
            }, 500);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  addContainerArray() {
    let data = []
    this.addContainerData.map((x) => {
      data.push({
        batchNo: x?.batchNo,
        containerNumber: x?.containerNumber,
        batchId: x?.batchId,
        blNumber: x?.blNumber,
        containerId: x?.containerId,
        containerType: x?.containerType,
        containers: x.containers
      })
    })
    return data
  }
  setCharges() {
    let vendorBill = this.newvendorForm.get('bill_number').value
    let dataUpdate = []
    let billArray = []
    this.vendorFinal?.forEach((element1) => {
      this.costItemList?.map((element) => {
        if (element1?.chargeItemId === element?.costitemId) {

          if (element?.vendorBillNo) {
            element?.vendorBillNo?.map((x) => {
              billArray.push({ vendorBill: x.vendorBill })
            })
          }
          billArray.push({ vendorBill: vendorBill })
          dataUpdate.push( {
                ...element,
                vendorBillNo: billArray
              });
        }

      })
    })

    this.commonService
      .batchUpdate('costitem/batchupdate', dataUpdate)
      .subscribe();
  }
  setBatchCharge() {
    let dataUpdate = []
    this.costItemList.forEach((element) => {
      dataUpdate.push({ ...element })
    })
    this.commonService
      .batchUpdate('enquiryitem/batchupdate', dataUpdate)
      .subscribe();
  }

  addDataArray() {
    const dataArray = [];
    this.charges?.controls?.forEach(element => {
      this.costItemList.forEach(element1 => {
        if (element?.value?.enquiryitemId === element1?.enquiryitemId) {
          if (!element?.value?.isChecked)
            return false
          dataArray.push(element?.value?.enquiryitemId)
        }
      })
    })
    return dataArray;
  }
  addArrayValue() {
    const dataArray = [];
    this.charges?.controls?.forEach(element => {
      this.costItemList.forEach(element1 => {

        if (element?.value?.enquiryitemId === element1?.enquiryitemId) {
          if (!element?.value?.isChecked)
            return false
          if (element?.value?.document) {
            const formData = new FormData();
            formData.append('file', element.value.document, `${element.value.document.name}`);
            formData.append('name', `${element.value.document.name}`);
            this.commonService.uploadDocuments("document", formData).subscribe();
          }
          let billNO = (element1?.vendor?.billNo ? element1?.vendor?.billNo.toString() : '') + this.newvendorForm.get('bill_number').value?.toString() + ',';
          let vendorID = (element1?.vendor?.vendorId ? element1?.vendor?.vendorId.toString() : '') + this.newvendorForm.get('select_vendor').value?.toString() + ',';
          let billNO1 = billNO.split(',')
          let vendorID1 = vendorID.split(',')
          const source = {
            ...element1,
            vendor: {
              billNo: billNO1?.filter((el, i, a) => i === a.indexOf(el)).toString(),
              vendorId: vendorID1?.filter((el, i, a) => i === a.indexOf(el)).toString(),
              stateCode: element?.value?.stateCode,
              gstNumber: element?.value?.gstNo?.toString(),
              gst: element?.value?.gst,
              sacCode: element?.value?.sacCode?.toString(),
              RCM: element?.value?.RCM || false,
              RCM_chargeble: element?.value?.RCM_chargeble,
              vendorTaxAmount: (element?.value?.chargableAMT * element?.value?.gst / 100).toString(),
              vendorRate: element?.value?.rate,
              chargableAMT: element?.value?.chargableAMT,
              taxApplied: element?.value?.taxApplied,
              exchangeRate: element?.value?.exchangeRate,
              sgstAMT: element?.value?.sgstAMT,
              utgstAMT: element?.value?.utgstAMT,
              cgstAMT: element?.value?.cgstAMT,
              igstAMT: element?.value?.igstAMT,
              remark: element?.value?.remark,
            },
            chargeBillNo: this.newvendorForm.get('bill_number').value?.toString(),
            enquiryId: '',
            enquiryNo: '',
            document: element.value?.document?.name ? element.value?.document.name : element.value?.document,
            documentUrl: `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/document/${element.value?.document?.name ? element.value?.document?.name : element.value?.document}`,

          }
          dataArray.push({ ...source })
        }
      })
    });
    this.costItemList = []
    this.costItemList = dataArray
  }

  onCloseBill(evt) {
    this.BillSection.emit(evt);
  }
  uploadDoc(event) {
    let files = [];
    this.documents = [];
    files = event.target.files;

    for (let i = 0; i < files.length; i++) {
      // this.commonService.uploadFile(files[i], files[i].name, 'bill');


      const formData = new FormData();
      formData.append('file', files[i], files[i]?.name);
      formData.append('name', files[i]?.name);
      this.commonService.uploadDocuments('uploadfile',formData).subscribe(); 
      this.documents.push(event.target.files[i]);
    }
  }


  showCharges(charges) {
      this.modalService.open(charges, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  invoiceAMT() {
    let totalAmount = 0;
    this.costItemList?.forEach((element) => {
      this.totalAmount += Number(element?.chargableAMT);
    });
    return totalAmount
  }
  calculateTotal() {
    this.totalAmount = 0;
    this.taxAmount = 0;
    this.charges?.controls?.forEach(element => {
      if(element.value.isChecked){
        this.totalAmount += Number(element?.value?.totalAMT);
        this.taxAmount += Number(element?.value?.chargableAMT * element?.value?.gst / 100);
      }
    })
    this.newvendorForm.controls?.bill_amount.setValue(this.totalAmount);
  }
  batchChange() {
    let  query = this.searchBatch
   
    let shouldArray = [];
    shouldArray.push(
      {"batchNo": {  "$regex": query ,"$options": "i"  } },
      {"containerNumber": {  "$regex": query ,"$options": "i"  } },
      { "moveNumber": {  "$regex": query ,"$options": "i" } }
     )

    var parameter = {
      "project": [ ],
      "query": {
        "status": true,
        "isExport": (this.isExport || this.isTransport),
        "$or": shouldArray},
      "sort" :{
          "desc" : ["updatedOn"]
      }
  }


    this.selectedCostItems = []
    this.commonService.getSTList("container", parameter)
      .subscribe((result: any) => {

        this.selectedCostItems = result?.documents;
      }
      );
  }
  getBatchList() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "isExport": (this.isExport || this.isTransport)
    }
    this.commonService.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchListData = data.documents;

        data.documents.forEach(element => {
          this.batchNoList.push({
            label1: element.enquiryNo,
            label: element.batchNo,
            value: element.batchId,
          });
        });


      });
  }




  CheckCostItemList: any = []
  addVendorCharge(evt, check) {
    if (evt.target.checked  ) {
      this.selectedChargeItem.push(check?.value);
    }
    else {

      let index = this.selectedChargeItem.findIndex(
        item => item?.chargeItemId === check?.value?.chargeItemId
      )
      this.selectedChargeItem.splice(index, 1)
    }

  }
  checked(e) {

    let data = e?.split(',').toString()
    return data?.includes(this.newvendorForm.get('bill_number').value)

  }

  confirmCharge() {
    let payload = this.commonService.filterList()
    payload.query = {
      "isExport": (this.isExport || this.isTransport),
        "batchId": {
        "$in": this.newvendorForm.controls.batchNo.value 
      }
    }
    this.commonService.getSTList('batch', payload)
      .subscribe((data: any) => {
        this.batchMultipleData = data.documents ;
      });
     this.checkContainerData()
   this.costItemList = []
    this.submitted = true
    if (this.newvendorForm.invalid)
      return false
    this.submitted = false
  
    let payload1 = this.commonService.filterList()
    payload1.query = {
      chargeApplicable: "Vendor",
    }
   

    if (this.isEditable) {
      this.commonService.getSTList('costitem', payload1).subscribe((data) => {

        data?.documents?.forEach(element => {
          this.costItemList.push(element)
        });

        this.displayCharge = true

        this.addContainerData = this.billsList?.containerData

        this.costItemLength = this.costItemList?.length
        this.setArrayForm();


      });
   
    } else {
      this.commonService.getSTList('costitem', payload1).subscribe((data) => {
        data?.documents?.forEach(element => {
          this.costItemList.push(element)
        });
        this.displayCharge = true
        this.setArrayForm();
        this.costItemLength = this.costItemList?.length

      });
    }



   
  }
  applyFilter() {
    let filterValueLower = this.newvendorForm.get('select_vendor').value.toLowerCase();
    if (this.newvendorForm.get('select_vendor').value === '') {
      this.partyMasterList = this.allpartyMasterList;
    }
    else {
      this.partyMasterList = this.allpartyMasterList.filter((employee) => employee.name.includes(filterValueLower))
    }
  }
  get charges() {
    return this.addChargesForm.controls["charges"] as FormArray;
  }
  getControls() {
    return (this.addChargesForm.controls["charges"] as FormArray).controls;
  }
  formArrayData: any = []
  
  setArrayForm() {
    this.addChargesForm = this.formBuilder.group(
      {
        charges: this.formBuilder.array([])
      },
    );

    this.formArrayData = []
    if (this.costItemList?.length === 0) {
      return false
    }

    this.addContainerData = this.addContainerData.sort((a, b) =>
      a['batchNo'] > b['batchNo'] ? 1 : -1);



    this.addContainerData?.map((container) => {

      this.costItemList?.map((res: any) => {
        var isInRes: boolean = false
        if (this.isEditable) {
        
          this.chargeData.map((x) => {
            if (x?.batchId === container?.batchId && x.chargeItemId === res?.costitemId) {
              res = x
              isInRes = true
            }

          })


        }

        let party = this.partyMasterList?.filter(
          (x) => x.gst === this.newvendorForm.get('select_vendor').value
        )[0]

        let isInState = this.checkGST(container);
        let amount = Number(
          (this.isEditable && isInRes ? res?.rate : res?.chargeAmount) *
          (res?.exchangeRate));
        let gstValue = this.isEditable ? res?.gst || 18 : res?.gst || 18
        let BillNumber = res?.vendor?.billNo;
        let unqContainer = []
         unqContainer =  [...new Map(container?.containers?.map(item => [item['containerNo'], item])).values()]
    
        let containerRemark1 = []
       
        let groupData = {
          billNo: BillNumber,
          vendorBillNo: [res?.vendorBillNo ? res?.vendorBillNo : []],
          isChecked: this.isEditable && isInRes ? res?.isChecked : this.checked(BillNumber),
          isSGST: isInState,
          enquiryitemId: res?.enquiryitemId,
          batchNo: container?.batchNo,
          batchId: container?.batchId,
          containers: [unqContainer],
          moveNumber : this.batchMultipleData?.filter((x)=> x?.batchId === container?.batchId)[0]?.moveNo,
          vesselName : this.batchMultipleData?.filter((x)=> x?.batchId === container?.batchId)[0]?.routeDetails?.finalVesselName,
          voyageName : this.batchMultipleData?.filter((x)=> x?.batchId === container?.batchId)[0]?.routeDetails?.finalVoyageName,
          container: container?.containerNumber,
          vendorbillNo: this.newvendorForm.get('bill_number').value,
          vendorbillDate: this.newvendorForm.get('bill_date').value,
          gstNumber: party?.gst,
          vendorName: party?.name,
          stateCode: party?.stateCode || "",
          sacCode: this.isEditable && isInRes ? res?.sacCode : res?.hsnCode || "",
          RCM: this.isEditable && isInRes ? res?.RCM : this.RCMCHECK(container),
          RCM_chargeble: this.isEditable && isInRes ? res?.RCM_chargeble : true,
          chargeItem: this.isEditable && isInRes ? res?.chargeItem : res?.costitemName,
          chargeItemId: this.isEditable && isInRes ? res?.chargeItemId : res?.costitemId,
          rate: this.isEditable && isInRes ? res?.rate : res?.chargeAmount,
          currency: res?.currency,
          exchangeRate: res?.exchangeRate,
          chargableAMT: amount.toFixed(2),
          taxApplied: isInState ? 'SGST' : 'IGST',
          gst: gstValue || 18,
          documentUrl: [this.isEditable && isInRes ? res?.documentUrl : res?.document],
          document: [this.isEditable && isInRes ? res?.document : res?.document],
          sgstAMT: isInState ? this.calcuSGST(amount, gstValue / 2 || 0) : '0.00',
          utgstAMT: isInState ? '0.00' : '0.00',
          cgstAMT: isInState ? this.calcuSGST(amount, gstValue / 2 || 0) : '0.00',
          igstAMT: isInState ? '0.00' : this.calcuIGST(amount, gstValue || 0),
          totalTAX: this.totalTAX(amount, gstValue),
          totalAMT: this.totalAMT(amount, gstValue),
          totalAMT_USD: this.totalAMT(amount, gstValue),
          remark: this.isEditable && isInRes ? res?.remark : containerRemark1?.toString()
        };
        this.formArrayData.push(groupData)
        if (!this.isEditable) {
          let vendor = res?.vendor?.vendorId.split(',').toString()
          if (vendor?.includes(this.newvendorForm.get('select_vendor').value?.toString())) {
            Object.keys((this.form).controls)
              .forEach(key => {
                (this.form).controls[key].disable();
                (this.form).controls['isChecked'].setValue(false)
              })
          }
        }



      })



    })
    this.addChargesForm = this.formBuilder.group(
      {
        charges: this.formBuilder.array(
          this.formArrayData.map((x) => {
            return this.formBuilder?.group(x)
          })
        )
      },
    );

    this.calculateTotal();
  }
  RCMCHECK(c) {

    if (c?.rcmCategory === "RCM Category Others" || c?.rcmCategory === 'RCM Category Specified') {
      return true
    } else {
      return false
    }
  }
  checkRMC(i, gst) {
    let gstAvaolable = this.partyMasterList?.filter(
      (x) => x.gst === this.newvendorForm.get('select_vendor').value
    )[0]?.gst;
    let control = this.addChargesForm?.controls?.charges['controls'][i]?.controls
    let chargeAMT = control?.chargableAMT?.value

    if (!gstAvaolable) {
      this.addChargesForm.controls?.charges['controls'][i].controls?.RCM.enable();
      this.addChargesForm.controls?.charges['controls'][i].controls?.gst.setValue(5)
      if (control?.isSGST?.value) {
        this.addChargesForm.controls?.charges['controls'][i].controls?.sgstAMT.setValue(this.RCM_SGST(chargeAMT, control?.gst?.value / 2 || 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.cgstAMT.setValue(this.RCM_SGST(chargeAMT, control?.gst?.value / 2 || 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.igstAMT.setValue(this.RCM_IGST(0, 0))
      } else {
        this.addChargesForm.controls?.charges['controls'][i].controls?.sgstAMT.setValue(this.RCM_SGST(0, 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.cgstAMT.setValue(this.RCM_SGST(0, 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.igstAMT.setValue(this.RCM_IGST(chargeAMT, control?.gst?.value || 0))
      }
      this.addChargesForm.controls?.charges['controls'][i].controls?.totalTAX.setValue(this.totalTAX(chargeAMT, control?.gst?.value))
      this.addChargesForm.controls?.charges['controls'][i].controls?.totalAMT.setValue(this.RCM_AMT(chargeAMT, control?.gst?.value))
      this.addChargesForm.controls?.charges['controls'][i].controls?.totalAMT_USD.setValue(this.RCM_AMT(chargeAMT, control?.gst?.value))

    } else {
      this.addChargesForm.controls?.charges['controls'][i].controls?.RCM?.disable();
      this.addChargesForm.controls?.charges['controls'][i].controls?.gst.setValue(gst)
      this.addChargesForm.controls?.charges['controls'][i].controls?.RCM.setValue(false)
      if (control?.isSGST?.value) {
        this.addChargesForm.controls?.charges['controls'][i].controls?.sgstAMT.setValue(this.calcuSGST(chargeAMT, control?.gst?.value / 2 || 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.cgstAMT.setValue(this.calcuSGST(chargeAMT, control?.gst?.value / 2 || 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.igstAMT.setValue(this.calcuIGST(0, 0))
      } else {
        this.addChargesForm.controls?.charges['controls'][i].controls?.sgstAMT.setValue(this.calcuSGST(0, 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.cgstAMT.setValue(this.calcuSGST(0, 0))
        this.addChargesForm.controls?.charges['controls'][i].controls?.igstAMT.setValue(this.calcuIGST(chargeAMT, control?.gst?.value || 0))
      }
      this.addChargesForm.controls?.charges['controls'][i].controls?.totalTAX.setValue(this.totalTAX(chargeAMT, control?.gst?.value))
      this.addChargesForm.controls?.charges['controls'][i].controls?.totalAMT.setValue(this.totalAMT(chargeAMT, control?.gst?.value))
      this.addChargesForm.controls?.charges['controls'][i].controls?.totalAMT_USD.setValue(this.totalAMT(chargeAMT, control?.gst?.value))

    }
  }
  gstNo() {
    return this.partyMasterList?.filter(
      (x) => x.gst === this.newvendorForm.get('select_vendor').value
    )[0]?.gst
  }
  calcuSGST(AMT, GST) { return (AMT * GST / 100).toFixed(2) }
  RCM_SGST(AMT, GST) { return (AMT * GST / 100).toFixed(2) }
  calcuIGST(AMT, GST) { return (AMT * GST / 100).toFixed(2) }
  RCM_IGST(AMT, GST) { return (AMT * GST / 100).toFixed(2) }
  totalTAX(AMT, GST) { return (Number(AMT * GST / 100)).toFixed(2) }
  totalAMT(AMT, GST) { return (Number(AMT) + Number(AMT * GST / 100)).toFixed(2) }
  RCM_AMT(AMT, GST) { return (Number(AMT) + Number(AMT * GST / 100)).toFixed(2) }

  chargableAMT(i) {

    this.charges?.controls?.forEach(element => {
      this.costItemList.forEach(element1 => {
        if (element?.value?.enquiryitemId === element1?.enquiryitemId) {
          if (element?.value?.rate > element1?.rate) {
            this.addChargesForm.controls?.charges['controls'][i].controls?.rate.setValue('')
            this.notification.create('info', `Rate should always be less than chargable amount '${element1?.rate}'`, '');
          }
        }
      })
    });

    let controls = this.addChargesForm?.controls?.charges['controls'][i]?.controls
    let chargeAMT = Number(controls?.exchangeRate?.value * controls?.rate?.value)
    this.addChargesForm.controls?.charges['controls'][i].controls?.chargableAMT.setValue(chargeAMT.toFixed(2))

    if (this.isSGST) {
      this.addChargesForm.controls?.charges['controls'][i].controls?.sgstAMT.setValue(this.calcuSGST(controls?.chargableAMT?.value, controls?.gst?.value / 2 || 0))
      this.addChargesForm.controls?.charges['controls'][i].controls?.cgstAMT.setValue(this.calcuSGST(controls?.chargableAMT?.value, controls?.gst?.value / 2 || 0))
      this.addChargesForm.controls?.charges['controls'][i].controls?.igstAMT.setValue(this.calcuIGST(0.00, 0))
    } else {
      this.addChargesForm.controls?.charges['controls'][i].controls?.sgstAMT.setValue(this.calcuSGST(0.00, 0))
      this.addChargesForm.controls?.charges['controls'][i].controls?.cgstAMT.setValue(this.calcuSGST(0.00, 0))
      this.addChargesForm.controls?.charges['controls'][i].controls?.igstAMT.setValue(this.calcuIGST(controls?.chargableAMT?.value, controls?.gst?.value || 0))
    }
    this.addChargesForm.controls?.charges['controls'][i].controls?.totalTAX.setValue(this.totalTAX(chargeAMT, controls?.gst?.value))
    this.addChargesForm.controls?.charges['controls'][i].controls?.totalAMT.setValue(this.totalAMT(controls?.chargableAMT?.value, controls?.gst?.value))
    this.addChargesForm.controls?.charges['controls'][i].controls?.totalAMT_USD.setValue(this.totalAMT(controls?.chargableAMT?.value, controls?.gst?.value))

    this.calculateTotal();

  }
  checkGST(res) {
    
   
    
    let batchData =  this.batchMultipleData.filter((x)=> x?.batchId == res?.batchId)[0]?.quotationDetails?.branchStateCode

    //  let loadPlaceId = this.isEditable ? res?.stateCode?.toLowerCase() : res?.stateCode?.toLowerCase();

    let vendorState = '';
    vendorState = this.partyMasterList?.filter(
      (x) => x.gst === this.newvendorForm.get('select_vendor').value
    )[0]?.stateCode?.toLowerCase()

   if (batchData?.toLowerCase() === vendorState) {
      this.isSGST = true;
      return true
    } else {
      this.isSGST = false;
      return false
    }
  }
  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {  }
    this.commonService.getSTList('location', payload)?.subscribe((res: any) => {
      this.locationList = res?.documents;
    });
  }
  filechange(event: any, i) {
    this.addChargesForm.controls?.charges['controls'][i].controls?.document.setValue(event.target.files[0]);
    this.addChargesForm.controls?.charges['controls'][i].controls?.documentUrl.setValue(event.target.files[0].name);
  }

  deleteCharge(content: any, vIndex: number, id?) {
    this.modalService
      .open(content, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            const itemData = this.costItemList?.filter((item) => item?.enquiryitemId !== id);
            this.costItemList = itemData;
            this.setArrayForm()
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  disabledDate = (current: Date): boolean => {
    if (this.newvendorForm.controls?.bill_date.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.newvendorForm.controls?.bill_date.value)
        ) < 0
      );
    else return false;
  };
  todayVendorBill() {
    return
    this.todayBillList = []
    let date = this.newvendorForm.controls?.bill_date?.value?.toISOString()
    this.filterBody = this.apiService.body;
    let must = [
      {
        match: {
          invoiceType: 'bills',
        },
      },
      {
        match: {
          invoiceDate: date?.split('T')[0],
        },
      },
    ];
    this.filterBody.query.bool.must = must;
    this.apiService
      .getFinanceList('invoice', this.filterBody)
      .subscribe((data) => {
        this.todayBillList = data.documents;
        this.checkInvoice()
      });
  }
  checkInvoice() {
    if (!this.newvendorForm.controls?.bill_date.value)
      return false
    this.uniqueBill = false
    this.todayBillList.forEach((element) => {
      if (element?.billNo === this.newvendorForm.controls?.bill_number.value &&
        this.newvendorForm.controls?.select_vendor.value === element?.vendorId) {
        this.uniqueBill = true
        this.notification.create('info', `Bill no already in use. please enter unique bill no`, '');
      }
    });
  }
  setVendor(i) {
    this.searchText = ''
    this.newvendorForm.controls?.select_vendor.setValue(i?.gst)
  }
  substring(item) {
    return item?.substring(0, 2).toUpperCase()
  }
  checkContainerData() {
    return
    let addContainerData = []
    this.newvendorForm.controls?.batchNo.value.forEach(element => {
      this.addContainerData.map((x) => {
        if (x.batchId === element) {
          addContainerData.push(x)
        }
      })
    });
    this.addContainerData = []
    this.addContainerData = addContainerData
  }

  setBatchNo(evt, check) {
    if (!this.newvendorForm.controls?.batchNo.value.includes(check.batchId)) {
      this.newvendorForm.controls?.batchNo.setValue([...this.newvendorForm.controls?.batchNo.value, check.batchId])
    }
    if (this.addContainerData.filter((x) => x?.containerNumber === check.containerNumber).length === 0) {

      if (this.addContainerData.filter((x) => x?.batchId === check.batchId).length === 0) {
        this.addContainerData.push({
          ...check,
          containers: [{ containerNo: check.containerNumber, containerId: check.containerId }]
        })
      } else {

        let findI = this.addContainerData.findIndex((x) => x?.batchId === check.batchId)
        this.addContainerData[findI].containers.push({ containerNo: check.containerNumber, containerId: check.containerId })
      }
    }
   
  }
  submitBatch() {
    this.searchBatch = '';
    this.selectedCostItems = [];
  }

  inNumber(a, b) {
    return Number(Number(a) + Number(b))
  }
  previouseName = ''
  chekRowSpan(i) {


    let first = (i * this.costItemLength) / this.costItemLength
    let addLen = first + this.costItemLength

    let final = addLen % this.costItemLength


    if (final === 0) {
      return true
    } else {
      return false
    }

  


 

  }

  previouseName1 = ''
  chekRowSpan1(i, name?) {
    let first = (i * this.costItemLength) / this.costItemLength
    let addLen = first + this.costItemLength
    let final = addLen % this.costItemLength
    if (name) {
      if (final === 0 && name !== this.previouseName1) {
        this.previouseName1 = name;
        return true
      } else {
        this.previouseName1 = name;
        return false
      }

    }
  }
  downloadFile(doc) {
    this.commonService.downloadDocuments('downloadfile',doc).subscribe(
      (fileData: Blob) => { 
        this.commonService.downloadDocumentsFile(fileData,doc); 
      },
      (error) => {
        console.error(error);
      }
    );
  }


  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile',doc)?.subscribe(
      (res: Blob) => {  
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob); 
        const pdfWindow = window.open(temp);
        pdfWindow.print();
      },
      (error) => {
        console.error(error);
      }
    );
  }

}
