import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { shared } from 'src/app/shared/data';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import * as Constant from 'src/app/shared/common-constants';
import { OrderByPipe } from 'src/app/shared/util/sort';

@Component({
  selector: 'app-freight-charges',
  templateUrl: './freight-charges.component.html',
  styleUrls: ['./freight-charges.component.scss']
})
export class FreightChargesComponent implements OnInit {
  @Input() isAddNewSection: boolean = true;
  @Input() isOnlyShow: boolean = true;
  @Input() show: boolean = true;
  @Input() isPage;
  @Output() FreightChargedData = new EventEmitter<any>();
  @Output() getFreightChargedData = new EventEmitter<any>();
  chargesData = [];
  isShow: any;
  isHoldType: any = 'add';
  modalReference: any;
  filterBody = this._api.body
  newenquiryForm: FormGroup;
  costHeadList = [];
  chargeName: any = [];
  currencyList: any;
  chargetermList: any = [];
  baseBody: BaseBody;
  submitted = false;
  costItemList: any = [];
  agentAdviceDetails: any;
  enquiry_ID: any;
  paramId: any;
  closeResult: string;
  isEdit: boolean = false;
  editData: any;
  chargeTermList: any;
  isAdmin: boolean = false;
  defaultCurrency: any = '';
  defaultCharge: any = '';
  popUp: boolean = false;
  isAgentAdvise: boolean =false;
  isExport:any;
  currentUrl: string;
  constructor(private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private profilesService: ProfilesService,
    private _api: ApiService,
    public apiService: ApiSharedService,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    private tranService: TransactionService,
    private commonService: CommonService,
    private sortPipe : OrderByPipe) {
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.formBuild()
  }
  sort(array , key){
    return this.sortPipe.transform(array, key);
   }
  formBuild() {
    this.newenquiryForm = this.formBuilder.group({
      chargeGroup: [''],
      chargeName: [this.defaultCharge, [Validators.required]],
      chargeTerm: ['', [Validators.required]],
      currency: [this.defaultCurrency, [Validators.required]],
      exchangeRate: [''],
      containerNo: [''],
      quantity: ['1'],
      rate: [''],
      amount: [''],
      gstPercentage: ['5', [Validators.required]],
      gst: [''],
      totalAmount: [''],
      payableAt: [''],
      stcAmount: ['', [Validators.required]],
      jmbAmount: [''],
      remarks: ['']
    });

  }
  get f() { return this.newenquiryForm.controls; }

  onShowdetails(id) {
    this.isShow = id;
  }


  getCharges(id) {
   
    let payload = this.commonService.filterList();
    payload.query = {
      "enquiryId": id,
      "isFreight": true,
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
            if (element.isFreight)
            data.push(element);
          }
      });
      this.chargesData = data
      this.getFreightChargedData.emit(this.chargesData)


    }, error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    });
  }

  ngOnInit(): void {
    this.isPage = 'agent-advise' ? this.isAgentAdvise = true : this.isAgentAdvise = false
    this.enquiry_ID = this.route.snapshot.params['id'];
    let roleName = this.profilesService.getCurrentAgentDetails()?.roleName;
    let adminRoleNames = ["devadmin", "Super Super Admin"];
    adminRoleNames.map(name => { if (name === roleName) { this.isAdmin = true; } });
    if (this.enquiry_ID) {
      if(this.isAgentAdvise){
        this.getAgentAdviceById(this.enquiry_ID);
      }else{
        this.getEnquiryId(this.enquiry_ID);
      }
      this.getCharges(this.enquiry_ID);
    }


    this.getCostHeadList();
    this.costItem();
    this.getCurrencyList();
    this.getSystemTypeDropDowns();
    this.getChargeTerm()

  }
  getChargeTerm() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      typeCategory: "freightChargeTerm",
      "status": true
    }
    this.commonService.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.chargeTermList = res.documents;
    });
  }
  getEnquiryId(id){
    let payload = this.commonService.filterList();
    payload.query = {
      "enquiryId": id
    }
    this.commonService.getSTList('enquiry', payload)
      .subscribe((res: any) => {
        this.agentAdviceDetails = res?.documents[0];
      })
  }
  getAgentAdviceById(id) {
    let url = Constant.AGENTADVICE_LIST;
 
    let payload = this.commonService.filterList();
    payload.query = {
      "agentadviceId": id
    }
    this.commonService.getSTList(url, payload)
      .subscribe((res: any) => {
        this.agentAdviceDetails = res?.documents[0];
      })
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
        this.chargesData = this.chargesData?.filter(
          item => item !== data
        );
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
      if (res) {
        this.notification.create(
          'success',
          'Deleted Successfully',
          ''
        );
      }
    })
  }

  onOpen(freightModal, row) {
    this.submitted = false;
    let profileData = row
    let tax = profileData?.tax;
    let currencyValue = this.currencyList?.filter(x => x?.currencyShortName ==
      profileData?.currency)[0]
    if (profileData) {
      this.isEdit = true;
      this.editData = profileData;
      this.newenquiryForm.patchValue({
        chargeGroup: profileData?.costHeadId || '',
        chargeName: profileData?.costItemId || this.defaultCharge,
        chargeTerm: profileData?.chargeTerm || '',
        currency: currencyValue?.currencyId || this.defaultCurrency,
        exchangeRate: profileData?.exchangeRate || '',
        quantity: profileData?.quantity || '1',
        rate: profileData?.rate || '',
        amount: profileData?.quantity *
          profileData?.rate || '',
        gstPercentage: tax ? tax[0]?.taxRate : '' || '',
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
    this.modalReference = this.modalService.open(freightModal, {
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

  getCostHeadList() {
 
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('costhead',payload)?.subscribe((data) => {
      this.costHeadList = data.documents;
    });
  }

  costItem() {
 
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costitem',payload)?.subscribe((data) => {
      this.chargeName = data.documents;
      if(this.isExport){
        this.defaultCharge = data?.documents?.filter((x) => x?.costitemName?.toLowerCase() === 'stc export freight')[0]?.costitemId
      }
      else if(!this.isExport){
      this.defaultCharge = data?.documents?.filter((x) => x?.costitemName?.toLowerCase() === 'stc import freight')[0]?.costitemId
      }
      this.newenquiryForm.controls.currency.setValue(this.defaultCharge)
    });
  }

  getCurrencyList() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('currency',payload)?.subscribe((data) => {
      this.currencyList = data.documents;
      this.defaultCurrency = data?.documents?.filter((x) => x?.currencyShortName?.toLowerCase() === 'usd')[0]?.currencyId
      this.newenquiryForm.controls.currency.setValue(this.defaultCurrency)
    });
  }

  getSystemTypeDropDowns() {
   
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      typeCategory: "chargeTerm",
    }
    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.chargetermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");

    });
  }


  onSave(key?) {
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

    let newItem = {
      tenantId: this.agentAdviceDetails?.tenantId,
      orgId: "",
      enquiryitemId: null,
      enquiryId: this.enquiry_ID,
      enquiryNumber: this.agentAdviceDetails?.enquiryNo|| "",
      enqDate: this.agentAdviceDetails?.basicDetails?.enquiryDate || "",
      stcQuotationNo: "",
      enqType: this.agentAdviceDetails?.basicDetails?.enquiryTypeId || "",
      costItemId: this.newenquiryForm?.controls?.chargeName?.value,
      costItemName: this.chargeName?.filter(x => x?.costitemId === this.newenquiryForm?.controls?.chargeName?.value)[0]?.costitemName,
      costHeadId: this.newenquiryForm?.controls?.chargeGroup?.value,
      costHeadName: this.costHeadList?.filter(x => x?.costheadId === this.newenquiryForm?.controls?.chargeGroup?.value)[0]?.costheadName,
      chargeType : this.chargeName?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.chargeType,
      taxApplicability : this.chargeName?.filter(x => x?.costitemId === this.newenquiryForm?.controls?.chargeName?.value)[0]?.tax_applicability_name,
      currency: this.currencyList?.filter(x => x?.currencyId ==
        this.newenquiryForm?.controls?.currency?.value)[0]?.currencyShortName,
        currencyId:this.newenquiryForm?.controls?.currency?.value,
        exchangeRate: this.currencyList?.filter(x => x?.currencyId ==
          this.newenquiryForm?.controls?.currency?.value)[0]?.exchangeRate,
      amount: this.newenquiryForm?.controls?.amount?.value.toString(),
      hsnCode : this.chargeName?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.hsnCode?.toString() || '',
      accountBaseCode: this.chargeName?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.accountCode?.toString() || '',
      costitemGroup: this.costItemList?.filter(
        (x) =>
          x?.costitemId ==
          this.newenquiryForm?.controls?.chargeName?.value
      )[0]?.costitemGroup,
      baseAmount: "",
      tenantMargin: "",
      tax: [
        {
          taxAmount: Math.round(Number(this.newenquiryForm?.controls?.gst?.value)),
          taxRate: this.newenquiryForm?.controls?.gstPercentage?.value
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
      isFreight: true,
      shippingLine: this.agentAdviceDetails?.routeDetails?.shippingLineName,

    }
    if (this.isEdit) {
      this.chargesData = this.chargesData.map(item => item === this.editData ? { ...newItem, enquiryitemId: item.enquiryitemId } : item);
    } else {
      this.chargesData.push(newItem)
      newArray.push(newItem)
    }

    this.FreightChargedData.emit(this.chargesData);


    this.closePopUp();
  }

  closePopUp() {
    this.modalReference.close();
    this.submitted = false;
  }

  calcuTotal($event) {
    this.newenquiryForm.controls.amount.setValue(
      (this.newenquiryForm?.controls?.quantity?.value * this.newenquiryForm?.controls?.rate?.value).toFixed(2)
    );
  
    this.calcuGST();
  }
  calcuGST() {
    this.newenquiryForm.controls.gst.setValue(
      ((Number(this.newenquiryForm?.controls?.stcAmount?.value) * Number(this.newenquiryForm?.controls?.gstPercentage?.value)) / 100).toFixed(2)
    );
    this.newenquiryForm.controls.totalAmount.setValue(
      (Number(this.newenquiryForm?.controls?.stcAmount?.value) + Number(this.newenquiryForm?.controls?.gst?.value)).toFixed(2)
    );
  }
  setCustExchange() {
    this.newenquiryForm.controls.exchangeRate.setValue(
      this.currencyList?.filter(x => x?.currencyId ==
        this.newenquiryForm.controls.currency.value)[0]?.currencyPair
    )
  };
  changeJMB() {
    this.newenquiryForm.controls.jmbAmount.setValue(this.newenquiryForm.controls.stcAmount.value)
  }

}
