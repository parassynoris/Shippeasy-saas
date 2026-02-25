import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BehaviorSubjectService {
  private cartUpdateSubscrption = new BehaviorSubject('default message');

  cartUpdate = this.cartUpdateSubscrption.asObservable();


  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable();


  constructor() { }
  cartUpdatState(data: any) {
    this.cartUpdateSubscrption.next(data)
  }
  changeMessage(id: string) {
    this.messageSource.next(id)
  }


}


