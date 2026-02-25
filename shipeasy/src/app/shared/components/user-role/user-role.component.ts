import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import {
  Component,
  ElementRef,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { Role ,AccessLevels } from 'src/app/admin/master/models/Role';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';
import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'
import { CommonService } from 'src/app/services/common/common.service';
import { CognitoService } from 'src/app/services/cognito.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Roles } from 'src/app/models/user-master';
import { MastersSortPipe } from '../../util/mastersort';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
interface userData{
  tenantId:string
}
interface permission{
  Label: string,
  Value: string,
  IsChecked: boolean,
  IsDropDown: boolean,}
  interface feature{
    featureName: string,
    module: string,
    featureCode: string,
    menu:[];
    IsChecked: boolean,
    PermissionList: object,
    StageList: object,
  }
@Component({
  selector: 'app-user-role',
  templateUrl: './user-role.component.html',
  styleUrls: ['./user-role.component.scss'],
})


export class UserRoleComponent implements OnInit {
  _gc=GlobalConstants;
  @Input() isSuperAdmin: boolean = false;
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;
  userRoleData:Roles[] = [];
  isShow: string;
  roleForm: FormGroup;
  RoleIdToUpdate: string ='';
  permissionDTO: permission[] = [];
  public stagesDTO = [];
  featureList: feature[] = [];
  roleDTO: Role = new Role();
  submitted: boolean;
  fromSize: number = 1;
  closeResult: string;
  userData: userData;
  yardcfs:any
  email:any;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort1!: MatSort;
  displayedColumns: string[] = [
    '#',
    'action',
    'roleName',
    'roleDescription',
    'status'
  ];

  public form: FormGroup = new FormGroup({
    RoleId: new FormControl(''),
    Name: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    Description: new FormControl('', [Validators.maxLength(450)]),
    IsActive: new FormControl(true),
  });

  toalLength: number;
  size = 10;
  page = 1;
  count = 0;
  roleName: string;
  roleDescription: string;
  roleStatus: string;
  roleLevel: string;
  show: string;
  currentUrl:string;
  urlParam: Params | null = null;
  parentId: any;
  constructor(
   
    private modalService: NgbModal,
    private notification: NzNotificationService,
    private commonFunction: CommonFunctions,
    private cognito : CognitoService,
    private commonService : CommonService,
    private router:Router,
    private route: ActivatedRoute,
    private sortPipelist: MastersSortPipe,
    public loaderService: LoaderService,
  ) {
      this.modalService = modalService;
      this.notification = notification;
      this.commonFunction = commonFunction;
      this.cognito = cognito;
      this.commonService = commonService;
      this.router = router;
      this.route = route
      this.parentId = this.route.snapshot.params?.['id'];
    this.currentUrl = window.location.href.split('?')[0].split('/').pop()
    this.route.params?.subscribe(params =>
      this.urlParam = params
    );
  }
  sortList(array , key){
    return this.sortPipelist.transform(array, key);
   }
  onOpenNew() {
    if(this.isSuperAdmin){
      this.router.navigate(['/register/'+ this.urlParam.id +'/'+ this.urlParam.key + '/add']);
    }else{
      this.router.navigate(['/master/' + this.urlParam.key + '/add']);
    }
      
  }
  onOpenEdit(role){
   
    if(this.isSuperAdmin){
      this.router.navigate(['/register/'+ this.urlParam.id+'/' + this.urlParam.key+'/' + role.roleId+'/edit']);
    }else{
      this.router.navigate(['/master/' + this.urlParam.key + '/' + role.roleId + '/edit']);
    }
  }
  ngOnInit(): void {
    // this.userData = this.commonFunction.getUserDetails();
    this.cognito.getUserDatails().subscribe((resp) => {
      if (resp != null) {
        this.userData  = resp
      }
    }) 
    this.getRoleList();
    this.getFeatureList();
    // this.getemaildata()
  }


    getemaildata() {
      let payload = this.commonService?.filterList()
      payload.query = { 
      }
      payload.sort = {
        "desc" : ["updatedOn"]
    }
    let mustArray = {
    };
    payload.query = mustArray
      this.commonService.getSTList('role', payload).subscribe((res: any) => {
  
        this.email = res?.documents;
        this.dataSource = new MatTableDataSource(
          res?.documents?.map((s: any) => {
            return {
              ...s, 
              roleName: s.roleName,
              roleDescription: s.roleDescription,
              status:s.status
            }
          })
  
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1
      }
      )
    }

      exportAsExcelFile1(): void {
        let storeEnquiryData = [];
        this.email.map((row: any) => {
          storeEnquiryData.push({
            'roleName' : row?.element?.roleName,
            'roleDescription}' : row?.element?.roleDescription,
            'status':row?.element?.status
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
        filterValue = filterValue.trim();
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
        this.commonService.getSTList('role', payload).subscribe((data) => {
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
        this.getRoleList();
      }

  getRoleList() {
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    payload.query = { 
     }
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   let mustArray = {};
  if(this.isSuperAdmin){
    mustArray = { 
      "orgId": {
        "$in": [
          this.commonFunction.getAgentDetails()?.orgId , this.parentId
        ]
      }
    }
  }else{
    mustArray = {
      orgId: this.commonFunction.getAgentDetails()?.orgId
    }
  }
  this.roleName = this.roleName?.trim();
  this.roleDescription = this.roleDescription?.trim();
  this.roleLevel = this.roleLevel?.trim();
  this.roleStatus = this.roleStatus?.trim();
  if (this.roleName) {
    mustArray['roleName'] = {
      "$regex" : this.roleName,
      "$options": "i"
  }
  }
  if (this.roleStatus) {
    mustArray['status'] = this.roleStatus?.toLowerCase() === 'active' ? true : false
  }
  if (this.roleDescription) {
    mustArray['roleDescription'] = {
      "$regex" : this.roleDescription,
      "$options": "i"
  }
  }
  if (this.roleLevel) {
    mustArray['roleLevel'] = {
      "$regex" : this.roleLevel,
      "$options": "i"
  }
  }

  payload.query = mustArray
  //  payload.size = Number(this.size)
  //  payload.from = this.page -1,
    this.commonService.getSTList('role', payload).subscribe((data) => {
      this.userRoleData = data.documents;
      this.dataSource = new MatTableDataSource(
        data?.documents?.map((s: any ,i:number) => {
          return {
            ...s, 
            id: i + 1,
            roleName: s.roleName,
            roleDescription: s.roleDescription,
            status:s.status
          }
        })

      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1
      // this.toalLength = data.totalCount;
      // this.count = data.documents.length;
      this.loaderService.hidecircle();
     
    },()=>{
      this.loaderService.hidecircle();
    });
  }

  getFeatureList() {
    this.featureList = [];
    this.stagesDTO = [];
    this.permissionDTO = [];
    let payload = this.commonService.filterList()
    this.commonService.getSTList('feature', payload)
      .subscribe((result: any) => {
       
        result.documents.forEach((element) => {
          this.featureList.push({
            featureName: element.featureName,
            module: element.module,
            featureCode: element.featureCode,
            menu:element?.menu,
            IsChecked: false,
            PermissionList: [],
            StageList: [],
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
      });
     
      
  }

  onShowPermission(id) {
    this.isShow = id;
  }
  open(content, role?: any,show?) {
    this.show = show;
    if (role) {
      this.RoleIdToUpdate = role?.roleId || '';
      this.form.controls.Name.setValue(role?.roleName);
      this.form.controls.Description.setValue(role?.roleDescription);
      this.form.controls.IsActive.setValue(role?.status);
      this.roleDTO.accesslevel = role?.accesslevel;
      this.setRoleListChecked();
      show === 'show'?this.form.disable():this.form.enable()
    }
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'lg',
    });
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
    this.roleDTO.menu = []
    this.featureList.forEach((element: any) => {
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
      for(let i =0 ;i <= element.PermissionList.length; i++){
        if(element.PermissionList[i]?.IsChecked){
          element.menu?.forEach((m)=>{
            this.roleDTO.menu.push(m)
          })
          break ;
        }
      }
 
      if (
        accessLevels.accesslevel.length > 0 ||
        accessLevels.stage.length > 0
      ) {
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
      url = this.commonService.UpdateToST(`role/${roleDtoarray[0].roleId}`, roleDtoarray[0])
    } else {
      
      this.roleDTO.roleId = '';
      roleDtoarray.push(this.roleDTO);
      url = this.commonService.addToST('role', roleDtoarray[0]);
    }
    
    url.subscribe(
      (result: any) => {
        if(result){
          // localStorage.setItem(Constant.UserRoleAccess, this.commonFunction.set(JSON.stringify(this.roleDTO.accesslevel)));
          // localStorage.setItem(Constant.UserDetails, this.commonFunction.set(JSON.stringify(result.payload)));
          this.cognito.userdetails.next(result.payload) 
          this.cognito.userRoleAccess.next(this.roleDTO.accesslevel)
          if (this.RoleIdToUpdate !== '') {
            this.notification.create('success', 'Updated Successfully', '');
          } else {
            this.notification.create('success', 'Saved Successfully', '');
          }
        }
       
        this.closePopup();
        this.getRoleList();
      },
      (error) => {
        this.closePopup();
        this.getRoleList();
        this.notification.create('error', error?.error?.error?.message, '');
      }
    );
  }
  unCheckkAllCheckBox() {
    this.featureList.forEach((element: any) => {
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

 

  public hasError = (controlName: string, errorName: string) => {
    return this.form.controls[controlName].hasError(errorName);
  };
  closePopup() {
    this.submitted = false;
    this.form.reset();
    this.submitted = false;
    this.form.controls['IsActive'].setValue(true);
    this.unCheckkAllCheckBox();
    this.modalService.dismissAll();
  }

  ngOnSelectAllModulePermission(projectModule: any) {
    this.featureList.forEach((element: any) => {
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

  ngOnSelectAllPermissionModuleVise(permission: any) {
    this.featureList.forEach((element: any) => {
      element.PermissionList.forEach((item: any) => {
        if (item.Label === permission.Label)
          item.IsChecked = permission.IsChecked;
      });
    });
  }

  setRoleListChecked() {
    this.featureList.forEach((element: any) => {
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
  }

 
  DeleteRole(deleterole, role) {
    this.modalService
      .open(deleterole, {
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
            let deleteBody = 'role'+ role?.roleId
            this.commonService
              .deleteST(deleteBody)
              .subscribe((data) => {
                if (data) {
                  this.notification.create(
                    'success',
                    'Deleted Successfully',
                    ''
                  );
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

  clear() {
    this.roleName = '';
    this.roleStatus = '';
    this.roleDescription = '';
    this.roleLevel = '';
    this.getRoleList();
  }
  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getRoleList();
  }
  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }
  prev() {
    if (this.page > 0 && this.page !== 1) {
      this.getPaginationData('prev');
    }
  }
  search() {
    let mustArray = {
    };
    this.roleName = this.roleName?.trim();
    this.roleDescription = this.roleDescription?.trim();
    this.roleLevel = this.roleLevel?.trim();
    this.roleStatus = this.roleStatus?.trim();
    if (this.roleName) {
      mustArray['roleName'] = {
        "$regex" : this.roleName,
        "$options": "i"
    }
    }
    if (this.roleStatus) {
      mustArray['status'] = this.roleStatus === 'true' ? true : false
    }
    if (this.roleDescription) {
      mustArray['roleDescription'] = {
        "$regex" : this.roleDescription,
        "$options": "i"
    }
    }
    if (this.roleLevel) {
      mustArray['roleLevel'] = {
        "$regex" : this.roleLevel,
        "$options": "i"
    }
    }
    let payload = this.commonService.filterList()
    payload.query = mustArray
    payload.sort = {
      "desc" : ["updatedOn"]
   }
   payload.size = Number(this.size)
   payload.from = 0,
    this.commonService.getSTList('role', payload).subscribe((data) => {
      this.userRoleData = data.documents;
      this.toalLength = data.totalCount;
      this.count = data.documents.length;
      this.fromSize =1
    });
  }

  getPaginationData(type: any) {
    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
      let payload = this.commonService.filterList()
      payload.query = { 
       }
      payload.sort = {
        "desc" : ["updatedOn"]
     }
     let mustArray = {
    };
    this.roleName = this.roleName?.trim();
    this.roleDescription = this.roleDescription?.trim();
    this.roleLevel = this.roleLevel?.trim();
    this.roleStatus = this.roleStatus?.trim();
    if (this.roleName) {
      mustArray['roleName'] = {
        "$regex" : this.roleName,
        "$options": "i"
    }
    }
    if (this.roleStatus) {
      mustArray['status'] = this.roleStatus === 'true' ? true : false
    }
    if (this.roleDescription) {
      mustArray['roleDescription'] = {
        "$regex" : this.roleDescription,
        "$options": "i"
    }
    }
    if (this.roleLevel) {
      mustArray['roleLevel'] = {
        "$regex" : this.roleLevel,
        "$options": "i"
    }
    }
    
    payload.query = mustArray
     payload.size = Number(this.size)
     payload.from = this.fromSize -1,
      this.commonService.getSTList('role', payload).subscribe((data) => {
      this.userRoleData = data.documents;
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
  changeStatus(data) {
    this.commonService.UpdateToST(`role/${data?.roleId}`,{  ...data,status: !data?.status })
      .subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Status Updated Successfully',
              ''
            );
            this.search();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, '');
        }
      );
  }

  exportAsExcelFile(): void {
    let storeEnquiryData = [];
    this.userRoleData.map((row: any) => {
      storeEnquiryData.push({
        'Role Name': row.roleName,
        'Role Description': row.roleDescription,
        'Role Status': row.status ? 'Active' : 'Inactive',
        // 'Role Level': row.level,  currently no need
      });
    });
    const myworksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(storeEnquiryData);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ['data'],
    };
    const fileName = 'user-role.xlsx';
    /* save to file */
    XLSX.writeFile(myworkbook, fileName);
  }

  openPDF() {
    const prepare=[];
    this.userRoleData.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.roleName);
      tempObj.push(e.roleDescription);
      tempObj.push(e.status ? 'Active' : 'Inactive');
      // tempObj.push(e.level); currently no need
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['Role Name','Role Description','Role Status']],
        body: prepare,
        didDrawCell: (data) => {
          // Draw border lines for each cell
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
      }
    });
    doc.save('user-role' + '.pdf');
  }
}
