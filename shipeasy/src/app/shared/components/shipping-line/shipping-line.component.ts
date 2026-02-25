import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BaseBody } from '../gl-bank/base-body';
import { differenceInCalendarDays } from 'date-fns';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { ApiService } from 'src/app/admin/principal/api.service';
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { SystemType } from 'src/app/models/system-type';
import { CostItem, Currency, NewData, ShippingLine } from 'src/app/models/shipping-line';
import { CountryData } from 'src/app/models/city-master';
import { MastersSortPipe } from '../../util/mastersort';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-shipping-line',
  templateUrl: './shipping-line.component.html',
  styleUrls: ['./shipping-line.component.scss'],
})
export class ShippingLineComponent implements OnInit {
  _gc=GlobalConstants;
  shippinglineData = [];
  closeResult: string;
  shippingLineForm: FormGroup;
  shippingLineIdToUpdate: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  submitted: boolean = false;
  name: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  shipping_line: string;
  contact_person: string;
  countryData: CountryData[];
  baseBody: BaseBody;
  portList: PortDetails[] = [];
  preCarrigeList: SystemType[] = [];
  onCarrigeList: SystemType[] = [];
  containerTypeList: SystemType[] = [];
  status: string;
  entryPort: string;
  loadPort: string;
  preCarriage: string;
  costItemList: NewData[] = [];
  showCharge: boolean = false;
  newenquiryForm: FormGroup;
  currencyList: Currency[];
  defaultCurrency: Currency[] = [];
  chargeName: CostItem[] = [];
  chargetermList: object = [];
  submitted1: boolean = false;
  show: string;
  shippingNameList : ShippingLine[] = []
  tenantId: string;
  todayDate=new Date()
  yardcfs:any
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  emaill:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'name',
   'country',
   'preCarriageName',
   'loadPortName',
   'entryPortName',
   'status'
  ];
  isMaster: boolean = false;

  constructor(
    private fb: FormBuilder,
    public modalService: NgbModal,
    private cognito : CognitoService,
    public notification: NzNotificationService,
    public commonService: CommonService,
    private sortPipelist: MastersSortPipe,
    private commonfunction: CommonFunctions,
    public loaderService: LoaderService,
  ) {
    this.fb = fb;
    this.modalService = modalService;
    this.cognito = cognito;
    this.notification = notification;
    this.commonService = commonService
    this.formBuild()
    this.formBuild1()
  }
  formBuild() {
    this.newenquiryForm = this.fb.group({
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
      stcAmount: ['', [Validators.required]],
      jmbAmount: [''],
      remarks: ['']
    });
  }
  formBuild1(){
    this.shippingLineForm = this.fb.group({
      name: ['', [Validators.required]],
      country: ['', [Validators.required]],
      status: [true],

      toDate: ['', [Validators.required]],
      fromDate: ['', [Validators.required]],
      containerType: [''],
      ServiceName: [''],
      productType: ['HAZ'],
      tsPort: [''],
      entryPort: ['', [Validators.required]],
      on_carriage: [''],
      loadPort: ['', [Validators.required]],
      preCarriage: ['', [Validators.required]],
      contractType: ['AGENT'],
    });
  }

  vvoye() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ]
    }
  if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   mustArray['$and']= [
     {
       "feeder": {
         "$ne": true
       }
     }
   ] 
   if(payload?.query)payload.query = mustArray
   this.commonService.getSTList('shippingline', payload)?.subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          name: s.name,
          country: s.country,
          preCarriageName: s.preCarriageName,
          loadPortName: s.loadPortName,
          entryPortName: s.entryPortName,
          status: s?.status,
         
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile1(): void {
    let storeEnquiryData = [];
    this.emaill.map((row: any) => {
      storeEnquiryData.push({
        'country' : row?.element?.country,
        'preCarriageName' : row?.element?.preCarriageName,
        'name' : row?.element?.name,
        'loadPortName' : row?.element?.loadPortName,
        'status' : row?.element?.status,
        'entryPortName' : row?.element?.entryPortName
      });
    }
    );
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    const fileName = '.xlsx';
    XLSX.writeFile(myworkbook, fileName);
  }

  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }

  displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  searchColumns() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.displayedColumns[ind] !== 'status' ?
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          } : this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": (each.toLowerCase() === 'active' ? true : false),
          }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('shippingline', payload).subscribe((data) => {
      this.yardcfs = data.documents;
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

  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getShiipingLine()
  }
  getCurrencyList() {
    let payload = this.commonService.filterList();
    if(payload?.query)payload.query = {
      status: true
    }
    this.commonService.getSTList("currency", payload)?.subscribe((data) => {
      this.currencyList = data.documents;
      this.defaultCurrency = data?.documents?.filter((x) => x?.currencyShortName?.toLowerCase() === 'usd')[0]?.currencyId
      this.newenquiryForm.controls.currency.setValue(this.defaultCurrency)
    });
  }
  costItem() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      status: true
    }
    this.commonService.getSTList("costitem", payload)?.subscribe((data) => {
      this.chargeName = data.documents;
    });
  }

  calcuTotal() {
    this.newenquiryForm.controls.amount.setValue(
      (Number(1) * Number(this.newenquiryForm?.controls?.stcAmount?.value)).toFixed(2)
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
  changeJMB() {
    this.newenquiryForm.controls.jmbAmount.setValue(this.newenquiryForm.controls.stcAmount.value)
  }
  calTAX(gst, amt) {
    return (amt * gst / 100).toFixed(0)
  }
  calTAXINR(gst, amt):string {
    let ex:any = this.currencyList?.filter(x => x?.currencyShortName?.toLowerCase() === 'usd')[0]?.currencyPair
    return (amt * gst * ex / 100).toFixed(0)
  }
  calTAXUSD(gst, amt):string {
    let ex:any = this.currencyList?.filter(x => x?.currencyShortName?.toLowerCase() === 'usd')[0]?.currencyPair
    return ((amt * gst / 100) / ex).toFixed(0)
  }
  onDelete(data){
    const itemData = this.costItemList?.filter(
      (item) => item !== data
    );
    this.costItemList = itemData;
  }
  addRow() {
    this.submitted1 = true
    if (this.newenquiryForm.invalid) {
      return false
    } else {
      const newData: NewData = {
        costItemId: this.newenquiryForm?.controls?.chargeName?.value,
        costitemGroup : '',
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
        chargeType : this.chargeName?.filter(
          (x) =>
            x?.costitemId ==
            this.newenquiryForm?.controls?.chargeName?.value
        )[0]?.chargeType,
        costItemName: this.chargeName?.filter(x => x?.costitemId === this.newenquiryForm?.controls?.chargeName?.value)[0]?.costitemName,
        costHeadId: this.newenquiryForm?.controls?.chargeGroup?.value,
        costHeadName: '',
        currency: this.currencyList?.filter(x => x?.currencyId ==
          this.newenquiryForm?.controls?.currency?.value)[0]?.currencyShortName?.toUpperCase(),
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
        quantity: this.newenquiryForm?.controls?.quantity?.value  || '1',
        rate: this.newenquiryForm?.controls?.stcAmount?.value || 0,
        stcAmount: Math.round(this.newenquiryForm?.controls?.stcAmount?.value),
        jmbAmount: Math.round(this.newenquiryForm?.controls?.stcAmount?.value),
        payableAt: this.newenquiryForm?.controls?.payableAt?.value,
        gst: this.newenquiryForm?.controls?.gstPercentage?.value,
        totalAmount: Math.round(this.newenquiryForm?.controls?.totalAmount?.value),
        chargeTerm: this.newenquiryForm?.controls?.chargeTerm?.value,
        remarks: this.newenquiryForm?.controls?.remarks?.value,
        containerNumber: [],
        isFreight: false,
        shippingLine: this.shippingLineForm.value.name,

      };
        this.costItemList?.push(newData);
        this.submitted1 = false
        this.formBuild()
    }
  }
  checkFormValid() {
    this.submitted = true
    if (this.shippingLineForm.invalid) {
      return false
    } else {
      this.showCharge = true
    }
  }
  get f1() {
    return this.newenquiryForm.controls; }
  get f() {
    return this.shippingLineForm.controls;
  }

  ngOnInit(): void {
    this.vvoye()
    this.getShiipingLineName()
    this.costItem()
    this.getCurrencyList()
    this.getSystemTypeDropDowns()
    this.getcountryList();
    this.getShiipingLine();
    this.getPortDropDowns();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  getPortDropDowns() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true,
    }

    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      this.portList = res?.documents;

    });
  }
  
  getShiipingLineName() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
     
      "$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ],
    }

    this.commonService.getSTList("shippingline", payload)?.subscribe((data: any) => {
      this.shippingNameList = data.documents;
    });
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status: true, 
      "typeCategory": {
        "$in": [
          "preCarriage","onCarriage","containerType","chargeTerm",
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.preCarrigeList = res?.documents?.filter(x => x.typeCategory === "preCarriage");
      this.onCarrigeList = res?.documents?.filter(x => x.typeCategory === "onCarriage");
      this.chargetermList = res?.documents?.filter(x => x.typeCategory === "chargeTerm");
    });


  }
  getcountryList() {
    let payload = this.commonService.filterList()

    if(payload?.query)payload.query = {
      status : true,
    }

    this.commonService.getSTList("country", payload)?.subscribe((res: any) => {
      this.countryData = res.documents;
    });
  }
  getShiipingLine() {
    this.loaderService.showcircle();
    this.page = 1;
   
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "$and": [
        {
          "feeder": {
            "$ne": true
          }
        }
      ]
    }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }

   let mustArray = {};
   mustArray['$and']= [
     {
       "feeder": {
         "$ne": true
       }
     }
   ] 
    // Trim beginning spaces from search parameters
   this.name = this.name?.trim();
   this.country = this.country?.trim();
   this.preCarriage =  this.preCarriage?.trim();
   this.loadPort = this.loadPort?.trim();
   this.entryPort = this.entryPort?.trim();
   this.status = this.status?.trim();
       if (this.name) {
         mustArray['name'] = {
           "$regex" : this.name,
           "$options": "i"
       }
       }
   
       if (this.country) {
         mustArray['country'] = {
           "$regex" : this.country,
           "$options": "i"
       }
       }
       if (this.preCarriage) {
         mustArray['preCarriageName'] = {
           "$regex" : this.preCarriage,
           "$options": "i"
       } 
       }
       if (this.loadPort) {
         mustArray['loadPortName'] = {
           "$regex" : this.loadPort,
           "$options": "i"
       }
       }
       if (this.entryPort) {
   
         mustArray['entryPortName'] = {
           "$regex" : this.entryPort,
           "$options": "i"
       }
       }
       if (this.status) {
        mustArray['status'] = this.status === 'true'? true : false
      }

      if(payload?.query) payload.query = mustArray
   if(payload?.size)payload.size = Number(this.size)
   if(payload?.from)payload.from = this.page -1
   setTimeout(() => {
    this.commonService.getSTList('shippingline', payload)?.subscribe((data) => {
        this.shippinglineData = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        if (data && data?.documents) {
          this.dataSource.data = data.documents.map((s: any, i: number) => ({
            ...s,
            id: i + 1,
            name: s.name,
            country: s.country,
            preCarriageName: s.preCarriageName,
            loadPortName: s.loadPortName,
            entryPortName: s.entryPortName,
            status: s?.status,
            
          }));
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort1; 
          this.loaderService.hidecircle();
        }
      },()=>{
        this.loaderService.hidecircle();
      });
    }, 1000);
   
  }

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

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getShiipingLine();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.query = {
        "$and": [
          {
            "feeder": {
              "$ne": true
            }
          }
        ]
      }
      payload.sort = {
        "desc" : ["updatedOn"]
     }

     let mustArray = {};
     mustArray['$and']= [
       {
         "feeder": {
           "$ne": true
         }
       }
     ] 
     this.name = this.name?.trim();
     this.country = this.country?.trim();
     this.preCarriage =  this.preCarriage?.trim();
     this.loadPort = this.loadPort?.trim();
     this.entryPort = this.entryPort?.trim();
     this.status = this.status?.trim();
         if (this.name) {
           mustArray['name'] = {
             "$regex" : this.name,
             "$options": "i"
         }
         }
     
         if (this.country) {
           mustArray['country'] = {
             "$regex" : this.country,
             "$options": "i"
         }
         }
         if (this.preCarriage) {
           mustArray['preCarriageName'] = {
             "$regex" : this.preCarriage,
             "$options": "i"
         } 
         }
         if (this.loadPort) {
           mustArray['loadPortName'] = {
             "$regex" : this.loadPort,
             "$options": "i"
         }
         }
         if (this.entryPort) {
     
           mustArray['entryPortName'] = {
             "$regex" : this.entryPort,
             "$options": "i"
         }
         }
         if (this.status) {
          mustArray['status'] = this.status === 'true'? true : false
        }
     
         payload.query = mustArray
     payload.size = Number(this.size)
     payload.from = this.fromSize -1,
      this.commonService.getSTList('shippingline', payload).subscribe((data) => {
      this.shippinglineData = data.documents;
      this.toalLength = data.totalCount;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count -  ((this.toalLength % Number(this.size))>0?(this.toalLength % Number(this.size)):(Number(this.size)))
            : this.count - data.documents.length
          : this.count + data.documents.length;
    });
  }

  search() {
    let mustArray = {};
mustArray['$and']= [
  {
    "feeder": {
      "$ne": true
    }
  }
] 
 // Trim beginning spaces from search parameters
this.name = this.name?.trim();
this.country = this.country?.trim();
this.preCarriage =  this.preCarriage?.trim();
this.loadPort = this.loadPort?.trim();
this.entryPort = this.entryPort?.trim();
this.status = this.status?.trim();
    if (this.name) {
      mustArray['name'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }

    if (this.country) {
      mustArray['country'] = {
        "$regex" : this.country,
        "$options": "i"
    }
    }
    if (this.preCarriage) {
      mustArray['preCarriageName'] = {
        "$regex" : this.preCarriage,
        "$options": "i"
    } 
    }
    if (this.loadPort) {
      mustArray['loadPortName'] = {
        "$regex" : this.loadPort,
        "$options": "i"
    }
    }
    if (this.entryPort) {

      mustArray['entryPortName'] = {
        "$regex" : this.entryPort,
        "$options": "i"
    }
    }
    if (this.status) {
      mustArray['status'] = this.status === 'true'? true : false
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('shippingline', payload).subscribe((data) => {
      this.shippinglineData = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      });
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }
  changeFromDate() {
    this.shippingLineForm.controls.toDate.setValue('')
  }
  disabledEtdDate = (current: Date): boolean => {
    if (this.shippingLineForm.controls.fromDate.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.shippingLineForm.controls.fromDate.value)
        ) < 0
      );
    else return false;
  };
  clear() {
    this.name = '';
    this.city = '';
    this.country = '';
    this.phone = '';
    this.email = '';
    this.shipping_line = '';
    this.contact_person = '';
    this.status = '';
    this.entryPort = '';
    this.loadPort = '';
    this.preCarriage = '';
    this.getShiipingLine();
  }

  costItemsMasters() {
    this.submitted = true;
    if (this.shippingLineForm.invalid) {
      return;
    }
    let countryList = this.countryData.filter(x => x?.countryId === this.shippingLineForm.get('country').value);

   
    let newCostItems = {
      contactPerson: this.shippingLineForm.value.contactPerson,
      country: countryList[0]?.countryName || '',
      countryISOCode: countryList[0]?.countryId || '',
      name: this.shippingLineForm.value.name,
      "tenantId": this.tenantId,
      "orgId": this.commonfunction.getAgentDetails()?.orgId,
      status: this.shippingLineForm.value.status,
      costItems : this.costItemList || [],
      toDate: this.shippingLineForm.value.toDate || new Date(),
      fromDate: this.shippingLineForm.value.fromDate || new Date(),
      serviceName: this.shippingLineForm.value.ServiceName,
      productType: this.shippingLineForm.value.productType,
      contractType: this.shippingLineForm.value.contractType,
      containerTypeId: this.shippingLineForm.value.containerType,
      containerType: this.containerTypeList.filter(x => x.systemtypeId === this.shippingLineForm.value.containerType)[0]?.typeName,
      tsPortId: this.shippingLineForm.value.tsPort,
      tsPortName: this.portList.filter(x => x.portId === this.shippingLineForm.value.tsPort)[0]?.portDetails?.portName,
      entryPortId: this.shippingLineForm.value.entryPort,
      entryPortName: this.portList.filter(x => x.portId === this.shippingLineForm.value.entryPort)[0]?.portDetails?.portName,
      loadPortId: this.shippingLineForm.value.loadPort,
      loadPortName: this.portList.filter(x => x.portId === this.shippingLineForm.value.loadPort)[0]?.portDetails?.portName,
      onCarriageId: this.shippingLineForm.value.on_carriage,
      onCarriageName: this.onCarrigeList.filter(x => x.systemtypeId === this.shippingLineForm.value.on_carriage)[0]?.typeName,
      preCarriageId: this.shippingLineForm.value.preCarriage,
      preCarriageName: this.preCarrigeList.filter(x => x.systemtypeId === this.shippingLineForm.value.preCarriage)[0]?.typeName,
    };
  

    if (!this.shippingLineIdToUpdate) {
      this.commonService.addToST('shippingline',newCostItems).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onSave();
            this.getShiipingLine();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newCostItems,
        shippinglineId: this.shippingLineIdToUpdate,
      };
      this.commonService.UpdateToST(`shippingline/${dataWithUpdateID.shippinglineId}`,dataWithUpdateID).subscribe(
        (result: any) => {
          if (result) {
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getShiipingLine();
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }

 

  delete(deleteshippingLine, id) {
    this.modalService
      .open(deleteshippingLine, {
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
            let data = 'shippingline' + id.shippinglineId
            this.commonService
              .deleteST(data)
              .subscribe((res: any) => {
                if (res) {
                  this.notification.create(
                    'success',
                    'Deleted Successfully',
                    ''
                  );
                  this.clear();
                }
              });
            this.getShiipingLine();
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

  open(content, shippingLine?: any, show?) {
    this.show = show;
    if (shippingLine) {
      this.shippingLineIdToUpdate = shippingLine?.shippinglineId;
      this.costItemList = shippingLine.costItems || []
      this.shippingLineForm.patchValue({
        name: shippingLine.name,
        country: shippingLine.countryISOCode,
   
        status: shippingLine.status,

        toDate: shippingLine.toDate,
        fromDate: shippingLine.fromDate,
        containerType: shippingLine.containerTypeId,
        ServiceName: shippingLine.serviceName,
        productType: shippingLine.productType,
        tsPort: shippingLine.tsPortId,
        entryPort: shippingLine.entryPortId,
        on_carriage: shippingLine.onCarriageId,
        loadPort: shippingLine.loadPortId,
        preCarriage: shippingLine.preCarriageId,
        contractType: shippingLine.contractType,

      });
    }
    show === 'show'?this.shippingLineForm.disable():this.shippingLineForm.enable()
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }
  changeStatus(data, i) {
    this.commonService.UpdateToST(`shippingline/${data.shippinglineId}`,{ ...data, status: !data?.status },
      )
      .subscribe(
        (res: any) => {
          if (res) {
            this.shippinglineData[i].status = !data?.status;
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            var myInterval = setInterval(() => {
              this.search();
              clearInterval(myInterval);
            }, 1000);
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  onSave() {
    this.showCharge = false;
    this.submitted = false;
    this.shippingLineIdToUpdate = null;
    this.formBuild1()
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.shippinglineData.map((row: any) => {
      storeEnquiryData.push({
        'Name': row.name,
        'Country': row.country,
        'Pre CarriageName': row.preCarriageName,
        'Load PortName': row.loadPortName,
        'Entry PortName': row.entryPortName,
        'Status': row.status ? 'Active' : 'Inactive',
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'shipping-line.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare = [];
    this.shippinglineData.forEach(e => {
      let tempObj = [];
      tempObj.push(e.name);
      tempObj.push(e.country);
      tempObj.push(e.preCarriageName);
      tempObj.push(e.loadPortName);
      tempObj.push(e.entryPortName);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc, {
      head: [['Name', 'Country', 'Pre Carriage', 'Load Port', 'Entry Port', 'Status']],
      body: prepare,
      didDrawCell: (data) => {
        // Draw border lines for each cell
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
    }
    });
    doc.save('shipping-line' + '.pdf');
  }

}
