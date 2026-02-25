import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'table-filters',
  templateUrl: './table-filters.component.html',
  styleUrls: ['./table-filters.component.scss']
})
export class TableFiltersComponent implements OnInit {
  // regex = REGEX
  patternMatched = true
  displayFilterIcon: boolean = true;
  displayShowHideIcon: boolean = true;
  displayExportIcon: boolean = true;
  displaySearchBox: boolean = true;
  displayMappedExportIcon:boolean=false;
  @Output() openFiltersDrawer = new EventEmitter<any>();
  @Output() openShowHideDrawer = new EventEmitter<any>();
  @Output() onClickExport = new EventEmitter<any>();
  @Output() filterInput = new EventEmitter<any>();
  @Output() clickMappedExport=new EventEmitter<any>();
  @Input() TDP:any // table drawer filter [true,false,true,false]
  @Input() featurecode: any //feature code
  @Input() regularExpression:any
  @Input() regularExpressionHintMsg: any

  @Input() KeyUpSearch:any

  constructor() {
  }
  ngOnInit(): void {

    if (this.TDP) {
      this.displayFilterIcon = this.TDP[0]
      this.displayShowHideIcon = this.TDP[1]
      this.displayExportIcon = this.TDP[2]
      this.displaySearchBox = this.TDP[3]
      this.displayMappedExportIcon=this.TDP[4]
    }
  }
  openFilters() {
    this.openFiltersDrawer.emit(true);
  }
  openShowHide() {
    this.openShowHideDrawer.emit(true)
  }
  export() {
    this.onClickExport.emit(true);
  }
  mappedExport(){
    this.clickMappedExport.emit(true);
  }
  onFilterInputTextChange(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.regularExpression) {
      const re = new RegExp(this.regularExpression);

      if (re.test(filterValue)) {
        this.patternMatched = true
      } else {
        this.patternMatched = false
        return
      }
    }
    this.filterInput.emit(filterValue)
    
  }
}
