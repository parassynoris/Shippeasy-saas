import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/admin/principal/api.service';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { SaMasterService } from 'src/app/services/Sa-Master/sa-master.service';
import { Location } from '@angular/common';
import { differenceInCalendarDays } from 'date-fns';
import { ConditionPopupComponent } from './condition-popup/condition-popup.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-new-local-tariff',
  templateUrl: './new-local-tariff.component.html',
  styleUrls: ['./new-local-tariff.component.css']
})
export class NewLocalTariffComponent implements OnInit {
  @Input() isType: any = 'add';
  @Output() CloseAction = new EventEmitter();
  
  addRuleForm:FormGroup
  submitted:boolean=false
  costitemData:any=[]
  systemTypeList:any=[]
  ruleTypeList:any=[]
  currencyData:any=[]
  validityDate:boolean=false

  menus:any=[{
    name: 'Charges',
    value: 'charges'
  }]
  basisData:any=[
    {
      name:'Invoice Date',
      value:'invoice date'
    },
    {
      name:'Job Date',
      value:'batch date'
    },
    {
      name:'BL Date',
      value:'bl date'
    },
  ]

  variableList:any=[
    {
      name:'--Select--',
      value:''
    },
    {
      name:'Principal',
      value:'principal'
    },
    {
      name:'FPD',
      value:'fpd'
    },
  ]

  condtionList:any=[
    {
      name:'--Select--',
      value:''
    },
    {
      name:'=',
      value:'='
    },
   
  ]
  get f() {
    return this.addRuleForm.controls;
  }
  constructor(private fb : FormBuilder,private mastersService: MastersService,private apiService: ApiService,
    private saMasterService: SaMasterService,   private location: Location, private modalService: NgbModal,) { 
    this.addRuleForm = this.fb.group({
      chargeCode:['',Validators.required],
      chargeDescription:[''],
      ruleName:[''],
      ruleType:[''],
      effectiveDate:[''],
      validity:[''],
      currency:[''],
      menu:[''],
      effectiveDateBasis:[''],
      variableDetails:new FormArray([]),
      basisDetails:new FormArray([])
    })
  }

  ngOnInit(): void {
    this.getCostItem();
    this.getsystemType();
    this.getCurrency()
  }
  getCostItem() {
    var parameter = {
      size: 1000,
      sort: {
        "updatedOn": "desc"
      },
      query: {
        bool: {
          must: [
       
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.mastersService.costItemsList(parameter)?.subscribe((data) => {
      this.costitemData = data.hits.hits;
      
    });
  }

  getsystemType() {
    var parameter = {
      size: 1000,
      sort: {
        "updatedOn": "desc"
      },
      query: {
        bool: {
          must: [
          {
            "match": {
              typeCategory: 'ruleType',
            }
          }
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    
    this.apiService.getMasterList('systemtype', parameter)?.subscribe((res: any) => {
      this.systemTypeList = res.hits.hits;
      this.ruleTypeList = res?.hits?.hits?.filter(x => x._source?.typeCategory === "ruleType");
    });
  }

  getCurrency() {
    var parameter = {
      size: 1000,
      
      sort: { createdOn: 'desc' },
      query: {
        bool: {
          must: [],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.saMasterService.currencyList(parameter)?.subscribe((res: any) => {
      this.currencyData = res.hits.hits;
      
    });
  }

  get variable() {
    return this.addRuleForm.get('variableDetails') as FormArray
  }

  get basis() {
    return this.addRuleForm.get('basisDetails') as FormArray
  }
  getVariablearray(){
    return (this.addRuleForm.get('variableDetails') as FormArray).controls
  }
  getBasisArray(){
    return (this.addRuleForm.get('basisDetails') as FormArray).controls
  }
  addNewVariable(){
    this.variable.push(this.addVAriable(''))
  }
  addVAriable(res?){
    return this.fb.group({
      variable:[res? res.variable:''],
      condition:[res? res.variable:''],
      value:[res? res.variable:'']
    })
  }
  addNewBasis(){
    this.basis.push(this.addBasis(''))
  }
  addBasis(res?){
    return this.fb.group({
      description:[res? res.description:''],
      basis:[res? res.basis:''],
      currency:[res? res.currency:''],
      rate:[res? res.rate:''],
      baseAmount:[res? res.baseAmount:''],
      minAmount:[res? res.minAmount:''],
      maxAmount:[res? res.maxAmount:''],
      included:[res? res.included:'']
    })
  }

  onClose(e){
    this.CloseAction.emit(e);
    this.location.back();
  }

  changeFromDate() {
    this.validityDate = true
    this.addRuleForm.controls.validity.setValue('')
  }
  disabledEtdDate = (current: Date): boolean => {
    this.validityDate = true
    if (this.addRuleForm.controls.effectiveDate.value)
      return (
        differenceInCalendarDays(
          current,
          new Date(this.addRuleForm.controls.effectiveDate.value)
        ) < 0
      );
    else return false;
  };

  checkCondition(){
    const modalRef = this.modalService.open(ConditionPopupComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg'
    });
  }
}
