import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { LoaderService } from 'src/app/services/loader.service';
import { FormControl,FormGroup,FormBuilder,Validators,} from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ApiService } from 'src/app/admin/principal/api.service'; 
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { ApiSharedService } from '../api-service/api-shared.service';
import * as XLSX from "xlsx";
import { CommonService } from 'src/app/services/common/common.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonFunctions } from '../../functions/common.function';
import { CognitoService } from 'src/app/services/cognito.service';
import { CostHead, CostItem, Currency, SystemType, Tax, chargeTypetypeList } from 'src/app/models/cost-items';
import { Location } from 'src/app/models/yard-cfs-master';
import { uom } from 'src/app/models/uom';
import { MastersSortPipe } from '../../util/mastersort';
import { MatDrawer } from '@angular/material/sidenav';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';

@Component({
  selector: 'app-cost-items',
  templateUrl: './cost-items.component.html',
  styleUrls: ['./cost-items.component.scss'],
})
export class CostItemsComponent implements OnInit {
  costitemData: CostItem[] = [];
  fromSize: number = 1;
  costItemForm: FormGroup;
  tenantId: string;
  chargeTypeList: any = [];
  get disabled() {
    if(this.show=='show'){
      return this.costItemForm.get('chargeapp').disable
    }
  }
  costItemIdToUpdate: string;
  PARAMETER_OBJECT: string;
  closeResult: string;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  submitted: boolean = false;
  category: string;
  type: string;
  tags: string;
  name: string;
  unit: string;
  image: string;
  chargable: string;
  finance: string;
  item_group: string;
  chargeGroup: string;
  is_active: string;
  itemCategorylist: any = [];
  itemTypelist: any = [];
  itemUnitlist: any = [];
  uomList: uom[] = [];
  costHeadList: CostHead[] = [];
  filterBody = this.apiService.body;
  // chargeTypetypeList: any = [
  //   "Import", "Export", "Vendor", "Fixed"
  // ] Commented this code for temporary after recheck removing it!
  chargeTypetypeList: chargeTypetypeList[] = [ { type: "Import" },
  { type: "Export" },
  { type: "Vendor" },
  { type: "Fixed" }]
  listOfTagOptions = [];
  settings = {
    singleSelection: false,
    idField: 'type',
    textField: 'type',
    enableCheckAll: false,
    allowSearchFilter: false,
    limitSelection: -1,
    clearSearchFilter: true,
    maxHeight: 197,
    itemsShowLimit: 3,
    closeDropDownOnSelection: false,
    showSelectedItemsAtTop: false,
    defaultOpen: false,
  };
  currencyList: Currency[]=[];
  currencyModel: any;
  locationList:Location[]=[];
  HeaderList:SystemType [] = [];
  show: any;
  taxApplicabilityList : any = [];
  _gc=GlobalConstants

  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [10,20, 50, 100];
  email:any
  yardcfs:any
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns =[
    '#', 
    'action',
   'costitemName',
   'costitemGroup',
   'chargeTypeName',
    'chargeGroup',
    'currency',
    'status'
  ];
  isMaster: boolean = false;

  constructor(
    public loader: LoaderService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private _api: ApiService,
    private commonService: CommonService,
    private mastersService: MastersService,
    private router: ActivatedRoute,
    private notification: NzNotificationService,
    private profilesService: ProfilesService,private cognito : CognitoService,
    public apiService: ApiSharedService,
    private commonfunction: CommonFunctions,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) {
    this.formBuild()
  }

  formBuild() {
    this.costItemForm = this.fb.group({
      costitemName: new FormControl('', [Validators.required]),
      costitemGroup: new FormControl(''),
      chargeAmt: new FormControl(''),
      accountCode: new FormControl(''),
      defaultExportCharge: new FormControl(''),
      defaultTransportCharge: new FormControl(''),
      defaultImportCharge: new FormControl(''),
      chargeapp: new FormControl(''), 
      gst: new FormControl('', [Validators.required]), 
      chargeType: new FormControl('', [Validators.required]),
      currency: new FormControl('', [Validators.required]),
      chargeGroup: new FormControl(''),
      sacCode: new FormControl(''),
      shortCode: new FormControl(''),
      hsnCode: ['', Validators.required],
      tax_applicability_charge: new FormControl(''),
      isActive: new FormControl(true)
    });
  }
  ngOnInit(): void {
    // this.vvoye();
    this.getCostItem();
    this.getUomList();
    this.getCurrencyList()
    this.getCostHeadList();
    this.getHSNList()
    this.getLocationDropDowns();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  capitalizeWords(controlName: string): void {
    const control = this.costItemForm.get(controlName);
    if (control) {
      control.setValue(
        control.value.replace(/\b\w/g, (char) => char.toUpperCase()),
        { emitEvent: false }
      );
    }
  }
  

  vvoye() {
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }

  let mustArray = {};
   payload.query = mustArray
    this.commonService.getSTList('costitem', payload).subscribe((res: any) => {
      if (res && res.documents) {
        this.dataSource.data = res.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1,
          costitemName: s.costitemName,
          costitemGroup: s.costitemGroup,
          chargeTypeName: s.chargeTypeName,
          chargeGroup: s.chargeGroup,
          currency: s.currency,
          status: s.status
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
    this.email.map((row: any) => {
      storeEnquiryData.push({
        'locationName' : row?.element?.locationName,
        'Country' : row?.element?.country        ,
        'State' : row?.element?.state
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
    this.commonService.getSTList('costitem', payload).subscribe((data) => {
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
    this.getCostItem()
  }

  get f() {
    return this.costItemForm.controls;
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
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
    this.getCostItem();
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
  
    let payload = this.commonService.filterList()
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = this.fromSize -1;
   let mustArray = {};
    this.type = this.type?.trim();
    this.tags = this.tags?.trim();
    this.name = this.name?.trim();
    this.currencyModel = this.currencyModel?.trim();
    this.chargeGroup = this.chargeGroup?.trim();
    this.item_group = this.item_group?.trim();
    this.is_active = this.is_active?.trim();

        if (this.type) {
          mustArray['chargeTypeName'] = {
            "$regex" : this.type,
            "$options": "i"
        }
        }
   
    if (this.tags) {
      mustArray['costitemTags'] = {
        "$regex" : this.tags,
        "$options": "i"
    }
    }
    if (this.name) {
      mustArray['costitemName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }
    if (this.currencyModel) {
      mustArray['currency'] = {
        "$regex" : this.currencyModel,
        "$options": "i"
    }
      
    }
    if (this.chargeGroup) {
      mustArray['chargeGroup'] = {
        "$regex" : this.chargeGroup,
        "$options": "i"
    }
    }
    if (this.item_group) {
      mustArray['costitemGroup'] = {
        "$regex" : this.item_group,
        "$options": "i"
    }
    }
    if (this.is_active) {
      mustArray['status'] = this.is_active === 'true' ? true : false
    }
payload.query = mustArray
    this.commonService.getSTList('costitem', payload).subscribe((data) => {
      this.costitemData = data.documents;
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

  getLocationDropDowns() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
      masterType:   {
        "$in": ['YARD','CFS','ICD']
      },
    }
    this.commonService.getSTList('location', payload)?.subscribe((res: any) => {

      this.locationList = res?.documents;
    });
  }

  getCurrencyList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('currency', payload)
      ?.subscribe((data) => {
        this.currencyList = data.documents;
      });
  }
  getUomList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true
    }
    this.commonService.getSTList('uom', payload)?.subscribe((data) => {
      this.uomList = data.documents;
    });
  }
  hsnCodeList:Tax[]=[]
  hnstex:any
  getHSNList(){
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    this.commonService.getSTList('taxtype', payload)?.subscribe((res: any) => {
      
      this.hsnCodeList = res?.documents;
    });
  }
  onChargeSelect(selectedHsnCode: string) {
    // Find the object in hsnCodeList that matches the selected HSN code
    const hsnCodeObj = this.hsnCodeList.find(charge => charge.hsnCode === selectedHsnCode);
    if (hsnCodeObj) {
      // Set the tax rate to the form control if the HSN code is found
      this.hnstex = hsnCodeObj.taxRate;
      this.costItemForm.get('gst')?.setValue(this.hnstex);
    } else {
      console.error('HSN code not found in the list');
    }
  }
  
  getCostHeadList() {
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
      "status": true,
    }
    this.commonService.getSTList('costhead', payload)?.subscribe((data) => {
      this.costHeadList = data.documents;
    });
  }

  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          'shippingTerm','itemType','itemUnit','Charge Unit','chargeUnit','chargeHeader','taxApplicability','chargeType'
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)
      .subscribe((res: any) => {
        this.HeaderList = res?.documents?.filter(x => x.typeCategory === "chargeHeader");
        this.taxApplicabilityList = res?.documents?.filter(x => x.typeCategory === "taxApplicability");
        this.chargeTypeList = res?.documents?.filter(x => x.typeCategory === "chargeType");
        this.itemCategorylist = res?.documents;
      });
  }

  search() {
    let mustArray = {};
    this.type = this.type?.trim();
    this.tags = this.tags?.trim();
    this.name = this.name?.trim();
    this.currencyModel = this.currencyModel?.trim();
    this.chargeGroup = this.chargeGroup?.trim();
    this.item_group = this.item_group?.trim();
    this.is_active = this.is_active?.trim();

        if (this.type) {
          mustArray['chargeTypeName'] = {
            "$regex" : this.type,
            "$options": "i"
        }
        }
   
    if (this.tags) {
      mustArray['costitemTags'] = {
        "$regex" : this.tags,
        "$options": "i"
    }
    }
    if (this.name) {
      mustArray['costitemName'] = {
        "$regex" : this.name,
        "$options": "i"
    }
    }
    if (this.currencyModel) {
      mustArray['currency'] = {
        "$regex" : this.currencyModel,
        "$options": "i"
    }
      
    }
    if (this.chargeGroup) {
      mustArray['chargeGroup'] = {
        "$regex" : this.chargeGroup,
        "$options": "i"
    }
    }
    if (this.item_group) {
      mustArray['costitemGroup'] = {
        "$regex" : this.item_group,
        "$options": "i"
    }
    }
    if (this.is_active) {
      mustArray['status'] = this.is_active === 'true' ? true : false
    }


    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('costitem', payload).subscribe((data) => {
      this.costitemData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  clear() {
    this.category = '';
    this.type = '';
    this.tags = '';
    this.name = '';
    this.unit = '';
    this.image = '';
    this.chargable = '';
    this.finance = '';
    this.currencyModel = ''
    this.item_group = '';
    this.chargeGroup = '';
    this.is_active = '';
    this.getCostItem();
  }

  pageNumber = 1;
  pageSize = 10;
  from = 0;
  totalCount = 0;

  onPageChange(event){
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex*event.pageSize ;
    this.getCostItem();
  }

  getCostItem() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList() 
    if(payload?.size)payload.size= this.pageSize,
    payload.from=this.from
    if(payload?.query){
      payload.query = {
      }
    }
    if(payload?.sort){
      payload.sort = {
        "desc" : ["updatedOn"]
     }
    }
    // if(payload?.size){
    //   payload.size = Number(this.size)
    // } 
    // if(payload?.from){
    //   payload.from = this.page -1
    // }  
    this.commonService.getSTList('costitem', payload)?.subscribe((data) => {
      this.costitemData = data.documents; 

      if (data && data?.documents) {
        this.dataSource.data = data.documents.map((s: any, i: number) => ({
          ...s,
          id: i + 1+this.from,
          costitemName: s.costitemName,
          costitemGroup: s.costitemGroup,
          chargeTypeName: s.chargeTypeName,
          chargeGroup: s.chargeGroup,
          currency: s.currency,
          status: s.status
          
        }));
        // this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1; 
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
      }
      this.loaderService.hidecircle();
    });
  }
  costItemsMasters() {
   
    
    this.submitted = true;
    if (this.costItemForm.invalid && this.listOfTagOptions?.length === 0) {
      return;
    }
   let taxRate  =  this.hsnCodeList?.filter(x=> x.hsnCode === this.costItemForm.value.hsnCode)[0]?.taxRate

    let newCostItems = {
      "tenantId": this.tenantId,
      costitemName: this.costItemForm.value.costitemName,
      costitemGroup: this.HeaderList.filter((x) => x.systemtypeId === this.costItemForm.controls.costitemGroup.value
      )[0]?.typeName,
      costitemGroupId: this.costItemForm.value.costitemGroup,
      defaultImportCharge: this.costItemForm.value.defaultImportCharge,
      defaultExportCharge: this.costItemForm.value.defaultExportCharge,
      defaultTransportCharge : this.costItemForm.value.defaultTransportCharge,
      chargeAmount: this.costItemForm.value.chargeAmt,
      accountCode: this.costItemForm.value.accountCode,
      gst : this.costItemForm.value.gst,
      chargeApplicable: this.listOfTagOptions,
      chargeType: this.costItemForm.value.chargeType,
      chargeTypeName : this.chargeTypeList.filter((x)=> x?.systemtypeId == this.costItemForm.value.chargeType)[0].typeName || '',
      currencyId: this.costItemForm?.controls?.currency?.value,
      currency: this.currencyList?.filter((x) => x?.currencyId === this.costItemForm?.controls?.currency?.value
      )[0]?.currencyShortName,
      exchangeRate: this.currencyList?.filter(x => x?.currencyId ==
        this.costItemForm?.controls?.currency?.value)[0]?.currencyPair,
      chargeGroup: this.costItemForm.value.chargeGroup,
      hsnType: this.costItemForm.value.sacCode,
      shortCode: this.costItemForm.value.shortCode,
      hsnCode: this.costItemForm.value.hsnCode,
      tax_applicability_charge : this.costItemForm.value.tax_applicability_charge,
      tax_applicability_name: this.taxApplicabilityList?.filter((x) => x?.systemtypeId === this.costItemForm?.controls?.tax_applicability_charge?.value
      )[0]?.typeName,
      taxRate: taxRate,
     
      status: this.costItemForm.value.isActive,
      "orgId": this.commonfunction.getAgentDetails()?.orgId,

    };
    this.loader.showcircle();

    if (!this.costItemIdToUpdate) {
      const dataupdate = newCostItems;
      this.commonService.addToST('costitem',dataupdate).subscribe(
        (res: any) => {
          if (res) {
            this.onSave();
            this.notification.create('success', 'Added Successfully', '');
            this.getCostItem();
          }
        },
        (error) => { 
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    } else {
      const dataWithUpdateID = {
        ...newCostItems,
        costitemId: this.costItemIdToUpdate,
      };
      this.commonService.UpdateToST(`costitem/${dataWithUpdateID.costitemId}`,dataWithUpdateID).subscribe(
        (result: any) => {
          if (result) {
            this.modalService.dismissAll();
            this.notification.create('success', 'Updated Successfully', '');
            this.onSave();
            this.getCostItem();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message , '');
        }
      );
    }
  }

  delete(deletecostitem, id) {
    this.modalService
      .open(deletecostitem, {
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
            let data = `costitem/${id.costitemId}`
            
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.onSave();
                this.notification.create('success', 'Deleted Successfully', '');
                this.clear();
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

  open(content, costitem?: any,show?) {
    this.show = show;
    if (costitem) {
      this.costItemIdToUpdate = costitem?.costitemId;
      this.listOfTagOptions = costitem?.chargeApplicable || []
      this.costItemForm.patchValue({
        costitemName: costitem.costitemName,
        costitemGroup: costitem.costitemGroupId,
        chargeAmt: costitem.chargeAmount,
        accountCode: costitem.accountCode,
        defaultImportCharge: costitem.defaultImportCharge,
        defaultExportCharge: costitem.defaultExportCharge,
        defaultTransportCharge : costitem.defaultTransportCharge,
        gst : costitem.gst,
        chargeType: costitem?.chargeType,
        currency: costitem?.currencyId,
        chargeGroup: costitem.chargeGroup,
        sacCode: costitem.hsnType,
        shortCode: costitem.shortCode,
        hsnCode: costitem.hsnCode,
        tax_applicability_charge : costitem.tax_applicability_charge,
        isActive: costitem.status,

      });
      show === 'show'?this.costItemForm.disable():this.costItemForm.enable()
    }
    this.getSystemTypeDropDowns();
    const model = this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });

    model.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    });
  }
  changeStatus(data) {
    this.commonService.UpdateToST(`costitem/${data.costitemId}`,{ ...data, status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.search();
            var myInterval = setInterval(() => {
              this.onSave();
              this.getCostItem();
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
    this.submitted = false;
    this.costItemIdToUpdate = null;
    this.formBuild()
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }
  checked(key, $event, form) {
    this.modalService
      .open(key, {
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
            this.costItemForm.controls[form].setValue($event.target.checked);
          } else {
            this.costItemForm.controls[form].setValue(!$event.target.checked);
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.costitemData.map((row: any) => {
      storeEnquiryData.push({
        'Charge Name': row.costitemName,
        'Charge Head': row.costitemGroup,
        'Charge Type': row.chargeType,
        'Charge Group': row.chargeGroup,
        'Currency': row.currency,
        'Status': row.status ? 'Active': "Inactive",
      });
    });
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

    const fileName = 'charge-master.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }
  openPDF() {
    const prepare=[];
    this.costitemData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.costitemName);
      tempObj.push(e.costitemGroup);
      tempObj.push(e.chargeType);
      tempObj.push(e.chargeGroup);
      tempObj.push(e.currency);
      tempObj.push(e.status? 'Active': 'Inactive');
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Charge Name','Charge Head','Charge Type','Charge Group','Currency','Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('charge-master' + '.pdf');
  }
}

export class chargeType {
  data: any = [
    { "name": "Import" },
    { "name": "Export" },
    { "name": "Vendor" },
    { "name": "Fixed" }
  ]
}
