import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/services/common/common.service';
import { addDays } from 'date-fns';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { ApiService } from '../principal/api.service';
import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { inappnotification } from 'src/app/models/inappnotification';
import * as echarts from 'echarts';
import { DatePipe } from '@angular/common';
type EChartsOption = echarts.EChartsOption;
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';
import * as mapboxgl from 'mapbox-gl';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CognitoService } from 'src/app/services/cognito.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class DashboardComponent implements OnInit, AfterViewInit {
  map!: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 22.339111;
  lng = 70.818217;
  containersData: any[] = [];
  dataSource = new MatTableDataSource<any>();
  filterBody = this.apiService.body
  userName: string = '';
  greet: string = '';
  companyId:any;
  batchDetails: any[] = [];
  invoiceList:any=[];
  sellerInvoiceCount=0;
  buyerInvoiceCount=0;
  smartAgentList: any[] = [];
  smartAgentregistereList:any[]
  smartAgentTrialCount = 0;
  smartAgentregisteredCount = 0;
  smartAgentUnregisteredCount = 0;
  filteredTicketCount = 0;
  smartAgentRequestedCount = 0;
  smartAgentExpiredCount = 0;
  batchDetailsCount=0;
  notificationList: inappnotification[] = [];
  vendorList: any;
  loader = true
  loader1 = true;
  totalCount = 5;
  profileData: any[] = [];
  totalCount1 = 8;
  vendorTotal = 0;
  dateRange: any;
  fromdateValue: any = '';
  todateValue: any = '';
  fromDateValid: any;
  urlParam: any
  currentUrl: any
  todaysDate: string;
  afterDate: string;
  todayDate = new Date();
  pagenation = [5, 10, 20];
  ChartData:any=[]
  // Bar chart options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  shipmentType: string = 'Ocean'; // Default value set to Ocean
  loadType : any = 'FCL';
  loadTypes = [ ]
shipmentTypes = [ ];

  colorScheme = {
    domain: ['#025cac', '#19ad68', '#FA8072', '#FF7F50', '#90EE90', '#025cac']
  };
  _gc = GlobalConstants;
  displayedColumns = [
    '#',
    'jobNo',
    'taskType',
    'taskDescription',
    'createdOn',
    'reminderTime',
    'status',

  ];
  @ViewChild(MatSort) sort1!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  totalData: any = []
  isExport: boolean = true;
  selectTYPE: string;
  currentLogin: any;
  superAdmin:any;
  getCognitoUserDetail: any;
  selectedReminderTypes: string[] = [];
  partymasterList: any[] = [];
  selectedParty: any = null;
  selectedPartyId: string | null = null;
  constructor(
    public commonService: CommonService,
    public _api: ApiService,
    public apiService: ApiSharedService,
    public elementRef: ElementRef,
    public route: ActivatedRoute,
    public commonFunctions: CommonFunctions,
    private datePipe: DatePipe,
    public router: Router,
    public loaderService: LoaderService,
    private modalService: NgbModal,
    public cdRef: ChangeDetectorRef,
    private _cognito : CognitoService,
  ) {
    this.getSystemTypeDropDowns()
    this._cognito.getUserDatails()?.subscribe((resp) => {
      if (resp != null) {
        this.getCognitoUserDetail = resp?.userData 
      }
    })
    this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
    this.currentLogin = this.commonFunctions.getUserType1()
    this.superAdmin =this.commonFunctions.isSuperAdmin()
    if (localStorage.getItem('isImport') === 'true') {
      this.selectTYPE = 'Import'
    }
    else if (localStorage.getItem('isTransport') === 'true') {
      this.selectTYPE = 'Transport'
    }
    else {
      this.selectTYPE = 'Export'
    }

    this.todaysDate = new Date().toISOString()
    this.afterDate = new Date(addDays(new Date(), 7)).toISOString()
    this.route.params?.subscribe(params =>
      this.urlParam = params
    );
    this.userName = localStorage.getItem('userName')
    this.commonService.dashboardKey = ''
    this.commonService.dashboardJobKey = ''
   

  }

  loadTypeListOriginal:any=[]
  getPartyMaster() {
    let payload = this.commonService.filterList();
  
    if (!payload?.query) {
      payload.query = {};
    }
  
    // Add filter for customerType.item_text values
    payload.query = {
      ...payload.query,
      status: true,
      'customerType.item_text': {
        $in: ['Shipper', 'Consignee', 'Booking Party']
      }
    };
  
    this._api.getSTList("partymaster", payload)?.subscribe((res: any) => {
      this.partymasterList = res?.documents;
    });
  }
  onPartyChange(selected: any) {
    console.log('Selected Party:', selected);
    // You can handle the selected party object here
  }
  getSystemTypeDropDowns() {
    let payload = this.commonService.filterList()

    if (payload) payload.query = {
      status: true,
      "typeCategory": {
        "$in": [
          "shipmentType",
          "carrierType"
        ]
      }
    }

    this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
      // this.loadTypes = res?.documents?.filter(x => x.typeCategory === "shipmentType");
      this.loadTypeListOriginal= res?.documents?.filter(x => x.typeCategory === "shipmentType");
      this.shipmentTypes = res?.documents?.filter(x => (x.typeCategory === "carrierType" && (x?.typeName?.toLowerCase() == "ocean" || x?.typeName?.toLowerCase() == "air")));


      if (this.shipmentType?.toLowerCase() == 'air') { 
        this.loadTypes = this.loadTypeListOriginal?.filter((x) => ['Loose', 'ULD Container']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
      } else if (this.shipmentType?.toLowerCase() == 'ocean') { 
        this.loadTypes = this.loadTypeListOriginal?.filter((x) => ['FCL', 'LCL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
      }else if (this.shipmentType?.toLowerCase() == 'land') { 
        this.loadTypes = this.loadTypeListOriginal?.filter((x) => ['PTL', 'FWL','FCL']?.find(t => t.toLowerCase() === x.typeName.toLowerCase()))
      }


    })
  }
  onUserGuide() {
    this.modalService.open(WelcomepageComponent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'sm',
      windowClass: 'model-rights'
    })

  }

  getProfileCompleteness() {
    this.loader = true;
    this.loaderService.showcircle();

    let payload = this.commonService.filterList();
    if (payload?.query) payload.query = {
      userId: this.commonFunctions.getAgentDetails()?.userId
    };

    this.commonService.getSTList1('profileCompletion', payload)
      ?.subscribe(
        (res: any) => {
          this.profileData = res;
          this.loader = false;
          this.loaderService.hidecircle();
        },
        (error) => {
          console.error('Error fetching profile completeness:', error);
          this.loader = false;
          this.loaderService.hidecircle();
        }
      );
  }

  allSectionsCompleted(): boolean {
    return this.profileData.every((section: any) => section.isCompleted);
  }


  navigateToNewTab(element) {
    let url = '/batch/list/add/' + element?.batchId + '/details'

    this.router.navigate([url]);
  }

  reminderList: any = [];
  getRemiders() {
    this.loader = true;
    this.loaderService.showcircle();
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      userId: this.commonFunctions.getAgentDetails()?.userId
    }
    if (this.selectedReminderTypes.length && this.selectedReminderTypes[0] === 'Pending') {
      payload.query = {
        ...payload.query,
        'reminderStatus': 'Pending' 
      };
    }
    this._api
      .getSTList('reminder', payload)
      ?.subscribe((res: any) => {
        this.reminderList = res?.documents;
        this.dataSource = new MatTableDataSource(
          res?.documents?.map((s: any, index) => {
            return {
              ...s,
              id: index + 1
            }
          })
        );
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort1;
        this.loader = false;
        this.loaderService.hidecircle();
      }, () => {
        this.loaderService.hidecircle();
      });
  }

 

  ngOnInit(): void {
    this.getDashboardDataAsPerMilestone();
    this.containerslocation();
    this.getRemiders()
    this.getProfileCompleteness();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop();
    this.setGreet();
    this.getNotification();
    this.getChartData();
    this.getPartyMaster();
    this.getSmartAgentList()
    this.getBatchList();
    this.getInvoice()
    this.getFilteredTicketCount()
    
    setTimeout(() => {
      (document.getElementById('Pending') as HTMLInputElement).checked = true;
      this.selectedReminderTypes = ['Pending'];
      this.getRemiders();
    }, 0);
  }

  ngAfterViewInit(): void {
    (mapboxgl as any).accessToken = '[REMOVED]';
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 3.4,
      center: [78.9629, 20.5937],
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  getDashboardData() {
    this.loader1 = true;
    let payload = this.commonService.filterList()
    if (this.dateRange) {
      const formattedDateString = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd')
      const formattedDateString1 = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd')
      if (payload?.query) payload.query = {
        from: formattedDateString.substring(0, 10) + 'T00:00:00.000Z',
        to: formattedDateString1.substring(0, 10) + 'T23:59:00.000Z'
      }
    }

    if (this.currentLogin === 'transporter') {
      if (payload?.query) payload.query = {
        ...payload.query,
        // isExport : this.isExport,
        shippinglineId : this.getCognitoUserDetail?.driverId,
        flowType: 'Transporter' 
      } 
    } else {
      if (payload?.query) payload.query = {
        ...payload.query,
        // isExport : this.isExport,
        flowType: this.selectTYPE
      } 
    }

    this.commonService.getDashboardReport('dashboardReport', payload)?.subscribe((res: any) => {
      this.loader1 = false;
      this.totalData = res
      this.cdRef.detectChanges();
    })

  }
  containerslocation() {
    let payload = this.commonService.filterList();
  
    // Apply date filter if dateRange exists
    if (this.dateRange) {
      const formattedDateString = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd');
      const formattedDateString1 = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd');
      if (payload?.query) {
        payload.query = {
          from: formattedDateString.substring(0, 10) + 'T00:00:00.000Z',
          to: formattedDateString1.substring(0, 10) + 'T23:59:00.000Z'
        };
      }
    }
  
    // Conditionally add partymasterId if selected
    if (this.selectedPartyId) {
      if (payload?.query) {
        (payload.query as any)['partymasterId'] = this.selectedPartyId;
      }
    } else {
      if (payload?.query && (payload.query as any)['partymasterId']) {
        delete (payload.query as any)['partymasterId'];
      }
    }
    
  
    // Add login-based filters
    if (this.currentLogin === 'transporter') {
      if (payload?.query) {
        payload.query = {
          ...payload.query,
          shippinglineId: this.getCognitoUserDetail?.driverId,
          flowType: 'Transporter'
        };
      }
    } else {
      if (payload?.query) {
        payload.query = {
          ...payload.query,
          flowType: this.selectTYPE?.toLowerCase()
        };
      }
    }
  
    // API Call
    this.commonService.getDashboardReport('locationWiseContainers', payload)?.subscribe(
      (res: any) => {
        this.loader1 = false;
        this.containersData = res;
        console.log('containersData', this.containersData);
  
        // Clear old markers
        this.clearAllMarkers();
  
        // If no data, return early
        if (!this.containersData || !this.containersData.length) {
          console.warn('No container data available');
          return;
        }
  
        // Plot containers on map
        this.containersData.forEach((batch: any) => {
          batch.containers.forEach((container: any) => {
            const firstEvent = container.events.find((event: any) => event.serialno === 1);
            if (firstEvent) {
              const { latitude, longitude, currentlocation } = firstEvent;
  
              const markerElement = document.createElement('div');
              markerElement.className = 'container-marker';
              markerElement.innerHTML = `<strong>${container.containerNumber}</strong>`;
  
              const pin = new mapboxgl.Marker()
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML(generateHistoryPopup(batch.batchNo, container)))
                .addTo(this.map);
  
              const label = new mapboxgl.Marker(markerElement)
                .setLngLat([longitude, latitude])
                .addTo(this.map);
            }
          });
        });
      }
    );
  
    function generateHistoryPopup(batchNo: string, container: any): string {
      const lastEvent = container.events[container.events.length - 1];
      const currentLocation = lastEvent ? lastEvent.currentlocation : "Unknown";
  
      let popupContent = `<div style="max-height: 200px; overflow-y: auto;">`;
      popupContent += `<strong style="color: #007BFF;"> Batch No :- ${batchNo}</strong><br>`;
      popupContent += `<strong style="color: #007BFF;"> Container No :- ${container.containerNumber}</strong><br>`;
      popupContent += `<strong>Current Location:</strong> ${currentLocation}<br><br>`;
  
      container.events.forEach((event: any) => {
        const { currentlocation, timestamptimezone } = event;
  
        let formattedDate = 'N/A';
        if (timestamptimezone) {
          try {
            formattedDate = new Date(timestamptimezone.replace(" ", "T")).toLocaleString();
          } catch (err) {
            console.error('Invalid timestamptimezone:', timestamptimezone, err);
          }
        }
  
        popupContent += `<strong>Location:</strong> ${currentlocation}<br>
                         <strong>Timestamp:</strong> ${formattedDate}<br><br>`;
      });
  
      popupContent += `</div>`;
      return popupContent;
    }
  }
  clearAllMarkers() {
    const elements = document.querySelectorAll('.mapboxgl-marker');
    elements.forEach(el => el.remove());
  }

  getDashboardDataAsPerMilestone() {
    this.loader1 = true;
    let payload = this.commonService.filterList();
  
    if (this.dateRange) {
      const formattedDateString = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd');
      const formattedDateString1 = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd');
      if (payload?.query) payload.query = {
        from: formattedDateString.substring(0, 10) + 'T00:00:00.000Z',
        to: formattedDateString1.substring(0, 10) + 'T23:59:00.000Z'
      };
    }
  
    if (this.currentLogin === 'transporter') {
      if (payload?.query) payload.query = {
        ...payload.query,
        shippinglineId: this.getCognitoUserDetail?.driverId,
        flowType: 'Transporter'
      };
    } else {
      if (payload?.query) payload.query = {
        ...payload.query,
        flowType: this.selectTYPE?.toLowerCase(),
        shipmentType: this.shipmentType , // Adding shipmentType to payload 
      };
      if(this.loadType){
        payload.query = {
          ...payload.query,
          "loadType" : this.loadType
        };
      }
    }
  
    this.commonService.getDashboardReport('milestoneWiseJobs', payload)?.subscribe((res: any) => {
      this.loader1 = false;
      this.totalData = res;
      this.cdRef.detectChanges();
      this.setPieChartData(this.totalData, 'Job Status');
    });
  }
  onShipmentTypeChange(value?: string) { 
    
      this.shipmentType = value;
      this.loadType = '';
    
    this.getDashboardDataAsPerMilestone(); // Refresh dashboard data
    this.getChartData(); // Refresh chart data
  }
  onloadTypeChange(value: string) {
    this.loadType = value;
    this.getDashboardDataAsPerMilestone(); // Refresh dashboard data
    this.getChartData(); // Refresh chart data
  }
  clear() {
    this.dateRange = null
    this.todateValue = '';
    this.fromdateValue = '';
    // this.getDashboardData()
    this.getDashboardDataAsPerMilestone()
    this.fetchCountonselection();
  }

  checkDate() {
    this.getDashboardDataAsPerMilestone()
    // this.getDashboardData()
    // this.fromdateValue = this.formattedDate(this.fromdateValue)
    // this.todateValue = this.formattedDate(this.todateValue)

  }



  setGreet() {
    var myDate = new Date();
    var hrs = myDate.getHours();
    if (hrs < 12)
      this.greet = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17)
      this.greet = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24)
      this.greet = 'Good Evening';
  }

  getNotification() {

    const user = this.commonFunctions.getAgentDetails();
    let payload = this.commonService.filterList()
    if (payload?.query) payload.query = {
      "userId": this.commonFunctions.getAgentDetails().userId,
      read: false
    }
    if (payload?.sort) payload.sort = {
      "desc": ["createdOn"]
    }
    if(payload?.size)payload.size = Number(10000)

    this.notificationList = [];
    this.commonService.getSTList('inappnotification', payload)?.subscribe((res: any) => {
      this.notificationList = res?.documents || []
      this.notificationList = this.notificationList.filter((x: any) => x?.notificationName && x?.description != "no-notification-description")
    });
  }

  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.totalData);

    // Capitalize headers and highlight them
    const headers = Object.keys(this.totalData[0]);
    headers.forEach((header, index) => {
      const cellAddress = XLSX.utils.encode_cell({ c: index, r: 0 });
      worksheet[cellAddress].v = header.toUpperCase(); // Capitalize header

      // Add styling for highlight (background color and bold text)
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "FFFF00" } }, // Highlight with yellow background
        font: { bold: true } // Bold text
      };
    });

    const workbook = { Sheets: { 'Dashboard': worksheet }, SheetNames: ['Dashboard'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'Dashboard');
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${fileName}.xlsx`);
  }
  exportToPDF() {
    const doc = new jsPDF();
    doc.text('Dashboard Report', 14, 16);
    const rows = this.totalData.map(item => [item.name, item.count]);
    (doc as any).autoTable({
      startY: 22,
      head: [['Name', 'Count']],
      body: rows,
    });

    doc.save('Dashboard.pdf');
  }
  onCheckboxChange(event: any, reminderType: string) {
    if (reminderType === 'All' && event.target.checked) {
      (document.getElementById('Pending') as HTMLInputElement).checked = false;
      this.selectedReminderTypes = []; 
    } else if (reminderType === 'Pending' && event.target.checked) {
      (document.getElementById('All') as HTMLInputElement).checked = false;
      this.selectedReminderTypes = ['Pending']; 
    } else {
      this.selectedReminderTypes = []; 
    }
  
    this.getRemiders();
  }
  getChartData() {
    let payload = this.commonService.filterList();
  
    if (payload?.query) {
      payload.query = {
        "flowType": this.selectTYPE === 'Import' ? 'Import' : this.selectTYPE === 'Export' ? 'Export' : 'Transporter',
        "shipmentType": this.shipmentType,  // Adding shipmentType to payload 
      };
    }

    if(this.loadType){
      payload.query = {
        ...payload.query,
        "loadType" : this.loadType
      };
    }
  
    this.commonService.getSTList1('chartDataDashboard', payload)?.subscribe((res: any) => {
      this.ChartData = this.transformResponseToChartData(res?.data);
      this.setLineChartData(this.ChartData, 'Bookings ');
    });
  }
  transformResponseToChartData(apiData: any): any[] {
    const chartData: any[] = [];
    apiData.forEach((dataPoint: any) => {
      chartData.push({
        name: `${dataPoint?.month}`,
        series: [
          { name: 'Inquiry', value: dataPoint?.enquiryCount??0 },
          { name: 'Job', value: dataPoint?.batchCount?? 0}
        ]
      });
    });
    return chartData;
  }


  // import job navigation

  navigateToNewTab1(milestoneId){
    // this.router.navigate([`/batch/list?${milestoneId}`]);
    this.router.navigate(['/batch/list'], { 
      queryParams: { 
        status: milestoneId,
        shipmentType: this.shipmentType,
        loadType: this.loadType,
        isExport: this.isExport,
      } 
    });

  }


  setPieChartData(value: any[], title: string): void {
    const chartDom = document.getElementById('pieChart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option: EChartsOption = {
        tooltip: {
          trigger: 'item'
        },
        series: [
          {
            name: title,
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            padAngle: 5,
            itemStyle: {
              borderRadius: 10,
            },
            labelLine: {
              show: true
            },
            data:value.map((i) => {return {value:i?.jobCount, name:i?.mileStoneName}})
          }
        ]
      };
      myChart.setOption(option);
    }
  }

  setLineChartData(value: any[], title: string): void {
    const chartDom = document.getElementById('lineChart');
    if (chartDom) {
      const myChart = echarts.init(chartDom);
      const option: EChartsOption = {
        xAxis: {
          type: 'category',
          data: value?.map((i) => {return i?.name})
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: value?.map((i) => {return i?.series[1]?.value}),
            type: 'line'
          }
        ]
      };
      myChart.setOption(option);
    }
  }

  getSmartAgentList() {
    let payload = this.commonService.filterList();
    payload.query = {
      "agentStatus": {
        "$in": ['trial', 'registered','Unregistered','expired','requested']
      }
    };
    payload.sort = {
      "desc": ["updatedOn"]
    };
    if(this.dateRange?.length){
      if (this.dateRange) {
        const formattedDateString = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd');
        const formattedDateString1 = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd');
        if (payload?.query) payload.query = {
          ...payload.query,
          'createdOn' : {
            "$gt": formattedDateString.substring(0, 10) + 'T00:00:00.000Z',
            "$lt": formattedDateString1.substring(0, 10) + 'T23:59:00.000Z'
          }
        };
      }
    }
  
    this.commonService.getSTList('agent', payload).subscribe((data) => {
      this.smartAgentList = data.documents;
  
      // Count by status
      this.smartAgentTrialCount = this.smartAgentList.filter(agent => agent.agentStatus === 'trial').length;
      this.smartAgentregisteredCount = this.smartAgentList.filter(agent => agent.agentStatus === 'registered').length;
      this.smartAgentUnregisteredCount = this.smartAgentList.filter(agent => agent.agentStatus === 'Unregistered').length;
      this.smartAgentRequestedCount = this.smartAgentList.filter(agent => agent.agentStatus === 'requested').length;
      this.smartAgentExpiredCount = this.smartAgentList.filter(agent => agent.agentStatus === 'expired').length;
      this.smartAgentregistereList = this.smartAgentList.filter(agent => agent.agentStatus === 'registered')
    });
  }
   getBatchList() {
      let payload = this.commonService.filterList();
      payload.size=1;
      if(this.companyId){
        payload.query['orgId']=this.companyId;
      }
      if(this.dateRange?.length){
        if (this.dateRange) {
          const formattedDateString = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd');
          const formattedDateString1 = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd');
          if (payload?.query) payload.query = {
            ...payload.query,
            'createdOn' : {
              "$gt": formattedDateString.substring(0, 10) + 'T00:00:00.000Z',
              "$lt": formattedDateString1.substring(0, 10) + 'T23:59:00.000Z'
            }
          };
        }
      }
      this.commonService.getSTList('batch', payload)
        ?.subscribe((data: any) => {
          this.batchDetailsCount = data?.totalCount??0;
        });
    }
    getInvoice() {
      let payload = this.commonService.filterList();
      payload["project"]=['type','invoiceId'];
      payload.query = {
        "type": {
          "$in": ['sellerInvoice', 'buyerInvoice']
        }
      }
      if(this.companyId){
        payload.query['orgId']=this.companyId;
      }

      if(this.dateRange?.length){
        if (this.dateRange) {
          const formattedDateString = this.datePipe.transform(this.dateRange[0], 'yyyy-MM-dd');
          const formattedDateString1 = this.datePipe.transform(this.dateRange[1], 'yyyy-MM-dd');
          if (payload?.query) payload.query = {
            ...payload.query,
            'createdOn' : {
              "$gt": formattedDateString.substring(0, 10) + 'T00:00:00.000Z',
              "$lt": formattedDateString1.substring(0, 10) + 'T23:59:00.000Z'
            }
          };
        }
      }
      this.commonService.getSTList('invoice', payload)?.subscribe((result) => {
        this.invoiceList = result?.documents;
        this.sellerInvoiceCount = this.invoiceList.filter(invoice => invoice.type === 'sellerInvoice').length;
        this.buyerInvoiceCount = this.invoiceList.filter(invoice => invoice.type === 'buyerInvoice').length;
      });
    }
  
    fetchCountonselection(){
      this.getInvoice();
      this.getBatchList();
      this.getSmartAgentList()
    }

    getFilteredTicketCount() {
      this.loaderService.showcircle(); // optional: show loader
    
      const payload: any = {
        query: {
          bool: {
            should: [
              { match_phrase: { ticketStatus: 'Open' } },
              { match_phrase: { ticketStatus: 'In Progress' } },
              { match_phrase: { ticketStatus: 'Raised' } }
            ],
            minimum_should_match: 1
          }
        },
        size: 0 // we only need the count, not the actual data
      };
    
      this.commonService.getSTList('ticket', payload)?.subscribe((res: any) => {
        this.filteredTicketCount = res?.totalCount || 0;
        this.loaderService.hidecircle(); // optional: hide loader
      });
    }

}
