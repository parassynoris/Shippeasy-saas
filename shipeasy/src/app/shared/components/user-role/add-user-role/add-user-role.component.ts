import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Role, AccessLevels } from 'src/app/admin/master/models/Role';
import { Feature } from 'src/app/models/add-user-role';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { OrderByPipe } from 'src/app/shared/util/sort';
interface Permission {
  Label: string;
  Value: string;
  IsChecked: boolean;
  IsDropDown: boolean;
}
interface StageDTO {
  Label: string;
  Value: string;
  IsChecked: boolean;
}
@Component({
  selector: 'app-add-user-role',
  templateUrl: './add-user-role.component.html',
  styleUrls: ['./add-user-role.component.scss']
})
export class AddUserRoleComponent implements OnInit {
  @Input() isSuperAdmin: boolean = false;
  public form: FormGroup = new FormGroup({
    RoleId: new FormControl(''),
    Name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    Description: new FormControl('', [Validators.maxLength(450)]),
    IsActive: new FormControl(true),
  });

  submitted: boolean;
  currentUrl: string
  featureList: Feature[] = []
  stagesDTO: StageDTO[]
  permissionDTO: Permission[];
  roleDTO: Role = new Role();
  urlParam: Params | null = null
  RoleIdToUpdate: string = ''
  userData: any;
  searchText = '';
  searchText1 = '';
  searchText2 = '';
  searchText3 = '';
  searchText4 = '';
  searchText5 = '';
  searchText9 = '';
  searchText8 = '';
  callapseALL: boolean = true;
  expandKeys = "collapseOne collapseTwo"
  accesslevels: any;
  roleDetails: any;
  constructor(public commonService: CommonService, public route: ActivatedRoute, public sortPipe: OrderByPipe,
    public cognito: CognitoService, private commonFunction: CommonFunctions,
    public notification: NzNotificationService, public router: Router,) {
    this.commonFunction = commonFunction;
    this.commonService = commonService;
    this.route = route;
    this.cognito = cognito;
    this.notification = notification;
    this.router = router
    this.currentUrl = window.location.href.split('?')[0].split('/').pop()
    this.cognito?.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.accesslevels = resp.accesslevel

      }
    })
    this.route.params?.subscribe(params =>
      this.urlParam = params

    );
    this.getMenu()


  }
  menuList: any = []
  getMenu() {
    var body =
    {
      "project": [],
      "query": {
        "status": true,
      },
      size: 1000,
    }
    this.commonService
      .getSTList('menu', body)?.subscribe(data => {
        this.menuList = data.documents.filter((x) => x.menuName?.toLowerCase() !== 'user')
        this.getFeatureList();
      })
  }
  sort(array, key) {
    return this.sortPipe.transform(array, key);
  }
  currentLogin: boolean = false;
  ngOnInit(): void {
    this.currentLogin = this.commonFunction.getwarehouseType();
    this.cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.userData = resp
      }
    })
  }
  setData() {
    let payload = this.commonService.filterList()
    payload.query = {
      "roleId": this.urlParam?.id
    }


    this.commonService.getSTList('role', payload).subscribe((data) => {
      this.RoleIdToUpdate = data.documents[0]?.roleId || '';
      this.form.controls.Name.setValue(data.documents[0]?.roleName);
      this.form.controls.Description.setValue(data.documents[0]?.roleDescription);
      this.form.controls.IsActive.setValue(data.documents[0]?.status);
      this.roleDTO.accesslevel = data.documents[0]?.accesslevel;
      this.roleDetails = data.documents[0]
      this.setRoleListChecked();
    });


  }
  masterList: any = []
  jobList: any = []
  financeList: any = []
  getFeatureList() {
    this.featureList = [];
    this.stagesDTO = [];
    this.permissionDTO = [];
    let payload = this.commonService.filterList()
    payload.query = {
      "$and": [
        {
          "featureName": {
            "$ne": 'Customer'
          }
        }
      ]
    }
    this.commonService.getSTList('feature', payload)
      .subscribe((result: any) => {

        let mainfeatureList = []
        if (this.commonFunction.isSuperAdmin()) {
          mainfeatureList = result?.documents || []
        } else {
          result?.documents.forEach((element) => {
            // if (this.accesslevels?.filter(accesslevel => [element?.featureCode]?.some(i => i === accesslevel?.featureCode)).length > 0 && this.accesslevels?.filter(accesslevel => [element?.featureCode].some(j => j === accesslevel?.featureCode))[0]?.accesslevel?.includes('add')) {
              mainfeatureList?.push(element)
            // }
          })
        }


        mainfeatureList?.forEach((element) => {
          this.featureList.push({

            isExport: element.isExport,
            isImport: element.isImport,
            isTransport: element.isTransport,
            isWarehouse: element.isWarehouse,
            featureName: element.featureName,
            module: element.module,
            featureCode: element.featureCode,
            menu: element?.menu,
            IsChecked: false,
            PermissionList: [],
            StageList: [],
            featureId: '',
            accesslevel: [],
            featureType: element?.featureType,
            orgId: element?.orgId,
            stage: [],
            tenantId: element?.tenantId
          });

          element.stage.forEach((stages) => {
            if (this.stagesDTO.length > 0) {
              var isPresentStage = this.stagesDTO.some(function (el) {
                return el.Label === stages.name;
              });
              if (isPresentStage) {
              } else {
                this.stagesDTO.push({
                  Label: stages.name,
                  Value: stages.name,
                  IsChecked: false,
                });
              }
            } else {
              this.stagesDTO.push({
                Label: stages.name,
                Value: stages.name,
                IsChecked: false,
              });
            }
          });

          element.accesslevel.forEach((accesslevel) => {
            if (this.permissionDTO.length > 0) {
              var isPresent = this.permissionDTO.some(function (el) {
                return el.Label === accesslevel;
              });
              if (isPresent) {
              } else {
                this.permissionDTO.push({
                  Label: accesslevel,
                  Value: accesslevel,
                  IsChecked: false,
                  IsDropDown: false,
                });
              }
            } else {
              this.permissionDTO.push({
                Label: accesslevel,
                Value: accesslevel,
                IsChecked: false,
                IsDropDown: false,
              });
            }
          });
        });
        this.permissionDTO.push({
          Label: 'Stage',
          Value: 'Stage',
          IsChecked: false,
          IsDropDown: true,
        });

        this.featureList.forEach((element) => {
          let lists = [];
          let stagelists = [];
          this.stagesDTO.forEach((stage) => {
            stagelists.push({
              Label: stage.Label,
              Value: stage.Value,
              IsChecked: false,
            });
          });
          this.permissionDTO.forEach((feature) => {
            lists.push({
              Label: feature.Label,
              Value: feature.Value,
              IsChecked: false,
              IsDropDown: feature.IsDropDown,
            });
          });
          element.PermissionList = lists;
          element.StageList = stagelists;
        });




        this.masterList = this.featureList.filter((item: any) => (item?.featureCode?.includes('STM') && !item?.featureCode?.includes('STBT') && !item?.featureCode?.includes('STF')));
        this.jobList = this.featureList.filter((item: any) => item?.featureCode?.includes('STBT'));
        this.financeList = this.featureList.filter((item: any) => item?.featureCode?.includes('STF'));
        this.featureList = this.featureList.filter((item: any) => (!item?.featureCode?.includes('STM') && !item?.featureCode?.includes('STBT') && !item?.featureCode?.includes('STF')));

        let operationList = []
        let generalList = []
        let accountList = []
        let eqcList = []
        let systemtypeList = []
        let finalList = []

        this.menuList.filter(el => {

          if (el?.category_code === 'C01') {
            operationList.push(el)
          }
          else if (el?.category_code === 'C02') {
            generalList.push(el)
          }
          else if (el?.category_code === 'C03') {
            accountList.push(el)
          }
          else if (el?.category_code === 'C04') {
            eqcList.push(el)
          }
          else if (el?.category_code === 'C05') {
            systemtypeList.push(el)
          } else {
            finalList.push(el)
          }
        })

        this.masterList.forEach((ml) => {
          if (ml.menu.some((x) => operationList.some((op) => x.menuId === op.menuId))) {
            this.operationList.push(ml);
          }
          if (ml.menu.some((x) => generalList.some((op) => x.menuId === op.menuId))) {
            this.generalList.push(ml);
          }
          if (ml.menu.some((x) => accountList.some((op) => x.menuId === op.menuId))) {
            this.accountList.push(ml);
          }
          if (ml.menu.some((x) => eqcList.some((op) => x.menuId === op.menuId))) {
            this.eqcList.push(ml);
          }
          if (ml.menu.some((x) => systemtypeList.some((op) => x.menuId === op.menuId))) {
            this.systemtypeList.push(ml);
          }
          if (ml.menu.some((x) => finalList.some((op) => x.menuId === op.menuId))) {
            this.featureList.push(ml);
          }
        });





        if (this.currentUrl === 'edit') {
          this.setData()
        }
      });


  }

  operationList: any = []
  generalList: any = []
  accountList: any = []
  eqcList: any = []
  systemtypeList: any = []
  unCheckkAllCheckBox() {
    [...this.systemtypeList, ...this.eqcList, ...this.accountList, ...this.generalList, ...this.operationList, ...this.featureList, ...this.jobList, ...this.financeList].forEach((element: any) => {
      var isPresent = this.roleDTO.accesslevel.filter(
        (x) =>
          x.featureName === element.featureName && x.module === element.module
      );
      element.PermissionList.forEach((item: any) => {
        if (
          isPresent !== null &&
          isPresent !== undefined &&
          isPresent.length > 0
        ) {
          var isPresentPermission = isPresent[0]?.accesslevel?.findIndex(
            (rank) => rank === item.Label
          );
          if (isPresentPermission > -1) {
            item.IsChecked = false;
          }
        }
      });
      element.StageList.forEach((stage: any) => {
        if (
          isPresent !== null &&
          isPresent !== undefined &&
          isPresent.length > 0
        ) {
          var isStagePresentPermission = isPresent[0]?.stage?.findIndex(
            (rank) => rank === stage.Label
          );
          if (isStagePresentPermission > -1) {
            stage.IsChecked = false;
          }
        }
      });
    });
  }

  ngOnSelectAllModulePermission(projectModule: any, array) {
    array.forEach((element: any) => {
      if (element.featureName === projectModule.featureName) {
        if (element.isExport)
          element.isExport1 = projectModule.IsChecked;
        if (element.isImport)
          element.isImport1 = projectModule.IsChecked;
        if (element.isTransport)
          element.isTransport1 = projectModule.IsChecked;
        if (element.isWarehouse)
          element.isWarehouse1 = projectModule.IsChecked;
      }
      element.PermissionList.forEach((item: any) => {
        if (
          element.featureName === projectModule.featureName &&
          element.module === projectModule.module
        ) { 
          item.IsChecked = projectModule.IsChecked;
        }
      });
    });
  }


  checkAllChecked(array) {
    return array.every((x) => x.IsChecked)
  }
  featureListExport: boolean = false;
  featureListImport: boolean = false;
  featureListTrans: boolean = false;
  featureListWares: boolean = false;

  jobListExport: boolean = false;
  jobListImport: boolean = false;
  jobListTrans: boolean = false;
  jobListWares: boolean = false;

  financeListExport: boolean = false;
  financeListImport: boolean = false;
  financeListTrans: boolean = false;
  financeListWares: boolean = false;

  operationListExport: boolean = false;
  operationListImport: boolean = false;
  operationListTrans: boolean = false;
  operationListWares: boolean = false;

  generalListExport: boolean = false;
  generalListImport: boolean = false;
  generalListTrans: boolean = false;
  generalListWares: boolean = false;

  accountListExport: boolean = false;
  accountListImport: boolean = false;
  accountListTrans: boolean = false;
  accountListWares: boolean = false;

  eqcListExport: boolean = false;
  eqcListImport: boolean = false;
  eqcListTrans: boolean = false;
  eqcListWares: boolean = false;

  systemtypeListExport: boolean = false;
  systemtypeListImport: boolean = false;
  systemtypeListTrans: boolean = false;
  systemtypeListWares: boolean = false;

  checkImportChecked(array) {
    return array.every((x) => x.isImport1)
  };
  checkExportChecked(array) {
    return array.every((x) => x.isExport1)
  };
  checkTransChecked(array) {
    return array.every((x) => x.isTransport1)
  };
  checkWareChecked(array) {
    return array.every((x) => x.isWarehouse1)
  };
  featureListAll: boolean = false
  jobListAll: boolean = false
  financeListAll: boolean = false
  operationListAll: boolean = false
  generalListAll: boolean = false
  accountListAll: boolean = false
  eqcListAll: boolean = false
  systemtypeListAll: boolean = false
  selectAllModule(e, array, value) {
    array.forEach((element: any) => {
      element.IsChecked = value;
      if (element.isExport)
        element.isExport1 = value;
      if (element.isImport)
        element.isImport1 = value;
      if (element.isTransport)
        element.isTransport1 = value;
      if (element.isWarehouse)
        element.isWarehouse1 = value;
      element.PermissionList.forEach((item: any) => {
        item.IsChecked = value;
      });
    });

  }
  selectExportModule(e, array, value) {
    array.forEach((element: any) => {
      element.isExport1 = value
      // element.PermissionList.forEach((item: any) => { 
      //     item.IsChecked = value;
      // });
    });

  }
  selectImportModule(e, array, value) {
    array.forEach((element: any) => {
      element.isImport1 = value
      // element.PermissionList.forEach((item: any) => { 
      //     item.IsChecked = value;
      // });
    });

  }
  selectTransModule(e, array, value) {
    array.forEach((element: any) => {
      element.isTransport1 = value
      // element.PermissionList.forEach((item: any) => { 
      //     item.IsChecked = value;
      // });
    });

  }
  selectWareModule(e, array, value) {
    array.forEach((element: any) => {
      element.isWarehouse1 = value
      // element.PermissionList.forEach((item: any) => { 
      //     item.IsChecked = value;
      // });
    });

  }
  checkSelectedRow(array) {
    return array.PermissionList.every((item: any) => item.IsChecked);
  }
  ngOnSelectAllPermissionModuleVise(permission: any, array) {
    array.forEach((element: any) => {
      element.PermissionList.forEach((item: any) => {
        if (item.Label === permission.Label)
          item.IsChecked = permission.IsChecked;
      });
    });
  }

  setRoleListChecked() {

    [...this.systemtypeList, ...this.eqcList, ...this.accountList, ...this.generalList, ...this.operationList, ...this.featureList, ...this.jobList, ...this.financeList].forEach((element: any) => {
      var isPresent = this.roleDTO.accesslevel.filter(
        (x) =>
          x.featureName === element.featureName && x.module === element.module
      );


      element.PermissionList.forEach((item: any) => {
        if (
          isPresent !== null &&
          isPresent !== undefined &&
          isPresent.length > 0
        ) {
          var isPresentPermission = isPresent[0]?.accesslevel?.findIndex(
            (rank) => rank === item.Label
          );

          if (isPresentPermission > -1) {
            item.IsChecked = true;
          }
        }
      });
      element.StageList.forEach((stage: any) => {
        if (
          isPresent !== null &&
          isPresent !== undefined &&
          isPresent.length > 0
        ) {
          var isStagePresentPermission = isPresent[0]?.stage?.findIndex(
            (rank) => rank === stage.Label
          );
          if (isStagePresentPermission > -1) {
            stage.IsChecked = true;
          }
        }
      });
    });

    [...this.systemtypeList, ...this.eqcList, ...this.accountList, ...this.generalList, ...this.operationList, ...this.featureList, ...this.jobList, ...this.financeList].map((element: any) => {

      this.roleDetails?.menu?.forEach((x) => {
        if (x.featureCode === element?.featureCode) { 
          x?.menuAccess?.forEach((access) => {
            switch (access) {
              case 'import':
                element.isExport1 = true;
                break;
              case 'export':
                element.isImport1 = true;
                break;
              case 'transport':
                element.isTransport1 = true;
                break;
              case 'warehouse':
                element.isWarehouse1 = true;
                break;
            }
          });
        }
      });

    })
  }
  cancel() {
    if (this.isSuperAdmin) {
      this.router.navigate([`register/${this.urlParam.value}/roles`])
    } else {
      this.router.navigate(['master/roles'])
    }

    this.form.reset()
    this.RoleIdToUpdate = ''
    this.unCheckkAllCheckBox();
  }
  public findInvalidControls() {
    const invalid = [];
    const controls = this.form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }

    return invalid;
  }
  ngOnSave() {
    this.submitted = true;
    this.findInvalidControls();
    if (!this.form.valid) {
      return;
    }
    this.roleDTO.roleName = this.form.controls.Name.value;
    this.roleDTO.roleDescription = this.form.controls.Description.value;
    this.roleDTO.status = this.form.controls.IsActive.value;
    this.roleDTO.isActive = this.form.controls.IsActive.value;
    this.roleDTO.tenantId = this.userData.tenantId,

      this.roleDTO.module = this.commonFunction.getSelectedModule();

    this.roleDTO.accesslevel = [];
    this.roleDTO.menu = [];
    [...this.systemtypeList, ...this.eqcList, ...this.accountList, ...this.generalList, ...this.operationList, ...this.featureList, ...this.jobList, ...this.financeList].forEach((element: any) => {
      var accessLevels = new AccessLevels();
      element.PermissionList.forEach((item: any) => {
        if (item.IsChecked) {
          accessLevels.accesslevel.push(item.Label);

        }
      });
      element.StageList.forEach((stage: any) => {
        if (stage.IsChecked) {
          accessLevels.stage.push(stage.Label);
        }
      });


      let menuAccess = []
      if (element?.isExport1) {
        menuAccess.push("export")
      }
      if (element?.isImport1) {
        menuAccess.push("import")
      }
      if (element?.isTransport1) {
        menuAccess.push("transport")
      }
      if (element?.isWarehouse1) {
        menuAccess.push("warehouse")
      }
      for (let i = 0; i <= element.PermissionList.length; i++) {
        if (element.PermissionList[i]?.IsChecked) {
          if (element.menu?.length == 0) {
            this.roleDTO.menu.push({ menuAccess: menuAccess ,featureCode :element.featureCode || ''})

          } else {
            element.menu?.forEach((m) => {
              this.roleDTO.menu.push({ ...m, menuAccess: menuAccess ,featureCode :element.featureCode || ''})
            })
          } 
          break;
        }
      }

      if (
        accessLevels.accesslevel.length > 0 ||
        accessLevels.stage.length > 0
      ) {
        accessLevels.menuAccess = menuAccess;
        accessLevels.module = element.module;
        accessLevels.featureName = element.featureName;
        accessLevels.featureCode = element.featureCode;
        this.roleDTO.accesslevel.push(accessLevels);
      }
    });

    let url;
    var roleDtoarray = [];
    if (this.RoleIdToUpdate !== '') {
      this.roleDTO.roleId = this.RoleIdToUpdate;
      roleDtoarray.push(this.roleDTO);

      url = this.commonService.UpdateToST(`role/${roleDtoarray[0].roleId}`, { ...roleDtoarray[0] })
    } else {

      this.roleDTO.roleId = '';
      roleDtoarray.push(this.roleDTO);
      url = this.commonService.addToST('role', { ...roleDtoarray[0], orgId: this.commonFunction.getAgentDetails().orgId });
    }

    url.subscribe(
      (result: any) => {
        if (result) {

          if (this.RoleIdToUpdate !== '') {
            this.notification.create('success', 'Updated Successfully', '');
          } else {
            this.notification.create('success', 'Saved Successfully', '');
          }
        }

        this.cancel();

      },
      (error) => {
        this.cancel();

        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
}
 