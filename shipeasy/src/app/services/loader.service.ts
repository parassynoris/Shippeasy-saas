import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor() {
    // do nothing.
  }
  isLoading:boolean = false;
  isLoadingcircle:boolean = false;
  show() {
    this.isLoading = true;
  }
  hide() {
      this.isLoading = false;
  }
  showcircle(){
    this.isLoadingcircle = true;
  }
  hidecircle(){
    this.isLoadingcircle = false;
  }
  getloading(){
    return this.isLoading;
  }
  getloadingcircle(){
    return this.isLoadingcircle;
  }
}
