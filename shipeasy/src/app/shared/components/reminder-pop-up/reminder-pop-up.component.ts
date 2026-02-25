import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from 'src/app/services/common/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonFunctions } from '../../functions/common.function';

@Component({
  selector: 'app-reminder-pop-up',
  templateUrl: './reminder-pop-up.component.html',
  styleUrls: ['./reminder-pop-up.component.scss']
})
export class ReminderPopUpComponent implements OnInit {
  @Input() public reminderData;
  reminders: any = [];
  constructor(private commonFunctions: CommonFunctions, private commonService: CommonService) { }

  ngOnInit(): void {
    this.reminders = this.commonService.getReminders();
    this.getRemiders();
  }


  getRemiders() {
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      userId: this.commonFunctions.getAgentDetails()?.userId,
      isVisited: false,
      reminderStatus: 'Completed'
    }
    this.commonService
      .getSTList('reminder', payload)
      ?.subscribe((res: any) => {
        const reminderList = res?.documents;
        reminderList?.forEach((rm)=>{
          if(!this.reminders?.find(rr=>rr?.reminderId)){
            this.reminders.push(rm);
          }
        })
      }, () => {

      });
  }
  clearReminders() {
    let payload = []
    this.reminders.filter((x) => {
      payload.push({
        // ...x,
        reminderId: x?.reminderId,
        isVisited: true
        // isSent: x?.reminderStatus,
        // reminderStatus:'Completed',
      })
    })
    this.commonService.batchUpdate('reminder/batchupdate', payload).subscribe((res: any) => {
      this.commonService.clearReminders();
      this.reminders = [];
    })

  }

  save(reminder, key) {
    let payload = {
      // ...reminder,
      reminderId: reminder?.reminderId,
      // isSent: !key ? false : reminder?.reminderStatus,
      reminderStatus: key ? 'Completed' : reminder?.reminderStatus,
    }
    if (key) {
      payload['isVisited'] = true;
    }
    this.commonService.UpdateToST(`reminder/${reminder?.reminderId}`, payload).subscribe(
      (res: any) => {
        if (res) {
          this.reminders = this.reminders.filter((x) => x.reminderId !== reminder?.reminderId);
          // this.notification.create(
          //   'success',
          //   'Update Successfully',
          //   ''
          // ); 
        }
      },
      (error) => {
        // this.notification.create('error', error?.error?.error?.message, ''); 
      }
    );

  }
}
