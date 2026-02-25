import { MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

export class GlobalConstants {
  public static readonly DIABOS_USER_NAME: string = 'DIABOS';
  public static readonly OPERATOR_USER_NAME: string = 'OPERATOR';
  public static readonly BUYER_USER_NAME: string = 'buyer';
  public static readonly SELLER_USER_NAME: string = 'seller';
  public static readonly THREE_DOTS: string = '...';
  public static readonly LOADER_TEXT: string = `Loading${this.THREE_DOTS}Please Wait`;
  public static readonly NDF: string = 'No data found';
  public static NO_DATA_FOUND_FOR_SEARCH_INPUT = 'No data found';
  public static readonly NO_DATA_FOUND: string = 'No data found';
  public static readonly EXPAND_ICON: string = 'control_point';
  public static readonly COLLAPSE_ICON: string = 'remove_circle_outline';
  public static readonly SOMETHING_WENT_WRONG: string =
    'Oops..! Something went wrong, please try again later.';
  public static readonly FILE_SIZE: string = 'File Size Exceeds 25 MB';
  public static readonly TIMEOUT = true;
  public static readonly FORM_CLOSE_WARN_MESSAGE =
    'There are unsaved changes, would you like to continue?';
  public static readonly NODATA = 'Data not found';
  public static readonly NONOTIFICATIONS = 'No Notification found!';
  //PAGINATION CONSTANTS
  public static readonly LESS_PAGINATOR_OPTIONS: number[] = [2, 4, 6, 8];
  public static readonly PAGINATOR_OPTIONS: number[] = [10, 20, 50, 100];
  //PAGINATION CONSTANTS

  //SNACKTOASTER CONSTANTS
  public static readonly DEFAULT_ERROR_MESSAGE: string = 'Error';
  public static readonly DEFAULT_INFO_MESSAGE: string = 'Info';
  public static readonly DEAFULT_SNACK_TOASTER_TIMER: number = 3000;
  public static readonly DEFAULT_SUCCESS_MESSAGE: string = 'Success';
  public static readonly SNACK_TOASTER_INFO: string = 'snackToaster_info';
  public static readonly DEFAULT_SNACK_TOASTER_CLASS: string =
    'snackToaster_info';
  public static readonly SNACK_TOASTER_ERROR: string = 'snackToaster_error';
  public static readonly SNACK_TOASTER_WARN: string = 'snackToaster_warn';
  public static readonly SNACK_TOASTER_SUCCESS: string = 'snackToaster_success';
  public static readonly SNACK_TOASTER_CONFIG: MatSnackBarConfig = {
    politeness: 'polite',
    direction: 'ltr',
    verticalPosition: 'top',
    horizontalPosition: 'right',
  };
  //SNACKTOASTER CONSTANTS

  //MATERIAL MODAL CONFIGS
  public static readonly SMALL_MODAL_CONFIG: MatDialogConfig = {
    hasBackdrop: true,
    disableClose: true,
    width: '1000px',
    maxHeight: '90vh',
    autoFocus: false,
  };
  public static readonly CONFIRMATION_MODAL_CONFIG: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    maxWidth: '450px',
    height: 'auto',
    autoFocus: false,
    panelClass: 'globalConfirmationModal',
  };
  public static readonly CONFIRMATION_MODAL_CONFIG_WITH_REMARKS: MatDialogConfig =
    {
      disableClose: true,
      hasBackdrop: true,
      maxWidth: '450px',
      height: 'auto',
      autoFocus: false,
      panelClass: 'globalConfirmationModal',
    };
  public static readonly MEDIUM_MODAL_CONFIG: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    maxWidth: '680px',
    height: 'auto',
    autoFocus: false,
  };
  public static readonly MEDIUM_WIDTH_MODAL_CONFIG: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    width: '490px',
    height: 'auto',
    autoFocus: false,
  };
  public static readonly MEDIUM_WIDTH_MODAL_CONFIG_PX: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    width: '560px',
    height: 'auto',
    autoFocus: false,
  };

  public static readonly MODAL_CONFIG: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    autoFocus: false,
  };
  public static readonly LARGE_MODAL_CONFIG: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    maxWidth: '680px',
    maxHeight: '100vh',
    autoFocus: false,
  };

  public static readonly FULL_MODAL_CONFIG: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    maxWidth: '100%',
    maxHeight: '100vh',
    autoFocus: false,
  };

  public static readonly MODAL_CONFIG_CLOSE: MatDialogConfig = {
    disableClose: false,
    hasBackdrop: true,
    autoFocus: false,
  };
  //MATERIAL MODAL CONFIGS

  //MONTHS & DAYS
  public static readonly MONTHS_SHORT_LIST: string[] = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  public static readonly DAY_SHORT_LIST: string[] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];
  //MONTHS & DAYS
 public static readonly WEEKDAYS: string[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
 public static readonly MONTHS : string[]= ["January", "February", "March", "April", "May", "June", "July", "August", "September","October","November","December"]
 public static readonly occurrence: string[] = ["Last","First",'Second','Third','Fourth','Fifth'];
  //common arrays
  public static readonly ACTIVE_INACTIVE_LIST = [
    { id: true, value: 'Active' },
    { id: false, value: 'Inactive' },
  ];
  //   static FILE_SIZE: string;
  //common arrays

  // DMS CONSTANTS BEGINS
  public static readonly SERVER_NAME = 'DMS SERVER';
  public static readonly ROOM_NAME = 'DIABOS DMS';
  public static readonly USER_NAME = 'adminuser';
  public static readonly PASSWORD = 'Content@151';
  public static readonly LOCAL_ADDRESS = '10.4.8.8';
  public static readonly ENCRYPTION_LOGIC = '2';
  public static readonly NODE_ID = '3';
  public static readonly ROW_COUNT = '1000';

  public static readonly MASTER_FOLDER_ID = '746';
  public static readonly VESSEL_FOLDER_ID = '3';
  public static readonly PORTCALL_FOLDER_ID = '858';
  public static readonly PROFILE_FOLDER_ID = '925';
  public static readonly PDA_FOLDER_ID = '959';
  public static readonly TOOLS_FOLDER_ID = '958';
  // DMS CONSTANTS BEGINS\

  // Refinitive constants
  public static readonly groupId = '5jb6sp6g7vnb1gxol60ilgjit';
  public static readonly typeId = 'SFCT_7';

  //PDA READONLY FLAG FOR UNWANTED FEATURES
  public static readonly DA_HIDE_FEATURES = true;
  //PDA READONLY FLAG FOR UNWANTED FEATURES

  public static readonly UserDetails = 'UserDetails';
  public static readonly EncryptionKey = '123456$#@$^@1ERF';
  public static readonly EncryptionReplaceKey = 'PdfhSADjbh';
  public static readonly UserRoleAccess = 'UserRoleAccess';
  public static readonly SIZE_FOR_REQUEST = 500;
  public static readonly HomePagePath = '/da/dashboard';
  public static readonly SuccessStatus = 'Success';
  /* eslint-disable-next-line */
  public static readonly dropdownDetails: any = {
    country: ['_source', 'countryName'],
    port: ['_source', 'portDetails', 'portName'],
    activity: ['_source', 'activityName'],
    department: ['_source', 'deptName'],
    currency: ['_source', 'currencyShortName'],
    costhead: ['_source', 'costheadName'],
    costitem: ['_source', 'costitemName'],
    address: ['_source', 'companyName'],
    timezone: ['_source', 'timezone'],
  };
  public static readonly dropDownAPINameList = [
    'country',
    'port',
    'activity',
    'department',
    'currency',
    'costhead',
    'costitem',
    'address',
  ];
}
export interface CONFIRMATION_MODAL_PARAMS {
  message: string,
  statusUpdateModal?: boolean // if this is true, remarks column will be shown 
}
export interface CONFIRMATION_MODAL_RESPONSE {
  userChoice: boolean,  //true = yes (and) false = NO
  remarksEntered: string
}