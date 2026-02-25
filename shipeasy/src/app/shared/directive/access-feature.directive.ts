import { Directive, ElementRef, OnInit, Input, SimpleChanges, AfterViewInit, OnChanges } from '@angular/core';
@Directive({
  selector: '[appAccessFeature]'
})
export class AccessFeatureDirective implements AfterViewInit, OnChanges , OnInit{

  @Input() featureCode: any
  @Input() accessType: any
  showLabel: boolean = true
  accesslevels = JSON.parse(sessionStorage.getItem('accesslevel'))

  constructor(private elementRef: ElementRef
  ) {
    this.elementRef = elementRef;
    console.log('Access-->',this.accesslevels);
  }

  ngOnInit() {
    this.featureCode && this.checkAccess(this.accessType)
    console.log('Access-->',JSON.parse(sessionStorage.getItem('accesslevel')));
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

    if (this.accesslevels?.filter(accesslevel => this.featureCode?.some(i => i === accesslevel?.featureCode)).length > 0 && this.accesslevels?.filter(accesslevel => this.featureCode.some(j => j === accesslevel?.featureCode))[0].stage.includes(role)) {
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

