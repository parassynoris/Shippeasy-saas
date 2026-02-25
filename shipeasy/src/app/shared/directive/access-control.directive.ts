import { Directive, ElementRef, OnInit, Input, SimpleChanges, AfterViewInit, OnChanges, HostListener } from '@angular/core';
import { CognitoService } from 'src/app/services/cognito.service';

@Directive({
  selector: '[appAccessControl]',
  exportAs: 'appHideMe'
})
export class AccessControlDirective implements OnInit , AfterViewInit , OnChanges{

  @Input() featureCode: any
  @Input() accessType: any
  showLabel: boolean = true
  accesslevels:any

  constructor(private elementRef: ElementRef,
    private cognito:CognitoService
  ) {
    this.cognito = cognito
    this.elementRef = elementRef
    this.cognito?.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
       this.accesslevels = resp.accesslevel
       
      }
    })
  }

  ngOnInit() {
    this.featureCode && this.checkAccess(this.accessType)
  }
  ngOnChanges(changes: SimpleChanges){
    if(changes['featureCode']){
      this.featureCode && this.checkAccess(this.accessType)
    }
  }

  ngAfterViewInit() {
    this.showLabel = false;
    this.featureCode && this.checkAccess(this.accessType)

  }

  checkAccess(role: any) {
    this.elementRef.nativeElement.style.display = 'block'
 
    if (typeof (this.featureCode) === 'string') {
      this.featureCode = this.featureCode.replace(/'/g, '"')
      this.featureCode = JSON.parse(this.featureCode);
    }

    if (this.accesslevels?.filter(accesslevel => this.featureCode?.some(i => i === accesslevel?.featureCode)).length > 0 && this.accesslevels?.filter(accesslevel => this.featureCode.some(j => j === accesslevel?.featureCode))[0].accesslevel.includes(role)) {
      this.showLabel = true
      this.elementRef.nativeElement.style.display = 'block'
    }
    else {
      this.showLabel = false
      this.elementRef.nativeElement.style.display = 'none'
    }
    return this.showLabel
  }

}


@Directive({
  selector: '[appAutoUpperCase]'
})
export class AutoUpperCaseDirective {

  @HostListener('input', ['$event']) onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    inputElement.value = inputElement.value.toUpperCase();
  }
}