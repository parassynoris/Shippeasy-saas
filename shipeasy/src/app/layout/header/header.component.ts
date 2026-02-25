import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { shared } from '../../shared/data';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';

import { CommonFunctions } from 'src/app/shared/functions/common.function';
import * as Constant from 'src/app/shared/common-constants';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { ThemeService } from 'src/theme/theme.service';
import { masters } from '../../admin/master/data';
import { manifests } from 'src/app/admin/manifest/data';
import { BehaviorSubjectService } from 'src/app/services/BehaviorSubjectService';
import { MastersService } from 'src/app/services/Masters/masters.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { MessagingService } from 'src/app/services/messaging.service';
import { Notification } from 'src/app/models/header';
import { CognitoService } from 'src/app/services/cognito.service';
import { switchMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReminderPopUpComponent } from 'src/app/shared/components/reminder-pop-up/reminder-pop-up.component';
import { WelcomepageComponent } from 'src/app/admin/dashboard/welcomepage/welcomepage.component';
import { CustomAgentAdviseComponent } from 'src/app/admin/customer/quotaion/custom-agent-advise/custom-agent-advise.component';
import { LoaderService } from 'src/app/services/loader.service';
import { DashboardComponent } from 'src/app/admin/dashboard/dashboard.component';
import { EnquiryComponent } from 'src/app/admin/enquiry/enquiry.component';
import { TranslateService } from '@ngx-translate/core';
import { log } from 'console';

declare var require: any;
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private langChangeSubscription!: Subscription;
  selectTYPE: string = 'Export';
  isRole: any;
  holdControl: any;
  SelectedModule: any;
  isHeaderHidden: boolean = false;
  moduleName: any
  notification = shared.headerNotification;
  moduleData = [];
  subTabMasters: any = [];

  menuData = [ ];
  customerMenu = [
    { name: "Quotation", menuUrl: "quotation/list" },
    { name: "Booking", menuUrl: "booking/list" },
    { name: "Invoice & Payment", menuUrl: "invoice-payment/list" },
    { name: "Trade Finance", menuUrl: "trade-finance/list" }
  ];
  active: any;
  highlight: any;
  highlight1: any;
  notificationList: Notification[] = [];
  wildCardUser: boolean = false;
  isToggleProfile: boolean = false
  isToggleProfilee = false;
  isToggleTheme = false;
  activeModule: any = 'SA';
  currentMessage = new BehaviorSubject(null);
  SAModule: boolean;
  manifestTabs = manifests
  generalTab = masters.general;
  operationsTab = masters.operations;
  accountsTab = masters.accounts;
  organizationTab = masters.organization;
  EQCTab = masters.EQC;
  systemTypeTab = masters.systemType;
  userprofileData: any;
  profileData: any[] = [];
  loader = true
  imageURL: any = "assets/img/profile-avt.png"
  masterActive: boolean = false;
  IsmasterActive = true;
  userName: any = null;
  userRole: any = null;
  customerUser: boolean;
  notificationBlink: boolean = false
  isTrial: boolean = false;
  countOfTrial: any = 0;
  isProfileTabOpen: boolean = false;
  isDarkTheme = false;
  theme1: false;
  theme2: false;
  selectedLanguage: string = 'en'; // Default language is English
  lang = [{
    name: 'English',
    value: 'en'
  }, {
    name: 'Mandarin',
    value: 'mnd'
  }]; // Add more languages as needed

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private behavioursubjectService: BehaviorSubjectService,
    public _cognito: CognitoService,
    public commonFunctions: CommonFunctions,
    public loaderService: LoaderService,
    public commonService: CommonService,
    private sanitizer: DomSanitizer,
    private messagingService: MessagingService,
    private modalService: NgbModal,
    private translate: TranslateService,
    private cd: ChangeDetectorRef
  ) {
    router.events?.subscribe((val) => {
      // let stringToSplit = location.path();
      // let x = stringToSplit.split('/');
      // this.highlight = x[1]?.toLowerCase()
      // this.highlight1 = x[2]?.toLowerCase()
    });
  }

  onTogglee(type: string) {
    if (type === 'profile') {
      this.isToggleProfile = !this.isToggleProfile;
      this.isToggleTheme = false; // Close theme dropdown if open
    } else if (type === 'theme') {
      this.isToggleTheme = !this.isToggleTheme;
      this.isToggleProfile = false; // Close profile dropdown if open
    }
  }

  changeTheme(themeName: string) {
    if (themeName === 'theme1') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('theme');
      this.isDarkTheme = false;
      localStorage.setItem('selectedTheme', 'theme1');
    } else if (themeName === 'theme2') {
      document.body.classList.remove('theme');
      document.body.classList.add('dark-theme');
      this.isDarkTheme = true;
      localStorage.setItem('selectedTheme', 'theme2');
    }
  }

  onUserGuide() {
    this.modalService.open(WelcomepageComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      windowClass: 'model-rights'
    })
  }

  toggleDarkTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }

  onToggleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectTYPE = input.value;
  }

  returnUrl(url) {
    let x = url.split('/');
    return x[0].toLowerCase();
  }

  searchItem(event) {
    this.router.navigate(['/profile/globalsearch'], { queryParams: { search: event } })
  }

  onTab(data) {
    this.masterActive = true;
    this.IsmasterActive = false;
    this.router.navigate(["/" + data.menuUrl]);
    setTimeout(() => {
      this.IsmasterActive = true;
    }, 500);
  }

  onManifestChange(data) {
    this.masterActive = true
    this.router.navigate(['/manifest/' + data.key]);
    window.location.replace(window.location.origin + '/manifest/' + data.key)
  }

  filterSubMenus: any = []
  isMaster: boolean = false
  currentLogin: any;

  reload() {
    if (this.currentLogin === 'warehouse' && this.selectTYPE === 'Warehouse') {
      this.router.navigate(['/warehouse']);
    } else {
      this.router.navigate(['/dashboard/list']);
    }
  }

  toggle() {
    this.active = this.themeService.getActiveTheme();
    if (this.active.name === 'light') {
      this.themeService.setTheme('dark');
    } else {
      this.themeService.setTheme('light');
    }
    this.active = this.themeService.getActiveTheme();
    this.behavioursubjectService.cartUpdatState(this.active);
  }

  onMenu(data, flag) {
    data.menuUrl = data.menuUrl == 'finance/invoice' ? 'finance/purchase' : data.menuUrl
    this.highlight = this.returnUrl(data.menuUrl);
    this.router.navigate(["/" + data.menuUrl]);

    if (flag) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  onMenu1(data) {
    this.commonFunctions.pageNo = 0
    this.highlight1 = data.menuUrl;
    this.router.navigate(["customer/" + data.menuUrl]);
  }
  userlogintype: any = null; // Initialize as null
  getUserList() {
    var parameter = {
      "project": [],
      "query": {
        "userId": this.commonFunctions.getAgentDetails()?.userId
      },
      size: Number(1000),
      from: 0,
    }

    this.commonService
      .getSTList(Constant.GET_USER, parameter)
      .subscribe((data) => {
        if (data.documents && data.documents?.length > 0) {
          this.userprofileData = data.documents[0];
          this.userlogintype = data.documents[0].userloginType;
          this.setDefaultSelectType();
          this.getMenuList();
          this.cd.detectChanges();
          
          if (this.userprofileData.userProfile) {
            this.downloadFile(this.userprofileData.userProfile)
          }
          if (this.userprofileData?.name) {
            this.userName = this.userprofileData?.name;
          }
          if (this.userprofileData?.roles?.length > 0) {
            this.userRole = this.userprofileData?.roles[0]?.roleName;
          }
        }
      });
  }
  
  setDefaultSelectType() {
    if (this.userlogintype === 'freigthForwarders') {
      if (localStorage.getItem('isImport') === 'true') {
        this.selectTYPE = 'Import';
      } else {
        this.selectTYPE = 'Export';
      }
    } else if (this.userlogintype === 'warehouse') {
      this.selectTYPE = 'Warehouse';
      localStorage.setItem('isWarehouse', 'true');
    } else if (this.userlogintype === 'transport') {
      this.selectTYPE = 'Transport';
      localStorage.setItem('isTransport', 'true');
    }
  }

  downloadFile(documentURL) {
    this.commonService.downloadDocuments('downloadfile', documentURL).subscribe(
      (fileData: Blob) => {
        const objectURL = URL.createObjectURL(fileData);
        this.imageURL = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.error(error);
      }
    );
  }
  // getMenuList(){ 
  //   let menuAccess;
  //   if(localStorage.getItem(Constant.UserDetails)){
  //     menuAccess  = JSON.parse(this.commonFunctions.get(localStorage.getItem(Constant.UserDetails))) 
  //   }
  //   let selectTYPE;
  //   if (localStorage.getItem('isImport') === 'true') {
  //      selectTYPE = 'Import'
  //   } 
  //   else if (localStorage.getItem('isTransport') === 'true') {
  //      selectTYPE = 'Transport'
  //   }
  //   else {
  //      selectTYPE = 'Export'
  //   }  
  //    var body = 
  //     {
  //       "project": [   ],
  //       "query": {
  //           "status": true,
  //       },
  //       size: 1000,
  //   }
  //   this.commonService
  //   .getSTList('menu',body)?.subscribe(data=>{

  //       var menus = []
  //       let id =""

  // let subTariffs = []
  // var menuDATA:any;
  // menuDATA = data.documents 
  // console.log(menuAccess,'menuAccess')
  // menuDATA.forEach(e=>{
  //   if(e?.parentMenuId === "")
  //   {
  //     let isMenu = []
  //      isMenu =   menuAccess?.menu.find(f=>f.menuId == e?.menuId)  
  //     let isFeatureAccess = menuAccess?.accesslevel ? menuAccess?.accesslevel.filter(f1=>f1.featureName?.toLowerCase() === e?.menuName?.toLowerCase()):[]
  //     if(isMenu ){ 
  //       menus.push(e)
  //     }
  //     // menus.push(e)
  //   }
  // })

  //       menus.forEach(e2=>{

  //     let subMenus = []

  //     data.documents?.forEach(el =>{
  //      if(e2?.menuId === el?.parentMenuId && el.category !== 'finance'){
  //       subMenus.push(el)
  //     }
  //   })
  //   e2['subMenus'] = subMenus
  //   subMenus = []
  // })
  // var mastersCategorized = []
  // masters.masterCategories.forEach(c=>{
  //   menus.forEach(el=>{
  //     if(el?.menuName === 'Masters'){
  //       this.isMaster = true
  //       let arr = []
  //       let subMenusNew = []

  //       el?.subMenus.forEach(sub=>{
  //        let isMenu = []
  //            isMenu = menuAccess?.menu ? menuAccess?.menu.filter(f=>f.menuName === sub?.menuName) : []

  //            if(isMenu.length > 0){
  //             subMenusNew.push(sub)
  //            }
  //       })


  //       subMenusNew.forEach(sub=>{
  //         if(sub?.category_code === c.category_code){
  //           if(sub.menuName.toLowerCase() !== 'user'){ 
  //             arr.push(sub)
  //           }
  //         }
  //       })

  //       arr = arr.sort(function(a, b){

  //         if(a['menuName'] < b['menuName']) { return -1; }
  //         if(a['menuName'] > b['menuName']) { return 1; }
  //         return 0;

  //     })
  //       mastersCategorized.push({name:c.category_name,menus:arr})

  //     }
  //   })
  // })
  // this.subTabMasters = mastersCategorized

  //       this.menuData = menus

  //       this.menuData = this.menuData.sort(function(a, b){
  //         if(a['sortOrder'] < b['sortOrder']) { return -1; }
  //         if(a['sortOrder'] > b['sortOrder']) { return 1; }
  //         return 0;

  //     })

  //     })


  //   }


getMenuList() {
  let menuAccess: any;
  const userDetails = localStorage.getItem(Constant.UserDetails);

  if (userDetails) {
    menuAccess = JSON.parse(this.commonFunctions.get(userDetails));
  }

  // Get current login type
  let currentLogin = this.commonFunctions.getUserType1();
  this.currentLogin = currentLogin;

  // Determine selectTYPE based on currentLogin first, then localStorage
  let selectTYPE;

  if (currentLogin === 'warehouse') {
    selectTYPE = localStorage.getItem('isImport') === 'true' ? 'Import' :
      localStorage.getItem('isTransport') === 'true' ? 'Transport' :
        localStorage.getItem('isWarehouse') === 'true' ? 'Warehouse' : 'Export';
    this.selectTYPE = selectTYPE;
  } else {
    selectTYPE = localStorage.getItem('isImport') === 'true' ? 'Import' :
      localStorage.getItem('isTransport') === 'true' ? 'Transport' :
        localStorage.getItem('isWarehouse') === 'true' ? 'Warehouse' : 'Export';
    this.selectTYPE = selectTYPE;
  }

  const body = {
    project: [],
    query: {
      status: true
    },
    size: 1000
  };

  this.commonService.getSTList('menu', body)?.subscribe(data => {
    let menus: any[] = [];
    const menuData = data.documents || [];
console.log('====================================');
console.log( menuData," menuData");
console.log('====================================');
    // Filter and push main menus
    menuData.forEach(menu => {
      if (!menu.parentMenuId) {
        let isMenu = false;
        const menuName = menu?.menuName?.toLowerCase();
        
        if (currentLogin === 'transporter') {
          // Transporter users - only specific menus
          isMenu = menuName === 'rfq' ||
            menuName === 'dashboard' ||
            menuName === 'masters' ||
            menuName === 'job';
        }
        else if (this.commonFunctions.isSuperAdmin()) {
          isMenu = menuName === 'company profile' ||
            menuName === 'release manager' ||
            menuName === 'masters';
        } 
        else {
          // For all users including warehouse - use dynamic menu access logic
          isMenu = menuAccess?.menu.find(m => m.menuId === menu?.menuId && m?.menuAccess?.includes(selectTYPE?.toLowerCase()));
        }
        
        const data = this.translate.instant(`menu.${(menu.menuName ?? '').replace(/\s+/g, '_').toLowerCase()}`);
        if (!data.includes('menu.'))
          menu.menuName1 = data;

        if (isMenu) {
          menus.push(menu);
        } else {
          console.log(` Skipped menu: ${menu?.menuName}`);
        }
      }
    });

    menus.forEach(mainMenu => {
      let subMenus;

      if (currentLogin === 'transporter') {
        subMenus = menuData.filter(subMenu =>
          subMenu?.menuName?.toLowerCase() === 'driver master' &&
          mainMenu.menuId === subMenu.parentMenuId &&
          subMenu.category !== 'finance'
        );
      }
      else if (this.commonFunctions.isSuperAdmin()) {
        subMenus = menuData.filter(subMenu =>
          subMenu?.menuName?.toLowerCase() === 'roles' &&
          mainMenu.menuId === subMenu.parentMenuId &&
          subMenu.category !== 'finance'
        );
      } 
      else if (currentLogin === 'warehouse') {
        subMenus = menuData.filter(subMenu =>
          mainMenu.menuId === subMenu.parentMenuId 
        );
      } 
      else if (selectTYPE === 'Warehouse' ) {
        subMenus = menuData.filter(subMenu =>
          mainMenu.menuId === subMenu.parentMenuId 
        );
      }
      else {
        subMenus = menuData.filter(subMenu =>
          mainMenu.menuId === subMenu.parentMenuId &&
          subMenu.category !== 'finance'
        );
      }

      mainMenu['subMenus'] = subMenus;
    });

    // Handle Masters categorization
    this.isMaster = false;
    const mastersCategorized: any[] = [];

    // Check if Masters menu exists in the filtered menus
    const mastersMenu = menus.find(menu => menu.menuName === 'Masters');
    if (mastersMenu) {
      this.isMaster = true;

      masters.masterCategories.forEach(category => {
        let subMenus;

        if (this.commonFunctions.isSuperAdmin()) {
          subMenus = mastersMenu.subMenus.filter(subMenu => {
            return subMenu.category_code === category.category_code &&
              subMenu.menuName.toLowerCase() !== 'user';
          });
        } 
        else {
          // For all users including warehouse - use menuAccess logic
          subMenus = mastersMenu.subMenus.filter(subMenu => {
            const isMenu = menuAccess?.menu?.some(m => m.menuName === subMenu.menuName);
            let typeMatch = false;

            if (selectTYPE === 'Export') {
              typeMatch = subMenu.export;
            } else if (selectTYPE === 'Import') {
              typeMatch = subMenu.import;
            } else if (selectTYPE === 'Transport') {
              typeMatch = subMenu.isTransport;
            } else if (selectTYPE === 'Warehouse') {
              typeMatch = subMenu.warehouse || true; // assuming warehouse property exists or default to true
            }

            return isMenu && typeMatch &&
              subMenu.category_code === category.category_code &&
              subMenu.menuName.toLowerCase() !== 'user';
          });
        }

        // Apply translations to submenus
        subMenus = subMenus.map(i => {
          const data = this.translate.instant(`menu.${(i.menuName ?? '').replace(/\s+/g, '_').toLowerCase()}`);
          if (!data.includes('menu.'))
            i.menuName1 = data;
          return i;
        });

        // Sort subMenus alphabetically
        subMenus.sort((a, b) => a.menuName.localeCompare(b.menuName));

        if (subMenus.length > 0) {
          mastersCategorized.push({ name: category.category_name, menus: subMenus });
        }
      });
    }

    this.subTabMasters = mastersCategorized;
    this.menuData = menus.sort((a, b) => a.sortOrder - b.sortOrder);
  });
}

  resetTheme() {
    this.changeTheme('theme1');
    localStorage.removeItem('selectedTheme');
  }

  transform(targetDate: string): number {
    const currentDate = new Date();
    const target = new Date(targetDate);
    const timeDiff = target.getTime() - currentDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff || 0;
  }

  ngOnInit(): void {
    this.getProfileCompleteness();
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
      this.changeTheme(savedTheme);
    } else {
      this.changeTheme('theme1');  // Default theme
    }

    window.addEventListener('scroll', this.handleScroll.bind(this));
    this.router.events.subscribe((event: any) => {
      this.isProfileTabOpen = ['/profile', '/changepass', '/usermanual', '/whatsnew']?.includes(event?.url) ? true : false;
    });

    this.customerUser = this.commonFunctions.getUserType()
    this.currentLogin = this.commonFunctions.getUserType1()

    this.getUserList();  
    // Auto-select Warehouse for warehouse users
    if (this.currentLogin === 'warehouse') {
      this.selectTYPE = 'Warehouse';
      localStorage.setItem('isWarehouse', 'true');
      localStorage.setItem('isExport', 'false');
      localStorage.setItem('isImport', 'false');
      localStorage.setItem('isTransport', 'false');
    } else {
      // For non-warehouse users, determine selectTYPE based on localStorage
      if (localStorage.getItem('isImport') === 'true') {
        this.selectTYPE = 'Import'
      }
      else if (localStorage.getItem('isTransport') === 'true') {
        this.selectTYPE = 'Transport'
      }
      else {
        this.selectTYPE = 'Export'
      }
    }
    this.langChangeSubscription = this.translate.onLangChange.subscribe(() => {
      this.getMenuList(); // Reload menu when language changes
    });
    this.manifestTabs = this.manifestTabs.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
    this.generalTab = this.generalTab.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
    this.operationsTab = this.operationsTab.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
    this.accountsTab = this.accountsTab.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
    this.organizationTab = this.organizationTab.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
    this.EQCTab = this.EQCTab.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })
    this.systemTypeTab = this.systemTypeTab.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })

    this._cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.isTrial = resp?.userData?.isTrial
        this.countOfTrial = this.transform(resp?.userData?.trialValidTill)
        this.activeModule = resp.module
      }
    })

    this._cognito.getUserModule()?.subscribe((resp) => {
      if (resp != null) {
        this.moduleName = resp
      }
    })

    setTimeout(() => {
      const user = this.commonFunctions.getAgentDetails();
      this.messagingService.currentMessage?.subscribe(
        (payload: any) => {
          if (user) this.getNotification();
          this.currentMessage.next(payload);
        });

      this.messagingService.onNotificationMessage()?.subscribe((res: any) => {
        if (res?.userId === user?.userId) {
          this.notificationBlink = true;
          if (res?.isReminder) {
            this.commonService.addReminder(res?.reminderData);
          }

          setTimeout(() => {
            this.getNotification();
          }, 2000);
        }
      });
    }, 1500);

    this.commonFunctions.getAccessLavelEventEmmiter?.subscribe((result) => {
      this.setModules();
    });

    this.setModules();
  }
  
  getProfileCompleteness() {
    this.loader = true;
    this.loaderService.showcircle();

    let payload = this.commonService.filterList();
    payload.query = {
      userId: this.commonFunctions.getAgentDetails().userId
    };

    this.commonService.getSTList1('profileCompletion', payload)
      .subscribe(
        (res: any) => {
          this.profileData = res;
          this.loader = false;
          this.loaderService.hidecircle();
        },
        (error) => {
          console.error('Error fetching profile completeness:', error);
          this.loader = false;
          this.loaderService.hidecircle();
        }
      );
  }

  allSectionsCompleted(): boolean {
    return this.profileData.every((section: any) => section.isCompleted);
  }

  openDialog(data?) {
    this.modalService.dismissAll();
    const modalRef = this.modalService.open(ReminderPopUpComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'md',
    });
    modalRef.componentInstance.reminderData = data;
  }

  totalCount: any
  private subscription: Subscription;

  getNotification() {
    const user = this.commonFunctions.getAgentDetails();
    let payload = this.commonService.filterList()
    payload.query = {
      "userId": user?.userId,
      read: false
    }
    payload.sort = {
      "desc": ["createdOn"]
    }
    payload.size = Number(10000),

      this.notificationList = [];

    this.commonService.getNotify('inappnotification', payload)?.subscribe((res: any) => {
      this.notificationList = res?.documents || []
      this.totalCount = res?.totalCount
      this.notificationList = this.notificationList.filter((x: any) => x?.notificationName && x?.description != "no-notification-description")
    });
  }

  formatDescription(description: string): string {
    // Regular expression to match the date and an optional trailing exclamation mark
    const datePattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)!?/;
    const match = description.match(datePattern);

    if (match) {
      // Parse the matched date string
      const originalDate = new Date(match[1]);

      // Format the date as DD-MM-YYYY
      const day = originalDate.getUTCDate().toString().padStart(2, '0');
      const month = (originalDate.getUTCMonth() + 1).toString().padStart(2, '0');
      const year = originalDate.getUTCFullYear();

      const formattedDate = `${day}-${month}-${year}`;

      // Replace the original date and exclamation mark in the description with the formatted date
      description = description.replace(datePattern, formattedDate);
    }

    return description;
  }

  setModules() {
    this.moduleData = [];
    this.moduleData = this._cognito.getModules();
    if (this.moduleData && this.moduleData.length > 0) {
      if (this.commonFunctions.getSelectedModule()) {
        this.SelectedModule = this.commonFunctions.getSelectedModule();
      }
      else {
        this.commonFunctions.setSelectedModule(this.moduleData[0]);
        this.SelectedModule = this.moduleData[0];
      }
      this.ngOnChangeModule();
    }
  }

  logout() {
    this.resetTheme();
    this._cognito.signout().then((res) => {
      this.commonFunctions.Logout(401);
    });
  }

  onToggle(dropdown: string) {
    if (dropdown === 'profile') {
      this.isToggleProfile = !this.isToggleProfile;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const targetElement = event.target as HTMLElement;
    const clickedInside = targetElement.closest('.dropdown');
    if (!clickedInside) {
      this.isToggleProfile = false;
    }
  }

  ngOnChangeModule() {
    this.commonFunctions.setSelectedModule(this.SelectedModule);
    var roleData = this._cognito.getAccessLevels();
    var menuData = [];
    if (roleData && roleData.length) {
      roleData.forEach((element) => {
        Constant.FEATURE_ACCESS.forEach((access) => {
          var wildcardUser = element.includes(Constant.Wildcard);
          if (wildcardUser) {
            this.wildCardUser = true;
            return;
          }
          var isPresent = access.accessLevel.filter((x) => x.name === element);
          var isPresentModule = access.module.filter((x) => x.name === this.SelectedModule);

          if (isPresent && isPresent.length > 0 && isPresentModule && isPresentModule.length > 0) {
            var isPresentMenuData = menuData.filter(x => x.name === access.name);
            if (isPresentMenuData && isPresentMenuData.length <= 0) {
              menuData.push(access);
            }
          }
        });
      });
      if (this.wildCardUser) {
        Constant.FEATURE_ACCESS.forEach((access) => {
          var isPresentModule = access.module.filter((x) => x.name === this.SelectedModule);
          if (isPresentModule && isPresentModule.length > 0) {
            var isPresentMenuData = menuData.filter(x => x.name === access.name);
            if (isPresentMenuData && isPresentMenuData.length <= 0) {
              menuData.push(access);
            }
          }
        });
      }

      this.menuData = menuData.sort((a, b) => (a['srNo'] > b['srNo'] ? 1 : -1));
    }
  }

  ngOnChangeType() {
    localStorage.setItem('isExport', this.selectTYPE === 'Export' ? 'true' : 'false');
    localStorage.setItem('isTransport', this.selectTYPE === 'Transport' ? 'true' : 'false');
    localStorage.setItem('isImport', this.selectTYPE === 'Import' ? 'true' : 'false');
    localStorage.setItem('isWarehouse', this.selectTYPE === 'Warehouse' ? 'true' : 'false');

    // Refresh menu list to show appropriate menus based on selection
    this.getMenuList();

    if (this.selectTYPE === 'Export' || this.selectTYPE === 'Transport') {
      this.onMenu(
        {
          name: 'enquiry',
          menuUrl: 'enquiry/list'
        }, true
      );
    }
    else if (this.selectTYPE === 'Import') {
      this.onMenu(
        {
          name: 'agent advice',
          menuUrl: 'agent-advice/list'
        }, false
      );
    }
    else if (this.selectTYPE === 'Warehouse') {
      this.onMenu(
        {
          name: 'Warehouse',
          menuUrl: 'warehouse'
        }, true
      );
    }
  }

  getImageName(img) {
   if (img === "Trade Finance") {
    return `compliance-management.svg`;
  }
    return `${img?.toLowerCase().replace(/ /g, '-')}.svg`
  }

  newInquiry() {
    this.router.navigate(['/customer/quotation/list/add']);
  }

  newAgentAdvise() {
    this.router.navigate(['/customer/quotation/list/add-agent']);
  }

  performSearch() {
    // Navigate to the search page
    this.router.navigate(['/search']);
  }

  handleScroll(): void {
    const scrollY = window.scrollY;
    const header = document.getElementById('app-logo-header');

    if (scrollY > 0 && !this.isHeaderHidden) {
      header.classList.add('mat-toolbar--hidden', 'mat-toolbar');
      this.isHeaderHidden = true;
    } else if (scrollY === 0 && this.isHeaderHidden) {
      header.classList.remove('mat-toolbar--hidden', 'mat-toolbar');
      this.isHeaderHidden = false;
    }
  }

  getLanguage(selectedLang: string) {
    this.translate.use(selectedLang);
  }
}