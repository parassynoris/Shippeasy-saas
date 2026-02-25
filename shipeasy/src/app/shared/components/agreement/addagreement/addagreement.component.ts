import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseBody } from '../../../../admin/smartagent/base-body';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import * as _ from 'lodash';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiSharedService } from '../../api-service/api-shared.service';
import { CommonService } from '../../../../../app/services/common/common.service';

@Component({
  selector: 'app-addagreement',
  templateUrl: './addagreement.component.html',
  styleUrls: ['./addagreement.component.css'],
})
export class AddagreementComponent implements OnInit , OnDestroy{
  private ngUnsubscribe = new Subject<void>();
  @Input() editData?: any;
  @Input() isFiledVisiable: any;
  model: NgbDateStruct;
  newPrincipal: FormGroup;
  submitted: boolean;
  currentUrl: any;
  id: any;
  isAddMode: any;
  baseBody: any;
  agreementDetails: any;
  countryData: any = [];
  portData: any = [];
  vesselData: any = [];
  cargoData: any = [];
  principalData: any = [];
  costItemForm: FormGroup;
  clauseForm: FormGroup;
  costItemIdToUpdate: string;
  clauseItemIdToUpdate: string;
  costitemList: any = [];
  agreementCostItems: any = [];
  clauseList: any = [];
  agreementClauses: any = [];
  estimatedCharge: any = 0;
  estimatedPrice: any = 0;
  browseFileName:any = "Browse Files"
  browseFileArray:any = []
  imageError: string;
  isImageSaved: boolean;
  document: any;
  fileTypeNotMatched: boolean;
  base64Output: any;
  minDate = environment.validate.minDate
  currentPath: any;
  doc:any;
  partyid: any = '';
  editMode: boolean = false;
  documents: any =[];
  documentPayload: any = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private notification: NzNotificationService,
    private modalService: NgbModal,
    private sharedService: ApiSharedService,
    private commonService: CommonService
  ) {
    this.currentPath =  this.route.snapshot.params.key;
  }
  backbtn() {
    this.location.back();
  }

  getcountryList() {
    this.commonService.countryList()?.subscribe((res: any) => {
      this.countryData = res.hits.hits;
    });
  }
  getportList() {
    let body = {
      size: 100,
      _source: [],
      query: {
        bool: {
          must: [{"match": {"status": true}}],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.portList(body)?.subscribe((res: any) => {
      this.portData = res.hits.hits;
    });
  }
  getcargoList() {
    this.commonService.cargoList()?.subscribe((res: any) => {
      this.cargoData = res.hits.hits;
    });
  }

  getPrincipalName() {
    let body = {
      size: 500,
      _source: [],
      query: {
        bool: {
          must: [
            {
              match: {
                addresstype: 'principal',
              },
            },{"match": {"status": true}}
          ],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.principalList(body).subscribe((res: any) => {
      this.principalData = res.hits.hits;

    });
  }
  getVesselCategoryList() {
    this.commonService.vesselList()?.subscribe((res: any) => {
      this.vesselData = res.hits.hits;
    });
  }
  ngOnInit(): void {
    this.id = this.route.snapshot.params['bid'];
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.editMode = true;
      this.getSmartAgentDetailById(this.id);
    }
    this.partyid = this.route.snapshot.params['id'];
    this.getcountryList();
    this.getportList();
    this.getVesselCategoryList();
    this.getcargoList();
    this.getPrincipalList()
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.newPrincipal = this.formBuilder.group({
      AgreementTitle: ['', Validators.required],
      Country: ['', Validators.required],
      SelectPortInclude: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      vesselCategory: [''],
      vesselSubtype: [''],
      dwtRange: [''],
      defineDWT: [''],
      defineDWT1: [''],
      cargo: [''],
      cargocategory: [''],
      principalName: [''],
      remark: [''],
      fileupload: [''],
      documentURL: [''],
      costItem: [''],
      document: [''],
    });
    this.costItemForm = this.formBuilder.group({
   
      costitem: ['', Validators.required],
    
      charge: ['', Validators.required],
      price: ['', Validators.required],
    });
    this.clauseForm = this.formBuilder.group({
      clause: ['', Validators.required],
      remarks : ['']
    });
    this.getCostItem();
    this.getClauseList();
  }
  get f() {
    return this.newPrincipal.controls;
  }
  get f1() {
    return this.costItemForm.controls;
  }
  get f2() {
    return this.clauseForm.controls;
  }
  getSmartAgentDetailById(id) {
    this.baseBody = new BaseBody();
    let must = [
      {
        match: {
          agreementId: id,
        },
      },
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.sharedService.getagreementById(this.baseBody.baseBody).subscribe((data: any) => {
      this.agreementDetails = data?.hits?.hits[0]?._source;
      this.documentPayload =  this.agreementDetails?.documents? this.agreementDetails?.documents : []
      this.newPrincipal.patchValue({
        AgreementTitle: this.agreementDetails.AgreementTitle,
        Country: this.agreementDetails.country.countryId,
        SelectPortInclude: this.agreementDetails.Port[0].portId,
        StartDate: this.agreementDetails.agreementDate,
        EndDate: this.agreementDetails.validTill,
        vesselCategory: this.agreementDetails.vesselCategory,
        vesselSubtype: this.agreementDetails.vesselSubtype,
        dwtRange: this.agreementDetails.dwtRange,
        defineDWT: this.agreementDetails.defineDWTto,
        defineDWT1: this.agreementDetails.defineDWTfrom,
        cargo: this.agreementDetails.cargo,
        cargocategory: this.agreementDetails.cargocategory,
        principalName: this.agreementDetails.principalName,
        remark: this.agreementDetails.remark,
        costItem: this.agreementDetails.costItem,
        document: this.agreementDetails.document,
      });
      if (this.agreementDetails.costItem) {
        this.agreementCostItems = this.agreementDetails.costItem;
      }
      if (this.agreementDetails.clauses) {
        this.agreementClauses = this.agreementDetails.clauses;
      }
      if (this.agreementDetails.document) {
        this.document = this.agreementDetails.document;
      }
    });
  }

  getPrincipalList() {
    let body = {
      "size": 1000,
      "sort": {
        "createdOn": "desc"
      },
      "query": {
        "bool": {
          "must": [
            {
              "match": {
                "isPrincipal": true
              }
            }
          ],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }
    this.commonService.getListByURL('profile/list?type=address', body)?.subscribe((principalData: any) => {
      this.principalData = principalData.hits.hits;

    })
  }

  openCost(content, costitem?: any) {
    if (costitem) {
      this.costItemIdToUpdate = costitem?.costitemId;
      this.costItemForm.patchValue({
        costitem: costitem.costitemId,
        charge: costitem.charge,
        price: costitem.price,
      });
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  openClause(content, clause?: any) {
    if (clause) {
      this.clauseItemIdToUpdate = clause?.clauseId;
      this.clauseForm.patchValue({
        clause: clause?.clauseId,
        remarks : clause?.remarks,
      });
    }else{
      this.clauseForm.reset();
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
  }

  onCostSave() {
    this.submitted = false;
    this.costItemIdToUpdate = null;
    this.costItemForm.reset();
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  onClauseSave() {
    this.submitted = false;
    this.clauseItemIdToUpdate = null;
    this.costItemForm.reset();
   
    this.submitted = false;
    this.modalService.dismissAll();
    return null;
  }

  costItemsMasters() {
    this.submitted = true;
    if (this.costItemForm.invalid) {
      return;
    }
    let newCostItems = this.costItemForm.value;

    const selectedItem = this.costitemList.filter(
      (item) => item._id === newCostItems.costitem
    );
    const dataupdate = {
      ...selectedItem[0]?._source,
      ...newCostItems,
    };
    if (this.costItemIdToUpdate) {
      this.agreementCostItems = this.agreementCostItems.map((item) =>
        item.costitemId === this.costItemIdToUpdate ? dataupdate : item
      );
    } else {
      this.agreementCostItems.push(dataupdate);
    }
    this.estimatedCharge = 0;
    this.estimatedPrice = 0;
    this.agreementCostItems.map((item) => {
      this.estimatedCharge += item.charge;
      this.estimatedPrice += item.price;
    });
    this.onCostSave();
  }
  deleteCost(costitem) {
    this.agreementCostItems = this.agreementCostItems.filter(
      (item) => item !== costitem
    );
    this.estimatedCharge = 0;
    this.estimatedPrice = 0;
    this.agreementCostItems.map((item) => {
      this.estimatedCharge += item.charge;
      this.estimatedPrice += item.price;
    });
  }

  clausesMasters() {
    this.submitted = true;
    if (this.clauseForm.invalid) {
      return;
    }
    let newClauses = this.clauseForm.value;

    const selectedItem = this.clauseList.filter(
      (item) => item._id === newClauses.clause
    );
    const dataupdate = [{...selectedItem[0]?._source,
      remarks : this.clauseForm?.get('remarks').value}];

    if (this.clauseItemIdToUpdate) {
      this.agreementClauses = this.agreementClauses.map((item) =>
        item.clauseId === this.clauseItemIdToUpdate ? dataupdate[0] : item
      );
    } else {
      this.agreementClauses.push(dataupdate[0]);
    }
    this.onClauseSave();
  }
  deleteClause(clause) {
    this.agreementClauses = this.agreementClauses.filter(
      (item) => item !== clause
    );
  }

  getCostItem() {
    var parameter = {
      size: 20,
      from: 0,
      query: {
        bool: {
          must: [{"match": {"status": true}}],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.commonService.costItemsList(parameter)?.subscribe((data) => {
      this.costitemList = data.hits.hits;
    });
  }

  getClauseList() {
    this.commonService.clauseList()?.subscribe((data) => {
      this.clauseList = data.hits.hits;
    });
  }
  deleteFile(doc){
    let index = this.documentPayload.findIndex(
      item => item.documentName === doc.documentName
    )
    this.documentPayload.splice(index, 1)
  }
  onSave() {
    this.submitted = true;
    if(this.newPrincipal.get('StartDate').value > this.newPrincipal.get('EndDate').value){
      this.notification.create(
        'error',
        'Start Date must be before End Date',
        ''
      );
      return false
    }
    if(this.newPrincipal.invalid){
      return false
    }
    let countryList = this.countryData.filter(
      (x) => x._source?.countryISOCode === this.newPrincipal.get('Country').value
    );
    let portList = this.portData.filter(
      (x) =>
        x._source?.portId === this.newPrincipal.get('SelectPortInclude').value
    );

    this.documents?.filter((x) => {
      let data = {
        documentId: '',
        document: `https://s3-${environment.AWS_REGION}.amazonaws.com/${environment.bucketName}/agreement/${x.name}`,
        documentName: x.name,
      };
      this.documentPayload.push(data);
    });

    let newdata = {
      tenantId: '',
      orgId: '',
      status: true,
      parentId : this.partyid,
      agreementType: this.isFiledVisiable,
      AgreementTitle: this.newPrincipal.get('AgreementTitle').value,
      country: {
        countryName: countryList[0]?._source?.countryName,
        countryId: countryList[0]?._source?.countryISOCode,
      },

      Port: [
        {
          portId: portList[0]?._source?.portId,
          portName: portList[0]?._source?.portDetails?.portName,
        },
      ],
      agreementDate: this.newPrincipal.get('StartDate').value,
      validTill: this.newPrincipal.get('EndDate').value,
      vesselCategory: this.newPrincipal.get('vesselCategory').value,
      vesselSubtype: this.newPrincipal.get('vesselSubtype').value,
      dwtRange: this.newPrincipal.get('dwtRange').value,
      defineDWTto: this.newPrincipal.get('defineDWT').value,
      defineDWTfrom: this.newPrincipal.get('defineDWT1').value,
      cargo: this.newPrincipal.get('cargo').value,
      cargocategory: this.newPrincipal.get('cargocategory').value,
      principalName: this.newPrincipal.get('principalName').value,
      remark: this.newPrincipal.get('remark').value,
      fileupload: this.browseFileName,
      costItem: this.agreementCostItems,
      clauses: this.agreementClauses,
      documents : this.documentPayload
    };

    if (this.isAddMode) {
      let dataupdate = {
        ...newdata,
      };
      const data = [dataupdate];
      this.sharedService.createAgreement('transaction/agreement', data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Saved Successfully', '');
            if(this.isFiledVisiable.split('/')[0] =="job"){
              this.router.navigate(['job/list/' + this.isFiledVisiable.split('/')[1] + '/' + 'agreement']);
            }else{
              this.backbtn();
            }
          }
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
    } else {
      let dataupdate = {
        ...newdata,
        agreementId: this.id,
      };
      const data = [dataupdate];

      this.sharedService.updateAgreement('transaction/agreement', data).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create('success', 'Updated Successfully', '');
            if(this.isFiledVisiable.split('/')[0] =="job"){
              this.router.navigate(['job/list/' + this.isFiledVisiable.split('/')[1] + '/' + 'agreement']);
            }else{
              this.backbtn();
            }
          }
        },
        (error) => {
          this.notification.create('error',error?.error?.error?.message, '');
        }
      );
    }
  }
  setRemark(){
    const selectedItem = this.clauseList.filter(
      (item) => item?._source?.clauseId === this.clauseForm?.get('clause').value)[0]._source;

      this.clauseForm.patchValue({
        remarks: selectedItem?.remarks
      })
  }
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  delete(deleteCostHeadMap, costitem, key) {
    this.modalService
      .open(deleteCostHeadMap, {
        backdrop: 'static',
        keyboard: false,
        centered: true,
        size: '',

        ariaLabelledBy: 'modal-basic-title',
      })
      .result.then(
        (result) => {
          if (result === 'yes') {
         if(key== 'costitem'){
          this.agreementCostItems = this.agreementCostItems.filter(
            (item) => item !== costitem
          );
          this.estimatedCharge = 0;
          this.estimatedPrice = 0;
          this.agreementCostItems.map((item) => {
            this.estimatedCharge += item.charge;
            this.estimatedPrice += item.price;
          });
         }else if(key== 'clause'){
          this.agreementClauses = this.agreementClauses.filter(
            (item) => item !== costitem
          );
         }
          }
        },
        (reason) => {
          // do nothing.
        }
      );
  }
  setValidation(){
    if(this.newPrincipal.get("defineDWT").value !== ''){
    this.newPrincipal.get("defineDWT1").setValidators([Validators.min(this.newPrincipal.get("defineDWT").value)]);
    }else{
      this.newPrincipal.get("defineDWT1").clearValidators();
    }
  }

  // uploadDoc(event) {
  //   let files = [];
  //   this.documents = [];
  //   files = event.target.files;
  //   for (let i = 0; i < files.length; i++) {
  //     this.commonService.uploadFile(files[i], files[i].name, 'bill');
  //     this.documents.push(event.target.files[i]);
  //   }
  // }

  uploadDoc(event) {
    let files = event.target.files;
    this.documents = [];
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i], files[i].name);
      formData.append('name', files[i].name);
      this.commonService.uploadDocuments('bill', formData).subscribe({
        next: (response) => {
          console.log('File uploaded successfully', response);
        },
        error: (err) => {
          console.error('Error uploading file', err);
        }
      });
    }
  }

}


