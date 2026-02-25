import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { CommonService } from 'src/app/services/common/common.service';
import { ApiService } from 'src/app/admin/principal/api.service';
import * as Constant from 'src/app/shared/common-constants';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-grn',
  templateUrl: './grn.component.html',
  styleUrls: ['./grn.component.scss']
})
export class GrnComponent implements OnInit {
  isExport:boolean
  documentData:any
  batchId:any
  urlParam:any
  isShow:any
  batchDetail:any
  batchType:any;
  weighthData:any=[]
  enableButton: boolean = false;
  newgrn:FormGroup;
constructor(private route: ActivatedRoute,private commonService: CommonService,private _api : ApiService,
  private fb: FormBuilder, private modalService: NgbModal, private notification: NzNotificationService,
  private router : Router
){
  this.isExport = localStorage.getItem('isExport') === 'false' ? false : true
  this.batchId = this.route.snapshot?.params['id'];
  this.route.params?.subscribe((params) => (this.urlParam = params));
  this.isShow = this.urlParam?.access == 'show' ? true : false;
  this.getwarehouseData()
 
  this.getBatchById() 
 this.getPackageType()
  this.getUomList()
 
}
currentUrl: string;
show: boolean = false;

getPackageType(){
  let payload = this.commonService.filterList()

  if (payload) payload.query = {
    status: true,
    "typeCategory": {
      "$in": [  "packageType" ]
    }
  }

  this.commonService.getSTList("systemtype", payload)?.subscribe((res: any) => {
    this.packageTypeList = res.documents ||[];
  })

}
packageTypeList:any = []
 ngOnInit(): void {
  this.newgrn = this.fb.group({
    grnId:[''],
   wareHouse: [''],
    grn: this.fb.array([])
  });
  this.currentUrl = this.router.url?.split('?')[0].split('/')[3]
    if (this.currentUrl === 'show') {
      this.newgrn.disable();
      this.show = true
    }
 }
 displayedColumns =[
  '#', 
  'action',
 'GRN NO.',
 'GRN date',
 'Warehouse',
 
];
 dataSource = new MatTableDataSource();
 displayedColumns1 = this.displayedColumns.map((x, i) => x + '_' + i);

 getGRNControls() {
  return (this.newgrn.get('grn') as FormArray).controls;
}
getGRNControlsLength(): number {
  return (this.newgrn.get('grn') as FormArray).length;
}
isEditing: boolean = false;

editListing(id?): void {
  this.isEditing = !this.isEditing;
  
  // (this.newgrn.get('grn') as FormArray).clear();
  if(id){
    this.getGrnDetails(id?.grnId)
    this.enableButton = true;
  }else{
     this.newgrn = this.fb.group({
      grnId:[''],
     wareHouse: [''],
      grn: this.fb.array([])
    });
    this.batchDetail?.enquiryDetails?.looseCargoDetails?.cargos?.forEach((element, index) => {
      this.addGRN(element, index)
    })
   
    this.enableButton = false;
    // this.newgrn.reset();
    this.grnNo = '';
    this.grnId='';
  }
}

saveListing(): void {
  // Your save logic here 
  this.isEditing = false;
  this.getGrnDetails()
}
closeResult: string;
onDelete(deletedata, grn) {
  this.modalService
    .open(deletedata, {
      backdrop: 'static',
      keyboard: false,      
      centered: true,
      size: 'custom-modal-md',

      ariaLabelledBy: 'modal-basic-title',
    })
    .result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
        if (result === 'yes') {
          let data =  `grn/${grn?.grnId}`
          this.commonService.deleteST(data).subscribe((res: any) => {
            if (res) {
              this.notification.create('success', 'Deleted Successfully', '');
              setTimeout(() => {
               this.getGrnDetails()
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
grnId :any =''
grnNo:any=''
getGrnDetails(grnId?){
  if (!this.batchId)
    return false

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId,
    }

  this._api
    .getSTList('grn', payload)
    ?.subscribe((res: any) => {
      if(res.documents.length !== 0){
        this.documentData = res.documents;
        const curentGrn=this.documentData?.find(rr=>rr?.grnId===grnId);
        if(curentGrn){
          this.grnId = curentGrn?.grnId ?? ''
          this.grnNo = curentGrn?.grnNo ??'';
          this.newgrn.get('grnId').setValue(curentGrn?.grnId ? curentGrn?.grnId : '')
          this.newgrn.get('wareHouse').setValue(curentGrn?.warehouseId);
          (this.newgrn.get('grn') as FormArray).clear();
          this.newgrn.get('wareHouse')
          curentGrn?.items.forEach((element, index) => {
            this.addGRN1(element, index)
          });
        }
      
      }
     
    });
}
 getBatchById() {
  if (!this.batchId)
    return false

    let payload = this.commonService.filterList()
    payload.query = {
      batchId: this.batchId,
    }

  this._api
    .getSTList(Constant.BATCH_LIST, payload)
    ?.subscribe((res: any) => {
      this.batchDetail = res?.documents[0];
      if(this.batchDetail?.statusOfBatch == 'Job Cancelled' || this.batchDetail?.statusOfBatch =='Job Closed'){
        this.newgrn.disable();
        this.isShow=true
        
      }
      this.batchType = this.batchDetail?.batchType
    });
  
}
warehouseList:any=[]
getwarehouseData(){
  let payload = this.commonService.filterList()
  if(payload?.sort)payload.sort = {
    "desc" : ["updatedOn"]
 }
 if(payload?.size)payload.size = Number(1000)
 if(payload?.from)payload.from = 0;
  this.commonService.getSTList('warehouse',payload)?.subscribe((res: any) => {
    this.warehouseList = res?.documents;
    this.getGrnDetails()
  });
}
uomData:any=[]
lengthData:any=[]
getUomList() {
  let payload = this.commonService.filterList()
  if(payload) payload.query = { 'status': true } 
  this.commonService.getSTList('uom', payload)?.subscribe((data) => {
    this.uomData = data.documents;
    this.lengthData = data?.documents?.filter(lengthtype=>lengthtype?.uomCategory==='Length');
    this.weighthData = data?.documents?.filter(lengthtype => lengthtype?.uomCategory === 'Weight');
  });
}
binSelectionData:any=[]
setBinSelection(e){
  this.binSelectionData = this.warehouseList.filter(x=>x.warehouseId === e)[0]?.bins
  
}
totalVolume(event, index) {
  const grnArray = this.newgrn.get('grn') as FormArray;
  const grnValue = grnArray.at(index) as FormGroup;
  const dimensionUnit = grnValue?.get('unit')?.value?.toLowerCase();
  

  let units = 0;

  switch (dimensionUnit) {
    case "inches":
      units = ((grnValue?.get('height')?.value ?? 0) * (grnValue?.get('width')?.value ?? 0) * (grnValue?.get('length')?.value ?? 0) ) / 61023.8;
      break;
  
    case "cm":
      units = ((grnValue?.get('height')?.value ?? 0) * (grnValue?.get('width')?.value ?? 0) * (grnValue?.get('length')?.value ?? 0)) / 1000000;
      break;
    case "meter":
      units = ((grnValue?.get('height')?.value ?? 0) * (grnValue?.get('width')?.value ?? 0) * (grnValue?.get('length')?.value ?? 0));
      break;
  
      case "mm":
      units = ((grnValue?.get('height')?.value ?? 0) * (grnValue?.get('width')?.value ?? 0) * (grnValue?.get('length')?.value ?? 0)) / 1000000000;
      break;
    case "ft":
      units = ((grnValue?.get('height')?.value ?? 0) * (grnValue?.get('width')?.value ?? 0) * (grnValue?.get('length')?.value ?? 0)) / 35.315;
      break;
    default:
      units = 0;
  }

  
  const roundedUnits = parseFloat(units.toFixed(2)); // Ensure two decimal places and convert to number
  const totalUnits = parseFloat((roundedUnits * (grnValue?.get('quantity')?.value ?? 0)).toFixed(2)); // Multiply and round to two decimals
  grnValue.controls['volume'].setValue(totalUnits); // Set the value
}

addGRN1(item?: any, index?: number): void {
  const grnGroup = this.fb.group({
    packageType: [item?.packageType || '', Validators.required],
    length: [item?.length || '', [ Validators.min(0)]],
    width: [item?. width || '', [ Validators.min(0)]],
    height: [item?.height || '', [ Validators.min(0)]],
    unit: [item?.unit || ''],
    // uniteName:[item?.selectedw || '' ],
    quantity: [item?.quantity || '', [Validators.required, Validators.min(0)]],
    weight: [item?.weight || '', [Validators.required, Validators.min(0)]],
    volume: [item?.volume || ''],
    ref: [item?.ref || ''],
    description: [item?.description || ''],
    lclShipper: [item?.lclShipper || ''],
    lclShipperName: [item?.lclShipperName || ''],
    binSelection: [item?.binSelection || '' ]
  });
  
  (this.newgrn.get('grn') as FormArray).push(grnGroup);
}

addGRN(item?: any, index?: number): void {
  const grnGroup = this.fb.group({
    packageType: [item?.pkgname || '', Validators.required],
    length: [item?.lengthp || '', [ Validators.min(0)]],
    width: [item?.Weightp || '', [ Validators.min(0)]],
    height: [item?.heightselected || '', [ Validators.min(0)]],
    unit: [item?.selectedh || ''],
    // uniteName:[item?.selectedw || '' ],
    quantity: [item?.units || '', [Validators.required, Validators.min(0)]],
    weight: [item?.Weightselected || '', [Validators.required, Validators.min(0)]],
    volume: [item?.volumeselect || ''],
    ref: [item?.ref || ''],
    description: [item?.description || ''],
    lclShipper: [item?.lclShipper || ''],
    lclShipperName: [item?.lclShipperName || ''],
    binSelection: [item?.binSelection || '' ]
  });
  
  (this.newgrn.get('grn') as FormArray).push(grnGroup);
}
deleteRow(content1, data: any, index) {
  this.modalService.open(content1, {
    backdrop: 'static',
    keyboard: false,
    centered: true,
    size: 'custom-modal-md',
    ariaLabelledBy: 'modal-basic-title'
  }).result.then((result) => {

    if (result === 'yes') {
      
   
        this.notification.create(
          'success',
          'Deleted Successfully',
          ''
        );
    
      (this.newgrn.get('grn') as FormArray).removeAt(index);
      // const itemData = this.costItemList?.filter(
      //   (item) => item !== data
      // );
      // this.costItemList = itemData;
      // this.SaveCharge.emit(this.costItemList);
    }
  });



}
// onClose() {
//   this.router.navigate(['/batch/list']);
// }
saveGRN(){
  this.newgrn.markAllAsTouched();

  if (this.newgrn.invalid) {
    this.notification.create(
      'error',
      'Validation Error',
      'Please fill in all required fields correctly.', 
    );
    return;  // Stop the execution if form is invalid
  }
  let dataUpdate = [];
  let dataInsert = [];
  let warehouseName = this.warehouseList.filter(x=> x?.warehouseId === this.newgrn.value?.wareHouse)[0]?.wareHouseName || ''
  
  this.getGRNControls().forEach(element => {

    // if (!( element?.value.isInvoiceCreated || element?.value.isPrincipleCreated)) { 
     
        let charge = {
         packageType: element.value.packageType,
         length: element.value.length ,
         width:element.value.width ,
         height: element.value.height ,
         unit: element.value.unit,
         uniteName: element.value.uniteName,
         quantity:element.value.quantity ,
         weight:element.value.weight ,
         volume:element.value.volume ,
         lclShipper: element.value.lclShipper ,
         lclShipperName: element.value.lclShipperName ,
         ref:element.value.ref ,
         description:element.value.description ,
         binSelection:element.value.binSelection || null,
        }
        dataInsert.push(charge)
     
    // }
  

  });

  let payload = {
    grnId: this.grnId,
    batchId:this.route.snapshot.params['id'],
    warehouseName:warehouseName || '',
    warehouseId:this.newgrn.value?.wareHouse ||"",
    items:dataInsert
  }
  if (payload.grnId === '' || payload.grnId === null) {
    this.commonService
      .addToST('grn', payload)
      ?.subscribe((res:any)=>{
        this.grnNo = res.grnNo
       this.getGrnDetails();
       this.saveListing();
      });
      this.notification.create(
        'success',
        'Saved Successfully',
        '', 
      );
  }
  else {
    this.commonService
      .UpdateToST(`grn/${this.grnId}`, payload)
      ?.subscribe((res:any)=>{
        this.grnNo = res.grnNo
        this.grnId = res.grnId
        this.getGrnDetails();
        this.saveListing();
        this.notification.create(
          'success',
          'Update Successfully',
          '', 
        );
      });
  } this.enableButton = true
    
    

}

downloadPackage(){
let payload = {
    grnId : this.grnId
  }
  this.commonService
      .addToST('downloadQr', payload)
      ?.subscribe((blob:any)=>{
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EDI-${this.grnNo}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      });
}
Documentpdf:any;
printData(doc : any) {
  let reportpayload1 : any;

  if (doc ){
    reportpayload1 = { "parameters": { "grnId": doc.grnId } }
  } else {
    reportpayload1 = { "parameters": { "grnId": this.grnId } }
  }
  
  this.commonService.pushreports(reportpayload1, 'goodMaterial').subscribe({
    next: (res: any) => {  
    const blob = new Blob([res], { type: 'application/pdf' });
    let temp = URL.createObjectURL(blob);
    this.Documentpdf = temp;
    const pdfWindow = window.open(temp);
    pdfWindow.print();
    }
  })
}
printPackageList(doc: any): void { 
  let reportPayload: any;

  // Determine payload based on the `doc` parameter
  if (doc) {
    reportPayload = { "grnId": doc.grnId };
  } else {
    reportPayload = { "grnId": this.grnId };
  }

  // Download the package slip
  this.commonService.downloadPackageSlip(reportPayload).subscribe({
    next: (res: Blob) => {  
      const blob = new Blob([res], { type: 'application/pdf' });
      const tempUrl = URL.createObjectURL(blob);

      // Open the PDF in a new window or tab
      const pdfWindow = window.open(tempUrl);
      if (pdfWindow) {
        pdfWindow.onload = () => {
          pdfWindow.print(); // Trigger the print dialog
          URL.revokeObjectURL(tempUrl); // Clean up the URL
        };
      } else {
        console.error("Failed to open the PDF window. Check pop-up settings.");
      }
    },
    error: (err) => {
      console.error("Error downloading the package slip:", err);
    }
  });
}
}
