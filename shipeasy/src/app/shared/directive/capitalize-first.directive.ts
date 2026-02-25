import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCapitalizeFirst]'
})
export class CapitalizeFirstDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  @HostListener('input', ['$event.target.value'])
  onInput(value: string) {
    if (value) {
      // Transform the entire input to uppercase
      const uppercasedValue = value.toUpperCase();
      this.control.control?.setValue(uppercasedValue, { emitEvent: false });
    }
  }
}
