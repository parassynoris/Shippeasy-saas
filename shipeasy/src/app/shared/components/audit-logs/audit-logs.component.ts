import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { CommonFunctions } from '../../functions/common.function';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss']
})
export class AuditLogsComponent implements OnInit {
  dataSource = new MatTableDataSource();
  dataSource1 = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  toalLength: number;
  size = 10;
  page = 1;
  count = 0;

  from: number = 0;
  pageSize: number = 10;
  batchList: any = [];
  fromSize: number = 1;
  pageNumber = 1;
  // pageSize = 20;
  // from = 0;
  totalCount = 0;
  displayedColumns = []
  displayedColumns1 = []
  toggleFilters = true;
  isExport: boolean = false;
  isImport: boolean = false;
  isTransport: boolean = false;
  collectionType: any;
  _gc = GlobalConstants;
  firstPathSegment; any;
  constructor(private route: ActivatedRoute,
    private commonService: CommonService,
    private datePipe: DatePipe, public router: Router,
    public modalService: NgbModal,
    public loaderService: LoaderService,
    private commonfunction: CommonFunctions) {
    // this.queryParams = this.route.snapshot.queryParams;

    // const urlSegments = this.router.url.split('/');
    // this.firstPathSegment = urlSegments[1];

    this.isExport = localStorage.getItem('isExport') === 'true' ? true : false;
    this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
    this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;

    // this.collectionType = this.queryParams?.collection
    // this.collectionNo = this.queryParams?.id
    // this.searchData(this.queryParams?.collection,true) 
    // this.onChangeCollection(this.queryParams?.collection, false)
    this.getHeader(this.queryParams?.collection)


  }
  queryParams: any;
  getHeader(e?) {
    this.displayedColumns = [
      '#',
      'updatedBy',
      // 'createdOn',
      'action',
      'resource',
      'updatedOn',
      'details'
    ]
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);

    if (e == 'batch') {
      this.showText = 'Job'
    } else if (e == 'enquiry') {
      this.showText = 'Enquiry'
    } else if (e == 'container') {
      this.showText = 'Container'
    } else if (e == 'agentadvice') {
      this.showText = 'Agent Advice'
    } else if (e == 'containermaster') {
      this.showText = 'Container Master'
    }


  }
  containerList: any = []
  ngOnInit(): void {
    // this.getAuditLog()
  }
  searchData(e: string, flag?: boolean): void {
    // this.loaderService.showcircle();
    this.allList = [];
    if (!e) return;

    const parameter = this.commonService.filterList();
    parameter.query = { status: true };

    const collectionMap = {
      batch: { project: ["batchNo", "batchId"], idField: "batchId", nameField: "batchNo" },
      enquiry: { project: ["enquiryNo", "enquiryId"], idField: "enquiryId", nameField: "enquiryNo" },
      agentadvice: { project: ["agentadviceNo", "agentadviceId"], idField: "agentadviceId", nameField: "agentadviceNo" },
      container: { project: ["batchNo", "batchId"], idField: "batchId", nameField: "batchNo" },
      containermaster: { project: ["containerNo", "containermasterId"], idField: "containermasterId", nameField: "containerNo" },
    };

    const collectionConfig = collectionMap[this.collectionType];
    if (!collectionConfig) return;

    parameter.project = collectionConfig.project;

    if (flag) {
      parameter.query[collectionConfig.idField] = this.collectionNo;
    } else {
      parameter.query[collectionConfig.nameField] = { "$regex": e, "$options": "i" };
    }

    if (this.collectionType === "batch" || this.collectionType === "container") {
      parameter.query["isExport"] = this.isExport || this.isTransport;
    }

    this.commonService.getSTList(this.collectionType === "batch" || this.collectionType === "container" ? 'batch' : this.collectionType, parameter).subscribe(
      (data: any) => {
        this.allList = (data?.documents || []).map((doc) => ({
          id: doc[collectionConfig.idField],
          name: doc[collectionConfig.nameField]
        })).filter(item => item.id && item.name);

        this.dataSource.sort = this.sort1;
        // this.loaderService.hidecircle();
      },
      () => {
        // this.loaderService.hidecircle();
      }
    );
  }

  allList: any = []
  showText: any = ''
  onChangeCollection(e, flag) {
    this.collectionType = e;
    this.queryParams = {
      ...this.queryParams,
      collection: e,
    }
    this.allList = [];
    if (flag) {
      this.collectionNo = null
    }
    this.dataSource = new MatTableDataSource([]);
    this.getHeader(this.collectionType)
  }
  collectionNo: any;
  onChangeID(e) {
    if (e && this.collectionType) {
      this.queryParams = {
        ...this.queryParams,
        id: e,
      }
      // this.router.navigate([], {
      //   queryParams: {
      //     id: e,
      //     collection: this.collectionType,
      //   },
      //   queryParamsHandling: 'merge',
      //   replaceUrl: true,
      // });
      // this.getHeader(this.collectionType)
      // this.getAuditLog()
      if (this.collectionType === "container") {
        this.getContainerList()
      }

    }
  }
  getContainerList() {
    let payload = this.commonService.filterList()
    payload.query = {
      // $or: [{ "batchId": this.collectionNo }, { "batchwiseGrouping.batchId": this.collectionNo }]
      $or: [{
        "batchId": {
          "$in": [this.collectionNo]
        }
      }, {
        "batchwiseGrouping.batchId": {
          "$in": [this.collectionNo]
        }
      }]
    }
    payload.size = Number(this.size),
      payload.from = this.page - 1,

      this.commonService
        .getSTList('container', payload)
        ?.subscribe((data: any) => {
          
          this.containerList = data?.documents || []
        })
  }
  readonly nzFilterOption = (): boolean => true;
  submitted: boolean = false
  auditLogsList = []
  dateRange: any;
  containers: any;
  getAuditLog() {
    this.submitted = true;
    if (this.collectionType === "container") {
      if (!(this.queryParams?.id && this.queryParams?.collection && this.containers)) {
        return
      }
    } else {
      if (!(this.queryParams?.id && this.queryParams?.collection)) {
        return
      }
    }

    this.submitted = false;
    // this.loaderService.showcircle();
    var parameter = this.commonService.filterList()
    parameter.query = {
      resourceId: this.collectionType === "container" ? this.containers : this.queryParams?.id,
      resource: this.queryParams?.collection,
    }



    if (this.dateRange?.length == 2) {
      let StartDate = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd')

      parameter.query = {
        ...parameter.query,
        'updatedOn': {
          "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
          "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
        }
      }
    }

   
    this.commonService.getSTList('logaudit', parameter)
      .subscribe((data: any) => {
       
        this.auditLogsList = data?.documents.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        }) || []
        this.dataSource = new MatTableDataSource(data?.documents?.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        }));

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;

        this.dataSource.sort = this.sort1;
        console.log(this.dataSource,'this.dataSource')
        this.loaderService.hidecircle();
      }, () => {
        this.loaderService.hidecircle();
      });
  }

  export() {
    const modifiedTableData = this.dataSource?.filteredData;
    const tableColumns = this.displayedColumns;
    const tableData = modifiedTableData || [];
    const columnsToHide = ['status', 'action'];
    const actualColumns = this.displayedColumns;
    this.commonfunction.exportToExcel(
      tableColumns,
      tableData,
      columnsToHide,
      'Job',
      this.displayedColumns,
      actualColumns
    );
  }
  exportList() {
    var parameter = this.commonService.filterList()
    parameter.query = {
      resourceId: this.collectionType === "container" ? this.containers : this.queryParams?.id,
      resource: this.queryParams?.collection,
    }



    if (this.dateRange?.length == 2) {
      let StartDate = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd')

      parameter.query = {
        ...parameter.query,
        'updatedOn': {
          "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
          "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
        }
      }
    }
    this.commonService.getSTList('logaudit', parameter).subscribe(
      (data: any) => {
        const modifiedTableData = data?.documents.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        });
        if (modifiedTableData) {
          const tableColumns = this.displayedColumns;
          const tableData = modifiedTableData || [];
          const columnsToHide = ['status', 'action'];
          const actualColumns = this.displayedColumns;

          // Call export function after data is fetched
          this.commonfunction.exportToExcel(
            tableColumns,
            tableData,
            columnsToHide,
            'Job',
            this.displayedColumns,
            actualColumns
          );
        } else {
          console.error("No data received for export.");
        }
      },
      (error) => {
        console.error("Error fetching data from API", error);
      }
    );
  }
  filtersModel = [];
  filterKeys = {};
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getAuditLog();
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim();
    this.filterKeys = {};
    let shouldArray = []
    this.displayedColumns.forEach((each, ind) => {
      if (each == 'action' || each == 'resource') {
        shouldArray.push({ [each]: { "$regex": filterValue?.toLowerCase(), "$options": "i" } },)
      } else {
        if (each !== '#' || each !== 'details') {
          shouldArray.push({
            [`updatedData.${each}`]: {
              "$regex": filterValue?.toLowerCase(),
              "$options": "i"
            }
          });
        }
      }

    });

    var parameter = this.commonService.filterList()
    parameter.query = {
      resourceId: this.collectionType === "container" ? this.containers : this.queryParams?.id,
      resource: this.queryParams?.collection,
      "$or": shouldArray
    }





    if (this.dateRange?.length == 2) {
      let StartDate = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd')

      parameter.query = {
        ...parameter.query,
        'updatedOn': {
          "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
          "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
        }
      }
    }

    if (!filterValue) {
      this.pageNumber = 1;
      this.pageSize = 10;
      this.from = 0;
      this.totalCount = 0;
      this.getAuditLog();
      return;
    }
    this.commonService.getSTList('logaudit', parameter)
      .subscribe((data: any) => {
        this.auditLogsList = data?.documents.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        }) || []
        this.dataSource = new MatTableDataSource(
          data.documents?.map((s: any, index) => {
            return {
              ...s,
              ...s.updatedData
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
      });
  }



  onPageChange(event) {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.from = event.pageIndex * event.pageSize;
    this.getAuditLog();
  }


  getAuditLogClear() {
    this.containers = null
    this.collectionType = null
    this.collectionNo = null
    this.dataSource = new MatTableDataSource([]);
  }

  searchColumns4() {
    this.filterKeys = {};
    this.filtersModel.forEach((each, ind) => {
      if (each)
        this.displayedColumns[ind] !== 'status' ?
          this.filterKeys[this.displayedColumns[ind]] = {
            "$regex": each.toLowerCase(),
            "$options": "i"
          } : this.filterKeys[this.displayedColumns[ind]] = {
            "$eq": (each.toLowerCase() === 'active' ? true : false),
          }
    });
    let payload = this.commonService.filterList()
    payload.query = {
      ...this.filterKeys, resourceId: this.collectionType === "container" ? this.containers : this.queryParams?.id,
      resource: this.queryParams?.collection,
    }




    if (this.dateRange?.length == 2) {
      let StartDate = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd')
      let EndDate = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd')

      payload.query = {
        ...payload.query,
        'updatedOn': {
          "$gt": StartDate.substring(0, 10) + 'T00:00:00.000Z',
          "$lt": EndDate.substring(0, 10) + 'T23:59:00.000Z'
        }
      }
    }
    payload.sort = {
      "desc": ["updatedOn"]
    }
    this.commonService.getSTList('logaudit', payload)
      .subscribe((data: any) => {
        this.batchList = data.documents;
        this.toalLength = data.totalCount;
        this.count = data.documents.length;
        this.auditLogsList = data?.documents.map((s: any, index) => {
          return {
            ...s,
            ...s.updatedData
          }
        }) || []
        this.dataSource = new MatTableDataSource(
          data?.documents?.map((s: any, index) => {
            return {
              ...s,
              ...s.updatedData
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;

      });


  }
  back() {
    this.router.navigate([this.queryParams.url || '/dashboard/list']);
  }
  displayedColumns2 = []
  displayedColumns3 = []
 
  showDetails(content, array1, i) {



    this.displayedColumns2 = [
      '#',
      'keyName',
      'previousValue',
      'newValue',
      'updatedBy',
      'updatedOn',
    ]
    this.displayedColumns3 = this.displayedColumns2.map((x, i) => x + '_' + i);

    const Table2 = this.compareObjects(this.auditLogsList[i + 1] || {}, array1 || {}, array1?.updatedBy, array1?.updatedOn)

   
 

    this.dataSource1 = new MatTableDataSource(
      Table2?.map((s: any, index) => {
        return {
          ...s
        }
      })
    );

    // this.dataSource1.paginator = this.paginator;
    this.dataSource1.sort = this.sort1;
  console.log(this.dataSource1,'this.dataSource1')
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    });
  }



 compareObjects(obj1, obj2, updatedBy, updatedOn, parentKey = '', result = []) {
    // Utility function to format dates
    function formatDate(date) {
        if (!(date instanceof Date)) date = new Date(date);
        const options :any = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };
        return new Intl.DateTimeFormat('en-GB', options).format(date).replace(',', '');
    }

    if (Object.keys(obj1).length === 0) {
        for (const key in obj2) {
            if (key !== 'updatedData') {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;

                if (typeof obj2[key] === 'object' && obj2[key] !== null && !Array.isArray(obj2[key])) {
                    this.compareObjects({}, obj2[key], updatedBy, updatedOn, fullKey, result);
                } else if (Array.isArray(obj2[key])) {
                    obj2[key].forEach((item, index) => {
                        if (typeof item === 'object' && item !== null) {
                          this.compareObjects({}, item, updatedBy, updatedOn, `${fullKey}[${index}]`, result);
                        } else {
                            result.push({
                                keyName: `${fullKey}[${index}]`,
                                previousValue: undefined,
                                newValue: item,
                                updatedBy,
                                updatedOn
                            });
                        }
                    });
                } else {
                    result.push({
                        keyName: fullKey,
                        previousValue: undefined,
                        newValue: obj2[key],
                        updatedBy,
                        updatedOn
                    });
                }
            }
        }
        return result;
    }

    for (const key in obj1) {
        if (key === 'updatedData') continue;

        const fullKey = parentKey ? `${parentKey}.${key}` : key;

        if (!(key in obj2)) {
            result.push({
                keyName: fullKey,
                previousValue: obj1[key],
                newValue: undefined,
                updatedBy,
                updatedOn
            });
        } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
          this.compareObjects(obj1[key], obj2[key], updatedBy, updatedOn, fullKey, result);
        } else if (Array.isArray(obj1[key])) {
            obj1[key].forEach((item, index) => {
                if (typeof item === 'object' && item !== null) {
                  this.compareObjects(
                        item,
                        obj2[key] && obj2[key][index] ? obj2[key][index] : {},
                        updatedBy,
                        updatedOn,
                        `${fullKey}[${index}]`,
                        result
                    );
                } else {
                    if (!obj2[key] || obj2[key][index] !== item) {
                        result.push({
                            keyName: `${fullKey}[${index}]`,
                            previousValue: item,
                            newValue: obj2[key] ? obj2[key][index] : undefined,
                            updatedBy,
                            updatedOn
                        });
                    }
                }
            });

            if (obj2[key] && obj2[key].length > obj1[key].length) {
                obj2[key].slice(obj1[key].length).forEach((item, index) => {
                    const adjustedIndex = obj1[key].length + index;
                    if (typeof item === 'object' && item !== null) {
                      this.compareObjects(
                            {},
                            item,
                            updatedBy,
                            updatedOn,
                            `${fullKey}[${adjustedIndex}]`,
                            result
                        );
                    } else {
                        result.push({
                            keyName: `${fullKey}[${adjustedIndex}]`,
                            previousValue: undefined,
                            newValue: item,
                            updatedBy,
                            updatedOn
                        });
                    }
                });
            }
        } else if (obj1[key] !== obj2[key]) {
            const previousValue = obj1[key] instanceof Date || !isNaN(Date.parse(obj1[key]))
                ? formatDate(obj1[key])
                : obj1[key];

            const newValue = obj2[key] instanceof Date || !isNaN(Date.parse(obj2[key]))
                ? formatDate(obj2[key])
                : obj2[key];

            result.push({
                keyName: fullKey,
                previousValue,
                newValue,
                updatedBy,
                updatedOn
            });
        }
    }

    for (const key in obj2) {
        if (!(key in obj1) && key !== 'updatedData') {
            const fullKey = parentKey ? `${parentKey}.${key}` : key;

            if (Array.isArray(obj2[key])) {
                obj2[key].forEach((item, index) => {
                    if (typeof item === 'object' && item !== null) {
                      this. compareObjects({}, item, updatedBy, updatedOn, `${fullKey}[${index}]`, result);
                    } else {
                        result.push({
                            keyName: `${fullKey}[${index}]`,
                            previousValue: undefined,
                            newValue: item,
                            updatedBy,
                            updatedOn
                        });
                    }
                });
            } else {
                result.push({
                    keyName: fullKey,
                    previousValue: undefined,
                    newValue: obj2[key],
                    updatedBy,
                    updatedOn
                });
            }
        }
    }

    return result;
}





  cancel() {
    this.modalService.dismissAll()
  }

  applyFilter1(filterValue: string) {
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }
}


@Pipe({
  name: 'prettyLabel'
})
export class PrettyLabelPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';

    // Remove any prefix like "routeDetails."
    const cleaned = value.split('.').pop() || value;

    // Replace underscores with space
    let formatted = cleaned.replace(/_/g, ' ');

    // Add space before capital letters (for camelCase)
    formatted = formatted.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize each word
    formatted = formatted.replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Append ">>>"
    return `${formatted}`;
  }
}