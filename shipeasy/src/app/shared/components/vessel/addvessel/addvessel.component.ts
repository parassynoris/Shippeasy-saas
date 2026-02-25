import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WizardComponent } from 'angular-archwizard';
import { NzNotificationService } from 'ng-zorro-antd/notification'; 
import { BaseBody } from 'src/app/admin/smartagent/base-body';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-addvessel',
  templateUrl: './addvessel.component.html',
  styleUrls: ['./addvessel.component.scss'],
})
export class AddvesselComponent implements OnInit {
  @Output() VesselSection = new EventEmitter<string>();
  show1: boolean;
  vesselMastersForm: FormGroup;
  vesselMastersFormOne: FormGroup;
  vesselMastersFormTwo: FormGroup;
  vesselMastersFormThree: FormGroup;
  zeroStep: any;
  @ViewChild(WizardComponent)
  public wizard: WizardComponent;
  firstStep: any;
  secondStep: any;
  thirdStep: any;
  submitted: any = false;
  id: any;
  isAddMode: any;
  baseBody: any;
  vesselDetails: any;
  systemData:any;
  vesselData:any;
  tenantId: any;

  constructor(
    private mastersService: MastersService,
    private fb: FormBuilder,
    private api: CommonService,
    private router: Router, private cognito : CognitoService,
    private route: ActivatedRoute,
    private notification: NzNotificationService,
    
  ) {
    this.mastersService = mastersService;
    this.fb = fb;
    this.api = api;
    this.router = router;
    this.cognito = cognito;
    this.route = route
    this.notification = notification;
    
    this.vesselMastersForm = this.fb.group({
      mvmt: new FormControl('', Validators.required),
      vesselName: new FormControl('', Validators.required),
      lloydsImoNo: new FormControl('', Validators.required),
      vesselFlag: new FormControl('', Validators.required),
      callSign: new FormControl('', Validators.required),
      built: new FormControl('', Validators.required),
      type: new FormControl('', Validators.required),
      subtype: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      ownership: new FormControl('', Validators.required),
      portOfRegistry: new FormControl(''),
      piclub: new FormControl(''),
      registrationNumber: new FormControl(''),
      refferedBankAccounts: new FormControl(''),
      classificationSociety: new FormControl(''),
      igs: new FormControl(''),
      shipManager: new FormControl(''),
      integrationId: new FormControl(''),
      effectiveDate: new FormControl('', Validators.required),
      isActive: new FormControl('', Validators.required),
      gt: new FormControl(''),
      nt: new FormControl(''),
      rgt: new FormControl(''),
      sdwt: new FormControl(''),
      sbt: new FormControl(''),
      panamagt: new FormControl(''),
      panamant: new FormControl(''),
      suezgt: new FormControl(''),
      sueznt: new FormControl(''),
    });
    this.vesselMastersFormOne = this.fb.group({
      draftsw: new FormControl(''),
      loa: new FormControl(''),
      beam: new FormControl(''),
      moduleDepth: new FormControl(''),
      lbp: new FormControl(''),
      cbm: new FormControl(''),
      winterswDeadwt: new FormControl(''),
      tropicalswDeadwt: new FormControl(''),
      tropicalfwDeadwt: new FormControl(''),
      engineType: new FormControl(''),
      noOfEngines: new FormControl(''),
      enginePower: new FormControl(),
      propulsionType: new FormControl(''),
      noOfPropellers: new FormControl(''),
      noOfSternThruster: new FormControl(''),
      noOfBowThruster: new FormControl(''),
      bowThrusterPower: new FormControl(''),
      maxSpeed: new FormControl(''),
      noOfCranes: new FormControl(''),
      noOfHatches: new FormControl(''),
      grain: new FormControl(''),
      capacityOfCranes: new FormControl(''),
      noOfHold: new FormControl(''),
      noOfGrabs: new FormControl(''),
      satellitePhone: new FormControl(''),
      satelliteFax: new FormControl(''),
      cellPhone: new FormControl(
        '',
        Validators.pattern(environment.validate.phone)
      ),
      email: new FormControl(
        '',
        Validators.pattern(environment.validate.email)
      ),
      telexNo: new FormControl(''),
      masterName: new FormControl(''),
    });
    this.vesselMastersFormTwo = this.fb.group({
      creationDate: new FormControl(''),
      checkedDate: new FormControl(''),
      matchStrength: new FormControl(''),
      sanctionName: new FormControl(''),
      matchCategoryType: new FormControl(''),
      registeredCountry: new FormControl(''),
      status: new FormControl(''),
      description: new FormControl(''),
      entityType: new FormControl(''),
      sources: new FormControl(''),
      comments: new FormControl(''),
      isOwnerPdf: new FormControl(true),
      ownersPDFPercent: new FormControl(''),
      isChartererPdf: new FormControl(false),
      charterersPDFPercent: new FormControl(''),
      vesselIMO: new FormControl('', Validators.required),
      vesselRegistrationDate: new FormControl('', Validators.required),
      operator: new FormControl('', Validators.required),
      legalEntity: new FormControl('', Validators.required),
      ownersPDFToMail: new FormControl(
        '',
        Validators.pattern(environment.validate.email)
      ),

      ownersPDFCCMail: new FormControl(
        '',
        Validators.pattern(environment.validate.email)
      ),
      ownersPDFEmailText: new FormControl(''),
      chartererPDFToMail: new FormControl(
        '',
        Validators.pattern(environment.validate.email)
      ),
      chartererPDFCCMail: new FormControl(
        '',
        Validators.pattern(environment.validate.email)
      ),
      chartererPDFEmailText: new FormControl(''),
  
    });
    this.vesselMastersFormThree = this.fb.group({
      vesselEmail: new FormControl(
        '',
        Validators.pattern(environment.validate.email)
      ),
      pdaAdvancePercentage: new FormControl(''),
      afAdvancePercentage: new FormControl(''),
      idaAdvancePercentage: new FormControl(''),

    });
  }
  ngOnInit(): void {
    this.id = this.route.snapshot?.params['id'];
    this.isAddMode = !this.id;
    if (!this.isAddMode) {
      this.getvesselDetailById(this.id);
    }
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.tenantId = resp.tenantId
      }
    }) 
  }
  get f() {
    return this.vesselMastersForm.controls;
  }
  get f1() {
    return this.vesselMastersFormOne.controls;
  }
  get f2() {
    return this.vesselMastersFormTwo.controls;
  }
  onCloseVessel(evt) {
    this.VesselSection.emit(evt);
  }

  getvesselDetailById(id) {
    this.baseBody = new BaseBody();
    let must = [
      {
        match: {
          vesselId: id,
        },
      },
    ];
    this.baseBody.baseBody.query.bool.must = must;
    this.api.getSTList('vessel',this.baseBody.baseBody)?.subscribe((data: any) => {

      this.vesselDetails = data.hits.hits[0]._source;
      this.vesselMastersForm.patchValue({
        mvmt: this.vesselDetails.generalDetails.mvmt,
        vesselName: this.vesselDetails.vesselName,
        lloydsImoNo: this.vesselDetails.generalDetails.lloydsIMONo,
        vesselFlag: this.vesselDetails.vesselFlag,
        callSign: this.vesselDetails.generalDetails.callSign,
        built: this.vesselDetails.generalDetails.built,
        type: this.vesselDetails.vesselType,
        subtype: this.vesselDetails.vesselSubType.vesselSubTypeName,
        category: this.vesselDetails.generalDetails.category,
        ownership: this.vesselDetails.generalDetails.Ownership,
        portOfRegistry:
          this.vesselDetails.generalDetails.portOfRegistry.portName,
        piclub: this.vesselDetails.generalDetails['p&IClub'],
        registrationNumber:
          this.vesselDetails.generalDetails['registrationNo.'],
        refferedBankAccounts:
          this.vesselDetails.generalDetails.refundBankAccounts.bankName,
        classificationSociety:
          this.vesselDetails.generalDetails.classificationSociety,
        igs: this.vesselDetails.generalDetails.IGS,
        shipManager:
          this.vesselDetails.generalDetails.shipManager.shipManagerName,
        integrationId: this.vesselDetails.generalDetails.integrationId,
        effectiveDate: this.vesselDetails.generalDetails.effectiveDate,
        isActive: this.vesselDetails.generalDetails.status,
        gt: this.vesselDetails.tonnageDetails.gt,
        nt: this.vesselDetails.tonnageDetails.nt,
        rgt: this.vesselDetails.tonnageDetails.rgt,
        sdwt: this.vesselDetails.tonnageDetails.sdwt,
        sbt: this.vesselDetails.tonnageDetails.sbt,
        panamagt: this.vesselDetails.tonnageDetails.panamaGT,
        panamant: this.vesselDetails.tonnageDetails.panamaNT,
        suezgt: this.vesselDetails.tonnageDetails.suezGT,
        sueznt: this.vesselDetails.tonnageDetails.suezNT,
      });
      this.vesselMastersFormOne.patchValue({
        draftsw: this.vesselDetails.dimensionDetails.draftSW,
        loa: this.vesselDetails.dimensionDetails.lOA,
        beam: this.vesselDetails.dimensionDetails.beam,
        moduleDepth: this.vesselDetails.dimensionDetails.moduleDepth,
        lbp: this.vesselDetails.dimensionDetails.lbp,
        cbm: this.vesselDetails.dimensionDetails.cbm,
        winterswDeadwt: this.vesselDetails.dimensionDetails.winterSWDeadWt,
        tropicalswDeadwt: this.vesselDetails.dimensionDetails.tropicalSWDeadWt,
        tropicalfwDeadwt: this.vesselDetails.dimensionDetails.tropicalFWDeadWt,
        engineType: this.vesselDetails.mainDetails.engineType,
        noOfEngines: this.vesselDetails.mainDetails.noOfEngines,
        enginePower: this.vesselDetails.mainDetails.enginePower,
        propulsionType: this.vesselDetails.mainDetails.propulsionType,
        noOfPropellers: this.vesselDetails.mainDetails.noOfPropellers,
        noOfSternThruster: this.vesselDetails.mainDetails.noOfSternThruster,
        noOfBowThruster: this.vesselDetails.mainDetails.noOfBowThruster,
        bowThrusterPower: this.vesselDetails.mainDetails.bowThrusterPower,
        maxSpeed: this.vesselDetails.mainDetails.maxSpeed,
        noOfCranes: this.vesselDetails.shipparticulars.noOfCranesDerricks,
        noOfHatches: this.vesselDetails.shipparticulars.noOfHatches,
        grain: this.vesselDetails.shipparticulars.grainBaleCube,
        capacityOfCranes:
          this.vesselDetails.shipparticulars.capacityOfCranesDerricks,
        noOfHold: this.vesselDetails.shipparticulars.noOfHoldsTanks,
        noOfGrabs: this.vesselDetails.shipparticulars.noOfGrabs,
        satellitePhone: this.vesselDetails.communicationDetails.satellitePhone,
        satelliteFax: this.vesselDetails.communicationDetails.satelliteFax,
        cellPhone: this.vesselDetails.communicationDetails.cellPhone,
        email: this.vesselDetails.communicationDetails.email,
        telexNo: this.vesselDetails.communicationDetails.telexNo,
        masterName: this.vesselDetails.communicationDetails.masterName,
      });
      this.vesselMastersFormTwo.patchValue({
        creationDate: this.vesselDetails.sactionDetails.creationDate,
        checkedDate: this.vesselDetails.sactionDetails.checkedDate,
        matchStrength: this.vesselDetails.sactionDetails.matchStrength,
        sanctionName: this.vesselDetails.sactionDetails.name,
        matchCategoryType: this.vesselDetails.sactionDetails.matchCategoryType,
        registeredCountry: this.vesselDetails.sactionDetails.registeredCountry,
        status: this.vesselDetails.sactionDetails.status,
        description: this.vesselDetails.sactionDetails.description,
        entityType: this.vesselDetails.sactionDetails.entityType,
        sources: this.vesselDetails.sactionDetails.sources,
        comments: this.vesselDetails.sactionDetails.comments,
        isOwnerPdf: this.vesselDetails.outlayCommision.isOwnersPDF,
        ownersPDFPercent: this.vesselDetails.outlayCommision.ownersPDFPercent,
        isChartererPdf: this.vesselDetails.outlayCommision.isChartererPDF,
        charterersPDFPercent:
          this.vesselDetails.outlayCommision.chartererPDFPercent,
        vesselIMO: this.vesselDetails.vesselIMO,
        vesselRegistrationDate: this.vesselDetails.vesselRegistrationDate,
        operator: this.vesselDetails.operator.operatorName,
        legalEntity: this.vesselDetails.legalEntity.legalEntityName,
        ownersPDFToMail: this.vesselDetails.vesselOwner.ownersPDF[0].toMail,

        ownersPDFCCMail: this.vesselDetails.vesselOwner.ownersPDF[0].ccMail,
        ownersPDFEmailText:
          this.vesselDetails.vesselOwner.ownersPDF[0].emailText,
        chartererPDFToMail:
          this.vesselDetails.vesselOwner.charterersPDF[0].toMail,
        chartererPDFCCMail:
          this.vesselDetails.vesselOwner.charterersPDF[0].ccMail,
        chartererPDFEmailText:
          this.vesselDetails.vesselOwner.charterersPDF[0].emailText,
      });
      this.vesselMastersFormThree.patchValue({
        vesselEmail: this.vesselDetails.vesselEmails[0].email,
        pdaAdvancePercentage:
          this.vesselDetails.advancePercentage.pdaAdvancePercentage,
        afAdvancePercentage:
          this.vesselDetails.advancePercentage.afAdvancePercentage,
        idaAdvancePercentage:
          this.vesselDetails.advancePercentage.idaAdvancePercentage,
      });
    });
  }
  vesselMasters() {
    this.submitted = true;
    if (this.vesselMastersForm.valid) {
      this.submitted = false;

      this.wizard.goToNextStep();
    } else {
      return;
    }
  }

  getAllVesselCategoriesTypes() {

     var parameter = {
      "query": {
        "bool": {
          "must": [],
          "filter": [],
          "should": [],
          "must_not": []
        }
      }
    }

    this.mastersService.systemtypeList(parameter)?.subscribe((data) => {
      this.systemData = data.hits.hits;

    });
  }
  
  vesselMastersOne() {
    this.submitted = true;
    if (this.vesselMastersFormOne.valid) {
      this.submitted = false;
      this.wizard.goToNextStep();
    } else {
      return;
    }
  }

  vesselMastersTwo() {
    this.submitted = true;
    if (this.vesselMastersFormTwo.valid) {
      this.submitted = false;
      this.wizard.goToNextStep();
    } else {
      return;
    }
  }
  vesselMastersThree() {
    this.submitted = true;
    if (this.vesselMastersFormTwo.valid ) {
      let newVessel = {
        "tenantId": this.tenantId,
        status: true,
        vesselType: this.vesselMastersForm.value.type,
        vesselName: this.vesselMastersForm.value.vesselName,
        vesselIMO: this.vesselMastersFormTwo.value.vesselIMO,
        vesselSubType: {
          vesselSubTypeId: '',
          vesselSubTypeName: this.vesselMastersForm.value.subtype,
        },
        vesselFlag: this.vesselMastersForm.value.vesselFlag,
        vesselRegistrationDate:
          this.vesselMastersFormTwo.value.vesselRegistrationDate,
        operator: {
          operatorId: '',
          operatorName: this.vesselMastersFormTwo.value.operator,
        },
        legalEntity: {
          legalEntityId: '1234',
          legalEntityName: this.vesselMastersFormTwo.value.legalEntity,
        },
        generalDetails: {
      
          name: this.vesselMastersForm.value.vesselName,
          flag: {
            countryId: '',
            countryName: '',
          },
          portOfRegistry: {
            portId: '',
            portName: this.vesselMastersForm.value.portOfRegistry,
          },
          'p&IClub': this.vesselMastersForm.value.piclub,
          'registrationNo.': this.vesselMastersForm.value.registrationNumber,
          refundBankAccounts: {
            accountNo: '',
            bankName: this.vesselMastersForm.value.refferedBankAccounts,
            bankId: '',
          },
          callSign: this.vesselMastersForm.value.callSign,
          classificationSociety:
            this.vesselMastersForm.value.classificationSociety,
          vesseltype: {
            vesselTypeId: '',
            vesselTypeName: this.vesselMastersForm.value.type,
          },
          subType: {
            vesselSubTypeId: '',
            vesselSubTypeName: this.vesselMastersForm.value.subType,
          },
          built: this.vesselMastersForm.value.built,
          lloydsIMONo: this.vesselMastersForm.value.lloydsImoNo,
          IGS: this.vesselMastersForm.value.igs,
          Ownership: this.vesselMastersForm.value.ownership,
          shipManager: {
            shipManagerId: '',
            shipManagerName: this.vesselMastersForm.value.shipManager,
          },
          legalEntity: {
            legalEntityId: '1234',
            legalEntityName: this.vesselMastersFormTwo.value.legalEntity,
          },
          integrationId: this.vesselMastersForm.value.integrationId,
          effectiveDate: this.vesselMastersForm.value.effectiveDate,
          status: this.vesselMastersForm.value.isActive,
        },
        tonnageDetails: {
          gt: this.vesselMastersForm.value.gt,
          nt: this.vesselMastersForm.value.nt,
          rgt: this.vesselMastersForm.value.rgt,
          sdwt: this.vesselMastersForm.value.sdwt,
          sbt: this.vesselMastersForm.value.sbt,
          panamaGT: this.vesselMastersForm.value.panamagt,
          panamaNT: this.vesselMastersForm.value.panamant,
          suezGT: this.vesselMastersForm.value.suezgt,
          suezNT: this.vesselMastersForm.value.sueznt,
        },
        dimensionDetails: {
          draftSW: this.vesselMastersFormOne.value.draftsw,
          lOA: this.vesselMastersFormOne.value.loa,
          beam: this.vesselMastersFormOne.value.beam,
          moduleDepth: this.vesselMastersFormOne.value.moduleDepth,
          lbp: this.vesselMastersFormOne.value.lbp,
          cbm: this.vesselMastersFormOne.value.cbm,
          winterSWDeadWt: this.vesselMastersFormOne.value.winterswDeadwt,
          tropicalSWDeadWt: this.vesselMastersFormOne.value.tropicalswDeadwt,
          tropicalFWDeadWt: this.vesselMastersFormOne.value.tropicalfwDeadwt,
        },
        mainDetails: {
          engineType: this.vesselMastersFormOne.value.engineType,
          noOfEngines: this.vesselMastersFormOne.value.noOfEngines,
          enginePower: this.vesselMastersFormOne.value.enginePower,
          propulsionType: this.vesselMastersFormOne.value.propulsionType,
          noOfPropellers: this.vesselMastersFormOne.value.noOfPropellers,
          noOfSternThruster: this.vesselMastersFormOne.value.noOfSternThruster,
          noOfBowThruster: this.vesselMastersFormOne.value.noOfBowThruster,
          bowThrusterPower: this.vesselMastersFormOne.value.bowThrusterPower,
          maxSpeed: this.vesselMastersFormOne.value.maxSpeed,
        },
        shipparticulars: {
          noOfCranesDerricks: this.vesselMastersFormOne.value.noOfCranes,
          noOfHatches: this.vesselMastersFormOne.value.noOfHatches,
          grainBaleCube: this.vesselMastersFormOne.value.grain,
          capacityOfCranesDerricks:
            this.vesselMastersFormOne.value.capacityOfCranes,
          noOfHoldsTanks: this.vesselMastersFormOne.value.noOfHold,
          noOfGrabs: this.vesselMastersFormOne.value.noOfGrabs,
        },
        communicationDetails: {
          satellitePhone: this.vesselMastersFormOne.value.satellitePhone,
          satelliteFax: this.vesselMastersFormOne.value.satelliteFax,
          cellPhone: this.vesselMastersFormOne.value.cellPhone,
          email: this.vesselMastersFormOne.value.email,
          telexNo: this.vesselMastersFormOne.value.telexNo,
          masterName: this.vesselMastersFormOne.value.masterName,
        },
        outlayCommision: {
          isOwnersPDF: this.vesselMastersFormTwo.value.isOwnerPdf,
          ownersPDFPercent: this.vesselMastersFormTwo.value.ownersPDFPercent,
          isChartererPDF: this.vesselMastersFormTwo.value.isChartererPdf,
          chartererPDFPercent:
            this.vesselMastersFormTwo.value.chartererPDFPercent,
        },
        sactionDetails: {
          creationDate: this.vesselMastersFormTwo.value.creationDate,
          checkedDate: this.vesselMastersFormTwo.value.checkedDate,
          matchStrength: this.vesselMastersFormTwo.value.matchStrength,
          name: this.vesselMastersFormTwo.value.sanctionName,
          matchCategoryType: this.vesselMastersFormTwo.value.matchCategoryType,
          registeredCountry: this.vesselMastersFormTwo.value.registeredCountry,
          status: this.vesselMastersFormTwo.value.status,
          description: this.vesselMastersFormTwo.value.description,
          entityType: this.vesselMastersFormTwo.value.entityType,
          sources: this.vesselMastersFormTwo.value.sources,
          comments: this.vesselMastersFormTwo.value.comments,
        },
        vesselOwner: {
          ownersPDF: [
            {
              toMail: this.vesselMastersFormTwo.value.ownersPDFToMail,
              ccMail: this.vesselMastersFormTwo.value.ownersPDFCCMail,
              emailText: this.vesselMastersFormTwo.value.ownersPDFEmailText,
              seqNo: '',
            },
          ],
          charterersPDF: [
            {
              toMail: this.vesselMastersFormTwo.value.chartererPDFToMail,
              ccMail: this.vesselMastersFormTwo.value.chartererPDFCCMail,
              emailText: this.vesselMastersFormTwo.value.chartererPDFEmailText,
              seqNo: '',
            },
          ],
        },
        vesselEmails: [
          {
            roleId: '',
            roleName: '',
            email: this.vesselMastersFormThree.value.vesselEmail,
          },
        ],
        advancePercentage: {
          pdaAdvancePercentage:
            this.vesselMastersFormThree.value.pdaAdvancePercentage,
          afAdvancePercentage:
            this.vesselMastersFormThree.value.afAdvancePercentage,
          idaAdvancePercentage:
            this.vesselMastersFormThree.value.idaAdvancePercentage,
        },
      };
      if (this.isAddMode) {

        const data1 = newVessel;

        this.mastersService.createVessel(data1)?.subscribe((vessel) => {
          if (vessel) {
            this.notification.create(
              'success',
              'Added Successfully',
              ''
            );
            this.router.navigate(['master/vessel']);
          }
        }, error => {
          this.router.navigate(['master/vessel']);
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
      }
      else{
        let dataupdate={
          ...newVessel,
          vesselId:this.id
        }
        const data=[dataupdate]
        this.mastersService.updateVessel(data)?.subscribe(res =>{
          if (res) {
            this.notification.create(
              'success',
              'Updated Successfully',
              ''
            );
            this.router.navigate(['master/vessel']);
          }
        }, error => {
          this.router.navigate(['master/vessel']);
          this.notification.create(
            'error',
            error?.error?.error?.message,
            ''
          );
        });
      }
    } else {
      this.notification?.create(
        'error','Please enter required fields', ''  );
    }
  }
}
