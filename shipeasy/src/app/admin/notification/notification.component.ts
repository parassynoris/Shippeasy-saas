import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns'
import { BehaviorSubject } from 'rxjs';
import { Notification } from 'src/app/models/header';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { CommonService } from 'src/app/services/common/common.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { MessagingService } from 'src/app/services/messaging.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { LoaderService } from 'src/app/services/loader.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  notificationList: Notification[] = [];
  end=new Date();
  start=new Date(this.end);
  maxDate = new Date();
  unreadChecked: Boolean = true;
  startDate = new Date();
  endDate = new Date();
  _gc=GlobalConstants
  readChecked: Boolean = false;
  notificationData: any = {};
  notifications: any = {};
  totalLength: number;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  dateRange =new Date();
  currentMessage = new BehaviorSubject(null);
picker: any;

  constructor(private profilesService: ProfilesService,private notification: NzNotificationService,private commonService : CommonService,
    private commonFunctions : CommonFunctions,
    public messagingService : MessagingService, public loaderService: LoaderService,) {

  }

  ngOnInit(): void {
    this.startDate.setDate(this.startDate.getDate() - 5);
    setTimeout(() => {
      const user = this.commonFunctions.getAgentDetails();
      this.messagingService.currentMessage?.subscribe(
        /* eslint-disable-next-line */
        (payload:any) => {
          if(user) this.getNotiList(true);
          this.currentMessage.next(payload);
        });
        /* eslint-disable-next-line */
        this.messagingService.onNotificationMessage()?.subscribe((res:any)=>{
          if(res?.userId === user?.userId){
            // this.commonService.openSnackToaster(res?.notificationName,"X")
              setTimeout(() => {
              this.getNotiList(true);
            }, 2000);
          }
        });
    }, 1500);
  }
  
  getNotiList(flag: boolean, obj?: any , type?: string) {
    this.loaderService.showcircle();
    const user = this.commonFunctions.getAgentDetails();
    let payload = this.commonService.filterList();

    if (flag && !(this.readChecked && this.unreadChecked)) {
      payload.query = {
        userId: user?.userId,
        read: this.readChecked
      };
    } else {
      payload.query = {
        userId: user?.userId
      };
    }

    payload.size = Number(this.size);
    payload.from = this.page - 1;
    payload.sort = {
      desc: ["createdOn"]
    };

    if (obj) {
      payload.query = { createdOn: obj };
    }

    this.notificationList = [];

    this.commonService.getSTList('inappnotification', payload)?.subscribe((res: any) => {
      this.notificationList = res?.documents || [];
      this.notificationList = this.notificationList.filter((x: any) => x?.notificationName && x?.description !== "no-notification-description");
      this.totalLength = res.totalCount;
      // this.count = this.notificationList.length;
      this.count = type === 'prev' ? this.totalLength === this.count ? this.count -  ((this.totalLength % Number(this.size))>0?(this.totalLength % Number(this.size)):(Number(this.size))) : this.count - res.documents.length : this.count + res.documents.length;
      this.loaderService.hidecircle();
    }, () => {
      this.loaderService.hidecircle();
    });
  }

  formatDate(createdOn: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const createdDate = new Date(createdOn);
    const timeString = formatDate(createdOn, 'hh:mm', 'en-US');

    if (this.isSameDay(createdDate, today)) {
      return `Today, ${timeString}`;
    } else if (this.isSameDay(createdDate, yesterday)) {
      return `Yesterday, ${timeString}`;
    } else {
      return formatDate(createdOn, 'EEEE, dd-MM-yyyy, hh:mm', 'en-US');
    }
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }
  readNotification(key) {
    let data = {...key, read : true}

    this.commonService.UpdateToST(`inappnotification/${key.inappnotificationId}`,data)?.subscribe((res: any) => {
      if (res) {
        // window.location.reload();
        this.getNotiList(true);
        // setTimeout(() => {
        //   this.notification.create(
        //     'success',
        //     'Read Successfully',
        //     ''
        //   );
        //   this.getNotiList(); 
        // }, 500);
       
      }
    });
  }
  readNotificationAll() {
    const user = this.commonFunctions.getAgentDetails();
  
    let data = {
      userId: user?.userId
    };
  
    // Call the service to clear notifications
    this.commonService.clearNotification('clearAllNotification', data)?.subscribe((res: any) => {
      if (res) {
        this.getNotiList(true); // Get the updated notification list
  
        // Refresh the page after clearing notifications
        setTimeout(() => {
          window.location.reload(); // Reload the page
        }, 500); // Optional delay of 500ms before refreshing
      }
    });
  }
  todateValue: any = '';
  fromdateValue: any = '';
  clear() {
    this.dateRange = null
    this.todateValue = '';
    this.fromdateValue = '';
    this.onchangespend()
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

// Correct the variable names and calculation logic
next() {
  if (this.totalLength > this.count) {
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
  this.fromSize = 1; // Reset to the first page on filter change
  this.getNotiList(false);
}

getPaginationData(type: any) {
  this.loaderService.showcircle();
  const user = this.commonFunctions.getAgentDetails();
  
  // Ensure fromSize does not go below 1
  this.fromSize = type === 'prev' ? Math.max(1, this.fromSize - Number(this.size)) : this.count + 1;
  
  let payload = this.commonService.filterList();
  payload.query = {};

  // Adjust query based on read/unread status
  if (this.readChecked) {
    payload.query = {
      userId: user?.userId,
      read: this.readChecked
    };
  } else {
    payload.query = {
      userId: user?.userId,
    };
  }

  // Pagination payload
  payload.size = Number(this.size);
  payload.from = this.fromSize - 1; // Adjust index for backend pagination
  payload.sort = {
    "desc": ["updatedOn"]
  };

  // Fetch notification list
  this.commonService.getSTList('inappnotification', payload)?.subscribe((data) => {
    this.notificationList = data.documents;
    this.totalLength = data.totalCount;
    
    // Update page and count based on the response and pagination action
    this.page = type === 'prev' ? Math.max(0, this.page - 1) : this.page + 1;
    
    this.count = type === 'prev'
      ? Math.max(0, this.count - data.documents.length)
      : this.count + data.documents.length;
  });
}

onCheckBoxChange(event, type) {
  if (type === 'read') {
    this.readChecked = event.target.checked;
    this.getNotiList(true);
  } else {
    this.unreadChecked = event.target.checked;
    this.getNotiList(true);
  }
}
 

  onchangespend() {
		if (this.end) {
			if(this.end.getDate() === new Date().getDate()){
				this.end = new Date();
			}
      const obj ={
        $gte: format(this.startDate,"yyyy-MM-dd") + 'T00:00:00.000Z',
         $lte:format(this.endDate,"yyyy-MM-dd") + 'T23:59:00.000Z'}
      this.getNotiList(true,obj)
	}
  }
  save(data , key){
    let payload = {
      ...data, 
      // isSent : !key ? false : data?.reminderStatus, 
      reminderStatus: key ? 'Completed' : data?.reminderStatus, 
    }
     
      this.commonService.UpdateToST(`reminder/${data?.reminderId}`, payload).subscribe(
        (res: any) => {
          if (res) {
            this.notification.create(
              'success',
              'Update Successfully',
              ''
            );   
            window.location.reload();
          }
        },
        (error) => {
          this.notification.create('error', error?.error?.error?.message, ''); 
          window.location.reload();
        }
      );
   
  }
}