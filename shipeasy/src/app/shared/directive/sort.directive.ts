import {
  Directive,
  Input,
  ElementRef,
  HostListener,
} from '@angular/core';



@Directive({
  selector: '[appSort]',
})
export class SortDirective {
  @Input() appSort: Array<any>;

  constructor( private targetElement: ElementRef) {
    this.targetElement = targetElement
  }

  @HostListener('click')
  sortData() {
    
    const elem = this.targetElement.nativeElement;
    const order = elem.getAttribute('data-order');
   
    const property = elem.getAttribute('data-name');
    const propertyKeys = elem.getAttribute('data-keys');

    this.appSort.sort((a, b) => {
      let A = a._source[property],
        B = b._source[property];
      if (propertyKeys) {
        JSON.parse(propertyKeys).map((key) => {
          A = A[key];
          B = B[key];
        });
      }
      if (order === 'desc') {
        elem.setAttribute('data-order', 'asc');
        return A?.toString().localeCompare(B?.toString());
      } else {
        elem.setAttribute('data-order', 'desc');
        return B?.toString().localeCompare(A?.toString());
      }
    });
  }
}
