import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OrderByPipe } from 'src/app/shared/util/sort';
import * as XLSX from "xlsx";
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-rate-master',
  templateUrl: './rate-master.component.html',
  styleUrls: ['./rate-master.component.scss']
})
export class RateMasterComponent implements OnInit {
  show: string;
  isEdit: boolean = false;
  containerIdToUpdate: any;
  addratemaster: FormGroup;
  location = [];
  containerTypeList = [];
  shippingLineList = []
  currentUrl: string;
  rateDate:any = [];
  getUser: string;
  // @Input() addSystemTypeForm;
  closeResult: string;
  totalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  name: string;
  category: string;
  description: string;
  typeActive: string;
  refType: string;
  refCode: string;
  parentType: string;
  rateMasterList: [];
  toalLength: number;
  currencyList= [];
  rateMasterStatus: string;
  chargeName :any;
  isOnlyView: boolean = false;
  userTable:FormGroup;
  chargeType:any = [];
  origin:string;
  destination: string;
  containerSize:string;
  shippingLine:string;
  cargoType:string;
  freightTermName:string;
  ShipmentTypeName:string;
  price:string;
  submitted: boolean = false;
  userdetails: any;
  agentCurrency: any;
  _gc=GlobalConstants;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  emaill:any
  yardcfs:any
  truckTypeList: any = [];
  wagonTypeList: any = [];
  shipmentTypes: any = [];
  loadTypeList: any = [];
  ULDcontainerlist:any =[];
  types:any;
  cargoTypeList: any =[];
  activeFrightAir: Boolean = false
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'fromLocationName',
   'toLocationName',
   'ShipmentTypeName',
   'freightTermName',
   'cargoType',
   'containerSize',
   'shippinglineName',
   'estimatedRate',
   
   
  ];
  isMaster: boolean = false;

  constructor(private commonFunctions: CommonFunctions,private cognito : CognitoService,
    public modalService: NgbModal,
    private notification: NzNotificationService,
    private commonService: CommonService,
    private formBuilder:FormBuilder,
    public _api: ApiService,
    private commonFunction : CommonFunctions,
    private fb: FormBuilder,
    public loaderService: LoaderService,
    private sortPipe: OrderByPipe,) {
    this.addratemaster = this.fb.group({
      // estimatedMargin: ['', [Validators.required]],
      isCustomDestination: [''],
      isCustomOrigin: [''],
      fromLocationName: ['', [Validators.required]],
      toLocationName: ['', [Validators.required]],
      shippingline: ['', [Validators.required]],
      containerType: ['', [Validators.required]],
      estimatedRate: [Number, [Validators.required]],
      // currencyShortName: [this.agentCurrency || '', [Validators.required]],
      shipment_Type: ['', Validators.required],
      status:[true],
      freightTerm: ['',Validators.required],
      wegonType:['',Validators.required],
     truckType:['',Validators.required],
     cargoType:['',Validators.required]
    });
  }

  get f() {
    return this.addratemaster.controls;
  }

  ngOnInit(): void {
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp.userData
      }
    })
    // this.vvoye()
    this.getAirPort();
    this.getPortDropDowns();
    // this.getLocationDropDowns();
    this.getSystemTypeDropDowns();
    this.getShippingLineDropDowns();
    this.getCurrencyDropDowns();
    // this.getAll();
    this.getRateMasterData();
    this.costItem();

    this.userTable = this.formBuilder.group({
      tableRows: this.formBuilder.array([])
    });
    this.getAgent()
  }

  portList: any = []
  getAirPort() {
    let payload = this.commonService.filterList()
    payload.query = {
      ...payload.query,
      status: true,
    }
    this.commonService.getSTList("airportmaster", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: x?.airportmasterId,
          portName: x?.airPortname,
          portTypeName: 'air'
        })
      ));
    });
  }
  getPortDropDowns() {
    let payload = this.commonService.filterList()
 
    if (payload) payload.query = {
      status: true,
    }
    if (payload?.size) payload.size = 15000
    if (payload?.project) payload.project = ["portDetails.portName", "portDetails.portTypeName", "portId"];
 
    this.commonService.getSTList("port", payload)?.subscribe((res: any) => {
      res?.documents?.map(x => (
        this.portList.push({
          portId: x?.portId,
          portName: x?.portDetails?.portName,
          portTypeName: 'port'
        })
      ));
 
 
    });
  }

  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {  "desc" : ['updatedOn'] }
  let mustArray = {};
  payload.query=mustArray;
  this.commonService?.getSTList('ratemaster',payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          fromLocationName: s.fromLocationName,
          toLocationName: s.toLocationName,
          ShipmentTypeName: s.ShipmentTypeName,
          freightTermName: s.freightTermName,
          cargoType: s.cargoType,
          containerSize: s.containerSize,
          shippinglineName: s.shippinglineName,
          estimatedRate: s.estimatedRate,
          freightTerm: s.freightTerm
          
         
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
      } else {
      }
    }, (error: any) => { 
    });
  }

  exportAsExcelFile(): void {
    if (!this.rateMasterList || this.rateMasterList.length === 0) {
      console.error('No data available to export.');
      return;
    }
    const storeEnquiryData = this.rateMasterList.map((row: any) => ({
      'Origin': row.fromLocationName,
      'Destination': row.toLocationName,
      'Freight Type': row.ShipmentTypeName,
      'Load Type': row.freightTermName,
      'Cargo Type': row.cargoType,
      'Size': row.containerSize,
      'Shipping Line': row.shippinglineName,
      'Price': row.estimatedRate,
    }));

    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { 'RateMaster': myworksheet },
      SheetNames: ['RateMaster'],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const fileName = 'Rate-Master.xlsx';
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
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
        this.filterKeys[this.displayedColumns[ind]] = {
          "$regex": each,
          "$options": "i"
        }
    });
    let payload = this.commonService.filterList()
    payload.query = this.filterKeys
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService?.getSTList('ratemaster',payload).subscribe((data) => {
      this.yardcfs = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1+this.from
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
    this.getAll()
    this.getRateMasterData();
  }

  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
getAgent(){
  let payload = this.commonService.filterList()
  if(payload?.query) payload.query = {
     agentId: this.userdetails?.agentId,
     }
  
   this.commonService?.getSTList('agent',payload)?.subscribe((data: any) => {
    this.agentCurrency = data?.documents[0]?.currency
    //  this.addratemaster.get('currencyShortName').setValue(this.agentCurrency)
    //  this.addratemaster.get('currencyShortName').updateValueAndValidity();
   })
}
currencyRate: any = {};
currChange(i) {
  let control = this.userTable.controls.tableRows['controls'][i].controls 
  let currencyShortName = this.currencyList?.filter(x => x?.currencyId ==
    control.currency.value)[0]?.currencyShortName

  let exRate = 0
  if (currencyShortName != this.agentCurrency?.currencyName) {
    let payload = {
      "fromCurrency": currencyShortName,
      "toCurrency": this.agentCurrency?.currencyName,
    }

    if (this.currencyRate.hasOwnProperty(currencyShortName)) {
      exRate = this.currencyRate[currencyShortName]
      control.exchange.patchValue(exRate?.toFixed(3))
      this.handlePriceTotal()
    } else {
      this.commonService.getExchangeRate('exchangeRate', payload)?.subscribe((result) => { 
        this.currencyRate = { ...this.currencyRate, [currencyShortName]: result[this.agentCurrency?.currencyName] }
        exRate = result[this.agentCurrency?.currencyName]
        control.exchange.patchValue(exRate?.toFixed(3))
        this.handlePriceTotal() 
      })
    }

  }
  else {
    exRate = 1
    control.exchange.patchValue(exRate?.toFixed(3))
    this.handlePriceTotal() 
  } 

}

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getRateMasterData();
  }

  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getRateMasterData();
  }
  getAll() {


    let payload = this.commonService.filterList()
    payload.query = {
    }
      payload.sort = { "desc": ['updatedOn'] }

    let mustArray = {};
    // this.name = this.name?.trim();
    // this.category = this.category?.trim();
    // this.description = this.description?.trim();
    // this.refType = this.refType?.trim();
    // this.refCode = this.refCode?.trim();
    // this.parentType = this.parentType?.trim();
    // if (this.name) {
    //   mustArray['typeName'] = {
    //     "$regex": this.name,
    //     "$options": "i"
    //   }
    // }
    // if (this.category) {
    //   mustArray['typeCategory'] = {
    //     "$regex": this.category,
    //     "$options": "i"
    //   }
    // }
    // if (this.description) {
    //   mustArray['typeDescription'] = {
    //     "$regex": this.description,
    //     "$options": "i"
    //   }
    // }

    // if (this.typeActive) {
    //   mustArray['typeActive'] = this.typeActive === 'true' ? true : false
    // }


    // if (this.refType) {
    //   mustArray['typeRef'] = {
    //     "$regex": this.refType,
    //     "$options": "i"
    //   }
    // }

    // if (this.refCode) {
    //   mustArray['typeRefId'] = {
    //     "$regex": this.refCode,
    //     "$options": "i"
    //   }
    // }
    // if (this.parentType) {
    //   mustArray['typeParentType'] = {
    //     "$regex": this.parentType,
    //     "$options": "i"
    //   }
    // }

    payload.query = mustArray

    this.commonService?.getSTList('ratemaster', payload).subscribe((data) => {
      this.rateDate = data.documents;
      
      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          fromLocationName: s.fromLocationName,
          toLocationName: s.toLocationName,
          ShipmentTypeName: s.ShipmentTypeName,
          freightTermName: s.freightTermName,
          cargoType: s.cargoType,
          containerSize: s.containerSize,
          shippinglineName: s.shippinglineName,
          estimatedRate: s.estimatedRate,
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.totalLength = data.totalCount;
      this.count = data.documents.length;
      }
    });
  }

  sortList(array, key) {
    // return this.sortPipelist.transform(array, key);
  }


  search() {
    let mustArray = {};
    this.origin = this.origin?.trim();
    this.destination = this.destination?.trim();
    this.containerSize = this.containerSize?.trim();
    this.shippingLine = this.shippingLine?.trim();
    this.price = this.price?.trim();
    this.ShipmentTypeName = this.ShipmentTypeName?.trim();
    this.freightTermName = this.freightTermName?.trim();
    this.cargoType = this.cargoType?.trim();
  
    if (this.origin) {
      mustArray['fromLocationName'] = {
        "$regex": this.origin,
        "$options": "i"
      }
    }
    if (this.destination) {
      mustArray['toLocationName'] = {
        "$regex": this.destination,
        "$options": "i"
      }
    }
    if (this.ShipmentTypeName) {
      mustArray['freightType'] = {
        "$regex": this.ShipmentTypeName,
        "$options": "i"
      }
    }
    if (this.freightTermName) {
      mustArray['loadType'] = {
        "$regex": this.freightTermName,
        "$options": "i"
      }
    }
    if (this.cargoType) {
      mustArray['cargoType'] = {
        "$regex": this.cargoType,
        "$options": "i"
      }
    }
    if (this.containerSize) {
      mustArray['containerSize'] = {
        "$regex": this.containerSize,
        "$options": "i"
      }
  }
    if (this.shippingLine) {
      mustArray['shippinglineName'] = {
        "$regex": this.shippingLine,
        "$options": "i"
      }
    }

    if (this.price) {
      mustArray['estimatedRate'] = {
        "$regex": this.price,
        "$options": "i"
      }
    }

    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.size = Number(this.size),
      payload.from = 0,
      payload.sort = { "desc": ['updatedOn'] }

    this.commonService?.getSTList('ratemaster', payload).subscribe((data) => {
      this.rateMasterList = data.documents?.map((s: any,index) => {
        return{
          ...s,
          id:index+1
        }
      })
      this.totalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize = 1
    });
  }

  getCurrencyDropDowns() {
    const payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      status : true
    }

    this._api?.getSTList("currency", payload)?.subscribe((res: any) => {
      this.currencyList = res?.documents;
      // this.addratemaster.get('currencyShortName').setValue(this.agentCurrency)
      // this.addratemaster.get('currencyShortName').updateValueAndValidity();
    });
  }
  shipmentTypesList:any=[]
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "status": true,
      typeCategory: {
        $in:[
          'containerType','chargeType','shipmentType','carrierType','wagonType','truckType','ULDcontainerType','cargoType'
        ]
      }
    }
    this.commonService?.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter((x) => x.typeCategory === "containerType");
      this.chargeType = res?.documents?.filter((x) => x.typeCategory === "chargeType");
      this.shipmentTypesList = res?.documents?.filter((x) => x.typeCategory === "shipmentType");
      this.shipmentTypes = res?.documents?.filter(x => x.typeCategory === "carrierType" && (x?.typeName?.toLowerCase() === "ocean" || x?.typeName?.toLowerCase() === "air"));
      this.wagonTypeList = res?.documents?.filter(x => x.typeCategory === "wagonType");
      this.truckTypeList = res?.documents?.filter(x => x.typeCategory === "truckType");
      this.ULDcontainerlist = res?.documents?.filter(x => x.typeCategory === "ULDcontainerType");
      this.cargoTypeList = res?.documents?.filter(x => x.typeCategory === "cargoType");
    });


  }
  showContainer: boolean = false;
  showPallet: boolean = false;
  typeOfWay: string = '';
  railandland: boolean = false;
  airandocean: boolean = false;
  activeFright:any;
  shipmentType() { 
    this.activeFright = this.shipmentTypes?.find(x => x.systemtypeId === this.addratemaster?.value?.shipment_Type)?.typeName?.toLowerCase();
    this.activeFrightAir = this.activeFright === 'air'; // Example condition for setting a flag
    this.updateLoadTypeList(this.activeFright); // Update load type list based on selected freight type
  }

  // Function to update Load Type list based on selected Freight Type
  updateLoadTypeList(activeFright: string) {
    if (activeFright === 'air') {
      this.loadTypeList = this.shipmentTypesList?.filter((x) => ['loose', 'uld container'].includes(x.typeName.toLowerCase()));
    } else if (activeFright === 'ocean') {
      this.loadTypeList = this.shipmentTypesList?.filter((x) => ['fcl', 'lcl', 'break bulk'].includes(x.typeName.toLowerCase()));
    } else if (activeFright === 'land') {
      this.loadTypeList = this.shipmentTypesList?.filter((x) => ['fcl', 'ftl', 'ltl' ,'ptl'].includes(x.typeName.toLowerCase()));
    } else if (activeFright === 'rail') {
      this.loadTypeList = this.shipmentTypesList?.filter((x) => ['fwl'].includes(x.typeName.toLowerCase()));
    } else {
      this.loadTypeList = this.shipmentTypesList;
    }
  }

  // Function to handle changes in Freight Term dropdown
  getTabs(type) {
    const loadName = this.loadTypeList.find((x) => x.systemtypeId === this.addratemaster?.value?.freightTerm)?.typeName.toLowerCase() || '';
    this.types=this.loadTypeList.find((x) => x.systemtypeId === type)?.typeName;

    if (loadName) {
      if (['loose', 'lcl', 'ltl','ptl'].includes(loadName)) {
        this.showPallet = true;
        this.showContainer = false;
        this.addratemaster.controls['containerType'].removeValidators([Validators.required]);
        this.addratemaster.controls['containerType'].updateValueAndValidity();
         this.addratemaster.controls['truckType'].removeValidators([Validators.required]);
        this.addratemaster.controls['truckType'].updateValueAndValidity();
        this.addratemaster.get('wegonType').removeValidators([Validators.required]);
        this.addratemaster.controls['wegonType'].updateValueAndValidity();
      } else if (['break bulk'].includes(loadName)) {
        this.showPallet = false;
        this.showContainer = false;
      } else {
        this.showPallet = false;
        this.showContainer = true;
        if (['uld container', 'fcl'].includes(loadName)) {
          this.typeOfWay = 'Container';
        this.addratemaster.get('truckType').removeValidators([Validators.required]);
        this.addratemaster.get('wegonType').removeValidators([Validators.required]);
        this.addratemaster.controls['wegonType'].updateValueAndValidity();
        this.addratemaster.controls['truckType'].updateValueAndValidity();

        } else if (['ftl'].includes(loadName)) {
          this.addratemaster.get('containerType').removeValidators([Validators.required]);
          this.addratemaster.get('wegonType').removeValidators([Validators.required]);
          this.addratemaster.controls['wegonType'].updateValueAndValidity();
          this.addratemaster.controls['containerType'].updateValueAndValidity();
          this.typeOfWay = 'Truck';
        } else if (['fwl'].includes(loadName)) {
          this.typeOfWay = 'Wagon';
          // this.addratemaster.get('containerType').removeValidators([Validators.required]);
          // this.addratemaster.get('truckType').removeValidators([Validators.required]);
          this.addratemaster.controls['containerType'].removeValidators([Validators.required]);
          this.addratemaster.controls['containerType'].updateValueAndValidity();
           this.addratemaster.controls['truckType'].removeValidators([Validators.required]);
          this.addratemaster.controls['truckType'].updateValueAndValidity();
        }
      }
    } else {
      this.showPallet = false;
      this.showContainer = false;
    }
  }
  getRateMasterData() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.size = this.pageSize,
      payload.from =this.from
    // if(payload?.query)payload.query = {
    //   "ratemasterId": true
    // }
    if(payload?.sort)payload.sort = {
      "desc" : ["updatedOn"]
   }
  //  if(payload?.size)payload.size = Number(this.size)
  //  if(payload?.from)payload.from = this.page - 1;
    this.commonService?.getSTList('ratemaster',payload)?.subscribe((res: any) => {
      this.rateMasterList = res?.documents;
      this.rateDate = res.documents;

      if (res && res?.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          fromLocationName: s?.fromLocationName,
          toLocationName: s?.toLocationName,
          ShipmentTypeName: s?.ShipmentTypeName,
          freightTermName: s?.freightTermName,
          cargoType: s.cargoType,
          containerSize: s?.containerSize,
          shippinglineName: s?.shippinglineName,
          estimatedRate: s?.estimatedRate,
          wegonSize:s?.wegonSize,
          truckSize:s?.truckSize,
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = res.totalCount;
        this.count = res.documents.length;
        this.loaderService.hidecircle(); 
      }
    });
  }
  getShippingLineDropDowns() {
    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      "status": true,
      "$and": [
        {
          "feeder": {
            "$ne": true,
          }
        }
      ]
    }


    this.commonService?.getSTList("shippingline", payload)?.subscribe((res: any) => {
      this.shippingLineList = res?.documents;
    });
  }
  onSave() {
    this.submitted = true;
    
    // Check if the form is invalid
    if (this.addratemaster.invalid) {
      return;
    }
  
    let charges = [];
    const control = this.userTable.get('tableRows') as FormArray;
    
    // Check if control (tableRows) exists and has valid charges
    if (control && control.length > 0) {
      control.value?.map((i) => {
        const charge = this.chargeName?.find((j) => j?.costitemId === i?.chargeName);
        if (charge) {
          charges.push({
            ...i,
            costitemName: charge?.costitemName // Map costitemName correctly
          });
        }
      });
    }
  
    // If no charges are added, display the error and stop execution
    if (charges.length === 0) {
      this.notification.create('error', 'Please add at least one charge before saving.', '');
      return;
    }
  
    const Payload = {
      isCustomDestination: this.addratemaster.value?.isCustomDestination,
      isCustomOrigin: this.addratemaster.value?.isCustomOrigin,
      toLocationName: this.portList.find(location => location?.portId === this.addratemaster.value?.toLocationName)?.portName,
      toLocationId: this.addratemaster.value?.toLocationName,
      fromLocationName: this.portList.find(location => location?.portId === this.addratemaster.value?.fromLocationName)?.portName,
      fromLocationId: this.addratemaster.value?.fromLocationName,
      shippinglineName: this.shippingLineList.find(location => location?.shippinglineId === this.addratemaster.value?.shippingline)?.name,
      shippinglineId: this.addratemaster.value?.shippingline,
      containerTypeId: this.addratemaster.value?.containerType,
      containerSize: (this.types==='ULD Container' ? this.ULDcontainerlist : this.containerTypeList)?.find(i => i?.systemtypeId === this.addratemaster.value?.containerType)?.typeName,
      estimatedRate: this.addratemaster.value?.estimatedRate,
      rateMasterStatus: this.addratemaster.value?.rateMasterStatus,
      orgId: this.commonFunction.getAgentDetails().orgId,
      ShipmentTypeId: this.addratemaster?.value?.shipment_Type,
      ShipmentTypeName: this.shipmentTypes.find(x => x.systemtypeId === this.addratemaster.value.shipment_Type)?.typeName,
      charges: [...charges], // Ensure charges are properly passed
      freightTermId: this.addratemaster.value?.freightTerm,
      freightTermName: this.shipmentTypesList.find(x => x.systemtypeId === this.addratemaster.value.freightTerm)?.typeName,
      wegonTypeId: this.addratemaster?.value?.wegonType,
      wegonSize: this.wagonTypeList.find(x => x.systemtypeId === this.addratemaster.value.wegonType)?.typeName,
      truckTypeId: this.addratemaster?.value?.truckType,
      truckSize: this.wagonTypeList.find(x => x.systemtypeId === this.addratemaster.value.truckType)?.typeName,
      cargoType: this.cargoTypeList.find(location => location?.systemtypeId === this.addratemaster.value?.cargoType)?.typeName,
      cargoTypeId: this.addratemaster.value?.cargoType,
      status: true
    };
  
    // Handle cases based on `types`
    if (this.types === 'Loose') {
      Payload['wegonTypeId'] = '';
      Payload['wegonSize'] = '';
      Payload['truckTypeId'] = '';
      Payload['truckSize'] = '';
      Payload['containerTypeId'] = '';
      Payload['containerSize'] = '';
    } else if (this.types === 'FCL') {
      Payload['wegonTypeId'] = '';
      Payload['wegonSize'] = '';
      Payload['truckTypeId'] = '';
      Payload['truckSize'] = '';
    }
  
    // Check if edit mode or add mode
    if (this.isEdit && this.ratemasterId) {
      this.commonService
        .UpdateToST(`ratemaster/${this.ratemasterId}`, { ...Payload })
        ?.subscribe(
          (res: any) => {
            if (res) {
              this.notification.create('success', 'Record Updated Successfully', '');
              this.onreset();
              this.getRateMasterData();
              this.modalService.dismissAll();
            }
          },
          (error) => {
            this.notification.create('error', error?.error?.error?.message, '');
          }
        );
    } else {
      this.commonService.addToST('ratemaster', Payload)?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Added Successfully', '');
            this.onreset();
            this.modalService.dismissAll();
            this.getRateMasterData();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
    }
  }
  changeStatus(data) {
    this.commonService
      .UpdateToST(`ratemaster/${data.ratemasterId}`,{  status: !data?.status })
      ?.subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            setTimeout(() => {
              this.getRateMasterData()
            }, 2000);
            
          }
        },
        (error) => {
          this.onSave();
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }
  addChargeRow(item?: any, i?): void {
    const row = this.fb.group({

    });

    if (i > -1) {
      this.calcBuyAMT(i)
    }

  }
  getChargeControlsLength(): number {
    return (this.addratemaster.get('charge') as FormArray).length;
  }

  calcBuyAMT(i){

  }
  // getLocationDropDowns() {
  //   let payload = this.commonService?.filterList()
  //   if (payload?.query) payload.query = {
  //     "status": true,
  //   }
  //   payload.size = 15000
  //   payload.project =  ["portDetails.portName", "portDetails.portTypeName", "portId"];
  //   this.commonService
  //     ?.getSTList('port', payload).subscribe((res: any) => {
  //       this.location = res?.documents;
  //     });
  // }

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
  onDelete(deletedata, ratemasters) {
    this.modalService
      .open(deletedata, {
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
            let data =  `ratemaster/${ratemasters?.ratemasterId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
                setTimeout(() => {
                 this.getRateMasterData()
                }, 1000);
              }
            });
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

  getPaginationData(type: any) {
    this.fromSize =
    type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;

  let payload = this.commonService.filterList()
  payload.size = Number(this.size),
  payload.from = this.fromSize - 1,
  payload.sort = {  "desc" : ['updatedOn'] }
  let mustArray = {};

  this.origin = this.origin?.trim();
  this.destination = this.destination?.trim();
  this.containerSize = this.containerSize?.trim();
  this.shippingLine = this.shippingLine?.trim();
  this.price = this.price?.trim();

  if (this.origin) {
    mustArray['fromLocationName'] = {
      "$regex": this.origin,
      "$options": "i"
    }
  }
  if (this.destination) {
    mustArray['toLocationName'] = {
      "$regex": this.destination,
      "$options": "i"
    }
  }
  if (this.containerSize) {
    mustArray['containerType'] = {
      "$regex": this.containerSize,
      "$options": "i"
    }
}
  if (this.shippingLine) {
    mustArray['shippinglineName'] = {
      "$regex": this.shippingLine,
      "$options": "i"
    }
  }

  if (this.price) {
    mustArray['estimatedRate'] = {
      "$regex": this.price,
      "$options": "i"
    }
  }

  payload.query=mustArray;
        this.commonService?.getSTList('ratemaster',payload).subscribe((data: any) => {
      this.rateMasterList = data?.documents;
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

  ratemasterId:any = '';
  open(content, ratemaster?: any, show?) {
    this.show = show;
    this.isEdit = false;
    if (ratemaster) {
      this.isEdit = true;
      this.ratemasterId = ratemaster?.ratemasterId;
      this.addratemaster.patchValue({
        // estimatedMargin: ratemaster?.estimatedMargin,
        isCustomDestination: ratemaster?.isCustomDestination,
        // currencyShortName: ratemaster?.currencyId,
        isCustomOrigin: ratemaster?.isCustomOrigin,
        fromLocationName: ratemaster?.fromLocationId,
        toLocationName:ratemaster?.toLocationId,
        shippingline: ratemaster?.shippinglineId,
        containerType: ratemaster?.containerTypeId,
        estimatedRate: ratemaster?.estimatedRate,
        freightTerm: ratemaster?.freightTermId,
        wegonType: ratemaster?.wegonTypeId,
        shipment_Type:ratemaster?.ShipmentTypeId,
        truckType:ratemaster?.truckTypeId,
        cargoType:ratemaster?.cargoTypeId
      });
      if(ratemaster?.charges){
        const control = this.userTable.get('tableRows') as FormArray;
        ratemaster?.charges?.map((i) => {
          control.push(this.formBuilder.group(i))
        });
      }
      this.shipmentType();
      this.getTabs(ratemaster?.freightTermId);
    }
    // this.addratemaster.get('currencyShortName').setValue(this.agentCurrency)
    // this.addratemaster.get('currencyShortName').updateValueAndValidity();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }
  closeModal() {
    this.modalService.dismissAll();
    this.onreset();
  }
  clear(){
    this.origin='';
    this.destination='';
    this.containerSize='';
    this.shippingLine='';
    this.price='';
    this.getRateMasterData();
  }

  costItem() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    this.commonService?.getSTList('costitem', payload)?.subscribe((data) => {
      this.chargeName = data.documents;

    });
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
      chargeName: ['', Validators.required],
      basis: ['', Validators.required],
      qty: [1,Validators.required],
      currency:['',Validators.required],
      exchange:['',Validators.required],
      price: ['', Validators.required],
      checkboxs:[true]
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
    this.handlePriceTotal();
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


  handlePriceTotal(){
    const control = this.userTable.get('tableRows') as FormArray;
    let total = 0;
    if(control){
      for (let i = 0; i < control.length; i++) {
        const price = control.at(i).get('price');
        const exchange = control.at(i).get('exchange');
        if (price.value) {
          total += Number(price.value) * Number(exchange.value)
        }
      }
    } else {
      total = 0;
    }

    if(total){
      this.addratemaster.get('estimatedRate').setValue(total.toFixed(2));
      this.addratemaster.get('estimatedRate').updateValueAndValidity();
    }

  }
  onreset(){
    this.addratemaster.reset();
    this.userTable.reset();
    const control = this.userTable.get('tableRows') as FormArray;
    control.clear();
    this.submitted = false;
  }
}
