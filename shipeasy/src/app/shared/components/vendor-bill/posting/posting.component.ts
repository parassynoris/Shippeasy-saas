import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from 'src/app/services/common/common.service';
import { Location } from '@angular/common';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { BaseBody } from 'src/app/admin/party-master/base-body';
@Component({
  selector: 'app-posting',
  templateUrl: './posting.component.html',
  styleUrls: ['./posting.component.scss']
})
export class PostingComponent implements OnInit {
  @Output() BillSection = new EventEmitter<string>();
  postingForm: FormGroup;
  costItemList = []
  billsList: any = [];
  totalAmount: number;
  taxAmount: number;
  billAmount: number;
  filterBody = this.apiService.body;
  urlParam: any;
  billDate: any = '';
  partyMasterList: any = [];
  showDiv: boolean = true;
  submitted: boolean = false;
  isPath: string;
  voucherScreen: boolean = false;
  isEdit: boolean = false;
  tdsRemarkList: any = [];
  baseBody: BaseBody;
  batchListData: any;
  tdsList: any = [];
  costItemListFinal: any =[];
  finalChargeTotal: number = 0;
  currentAgent: any;

  constructor(
    
    private router: Router,
    private route: ActivatedRoute,
    public apiService: ApiSharedService,
   
    private commonService: CommonService,
    private formBuilder: FormBuilder,
    private notification: NzNotificationService,
  private commonfunction : CommonFunctions,
    private location: Location,
  ) {
    this.router = router;
    this.route = route;
    this.apiService = apiService;
    this.commonService = commonService;
    this.formBuilder = formBuilder;
    this.notification = notification;
    this.location = location
    this.route?.params?.subscribe((params) => (this.urlParam = params));
    this.formBuild()
    let stringToSplit = location?.path();
    let x = stringToSplit?.split('/');
    this.isPath = x?.[1];
  }
  formBuild() {
    this.postingForm = this.formBuilder.group({
      billDate: [''],
      TXNDate: [''],

      commission: [true],
      selectType: ['', [Validators.required]],
      totalInvoice: ['', [Validators.required]],
      commissionPer : [''],
      tdsNature: [''],
      accountHead : [''],
      tdsPercent: [''],
      taxAmount: [''],
      tdsAmount: [''],
      limit: [''],
      utilised: [''], 
      remark: [''],
      tdsArray : this.formBuilder.array([]),
    });

   
  }
  get f() {
    return this.postingForm.controls;
  }
  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    this.getBillsList(this.urlParam?.id)
    this.getSystemTypeDropDowns()
    this.getBatchList()
    this.getTdsData()
  }
  getTdsData() {

    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      status: true,
    }
    this.commonService?.getSTList('tds', payload)?.subscribe((res: any) => {
      this.tdsList = res?.documents;
    });
  }
  getBillsList(id) {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      invoiceType: 'bills', invoiceId: id,
    }
    this.commonService?.getSTList('invoice', payload)
      ?.subscribe((data) => {
        this.billsList = data.documents[0];
        if (this.billsList?.billPosting?.billPosting) {
          this.postingForm.disable();
        }
        this.costItemListFinal = []
        this.costItemList = this.billsList?.vendorCharges;
        this.costItemListFinal.push({
          invoiceAmount : this.billsList?.billPosting?.invoiceAmount
        })
        this.billsList?.vendorCharges.filter((x)=>{
          this.costItemListFinal.push(x)
        })
        
          this.calculateTotal();
        this.postingForm.controls.billDate.setValue(this.billsList?.invoiceDate);
        this.postingForm.controls.TXNDate.setValue(this.billsList?.invoiceDate);
        this.billsList?.billPosting ? this.isEdit = true : this.isEdit = false;
        this.getPartyMaster(this.billsList?.vendorId);
        this.postingForm.patchValue({
          commission: this.billsList?.billPosting?.commission === 'false' ? false : true,
          selectType: this.billsList?.billPosting?.commissionType || "",
          totalInvoice: this.billsList?.billPosting?.invoiceAmount || "",
          commissionPer: this.billsList?.billPosting?.commissionPer || "",
          taxAmount: this.billsList?.billPosting?.tdsTaxAmount || "",
          tdsAmount: this.billsList?.billPosting?.tdsAmount || "",
          limit: this.billsList?.billPosting?.tdsLimit || "",
          utilised: this.billsList?.billPosting?.tdsUtilised || "",
          remark: this.billsList?.billPosting?.tsdRemarkId || "",
        });
      });
  }
  getEnquiryCharges(res) {

    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      "chargeBillNo": this.billsList.billNo, 
      // "enquiryitemId": res?.toString(),
      "enquiryitemId": {
        "$in": [
          res?.toString(),
        ]
      }
    }
    this.commonService?.getSTList('enquiryitem', payload)
      ?.subscribe(
        (result) => {
          this.costItemList = result?.documents;
          this.calculateTotal();
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
  }
  getBatchList() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {  }
    this.commonService?.getSTList('batch', payload)
      ?.subscribe((data: any) => {
        this.batchListData = data.documents;
      });
  }
  getPartyMaster(e) { 
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      status: true, partymasterId: e,
    }
    this.commonService?.getSTList('partymaster', payload)
      ?.subscribe((data) => {

        this.partyMasterList = data.documents[0];
        if(this.billsList?.billPosting?.tdsArray?.length > 0){
            this.billsList?.billPosting?.tdsArray?.forEach(e => {
              this.tdsArray?.push(this.addTds(e))
            })
        }else{
        
        }

      });
  }

  calculateTotal() {
    this.totalAmount = 0;
    this.taxAmount = 0;
    this.billAmount = 0;
    this.finalChargeTotal = 0;
    this.costItemList?.forEach((element) => {
      this.totalAmount += Number(element?.chargableAMT || 0);
      this.taxAmount += Number(element?.totalTAX || 0);
      this.finalChargeTotal += Number(element?.totalAMT || 0);
    });
   
  }
  commisionChange() {
    if (this.postingForm.controls.selectType.value === 'commission') {
      this.postingForm.controls.totalInvoice.setValue(this.taxAmount + this.totalAmount);
      this.postingForm.controls['totalInvoice'].disable();
      this.postingForm.controls['commissionPer'].enable();
    } else {
      this.postingForm.controls.totalInvoice.setValue('');
      this.postingForm.controls['totalInvoice'].enable();
      this.postingForm.controls['commissionPer'].disable();
    }
  }
  setTotalInvoice(){
    let value = ((this.taxAmount + this.totalAmount ) * this.postingForm.controls.commissionPer.value )/100
    let totalInvoiceAMT = this.taxAmount + this.totalAmount + value
    this.postingForm.controls.totalInvoice.setValue(totalInvoiceAMT);
  }
  tdsAMT(data,i) {
    let controls = this.postingForm.controls?.tdsArray['controls'][i].controls
    let tsdAMT = Number(Number(data?.value?.taxAmount) * Number(data?.value?.tdsPercent) / 100)
    controls?.tdsAmount?.patchValue(tsdAMT)
    controls?.tdsPercent.setValue(data?.value?.tdsPercent1 || 0)
    if ( data?.value?.limit < tsdAMT) {
      let tsdAMT = Number(data?.value?.taxAmount) * Number(5) / 100
      controls?.tdsPercent.setValue(5)
      controls?.tdsAmount.setValue(tsdAMT)
      this.notification.create('info', 'Limit is over and charged 5% TDS ', '');
    } 
    controls?.utilised.setValue(data?.value?.limit - data?.value?.tdsAmount)
    if (data?.value?.taxAmount) {
      controls?.remark.disable();
      controls?.remark.setValue('')
      return false
    }
    controls?.remark.enable();
  }

  changeComm() {
    this.postingForm.controls.commission.value ? this.showDiv = true : this.showDiv = false;
    if (this.showDiv) {
      this.postingForm.get('selectType').setValidators([Validators.required]); 
      this.postingForm.get('selectType').updateValueAndValidity();
      this.postingForm.get('totalInvoice').setValidators([Validators.required]); 
      this.postingForm.get('totalInvoice').updateValueAndValidity();
    } else {
      this.postingForm.get('selectType').setValidators([]); 
      this.postingForm.get('selectType').updateValueAndValidity();
      this.postingForm.get('totalInvoice').setValidators([]); 
      this.postingForm.get('totalInvoice').updateValueAndValidity();
    }
  }
  previewSave() {
    this.submitted = true;
    if (this.billsList?.billPosting?.billPosting) {
      this.voucherScreen = true;
      return false
    }
    if (this.postingForm.invalid) {
      return false;
    }
    let data = {
      commission: this.postingForm.get('commission').value.toString(),
      commissionType: this.postingForm.get('selectType').value.toString(),
      invoiceAmount: this.postingForm.get('totalInvoice').value.toString(),
      commissionPer : this.postingForm.get('commissionPer').value.toString(),
      tdsTaxAmount: this.postingForm.get('taxAmount').value.toString(),
      tdsAmount: this.postingForm.get('tdsAmount').value.toString(),
      tdsLimit: this.postingForm.get('limit').value.toString(),
      tdsUtilised: this.postingForm.get('utilised').value.toString(),
      tsdRemark: this.tdsRemarkList.filter((x) => x.systemtypeId === this.postingForm.get('remark').value)[0]?.typeName,
      tsdRemarkId: this.postingForm.get('remark').value?.toString(),
      billPosting: false,
       tdsArray : this.addArrayValue()
     
    }

    
      var vendorCharges = this.billsList.vendorCharges.filter((x)=> x?.chargeItem !== 'Commission Charge')
      if(this.postingForm.get('selectType').value === 'commission'){
      vendorCharges.push({
        chargeItem: "Commission Charge",
        currency : 'INR',
        exchangeRate : '1',
        chargableAMT : '0',
        totalTAX:'0',
        totalAMT : ((this.taxAmount + this.totalAmount ) * this.postingForm.controls.commissionPer.value )/100
      })
    }

    let payload = { ...this.billsList,vendorCharges: vendorCharges, invoiceStatus: 'In Progress', billPosting: data }
    this.commonService.UpdateToST(`invoice/${payload.invoiceId}`, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.billsList = res
          this.costItemList = []
          this.costItemListFinal = []
          this.costItemList = this.billsList?.vendorCharges;
          this.costItemListFinal.push({
            invoiceAmount : this.billsList?.billPosting.invoiceAmount
          })
          this.billsList?.vendorCharges.filter((x)=>{
            this.costItemListFinal.push(x)
          })
          
            this.calculateTotal();


          this.submitted = false;
          this.voucherScreen = true;
        }
      }
    );
  }
  
  addArrayValue() {
    const branchArray = [];
    this.tdsArray?.controls.forEach(element => {
      let branch = {
        accountHead : this.tdsList.filter((x)=> x?.tdsId ===  element.value.tdsNature)[0]?.accountHead,
        tdsNatureName: this.tdsList.filter((x)=> x?.tdsId ===  element.value.tdsNature)[0]?.tdsNature,
        tdsNature: element.value.tdsNature,
        tdsPercent: element.value.tdsPercent,
        tdsPercent1 : element.value.tdsPercent1,
       taxAmount: element.value.taxAmount,
       tdsAmount: element.value.tdsAmount,
        limit: element.value.limit,
        utilised: element.value.utilised,
        tsdRemark: this.tdsRemarkList.filter((x) => x.systemtypeId ===  element.value.remark,)[0]?.typeName,
        tsdRemarkId:  element.value.remark,
      }
      branchArray.push(branch)
    });
    return branchArray;
  }
  billPost() {
    let finalPostingAmt : number = 0
    this.billsList.vendorCharges?.filter((x)=>{
      finalPostingAmt += Number(x?.totalAMT)
    })

    let data = {
      commission: this.postingForm.get('commission').value.toString(),
      commissionType: this.postingForm.get('selectType').value.toString(),
      invoiceAmount: this.postingForm.get('totalInvoice').value.toString(),
      commissionPer : this.postingForm.get('commissionPer').value.toString(),
      tdsTaxAmount: this.postingForm.get('taxAmount').value.toString(),
      tdsAmount: this.postingForm.get('tdsAmount').value.toString(),
      tdsLimit: this.postingForm.get('limit').value.toString(),
      tdsUtilised: this.postingForm.get('utilised').value.toString(),
      tsdRemark: this.tdsRemarkList.filter((x) => x.systemtypeId === this.postingForm.get('remark').value)[0]?.typeName,
      tsdRemarkId: this.postingForm.get('remark').value.toString(),
      billPosting: true,
      tdsArray : this.addArrayValue()
    }
    let payload = { ...this.billsList, invoiceStatus: 'Completed', billPosting: data,finalPostingAmount : finalPostingAmt }
    this.commonService.UpdateToST(`invoice/${payload.invoiceId}`, payload)?.subscribe(
      (res: any) => {
        if (res) {
          this.notification.create('success', `Bill created successfully. Voucher No: ${''}, Bill No: ${this.billsList?.billNo}`, '');
          this.submitted = false;
          if (this.isPath === 'batch') {
            this.router.navigate(['/batch/list/add/' + this.urlParam.id + '/vendor-bill']);
          }
          else
            this.router.navigate(['/finance/bills']);
        }
      },
      (error) => {
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService?.filterList()
    if(payload?.query)payload.query = {
      status: true,typeCategory: "tdsRemark"
    }
    this.commonService?.getSTList('systemtype', payload)?.subscribe((res: any) => {
      this.tdsRemarkList = res?.documents?.filter(x => x.typeCategory === "tdsRemark")
    });
  }
  findVoyoge(id) {
    return this.batchListData.filter((x) => x?.batchId === id)[0]?.finalVoyageName
  }
  DeptName(id){
    return this.batchListData.filter((x) => x?.batchId === id)[0]?.enquiryData?.container_type
  }
  updateParty() {
    let countUtilised = (Number(this.partyMasterList?.TDS_utilised || 0) + Number(this.postingForm.get('tdsAmount').value)).toString()
    let data = { ...this.partyMasterList, TDS_utilised: countUtilised }
    this.commonService.UpdateToST(`partymaster/${data.partymasterId}`,data)?.subscribe()
  }
  onCloseBill(evt) {
    this.BillSection.emit(evt);
  }

  addNewRow(){
    this.tdsArray?.push(this.addTds(''))
  }
  addTds(res?) {
    return this.formBuilder.group({
      accountHead : [res ? res?.accountHead : ''],
      tdsNature: [res ? res?.tdsNature : ''],
      tdsPercent: [res ? res?.tdsPercent : ''],
      tdsPercent1: [res ? res?.tdsPercent1 ? res?.tdsPercent1 : res?.tdsPercent : ''],
     taxAmount: [res ? res?.taxAmount : ''],
     tdsAmount: [res ? res?.tdsAmount : ''],
      limit: [res ? res?.limit : ''],
      utilised: [res ? res?.utilised : ''],
      remark : [res ? res?.tsdRemarkId : ''],

    })

  }
  get tdsArray() {
    return this.postingForm.controls["tdsArray"] as FormArray;
  }
  setTDSrow(i){
    let data = this.tdsList.filter((x)=> x?.tdsId === this.tdsArray.at(i).get('tdsNature').value )[0]
   
    this.tdsArray.at(i).get(`limit`).setValue(data?.thresholdLimit)
    this.tdsArray.at(i).get(`tdsPercent`).setValue(data?.tdsPer)
    this.tdsArray.at(i).get(`tdsPercent1`).setValue(data?.tdsPer)
  }
}
