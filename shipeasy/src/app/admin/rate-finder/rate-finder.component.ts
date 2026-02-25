import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CognitoService } from 'src/app/services/cognito.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/services/common/common.service';
import { PortDetails } from 'src/app/shared/components/port/port';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from 'src/app/shared/functions/common.function';

@Component({
  selector: 'app-rate-finder',
  templateUrl: './rate-finder.component.html',
  styleUrls: ['./rate-finder.component.scss']
})
export class RateFinderComponent implements OnInit {
  truckTypeList: any = [];
  wagonTypeList: any = [];
  ratemasterList: any = [];
  displayStyle = "none";
  co2container20: number = 0;
  co2container40: number = 0;
  error = "No quick quotes available."
  filters: any = {}
  backupfilters: any = {}
  alltype: boolean = true;
  types: any;
  quotationform = new FormGroup({
    from: new FormControl('', Validators.required),
    fromType: new FormControl('Select'),
    toType: new FormControl('Select'),
    to: new FormControl('', Validators.required),
    load: new FormControl('', Validators.required),
    loadTypeID: new FormControl(''),
    branch: this.fb.array([]),
    shipment_Type: new FormControl('', Validators.required),
    customer: new FormControl(''),
    branchs: this.fb.array([]),
    trucks: this.fb.array([]),
    wegon: this.fb.array([]),
  })
  loadTypeList: any = [];
  locationList: any = [];
  cityList: any = [];
  isTransport: boolean = false;
  isExport: boolean = false;
  get f() {
    return this.quotationform.controls;
  }
  loadTypeID: any;
  pagination: number = 1;
  locationtype: any[];
  allLocations: any = [];
  portLocation: any = [];
  fromlocation: any = [];
  tolocation: any = [];
  contentData: any = {};
  isapidata: boolean = false;
  isapidata1: boolean = false;
  isDataArrived: boolean = false;
  quoteratelist: any[] = [];
  quoteratelistBackup: any[] = [];
  showCustomerCurr: boolean = false;
  locationData: any = []
  containerTypeList: any = []
  shipmentTypes: any = [];
  userList: any = [];
  lengthData: any = []
  ULDcontainerlist: any = []
  errorMessage = 'Please Select Port';
  placeholderText = 'Enter Port';
  selectedLoadType: string = '';

  onLocationSearch(e) {
    // this._api.getLocationList(1000,'',e,'').subscribe((res:any)=>{
    //   this.locationlist.next(res.items)

    //   this.locationlist.subscribe((data)=>{
    //     this.locationData = data
    //   })
    //  })

    let payload = this._api.filterList()
    const shipmentType = this.shipmentTypes.find(x => x.systemtypeId === this.quotationform.value.shipment_Type)?.typeName;
    // if (payload) payload.query = {
    //   status: true,
    //   "portDetails.portName": {
    //     "$regex": e,
    //     "$options": "i"
    //   }
    // }
    if (shipmentType === 'Air') {
      payload.query = {
        ...payload.query,
        status: true,
        "airPortname": {
          "$regex": e,
          "$options": "i"
        },
        // 'portDetails.portTypeName' :"Air" 
      }
      this._api.getSTList("airportmaster", payload)?.subscribe((res: any) => {
        this.locationData = res?.documents?.map(x => ({
          portId: x.airportmasterId,
          portName: x.airPortname
        }));
      });
    }else if(shipmentType === 'Land'){
      this.locationData = [...this.cityList]
        .filter(x => 
          (x?.locationName && x?.locationName.toLowerCase().includes(e.toLowerCase())) ||
          (x?.cityName && x?.cityName.toLowerCase().includes(e.toLowerCase())) ||
          (x?.portDetails?.portName && x?.portDetails?.portName.toLowerCase().includes(e.toLowerCase()))
        )
        .map(x => ({
          portId: x?.locationId ? x?.locationId : x?.cityId ? x?.cityId : x?.portId,
          portName: x?.locationName ? x?.locationName : x?.cityName ? x?.cityName : x?.portDetails?.portName,
          locationType : x?.portDetails?.portName ? 'port' : 'location'
        }));  
  }
   else {
      payload.query = {
        ...payload.query,
        status: true,
        "portDetails.portName": {
          "$regex": e,
          "$options": "i"
        },
        "$and": [
          {
            "portDetails.portTypeName": {
              "$ne": "Air"
            }
          }
        ]
      }
      this._api.getSTList("port", payload)?.subscribe((res: any) => {
        
          this.locationData = res?.documents?.map(x => ({
            portId: x.portId,
            portName: x.portDetails.portName
          })); 
        
      });

     
    }

  }

  constructor(private _api: CommonService, private _modal: NgbModal, public _cognito: CognitoService, public commonFunction: CommonFunctions,
    private route: ActivatedRoute, private router: Router, private fb: FormBuilder, public notification: NzNotificationService, 
  ) {
    // this.filters.containerType =  this.masterdata.getSystemType("containertype")
    // this.backupfilters.containerType = this.masterdata.getSystemType("containertype")

    // this.filters.cargotype = this.masterdata.getSystemType("cargotype")
    // this.backupfilters.cargotype = this.masterdata.getSystemType("cargotype")

    //  let res = this.masterdata.getSystemType("customclearance")
    //   this.filters.customclearance = res;
    //   this.backupfilters.customclearance = res
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.openPopup();
    this.getLocationDropDowns()
    this.getCityList()
  }
  getCityList() { 
    let payload = this._api.filterList()
    payload.query = { status: true,
    }
    this._api.getSTList("city", payload).subscribe((data) => {
      this.cityList = data.documents || [];
    });
  }
  getLocationDropDowns() {
    let payload = this._api.filterList()

    if (payload) payload.query = {
      status: true,
      masterType: {
        "$in": ['YARD', 'CFS', 'ICD']
      },
    }
    this._api.getSTList("location", payload)?.subscribe((res: any) => {
      this.locationList = res?.documents; 
    });
  }
  getSystemTypeDropDowns() {
    let payload = this._api.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "containerType", "customClearance", "carrierType", "wagonType", "truckType", "shipmentType", "ULDcontainerType"
        ]
      }
    }

    this._api.getSTList("systemtype", payload)?.subscribe((res: any) => {
      this.containerTypeList = res?.documents?.filter(x => x.typeCategory === "containerType");
      this.filters.customclearance = res?.documents?.filter(x => x.typeCategory === "customClearance");;
      this.backupfilters.customclearance = res?.documents?.filter(x => x.typeCategory === "customClearance");
      // this.shipmentTypes = res?.documents?.filter(x => x.typeCategory === "carrierType");
      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType" && (this.isTransport ? x?.typeName?.toLowerCase() === "land" : x?.typeName?.toLowerCase() === "ocean" || x?.typeName?.toLowerCase() === "air")));

      this.wagonTypeList = res?.documents?.filter(x => x.typeCategory === "wagonType");
      this.truckTypeList = res?.documents?.filter(x => x.typeCategory === "truckType");
      this.loadTypeList = res?.documents?.filter(x => x.typeCategory === "shipmentType");
      this.ULDcontainerlist = res?.documents?.filter(x => x.typeCategory === "ULDcontainerType");
    });
  }
  errorMessagedest='Please Select Port';
  setselect(e){
    this.locationData=[];
    this.quotationform.controls['load'].setValue("");
    this.quotationform.controls['loadTypeID'].setValue("");
    this.quotationform.controls['from'].setValue("");
    this.quotationform.controls['to'].setValue("");
    this.isDropdownOpen = false;
    this.branchs.clear()
    this.wegon.clear()
    this.trucks.clear()
    this.branch.clear()
    this.types = ''
    const selectedType = this.shipmentTypes.find(type => type.systemtypeId === e);
    if (selectedType?.typeName === 'Air') {
      this.errorMessagedest=this.errorMessage = 'Please Select AirPort';
      this.placeholderText = 'Enter AirPort';
      this.placeholderText = 'Enter AirPort';
    } 
    else if (selectedType?.typeName === 'Land') {
      this.errorMessage = 'Please Select Origin';
      this.placeholderText = 'Enter Origin';
      this.errorMessagedest = 'Please Select Destination';
      this.placeholderText = 'Enter Destination';
   
    }
    else {
     this.errorMessagedest=this.errorMessage = 'Please Select Port';
      this.placeholderText = 'Enter Port';
    }
  }
  userdetails: any
  async ngOnInit() {
  
    this._cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userdetails = resp.userData
      }
    })
    this.getCustomers()
    this.getSystemTypeDropDowns()
    this.addNewBranch();
    this.getAgent()
    this.getUomList()


  }
  customerCurrency: any = ''
  exRate: number = 1;
  oncustomerChange(evt?) {
    // this.customerCurrency = this.userList.find(x => x.partymasterId == evt)?.currency?.currencyName || 'USD'

    if(this.agentCurrency.toLowerCase() === 'usd'){
      this.customerCurrency = 'INR'
    }else{
      this.customerCurrency = 'USD'
    }
    if (this.customerCurrency != this.agentCurrency) {
      let payload = {
        "fromCurrency": this.agentCurrency,
        "toCurrency": this.customerCurrency,
      }

      this._api.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {
        this.exRate = result[this.customerCurrency]
      })
    }
    else {
      this.exRate = 1
    }



  }
  agentCurrency: any
  getAgent() {
    let payload = this._api.filterList()
    if (payload?.query) payload.query = {
      agentId: this.userdetails?.agentId,
    }

    this._api.getSTList('agent', payload)?.subscribe((data: any) => {
      this.agentCurrency = data?.documents[0]?.currency?.currencyName || 'INR'
      this.oncustomerChange()
    })
  }
  getCustomers() {
    let payoad = this._api.filterList()
    payoad.query = {
      "status": true
    }
    this._api.getSTList("partymaster", payoad).subscribe((res) => {
      res?.documents?.filter((x) => {
        if (x.customerType) {
          x.customerType.filter((res: any) => {
            if (res?.item_text === 'Shipper') {
              this.userList.push(x)
            }
          })
        }
      })

      const uniqueIds = new Set();
      this.userList = this.userList.filter(item => {
        const isDuplicate = uniqueIds.has(item.partymasterId);
        uniqueIds.add(item.partymasterId);
        return !isDuplicate;
      });

    })
  }

  openWebChat() {
    document.getElementById("zsiq_float")?.click()
  }



  onfromporttypechange(e) {
    // this.fromlocation=this._location.getlocationbyfilter(e.target.value);
    if (this.quotationform.controls['from'].value?.locationType !== e.target.value) {
      this.quotationform.controls['from'].setValue('')
    }
  }
  ontoporttypechange(e) {
    // this.tolocation=this._location.getlocationbyfilter(e.target.value);
    if (this.quotationform.controls['to'].value?.locationType !== e.target.value) {
      this.quotationform.controls['to'].setValue('')
    }
  }

  onSwap(fromOption, from, toOption, to) {
    this.quotationform.get("from").setValue(to);
    this.quotationform.get("to").setValue(from);
    this.quotationform.get("toType").setValue(fromOption);
    this.quotationform.get("fromType").setValue(toOption);
  }
  typesSearch:any;

  searchquotation() {
    this.quotationform.markAllAsTouched();
    this.typesSearch = this.types
    this.isapidata1 = false;
    if (this.quotationform.valid) {
      const shipmentType = this.shipmentTypes.find(x => x.systemtypeId === this.quotationform.value.shipment_Type)?.typeName;

      let from = this.quotationform.value?.from?.portId;
      let to = this.quotationform.value?.to?.portId;
      let unit = this.quotationform.value?.unit;
      let containerType = this.quotationform.value?.containerType;

      let containers = [];
      let wegons = [];
      let FTL = [];
      let PTL = [];
      this.branch?.controls?.forEach((element, index) => {
        const containerType = (this.types === 'ULD container' ? this.ULDcontainerlist : this.containerTypeList).find(x => x.systemtypeId === element.value.containerType)?.typeName;
        containers.push({
          "containerSize": containerType,
          "numberOfContainers": element.value.unit
        })
      });
      this.wegon?.controls?.forEach((element, index) => {
        const wegonType = this.wagonTypeList.find(x => x.systemtypeId === element.value.wegonType)?.typeName;
        wegons.push({
          "wegonSize": wegonType,
          "numberOfWegon": element.value.wegonunit
        })
      });
      this.trucks?.controls?.forEach((element, index) => {
        const truckType = this.truckTypeList.find(x => x.systemtypeId === element.value.truckType)?.typeName;
        FTL.push({
          "truckType": truckType,
          "numberOftruckType": element.value.trucksUnit
        })
      });
      this.branchs?.controls?.forEach((element, index) => {
        console.log(element.value)
        PTL.push({...element.value,
          packageType : element.value.packageType?.toLowerCase()|| '' }
        )
      })
      let payload = {
        "fromLocationId": from,
        "toLocationId": to,
        "freightType": shipmentType,
        "loadType": this.loadTypeList.find(x => x.typeName?.toLowerCase() === this.quotationform?.value?.loadTypeID?.toLowerCase())?.typeName,
        "containers": containers,
        "loose": PTL
      }
      if (!PTL?.length) delete payload?.loose;
      if (shipmentType === 'Air') {
        payload["containers"] = containers;

      } else if (shipmentType === 'Land') {
        payload["FTL"] = FTL;
        payload["PTL"] = PTL;

      } else if (shipmentType === 'Rail') {
        payload["wegons"] = wegons;
      }
      this._api.getSTList1('quotationRate', payload).subscribe(
        (data: any) => {
          if (!data?.rates?.length && data?.rates?.cost) {
            this.quoteratelist = [{
              ...data?.rates,
              fromPort: this.quotationform.value?.from,
              toPort: this.quotationform.value?.to,
              containerType: containers,
              wegonType: wegons
            }]
          } else {
            this.quoteratelist = data?.rates?.map(x => ({
              ...x,
              fromPort: this.quotationform.value?.from,
              toPort: this.quotationform.value?.to,
              containerType: containers,
              wegonType: wegons

            }))
          }
          if (this.quoteratelist.length > 0) {
            this.quoteratelistBackup = this.quoteratelist;
            this.isapidata = true;
            this.isapidata1 = true;
            this.filters.shippingLine = data?.rates
            this.backupfilters.shippingLine = data?.rates
          } else {
            this.isapidata = false;
            this.isapidata1 = true;
            this.error = " No quick quotes available for selected route." + "\n";
            this.quoteratelist = [];
            this.quoteratelistBackup = [];
          }
        }
      )
    } else {
      this.notification.create(
        'error',
        `Please fill required fields`,
        ''
      );
    }
    this.getRateMaster()

  }
  iscontainer40(container) {
    if (container?.startsWith('40') || container?.startsWith('45')) {
      return true
    } else {
      return false
    }
  }


  gotoDetails(id) {

    // this._api.getQuoteRateById(id).subscribe((res:any)=>{
    //    res.items.map((i:any)=>{
    //     i.fromtype = this.quotationform.value?.fromType;
    //     i.totype = this.quotationform.value?.fromType;
    //     i.fromLocation =  this.quotationform.value?.from;
    //     i.toLocation =  this.quotationform.value?.to
    //     i.containertype = this.backupfilters.containerType.filter(i=>res.items[0].containerCode === i?.typeName);
    //     i.cargohandoverdate = new Date(this.quotationform.value.date)
    //   })


    //   this._store.dispatch(setquotetemplate(res.items[0]));

    // })

  }

  pageonchange(e: any) {
    this.pagination = e;
  }

  goToNext() {
    this.router.navigate(['/next-step'])
  }

  goToLogin() {
    this.router.navigate(['/signin'])

  }



  openPopup() {
    this.displayStyle = "show";
  }
  closePopup() {
    this.isDropdownOpen = false;
  }
  isDropdownOpen: boolean = false;
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  submitted: boolean = false;
  // confirmLoad() {
  //   this.submitted = true;
  //   let data = '';
  //   this.branch?.controls.forEach((element, index) => {
  //     if (element.value.unit && element.value.containerType.length > 0) {
  //       const containerType=(this.types==='ULD container'?this.ULDcontainerlist:this.containerTypeList).find(x => x.systemtypeId === element.value.containerType)?.typeName;
  //       if (data === "") {
  //         data += `${this.types ?? ''}`;
  //       }
  //       data += (index >= 1 ? ' | ' : '') + `  ${element.value.unit} *  ${containerType}`;
  //     }
  //   })
  //   this.trucks?.controls.forEach((element, index) => {

  //     if (element.value.trucksUnit && element.value.truckType.length > 0) {
  //       const truckType=this.truckTypeList.find(x => x.systemtypeId === element.value.truckType)?.typeName;
  //       if (data === "") {
  //         data += `${this.types ?? ''}`;
  //       }
  //       data += (index >= 1 ? ' | ' : '') + `${element.value.trucksUnit} * ${truckType}`;
  //     }
  //   })
  //   this.wegon?.controls.forEach((element, index) => {
  //     if (element.value.wegonunit && element.value.wegonType.length > 0) {
  //       const wegonType=this.wagonTypeList.find(x => x.systemtypeId === element.value.wegonType)?.typeName;
  //       if (data === "") {
  //         data += `${this.types ?? ''}`;
  //       }
  //       data += (index >= 1 ? ' | ' : '') + ` ${element.value.wegonunit} * ${wegonType}`;
  //     }
  //   })
  //   this.branchs?.controls.forEach((element, index) => {
  //     if (element.value.quantity && element.value.volumes.length > 0) {
  //       data += (data.length > 0 ? ' | ' : '') + `${element.value.quantity} ${element.value.packageType} * ${element.value.length} x ${element.value.width} x ${element.value.height} ${element.value.dimensionUnit} * ${element.value.weight}${element.value.unit}`;
  //     }
  //   });
  //   this.quotationform.controls['load'].setValue(data);
  //   this.isDropdownOpen = false;

  // }
  confirmLoad() {
    this.submitted = true;
    let data = '';
    let allFieldsValid = true;

    // Check branch fields
    this.branch?.controls.forEach((element, index) => {
      if (element.value.unit && element.value.containerType.length > 0) {
        const containerType = (this.types === 'ULD container' ? this.ULDcontainerlist : this.containerTypeList)
          .find(x => x.systemtypeId === element.value.containerType)?.typeName;
        if (data === "") {
          data += `${this.types ?? ''}`;
        }
        data += (index >= 1 ? ' | ' : '') + ` ${element.value.unit} * ${containerType}`;
      } else {
        allFieldsValid = false;
      }
    });

    // Check truck fields
    this.trucks?.controls.forEach((element, index) => {
      if (element.value.trucksUnit && element.value.truckType.length > 0) {
        const truckType = this.truckTypeList.find(x => x.systemtypeId === element.value.truckType)?.typeName;
        if (data === "") {
          data += `${this.types ?? ''}`;
        }
        data += (index >= 1 ? ' | ' : ' ') + `${element.value.trucksUnit} * ${truckType}`;
      } else {
        allFieldsValid = false;
      }
    });

    // Check wegon fields
    this.wegon?.controls.forEach((element, index) => {
      if (element.value.wegonunit && element.value.wegonType.length > 0) {
        const wegonType = this.wagonTypeList.find(x => x.systemtypeId === element.value.wegonType)?.typeName;
        if (data === "") {
          data += `${this.types ?? ''}`;
        }
        data += (index >= 1 ? ' | ' : '') + ` ${element.value.wegonunit} * ${wegonType}`;
      } else {
        allFieldsValid = false;
      }
    });

    // Check branchs fields with the required fields you provided
    this.branchs?.controls.forEach((element, index) => {
      if (element.valid) { // This will ensure all required fields are filled
        data += (data.length > 0 ? ' | ' : '') +
          `${element.value.quantity} ${element.value.packageType} * ${element.value.length} x ${element.value.width} x ${element.value.height} ${element.value.dimensionUnit} * ${element.value.weight} ${element.value.unit}`;
      } else {
        allFieldsValid = false;
      }
    });

    this.quotationform.controls['load'].setValue(data);

    // Only close the dropdown if all fields are valid
    if (!allFieldsValid) {
      this.notification.create(
        'error',
        `Please fill required fields`,
        ''
      );
    } else {
      this.isDropdownOpen = false;
    }
  }

  get branch() {
    return this.quotationform.controls["branch"] as FormArray;
  }
  addNewBranch() {
    this.branch.push(this.addBranch(''))
  }
  deleteBranch(vIndex: number) {
    this.branch.removeAt(vIndex);
  }
  getTypeId(type) {
    return this.shipmentTypes?.find(x => x.typeName === type)?.systemtypeId ?? "";
  }
  addBranch(res) {
    return this.fb.group({
      unit: [res ? res.unit : '', [Validators.required]],
      containerType: [res ? res.containerType : [], [Validators.required]]
    })

  }
  selectedFilter: any = {}
  handleChangeFilter = ($event: any, catagory: string, name: any) => {

    let dataObj: any = {}
    dataObj[name.shippingLineName] = $event?.target?.checked
    if (name == 'alltype') {
      dataObj = {};
      this.selectedFilter = dataObj
      this.alltype = true;
    } else {
      this.alltype = false;
      this.selectedFilter[catagory] = this.selectedFilter?.[catagory] ? { ...this.selectedFilter?.[catagory], ...dataObj } : dataObj
    }

    this.applyFilter()

  }
  CancelLoad() {
    this.isDropdownOpen = false;
    this.types = '';
    this.quotationform.controls['loadTypeID'].setValue("");
  }
  applyFilter = () => {
    let data = this.quoteratelistBackup
    // contaiener type filter
    if (this.selectedFilter?.shippingLine) {
      let showAll = !Object.keys(this.selectedFilter?.shippingLine).map(key => this.selectedFilter?.shippingLine[key]).find(item => item)

      if (!showAll && !this.selectedFilter?.shippingLine?.['all type'])
        data = data?.filter(item => this.selectedFilter?.shippingLine[item?.shippingLineName]);

    }

    // custom clearance filter
    if (this.selectedFilter?.customsclearance) {
      let showAll = !Object.keys(this.selectedFilter?.customsclearance).map(key => this.selectedFilter?.customsclearance[key]).find(item => item)
      if (!showAll)
        data = data?.filter(item => {
          if (item.customDestination && this.selectedFilter?.customsclearance?.["Destination"]) {
            return true
          }
          if (item.customOrigin && this.selectedFilter?.customsclearance?.["Origin"]) {
            return true
          }
          return false
        })
    }

    this.quoteratelist = data;
    if (this.quoteratelist.length == 0) {
      this.error = " No quick quotes available for selected route." + "\n";
    }
  }

  getKeys(): string[] {
    return this.allChargeDetails?.charges ? Object.keys(this.allChargeDetails.charges) : [];
  }
  allChargeDetails: any;
  seeDetailsView: boolean = false;
  seeDetails(quoterate) {
    this.seeDetailsView = true;
    this.allChargeDetails = quoterate

  }
  sendQuotation(selectedRow?) {
    this.submitted = true;
  
    // Mark all controls as touched to trigger validation messages
    Object.keys(this.quotationform.controls).forEach(field => {
      const control = this.quotationform.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  
    // If the form is invalid, do not proceed
    if (this.quotationform.invalid) {
      return false;
    }
  
    // Reset submitted state
    this.submitted = false;
  
    let containerDetails = [];
  
    if (this.types=== 'FTL') {
      this.trucks?.controls.forEach((element, index) => {
        const containerType=this.truckTypeList.find(x => x.systemtypeId === element.value.truckType)?.typeName;
        containerDetails.push({
          truckType: containerType || '',
          containerType: containerType || '',
          grossWeightContainer: 0,
          noOfContainer: Number(element.value.trucksUnit) || 0,
          unit: ""
        })
      })
    }else{
      this.branch?.controls.forEach((element) => {
        const containerType= (this.types==='ULD container'?this.ULDcontainerlist:this.containerTypeList).find(x => x.systemtypeId === element.value.containerType)?.typeName;
        containerDetails.push({
          containerType: containerType,
          grossWeightContainer: 0,
          noOfContainer: Number(element.value.unit) || 0,
          unit: ""
        })
      })
    }
    let looseDetails = [];
    this.branchs?.controls.forEach((element) => {
      let details = {
        units: Number(element.value.quantity),
        pkgname: element.value.packageType?.toLowerCase() === 'pallets' ? 'Pallets' : 'Boxes/Crates',
        Pallettype: "Pallets (non specified size)"
      };
      if (element.value.packageType?.toLowerCase() === 'pallets') {
        details['lengthp'] = element.value.length;
        details['Weightp'] = element.value.width;
        details['heightp'] = element.value.height;
        details['DimensionUnitp'] = element.value.dimensionUnit;
        details['Weightps'] = element.value.weight;
        details['Unit1p'] = element.value.unit;
        details['volumep'] = element.value.volume;
        details['volumeps'] = element.value.volumes;
      } else {
        details['lengthb'] = element.value.length;
        details['Weightb'] = element.value.width;
        details['heightb'] = element.value.height;
        details['DimensionUnit'] = element.value.dimensionUnit;
        details['Weightbox'] = element.value.weight;
        details['Unit1'] = element.value.unit;
        details['volumebs'] = element.value.volumes;
        details['volumeb'] = element.value.volume;
      }
      looseDetails.push(details);
    });
    let wegonDetails = [];
    this.wegon?.controls.forEach((element, index) => {
      const wegonType = this.wagonTypeList.find(x => x.systemtypeId === element.value.wegonType)?.typeName;
      wegonDetails.push({
        wegonType: wegonType,
        grossWeightContainer: 0,
        noOfwegon: Number(element.value.wegonunit) || 0,
        unit: ""
      })
    })
    let transportDetails = {
      "preCarriage": true,
      "onCarriage": false,
      "origin": [
        {
          "locationType": this.quotationform.value?.from?.locationType,
          "location": this.quotationform.value?.from?.portId,
          "locationName": this.quotationform.value?.from?.portName,
          "etd": "",
          "eta": "",
          "address": "",
          "addressText": "",
          "addressId": "",
          "branch": "",
          "transit": "",
          "carrier": "",
          "carrierList": []
        },
        {
          "locationType": this.quotationform.value?.to?.locationType,
          "location": this.quotationform.value?.to?.portId,
          "locationName": this.quotationform.value?.to?.portName,
          "etd": "",
          "eta": "",
          "address": "",
          "addressText": "",
          "addressId": "",
          "branch": "",
          "transit": "",
          "carrier": "",
          "carrierList": []
        }
      ],
      "destination": []
    }
    let newAgentAdvice = {
      tenantId: '1',
      orgId: this.commonFunction.getAgentDetails().orgId || '',
      customerId: this.customerValue || '',
      userId: this.commonFunction.getAgentDetails().userId || '',
      enquiryId: '',
      agentadviceId: "",
      basicDetails: {
        enquiryDate: new Date(),
        enquiryTypeId: '',
        consigneeId: '',
        consigneeName: '',
        shipperId: this.customerValue,
        shipperName: this.userList.find((x) => x.partymasterId == this.customerValue).name,
        ShipmentTypeId: this.quotationform?.value?.shipment_Type,
        ShipmentTypeName: this.shipmentTypes.find(x => x.systemtypeId === this.quotationform.value.shipment_Type)?.typeName,
        loadType: this.loadTypeList.filter(x => x.typeName?.toLowerCase() === this.quotationform.value.loadTypeID?.toLowerCase())[0]?.typeName,
        loadTypeId: this.loadTypeList.filter(x => x.typeName?.toLowerCase() === this.quotationform.value.loadTypeID?.toLowerCase())[0]?.systemtypeId,
      },
      charges: selectedRow?.charges || [],
      cargoDetail: [],
      routeDetails: {
        loadPortId: this.quotationform.value?.from?.portId,
        loadPortName: this.quotationform.value?.from?.portName,
        destPortId: this.quotationform.value?.to?.portId,
        destPortName: this.quotationform.value?.to?.portName,
        shippingLineId: selectedRow?.shippingLineId || '',
        shippingLineName: selectedRow?.shippingLineName,
        // etd: new Date(),
        // eta: new Date(),
      },
      grossWeightContainer: '',
      backupShippingLine: '',
      backupShippingLineName: '',
      remarksList: [],
      remarks: "remarks",
      enquiryStatus: 'Inquiry Received',
      enquiryStatusCustomer: 'Requested',
      status: true,
      containersDetails: containerDetails || [],
      looseCargoDetails: { cargos: looseDetails },
      wegonDetails: wegonDetails || [], 
      estimate: {
        minPrice: selectedRow?.priceEstimate?.max || 0.00,
        maxPrice: selectedRow?.priceEstimate?.min || 0.00,
        cost: selectedRow?.cost || 0.00,
        finalPrice: 0.00,
        currency: selectedRow?.currency || ''
      },
      transportDetails: this.setType() === 'Land' ? transportDetails : {},
      carrierBookingStatus: 'Pending'
    };
    this._api.addToST('enquiry', newAgentAdvice)?.subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          `Your inquiry for ${res.enquiryNo} number has been generated Successfully..!`,
          ''
        );
        this.cancel()
        this.router.navigate(['/enquiry/list']);
      }
    })
  }
  setValueOrigin(event){ 
    if (event.key === 'Enter') { 
      if (this.locationData.length > 0) { 
        const selectedItem = this.locationData[0];
        this.quotationform.controls['from'].setValue(selectedItem); 
      }
    }
  }
  setValueDesti(event){ 
    if (event.key === 'Enter') { 
      if (this.locationData.length > 0) { 
        const selectedItem = this.locationData[0];
        this.quotationform.controls['to'].setValue(selectedItem); 
      }
    }
  }

  convrtCurrency(cost, currency) {
    let value = 0
    let payload = {
      "fromCurrency": currency,
      "toCurrency": this.commonFunction?.customerCurrency(),
    }

    this._api.getExchangeRate('exchangeRate', payload)?.subscribe((result) => {

      value = result[this.commonFunction?.customerCurrency()] * cost
    })
    return value
  }

  dropdownchange(e) {
    this.selectedLoadType = e;
    this.types = e;
    this.branchs.clear()
    this.wegon.clear()
    this.trucks.clear()
    this.branch.clear()
    if (e === 'ULD container' || e === 'FCL') {

      this.addNewBranch()
    } else if (e === 'loose' || e === 'PTL' || e === 'PTL' || e === 'LCL') {
      this.addNewBranchs();
    } else if (e === 'FWL') {
      this.addNewwegon()

    } else if (e === 'FTL') {
      this.addNewtrucks()
    }

  }
  get branchs() {
    return this.quotationform.get('branchs') as FormArray;
  }

  addNewBranchs() {
    this.branchs.push(this.addBranchs());
  }

  deleteBranchs(index: number) {
    this.branchs.removeAt(index);
  }

  addBranchs(): FormGroup {
    return this.fb.group({
      quantity: ['', Validators.required],
      volumes: ['CBM'],
      width: ['', Validators.required],
      height: ['', Validators.required],
      dimensionUnit: ['mm'],
      weight: ['', Validators.required],
      length: ['', Validators.required],
      unit: ['KG', Validators.required],
      volume: ['', Validators.required],
      packageType: ['', Validators.required]
    });
  }

  getUomList() {
    const payload = { query: { status: true } };
    this._api.getSTList('uom', payload).subscribe((data) => {
      this.lengthData = data.documents.filter((lengthtype: any) => lengthtype.uomCategory === 'Length');
    });
  }

  grossWeightpallet(event: any, empIndex: number) {
    let units = 0;
    const cargosArray = this.branchs;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const selectedHeight = cargo.get('unit')?.value?.toLowerCase();
    switch (selectedHeight) {
      case 'kg':
      case 'KG':
        units = (cargo.get('weight')?.value ?? 0) / 1000;
        break;
      case 'LB':
      case 'lb':
        units = (cargo.get('weight')?.value ?? 0) * 0.4536 / 1000;
        break;
      default:
        units = 0;
    }
    const roundedUnits = units.toFixed(2);
    cargo.get('weightpsCalculatedplt')?.setValue(roundedUnits);
  }

  totalVolume(event: any, empIndex: number) {
    const cargosArray = this.branchs;
    const cargo = cargosArray.at(empIndex) as FormGroup;
    const dimensionUnit = cargo.get('dimensionUnit')?.value?.toLowerCase();

    let units = 0;
    switch (dimensionUnit) {
      case 'inches':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0) / 61023.8;
        break;
      case 'cms':
      case 'cm':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0) / 1000000;
        break;
      case 'CM':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0) / 1000000;
        break;
      case 'IN':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0) * 0.000016387064;
        break;
      case 'meter':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0);
        break;
      case 'millimetre':
      case 'mm':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0) / 1000000000;
        break;
      case 'ft':
        units = (cargo.get('height')?.value ?? 0) * (cargo.get('width')?.value ?? 0) * (cargo.get('length')?.value ?? 0) / 35.315;
        break;
      default:
        units = 0;
    }

    const roundedUnits = units;
    const totalUnits = roundedUnits * (cargo.get('quantity')?.value ?? 0);
    cargo.get('volume')?.setValue(totalUnits);
  }
  get trucks() {
    return this.quotationform.controls["trucks"] as FormArray;
  }
  addNewtrucks() {
    this.trucks.push(this.addtrucks(''))
  }
  deletetrucks(vIndex: number) {
    this.trucks.removeAt(vIndex);
  }
  addtrucks(res) {
    return this.fb.group({
      trucksUnit: [res ? res.trucksUnit : '', [Validators.required]],
      truckType: [res ? res.truckType : [], [Validators.required]]
    })

  }
  get wegon() {
    return this.quotationform.controls["wegon"] as FormArray;
  }
  addNewwegon() {
    this.wegon.push(this.addwegon(''))
  }
  deletewegon(vIndex: number) {
    this.wegon.removeAt(vIndex);
  }
  addwegon(res) {
    return this.fb.group({
      wegonunit: [res ? res.wegonunit : '', [Validators.required]],
      wegonType: [res ? res.wegonType : [], [Validators.required]]
    })

  }
  getRateMaster() {
    let payload = this._api.filterList()
    payload.query = {
      "fromLocationName": this.quotationform.value?.from?.portName,
      "toLocationName": this.quotationform.value?.to?.portName,
    }
    this._api?.getSTList('ratemaster', payload).subscribe((res: any) => {
      this.ratemasterList = res.documents

    });
  }
  setType() {

    const shipmentType = this.shipmentTypes.find(x => x.systemtypeId === this.quotationform.value.shipment_Type)?.typeName;
    return shipmentType?.toLowerCase()
  }
  sendLandRequest() {

  }
  customerValue:any;
  selectedRowData : any;
  openCustomer(content,data?){
    this.selectedRowData = data;
    this._modal.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    });
  }
  cancel(){
    this.customerValue=null;
    this._modal.dismissAll();
  }
}

