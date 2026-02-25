import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedEventService {
  private chargeSavedSubject = new Subject<void>();

  // Observable that other components can subscribe to
  chargeSaved$ = this.chargeSavedSubject.asObservable();

  // Method to emit the charge save event
  emitChargeSaved() {
    this.chargeSavedSubject.next();
  }
}
