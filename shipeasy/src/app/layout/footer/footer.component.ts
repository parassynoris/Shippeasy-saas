import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NeedhelpComponent } from '../needhelp/needhelp.component';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { ChatComponent } from '../chat/chat.component';
import { CommonService } from 'src/app/services/common/common.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  userdetails: any = [];
  badgeData: any = { unReadMessageCount: 0 };
  customerUser: boolean;
  superAdmin: any = '';
  isDropdownOpen = false;
  isOpenChat = false;
  groupMessageCount = 0;

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.isDropdownOpen && !this.eRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
      this.renderer.removeClass(this.eRef.nativeElement.querySelector('.dropdown-menu'), 'show');
    }
  }

  year = (new Date()).getFullYear();
  constructor(
    private modalService: NgbModal,
    private commonFunctions: CommonFunctions,
    private notification: NzNotificationService,
    private eRef: ElementRef,
    private renderer: Renderer2,
    private commonService: CommonService,
    private messagingService: MessagingService
  ) { }

  ngOnInit(): void {
    this.customerUser = this.commonFunctions.getUserType();
    this.getUserList();
    this.getmsg();
    this.superAdmin =this.commonFunctions.isSuperAdmin()
  } 
  getmsg() {
    this.messagingService.getMesageNotification()?.subscribe((res: any) => {
      const agentDetails = this.commonFunctions.getAgentDetails();

      if (res?.toUserId === agentDetails?.userId) {
        if (res?.messageType === 'group') {
          this.groupMessageCount += 1;
        } else if (res?.messageType === 'direct') {
          this.badgeData['unReadMessageCount'] += 1;
        }
        this.messagingService.getCount({
          count: 1,
          isAdd: true,
          isGroup: res?.messageType === 'group',
        });
      }
    });

    this.messagingService?.msgCountobservation$?.subscribe((res: any) => {
      if (res?.count > 0) {
        if (res?.isAdd) {
          if (res?.isGroup) {
            this.groupMessageCount += res?.count;
          } else {
            this.badgeData['unReadMessageCount'] += res?.count;
          }
        } else {
          if (res?.isGroup) {
            this.groupMessageCount -= res?.count;
          } else {
            this.badgeData["unReadMessageCount"] -= res?.count;
          }
        }
      }
    });
  }

  getUserList() {
    let payload = this.commonService.filterList();

    this.commonService.getSTList1('chatInitialization', payload)?.subscribe((data) => {
      this.userdetails = data?.userData;
      this.badgeData = data?.badgeData || { unReadMessageCount: 0 };
    });
  }

  onOpenHelp() {
    this.modalService.open(NeedhelpComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'modal-bottom',
    });
  }

  onWebchat() {
    this.isOpenChat = true;

    // Reset unread message count when chat is opened
    this.groupMessageCount = 0;
    this.badgeData['unReadMessageCount'] = 0;

    const chatPopup = this.modalService.open(ChatComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      backdrop: 'static',
      windowClass: 'model-right',
    });

    chatPopup.componentInstance.onclosePopupChat?.subscribe(() => {
      this.isOpenChat = false;
    });
  }

  onCloseModal() {
    this.modalService.dismissAll();
  }
}
