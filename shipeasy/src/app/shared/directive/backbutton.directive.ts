import { Location } from '@angular/common';
import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appBackButton]',

})
export class BackbuttonDirective {

  constructor(private element : ElementRef, private _location: Location) { 
    
    element.nativeElement.style.cursor = "pointer"
    element.nativeElement.onclick = () => {
      _location.back()
    }
  }
  
}
