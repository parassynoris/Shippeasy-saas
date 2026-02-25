import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDecimalInput]'
})
export class DecimalInputDirective {

  @Input() appDecimalInput: number = 2;
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow special keys like Backspace, Tab, End, Home, and Arrow keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    // Allow CTRL+C, CTRL+V, CTRL+X, and CTRL+A
    if ((event.ctrlKey || event.metaKey) &&
      (event.key === 'a' || event.key === 'c' || event.key === 'v' || event.key === 'x')) {
      return;
    }

    // Build regex dynamically based on the allowed decimal places
    const decimalPlaces = this.appDecimalInput || 2;
    const regex = new RegExp(`^-?\\d+(\\.\\d{0,${decimalPlaces}})?$`);

    // Prevent default if the input does not match the regex
    const current: string = this.el.nativeElement.value;
    const next: string = current.concat(event.key);

    if (next && !String(next).match(regex)) {
      event.preventDefault();
    }
  }
}
