import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { shared } from 'src/app/shared/data';
import { ApiService } from '../../principal/api.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Invoice } from 'src/app/models/invoice';
import { CargoData } from 'src/app/models/new-invoice';
import { EnquiryItem } from 'src/app/models/enquiry';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';
import * as echarts from 'echarts';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
@Component({
  selector: 'app-pnl-finance',
  templateUrl: './pnl.component.html',
  styleUrls: ['./pnl.component.scss']
})
export class PLComponent implements OnInit {
  @Input() isTypePage: any = 'pnl'
  batchData: CargoData[] = [];
  selectedJob;
  pnlData = shared.pnlRow;
  costitemData: any;
  invoiceData: any = [];
  paymentData: any = [];
  totalPaymentAmount = 0;
  totalAmtInr = 0;
  totalCustomerInvoice = 0;
  vendorBills = 0;
  pnLRemarks = '';
  selectedBatch: any = [];
  creditList = []
  filterBody = this.apiService?.body
  chargeData: EnquiryItem[] = [];
  chargeTotalAmt: number = 0;

  vendorTotalAmt: number = 0;
  ReceiptAmount: number = 0;
  batchStatus: boolean = true;
  closeBtn: boolean = true;
  batchForm: any;
  isExport: boolean = false;
  invoiceVendorData: any;
  vendorTotal: number;
  holdBatchClose: boolean = false;
  templateDropdownSettings: IDropdownSettings = {
    singleSelection: false,
    defaultOpen: false,
    idField: 'quotationId',
    textField: 'batchNo',
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableCheckAll: false,
    itemsShowLimit: 3,
    allowSearchFilter: true,
    limitSelection: -1,
  };
  estimationArray: any[] = [];

  EndDate;
  StartDate;
  currentAgent: any;
  isImport: boolean;
  isTransport: boolean;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private commonService: CommonService,
    private datePipe: DatePipe,
    private notification: NzNotificationService,
    private commonfunction : CommonFunctions

  ) {
    this.isExport   = localStorage.getItem('isExport') === 'true' ? true : false;
      this.isImport = localStorage.getItem('isImport') === 'true' ? true : false;
      this.isTransport = localStorage.getItem('isTransport') === 'true' ? true : false;
  }
  initChart(data?) {
    var chartDom = document.getElementById('main')!;
    var myChart = echarts.init(chartDom);

    var option = {
      title: {
        text: 'Net Profit & Loss',
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        bottom: 10
      },
      series: [
        {
          // name: 'Access From',
          type: 'pie',
          radius: ['0%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data || [
            { value: 0.00, name: 'Prov. Income' },
            { value: 0.00, name: 'Prov. Expense' }, 
            { value: 0.00, name: 'Prov. Margin' }, 
          ],
          itemStyle: {
            color: function(params: any) {
              const colors = {
                'Prov. Income': '#5470C6',
                'Prov. Expense': '#EE6666',
                'Prov. Margin': '#91CC75', 
              };
              return colors[params.name] || '#000';
            }
          }
         
        }
      ]
    };

    option && myChart.setOption(option);
  }
  ngOnInit(): void {
    this.currentAgent = this.commonfunction.getActiveAgent()
    this.initChart();
  }
  onClose() {
    this.router.navigate(['/' + this.isTypePage + '/list']);
  }

  dateRange: any;
  getBatchList(event) { 
    if(!event){
      this.quotarlyDate = null
      this.StartDate = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd')
      this.EndDate = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd')
    }
 

    let payload = this.commonService.filterList()
    payload.query = {
      
      "isExport": (this.isExport || this.isTransport),
      'createdOn': {
        "$gt": this.StartDate.substring(0, 10) + 'T00:00:00.000Z',
        "$lt": this.EndDate.substring(0, 10) + 'T23:59:00.000Z'
      }
    }
    payload.sort = {
      "desc": ["updatedOn"]
    },
      this.commonService.getSTList('batch', payload).subscribe((data) => {
        this.batchData = data.documents;
        this.batchForm = ''
        this.getInvoices();
      });
  }
 


  invoiceTotal: number = 0;
  invoiceTaxTotal: number = 0;
  buyTotal: number = 0 
  sellTotal: number = 0
  billAmount: number = 0

  getInvoices(id?) {
    let batchId = [];
    if (this.batchForm) {
      batchId = [id]
    } else {
      this.batchData.filter((x)=>{
        batchId.push(x.batchId)
      })
     
    } 
    let payload = this.commonService.filterList()
    payload.query = {
      // "type": "sellerInvoice",
      // "batchId": {
      //   "$in": batchId
      // },
      // "paymentStatus": {
      //   "$in": [
      //     "Paid" ,'Partially Paid'
      //   ]
      // },
      "$and": [
        {
          "principleBill": {
            "$ne": true
          }
        }
      ]
    } 
    // if(id){
      payload.query = {...payload.query,
        "batchId": {
        "$in": batchId
       }
      // }
    }
    this.commonService.getSTList('invoice', payload).subscribe((data) => {
      this.invoiceData = data.documents;

      this.invoiceTotal =0 
      this.invoiceTaxTotal= 0
      this.buyTotal = 0 
      this.sellTotal = 0
      this.billAmount = 0
      this.invoiceData.filter((x) => {
        this.invoiceTaxTotal += Number(x?.invoiceTaxAmount || 0)
        this.invoiceTotal += Number(x?.invoiceAmount || 0) 
        // x.costItems.filter(x=>{
        //   this.buyTotal += Number(x?.buyEstimates?.totalAmount || 0)
        //   this.sellTotal  += Number(x?.selEstimates?.totalAmount || 0)
        // })
        // x.selEstimates = x.costItems.reduce((acc, x) => acc + x?.selEstimates?.totalAmount, 0);
        // x.buyEstimates = x.costItems.reduce((acc, x) => acc + x?.buyEstimates?.totalAmount, 0); 

        if(x.type == 'buyerInvoice'){
          this.buyTotal += Number(x?.invoiceAmount || 0)
        }else{
          this.sellTotal  += Number(x?.invoiceAmount || 0)
        }
        
           
      })
            
      this.billAmount = this.sellTotal - this.buyTotal

       let chartData = [
            { value: this.sellTotal.toFixed(2), name: 'Prov. Income' },
            { value: this.buyTotal.toFixed(2), name: 'Prov. Expense' }, 
            { value: this.billAmount.toFixed(2) , name: 'Prov. Margin' }, 
          ]
   
          this.initChart(chartData);
    });
  }



 
  closeBatch() {
    let batchData = this.batchData.filter((x) => x?.batchId == this.batchForm)[0];

    this.commonService.UpdateToST(`batch/${this.batchForm}`, {
      ...batchData, status: false,
      statusOfBatch: 'Job Closed'
    })?.subscribe((res: any) => {
      if (res) {
        this.notification.create(
          'success',
          'Job Close Successfully',
          ''
        );
        window.location.reload()
      }
    }, error => {
      this.notification.create(
        'error',
        error?.error?.error?.message,
        ''
      );
    });


  }


  downloadCSV() {
    const csvData = this.convertTableToCSV();
    this.downloadFile(csvData, 'profit-and-loss.csv');
  }

  convertTableToCSV(): string {
    const rows = Array.from(document.querySelectorAll('table tr'));
    return rows.map(row => {
      const cells = Array.from(row.querySelectorAll('th, td'));
     return cells.map(cell => cell.textContent.replace(/,/g, "")?.trim()).join(',');
    }).join('\n');
  }

  downloadFile(data: string, filename: string) { 
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  quotarlyDate:any;
  onDateRangeChange(value) { 
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date = currentDate;

    switch(value ) {
      case 'current_month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
      case 'last_3_months':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
        break;
      case 'last_6_months':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1);
        break;
      case 'last_year':
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
        break;
      default:
        startDate = new Date();
    }
    this.dateRange = null
    this.StartDate = this.datePipe.transform(startDate, 'yyyy-MM-dd')
    this.EndDate = this.datePipe.transform(endDate, 'yyyy-MM-dd') 
    this.getBatchList(true)
  }

}
