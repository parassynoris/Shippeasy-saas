import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { shared } from 'src/app/shared/data';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as Constant from 'src/app/shared/common-constants';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
export const GET_USER = "profile/list?type=user";
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { OrderByPipe } from 'src/app/shared/util/sort';
import { CommonService } from 'src/app/services/common/common.service';
@Component({
  selector: 'app-enquiry-charges',
  templateUrl: './enquiry-charges.component.html',
  styleUrls: ['./enquiry-charges.component.scss']
})
export class EnquiryChargesComponent implements OnInit {
  @Input() shippingName;
  @Input() isAddNewSection: boolean = true;
  @Input() url: any = "edit";
  @Input() isOnlyShow: boolean = true;
  @Input() isPage;
  @Input() show: boolean = true;
  @Input() isTypeForm: any = 'new';
  @Input() isshowDetails1: boolean = false;
  @Output() CloseNew  = new EventEmitter<string>();
  @Output() SaveCharge = new EventEmitter<any>();
  @Input() isshowDetails: boolean = false;
  @Output() getList = new EventEmitter<any>()
  @Output() getcostItemList = new EventEmitter<any>()
  currencyList: any;
  templateModel: any;
  templateList: any;
  newTempName: any = '';
  chargesData = shared.chargeRow;
  currencyModel: any;
  isHoldType: any = 'add';
  submitted = false;
  addcharges = shared.chargelist;
  exportFreight = shared.freightlist;
  opsCharges = shared.opsChargeList;
  newenquiryForm: FormGroup;
  chargeGroupList: any = [];
  chargetermList: any = [];
  toalLength: any = 100;
  count = 0;
  size = 10;
  page = 1;
  fromSize: number = 1;
  costItemList: any = [];
  isGetArray: boolean = false;
  chargeName: any = [];
  costHeadList = [];
  modalReference: any;
  closeResult: string;
  paramId: any;
  baseBody: BaseBody;
  enquiry_ID: any;
  agentAdviceDetails: any;
  savedCharges: any = [];
  isEditing: boolean = false;
  editingItem: any;
  isAdmin: boolean = false;
  currentUrl: string;
  stoltCharge: boolean = false;
  filterBody = this._api.body
  chargeTermList: any;
  defaultCurrency: any = '';
  popUp: boolean = false;

  constructor(private sortPipe: OrderByPipe,
    private commonService : CommonService,
    private route: ActivatedRoute, private _api: ApiService, private tranService: TransactionService, private profilesService: ProfilesService, private modalService: NgbModal, private formBuilder: FormBuilder, private notification: NzNotificationService, private saMasterService: SaMasterService) {

    this.formBuild()
    let roleName = this.profilesService.getCurrentAgentDetails()?.roleName;

    let adminRoleNames = ["devadmin", "Super Super Admin"];
    adminRoleNames.forEach(name => { if (name === roleName) { this.isAdmin = true; } });
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    if (this.currentUrl === 'ops-additional' || this.currentUrl === 'charges' || this.currentUrl === 'add' || this.currentUrl === 'edit') {
      this.stoltCharge = true
    }
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  formBuild() {
    this.newenquiryForm = this.formBuilder.group({
      chargeGroup: [''],
      chargeName: ['', [Validators.required]],
      chargeTerm: ['', [Validators.required]],
      currency: [this.defaultCurrency, [Validators.required]],
      exchangeRate: [''],
      containerNo: [''],
      quantity: ['1'],
      rate: [''],
      amount: [''],
      gstPercentage: ['', [Validators.required]],
      gst: [''],
      totalAmount: [''],
      payableAt: [''],
      stcAmount: [''],
      jmbAmount: [''],
      remarks: ['']
    });
  }
  get f() { return this.newenquiryForm.controls; }

  onClose(evt) {
    this.CloseNew.emit(evt);
  }

  onOpen(chargeModal, data) {
    this.isEditing = false;
    this.submitted = false;
    let profileData = data
    let tax = profileData?.tax;
    let currencyValue = this.currencyList?.filter(x => x?.currencyShortName ==
      profileData?.currency)[0]?._source
    if (profileData) {
      this.isEditing = true;
      this.editingItem = profileData;
      this.newenquiryForm.patchValue({
        chargeGroup: profileData?.costHeadId || '',
        chargeName: profileData?.costItemId || '',
        chargeTerm: profileData?.chargeTerm || '',
        currency: currencyValue?.currencyId || this.defaultCurrency,
        exchangeRate: profileData?.exchangeRate || '',
        quantity: profileData?.quantity || '1',
        rate: profileData?.rate || '',
        amount: profileData?.amount || '',
        gstPercentage: tax ? tax[0]?.taxRate : '',
        gst: tax ? tax[0]?.taxAmount : '' || '',
        stcAmount: profileData?.stcAmount || '',
        jmbAmount: profileData?.jmbAmount || '',
        payableAt: profileData?.payableAt || '',
        totalAmount: profileData?.totalAmount || '',
        remarks: profileData?.remarks || ''
      });
    } else {
      this.formBuild()
      this.newenquiryForm.controls.quantity.setValue('1')
    }
    this.modalReference = this.modalService.open(chargeModal, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
      ariaLabelledBy: 'modal-basic-title'
    })

    this.paramId = profileData?.costitemId;


    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    });

  }

  getCharges(enqId) {
    this.isGetArray = true;
  
    let payload = this.commonService.filterList()

    payload.query = {
      "enquiryId": enqId,
      "$and": [
        {
          "isFreight": {
            "$ne": true
          }
        }
      ]
    }
    let data: any = [];
    this.commonService.getSTList('enquiryitem',payload).subscribe((result) => {
      result?.documents.forEach(element => {
        if (this.currentUrl === 'clone') {
          data.push({...element,
           enquiryitemId :'',
           enquiryId : '',
           enquiryNumber : '',
          });
        }else{
          data.push(element);
        }
        this.costItemList = data
        this.getcostItemList.emit(this.costItemList)


      });
    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }


  ngOnInit(): void {
    this.enquiry_ID = this.route.snapshot.params['id'];
    if (this.enquiry_ID) {
      this.getAgentAdviceById(this.enquiry_ID);
      this.getCharges(this.enquiry_ID);
    }

    this.getCostHeadList();
    this.getCurrencyList();
    this.getSystemTypeDropDowns();
    this.getTemplate();
    this.costItem();
    this.getChargeTerm()
  }

  getChargeTerm() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      typeCategory: "chargeTerm",
      "status": true
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.chargeTermList = res.documents;


    });
  }
  getAgentAdviceById(id) {
    let payload = this.commonService.filterList()

    payload.query = {
      "enquiryId": id
    }
    this.commonService.getSTList(Constant.ENQUIRY_LIST, payload)
      .subscribe((res: any) => {
        this.agentAdviceDetails = res?.documents[0];
      })
  }

  getCurrencyList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('currency',payload)?.subscribe((data) => {
      this.currencyList = data.documents;
      this.defaultCurrency = data?.documents?.filter((x) => x?.currencyShortName?.toLowerCase() === 'usd')[0]?.currencyId
      this.newenquiryForm.controls.currency.setValue(this.defaultCurrency)
    });
  }

  getCostHeadList() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('costhead',payload)?.subscribe((data) => {
      this.costHeadList = data.documents;


    });
  }

  costItem() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costitem',payload)?.subscribe((data) => {
      this.chargeName = data.documents;

    });
  }

  getTemplate() {

    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costtemplate',payload)?.subscribe((res: any) => {

      this.templateList = res.documents.filter(x => x?.costItem.length > 0)

    })
  }

  getTemplateList(evt) {
    this.costItemList = [];
    if (this.costItemList !== '') {
      this.notification.info(
        'Info',
        'Before Select any template you need to delete your bucket charges',
      );
    } else {
      this.isGetArray = false;
      let payload = this.commonService.filterList()
      payload.query = {
        costtemplateId: evt
      }
      this.commonService.getSTList('costtemplate',payload).subscribe((res: any) => {
        this.costItemList = res.documents[0]?.costItem;
        this.SaveCharge.emit(this.costItemList);
      })
    }
  }
  calcINR() {
    let totalINR = 0
    this.costItemList.filter((x) => {
      if (x?.currency?.toLowerCase() === 'inr') {
        totalINR += Number(this.calTAX(x?.gst, x?.stcAmount)) || 0
      } else {
        totalINR += Number(this.calTAXINR(x?.gst, x?.stcAmount)) || 0
      }
    })
    return totalINR.toFixed(0) || 0
  }
  calcUSD() {
    let totalUSD = 0
    this.costItemList.filter((x) => {
      if (x?.currency?.toLowerCase() === 'usd') {
        totalUSD += Number(this.calTAX(x?.gst, x?.stcAmount)) || 0
      } else {
        totalUSD += Number(this.calTAXUSD(x?.gst, x?.stcAmount)) || 0
      }
    })
    return totalUSD.toFixed(0) || 0
  }
  saveTemplate(content) {
    this.newTempName = '';
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    }
    )


  }




  addNewTemplate() {
    const newArray = this.costItemList
    const dataupdate = {
      tenantId: "",
      orgId: "",
      status: true,
      costtemplateId: "",
      costTemplateName: this.newTempName,
      costTemplateDescription: this.newTempName,
      costItem: newArray
    };
    // const data = [dataupdate];
    this.commonService.addToST('costtemplate',dataupdate).subscribe((res: any) => {
        this.notification.create(
          'success',
          'Added Successfully',
          ''
        );
        this.modalService.dismissAll();
        setTimeout(() => { this.getTemplate() }, 1000)
    });
  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      'typeCategory': "chargeTerm",
    }
    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.chargetermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
    });
  }


  onSave(key) {
    this.isGetArray = false;
    this.submitted = true;
    if (this.newenquiryForm.invalid) {
      return false;
    }
    if (key) {
      if (this.newenquiryForm?.controls?.stcAmount?.value > this.newenquiryForm?.controls?.jmbAmount?.value) {
        this.popUp = true
        return false
      }
    }
    let newCostItems = this.newenquiryForm?.value;
    const newArray = this.costItemList ? this.costItemList : [];
    const newData = {
      tenantId: this.agentAdviceDetails?.tenantId,
      orgId: "",
      enquiryitemId: null,
      enquiryId: this.enquiry_ID,
      enquiryNumber: this.agentAdviceDetails?.enquiryNo,
      enqDate: this.agentAdviceDetails?.basicDetails?.enquiryDate,
      stcQuotationNo: "",
      enqType: 'Export',
      costItemId: this.newenquiryForm?.controls?.chargeName?.value,
      costitemGroup: this.costItemList?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.costitemGroup,
      chargeType: this.chargeName?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.chargeType,
      accountBaseCode: this.chargeName?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.accountCode?.toString() || '',
      hsnCode: this.chargeName?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.hsnCode?.toString() || '',
      costItemName: this.chargeName?.filter(x => x?.costitemId === this.newenquiryForm?.controls?.chargeName?.value)[0]?.costitemName,
      costHeadId: this.newenquiryForm?.controls?.chargeGroup?.value,
      costHeadName: this.costHeadList?.filter(x => x?.costheadId === this.newenquiryForm?.controls?.chargeGroup?.value)[0]?.costheadName,
      currency: this.currencyList?.filter(x => x?.currencyId ==
        this.newenquiryForm?.controls?.currency?.value)[0]?.currencyShortName?.toUpperCase(),
        currencyId:this.newenquiryForm?.controls?.currency?.value,
      exchangeRate: this.currencyList?.filter(x => x?.currencyId ==
        this.newenquiryForm?.controls?.currency?.value)[0]?.currencyPair,
      amount: this.newenquiryForm?.controls?.stcAmount?.value.toString(),
      baseAmount: "",
      tenantMargin: "",
      tax: [
        {
          taxAmount: Math.round(Number(this.newenquiryForm?.controls?.gst?.value)),
          taxRate: Number(this.newenquiryForm?.controls?.gstPercentage?.value)
        }
      ],
      quantity: '1',
      rate: Math.round(this.newenquiryForm?.controls?.stcAmount?.value),
      stcAmount: Math.round(this.newenquiryForm?.controls?.stcAmount?.value),
      jmbAmount: Math.round(this.newenquiryForm?.controls?.jmbAmount?.value),
      payableAt: this.newenquiryForm?.controls?.payableAt?.value,
      gst: this.newenquiryForm?.controls?.gstPercentage?.value,
      totalAmount: Math.round(this.newenquiryForm?.controls?.totalAmount?.value),
      chargeTerm: this.newenquiryForm?.controls?.chargeTerm?.value,
      remarks: this.newenquiryForm?.controls?.remarks?.value,
      containerNumber: [],
      isFreight: false,
     

    };
    if (this.isEditing) {
      this.costItemList = newArray.map(item => item === this.editingItem ? { ...newData, enquiryitemId: item.enquiryitemId } : item);
    } else {
      this.costItemList.push(newData);
    }
    const dataupdate = {
      costItem: newArray
    };
    this.SaveCharge.emit(this.costItemList);
    this.closePopUp();
  }

  onDelete(content1, data: any) {

    this.modalService.open(content1, {
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'sm',
      ariaLabelledBy: 'modal-basic-title'
    }).result.then((result) => {

      if (result === 'yes') {
        if (data.enquiryitemId !== null && data.enquiryitemId !== '' && (data.enquiryId === this.enquiry_ID)) {
          this.deleteEnquiryCharges(data.enquiryitemId);
        }
        else {
          this.notification.create(
            'success',
            'Deleted Successfully',
            ''
          );
        }
        const itemData = this.costItemList?.filter(
          (item) => item !== data
        );
        this.costItemList = itemData;
        this.SaveCharge.emit(this.costItemList);
      }
    });



  }

  deleteEnquiryCharges(enquiryitemId) {
    let data = {
      enquiryitemId: enquiryitemId,
      searchKey: "enquiryitemId"
    }
    const body = [data]
    this.commonService.deleteST(`enquiryitem/${enquiryitemId}`).subscribe((res: any) => {
        this.notification.create(
          'success',
          'Deleted Successfully',
          ''
        );
    })
  }

  closePopUp() {
    this.modalReference.close();
  }
  calcuTotal($event) {
    this.newenquiryForm.controls.amount.setValue(
      (this.newenquiryForm?.controls?.quantity?.value * this.newenquiryForm?.controls?.rate?.value).toFixed(2)
    );

    this.calcuGST();
  }
  calcuGST() {
    this.newenquiryForm.controls.gst.setValue(
      ((this.newenquiryForm?.controls?.jmbAmount?.value * this.newenquiryForm?.controls?.gstPercentage?.value) / 100).toFixed(2)
    );
    this.newenquiryForm.controls.totalAmount.setValue(
      (Number(this.newenquiryForm?.controls?.jmbAmount?.value) + Number(this.newenquiryForm?.controls?.gst?.value)).toFixed(2)
    );
  }
  setCustExchange() {
    this.newenquiryForm.controls.exchangeRate.setValue(
      this.currencyList?.filter(x => x?.currencyId ==
        this.newenquiryForm.controls.currency.value)[0]?.exchangeRate
    )
  };
  changeJMB() {
    this.newenquiryForm.controls.rate.setValue(this.newenquiryForm.controls.stcAmount.value)
    this.newenquiryForm.controls.jmbAmount.setValue(this.newenquiryForm.controls.stcAmount.value)
  }
  calTAX(gst, amt) {
    return (amt * gst / 100).toFixed(0) || 0
  }
  calTAXINR(gst, amt) {
    let ex = this.currencyList?.filter(x => x?.currencyShortName?.toLowerCase() == 'inr')[0]?.currencyPair || 0
    let value = (amt * gst * ex ).toFixed(0)
    return  0
  }
  calTAXUSD(gst, amt) {
    let ex = this.currencyList?.filter(x => x?.currencyShortName?.toLowerCase() == 'usd')[0]?.currencyPair || 0
    let value = ((amt * gst / 100) / ex).toFixed(0) 
    return 0
  }
  setGSTCharge(e) {
    let data = this.chargeName.filter((x) => x?.costitemId === e)[0]?._source
    this.newenquiryForm.controls.gstPercentage.setValue(Number(data?.taxRate))
  }
  shippingCharges: any = []
  autoLoad() {

    if (!this.shippingName) {
      this.notification.create(
        'error',
        'Please select shipping line',
        ''
      );
      return false
    }
   this.deleteArray = []
    this.costItemList?.filter((x) => {
      if(x.shippingLine){
       let body = `enquiryitem/${ x?.enquiryitemId}`;
          this.commonService.deleteST(body).subscribe();
      }
    })
    this.costItemList = this.costItemList.filter((x)=> !x.shippingLine)
 

    let payload = this.commonService.filterList();
    payload.query = {
      shippinglineId: this.shippingName,
    }

    this.shippingCharges = [];
    this.commonService.getSTList('shippingline',payload).subscribe(
      (result) => {
        let shippingCharges = result?.documents[0]?.costItems || [];

        shippingCharges.forEach(element => {
          this.costItemList.push({
            ...element,
            'enquiryId' : '',
            'enquiryitemId':null,
            "costHeadName": "",
            "accountBaseCode": element?.accountBaseCode?.toString(),
            "tenantId": "1", "orgId": "1",
            "isFreight": false,
            "amount": element?.amount?.toString(),
            "shippingLine" : this.shippingName || ''
          })
        });
        this.SaveCharge.emit(this.costItemList);
      }
    );
  }
  deleteArray = []
  deleteEnquiryCharges1() {
    if (this.deleteArray.length === 0) { return false }
    this.deleteArray.forEach(element => {
      const body = [element];
      this.commonService.deleteST(`enquiryitem/${element}`).subscribe();
    });
  }
}


