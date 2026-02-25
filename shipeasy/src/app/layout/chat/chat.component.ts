import { Component, ElementRef, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { CommonService } from 'src/app/services/common/common.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MessagingService } from 'src/app/services/messaging.service';

export interface Message {
  messageText: string;
  sentByMe: boolean;
  createdOn: Date;
}

export interface Contact {
  name: string;
  avatar: string;
}

export interface Chat {
  contact: Contact;
  lastMessage: Message;
  messages: any[];
}
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesContainer', { static: false }) messagesContainerRef: ElementRef<HTMLDivElement> | undefined;
  userdetails: any = [];
  badgeData: any;
  activeContact: any
  selectedChat: any;
  newMessage: string = '';
  isLoading = false;
  isGroupChatOpen = false;
  isNewChatOpen = false;
  @Output() onclosePopupChat = new EventEmitter<any>();
  userData: any;

  constructor(private commonService: CommonService, private commonfunction: CommonFunctions, private modalService: NgbModal, private messagingService: MessagingService) {

  }

  ngOnInit(): void {
    this.getUserList()
    this.getmsg();
    this.getstatus();
  }
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainerRef && this.messagesContainerRef.nativeElement) {
        this.messagesContainerRef.nativeElement.scrollTop = this.messagesContainerRef.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  getUserList() {
    this.isLoading = true;
    let payload = this.commonService.filterList()
    this.commonService
      .getSTList1('chatInitialization', payload)
      ?.subscribe((data) => {
        this.isLoading = false;
        this.userdetails = data?.userData;
        this.userData = data?.userData;
        this.badgeData = data?.badgeData;
        this.sortContacts();
        // this.setActiveContact (data?.userData[0]);
      }, () => {
        this.isLoading = false;
      });
  }
  sortContacts() {
    this.userdetails = this.userdetails?.sort((a, b) => {
      const dateA = a.lastMessage?.createdOn ? new Date(a.lastMessage?.createdOn).getTime() : 0;
      const dateB = b.lastMessage?.createdOn ? new Date(b.lastMessage?.createdOn).getTime() : 0;
      return dateB - dateA;
    });
    this.markMessagesForDateSeparation();
  }
  clearActiveContact() {
    this.userdetails = this.userData
    this.activeContact = null;
    this.selectedChat = null;
    this.isGroupChatOpen = false;
    this.isNewChatOpen = false;
  }
  setActiveContact(contact) {
    this.activeContact = contact;
    if (contact['unReadCount'] > 0) this.messagingService.getCount({ count: contact['unReadCount'], isAdd: false })
    contact['unReadCount'] = 0;
    this.getchat();

  }
  truncateText(text: string, maxLength: number): string {
    if (text?.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  }
  onCloseModal() {
    this.modalService.dismissAll();
    this.onclosePopupChat?.emit(true);
    this.isGroupChatOpen = false;
    this.isNewChatOpen = false;
    this.activeContact = null;
  }

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
  }
  openGroupChat() {
    this.isGroupChatOpen = true;
    this.isNewChatOpen = false;
    this.activeContact = null;
  }
  openNewChat() {
    this.isNewChatOpen = true;
    this.isGroupChatOpen = false;
    this.activeContact = null;
  }

  onBackFromGroupChat(): void {
    this.isGroupChatOpen = false;
    this.isNewChatOpen = false;
  }

  backbtnClicked(): void {
    this.isGroupChatOpen = false;
    this.isNewChatOpen = false;
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.userdetails = this.userData.filter((user) =>
      user.name.toLowerCase().includes(query)
    );
    if (this.userdetails.length === 0) {
      console.error();
    } else {
    }
  }

  get shouldShowUserNotFoundMessage(): boolean {
    return this.userdetails.length === 0 && !this.isGroupChatOpen && !this.isNewChatOpen;
  }

  sendMessage(): void {

    if (this.selectedChat && this.newMessage?.trim() !== '') {
      let payload;

      if (this.activeContact.isGroup) {
        payload = {
          "toGroupId": this.activeContact?.groupchatId,
          "isGroupMessage": true,
          "messageText": this.newMessage?.trim(),
          "usersStatus": [
            {
              userId: this.commonfunction.getAgentDetails()?.userId,
              isRead: true
            }
          ]
        }
      } else {
        payload = {
          "toUserId": this.activeContact?.userId,
          "toUserName": this.activeContact?.userName,
          "toUserLogin": this.activeContact?.userLogin,
          "messageText": this.newMessage?.trim(),
        }
      }

      this.messagingService?.sendMessage('send-message', payload);
      this.newMessage = '';
    }
  }
  getmsg() {
    this.messagingService?.getMesageNotification()?.subscribe((res: any) => {
      if (res?.isGroupMessage) {
        if (res?.toGroupId === this.activeContact?.groupchatId || res?.fromUserId === this.activeContact?.userId) {
          res['sentByMe'] = res?.fromUserId === this.commonfunction.getAgentDetails()?.userId ? true : false;
          this.selectedChat.messages.push(res);
          const index = this.userdetails.findIndex(rr => rr?.groupchatId === this.activeContact?.groupchatId);
          this.userdetails[index]['lastMessage'] = res;
          this.sortContacts();
          this.scrollToBottom();
          const unreadmessage = [{ messageId: res?.messageId, usersStatus: [...(res?.usersStatus || []), { userId: this.commonfunction.getAgentDetails()?.userId, isRead: true }] }];
          if (res?.fromUserId != this.commonfunction.getAgentDetails()?.userId) {
            this.batchUpdate("message", unreadmessage);
            this.messagingService.getCount({ count: 1, isAdd: false })
          }
        }
        if (!this.activeContact?.groupchatId && this.userdetails?.find(rr => rr?.groupchatId === res?.toGroupId)?.groupchatId) {
          const index = this.userdetails.findIndex(rr => rr?.groupchatId === res?.toGroupId);
          this.userdetails[index]['lastMessage'] = res;
          this.userdetails[index]['unReadCount'] += 1;
          this.messagingService.getCount({ count: 1, isAdd: true })
          this.sortContacts();
        }
      } else {
        if (res?.toUserId === this.activeContact?.userId || res?.fromUserId === this.activeContact?.userId) {
          res['sentByMe'] = res?.fromUserId === this.activeContact?.userId ? false : true;
          this.selectedChat.messages.push(res);
          const index = this.userdetails.findIndex(rr => rr?.userId === this.activeContact?.userId);
          this.userdetails[index]['lastMessage'] = res;
          this.sortContacts();
          this.scrollToBottom();
          const unreadmessage = [{ messageId: res?.messageId, isRead: true }];
          if (res?.toUserId === this.commonfunction.getAgentDetails()?.userId) {
            this.batchUpdate("message", unreadmessage);
            this.messagingService.getCount({ count: 1, isAdd: false })
          }
        }
        if (!this.activeContact?.userId && this.userdetails?.find(rr => rr?.userId === res?.fromUserId)?.userId) {
          const index = this.userdetails.findIndex(rr => rr?.userId === res?.fromUserId);
          this.userdetails[index]['lastMessage'] = res;
          this.userdetails[index]['unReadCount'] += 1;
          // this.messagingService.getCount({count:1,isAdd:true})
          this.sortContacts();
        }
      }
    });
  }
  getstatus() {
    this.messagingService?.getuseronlineOfflinestatus()?.subscribe((res: any) => {
      if (this.userdetails?.find(rr => rr?.userId === res?.userId)?.userId) {
        const index = this.userdetails.findIndex(rr => rr?.userId === res?.userId);
        this.userdetails[index]['userSocketStatus'] = res?.userSocketStatus;
      }
    })
  }

  getchat() {
    let payload: any = this.commonService.filterList()
    // if (payload?.query) payload.query["$or"] = [{
    //   "toUserId": this.activeContact?.userId
    // }, {
    //   "fromUserId": this.activeContact?.userId
    // }];

    console.log(this.activeContact)

    if (this.activeContact?.isGroup) {
      if (payload?.query)
        payload.query = {
          toGroupId: this.activeContact.groupchatId
        }
    } else {
      if (payload?.query)
        payload.query["$or"] = [
          {
            "$and": [
              { toUserId: this.activeContact?.userId },
              { fromUserId: this.commonfunction.getAgentDetails()?.userId }
            ]
          },
          {
            "$and": [
              { toUserId: this.commonfunction.getAgentDetails()?.userId },
              { fromUserId: this.activeContact?.userId }
            ]
          }
        ]

    }

    if (payload?.sort) payload.sort = {
      "asc": ['createdOn']
    }

    this.commonService
      .getSTList('message', payload)
      ?.subscribe((data) => {
        if (!this.selectedChat) {
          this.selectedChat = {};
        }
        this.selectedChat["messages"] = (data?.documents ?? [])?.map((rr: any) => {
          return {
            ...rr,
            sentByMe: rr?.fromUserId === this.commonfunction.getAgentDetails()?.userId ? true : false
          }
        })
        this.markMessagesForDateSeparation();
        let unreadmessage;

        if (this.activeContact?.isGroup) {
          unreadmessage = this.selectedChat["messages"]?.filter(r => r?.toGroupId === this.activeContact.groupchatId && !r?.usersStatus?.find(x => x.userId === this.commonfunction.getAgentDetails()?.userId)?.isRead)?.map(tt => {
            return {
              messageId: tt?.messageId,
              usersStatus: [...(tt?.usersStatus || []), { userId: this.commonfunction.getAgentDetails()?.userId, isRead: true }]
            }
          });
          console.log(unreadmessage);
        } else {
          unreadmessage = this.selectedChat["messages"]?.filter(r => r?.toUserId === this.commonfunction.getAgentDetails()?.userId && !r?.isRead)?.map(tt => {
            return {
              messageId: tt?.messageId,
              isRead: true
            }
          });
        }
        if (unreadmessage?.length > 0) {
          this.batchUpdate("message", unreadmessage);
        }
      });
  }

  markMessagesForDateSeparation() {
    if (this.selectedChat?.messages?.length > 0) {
      let lastMessageDate: Date | null = null;

      for (let i = 0; i < this.selectedChat.messages.length; i++) {
        const messageDate = new Date(this.selectedChat.messages[i].createdOn);

        if (i === 0 || !lastMessageDate || this.isNewDay(lastMessageDate, messageDate)) {
          this.selectedChat.messages[i].showDateSeparator = true;
        } else {
          this.selectedChat.messages[i].showDateSeparator = false;
        }

        lastMessageDate = messageDate;
      }
    }
  }

  isNewDay(date1: Date, date2: Date): boolean {
    return date1.getDate() !== date2.getDate() ||
      date1.getMonth() !== date2.getMonth() ||
      date1.getFullYear() !== date2.getFullYear();
  }

  batchUpdate(type, payload) {
    this.commonService.batchUpdate(type + '/batchupdate', payload).subscribe((res: any) => {

    })
  }


}
