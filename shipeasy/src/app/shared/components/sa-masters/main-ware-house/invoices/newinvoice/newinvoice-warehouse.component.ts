import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  Input,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { FinanceService } from 'src/app/services/Finance/finance.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { currentTime } from 'src/app/shared/util/date-time';
import { NumberToWordsService } from 'src/app/shared/util/mastersort';
// import { container } from 'aws-amplify';

@Component({
  selector: 'app-newinvoice-warehouse',
  templateUrl: './newinvoice-warehouse.component.html',
  styleUrls: ['./newinvoice-warehouse.component.scss'],
})
export class NewinvoiceComponentWareHouse implements OnInit {
  @Output() CloseInvoiceSection = new EventEmitter<string>();
  // @Input() isType: any;
  @Input() screen: any;
  @Input() isBatchInvoice: boolean;
  isType = window.location.href.split('?')[0].split('/').pop();
  submitted: boolean = false;
  isEdit: boolean = false;
  newReceiptForm: FormGroup;
  isExport: boolean = false;
  isImport: boolean = false;
  isTransport: boolean = false;
  type: any = 'sellerInvoice';
  urlParam: any;
  idToUpdate: any;
  branchList: any;
  currentUser: any;
  defaultCurrency: any;
  batchId: any;
  newInvoiceNo: string;
  constructor(
    private router: Router,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
    private _cognit: CognitoService,
    private _FinanceService: FinanceService,
    private route: ActivatedRoute,
    private profilesService: ProfilesService,
    private commonService: CommonService,
    private masterService: MastersService,
    private cognito: CognitoService,
    private numberToWordsService: NumberToWordsService,
    private commonfunction: CommonFunctions
  ) {
    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport =
      localStorage.getItem('isTransport') === 'true' ? true : false;

    this.route.params?.subscribe((params) => (this.urlParam = params));
    console.log(this.urlParam.id,"this.urlParam.id");
    

    this.currentUser = this.commonfunction.getActiveAgent();
    this.defaultCurrency =
      this.currentUser?.currency?.currencyCode?.toUpperCase();

    this.getBranchList();
  }

  selectedValue: string | null = null;
  listOfOption: string[] = [];
  readonly nzFilterOption = (): boolean => true;

  batchListCopy: any = [];
  search(e) {
    if (e) {
      const text1 = e.trim();
      const regex = new RegExp(text1, 'i');

      this.batchList = this.batchListCopy.filter(
        (batch) =>
          regex.test(batch.batchNo) ||
          regex.test(batch.mblNumber) ||
          batch.enquiryDetails.containersDetails.some((container) =>
            regex.test(container.containerNo)
          ) ||
          regex.test(batch.hblNumbers)
      );
    } else {
      this.batchList = this.batchListCopy;
    }
  }
  get f() {
    return this.newReceiptForm.controls;
  }

  getBranchList() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
      };
    this.commonService.getSTList('branch', payload)?.subscribe((data) => {
      this.branchList = data.documents;
      this.getBatchList();
    });
  }
  bankList: any = [];
  getBankList(e?) {
    if (!this.idToUpdate) {
      this.f.banks.setValue([]);
    }
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
        parentId: this.currentUser?.agentId,
      };

    this.commonService.getSTList('bank', payload)?.subscribe((data) => {
      this.bankList = data?.documents?.filter(
        (x) => x?.branchId == this.f.billToBranch.value || x.isDefaultBank
      );

      this.defaultBanks =
        data?.documents
          ?.filter((x) => x.isDefaultBank)
          ?.map((x) => x.bankName) || [];

      if (!this.idToUpdate) {
        this.f.banks.setValue(this.defaultBanks);
      }

      let data123 =
        this.bankList
          ?.filter((x) => this.newReceiptForm.value.banks.includes(x?.bankName))
          ?.map((bank) => bank?.bankName) || [];

      this.f.banks.setValue(data123);
    });
  }
  defaultBanks: any = [];
  currencyRate: any = {};
  getDefaultExRate() {
    let payload = {
      fromCurrency:
        this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd'
          ? 'INR'
          : 'USD',
      toCurrency:
        this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd'
          ? 'USD'
          : 'INR',
    };
    this.commonService
      .getExchangeRate('exchangeRate', payload)
      ?.subscribe((result) => {
        this.currencyRate = {
          ...this.currencyRate,
          [this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd'
            ? 'INR'
            : 'USD']:
            result[
              this.currentUser?.currency?.currencyName?.toLowerCase() == 'usd'
                ? 'USD'
                : 'INR'
            ],
        };
      });
  }
  formBuild(data?) {
    this.newReceiptForm = this.formBuilder.group({
      paymentNo: [data ? data?.invoiceNo : ''],
      customer: [data ? data?.invoiceToId : '', Validators.required],
      jobNo: [data ? data?.batchNo : ''],

      batchArray: [
        data
          ? data?.batchArray?.map((x) => {
              return x.batchId;
            }) || []
          : [],
        data?.withoutJob
          ? ''
          : !this.isBatchInvoice && this.type == 'buyerInvoice'
          ? Validators.required
          : '',
      ],

      billDate: [data ? data?.invoice_date : new Date(), Validators.required],
      invoiceDueDate: [data ? data?.invoiceDueDate : ''],
      billNo: [data ? data?.billNo : ''],
      packageNo: [data ? data?.packagesNo : ''],
      stateOfSupply: [data ? data?.stateOfSupply : ''],
      mbl: [data ? data?.mbl?.split(',') || [] : []],
      hbl: [data ? data?.hbl?.split(',') || [] : []],
      banks: [
        data ? [data?.bankName] : this.defaultBanks,
        this.type == 'sellerInvoice' ? Validators.required : '',
      ],
      paymentMode: [data ? data?.paymentModeId : ''],
      vessel: [''],
      voyage: [''],
      airLine: [''],
      flightNo: [''],
      vehicleNo: [''],
      paymentRefNo: [data ? data?.paymentreference_no : ''],
      invoiceRefNo: [
        data ? data?.invoiceNo : '',
        this.type == 'buyerInvoice' ? Validators.required : '',
      ],
      description: [data ? data?.remarks : ''],
      documentName: [data ? data?.pdfUrl : ''],
      roundOff: [data ? data?.roundOff : false],
      paid: [data ? data?.paid : false],
      shippingLine: [data ? data?.shippingLine : ''],
      loadPort: [''],
      pod: [''],
      shipper: [''],
      consignee: [''],
      containers: [data ? data?.containers : ''],
      discount: [data ? data?.discount || 0 : 0],
      tds: [data ? data?.tds || 0 : 0],
      tdsAmount: [data ? data?.tdsAmount || 0 : 0],
      paidAmount: [data ? data?.paidAmount : ''],
      balance: [data ? data?.balanceAmount : ''],
      taxAmount: [data ? data?.taxAmount : ''],
      totalAmount: [data ? data?.totalAmount : ''],
      placeOfReceipt: [data ? data?.placeOfReceipt : ''],
      billToBranch: [
        data ? data?.branchId : '',
        this.type == 'sellerInvoice' ? Validators.required : '',
      ],
      billFromBranch: [
        data ? data?.invoiceFromBranch : '',
        Validators.required,
      ],
      bankDetails: [data ? data?.bankDetails : ''],
      withoutJob: [data ? data?.withoutJob || false : false],
      charge: this.formBuilder.array([]),
    });
    if (this.isType === 'clone') {
      if (this.type == 'sellerInvoice') {
        this.paymentData = {
          ...this.paymentData,
          invoiceStatus: '',
        };
      }
      this.newReceiptForm.get('paymentNo').setValue('');
      this.newReceiptForm.get('invoiceRefNo').setValue('');
    }
    if (data) {
      setTimeout(() => {
        this.isResident = data ? data?.isResident : false;
        this.getListOfbillFrom();
      }, 2000);
    }
  }

  removeValidation() {
    if (this.newReceiptForm.get('withoutJob').value) {
      this.defaultCurrency =
        this.currentUser?.currency?.currencyCode?.toUpperCase();
      this.newReceiptForm.get('batchId').setValue('');
      this.newReceiptForm.get('mbl').setValue([]);
      // this.newReceiptForm.get('hbl').setValue([])
      this.newReceiptForm.get('packageNo').setValue('');
      this.costItemList = this.isEdit ? this.paymentData?.costItems : [];
      this.checkedList = this.isEdit ? this.paymentData?.costItems : [];
      this.baseCostItemsCopy = this.isEdit ? this.paymentData?.costItems : [];
      this.baseCostItems = this.isEdit ? this.paymentData?.costItems : [];

      this.addChargeOnTable();
      this.newReceiptForm.get('batchId').clearValidators();
      this.newReceiptForm.get('batchId').updateValueAndValidity();
    } else {
      this.newReceiptForm.get('batchId').setValidators(Validators.required);
      this.newReceiptForm.get('batchId').updateValueAndValidity();
      if (this.isBatchInvoice) {
        this.newReceiptForm.get('batchId').setValue(this.batchId);
      }
    }
  }
  warehousedataentryId: string = '';
  ngOnInit(): void {
    this.warehousedataentryId = this.route.snapshot.paramMap.get('id') || '';
    this.route.paramMap.subscribe(params => {
    this.warehousedataentryId = params.get('id') || '';
  });
    this.idToUpdate = this.urlParam?.moduleId;

    this.batchId = this.isBatchInvoice ? this.urlParam?.id : '';
    if (this.idToUpdate) {
      this.isEdit = true;
    }

    // if (this.isBatchInvoice) {
    //   this.type = this.route.snapshot?.queryParamMap.get('type')?.toString();
    // } else {
    //   if (this.urlParam.key == 'sale') {
    //     this.type = 'sellerInvoice'
    //   } else {
    //     this.type = 'buyerInvoice'
    //   }
    // }
    this.type = 'sellerInvoice';
    this.formBuild();
    if (this.type == 'buyerInvoice' && !this.isBatchInvoice) {
      this.multiBatch = true;
    } else {
      this.multiBatch = false;
    }
    // this.getBatchList();
    this.getBankList();

    this.getCustomerParty();
    this.getStateList();
    this.getpaymentMode();
    this.getCurrencyDropDowns();
    this.costItem();
    this.getCurrencyDropDowns();
    this.costItem();
    this.getLocationDropDowns();
    if (this.idToUpdate) {
      this.getRecieptList();
      this.getWarehouseDataEntryById(this.urlParam.id, 'edit');

    } else {
      this.GenerateLastInvoiceNumber();
      this.getWarehouseDataEntryById(this.urlParam.id, 'add');
    }
  }

  async getWarehouseDataEntryById(id, mode) {
    let payload = this.commonService?.filterList();
    if (payload?.query)
      payload.query = {
        warehousedataentryId: id,
      };

    await this.commonService
      ?.getSTList('warehousedataentry', payload)
      .subscribe((data) => {
        const dataEntryList = data?.documents[0];
        if (mode == 'add') {
          this.newReceiptForm.patchValue({
            jobNo: dataEntryList?.jobNo,
          });
          this.newReceiptForm.patchValue({
            shippingLine: dataEntryList?.shippingLineLedgerName,
          });
          this.newReceiptForm.patchValue({
            vessel: dataEntryList?.vesselName,
          });
        } else {
          this.newReceiptForm.patchValue({
            shippingLine: dataEntryList?.shippingLineLedgerName,
          });
          this.newReceiptForm.patchValue({
            vessel: dataEntryList?.vesselName,
          });
        }
      });
  }
  multiBatch: boolean = false;
  locationData: any = [];
  getLocationDropDowns() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
        masterType: {
          $in: ['YARD', 'CFS', 'ICD'],
        },
      };
    this.commonService.getSTList('location', payload)?.subscribe((res: any) => {
      this.locationData = res?.documents;
    });
  }
  paymentData: any;
  getRecieptList() {
    let payload = this.commonService.filterList();

    payload.query = {
      invoiceId: this.idToUpdate,
    };
    this.commonService.getSTList('invoice', payload).subscribe((data) => {
      this.paymentData = data.documents[0];
      this.type = this.paymentData?.type;
      this.formBuild(this.paymentData);
      this.costItemList = this.paymentData?.costItems;
      this.baseCostItems = this.paymentData?.costItems;
      this.checkedList = this.paymentData?.costItems;
      setTimeout(() => {
        if (this.paymentData?.withoutJob) {
          this.removeValidation();
          this.defaultCurrency =
            this.currentUser?.currency?.currencyCode?.toUpperCase();
          this.addChargeOnTable();
        }
        this.getBatchDetails();
      }, 2000);
    });
  }
  currencyList: any = [];
  chargeName: any = [];

  getCurrencyDropDowns() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
      };
    this.commonService.getSTList('currency', payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
    });
  }

  costItem() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
      };
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.chargeName = data.documents;
    });
  }

  paymentMode: any = [];
  chargeBasic: any = [];
  getpaymentMode() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
        typeCategory: {
          $in: ['paymentMode', 'chargeType'],
        },
      };
    this.commonService
      .getSTList('systemtype', payload)
      ?.subscribe((res: any) => {
        this.chargeBasic = res?.documents?.filter(
          (x) => x.typeCategory === 'chargeType'
        );
        this.paymentMode = res.documents?.filter(
          (x) => x.typeCategory === 'paymentMode'
        );
      });
  }
  customerList: any = [];
  getCustomerParty() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
        $and: [
          {
            'customerType.item_text': {
              $ne: 'Vendor',
            },
          },
        ],
      };
    this.commonService
      .getSTList('partymaster', payload)
      ?.subscribe((res: any) => {
        this.customerList = res?.documents;
      });
  }
  getBatchListFromParty(e) {
    if (this.isBatchInvoice) {
      return;
    }
    let shouldArray = [];
    let query =
      this.customerList?.find(
        (x) => x.partymasterId == this.newReceiptForm.get('customer').value
      )?.name || '';
    shouldArray.push(
      {
        'enquiryDetails.basicDetails.shipperName': {
          $regex: query,
          $options: 'i',
        },
      },
      {
        'enquiryDetails.basicDetails.consigneeName': {
          $regex: query,
          $options: 'i',
        },
      },
      {
        'enquiryDetails.basicDetails.agentName': {
          $regex: query,
          $options: 'i',
        },
      },
      {
        'enquiryDetails.routeDetails.shippingLineName': {
          $regex: query,
          $options: 'i',
        },
      },

      {
        'enquiryDetails.basicDetails.multiShipper.name': {
          $regex: query,
          $options: 'i',
        },
      },
      {
        'enquiryDetails.basicDetails.multiConsignee.name': {
          $regex: query,
          $options: 'i',
        },
      }
    );

    var parameter: any = {
      project: [],
      query: {
        status: true,
        isExport: this.isExport || this.isTransport,
        $or: shouldArray,
      },
      sort: {
        desc: ['createdOn'],
      },
      from: 0,
    };
    this.commonService.getSTList('batch', parameter)?.subscribe((data: any) => {
      this.batchList = data.documents;
      this.batchListCopy = data.documents;
    });
  }
  batchList: any = [];
  async getBatchList() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
        isExport: this.isExport || this.isTransport,
      };

    if (this.isBatchInvoice) {
      payload.query = {
        ...payload.query,
        batchId: this.batchId,
      };
      this.newReceiptForm.get('batchId').setValue(this.batchId);
    }
    this.commonService.getSTList('batch', payload)?.subscribe((data: any) => {
      this.batchList = data.documents;
      this.batchListCopy = data.documents;
      if (this.isEdit || this.isBatchInvoice) {
        this.getBatchDetails();
      }
    });
  }
  stateList: any = [];
  getStateList() {
    let payload = this.commonService.filterList();
    if (payload?.query)
      payload.query = {
        status: true,
      };

    this.commonService.getSTList('state', payload)?.subscribe((data: any) => {
      this.stateList = data.documents;
    });
  }
  mblList: any = [];
  hblList: any = [];
  batchDetails: any;
  enquiryDetails: any;
  activeFright: any = '';
  activeFrightAir: boolean = false;
  getBatchDetails(e?) {
    if (this.multiBatch) {
      //
    } else {
      if (!this.newReceiptForm.value.jobNo && this.batchList.length == 0) {
        return;
      }
      this.batchDetails = this.batchList?.find(
        (x) => x?.batchId == this.newReceiptForm.value.batchId
      );
      this.enquiryDetails = this.batchDetails?.enquiryDetails;
    }
    this.getblData();
    // this.defaultCurrency = this.batchDetails?.quotationDetails?.currencyShortName
    this.defaultCurrency =
      this.currentUser?.currency?.currencyCode?.toUpperCase();
    let container = [];
    this.enquiryDetails?.containersDetails?.filter((x) =>
      container.push(x?.containerNo)
    );

    this.activeFright =
      this.enquiryDetails?.basicDetails?.ShipmentTypeName?.toLowerCase() || '';
    this.activeFrightAir = this.activeFright == 'air' ? true : false;

    if (this.type == 'sellerInvoice') {
      this.getBankList();
    }
    if (this.newReceiptForm.get('withoutJob').value) {
      this.defaultCurrency =
        this.currentUser?.currency?.currencyCode?.toUpperCase();
    }
    if (!this.multiBatch) {
      // this.newReceiptForm.patchValue({
      //   billToBranch:
      //     this.paymentData?.branchId ||
      //     this.batchDetails?.quotationDetails?.branchId,
      //   shipper: this.enquiryDetails?.basicDetails?.shipperName,
      //   consignee: this.enquiryDetails?.basicDetails?.consigneeName,
      //   shippingLine: this.isTransport
      //     ? this.batchDetails?.quotationDetails?.carrierName
      //     : this.enquiryDetails?.routeDetails?.shippingLineName ||
      //       this.batchDetails?.quotationDetails?.carrierName,
      //   pod: this.enquiryDetails?.routeDetails?.destPortName,
      //   loadPort: this.enquiryDetails?.routeDetails?.loadPortName,
      //   vessel: this.batchDetails?.quotationDetails?.vesselName,
      //   voyage: this.batchDetails?.quotationDetails?.voyageNumber,
      //   containers: this.batchDetails?.containerNos || '',
      //   airLine: this.batchDetails?.quotationDetails?.carrierName || '',
      //   flightNo: this.batchDetails?.quotationDetails?.flightNo || '',
      //   vehicleNo: this.batchDetails?.quotationDetails?.vehicleNo || '',
      // });
      // this.getWarehouseDataEntryById(this.urlParam.id,"all");
    }
    if (!this.idToUpdate) {
      this.getCharges();
    } else {
      this.addChargeOnTable(true);
    }

    setTimeout(() => {
      this.checkGstType();
    }, 1000);
  }
  addChargeOnTable(noGST?) {
    const formArray = this.newReceiptForm.get('charge') as FormArray;
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }

    this.costItemList?.forEach((element, index) => {
      this.addChargeRow(element, index, noGST);
    });
  }
  baseCostItemsCopy: any = [];
  baseCostItems: any = [];
  costItemList = [];
  checkedList = [];
  getCharges() {
    this.costItemList = [];
    this.checkedList = [];
    this.baseCostItemsCopy = [];
    this.baseCostItems = [];
    let payload = this.commonService.filterList();
    if (this.type == 'buyerInvoice') {
      payload.query = {
        // "quotationId": this.batchDetails?.quotationId,
        $and: [
          {
            'buyEstimates.isInvoiceCreated': {
              $ne: true,
            },
          },
        ],
      };
    } else {
      payload.query = {
        // "quotationId": this.batchDetails?.quotationId,
        $and: [
          {
            'selEstimates.isInvoiceCreated': {
              $ne: true,
            },
          },
        ],
      };
    }

    if (this.multiBatch) {
      if (this.newReceiptForm.value.batchArray?.length == 0) {
        return;
      }

      let quoteData = [];
      let batchData = [];

      this.batchList?.filter((x) => {
        if (this.newReceiptForm.value.batchArray.includes(x?.batchId)) {
          if (x?.quickJob) {
            if (x?.batchId) batchData.push(x?.batchId);
          } else {
            if (x?.quotationId) quoteData.push(x?.quotationId);
          }
        }
      });
      if (batchData.length > 0) {
        payload.query = {
          ...payload.query,
          batchId: {
            $in: this.newReceiptForm.value.batchArray,
          },
        };
      }
      if (quoteData.length > 0) {
        payload.query = {
          ...payload.query,
          quotationId: {
            $in: quoteData,
          },
        };
      }
    } else {
      if (this.batchDetails?.quickJob) {
        if (!this.batchDetails?.batchId) {
          return;
        }
        payload.query = {
          ...payload.query,
          batchId: this.batchDetails?.batchId,
        };
      } else {
        if (!this.batchDetails?.quotationId) {
          return;
        }
        payload.query = {
          ...payload.query,
          quotationId: this.batchDetails?.quotationId,
        };
      }
    }

    this.commonService.getSTList('enquiryitem', payload).subscribe(
      (result) => {
        if (result?.documents.length > 0) {
          this.baseCostItems = result?.documents;
          this.baseCostItemsCopy = JSON.parse(
            JSON.stringify(result?.documents)
          );
          this.baseCostItems.map((x) => {
            delete x.sort,
              (x.isSelected = false),
              (x.buyEstimates['buyerInvoice'] = x.buyEstimates?.buyerInvoice
                ? x.buyEstimates?.buyerInvoice
                : this.type === 'buyerInvoice'
                ? true
                : false),
              (x.selEstimates['sellerInvoice'] = x.selEstimates?.sellerInvoice
                ? x.selEstimates?.sellerInvoice
                : this.type === 'sellerInvoice'
                ? true
                : false),
              (x.moveNumber = Number(x?.moveNumber || 0));
          });

          // if (this.type == 'buyerInvoice' && this.newReceiptForm.value.customer) {
          //   this.costItemList = this.baseCostItems?.filter((x) => (x.buyEstimates?.supplier === this.newReceiptForm.value.customer || x.buyEstimates?.supplier === ""))
          // } else {
          this.costItemList = this.baseCostItems;
          // }
          this.addChargeOnTable(true);
        } else {
          this.addChargeOnTable(true);
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  blData: any;
  getblData() {
    let payload = this.commonService.filterList();
    if (this.multiBatch) {
      payload.query = {
        batchId: {
          $in: this.newReceiptForm.value.batchArray,
        },
      };
    } else {
      payload.query = {
        batchId: this.batchDetails?.batchId,
      };
    }

    this.commonService.getSTList('bl', payload).subscribe((data: any) => {
      this.blData = data.documents;
      this.mblList = data.documents?.filter(
        (x) => x?.blType == 'MBL' || x?.blType == 'AWB'
      );
      this.hblList = data.documents?.filter(
        (x) => x?.blType == 'HBL' || x?.blType == 'HAWB'
      );
    });
  }
  calacPackages() {
    let totalNo = 0;
    const containers = [];
    this.hblList?.forEach((element) => {
      if (this.f.hbl.value.includes(element?.blNumber)) {
        element?.containers?.filter((y) => {
          totalNo += Number(y?.package || 0);
          containers.push(y?.containerNumber);
        });
      }
    });
    this.f.packageNo.setValue(totalNo);
    this.f.containers.setValue(containers?.join(','));
  }
  filename: any;
  file: any;
  extension: any;
  selectFile(event) {
    let filename = event.target.value.replace('C:\\fakepath\\', '');
    this.extension = filename.substr(filename.lastIndexOf('.'));
    this.filename = event.target.files[0].name;
    this.file = event.target.files[0];
  }
  onCloseBill(evt?) {
    const { id, key } = this.urlParam;
    const url = `/warehouse/main-ware-house/details/${id}/${key}`;
    this.router.navigate([url]);
  }

  saveCharge(res) {
    this.submitted = true;
    let dataInsert = [];
    let dataUpdate = [];
    this.getChargeControls().forEach((element) => {
      let batchDetails =
        this.batchListCopy?.find((x) => x?.batchId == element.value.batchId) ||
        {};

      if (
        element.value.enquiryitemId == '' ||
        element.value.enquiryitemId == null
      ) {
        let charge = {
          batchId: batchDetails?.batchId,
          enquiryId: '',
          batchNo: batchDetails?.batchNo || '',
          collectPort: batchDetails?.enquiryData?.loadPortName || '',
          quotationId: batchDetails.quotationId,
          agentadviceId: batchDetails?.agentadviceId,
          containerType: batchDetails?.enquiryData?.container_type || '',
          vesselName:
            batchDetails?.routeDetails?.finalVesselName?.toString() || '',
          voyageName:
            batchDetails?.routeDetails?.finalVoyageName?.toString() || '',
          moveNumber: batchDetails?.moveNo?.toString() || '',
          enquiryNumber:
            this.isExport || this.isTransport
              ? batchDetails?.enquiryNo
              : batchDetails?.uniqueRefNo,
          enqDate: batchDetails?.basicDetails?.enquiryDate || '',
          stcQuotationNo: batchDetails?.stcQuotationNo?.toString() || '',
          enqType: batchDetails?.basicDetails?.enquiryTypeId || '',
          tenantId: '1',
          enquiryitemId: element.value.enquiryitemId
            ? element.value.enquiryitemId
            : '',
          costitemGroup: element.value?.costitemGroup || '',
          costItemId: element.value.chargeName || '',
          accountBaseCode: element.value.accountBaseCode?.toString() || '',
          costItemName: this.chargeName?.filter(
            (x) => x?.costitemId === element.value.chargeName
          )[0]?.costitemName,
          costHeadId: element.value.costHeadId || '',
          costHeadName: element.value.costHeadName || '',
          exchangeRate: element.value.exchangeRate || '',
          currency: element.value.currency || '',
          amount: element.value.amount || '',
          baseAmount: element.value.baseAmount || '',
          basic:
            this.chargeBasic.filter(
              (x) => x?.systemtypeId == element.value.basic
            )[0]?.typeName || '',
          basicId: element.value.basic || '',
          tenantMargin: element.value.margin || 0,
          isInvoiceCreated: true,
          // invoiceStatus: res?.invoiceStatus,
          buyEstimates: {
            currencyId: element.value.currencyBuy || '',
            currency:
              this.currencyList
                ?.filter((x) => x?.currencyId == element.value.currencyBuy)[0]
                ?.currencyShortName?.toUpperCase() || '',
            exChangeRate: Number(element.value.buyExRate) || 0,
            rate: element.value.buyRate || 0,
            taxableAmount: element.value.buyTaxable || 0,
            amount: element.value.buyTotal || 0,
            totalAmount: element.value.buyTotalINR || 0,
            terms: element.value.buyTerm || '',
            supplier: this.newReceiptForm.value.customer || '',
            igst: element.value.buyIgst || 0,
            cgst: element.value.buyCgst || 0,
            sgst: element.value.buySgst || 0,
            buyerInvoice:
              this.type === 'buyerInvoice' ||
              this.type === 'salelInvoice' ||
              this.type === 'purchaseInvoice'
                ? true
                : false,
            invoiceNo:
              this.type === 'buyerInvoice'
                ? res?.invoiceNo
                : element?.value?.buyInvoice || null,
            invoiceId:
              this.type === 'buyerInvoice'
                ? res?.invoiceId
                : element?.value?.buyInvoiceId || null,
            isInvoiceCreated:
              this.type === 'buyerInvoice'
                ? true
                : element.value.buyisInvoiceCreated || false,
            isReceiptCreated:
              this.type === 'buyerInvoice'
                ? true
                : element.value.isReceiptCreatedBuy || false,
          },
          selEstimates: {
            currencyId: element.value.currencySell || '',
            currency:
              this.currencyList
                ?.filter((x) => x?.currencyId == element.value.currencySell)[0]
                ?.currencyShortName?.toUpperCase() || '',
            taxableAmount: element.value.sellTaxable || 0,
            exChangeRate: Number(element.value.sellExRate) || 0,
            rate: element.value.sellRate || 0,
            amount: element.value.sellTotal || 0,
            totalAmount: element.value.sellTotalINR || 0,
            terms: element.value.sellTerm || '',
            remarks: element.value.remarks || '',
            igst: element.value.sellIgst || 0,
            cgst: element.value.sellCgst || 0,
            sgst: element.value.sellSgst || 0,
            sellerInvoice: this.type === 'sellerInvoice' ? true : false,
            invoiceNo:
              this.type === 'sellerInvoice'
                ? res?.invoiceNo
                : element?.value?.sellInvoice || null,
            invoiceId:
              this.type === 'sellerInvoice'
                ? res?.invoiceId
                : element?.value?.sellInvoiceId || null,
            isInvoiceCreated:
              this.type === 'sellerInvoice'
                ? true
                : element.value.sellisInvoiceCreated || false,
            isReceiptCreated:
              this.type === 'sellerInvoice'
                ? true
                : element.value.isReceiptCreatedSell || false,
          },
          tax: [
            {
              taxAmount: Math.round(Number(element.value.taxAmount)) || 0,
              taxRate: Number(element.value.gst),
            },
          ],
          quantity: element.value.quantity ? element.value.quantity : '1',
          rate: element.value.rate ? Math.round(element.value.rate) : 0,
          stcAmount: element.value.stcAmount
            ? Math.round(element.value.stcAmount)
            : 0,
          jmbAmount: element.value.jmbAmount
            ? Math.round(element.value.jmbAmount)
            : 0,
          payableAt: element.value.payableAt ? element.value.payableAt : '',
          gst: Number(element.value.gst) || 0,
          gstType: this.gstType || 'igst',
          totalAmount: Math.round(element.value.totalAmount) || 0,
          chargeTerm: element.value.chargeTerm || '',
          remarks: element.value.remarks ? element.value.remarks : '',
          containerNumber: element.value.containerNumber || [],
          // shippingLine: element.value.shippingLine || '',
          taxApplicability: element.value.taxApplicability || '',
          hsnCode:
            this.chargeName
              ?.filter((x) => x?.costitemId == element.value.chargeName)[0]
              ?.hsnCode?.toString() || '',
          isPrincipleCreated: element.value.isPrincipleCreated || false,
          isEnquiryCharge: false,
        };
        dataInsert.push(charge);
      } else {
        let charge = {
          batchId: batchDetails?.batchId,
          enquiryId: '',
          batchNo: batchDetails?.batchNo || '',
          collectPort: batchDetails?.enquiryData?.loadPortName || '',
          containerType: batchDetails?.enquiryData?.container_type || '',
          vesselName:
            batchDetails?.routeDetails?.finalVesselName?.toString() || '',
          quotationId: batchDetails.quotationId,
          agentadviceId: batchDetails?.agentadviceId,
          voyageName:
            batchDetails?.routeDetails?.finalVoyageName?.toString() || '',
          moveNumber: batchDetails?.moveNo?.toString() || '',
          enquiryNumber:
            this.isExport || this.isTransport
              ? batchDetails?.enquiryNo
              : batchDetails?.uniqueRefNo,
          enqDate: batchDetails?.basicDetails?.enquiryDate || '',
          stcQuotationNo: batchDetails?.stcQuotationNo?.toString() || '',
          enqType: batchDetails?.basicDetails?.enquiryTypeId || '',
          tenantId: '1',
          enquiryitemId: element.value.enquiryitemId
            ? element.value.enquiryitemId
            : '',
          costitemGroup: element.value?.costitemGroup || '',
          costItemId: element.value.chargeName || '',
          accountBaseCode: element.value.accountBaseCode?.toString() || '',
          costItemName: this.chargeName?.filter(
            (x) => x?.costitemId === element.value.chargeName
          )[0]?.costitemName,
          costHeadId: element.value.costHeadId || '',
          costHeadName: element.value.costHeadName || '',
          exchangeRate: element.value.exchangeRate || '',
          currency: element.value.currency || '',
          amount: element.value.amount || '',
          baseAmount: element.value.baseAmount || '',
          basic:
            this.chargeBasic.filter(
              (x) => x?.systemtypeId == element.value.basic
            )[0]?.typeName || '',
          basicId: element.value.basic || '',
          tenantMargin: element.value.margin || 0,
          isInvoiceCreated: true,
          invoiceStatus: res?.invoiceStatus,
          buyEstimates: {
            currencyId: element.value.currencyBuy || '',
            currency:
              this.currencyList
                ?.filter((x) => x?.currencyId == element.value.currencyBuy)[0]
                ?.currencyShortName?.toUpperCase() || '',
            exChangeRate: Number(element.value.buyExRate) || 0,
            rate: element.value.buyRate || 0,
            amount: element.value.buyTotal || 0,
            taxableAmount: element.value.buyTaxable || 0,
            totalAmount: element.value.buyTotalINR || 0,
            terms: element.value.buyTerm || '',
            supplier: this.newReceiptForm.value.customer || '',
            igst: element.value.buyIgst || 0,
            cgst: element.value.buyCgst || 0,
            sgst: element.value.buySgst || 0,
            buyerInvoice:
              this.type === 'buyerInvoice' ||
              this.type === 'salelInvoice' ||
              this.type === 'purchaseInvoice'
                ? true
                : false,
            invoiceNo:
              this.type === 'buyerInvoice'
                ? res?.invoiceNo
                : element?.value?.buyInvoice || null,
            invoiceId:
              this.type === 'buyerInvoice'
                ? res?.invoiceId
                : element?.value?.buyInvoiceId || null,
            isInvoiceCreated:
              this.type === 'buyerInvoice'
                ? true
                : element.value.buyisInvoiceCreated || false,
            isReceiptCreated:
              this.type === 'buyerInvoice'
                ? true
                : element.value.isReceiptCreatedBuy || false,
          },
          selEstimates: {
            currencyId: element.value.currencySell || '',
            currency:
              this.currencyList
                ?.filter((x) => x?.currencyId == element.value.currencySell)[0]
                ?.currencyShortName?.toUpperCase() || '',
            taxableAmount: element.value.sellTaxable || 0,
            exChangeRate: Number(element.value.sellExRate) || 0,
            rate: element.value.sellRate || 0,
            amount: element.value.sellTotal || 0,
            totalAmount: element.value.sellTotalINR || 0,
            terms: element.value.sellTerm || '',
            remarks: element.value.remarks || '',
            igst: element.value.sellIgst || 0,
            cgst: element.value.sellCgst || 0,
            sgst: element.value.sellSgst || 0,
            sellerInvoice: this.type === 'sellerInvoice' ? true : false,
            invoiceNo:
              this.type === 'sellerInvoice'
                ? res?.invoiceNo
                : element?.value?.sellInvoice || null,
            invoiceId:
              this.type === 'sellerInvoice'
                ? res?.invoiceId
                : element?.value?.sellInvoiceId || null,
            isInvoiceCreated:
              this.type === 'sellerInvoice'
                ? true
                : element.value.sellisInvoiceCreated || false,
            isReceiptCreated:
              this.type === 'sellerInvoice'
                ? true
                : element.value.isReceiptCreatedSell || false,
          },
          tax: [
            {
              taxAmount: Math.round(Number(element.value.taxAmount)) || 0,
              taxRate: Number(element.value.gst),
            },
          ],
          quantity: element.value.quantity ? element.value.quantity : '1',
          rate: element.value.rate ? Math.round(element.value.rate) : 0,
          stcAmount: element.value.stcAmount
            ? Math.round(element.value.stcAmount)
            : 0,
          jmbAmount: element.value.jmbAmount
            ? Math.round(element.value.jmbAmount)
            : 0,
          payableAt: element.value.payableAt ? element.value.payableAt : '',
          gst: Number(element.value.gst) || 0,
          gstType: this.gstType || 'igst',
          totalAmount: Math.round(element.value.totalAmount) || 0,
          chargeTerm: element.value.chargeTerm || '',
          remarks: element.value.remarks ? element.value.remarks : '',
          containerNumber: element.value.containerNumber || [],
          shippingLine: element.value.shippingLine || '',
          taxApplicability: element.value.taxApplicability || '',
          hsnCode:
            this.chargeName
              ?.filter((x) => x?.costitemId == element.value.chargeName)[0]
              ?.hsnCode?.toString() || '',

          isPrincipleCreated: element.value.isPrincipleCreated || false,
          isEnquiryCharge: element.value.isEnquiryCharge || false,
        };
        dataUpdate.push(charge);
      }
    });

    if (dataInsert.length > 0) {
      this.commonService
        .batchInsert('enquiryitem/batchinsert', dataInsert)
        .subscribe();
    }
    if (dataUpdate.length > 0) {
      this.commonService
        .batchUpdate('enquiryitem/batchupdate', dataUpdate)
        .subscribe();
    }
  }

  billFromBranchList = [];
  getListOfbillFrom(e?) {
    this.billFromBranchList =
      this.customerList?.find(
        (x) =>
          x.partymasterId === this.newReceiptForm.controls['customer'].value
      )?.branch || [];
  }

  isResident: boolean = true;
  getCustomerDetails() {
    let customerData =
      this.billFromBranchList?.filter(
        (x) =>
          x.branch_name === this.newReceiptForm?.get('billFromBranch').value
      )[0] || '';
    this.newReceiptForm
      ?.get('bankDetails')
      .setValue(
        `Bank Name - ${customerData?.bankNameText} ,Account No. - ${customerData?.cust_acc_no}`
      );
    this.newReceiptForm
      ?.get('stateOfSupply')
      .setValue(customerData?.placeofSupply);

    this.isResident = customerData.customerStatus == 'Resident' ? true : false;
  }

  getFutureDate(months: number): any {
    const currentDate = new Date();
    const future = new Date(
      currentDate.setMonth(currentDate.getMonth() + months)
    );
    return future;
  }
  onSave(flag) {
    this.submitted = true;

    const invalidControls = [];
    const controls = this.newReceiptForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalidControls.push(name);
      }
    }
    console.log('Invalid Controls:', invalidControls);
    if (this.newReceiptForm.invalid) {
      return false;
    }
    this.checkGstType();
    if ((this.newReceiptForm.get('charge') as FormArray).invalid) {
      this.notification.create('error', 'Please fill charge table fields', '');
      return false;
    }

    if (this.getChargeControlsLength() == 0) {
      this.notification.create('error', 'Add at least one charge item', '');
      return false;
    }
    const chargeArray = [];
    const hsnArray = [];

    let groupedHsnArray = [];
    this.getChargeControls().forEach((element) => {
      let charge = {
        tenantId: '1',
        enquiryitemId: element.value.enquiryitemId
          ? element.value.enquiryitemId
          : '',
        quotationId: this.batchDetails?.quotationDetails?.quotationId || '',
        enqDate: new Date() || '',
        batchId: this.batchDetails?.batchId || '',
        enquiryId: '',
        batchNo: this.batchDetails?.batchNo || '',
        collectPort: this.batchDetails?.enquiryData?.loadPortName || '',
        containerType: this.batchDetails?.enquiryData?.container_type || '',
        vesselName:
          this.batchDetails?.routeDetails?.finalVesselName?.toString() || '',
        agentadviceId: this.batchDetails?.agentadviceId,
        voyageName:
          this.batchDetails?.routeDetails?.finalVoyageName?.toString() || '',
        moveNumber: this.batchDetails?.moveNo?.toString() || '',
        enquiryNumber:
          this.isExport || this.isTransport
            ? this.batchDetails?.enquiryNo || ''
            : this.batchDetails?.uniqueRefNo || '',
        stcQuotationNo: this.batchDetails?.stcQuotationNo?.toString() || '',
        costitemGroup: element.value?.costitemGroup || '',
        enqType: 'Export',
        costItemId: element.value.chargeName || '',
        accountBaseCode: element.value.accountBaseCode?.toString() || '',
        costItemName: this.chargeName?.filter(
          (x) => x?.costitemId === element.value.chargeName
        )[0]?.costitemName,
        costHeadId: element.value.costHeadId || '',
        costHeadName: element.value.costHeadName || '',
        exchangeRate: element.value.exchangeRate || '',
        currency: element.value.currency || '',
        amount: element.value.amount || '',
        baseAmount: element.value.baseAmount || '',
        basic:
          this.chargeBasic?.filter(
            (x) => x?.systemtypeId == element.value.basic
          )[0]?.typeName || '',
        basicId: element.value.basic || '',
        isInvoiceCreated: true,
        tenantMargin: element.value.margin || 0,
        buyEstimates: {
          currencyId: element.value.currencyBuy || '',
          currency:
            this.currencyList
              ?.filter((x) => x?.currencyId == element.value.currencyBuy)[0]
              ?.currencyShortName?.toUpperCase() || '',
          exChangeRate: Number(element.value.buyExRate) || 0,
          rate: element.value.buyRate || 0,
          amount: element.value.buyTotal || 0,
          taxableAmount: element.value.buyTaxable || 0,
          totalAmount: element.value.buyTotalINR || 0,
          terms: element.value.buyTerm || '',
          supplier: this.newReceiptForm.value.customer || '',
          igst: element.value.buyIgst || 0,
          cgst: element.value.buyCgst || 0,
          sgst: element.value.buySgst || 0,
          invoiceNo: element?.value?.buyInvoice || null,
          invoiceId: element?.value?.buyInvoiceId || null,
          isInvoiceCreated: element?.value?.buyisInvoiceCreated || false,
          buyerInvoice: element?.value?.buyerInvoice || false,
          isReceiptCreated:
            this.type === 'buyerInvoice'
              ? true
              : element.value.isReceiptCreatedBuy || false,
        },
        selEstimates: {
          currencyId: element.value.currencySell || '',
          currency:
            this.currencyList
              ?.filter((x) => x?.currencyId == element.value.currencySell)[0]
              ?.currencyShortName?.toUpperCase() || '',

          exChangeRate: Number(element.value.sellExRate) || 0,
          rate: element.value.sellRate || 0,
          amount: element.value.sellTotal || 0,
          taxableAmount: element.value.sellTaxable || 0,
          totalAmount: element.value.sellTotalINR || 0,
          terms: element.value.sellTerm || '',
          remarks: element.value.remarks || '',
          igst: element.value.sellIgst || 0,
          cgst: element.value.sellCgst || 0,
          sgst: element.value.sellSgst || 0,
          invoiceNo: element?.value?.sellInvoice || null,
          invoiceId: element?.value?.sellInvoiceId || null,
          isInvoiceCreated: element.value.sellisInvoiceCreated || false,
          sellerInvoice: element.value.sellerInvoice || false,
          isReceiptCreated:
            this.type === 'sellerInvoice'
              ? true
              : element.value.isReceiptCreatedSell || false,
        },
        tax: [
          {
            taxAmount: Math.round(Number(element.value.taxAmount)) || 0,
            taxRate: Number(element.value.gst),
          },
        ],
        quantity: element.value.quantity ? element.value.quantity : '1',
        rate: element.value.rate ? Math.round(element.value.rate) : 0,
        stcAmount: element.value.stcAmount
          ? Math.round(element.value.stcAmount)
          : 0,
        jmbAmount: element.value.jmbAmount
          ? Math.round(element.value.jmbAmount)
          : 0,
        payableAt: element.value.payableAt ? element.value.payableAt : '',
        gst: Number(element.value.gst) || 0,
        gstType: this.gstType || 'igst',
        totalAmount: Math.round(element.value.totalAmount) || 0,
        chargeTerm: element.value.chargeTerm || '',
        remarks: element.value.remarks ? element.value.remarks : '',
        containerNumber: element.value.containerNumber || [],
        shippingLine: element.value.shippingLine || '',
        taxApplicability: element.value.taxApplicability || '',
        hsnCode:
          this.chargeName
            ?.filter((x) => x?.costitemId == element.value.chargeName)[0]
            ?.hsnCode?.toString() || '',
        isEnquiryCharge: true,
      };

      hsnArray.push({
        hsnCode:
          this.chargeName
            ?.filter((x) => x?.costitemId == element.value.chargeName)[0]
            ?.hsnCode?.toString() || '',
        taxableAmount:
          this.type == 'buyerInvoice'
            ? element.value.buyTaxable || 0
            : element.value.sellTaxable || 0,
        taxRate: Number(element.value.gst),
        totalAmount:
          this.type == 'buyerInvoice'
            ? element.value.buyTotalINR || 0
            : element.value.sellTotalINR || 0,
        igst:
          this.type == 'buyerInvoice'
            ? element.value.buyIgst || 0
            : element.value.sellIgst || 0,
        cgst:
          this.type == 'buyerInvoice'
            ? element.value.buyCgst || 0
            : element.value.sellCgst || 0,
        sgst:
          this.type == 'buyerInvoice'
            ? element.value.buySgst || 0
            : element.value.sellSgst || 0,
        gstType: this.gstType || 'igst',
      });
      chargeArray.push(charge);
    });

    const groupedHsnData = hsnArray.reduce((acc, item) => {
      const hsnCode = item.hsnCode || 'N/A';

      if (!acc[hsnCode]) {
        acc[hsnCode] = {
          hsnCode,
          taxableAmount: 0,
          totalAmount: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          gstType: item.gstType || 'igst',
          taxRate: item.taxRate,
        };
      }

      acc[hsnCode].taxableAmount += Number(item.taxableAmount);
      acc[hsnCode].totalAmount += Number(item.totalAmount);
      acc[hsnCode].igst += Number(item.igst);
      acc[hsnCode].cgst += Number(item.cgst);
      acc[hsnCode].sgst += Number(item.sgst);

      return acc;
    }, {});

    // groupedHsnArray = Object.values(groupedHsnData);

    if (this.file !== undefined) {
      const formData = new FormData();
      formData.append('file', this.file, `${this.file.name}`);
      formData.append('name', `${this.file.name}`);
      this.commonService.uploadDocuments('uploadfile', formData).subscribe();
      // this.commonService.uploadFile(this.file, this.filename, "reciept");
      this.newReceiptForm.value.documentName = `${this.file.name}`;
    }

    let paymentData = this.paymentMode.filter(
      (x) => x?.systemtypeId === this.newReceiptForm.get('paymentMode').value
    );

    let branchDetails =
      this.billFromBranchList?.find(
        (x) =>
          x?.branch_name === this.newReceiptForm?.get('billFromBranch').value
      ) || '';
    const newInvoice = {
      orgId: this.commonfunction.getAgentDetails().orgId,
      batchId: this.urlParam.id, //warehousedataentryId
      tenantId: '1',
      invoiceId: '',
      // "invoice_date": this.convertDate(this.newReceiptForm.value.invoice_date),
      // "invoiceDueDate": this.convertDate(this.newReceiptForm.value.billdue_date),

      invoice_date: this.newReceiptForm.value.billDate,
      type: this.type,
      batchNo: this.newReceiptForm.value.jobNo, //warehouse current batch no

      invoiceType: 'B2B',
      remarks: this.newReceiptForm.value.description || '',
      invoiceNo: this.newInvoiceNo,

      invoiceToGst: branchDetails?.tax_number || '',

      invoiceToId: this.newReceiptForm.value.customer || '',
      invoiceToName:
        this.customerList?.filter(
          (x) => x.partymasterId === this.newReceiptForm.value.customer
        )[0]?.name || '',

      invoiceToBranch: this.newReceiptForm.value.billFromBranch || '',
      invoiceToBranchName: this.newReceiptForm.value.billFromBranch || '',
      invoiceToBranchAddress:
        branchDetails?.branch_address +
          ',' +
          branchDetails?.branch_city +
          ',' +
          branchDetails?.branch_stateName +
          ',' +
          branchDetails?.branch_countryName +
          '-' +
          branchDetails?.pinCode || '',

      // batchArray:
      //   this.isBatchInvoice && this.type == 'buyerInvoice'
      //     ? [
      //         {
      //           batchNo: this.batchList.filter(
      //             (x) => x?.batchId === this.newReceiptForm.value.batchId
      //           )[0]?.batchNo,
      //           batchId: this.newReceiptForm.value.batchId,
      //         },
      //       ]
      //     : this.batchList
      //         ?.filter((x) =>
      //           this.newReceiptForm.value.batchArray.includes(x?.batchId)
      //         )
      //         .map((m) => {
      //           return {
      //             batchId: m?.batchId,
      //             batchNo: m?.batchNo,
      //           };
      //         }) || [],

      branchId:
        this.type == 'buyerInvoice'
          ? this.newReceiptForm.value.withoutJob
            ? this.branchList[0]?.branchId || ''
            : this.batchDetails?.quotationDetails?.branchId || ''
          : this.newReceiptForm.value.billToBranch || '',
      branchName:
        this.type == 'buyerInvoice'
          ? this.newReceiptForm.value.withoutJob
            ? this.branchList[0]?.branchName || ''
            : this.branchList?.find(
                (x) =>
                  x.branchId === this.batchDetails?.quotationDetails?.branchId
              )?.branchName || ''
          : this.branchList?.find(
              (x) => x.branchId === this.newReceiptForm.value.billToBranch
            )?.branchName || '',
      branchGst:
        this.type == 'buyerInvoice'
          ? this.newReceiptForm.value.withoutJob
            ? this.branchList[0]?.taxId || ''
            : this.branchList?.find(
                (x) =>
                  x.branchId === this.batchDetails?.quotationDetails?.branchId
              )?.taxId || ''
          : this.branchList?.find(
              (x) => x.branchId === this.newReceiptForm.value.billToBranch
            )?.taxId || '',

      invoiceFromId: this.newReceiptForm.value.customer,
      invoiceFromName:
        this.customerList?.filter(
          (x) => x.partymasterId === this.newReceiptForm.value.customer
        )[0]?.name || '',

      invoiceFromBranch: this.newReceiptForm.value.billFromBranch || '',
      invoiceFromBranchName: this.newReceiptForm.value.billFromBranch || '',
      invoiceFromBranchAddress:
        branchDetails?.branch_address +
          ',' +
          branchDetails?.branch_city +
          ',' +
          branchDetails?.branch_stateName +
          ',' +
          branchDetails?.branch_countryName +
          '-' +
          branchDetails?.pinCode || '',

      billTo: this.newReceiptForm.value.customer || '',

      coName: '',
      coAddress: '',
      moveNo: '',
      gstNo: '',
      userStateCode: '',
      userPinCode: '',
      userLocation: '',

      backDate: this.newReceiptForm.value.backDate,
      isBackDate: this.newReceiptForm.value.isBackDate,

      tax: [
        {
          taxAmount: 0,
          taxRate: 0,
          taxName: '',
        },
      ],

      shipperAddress: {
        stateName: '',
        stateCode: '',
      },

      // "blId": this.newReceiptForm.value.bl || '',
      // "blName": this.blData?.filter(x => x.blId === this.newReceiptForm.value.bl)[0]?.blNumber || '',

      consigneeId:
        this.batchDetails?.enquiryDetails?.basicDetails?.consigneeId || '',
      consigneeName:
        this.batchDetails?.enquiryDetails?.basicDetails?.consigneeName || '',

      placeOfSupply: '',
      placeOfSupplyId: '',

      advancePayment: 0,
      advancePercentage: 0,

      costItems: chargeArray || [],

      shipperId:
        this.batchDetails?.enquiryDetails?.basicDetails?.shipperId || '',
      shipperName:
        this.batchDetails?.enquiryDetails?.basicDetails?.shipperName || '',

      paymentStatus: 'Unpaid',
      paidAmount: this.newReceiptForm.value.paidAmount || 0,
      jobNumber: '',
      printBank: false,
      jobId: '',
      paymentTerms: this.newReceiptForm.value.payment_terms || 1,
      bankDetails: this.newReceiptForm.value.bankDetails || '',

      withoutJob: this.newReceiptForm.value.withoutJob,
      supplier: this.newReceiptForm.value.customer,
      supplierName:
        this.customerList?.filter(
          (x) => x.partymasterId === this.newReceiptForm.value.customer
        )[0]?.name || '',
      supplierAddress: '',

      bankType: 'local',
      voyageNumber: this.newReceiptForm.value.voyage || '',
      vesselId: this.batchDetails?.quotationDetails?.vesselId || '',
      isSez: 'N',
      vesselName: this.batchDetails?.quotationDetails?.vesselName || '',

      carrierName: this.batchDetails?.quotationDetails?.carrierName || '',
      carrierShortName:
        this.batchDetails?.quotationDetails?.carrierShortName ||
        this.customerList?.filter(
          (x) =>
            x?.partymasterId == this.batchDetails?.quotationDetails?.carrierId
        )[0]?.partyShortcode ||
        '',
      flightNo: this.batchDetails?.quotationDetails?.flightNo || '',
      vehicleNo: this.batchDetails?.quotationDetails?.vehicleNo || '',

      placeOfReceipt: this.newReceiptForm.value.placeOfReceipt || '',
      placeOfReceiptName:
        this.locationData?.filter(
          (x) => x.locationId === this.newReceiptForm.value.placeOfReceipt
        )[0]?.locationName || '',
      paymentModeId: this.newReceiptForm.value.paymentMode || '',
      paymentMode: paymentData[0]?.typeName || '',

      serviceDatefrom: new Date(),
      serviceDateTill: new Date(),

      taxNumber: '',

      isExport: this.isExport || this.isTransport,
      status: true,
      statusOfinvoice: this.type == 'sellerInvoice' ? flag : 'Approved',
      holdPosting: true,
      invoiceStatus: this.type == 'sellerInvoice' ? flag : 'Approved',
      principleBill: false,
      taxApplicability: '',
      gst_invoice_type: '',
      gstr: '',
      gstType: this.gstType || 'igst',

      invoiceAmount: this.newReceiptForm.value.totalAmount?.toString() || '',
      invoiceAmountText:
        this.numberToWordsService.convertToWords(
          this.newReceiptForm.value.totalAmount || 0
        ) || '',
      invoiceTaxAmount: this.newReceiptForm.value.taxAmount?.toString() || '',
      pod: this.enquiryDetails?.routeDetails?.destPortName || '',
      pol: this.enquiryDetails?.routeDetails?.loadPortName || '',
      placeOfDelivery: this.enquiryDetails?.routeDetails?.destPortName || '',

      bankName:
        this.type == 'buyerInvoice'
          ? branchDetails?.bankNameText
          : this.bankList
              ?.filter((x) =>
                this.newReceiptForm.value.banks.includes(x?.bankName)
              )
              ?.map((bank) => bank?.bankName)
              ?.toString() || '',
      bankId:
        this.type == 'buyerInvoice'
          ? branchDetails?.bankName
          : this.bankList
              ?.filter((x) =>
                this.newReceiptForm.value.banks.includes(x?.bankName)
              )
              ?.map((bank) => bank?.bankId)
              ?.toString() || '',
      banks:
        this.bankList
          ?.filter((x) => this.newReceiptForm.value.banks.includes(x?.bankName))
          ?.map((bank) => ({
            iscCode: bank?.ifscCode || '',
            bankName: bank?.bankName || '',
            accountNO: bank?.accountNo || '',
            bankId: bank?.bankId || '',
          })) || [],

      isResident: this.isResident,
      discount: this.newReceiptForm.value.discount || 0,
      tds: this.newReceiptForm.value.tds || 0,
      tdsAmount: this.newReceiptForm.value.tdsAmount || 0,
      taxAmount: Number(this.newReceiptForm.value.taxAmount) || 0,
      balanceAmount: Number(this.newReceiptForm.value.balance) || 0,
      warehousedataentryId: this.warehousedataentryId || '',
      roundOff: this.newReceiptForm.value.roundOff,
      paid: this.newReceiptForm.value.paid || 0,
      packagesNo: this.newReceiptForm.value.packageNo || '0',
      mbl: this.newReceiptForm.value.mbl.toString() || '',
      mblName: this.newReceiptForm.value.mbl.toString() || '',
      hbl: this.newReceiptForm.value.hbl.toString() || '',
      hblName: this.newReceiptForm.value.hbl.toString() || '',
      stateOfSupply: this.newReceiptForm.value.stateOfSupply || '',
      stateOfSupplyName:
        this.stateList?.filter(
          (x) => x?.stateId === this.newReceiptForm.value.stateOfSupply
        )[0]?.typeDescription || '',
      containers: this.newReceiptForm.value.containers || '',

      pdfUrl: this.newReceiptForm.value.documentName || '',

      billNo: this.newReceiptForm.value.billNo,
      paymentreference_no: this.newReceiptForm.value.paymentRefNo,
      invoiceRefNo: this.newReceiptForm.value.invoiceRefNo || '',
      currencyId:
        this.batchDetails?.quotationDetails?.currencyId ||
        this.currentUser?.currency?.currencyId ||
        '',
      currency:
        this.defaultCurrency ||
        this.currentUser?.currency?.currencyCode?.toUpperCase() ||
        '',

      hsnList: groupedHsnArray || [],

      multiBatch: this.multiBatch || false,
    };

    if (this.idToUpdate && this.isType === 'edit') {
      //this.idToUpdate && this.isType ==='edit'
      this.commonService
        .UpdateToST(`invoice/${this.idToUpdate}`, {
          ...newInvoice,
          invoiceId: this.idToUpdate,
          invoiceNo: this.paymentData?.invoiceNo,
        })
        .subscribe(
          (data: any) => {
            if (data) {
              if (!this.newReceiptForm.value.withoutJob) {
                this.saveCharge(data);
              }

              this.notification.create('success', 'Update Successfully', '');
              this.onCloseBill();
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
    } else {
      this.commonService.addToST('invoice', newInvoice).subscribe(
        (data: any) => {
          if (data) {
            if (!this.newReceiptForm.value.withoutJob) {
              this.saveCharge(data);
            }
            this.notification.create('success', 'Saved Successfully', '');
            this.onCloseBill();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }

  isIndian() {
    if (this.cognito.isIndianCustomer()) {
      return true;
    } else {
      return false;
    }
  }

  GenerateLastInvoiceNumber() {
    let payload = this.commonService.filterList();
    payload.query = {
      isExport: this.isExport || this.isTransport,
      batchId: this.urlParam.id,
    };

    payload.sort = {
      desc: ['invoiceNo'], // sorting by invoiceNo instead of updatedOn
    };

    this.commonService.getSTList('invoice', payload).subscribe((data) => {
      const documents = data.documents;

      if (documents && documents.length > 0) {
        const lastInvoice = documents[0]; // due to sorting by invoiceNo DESC
        const lastInvoiceNo: string = lastInvoice.invoiceNo;

        const nextInvoiceNo = this.generateNextInvoiceNo(lastInvoiceNo);
        this.newInvoiceNo = nextInvoiceNo;

      } else {
        // No previous invoice found, start from base
        this.newInvoiceNo = 'SAL/001';
      }
    });
  }

  generateNextInvoiceNo(current: string): string {
    const parts = current.split('/');
    const prefix = 'SAL' + '/';
    const currentNumber = parseInt(parts[1] || '0', 10);
    const nextNumber = (currentNumber + 1).toString().padStart(3, '0');
    return `${prefix}${nextNumber}`;
  }

  getChargeControls() {
    return (this.newReceiptForm.get('charge') as FormArray).controls;
  }
  gstType = 'tax';

  checkGstType() {
    let customerData =
      this.billFromBranchList?.filter(
        (x) =>
          x.branch_name === this.newReceiptForm?.get('billFromBranch').value
      )[0] || '';
    if (customerData.customerStatus == 'Resident') {
      let myBranchState =
        this.type == 'buyerInvoice'
          ? this.newReceiptForm.value.withoutJob
            ? this.branchList[0]?.addressInfo?.stateName || ''
            : this.branchList?.find(
                (x) =>
                  x.branchId === this.batchDetails?.quotationDetails?.branchId
              )?.addressInfo?.stateName || ''
          : this.branchList?.find(
              (x) => x.branchId === this.newReceiptForm.value.billToBranch
            )?.addressInfo?.stateName || '';

      let partyBranchState = this.stateList?.filter(
        (x) => x?.stateId == this.newReceiptForm?.get('stateOfSupply').value
      )[0]?.typeDescription;

      if (myBranchState?.toLowerCase() == partyBranchState?.toLowerCase()) {
        this.gstType = 'cgst';
      } else {
        this.gstType = 'igst';
      }
    } else {
      this.gstType = 'tax';
    }
  }
  addChargeRow(item?: any, i?, noGST?): void {
    const row = this.formBuilder.group({
      enquiryitemId: [item ? item.enquiryitemId : ''],
      batchId: [item ? item.batchId : ''],
      chargeName: [item ? item.costItemId : null, Validators.required],
      basic: [item ? item.basicId : null],
      quantity: [item ? item.quantity : null, Validators.required],

      gst: [item ? item.gst || 0 : 0],
      gstType: [item ? this.gstType || 'igst' : this.gstType || 'igst'],
      currencyBuy: [
        item ? item.buyEstimates?.currencyId : null,
        this.type === 'buyerInvoice' ? Validators.required : '',
      ],
      buyRate: [item ? item.buyEstimates?.rate : null],
      buyTotal: [item ? item.buyEstimates?.amount : null],
      buyExRate: [item ? item.buyEstimates?.exChangeRate : 0],
      buyTaxable: [item ? item.buyEstimates?.taxableAmount : 0],
      hsnCode: [item ? item.hsnCode : ''],
      batchNo: [item ? item.batchNo : ''],
      buyIgst: [item ? item.buyEstimates?.igst : null],
      buyCgst: [item ? item.buyEstimates?.cgst : null],
      buySgst: [item ? item.buyEstimates?.sgst : null],
      buyTotalINR: [item ? item.buyEstimates?.totalAmount : 0],
      buyInvoice: [item ? item?.buyEstimates?.invoiceNo : null],
      buyInvoiceId: [item ? item?.buyEstimates?.invoiceId : null],
      buyTerm: [item ? item.buyEstimates?.terms : null],
      supplier: [
        item
          ? item.buyEstimates?.supplier
          : this.newReceiptForm.value.customer
          ? this.newReceiptForm.value.customer
          : null,
      ],
      buyerInvoice: [item ? item.buyEstimates?.buyerInvoice : null],

      buyisInvoiceCreated: [item ? item.buyEstimates?.isInvoiceCreated : false],
      sellisInvoiceCreated: [
        item ? item.selEstimates?.isInvoiceCreated : false,
      ],

      isReceiptCreatedBuy: [item ? item.buyEstimates?.isReceiptCreated : false],
      isReceiptCreatedSell: [
        item ? item.selEstimates?.isReceiptCreated : false,
      ],

      currencySell: [
        item ? item.selEstimates?.currencyId : null,
        this.type === 'sellerInvoice' ? Validators.required : '',
      ],
      sellRate: [item ? item.selEstimates?.rate : null],
      sellTotal: [item ? item.selEstimates?.amount : null],
      sellExRate: [item ? item.selEstimates?.exChangeRate : 0],

      sellTaxable: [item ? item.selEstimates?.taxableAmount : 0],
      sellIgst: [item ? item.selEstimates?.igst : null],
      sellCgst: [item ? item.selEstimates?.cgst : null],
      sellSgst: [item ? item.selEstimates?.sgst : null],

      sellTotalINR: [item ? item.selEstimates?.totalAmount : 0],
      sellInvoice: [item ? item?.selEstimates?.invoiceNo : null],
      sellInvoiceId: [item ? item?.selEstimates?.invoiceId : null],
      sellTerm: [item ? item.selEstimates?.terms : null],
      remarks: [item ? item.selEstimates?.remarks : null],
      sellerInvoice: [item ? item.selEstimates?.sellerInvoice : null],

      margin: [item ? item.tenantMargin || 0 : 0],
      isEnquiryCharge: [item ? item.isEnquiryCharge : false],
      isInvoiceCreated: [item ? item.isInvoiceCreated : false],

      invoiceId: [item ? item.invoiceId : ''],
      invoiceNo: [item ? item.invoiceNo : ''],
      amount: [item ? item.amount : ''],
      moveNumber: [item ? item.moveNumber : ''],
      isPrincipleCreated: [item ? item.isPrincipleCreated : false],

      invoiceStatus: [item ? item?.invoiceStatus : null],
    });

    (this.newReceiptForm.get('charge') as FormArray).push(row);

    if (this.isType == 'show') {
      this.getWarehouseDataEntryById(this.urlParam.id, 'add');
      this.newReceiptForm.disable();
      const controls = (this.newReceiptForm.get('charge') as FormArray)
        .controls;
      controls.forEach((element) => {
        element.disable();
      });
    }

    if (i > -1) {
      if (!noGST) {
        this.setGSTtoRow(i);
        this.setQuantity(i);
        this.sellCurrChange(i);
        this.buyCurrChange(i);
      }

      this.calcBuyAMT(i);
    }
  }

  sellCurrChange(i) {
    let control = this.newReceiptForm.controls.charge['controls'][i].controls;
    // let exRate = this.currencyList?.filter(x => x?.currencyId ==
    //   control.currencySell.value)[0]?.currencyPair || 1

    // control.sellExRate?.setValue(exRate)

    let defaultCurrency = this.defaultCurrency;
    let currencyShortName = this.currencyList?.filter(
      (x) => x?.currencyId == control.currencySell.value
    )[0]?.currencyShortName;
    let exRate = 0;

    if (currencyShortName != defaultCurrency) {
      let payload = {
        fromCurrency: currencyShortName,
        toCurrency: defaultCurrency,
      };

      this.commonService
        .getExchangeRate('exchangeRate', payload)
        .subscribe((result) => {
          exRate = result[defaultCurrency];
          control.sellExRate?.setValue(exRate?.toFixed(3));
          this.calcBuyAMT(i);
        });
    } else {
      exRate = 1;
      control.sellExRate?.setValue(exRate?.toFixed(3));
      this.calcBuyAMT(i);
    }
  }
  setGSTtoRow(i, flag?) {
    let control = this.newReceiptForm.controls.charge['controls'][i].controls;
    let data = this.chargeName?.filter(
      (x) => x?.costitemId === control.chargeName.value
    )[0];

    if (flag) {
      control.currencyBuy.setValue(data?.currencyId);
      control.currencySell.setValue(data?.currencyId);
      control.buyRate.setValue(data?.chargeAmount);
    }

    let noContainer = 0;
    if (
      data?.chargeTypeName?.toLowerCase() === 'container charge' ||
      data?.chargeTypeName?.toLowerCase() === 'container'
    ) {
      // this.enquiryRateList[0]?.containersDetails?.forEach((c) => {
      //   noContainer += Number(c.noOfContainer || 1);
      // });
      control.quantity.setValue(noContainer || 1);
    } else {
      control.quantity.setValue(1);
    }
    control.gst.setValue(data?.gst || 0);
    control.hsnCode.setValue(data?.hsnCode || '');
    control.basic.setValue(data?.chargeType || '');

    this.calcBuyAMT(i);
  }

  buyCurrChange(i) {
    let control = this.newReceiptForm.controls.charge['controls'][i].controls;

    let defaultCurrency = this.defaultCurrency;
    let currencyShortName = this.currencyList?.filter(
      (x) => x?.currencyId == control.currencyBuy.value
    )[0]?.currencyShortName;
    let exRate = 0;

    if (currencyShortName != defaultCurrency) {
      let payload = {
        fromCurrency: currencyShortName,
        toCurrency: defaultCurrency,
      };

      this.commonService
        .getExchangeRate('exchangeRate', payload)
        .subscribe((result) => {
          exRate = result[defaultCurrency];
          control.buyExRate?.setValue(exRate?.toFixed(3));
          this.calcBuyAMT(i);
          // control.sellExRate?.setValue(exRate)
        });
    } else {
      exRate = 1;
      control.buyExRate?.setValue(exRate?.toFixed(3));
      this.calcBuyAMT(i);
      // control.sellExRate?.setValue(exRate)
    }
  }
  setQuantity(i) {
    let control = this.newReceiptForm.controls.charge['controls'][i].controls;
    let data = this.chargeBasic?.filter(
      (x) => x?.systemtypeId === control.basic.value
    )[0];
    let noContainer = 0;
    if (
      data?.typeName?.toLowerCase() == 'container charge' ||
      data?.typeName?.toLowerCase() == 'container'
    ) {
      this.batchDetails?.enquiryDetails?.containersDetails.filter((c) => {
        noContainer += Number(c.noOfContainer || 0);
      });
      control.quantity.setValue(noContainer || 1);
    } else if (
      data?.typeName?.toLowerCase() == 'kgs' ||
      data?.typeName?.toLowerCase() == 'kg'
    ) {
      control.quantity.setValue(
        Number(
          this.batchDetails?.enquiryDetails?.looseCargoDetails?.grossWeight
        ) || 0
      );
    } else if (data?.typeName?.toLowerCase() == 'cbm') {
      control.quantity.setValue(
        Number(
          this.batchDetails?.enquiryDetails?.looseCargoDetails?.grossVolume
        ) || 0
      );
    } else {
      control.quantity.setValue(1);
    }
    this.calcBuyAMT(i);
  }
  buyTotal = 0;
  sellTotal = 0;
  billAmount = 0;
  taxAmount = 0;
  totalAmount = 0;
  taxableAmount = 0;
  isNegative: boolean = false;

  getChargeControlsLength(): number {
    return (this.newReceiptForm.get('charge') as FormArray).length;
  }

  calcBuyAMT(i?) {
    this.billAmount = 0;
    this.buyTotal = 0;
    this.sellTotal = 0;
    this.taxAmount = 0;
    this.taxableAmount = 0;
    if (i >= 0) {
      let control = this.newReceiptForm.controls.charge['controls'][i].controls;
      control.buyTotal.setValue(
        Number((control.buyRate.value * control.quantity.value).toFixed(2))
      );
      control.buyTaxable.setValue(
        Number(
          (
            Number(control.buyExRate?.value) *
            Number(control.buyRate.value) *
            Number(control.quantity.value)
          ).toFixed(2)
        )
      );

      control.sellTotal.setValue(
        Number(
          (
            Number(control.sellRate.value) * Number(control.quantity.value)
          ).toFixed(2)
        )
      );
      control.sellTaxable.setValue(
        Number(
          (
            Number(control.sellExRate?.value) *
            Number(control.sellRate.value) *
            Number(control.quantity.value)
          ).toFixed(2)
        )
      );

      let gstBuyValue = Number(
        (Number(control.buyTaxable.value) * Number(control.gst.value)) / 100
      );
      let gstSellValue = Number(
        (Number(control.sellTaxable.value) * Number(control.gst.value)) / 100
      );

      control.buyIgst.setValue(Number(gstBuyValue.toFixed(2)));
      control.buyCgst.setValue(Number((gstBuyValue / 2).toFixed(2)));
      control.buySgst.setValue(Number((gstBuyValue / 2).toFixed(2)));

      control.sellIgst.setValue(Number(gstSellValue.toFixed(2)));
      control.sellCgst.setValue(Number((gstSellValue / 2).toFixed(2)));
      control.sellSgst.setValue(Number((gstSellValue / 2).toFixed(2)));

      control.buyTotalINR.setValue(
        Number((gstBuyValue + control.buyTaxable.value).toFixed(2))
      );
      control.sellTotalINR.setValue(
        Number((gstSellValue + control.sellTaxable.value).toFixed(2))
      );
      control.margin.setValue(
        Number(
          (control.sellTotalINR.value - control.buyTotalINR.value).toFixed(2)
        )
      );

      this.newReceiptForm.controls.charge['controls'].forEach((element) => {
        this.buyTotal += element.controls.buyTotalINR.value || 0;
        this.sellTotal += element.controls.sellTotalINR.value || 0;

        if (this.type === 'sellerInvoice') {
          this.billAmount += Number(element.controls.sellTotalINR.value || 0);
          this.totalAmount += Number(element.controls.sellTotalINR.value || 0);
          this.taxAmount += Number(element.controls.sellIgst.value || 0);
          this.taxableAmount += Number(element.controls.sellTaxable.value || 0);
        } else {
          this.billAmount += Number(element.controls.buyTotalINR.value || 0);
          this.totalAmount += Number(element.controls.buyTotalINR.value || 0);
          this.taxAmount += Number(element.controls.buyIgst.value || 0);
          this.taxableAmount += Number(element.controls.buyTaxable.value || 0);
        }
      });
    }
    // this.newReceiptForm.controls.taxAmount.setValue(this.taxAmount?.toFixed(2));
    // this.newReceiptForm.controls.balance.setValue(this.billAmount?.toFixed(2));
    if (this.newReceiptForm.get('roundOff').value) {
      this.newReceiptForm.controls.tdsAmount.setValue(
        (
          (this.taxableAmount * this.newReceiptForm.get('tds').value) /
          100
        )?.toFixed(0)
      );
      this.newReceiptForm.controls.taxAmount.setValue(
        this.taxAmount?.toFixed(0)
      );
      this.newReceiptForm.controls.paidAmount.setValue(
        Number(this.newReceiptForm.get('paidAmount').value).toFixed(0)
      );
      this.newReceiptForm.controls.totalAmount.setValue(
        (
          this.billAmount -
          ((this.billAmount * this.newReceiptForm.get('discount').value) /
            100 || 0) -
          (this.newReceiptForm.get('tdsAmount').value || 0)
        )?.toFixed(0)
      );
      this.newReceiptForm.controls.balance.setValue(
        (
          this.newReceiptForm.get('totalAmount').value -
          this.newReceiptForm.get('paidAmount').value
        )?.toFixed(0)
      );
    } else {
      this.newReceiptForm.controls.tdsAmount.setValue(
        (
          (this.taxableAmount * this.newReceiptForm.get('tds').value) /
          100
        )?.toFixed(2)
      );
      this.newReceiptForm.controls.taxAmount.setValue(
        this.taxAmount?.toFixed(2)
      );
      this.newReceiptForm.controls.paidAmount.setValue(
        Number(this.newReceiptForm.get('paidAmount').value).toFixed(2)
      );
      this.newReceiptForm.controls.totalAmount.setValue(
        (
          this.billAmount -
          ((this.billAmount * this.newReceiptForm.get('discount').value) /
            100 || 0) -
          (this.newReceiptForm.get('tdsAmount').value || 0)
        )?.toFixed(2)
      );
      this.newReceiptForm.controls.balance.setValue(
        (
          this.newReceiptForm.get('totalAmount').value -
          this.newReceiptForm.get('paidAmount').value
        )?.toFixed(2)
      );
    }

    this.isNegative = this.sellTotal - this.buyTotal < 0;
  }

  deleteCharge(content1, data: any, index) {
    this.modalService
      .open(content1, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',
        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then((result) => {
        if (result === 'yes') {
          this.notification.create('success', 'Deleted Successfully', '');

          (this.newReceiptForm.get('charge') as FormArray).removeAt(index);
          this.calcBuyAMT(0);
        }
      });
  }

  paidAll() {
    if (this.newReceiptForm.get('paid').value) {
      if (this.newReceiptForm.get('roundOff').value) {
        this.newReceiptForm.controls.paidAmount.setValue(
          Number(this.newReceiptForm.get('totalAmount').value).toFixed(0)
        );
      } else {
        this.newReceiptForm.controls.paidAmount.setValue(
          Number(this.newReceiptForm.get('totalAmount').value).toFixed(2)
        );
      }
      this.roundOff();
    }
  }
  roundOff(e?) {
    if (this.newReceiptForm.get('roundOff').value) {
      this.newReceiptForm.controls.tdsAmount.setValue(
        (
          (this.taxableAmount * this.newReceiptForm.get('tds').value) /
          100
        )?.toFixed(0)
      );
      this.newReceiptForm.controls.taxAmount.setValue(
        this.taxAmount?.toFixed(0)
      );
      this.newReceiptForm.controls.paidAmount.setValue(
        Number(this.newReceiptForm.get('paidAmount').value).toFixed(0)
      );
      this.newReceiptForm.controls.totalAmount.setValue(
        (
          this.billAmount -
          ((this.billAmount * this.newReceiptForm.get('discount').value) /
            100 || 0) -
          (this.newReceiptForm.get('tdsAmount').value || 0)
        )?.toFixed(0)
      );
      this.newReceiptForm.controls.balance.setValue(
        (
          Number(this.newReceiptForm.get('totalAmount').value) -
          Number(this.newReceiptForm.get('paidAmount').value)
        )?.toFixed(0)
      );
    } else {
      this.newReceiptForm.controls.tdsAmount.setValue(
        (
          (this.taxableAmount * this.newReceiptForm.get('tds').value) /
          100
        )?.toFixed(2)
      );
      this.newReceiptForm.controls.paidAmount.setValue(
        Number(this.newReceiptForm.get('paidAmount').value).toFixed(2)
      );
      this.newReceiptForm.controls.taxAmount.setValue(
        this.taxAmount?.toFixed(2)
      );
      this.newReceiptForm.controls.totalAmount.setValue(
        (
          this.billAmount -
          ((this.billAmount * this.newReceiptForm.get('discount').value) /
            100 || 0) -
          (this.newReceiptForm.get('tdsAmount').value || 0)
        )?.toFixed(2)
      );
      this.newReceiptForm.controls.balance.setValue(
        (
          Number(this.newReceiptForm.get('totalAmount').value) -
          Number(this.newReceiptForm.get('paidAmount').value)
        )?.toFixed(2)
      );
    }
  }
  documentPreview(doc) {
    this.commonService.downloadDocuments('downloadfile', doc).subscribe(
      (res: Blob) => {
        const fileType = doc.split('.').pop().toLowerCase(); // Get file extension
        const blob = new Blob([res], { type: `application/${fileType}` }); // Set blob type based on file extension
        const temp = URL.createObjectURL(blob);

        if (fileType === 'pdf') {
          const pdfWindow = window.open(temp);
          // pdfWindow.print();
        } else if (
          ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(fileType)
        ) {
          // Handle image preview
          const img = document.createElement('img');
          img.src = temp;
          const imgWindow = window.open('');
          imgWindow.document.write(
            '<html><body style="margin:0; text-align:center;"></body></html>'
          );
          imgWindow.document.body.appendChild(img);
        } else {
          // Download other file types
          const link = document.createElement('a');
          link.href = temp;
          link.setAttribute('download', doc);
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      },
      (error) => {
        console.error('Document preview error', error);
      }
    );
  }
    basecontentUrl: string;
  Documentpdf: any

  printData() {
    let reportpayload = { "parameters": { "warehousedataentryId": this.paymentData?.warehousedataentryId } };
    this.commonService.pushreports(reportpayload, 'invoiceWarehouse').subscribe({
      next: (res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        let temp = URL.createObjectURL(blob);
        this.Documentpdf = temp;
        const pdfWindow = window.open(temp);
      }
    })
  }

  generateIRN(data) {
    this.commonService
      .getGeneretINR(`sent-to-einvoicing/${data.invoiceId}`, {})
      .subscribe(
        (data) => {
          if (data) {
            this.notification.create(
              'success',
              'Invoice Generated Successfully',
              ''
            );
            this.getRecieptList();
          }
        },
        (error) => {
          if (error.error?.isMultipleError) {
            error.error?.errorMessage.forEach((element) => {
              this.notification.create('error', element, '');
            });
          } else {
            this.notification.create(
              'error',
              error?.error?.error?.messageMessage,
              ''
            );
          }
        }
      );
  }

  cancelIRN(data) {
    this.commonService
      .getGeneretINR(`cancel-from-einvoicing/${data.invoiceId}`, {})
      .subscribe(
        (data) => {
          if (data) {
            this.notification.create(
              'success',
              'Invoice Generated Successfully',
              ''
            );
            this.getRecieptList();
          }
        },
        (error) => {
          if (error.error?.isMultipleError) {
            error.error?.errorMessage.forEach((element) => {
              this.notification.create('error', element, '');
            });
          } else {
            this.notification.create(
              'error',
              error?.error?.error?.messageMessage,
              ''
            );
          }
        }
      );
  }

  downloadFile(doc) {
    this.commonService
      .downloadDocuments('downloadpublicfile', doc.pdfUrl)
      .subscribe(
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

  uploadFile: any;
  filechange(event: any) {
    const fileInput = event.target.files[0];
    if (fileInput) {
      this.uploadFile = fileInput;
    }
  }
  errorList: any = [];
  readFile(openError) {
    // this.billDetail.pdfUrl = ''
    if (this.uploadFile) {
      this.errorList = [];
      const formData = new FormData();
      formData.append('file', this.uploadFile, `${this.uploadFile.name}`);
      formData.append('name', `${this.uploadFile.name}`);
      this.commonService
        .uploadDocuments('uploadpublicreport', formData)
        .subscribe((res) => {
          if (
            res.shipperName &&
            res.shipperName !==
              this.batchDetails?.enquiryDetails?.basicDetails.shipperId
          ) {
            this.errorList.push({
              name: `${res.shipperName} Does not match with job details shipper name - ${this.batchDetails?.enquiryDetails?.basicDetails.shipperName}`,
            });
          }
          if (
            res.consigneeName &&
            res.consigneeName !==
              this.batchDetails?.enquiryDetails?.basicDetails.consigneeName
          ) {
            this.errorList.push({
              name: `${res.consigneeName} Does not match with job details consignee name - ${this.batchDetails?.enquiryDetails?.basicDetails.consigneeName}`,
            });
          }
          if (
            res.vesselName &&
            res.vesselName !== this.batchDetails?.quotationDetails.vesselName
          ) {
            this.errorList.push({
              name: `${res.vesselName} Does not match with job details vessel name -  ${this.batchDetails?.quotationDetails?.vesselName}`,
            });
          }

          this.modalService
            .open(openError, {
              backdrop: 'static',
              keyboard: false,
              centered: true,
              size: 'lg',

              ariaLabelledBy: 'modal-basic-title',
            })
            .result.then((result) => {
              if (result === 'yes') {
                this.convertTo2DArray(res?.costItems);
                this.newReceiptForm.patchValue({
                  remark: res?.remarks,
                  bankId: res?.bankName,
                  bl_no: res?.Bill_of_Lading_Number,
                  invoice_amount: res?.invoiceAmount,
                  billdue_date: res?.invoiceDueDate || new Date(),
                  payment_terms: res?.paymentTerms || 1,
                  supplier: res?.supplier,
                });
                this.taxAmount = res?.invoiceTaxAmount || 0;
                this.totalAmount = res?.invoiceAmount || 0;

                this.calcBuyAMT();
              } else {
                this.uploadFile = null;
              }
            });

          this.costItemList = res?.costItemList || [];
        });
    } else {
      this.notification.create('error', 'Please upload file', '');
    }
  }

  convertTo2DArray(originalArray) {
    originalArray?.forEach((y) => {
      this.costItemList.push({
        batchId: this.route.snapshot.params['id'],
        enquiryId: '',
        batchNo: '',
        collectPort: '',
        quotationId: '',
        agentadviceId: '',
        containerType: y['containerType'] || '',
        vesselName: '',
        voyageName: '',
        moveNumber: '',
        enquiryNumber: '',
        enqDate: '',
        stcQuotationNo: '',
        enqType: '',
        tenantId: '1',
        enquiryitemId: '',
        costitemGroup: '',
        costItemId: '',
        accountBaseCode: '',
        costItemName: y?.description || '',
        costHeadId: '',
        costHeadName: '',
        exchangeRate: '1',
        currency: '',
        amount: '',
        baseAmount: '',
        basic: y['containerType'] || '',
        basicId: '',
        tenantMargin: 0,
        buyEstimates: {
          currencyId: '',
          currency: y?.currency || '',
          exChangeRate: y?.currency === 'INDIAN RUPEE' ? 0.012 : 1,
          rate: y['sum_rate'] || 0,
          taxableAmount:
            y['sum_rate'] *
              y['quantity'] *
              (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1) || 0,
          amount: y['sum_rate'] * y['quantity'] || 0,
          totalAmount:
            y['total_rounded'] * (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1) ||
            0,
          terms: '',
          supplier: '',
          igst: 0,
          cgst: 0,
          sgst: 0,
          invoiceId: '',
          invoiceNo: '',
        },
        selEstimates: {
          currencyId: '',
          currency: y?.currency || '',
          taxableAmount:
            y['sum_rate'] *
            y['quantity'] *
            (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1),
          exChangeRate: y?.currency === 'INDIAN RUPEE' ? 0.012 : 1,
          rate: y['sum_rate'] || 0,
          amount: y['sum_rate'] * y['quantity'] || 0,
          totalAmount:
            y['total_rounded'] * (y?.currency === 'INDIAN RUPEE' ? 0.012 : 1) ||
            0,
          terms: '',
          remarks: '',
          igst: 0,
          cgst: 0,
          sgst: 0,
        },
        tax: [
          {
            taxAmount: 0,
            taxRate: 0,
          },
        ],
        // "quantity": y['quantity']?.split('\n').pop() || 0,
        quantity: y['quantity'] || 0,
        rate: 0,
        stcAmount: 0,
        jmbAmount: 0,
        payableAt: '',
        gst: 0,
        gstType: 'igst',
        totalAmount: 0,
        chargeTerm: '',
        remarks: '',
        containerNumber: [],
        shippingLine: '',
        taxApplicability: '',
        hsnCode: '',
        isPrincipleCreated: false,
        isInvoiceCreated: false,
        isEnquiryCharge: false,
      });
    });

    this.costItemList = this.costItemList.filter((x) => x.costItemName !== '');
  }
}
