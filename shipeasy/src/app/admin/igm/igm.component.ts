import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProfilesService } from 'src/app/services/Profiles/profile.service';
import { TransactionService } from 'src/app/services/transaction/transaction.service';
import { environment } from 'src/environments/environment';
import * as XLSX from "xlsx";
import { ApiService } from '../principal/api.service';
import { ApiSharedService } from 'src/app/shared/components/api-service/api-shared.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CommonFunctions } from 'src/app/shared/functions/common.function';
import { AddIgmComponent } from './add-igm/add-igm.component';
import { CommonService } from 'src/app/services/common/common.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDrawer } from '@angular/material/sidenav';
import { IgmDetails } from 'src/app/models/igm';
import { PortDetails } from 'src/app/models/yard-cfs-master';
import { Vessel } from 'src/app/models/vessel-master';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LoaderService } from 'src/app/services/loader.service';
import { GlobalConstants } from 'src/app/services/common/constants/GlobalConstants';
@Component({
  selector: 'app-igm',
  templateUrl: './igm.component.html',
  styleUrls: ['./igm.component.scss']
})
export class IgmComponent {
  @ViewChild(MatDrawer) drawer: MatDrawer | any;
  dataSource = new MatTableDataSource();
  pagenation = [20, 50, 100];
  @ViewChild(MatSort) sort1: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns =[
    '#',
    'igm_no',
    'custom_agent_code', 
    'portName',
    'vesselName',
    'voyage',
    'status',
  ];
  toggleFilters = true;
  filtersModel = [];
  filterKeys = {};
  displayedColumns1=[];
  isTypeForm = 'Add'
  costItemData='';
  Show = false;
  isShow: any;
  closeResult:any;
  holdControl = ''
  isHoldType: any = 'add';
  filterBody = this.apiService.body;
  portListData:PortDetails[] = [];
  igmForm : FormGroup;
  igmList:IgmDetails[] = [];
  vesselList:Vessel[];
  toalLength: any;
  size = 10;
  page = 1;
  count = 0;
  fromSize: number = 1;
  _gc=GlobalConstants
  getUser: any;
  currentUrl: string;
  urlParam: any;
  constructor(
    public router:Router,public transactionService: TransactionService,public notification: NzNotificationService,
    private profilesService: ProfilesService, private api: ApiService,
    private formBuilder: FormBuilder,
    public apiService: ApiSharedService, public modalService:NgbModal,public commonService: CommonService,public commonFunctions:CommonFunctions,private route: ActivatedRoute,public loaderService: LoaderService,
  ) {
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
    this.getIgmData();
    this.currentUrl = window.location.href.split('?')[0].split('/').pop()
    this.route.params?.subscribe(params =>
      this.urlParam = params
    );
   }


  getPortData() {
    var agentId = this.commonFunctions.getAgentDetails()?.orgId

    // this.filterBody = this.apiService.body
    let payload = this.commonService.filterList()
    payload.query = {
    }

    let must = [];
    this.filterBody.query.bool.must = must;
    this.commonService.getSTList('port', payload).subscribe((res: any) => {
      this.portListData = res?.documents
      this.getVesselList()
    })
  }

  next() {
    if (this.toalLength > this.count) {
      this.getPaginationData('next');
    }
  }

  prev() {
    if (this.page > 0) {
      this.getPaginationData('prev');
    }
  }

  filter(e) {
    this.size = e.target.value;
    this.fromSize = 1;
    this.getIgmData();
  }

  getPaginationData(type: any) {

    this.fromSize =
      type === 'prev' ? this.fromSize - Number(this.size) : this.count + 1;
    var parameter = {
      size: Number(this.size),
      from: this.fromSize - 1,
      query: {
        bool: {
          must: [ {
            "match": {
              "status": true
            }
          },],
          filter: [],
          should: [],
          must_not: [],
        },
      },
    };
    this.transactionService.getIgm(parameter).subscribe((data) => {
      this.igmList = data.hits.hits;
      this.toalLength = data.hits.total.value;
      this.page = type === 'prev' ? this.page - 1 : this.page + 1;
      this.count =
        type === 'prev'
          ? this.toalLength === this.count
            ? this.count - (this.toalLength % Number(this.size))
            : this.count - data.hits.hits.length
          : this.count + data.hits.hits.length;
      this.getPortData()


    },error => {
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    })
  }

  getVesselList() {
    // this.filterBody = this.apiService.body;
    let payload = this.commonService.filterList()
    payload.query = {
    }
    let must = [];
    this.filterBody.query.bool.must = must;
    this.commonService.getSTList('vessel', payload)
      .subscribe((res: any) => {

        this.vesselList = res.documents;

      this.igmList.forEach(el=>{

        if(this.portListData && this.vesselList){
          el.vesselName = this.vesselList.filter(e=>e?.vesselId == el?.vessel)[0]?.vesselName
         el.portName = this.portListData.filter(e=>e?.portId == el?.port)[0]?.portDetails?.portName

        }
      })
      });
  }

  getIgmData(){
    this.loaderService.showcircle();
    // this.filterBody = this.apiService.body;?
    let payload = this.commonService.filterList()
    if(payload?.query)payload.query = {
    }
    this.commonService.getSTList('igm',payload)?.subscribe((res) => {
      this.igmList = res?.documents;
      this.getPortData()
      this.dataSource = new MatTableDataSource(
        res?.documents?.map((s: any,index) => {
          return{
            ...s,
            id:index+1
          }
        })
      );
      
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort1;
      this.loaderService.hidecircle();

    },error => {
      this.loaderService.hidecircle();
      this.notification.create(
        'error',
       error?.error?.error?.message,
        ''
      );
    })
  }

  onShowPermission(id) {
    this.isShow = id;
  }


  ngOnInit(): void {

     this.igmForm =  this.formBuilder.group({
      vessel: ['',Validators.required],
      voyage: ['',Validators.required],
      igm_no: [''],
      igmDate: ['',Validators.required],
      pol: ['',Validators.required]
    });
  }
  onOpen(type) {

    this.isHoldType = type;

  }

  openfileinput(id){
    let element  = document.getElementById(id);
    element.click();
  }

  async onFileSelected(ev){
    var extension = ev.target.files[0].name.substr(
      ev.target.files[0].name.lastIndexOf('.')
    );
    const filename = ev.target.files[0].name + extension
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const formData = new FormData();
    const file = ev.target.files[0];
    formData.append('file', ev.value.document, `${ev.value.document.name}`);
    formData.append('name', `${ev.value.document.name}`);
    var fileSaved = await this.commonService.uploadDocuments('igm',formData).subscribe();
    if (fileSaved) {
      let doc = {
        documentURL:`${ev.target.files[0].name}`,
        documentName:filename,
      }
    }
    reader.onload = (event) => {
      const data  =  event.target.result.toString().replace('\r','').split('\n');
      const header = data[0].split('\x1D');
      let dataFromFile  = {
        header:{
          senderId:header[2],
          receiverId:header[4],
          versionInfo:header[5],
          tOrP:header[6],
          messageId:header[8],
          sequenceControlNumber:header[9],
          date:header[10],
          time:header[11]
        }
      }
      const vesInfo = data[3].split('\x1D');
      dataFromFile['vesinfo'] = {
        messagetype:vesInfo[0].replace('\r',''),
        customHouseCode:vesInfo[1].replace('\r',''),
        igmNo:vesInfo[2].replace('\r',''),
        igmdate:vesInfo[3].replace('\r',''),
        imoCode:vesInfo[4].replace('\r',''),
        vesselCode:vesInfo[5].replace('\r',''),
        voyageNo:vesInfo[6].replace('\r',''),
        shippingLineCode:vesInfo[7].replace('\r',''),
        shippingagentCode:vesInfo[8].replace('\r',''),
        masterName:vesInfo[9].replace('\r',''),
        portOfArrival:vesInfo[10].replace('\r',''),
        lastPortCalled:vesInfo[11].replace('\r',''),
        portcalledPrior12:vesInfo[12].replace('\r',''),
        portcalledPrior13:vesInfo[13].replace('\r',''),
        vesseltype:vesInfo[14].replace('\r',''),
        totalNoOfLines:vesInfo[15].replace('\r',''),
        briefCargoInfo:vesInfo[16].replace('\r',''),
        ETA:vesInfo[17].replace('\r',''),
        lighthousedues:vesInfo[18].replace('\r',''),
        samebottomcargo:vesInfo[19].replace('\r',''),
        shipstoresdeclaration:vesInfo[20].replace('\r',''),
        crewlist:vesInfo[21].replace('\r',''),
        passangerlist:vesInfo[22].replace('\r',''),
        crewEffectDec:vesInfo[23].replace('\r',''),
        marintimeDec:vesInfo[24].replace('\r',''),
        toc:vesInfo[25].replace('\r',''),
      }
      let cargostartindex = data.indexOf('<cargo>\r');
      let cargoendindex = data.indexOf('<END-cargo>\r');
      let cargos = data.slice(cargostartindex+1,cargoendindex);
      let cargoInfo= []
      cargos.forEach((e,i) => {
        let item = e.replace('\r','').split('\x1D');
        let cont = {
          messageType:item[0],
          customHouseCode:item[1],
          imoCode:item[2],
          vesselCode:item[3],
          voyageNo:item[4],
          igmNo:item[5],
          igmDate:item[6],
          lineNo:item[7],
          subLineNo:item[8],
          bl_no:item[9],
          bl_date:item[10],
          pol:item[11],
          pod:item[12],
          house_bl_no:item[13],
          house_bl_date:item[14],
          impoterName:item[15],
          address1:item[16],
          address2:item[17],
          address3:item[18],
          notifiedParty:item[19],
          address1_np:item[20],
          address2_np:item[21],
          address3_np:item[22],
          nature_of_cargo:item[23],
          itemtype:item[24],
          cargoMovement:item[25],
          portOfDischarge:item[26],
          nop:item[27],
          top:item[28],
          gw:item[29],
          uow:item[30],
          gv:item[31],
          uov:item[32],
          marksNumber:item[33],
          goodDescription:item[34],
          uno:item[35],
          imo:item[36],
          transitBond:item[37],
          carrierCode:item[38],
          modeOfTransport:item[39],
          mloCode:item[40]
        };
        cargoInfo.push(cont);
      });
      dataFromFile['cargos'] = cargoInfo;

      let continaerstartindex = data.indexOf('<contain>\r');
      let continaerendindex = data.indexOf('<END-contain>\r');
      let containers = data.slice(continaerstartindex+1,continaerendindex);
      let containerInfo= [];
      containers.forEach((e,i) => {
        let item = e.replace('\r','').split('\x1D');
        let container = {
          messageType:item[0],
          customHouseCode:item[1],
          imoCode:item[2],
          vesselCode:item[3],
          voyageNo:item[4],
          igmNo:item[5],
          igmDate:item[6],
          linenumber:item[7],
          subLineNumber:item[8],
          containerNo:item[9],
          cntainerSealNo:item[10],
          conatinerAgentCode:item[11],
          containerstatus:item[12],
          nop:item[13],
          container_weight:item[14],
          iso_code:item[15],
          soc_flag:item[16],
        };
        containerInfo.push(container);
      });
      dataFromFile['containers'] = containerInfo;
      dataFromFile['igmName']=filename;
      dataFromFile['igmDate'] = dataFromFile['vesinfo']?.igmdate;
      this.transactionService.saveIgm([dataFromFile]).subscribe((res) => {
        this.notification.create('success', 'IGM Imported Successfully', '');
      },error =>{
        this.notification.create(
          'error',
         error?.error?.error?.message,
          ''
        );
      })
    }
    reader.readAsBinaryString(file);
  }

  open(element?,show?) {

    const modalRef = this.modalService.open(AddIgmComponent, {
      ariaLabelledBy: 'modal-basic-title',
      backdrop: 'static',
      keyboard: false,
      centered: true,
      size: 'xl',
    })
    modalRef.componentInstance.igmId = element?.igmId??'';
    modalRef.componentInstance.isShow = show === 'show' ? true:false
    modalRef.componentInstance.getList.subscribe((res: any) => {
      if (res) {
          this.getIgmData();
      }
    })

  }
  exportToExcel(){
    this.displayedColumns1 = this.displayedColumns.map((x, i) => x+'_'+i);
    let excel=[];
    this.igmList?.map(x=>excel.push({
      "IGM No": x?.igm_no, 
      "Custom Agent Code": x?.custom_agent_code,
      "Port": x?.portName,
      "Vessel": x?.vesselName,
      "Voyage": x?.voyage,
      "Status": x?.status,
  }))

    const myworksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excel);
    const myworkbook: XLSX.WorkBook = {
      Sheets: { data: myworksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(myworkbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileName = "igm.xlsx";
    XLSX.writeFile(myworkbook, fileName);

    this.notification.create('success', 'Exported Successfully', '');
  }
  applyFilter(filterValue: string) { 
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase();

   
    this.dataSource.filterPredicate = (data, filter) => {
      return JSON.stringify(data).toLowerCase().includes(filter);
    };

    this.dataSource.filter = filterValue;
  }
  clearFilters() {
    this.filtersModel = [];
    this.filterKeys = {};
    this.getIgmData();
  }
  openPDF() {
    const prepare=[];
    this.igmList.forEach(e=>{
      let tempObj =[];
      tempObj.push(e.igm_no);
      tempObj.push(e.custom_agent_code);
      tempObj.push(e.portName);
      tempObj.push(e.vesselName);
      tempObj.push(e.voyage);
      prepare.push(tempObj);
    });
    const doc = new jsPDF('p', 'mm', [297, 210]);
    autoTable(doc,{
        head: [['IGMNo','CustomACode','Port','Vessel','Voyage']],
        body: prepare,
        didDrawCell: (data) => {
        doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'S');
         }
    });
    doc.save('igm' + '.pdf');
  }
  onDelete(deletedata, igm) {
    this.modalService
      .open(deletedata, {
       
      })
      .result.then(
        (result) => {
          this.closeResult = `Closed with: ${result}`;
          if (result === 'yes') {
            let data = `igm/${igm?.igmId}`
            this.commonService.deleteST(data).subscribe((res: any) => {
              if (res) {
                this.notification.create('success', 'Deleted Successfully', '');
                setTimeout(() => {
                  this.getIgmData()
                }, 1000);
              }
            });
          }
        },
        (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        }
      );
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
}
