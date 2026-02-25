import { Component, OnInit, EventEmitter, Output, Input, SimpleChanges, OnChanges } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CognitoService } from 'src/app/services/cognito.service';
import { CommonService } from 'src/app/services/common/common.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { LoaderService } from 'src/app/services/loader.service';
import * as Constant from 'src/app/shared/common-constants';

@Component({
  selector: 'app-group-chat',
  templateUrl: './group-chat.component.html',
  styleUrls: ['./group-chat.component.scss']
})
export class GroupChatComponent implements OnInit,OnChanges {
  @Output() backButtonClicked = new EventEmitter<void>();
  @Input() userdetails:any=[];
  parentID: any;
  pageSize: number = 10;
  from: number = 0;
  page: number = 1;
  // userdetails: any[] = [];
  badgeData:any;
  userData: any;
  internalUsers: any[] = [];
  dataSource = new MatTableDataSource();
  _gc = GlobalConstants;
  sort1: any;
  totalLength: number = 0;
  count: number = 0;
  isLoading = false;
  selectedUsers: any = [];
  viewStepper: boolean = false;
  channelName: string;
  userId: string = '';
  userName: string = '';

  constructor(
    private notification: NzNotificationService,
    private commonService: CommonService,
    private activateRoute: ActivatedRoute,
    public loaderService: LoaderService,
    private cognito: CognitoService
  ) {
    this.activateRoute.params?.subscribe((params) => {
      this.parentID = params.id;
    });
  }
  ngOnChanges(change:SimpleChanges):void{
    console.log(change,"change");
    if(change['userdetails']?.currentValue){
      this.userdetails = change['userdetails']?.currentValue
      this.userData = change['userdetails']?.currentValue
    }
  }
  
  ngOnInit(): void {
    // this.getUserList();
    
  }

  onBackClick(): void {
    this.backButtonClicked.emit();
  }

  // getUserList(): void {
  //   this.loaderService.showcircle();
  //   const payload = this.buildPayload();
  //   this.commonService.getSTList('user', payload)?.subscribe(
  //     (data) => {
  //       this.userData = data.documents || [];
  //       this.userdetails = data.documents || [];
  //       this.updateDataSource();
  //       this.totalLength = data.totalCount || 0;
  //       this.loaderService.hidecircle();
  //     },
  //     () => {
  //       this.loaderService.hidecircle();
  //     }
  //   );
  // }
  // getUserList() {
  //   this.isLoading=true;
  //   let payload = this.commonService.filterList()
  //   this.commonService
  //     .getSTList1('chatInitialization', payload)
  //     ?.subscribe((data) => {
  //       this.isLoading=false;
  //       this.userdetails = data?.userData;
  //       this.userData = data?.userData;
  //       this.badgeData=data?.badgeData;
  //       // this.sortContacts();
  //       // this.setActiveContact (data?.userData[0]);
  //     },()=>{
  //       this.isLoading=false;
  //     });
  // }
  buildPayload(): any {
    const payload = this.commonService.filterList();
    if (payload) {
      payload.size = this.pageSize;
      payload.from = this.from;
      payload.sort = { "desc": ["updatedOn"] };
      payload.query = { userType: 'internal' };
    }
    return payload;
  }

  updateDataSource(): void {
    this.dataSource = new MatTableDataSource(
      this.userData.map((user, index) => ({
        ...user,
        id: index + 1 + this.from,
      }))
    );
    this.dataSource.sort = this.sort1;
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.userData = this.userdetails.filter(
      (user) => user.name.toLowerCase().includes(query)
    );
    this.updateDataSource();
    if (this.userData.length === 0) {
      console.error("No matching internal users found.");
    }
  }

  onCreateGroupClick(): void {
    this.viewStepper = true
  }
  gotoSelectMembersStep() {
    this.viewStepper = false

  }

  onUserSelect(user: any): void {
    if (!this.selectedUsers.find((u) => u.userId === user.userId)) {
      this.selectedUsers.push(user);
      this.userData = this.userData.filter(u => u.userId !== user.userId)
    }
  }

  remove(user: any): void {
    this.selectedUsers = this.selectedUsers.filter((u) => u.userId !== user.userId);
    const index = this.userdetails.indexOf(user)
    this.userData.splice(index, 0, user);
  }

  invokeCreateChannel(): void {

    if (!this.channelName || this.channelName.trim() === '') {
      this.notification.error('Error', 'Channel name is required');
      return;
    }

    if (this.selectedUsers.length === 0) {
      this.notification.error('Error', 'Please select at least one user to create a channel');
      return;
    }
    this.cognito.getUserDatails()?.subscribe((userData) => {
      this.selectedUsers.push({
        userId: userData?.userData.userId,
        addedOn: new Date().toISOString()
      })
    })
    const validSelectedUsers = this.selectedUsers.filter((user) => user?.userId);
    if (validSelectedUsers.length === 0) {
      this.notification.error('Error', 'Selected users have invalid userId');
      return;
    }

    this.loaderService.showcircle();

    const payload = {
      groupchatName: this.channelName.trim(),
      users: validSelectedUsers.map((user) => ({
        userId: user.userId,
        addedOn: new Date().toISOString()
      }))
    };

    this.commonService.createGroup(payload)?.subscribe(
      (response) => {
        this.notification.success('Success', 'Channel created successfully');
        this.resetForm();
        this.backButtonClicked.emit();
      },
      (error) => {
        this.notification.error('Error', 'Failed to create the channel');
        console.error("Channel creation error:", error);
      }
    ).add(() => {
      this.loaderService.hidecircle();
    });
  }
  private resetForm(): void {
    this.channelName = '';
    this.selectedUsers = [];
    this.viewStepper = false;
  }

}

