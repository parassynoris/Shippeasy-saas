import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'
import { io , Socket} from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { CommonFunctions } from '../shared/functions/common.function';
@Injectable()
export class MessagingService {


  private socket!: Socket;
  isconnected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
 

  currentMessage = new BehaviorSubject(null);
  ChatcurrentMessage = new BehaviorSubject(null);
  msgCount = new BehaviorSubject(0);
  msgCountobservation$=this.msgCount.asObservable();
  constructor(private commonFunction : CommonFunctions) {
    

    this.socket = io(environment.socketUrl, {transports:['polling'],extraHeaders: {
      authorization: JSON.parse(this.commonFunction?.get(localStorage.getItem('token'))),
      "x-api-key":environment['x-api-key']
    }});
  }


  getCount(response) {
    this.msgCount.next(response);
  }
  configure(token:any){
    try{
      this.socket = io(environment.socketUrl, {transports:['polling'],extraHeaders: {
        authorization:token,
        "x-api-key":environment['x-api-key']
      }});
      this.isconnected.next(true);
    }catch{

    }
  }
  sendMessage(type:any,msg:any) {

    if(this.socketconnection()){
      this.socket.emit(type, msg);
    }else{
      console.log("Socket not connected")
    }
   
  }
  socketconnection(){
    return this.isconnected;
  }
  // HANDLER example
  
  getMesageNotification() {
    return new Observable(observer => {
      try {
        this.socket?.on('messages', (msg:any) => { 
            observer.next(msg);  
        });
      } catch (error) {
        observer.error(error);
      }
    });

  }
  getuseronlineOfflinestatus() {
    return new Observable(observer => {
      try {
        this.socket?.on('user-status', (msg:any) => { 
            observer.next(msg);  
        });
      } catch (error) {
        observer.error(error);
      }
    });

  }
  getUpdatedBatchData() { 
    return new Observable(observer => {
      try {
        this.socket?.on('data-change', (msg:any) => { 
            observer.next(msg);  
        });
      } catch (error) {
        observer.error(error);
      }
    });

  }
  onNotificationMessage() {
    return new Observable(observer => {
      try {
        this.socket?.on('inAppNotification', (msg:any) => { 
            observer.next(msg);  
        });
      } catch (error) {
        observer.error(error);
      }
    });

  }
  onLogoutMessage() {
    return new Observable(observer => {
      this.socket.on('logout', (msg:any) => {
        observer.next(msg);
      });
    });
  }

}